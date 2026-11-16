import type { TextPayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

export function buildTextPayload(data: TextPayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const text = data.text;

  if (!text || text.trim().length === 0) {
    return {
      raw: 'ChromaQR',
      isValid: false,
      byteLength: 0,
      charLength: 0,
      errors: ['El campo de texto no puede estar vacío.'],
      warnings: [],
    };
  }

  const byteLength = new TextEncoder().encode(text).length;
  const charLength = Array.from(text).length;

  if (byteLength > 2953) {
    errors.push(
      `El texto excede la capacidad física máxima de un código QR (${byteLength} / 2953 bytes).`
    );
  } else if (byteLength > 800) {
    warnings.push(
      'Alta densidad binaria (> 800 bytes): los módulos serán muy pequeños. Usa un tamaño de impresión mayor.'
    );
  } else if (byteLength > 350) {
    warnings.push(
      'Densidad media-alta (> 350 bytes): se recomienda nivel de corrección de errores L o M.'
    );
  }

  return {
    raw: text,
    isValid: errors.length === 0,
    byteLength,
    charLength,
    errors,
    warnings,
  };
}
