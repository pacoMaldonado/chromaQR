import type { EmailPayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

export function buildEmailPayload(data: EmailPayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const to = data.to.trim();
  if (!to) {
    errors.push('El correo destinatario es obligatorio.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    errors.push('El formato del correo electrónico destinatario es inválido.');
  }

  const params: string[] = [];
  if (data.subject.trim()) {
    params.push(`subject=${encodeURIComponent(data.subject.trim())}`);
  }
  if (data.body.trim()) {
    params.push(`body=${encodeURIComponent(data.body.trim())}`);
  }

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  const raw = `mailto:${to || 'hola@chromaqr.app'}${query}`;
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
