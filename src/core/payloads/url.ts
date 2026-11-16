import type { UrlPayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'msclkid',
  'twclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  '_ga',
  '_gl',
]);

export function buildUrlPayload(data: UrlPayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rawInput = data.url.trim();

  if (!rawInput) {
    return {
      raw: 'https://chromaqr.app',
      isValid: false,
      byteLength: 0,
      charLength: 0,
      errors: ['Ingresa una dirección URL válida (ej. https://ejemplo.com).'],
      warnings: [],
    };
  }

  let candidate = rawInput;
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate)) {
    candidate = `https://${candidate}`;
    warnings.push('Se añadió automáticamente el protocolo https://.');
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      errors.push('El protocolo debe ser https:// o http://.');
    } else if (parsed.protocol === 'http:') {
      warnings.push('Se recomienda usar HTTPS para evitar bloqueos en navegadores móviles.');
    }

    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      errors.push('El dominio de la URL parece incompleto.');
    }

    if (data.cleanUtm) {
      let removedCount = 0;
      for (const key of Array.from(parsed.searchParams.keys())) {
        if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
          parsed.searchParams.delete(key);
          removedCount++;
        }
      }
      if (removedCount > 0) {
        warnings.push(`Se limpiaron ${removedCount} parámetro(s) de rastreo UTM/Click ID.`);
      }
    }

    const finalUrl = parsed.toString();
    const byteLength = new TextEncoder().encode(finalUrl).length;

    return {
      raw: finalUrl,
      isValid: errors.length === 0,
      byteLength,
      charLength: finalUrl.length,
      errors,
      warnings,
    };
  } catch {
    return {
      raw: rawInput,
      isValid: false,
      byteLength: new TextEncoder().encode(rawInput).length,
      charLength: rawInput.length,
      errors: ['Formato de URL inválido. Verifica que el dominio sea correcto.'],
      warnings,
    };
  }
}
