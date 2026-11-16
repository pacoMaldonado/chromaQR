import type { GeoPayloadData } from '../../types/qr';
import type { PayloadBuildResult } from './index';

export function buildGeoPayload(data: GeoPayloadData): PayloadBuildResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const latStr = data.latitude.trim();
  const lngStr = data.longitude.trim();
  const lat = Number(latStr);
  const lng = Number(lngStr);

  if (!latStr || Number.isNaN(lat) || lat < -90 || lat > 90) {
    errors.push('La latitud debe ser un número entre -90 y 90.');
  }
  if (!lngStr || Number.isNaN(lng) || lng < -180 || lng > 180) {
    errors.push('La longitud debe ser un número entre -180 y 180.');
  }

  const safeLat = !Number.isNaN(lat) && latStr ? lat : 19.432608;
  const safeLng = !Number.isNaN(lng) && lngStr ? lng : -99.133209;
  const query = data.query.trim();

  let raw = '';
  if (data.format === 'google_maps') {
    const qParam = query
      ? `${safeLat},${safeLng} (${encodeURIComponent(query)})`
      : `${safeLat},${safeLng}`;
    raw = `https://www.google.com/maps/search/?api=1&query=${qParam}`;
  } else {
    raw = query
      ? `geo:${safeLat},${safeLng}?q=${encodeURIComponent(query)}`
      : `geo:${safeLat},${safeLng}`;
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
