export type PayloadType =
  | 'url'
  | 'text'
  | 'vcard'
  | 'wifi'
  | 'email'
  | 'sms'
  | 'geo'
  | 'calendar'
  | 'image';

export interface UrlPayloadData {
  url: string;
  cleanUtm: boolean;
}

export interface TextPayloadData {
  text: string;
}

export interface VCardPayloadData {
  version: '3.0' | '4.0';
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phoneMobile: string;
  phoneWork: string;
  email: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiPayloadData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export interface EmailPayloadData {
  to: string;
  subject: string;
  body: string;
}

export interface SmsWhatsappPayloadData {
  mode: 'sms' | 'whatsapp';
  countryCode: string;
  phone: string;
  message: string;
}

export interface GeoPayloadData {
  latitude: string;
  longitude: string;
  query: string;
  format: 'geo_uri' | 'google_maps';
}

export interface CalendarPayloadData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  allDay: boolean;
}

export interface ImagePayloadData {
  mode: 'offline_base64' | 'remote_url';
  remoteUrl: string;
  dataUri: string;
  originalName: string;
  encodedBytes: number;
  autoCompress: boolean;
  maxDimension: number;
  quality: number;
}

export interface PayloadDataMap {
  url: UrlPayloadData;
  text: TextPayloadData;
  vcard: VCardPayloadData;
  wifi: WifiPayloadData;
  email: EmailPayloadData;
  sms: SmsWhatsappPayloadData;
  geo: GeoPayloadData;
  calendar: CalendarPayloadData;
  image: ImagePayloadData;
}

export type DotType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded';

export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type GradientType = 'linear' | 'radial';

export interface GradientConfig {
  enabled: boolean;
  type: GradientType;
  rotation: number;
  colorStop1: string;
  colorStop2: string;
}

export interface ColorOrGradient {
  color: string;
  gradient: GradientConfig;
}

export interface QRStyleConfig {
  dots: {
    type: DotType;
    coloring: ColorOrGradient;
  };
  cornersSquare: {
    type: CornerSquareType;
    customColor: boolean;
    coloring: ColorOrGradient;
  };
  cornersDot: {
    type: CornerDotType;
    customColor: boolean;
    coloring: ColorOrGradient;
  };
  background: {
    transparent: boolean;
    coloring: ColorOrGradient;
  };
  logo: {
    dataUrl: string | null;
    name: string | null;
    size: number;
    margin: number;
    hideBackgroundDots: boolean;
  };
  technical: {
    errorCorrectionLevel: ErrorCorrectionLevel;
    size: number;
    margin: number;
  };
}

export type ScannabilityLevel = 'excellent' | 'good' | 'warning' | 'critical';

export interface ScannabilityReport {
  level: ScannabilityLevel;
  contrastRatio: number;
  isInverted: boolean;
  byteLength: number;
  maxCapacityBytes: number;
  issues: string[];
  summary: string;
}

export interface QRPreset {
  id: string;
  name: string;
  builtIn?: boolean;
  style: QRStyleConfig;
}
