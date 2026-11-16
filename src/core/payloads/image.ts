import type { ImagePayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

export const QR_MAX_BINARY_BYTES = 2953;

export function buildImagePayload(data: ImagePayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.mode === 'remote_url') {
    const url = data.remoteUrl.trim();
    if (!url) {
      errors.push('Ingresa el enlace directo a la imagen alojada en web.');
    } else if (!/^https?:\/\/.+/i.test(url)) {
      errors.push('El enlace de la imagen debe comenzar con https:// o http://.');
    }

    const raw = url || 'https://chromaqr.app/sample.png';
    const byteLength = new TextEncoder().encode(raw).length;

    return {
      raw,
      isValid: errors.length === 0,
      byteLength,
      charLength: raw.length,
      errors,
      warnings,
    };
  }

  // Modo 1: Offline Data / Base64
  const uri = data.dataUri.trim();
  if (!uri) {
    return {
      raw: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      isValid: false,
      byteLength: 0,
      charLength: 0,
      errors: [
        'Selecciona o arrastra una imagen local para codificarla en Base64 dentro del QR.',
      ],
      warnings: [],
    };
  }

  const byteLength = new TextEncoder().encode(uri).length;

  if (byteLength > QR_MAX_BINARY_BYTES) {
    errors.push(
      `La imagen en Base64 ocupa ${byteLength} bytes y supera el límite físico de un código QR (${QR_MAX_BINARY_BYTES} bytes en versión 40-L). Activa la compresión extrema o reduce dimensiones.`
    );
  } else if (byteLength > 1800) {
    warnings.push(
      `Uso de capacidad alto (${byteLength} / ${QR_MAX_BINARY_BYTES} bytes). Se recomienda usar Nivel ECC Bajo (L) para permitir la matriz QR.`
    );
  } else {
    warnings.push(
      `Imagen offline embebida (${byteLength} / ${QR_MAX_BINARY_BYTES} bytes). Escaneable sin conexión a internet.`
    );
  }

  return {
    raw: uri,
    isValid: errors.length === 0,
    byteLength,
    charLength: uri.length,
    errors,
    warnings,
  };
}

/**
 * Comprime y redimensiona una imagen en cliente usando <canvas> para ajustarse
 * al límite técnico de 2,953 bytes de un código QR v40-L.
 */
export async function compressImageToQrDataUri(
  file: File,
  maxDim: number = 48,
  quality: number = 0.65
): Promise<{ dataUri: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no soportado.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(8, Math.round(img.width * scale));
        const height = Math.max(8, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Contexto 2D no disponible.'));
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let dataUri = canvas.toDataURL('image/webp', quality);
        if (!dataUri.startsWith('data:image/webp')) {
          dataUri = canvas.toDataURL('image/jpeg', quality);
        }
        const bytes = new TextEncoder().encode(dataUri).length;
        resolve({ dataUri, bytes });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
