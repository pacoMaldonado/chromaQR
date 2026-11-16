import type {
  ColorOrGradient,
  ErrorCorrectionLevel,
  QRStyleConfig,
  ScannabilityLevel,
  ScannabilityReport,
} from '../../types/qr';

const MAX_BYTES_BY_ECC: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r: r || 0, g: g || 0, b: b || 0 };
  }
  const num = parseInt(clean.slice(0, 6), 16);
  if (Number.isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function calculateContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getEffectiveLuminanceRange(coloring: ColorOrGradient): {
  minLum: number;
  maxLum: number;
  avgLum: number;
} {
  if (!coloring.gradient.enabled) {
    const lum = relativeLuminance(coloring.color);
    return { minLum: lum, maxLum: lum, avgLum: lum };
  }
  const l1 = relativeLuminance(coloring.gradient.colorStop1);
  const l2 = relativeLuminance(coloring.gradient.colorStop2);
  return {
    minLum: Math.min(l1, l2),
    maxLum: Math.max(l1, l2),
    avgLum: (l1 + l2) / 2,
  };
}

export function evaluateScannability(
  style: QRStyleConfig,
  byteLength: number
): ScannabilityReport {
  const issues: string[] = [];
  const ecc = style.technical.errorCorrectionLevel;
  const maxCapacityBytes = MAX_BYTES_BY_ECC[ecc];

  // 1. Evaluate Foreground vs Background Luminance
  const fg = getEffectiveLuminanceRange(style.dots.coloring);

  // If background is transparent, evaluate against white print/screen surface (#FFFFFF)
  const bg = style.background.transparent
    ? { minLum: 1.0, maxLum: 1.0, avgLum: 1.0 }
    : getEffectiveLuminanceRange(style.background.coloring);

  // Conservative contrast ratio (worst-case stop between foreground and background)
  const c1 = calculateContrastRatio(fg.maxLum, bg.minLum);
  const c2 = calculateContrastRatio(fg.minLum, bg.maxLum);
  const worstContrast = Math.min(c1, c2);
  const contrastRatio = Math.round(worstContrast * 10) / 10;

  const isInverted = !style.background.transparent && fg.avgLum > bg.avgLum;

  if (contrastRatio < 2.5) {
    issues.push(
      `Contraste crítico (${contrastRatio}:1). Los lectores QR requieren al menos 3.5:1 (ideal > 7:1).`
    );
  } else if (contrastRatio < 4.5) {
    issues.push(
      `Contraste moderado-bajo (${contrastRatio}:1). Puede dificultar el escaneo en poca luz.`
    );
  }

  if (isInverted) {
    issues.push(
      'Contraste invertido (módulos claros sobre fondo oscuro). Algunos escáneres antiguos pueden no leerlo.'
    );
  }

  // 2. Check custom eye colors contrast if enabled
  if (style.cornersSquare.customColor) {
    const eyeLum = relativeLuminance(style.cornersSquare.coloring.color);
    const eyeContrast = calculateContrastRatio(eyeLum, bg.avgLum);
    if (eyeContrast < 3.0) {
      issues.push('Las esquinas exteriores tienen muy bajo contraste respecto al fondo.');
    }
  }

  // 3. Evaluate Central Logo vs ECC Level
  if (style.logo.dataUrl) {
    const logoSize = style.logo.size;
    if (logoSize > 0.32 && ecc !== 'H') {
      issues.push(
        `El logo ocupa ${Math.round(logoSize * 100)}% del área. Cambia el nivel ECC a Alto (H) o reduce el logo.`
      );
    } else if (logoSize > 0.24 && (ecc === 'L' || ecc === 'M')) {
      issues.push(
        `Con logo del ${Math.round(logoSize * 100)}%, se recomienda nivel ECC Cuartil (Q) o Alto (H).`
      );
    }
  }

  // 4. Evaluate Quiet Zone (margin)
  if (style.technical.margin < 6) {
    issues.push(
      'El margen silencioso (Quiet Zone) es muy estrecho (< 6px). Puede afectar lectores ópticos.'
    );
  }

  // 5. Evaluate Payload Byte Density vs ECC Capacity
  if (byteLength > maxCapacityBytes) {
    issues.push(
      `El payload (${byteLength} B) supera la capacidad del nivel ECC ${ecc} (${maxCapacityBytes} B). Reduce datos o baja el ECC.`
    );
  } else if (byteLength > 600 && style.dots.type === 'dots') {
    issues.push(
      'Alta densidad de datos con módulos circulares pequeños: se sugiere estilo Cuadrado o Redondeado.'
    );
  }

  // Determine overall ScannabilityLevel
  let level: ScannabilityLevel = 'excellent';
  let summary = 'Excelente contraste y lectura';

  if (contrastRatio < 2.5 || byteLength > maxCapacityBytes) {
    level = 'critical';
    summary =
      byteLength > maxCapacityBytes
        ? 'Excede capacidad QR para este ECC'
        : 'Bajo contraste crítico — Difícil lectura';
  } else if (
    contrastRatio < 4.5 ||
    isInverted ||
    (style.logo.dataUrl && style.logo.size > 0.3 && ecc !== 'H')
  ) {
    level = 'warning';
    summary = isInverted
      ? 'Advertencia: Contraste invertido'
      : 'Advertencia: Contraste o logo al límite';
  } else if (issues.length > 0 || contrastRatio < 7.0) {
    level = 'good';
    summary = 'Buena escaneabilidad';
  }

  return {
    level,
    contrastRatio,
    isInverted,
    byteLength,
    maxCapacityBytes,
    issues,
    summary,
  };
}
