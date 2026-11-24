import { Image as TauriImage } from '@tauri-apps/api/image';
import { writeImage } from '@tauri-apps/plugin-clipboard-manager';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { canShare, share } from '@vnidrop/tauri-plugin-share';
import { jsPDF } from 'jspdf';
import type { PayloadType, QRStyleConfig } from '../../types/qr';
import { showToast } from '../ui/toast';
import { liveQrRenderer } from './renderer';

export type ExportFormat = 'png' | 'svg' | 'webp' | 'pdf';

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function isMobilePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function blobToUint8Array(raw: unknown): Promise<Uint8Array> {
  if (!raw) {
    throw new Error('No se pudo generar el buffer del código QR.');
  }
  if (raw instanceof Blob) {
    const ab = await raw.arrayBuffer();
    return new Uint8Array(ab);
  }
  if (raw instanceof ArrayBuffer) {
    return new Uint8Array(raw);
  }
  if (ArrayBuffer.isView(raw)) {
    return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
  }
  throw new Error('Formato de datos QR desconocido.');
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error convirtiendo Blob a DataURL'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

async function generatePdfBytes(
  rawPayload: string,
  style: QRStyleConfig
): Promise<Uint8Array> {
  const qrInstance = liveQrRenderer.createExportInstance(rawPayload, style, 'canvas');
  const pngRaw = await qrInstance.getRawData('png');
  if (!pngRaw) {
    throw new Error('No se pudo renderizar la matriz QR para el documento PDF.');
  }

  const pngBytes = await blobToUint8Array(pngRaw);
  const pngBlob = new Blob([pngBytes.buffer as ArrayBuffer], { type: 'image/png' });
  const pngDataUrl = await blobToDataUrl(pngBlob);

  // Create square vector-grade PDF artboard matching configured output size (min 512pt)
  const artboardPt = Math.max(512, Math.min(1440, style.technical.size));
  const paddingPt = 36;
  const pageWidth = artboardPt + paddingPt * 2;
  const pageHeight = artboardPt + paddingPt * 2 + 24;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pageWidth, pageHeight],
    compress: true,
  });

  if (!style.background.transparent) {
    pdf.setFillColor(style.background.coloring.color);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  }

  pdf.addImage(pngDataUrl, 'PNG', paddingPt, paddingPt, artboardPt, artboardPt);

  // Subtle technical footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 130);
  pdf.text(
    `ChromaQR Studio · ${style.technical.size}x${style.technical.size}px · ECC ${style.technical.errorCorrectionLevel}`,
    pageWidth / 2,
    pageHeight - 14,
    { align: 'center' }
  );

  const ab = pdf.output('arraybuffer');
  return new Uint8Array(ab);
}

export async function copyQrToClipboard(
  rawPayload: string,
  style: QRStyleConfig
): Promise<void> {
  try {
    const qrInstance = liveQrRenderer.createExportInstance(rawPayload, style, 'canvas');
    const raw = await qrInstance.getRawData('png');
    const bytes = await blobToUint8Array(raw);

    if (isTauriRuntime()) {
      const tauriImg = await TauriImage.fromBytes(bytes);
      await writeImage(tauriImg);
      showToast('Imagen QR copiada al portapapeles nativo', 'success');
      return;
    }

    // Browser Clipboard API fallback
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'image/png' });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      showToast('Imagen QR copiada al portapapeles', 'success');
      return;
    }

    throw new Error('Clipboard API no disponible en este entorno');
  } catch (err) {
    console.error('Copy QR failed:', err);
    showToast('No se pudo copiar la imagen al portapapeles', 'warning');
  }
}

export async function shareQrImage(
  activeTab: PayloadType,
  rawPayload: string,
  style: QRStyleConfig
): Promise<void> {
  try {
    const qrInstance = liveQrRenderer.createExportInstance(rawPayload, style, 'canvas');
    const raw = await qrInstance.getRawData('png');
    const bytes = await blobToUint8Array(raw);
    const filename = `chromaqr-${activeTab}-${style.technical.size}px.png`;
    const file = new File([bytes.buffer as ArrayBuffer], filename, { type: 'image/png' });

    if (isTauriRuntime()) {
      const supported = await canShare({ files: [file] });
      if (supported) {
        await share({
          title: 'ChromaQR',
          text: 'Código QR generado con ChromaQR',
          files: [file],
        });
        return;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      const shareData: ShareData = {
        title: 'ChromaQR',
        text: 'Código QR generado con ChromaQR',
        files: [file],
      };
      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    }

    showToast('Compartir no está disponible en este dispositivo', 'warning');
  } catch (err) {
    // Ignore user cancellation on native share sheet
    if (err instanceof Error && /cancel|abort/i.test(err.message)) {
      return;
    }
    console.error('Share QR failed:', err);
    showToast('No se pudo compartir la imagen QR', 'warning');
  }
}

export async function exportQrToFile(
  format: ExportFormat,
  activeTab: PayloadType,
  rawPayload: string,
  style: QRStyleConfig
): Promise<void> {
  try {
    let bytes: Uint8Array;
    let mimeType = 'image/png';
    let filterName = 'PNG Image';

    if (format === 'svg') {
      const qrInstance = liveQrRenderer.createExportInstance(rawPayload, style, 'svg');
      const raw = await qrInstance.getRawData('svg');
      bytes = await blobToUint8Array(raw);
      mimeType = 'image/svg+xml';
      filterName = 'SVG Vector Graphic';
    } else if (format === 'webp') {
      const qrInstance = liveQrRenderer.createExportInstance(rawPayload, style, 'canvas');
      const raw = await qrInstance.getRawData('webp');
      bytes = await blobToUint8Array(raw);
      mimeType = 'image/webp';
      filterName = 'WEBP Image';
    } else if (format === 'pdf') {
      bytes = await generatePdfBytes(rawPayload, style);
      mimeType = 'application/pdf';
      filterName = 'PDF Document';
    } else {
      const qrInstance = liveQrRenderer.createExportInstance(rawPayload, style, 'canvas');
      const raw = await qrInstance.getRawData('png');
      bytes = await blobToUint8Array(raw);
      mimeType = 'image/png';
      filterName = 'PNG Image';
    }

    const defaultFilename = `chromaqr-${activeTab}-${style.technical.size}px.${format}`;

    if (isTauriRuntime()) {
      try {
        const filePath = await save({
          title: `Exportar Código QR (${format.toUpperCase()})`,
          defaultPath: defaultFilename,
          filters: [{ name: filterName, extensions: [format] }],
        });

        if (!filePath) {
          return; // User cancelled dialog
        }

        // Write exclusively to the user-authorized path from the native Save dialog
        await writeFile(filePath, bytes);
        showToast(`Exportado como ${format.toUpperCase()} correctamente`, 'success');
        return;
      } catch (nativeErr) {
        // On Android, if SAF save fails on a specific device/ROM, fall back to native Share Sheet
        if (isMobilePlatform()) {
          console.warn('Mobile save dialog failed, falling back to native share:', nativeErr);
          const file = new File([bytes.buffer as ArrayBuffer], defaultFilename, { type: mimeType });
          if (await canShare({ files: [file] })) {
            await share({
              title: `ChromaQR (${format.toUpperCase()})`,
              files: [file],
            });
            return;
          }
        }
        throw nativeErr;
      }
    }

    // Browser download fallback for dev mode
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Descargado ${defaultFilename}`, 'success');
  } catch (err) {
    console.error(`Export ${format} error:`, err);
    showToast(`Error al exportar en formato ${format.toUpperCase()}`, 'warning');
  }
}
