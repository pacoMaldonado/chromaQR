import QRCodeStyling, { type Options as QRCodeStylingOptions } from 'qr-code-styling';
import type { ColorOrGradient, QRStyleConfig } from '../../types/qr';

const PREVIEW_SIZE_PX = 240;

function mapColorOrGradient(cg: ColorOrGradient): {
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    rotation: number;
    colorStops: { offset: number; color: string }[];
  };
} {
  if (cg.gradient.enabled) {
    return {
      gradient: {
        type: cg.gradient.type,
        rotation: (cg.gradient.rotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: cg.gradient.colorStop1 },
          { offset: 1, color: cg.gradient.colorStop2 },
        ],
      },
    };
  }
  return {
    color: cg.color,
    gradient: undefined,
  };
}

export function buildQrStylingOptions(
  rawPayload: string,
  style: QRStyleConfig,
  renderSize: number,
  renderType: 'svg' | 'canvas' = 'svg'
): QRCodeStylingOptions {
  const scaleRatio = renderSize / style.technical.size;
  const scaledMargin = Math.max(
    0,
    Math.round(style.technical.margin * (renderSize === PREVIEW_SIZE_PX ? 0.5 : scaleRatio))
  );

  const dotsColoring = mapColorOrGradient(style.dots.coloring);
  const cornersSquareColoring = style.cornersSquare.customColor
    ? mapColorOrGradient(style.cornersSquare.coloring)
    : dotsColoring;
  const cornersDotColoring = style.cornersDot.customColor
    ? mapColorOrGradient(style.cornersDot.coloring)
    : dotsColoring;

  const backgroundOptions = style.background.transparent
    ? { color: 'transparent', gradient: undefined }
    : mapColorOrGradient(style.background.coloring);

  // Safe payload fallback if user input exceeds QR v40 capacity
  const safeData =
    new TextEncoder().encode(rawPayload).length > 2953
      ? rawPayload.slice(0, 1200)
      : rawPayload || 'https://chromaqr.app';

  return {
    width: renderSize,
    height: renderSize,
    type: renderType,
    data: safeData,
    margin: scaledMargin,
    image: style.logo.dataUrl ?? undefined,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: style.technical.errorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: style.logo.hideBackgroundDots,
      imageSize: style.logo.size,
      margin: style.logo.margin,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      type: style.dots.type,
      ...dotsColoring,
    },
    cornersSquareOptions: {
      type: style.cornersSquare.type,
      ...cornersSquareColoring,
    },
    cornersDotOptions: {
      type: style.cornersDot.type,
      ...cornersDotColoring,
    },
    backgroundOptions,
  };
}

class LiveQrRenderer {
  private instance: QRCodeStyling | null = null;
  private rafId: number | null = null;
  private mountEl: HTMLElement | null = null;

  public mount(container: HTMLElement, initialData: string, initialStyle: QRStyleConfig): void {
    this.mountEl = container;
    container.innerHTML = '';
    const options = buildQrStylingOptions(initialData, initialStyle, PREVIEW_SIZE_PX, 'svg');
    this.instance = new QRCodeStyling(options);
    this.instance.append(container);
  }

  public scheduleUpdate(rawPayload: string, style: QRStyleConfig): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (!this.instance && this.mountEl) {
        this.mount(this.mountEl, rawPayload, style);
        return;
      }
      if (this.instance) {
        const nextOptions = buildQrStylingOptions(rawPayload, style, PREVIEW_SIZE_PX, 'svg');
        this.instance.update(nextOptions);
      }
    });
  }

  public createExportInstance(
    rawPayload: string,
    style: QRStyleConfig,
    renderType: 'svg' | 'canvas' = 'canvas'
  ): QRCodeStyling {
    const options = buildQrStylingOptions(
      rawPayload,
      style,
      style.technical.size,
      renderType
    );
    return new QRCodeStyling(options);
  }
}

export const liveQrRenderer = new LiveQrRenderer();
