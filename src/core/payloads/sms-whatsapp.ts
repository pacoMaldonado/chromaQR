import type { SmsWhatsappPayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

export function buildSmsWhatsappPayload(data: SmsWhatsappPayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const cleanCc = data.countryCode.replace(/[^\d]/g, '');
  const cleanPhone = data.phone.replace(/[^\d]/g, '');

  if (!cleanPhone || cleanPhone.length < 6) {
    errors.push('Ingresa un número telefónico válido (mínimo 6 dígitos).');
  }

  const fullDigits = `${cleanCc}${cleanPhone}`;
  let raw = '';

  if (data.mode === 'whatsapp') {
    const query = data.message.trim()
      ? `?text=${encodeURIComponent(data.message.trim())}`
      : '';
    raw = `https://wa.me/${fullDigits || '5215500000000'}${query}`;
  } else {
    const prefix = cleanCc ? `+${fullDigits}` : cleanPhone || '+5215500000000';
    raw = `SMSTO:${prefix}:${data.message.trim()}`;
  }

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
