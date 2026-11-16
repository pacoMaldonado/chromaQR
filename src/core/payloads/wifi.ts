import type { WifiPayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

function escapeWifiField(input: string): string {
  return input.replace(/([\\;,:""])/g, '\\$1');
}

export function buildWifiPayload(data: WifiPayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const ssid = data.ssid.trim();
  const password = data.password;

  if (!ssid) {
    errors.push('El nombre de la red Wi-Fi (SSID) es obligatorio.');
  }

  if (data.encryption !== 'nopass') {
    if (!password) {
      errors.push(`La red con seguridad ${data.encryption} requiere contraseña.`);
    } else if (data.encryption === 'WPA' && password.length < 8) {
      warnings.push('Las contraseñas WPA/WPA2/WPA3 suelen requerir al menos 8 caracteres.');
    }
  }

  const parts: string[] = [`WIFI:T:${data.encryption};`, `S:${escapeWifiField(ssid || 'RedWiFi')};`];

  if (data.encryption !== 'nopass' && password) {
    parts.push(`P:${escapeWifiField(password)};`);
  }

  if (data.hidden) {
    parts.push('H:true;');
  }

  parts.push(';');
  const raw = parts.join('');
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
