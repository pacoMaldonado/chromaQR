import type { PayloadDataMap, PayloadType } from '../../types/qr';
import { buildUrlPayload } from './url';
import { buildTextPayload } from './text';
import { buildVCardPayload } from './vcard';
import { buildWifiPayload } from './wifi';
import { buildEmailPayload } from './email';
import { buildSmsWhatsappPayload } from './sms-whatsapp';
import { buildGeoPayload } from './geo';
import { buildCalendarPayload } from './calendar';
import { buildImagePayload } from './image';

export interface PayloadBuildResult {
  raw: string;
  isValid: boolean;
  byteLength: number;
  charLength: number;
  errors: string[];
  warnings: string[];
}

export const PAYLOAD_META: Record<
  PayloadType,
  { title: string; subtitle: string }
> = {
  url: {
    title: 'Datos del Payload · URL / Sitio Web',
    subtitle: 'Enlace web con validación de protocolo HTTPS y limpieza de parámetros UTM',
  },
  text: {
    title: 'Datos del Payload · Texto Plano / Notas',
    subtitle: 'Soporte UTF-8 completo con contador de caracteres y control de densidad binaria',
  },
  vcard: {
    title: 'Datos del Payload · Contacto vCard (3.0 / 4.0)',
    subtitle: 'Tarjeta de contacto digital estándar con teléfono, organización, correo y dirección',
  },
  wifi: {
    title: 'Datos del Payload · Red Wi-Fi',
    subtitle: 'Conexión instantánea por cámara con SSID, encriptación WPA/WEP y red oculta',
  },
  email: {
    title: 'Datos del Payload · Correo Electrónico (mailto:)',
    subtitle: 'Destinatario, asunto predefinido y cuerpo del mensaje codificados según RFC 6068',
  },
  sms: {
    title: 'Datos del Payload · SMS / WhatsApp',
    subtitle: 'Número telefónico con código internacional y mensaje prellenado directo',
  },
  geo: {
    title: 'Datos del Payload · Ubicación Geográfica (geo:)',
    subtitle: 'Coordenadas GPS de latitud/longitud o enlace directo a mapas interactivos',
  },
  calendar: {
    title: 'Datos del Payload · Evento de Calendario (iCal / VEVENT)',
    subtitle: 'Evento estándar RFC 5545 con fecha/hora de inicio y fin, ubicación y notas',
  },
  image: {
    title: 'Datos del Payload · Imagen / Archivo Local',
    subtitle: 'Modo Offline Base64 (hasta 2,953 bytes en el QR) o Modo Enlace Web con vista previa',
  },
};

export function buildActivePayload(
  type: PayloadType,
  payloads: PayloadDataMap
): PayloadBuildResult {
  switch (type) {
    case 'url':
      return buildUrlPayload(payloads.url);
    case 'text':
      return buildTextPayload(payloads.text);
    case 'vcard':
      return buildVCardPayload(payloads.vcard);
    case 'wifi':
      return buildWifiPayload(payloads.wifi);
    case 'email':
      return buildEmailPayload(payloads.email);
    case 'sms':
      return buildSmsWhatsappPayload(payloads.sms);
    case 'geo':
      return buildGeoPayload(payloads.geo);
    case 'calendar':
      return buildCalendarPayload(payloads.calendar);
    case 'image':
      return buildImagePayload(payloads.image);
  }
}
