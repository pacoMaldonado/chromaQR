import type { CalendarPayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

function formatICalDate(dateStr: string, allDay: boolean): string {
  if (!dateStr) return '20261116T100000';
  const cleaned = dateStr.replace(/[-:]/g, '');
  if (allDay) {
    return cleaned.slice(0, 8);
  }
  if (cleaned.length === 13) {
    return `${cleaned}00`;
  }
  return cleaned.slice(0, 15);
}

function escapeICalText(val: string): string {
  return val
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .trim();
}

export function buildCalendarPayload(data: CalendarPayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const title = data.title.trim();
  if (!title) {
    errors.push('El título del evento es obligatorio.');
  }

  if (!data.startDate) {
    errors.push('La fecha de inicio del evento es obligatoria.');
  }

  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.push('La fecha/hora de finalización no puede ser anterior al inicio.');
  }

  const dtStart = formatICalDate(data.startDate, data.allDay);
  const dtEnd = formatICalDate(data.endDate || data.startDate, data.allDay);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChromaQR//Desktop Studio//ES',
    'BEGIN:VEVENT',
    `SUMMARY:${escapeICalText(title || 'Evento ChromaQR')}`,
    data.allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    data.allDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`,
  ];

  if (data.location.trim()) {
    lines.push(`LOCATION:${escapeICalText(data.location)}`);
  }
  if (data.description.trim()) {
    lines.push(`DESCRIPTION:${escapeICalText(data.description)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

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
