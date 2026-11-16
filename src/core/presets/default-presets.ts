import type { QRPreset } from '../../types/qr';
import { createDefaultStyle } from '../store/app-store';

export const DEFAULT_PRESETS: QRPreset[] = [
  {
    id: 'chroma-indigo',
    name: 'Chroma Indigo (Predeterminado)',
    builtIn: true,
    style: createDefaultStyle(),
  },
  {
    id: 'classic-print',
    name: 'Clásico Impresión (Alto Contraste)',
    builtIn: true,
    style: {
      dots: {
        type: 'square',
        coloring: {
          color: '#000000',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#000000',
            colorStop2: '#000000',
          },
        },
      },
      cornersSquare: {
        type: 'square',
        customColor: false,
        coloring: {
          color: '#000000',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#000000',
            colorStop2: '#000000',
          },
        },
      },
      cornersDot: {
        type: 'square',
        customColor: false,
        coloring: {
          color: '#000000',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#000000',
            colorStop2: '#000000',
          },
        },
      },
      background: {
        transparent: false,
        coloring: {
          color: '#FFFFFF',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#FFFFFF',
            colorStop2: '#FFFFFF',
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
        errorCorrectionLevel: 'H',
        size: 1024,
        margin: 20,
      },
    },
  },
  {
    id: 'emerald-cyber',
    name: 'Emerald Cyber Gradient',
    builtIn: true,
    style: {
      dots: {
        type: 'extra-rounded',
        coloring: {
          color: '#065F46',
          gradient: {
            enabled: true,
            type: 'linear',
            rotation: 45,
            colorStop1: '#059669',
            colorStop2: '#0F172A',
          },
        },
      },
      cornersSquare: {
        type: 'extra-rounded',
        customColor: true,
        coloring: {
          color: '#047857',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#047857',
            colorStop2: '#064E3B',
          },
        },
      },
      cornersDot: {
        type: 'dot',
        customColor: true,
        coloring: {
          color: '#0F172A',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#0F172A',
            colorStop2: '#0F172A',
          },
        },
      },
      background: {
        transparent: false,
        coloring: {
          color: '#F8FAFC',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#F8FAFC',
            colorStop2: '#F1F5F9',
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
    },
  },
  {
    id: 'minimal-dots',
    name: 'Minimal Dots Indigo',
    builtIn: true,
    style: {
      dots: {
        type: 'dots',
        coloring: {
          color: '#312E81',
          gradient: {
            enabled: true,
            type: 'radial',
            rotation: 0,
            colorStop1: '#4F46E5',
            colorStop2: '#1E1B4B',
          },
        },
      },
      cornersSquare: {
        type: 'dot',
        customColor: true,
        coloring: {
          color: '#312E81',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#312E81',
            colorStop2: '#312E81',
          },
        },
      },
      cornersDot: {
        type: 'dot',
        customColor: true,
        coloring: {
          color: '#4F46E5',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#4F46E5',
            colorStop2: '#4F46E5',
          },
        },
      },
      background: {
        transparent: false,
        coloring: {
          color: '#FFFFFF',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#FFFFFF',
            colorStop2: '#FFFFFF',
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
    },
  },
  {
    id: 'transparent-pro',
    name: 'Transparent Studio',
    builtIn: true,
    style: {
      dots: {
        type: 'classy-rounded',
        coloring: {
          color: '#09090B',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#09090B',
            colorStop2: '#27272A',
          },
        },
      },
      cornersSquare: {
        type: 'extra-rounded',
        customColor: false,
        coloring: {
          color: '#09090B',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#09090B',
            colorStop2: '#09090B',
          },
        },
      },
      cornersDot: {
        type: 'dot',
        customColor: false,
        coloring: {
          color: '#09090B',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#09090B',
            colorStop2: '#09090B',
          },
        },
      },
      background: {
        transparent: true,
        coloring: {
          color: '#FAFAFA',
          gradient: {
            enabled: false,
            type: 'linear',
            rotation: 0,
            colorStop1: '#FAFAFA',
            colorStop2: '#FAFAFA',
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
        size: 2048,
        margin: 16,
      },
    },
  },
];
