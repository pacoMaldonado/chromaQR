import type {
  PayloadDataMap,
  PayloadType,
  QRStyleConfig,
} from '../../types/qr';
import { buildActivePayload, type PayloadBuildResult } from '../payloads';

export interface AppState {
  activeTab: PayloadType;
  payloads: PayloadDataMap;
  style: QRStyleConfig;
  computedPayload: PayloadBuildResult;
}

export function createDefaultPayloads(): PayloadDataMap {
  return {
    url: {
      url: 'https://chromaqr.app',
      cleanUtm: true,
    },
    text: {
      text: 'ChromaQR — Generador de códigos QR de escritorio ultrarrápido.',
    },
    vcard: {
      version: '3.0',
      firstName: 'Javier',
      lastName: 'Maldonado',
      organization: 'ChromaQR Studio',
      title: 'Principal Software Architect',
      phoneMobile: '+52 55 1234 5678',
      phoneWork: '',
      email: 'javier@chromaqr.app',
      website: 'https://chromaqr.app',
      street: 'Av. Reforma 222',
      city: 'Ciudad de México',
      state: 'CDMX',
      zip: '06600',
      country: 'México',
    },
    wifi: {
      ssid: 'ChromaQR_5G',
      password: 'SuperSecretPassword2026!',
      encryption: 'WPA',
      hidden: false,
    },
    email: {
      to: 'contacto@chromaqr.app',
      subject: 'Consulta sobre ChromaQR Desktop',
      body: 'Hola equipo,\n\nMe gustaría recibir más información sobre ChromaQR.',
    },
    sms: {
      mode: 'whatsapp',
      countryCode: '+52',
      phone: '5512345678',
      message: '¡Hola! Escaneé tu código ChromaQR.',
    },
    geo: {
      latitude: '19.432608',
      longitude: '-99.133209',
      query: 'Centro Histórico, CDMX',
      format: 'geo_uri',
    },
    calendar: {
      title: 'Lanzamiento Oficial ChromaQR v1.0',
      location: 'Auditorio Principal / Streaming',
      startDate: '2026-11-20T10:00',
      endDate: '2026-11-20T11:30',
      description: 'Presentación de la arquitectura Tauri v2 + Astro de ChromaQR.',
      allDay: false,
    },
    image: {
      mode: 'offline_base64',
      remoteUrl: 'https://chromaqr.app/favicon.svg',
      dataUri:
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%2309090B"/><rect x="12" y="12" width="18" height="18" rx="4" fill="%236366F1"/><rect x="34" y="12" width="18" height="18" rx="4" fill="%2310B981"/><rect x="12" y="34" width="18" height="18" rx="4" fill="%2310B981"/><rect x="34" y="34" width="18" height="18" rx="4" fill="%23FAFAFA"/></svg>',
      originalName: 'chroma-mini-icon.svg',
      encodedBytes: 382,
      autoCompress: true,
      maxDimension: 48,
      quality: 0.65,
    },
  };
}

export function createDefaultStyle(): QRStyleConfig {
  return {
    dots: {
      type: 'rounded',
      coloring: {
        color: '#09090B',
        gradient: {
          enabled: false,
          type: 'linear',
          rotation: 45,
          colorStop1: '#4F46E5',
          colorStop2: '#09090B',
        },
      },
    },
    cornersSquare: {
      type: 'extra-rounded',
      customColor: false,
      coloring: {
        color: '#6366F1',
        gradient: {
          enabled: false,
          type: 'linear',
          rotation: 0,
          colorStop1: '#6366F1',
          colorStop2: '#4F46E5',
        },
      },
    },
    cornersDot: {
      type: 'dot',
      customColor: false,
      coloring: {
        color: '#10B981',
        gradient: {
          enabled: false,
          type: 'linear',
          rotation: 0,
          colorStop1: '#10B981',
          colorStop2: '#059669',
        },
      },
    },
    background: {
      transparent: false,
      coloring: {
        color: '#FAFAFA',
        gradient: {
          enabled: false,
          type: 'linear',
          rotation: 135,
          colorStop1: '#FAFAFA',
          colorStop2: '#E4E4E7',
        },
      },
    },
    logo: {
      dataUrl: null,
      name: null,
      size: 0.22,
      margin: 6,
      hideBackgroundDots: true,
    },
    technical: {
      errorCorrectionLevel: 'Q',
      size: 1024,
      margin: 16,
    },
  };
}

type Listener = (state: AppState, reason: string) => void;

class ReactiveAppStore {
  private state: AppState;
  private listeners = new Set<Listener>();

  constructor() {
    const payloads = createDefaultPayloads();
    const style = createDefaultStyle();
    this.state = {
      activeTab: 'url',
      payloads,
      style,
      computedPayload: buildActivePayload('url', payloads),
    };
  }

  public getState(): AppState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state, 'init');
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(reason: string): void {
    for (const listener of this.listeners) {
      listener(this.state, reason);
    }
  }

  public setActiveTab(tab: PayloadType): void {
    if (this.state.activeTab === tab) return;
    this.state = {
      ...this.state,
      activeTab: tab,
      computedPayload: buildActivePayload(tab, this.state.payloads),
    };
    this.emit('tab-change');
  }

  public updatePayload<K extends PayloadType>(
    type: K,
    patch: Partial<PayloadDataMap[K]>
  ): void {
    const updatedPayloads: PayloadDataMap = {
      ...this.state.payloads,
      [type]: {
        ...this.state.payloads[type],
        ...patch,
      },
    };

    this.state = {
      ...this.state,
      payloads: updatedPayloads,
      computedPayload: buildActivePayload(this.state.activeTab, updatedPayloads),
    };
    this.emit('payload-change');
  }

  public updateStyle(mutator: (draft: QRStyleConfig) => void): void {
    const clone: QRStyleConfig = JSON.parse(JSON.stringify(this.state.style));
    mutator(clone);
    this.state = {
      ...this.state,
      style: clone,
    };
    this.emit('style-change');
  }

  public setStyle(newStyle: QRStyleConfig): void {
    const clone: QRStyleConfig = JSON.parse(JSON.stringify(newStyle));
    this.state = {
      ...this.state,
      style: clone,
    };
    this.emit('style-change');
  }

  public resetAll(): void {
    const payloads = createDefaultPayloads();
    const style = createDefaultStyle();
    this.state = {
      activeTab: 'url',
      payloads,
      style,
      computedPayload: buildActivePayload('url', payloads),
    };
    this.emit('state-reset');
  }
}

export const appStore = new ReactiveAppStore();
