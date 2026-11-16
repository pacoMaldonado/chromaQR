import type { VCardPayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

function escapeVCard(val: string): string {
  return val
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .trim();
}

export function buildVCardPayload(data: VCardPayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  if (!fullName) {
    errors.push('El nombre o apellido del contacto es obligatorio en vCard.');
  }

  if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push('El correo electrónico del contacto no tiene un formato válido.');
  }

  if (!data.phoneMobile.trim() && !data.phoneWork.trim() && !data.email.trim()) {
    warnings.push('Se recomienda incluir al menos un teléfono o correo electrónico.');
  }

  const lines: string[] = [
    'BEGIN:VCARD',
    `VERSION:${data.version}`,
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
    `FN:${escapeVCard(fullName || 'Contacto')}`,
  ];

  if (data.organization.trim()) {
    lines.push(`ORG:${escapeVCard(data.organization)}`);
  }
  if (data.title.trim()) {
    lines.push(`TITLE:${escapeVCard(data.title)}`);
  }
  if (data.phoneMobile.trim()) {
    lines.push(
      data.version === '4.0'
        ? `TEL;TYPE=cell,voice;VALUE=uri:tel:${data.phoneMobile.trim()}`
        : `TEL;TYPE=CELL,VOICE:${data.phoneMobile.trim()}`
    );
  }
  if (data.phoneWork.trim()) {
    lines.push(
      data.version === '4.0'
        ? `TEL;TYPE=work,voice;VALUE=uri:tel:${data.phoneWork.trim()}`
        : `TEL;TYPE=WORK,VOICE:${data.phoneWork.trim()}`
    );
  }
  if (data.email.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.email.trim()}`);
  }
  if (data.website.trim()) {
    lines.push(`URL:${data.website.trim()}`);
  }

  const hasAddress = [data.street, data.city, data.state, data.zip, data.country].some(
    (part) => part.trim().length > 0
  );
  if (hasAddress) {
    lines.push(
      `ADR;TYPE=WORK:;;${escapeVCard(data.street)};${escapeVCard(data.city)};${escapeVCard(
        data.state
      )};${escapeVCard(data.zip)};${escapeVCard(data.country)}`
    );
  }

  lines.push('END:VCARD');

  const raw = lines.join('\r\n');
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
