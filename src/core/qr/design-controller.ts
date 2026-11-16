import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  GradientType,
  QRStyleConfig,
} from '../../types/qr';
import { appStore } from '../store/app-store';
import { evaluateScannability } from './contrast';
import { liveQrRenderer } from './renderer';

export function syncDesignInputsFromStyle(style: QRStyleConfig): void {
  const setColorControl = (id: string, hex: string) => {
    const swatch = document.getElementById(id) as HTMLInputElement | null;
    const text = document.getElementById(`${id}-hex`) as HTMLInputElement | null;
    if (swatch) swatch.value = hex.toLowerCase();
    if (text) text.value = hex.toUpperCase();
  };

  const setSliderControl = (id: string, val: number, unit: string) => {
    const slider = document.getElementById(id) as HTMLInputElement | null;
    const badge = document.getElementById(`${id}-value`);
    if (slider) slider.value = String(val);
    if (badge) badge.textContent = `${val}${unit}`;
  };

  const setToggleControl = (id: string, checked: boolean) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.checked = checked;
  };

  const setSelectControl = (id: string, val: string) => {
    const el = document.getElementById(id) as HTMLSelectElement | null;
    if (el) el.value = val;
  };

  // 1. Dots buttons
  document.querySelectorAll<HTMLButtonElement>('[data-dot-type]').forEach((btn) => {
    const isSel = btn.getAttribute('data-dot-type') === style.dots.type;
    btn.className = isSel
      ? 'flex flex-col items-start p-2.5 rounded-lg border text-left transition-all bg-app-accent/15 border-app-accent text-app-text'
      : 'flex flex-col items-start p-2.5 rounded-lg border text-left transition-all bg-app-elevated/70 border-app-border text-app-muted hover:border-zinc-600 hover:text-app-text';
  });

  // 2. Corners buttons & custom color
  document.querySelectorAll<HTMLButtonElement>('[data-corner-square]').forEach((btn) => {
    const isSel = btn.getAttribute('data-corner-square') === style.cornersSquare.type;
    btn.className = isSel
      ? 'px-3 py-2 rounded-lg border text-xs font-medium transition-all bg-app-accent/15 border-app-accent text-app-text'
      : 'px-3 py-2 rounded-lg border text-xs font-medium transition-all bg-app-elevated/70 border-app-border text-app-muted hover:text-app-text';
  });

  document.querySelectorAll<HTMLButtonElement>('[data-corner-dot]').forEach((btn) => {
    const isSel = btn.getAttribute('data-corner-dot') === style.cornersDot.type;
    btn.className = isSel
      ? 'px-3 py-2 rounded-lg border text-xs font-medium transition-all bg-app-accent/15 border-app-accent text-app-text'
      : 'px-3 py-2 rounded-lg border text-xs font-medium transition-all bg-app-elevated/70 border-app-border text-app-muted hover:text-app-text';
  });

  setToggleControl('corners-custom-color-toggle', style.cornersSquare.customColor);
  const customColorsPanel = document.getElementById('corners-custom-colors-panel');
  customColorsPanel?.classList.toggle('hidden', !style.cornersSquare.customColor);
  customColorsPanel?.classList.toggle('grid', style.cornersSquare.customColor);
  setColorControl('corner-square-color', style.cornersSquare.coloring.color);
  setColorControl('corner-dot-color', style.cornersDot.coloring.color);

  // 3. Colors & Gradients
  setColorControl('dots-solid-color', style.dots.coloring.color);
  setToggleControl('dots-gradient-toggle', style.dots.coloring.gradient.enabled);
  document
    .getElementById('dots-gradient-panel')
    ?.classList.toggle('hidden', !style.dots.coloring.gradient.enabled);
  setColorControl('dots-grad-stop1', style.dots.coloring.gradient.colorStop1);
  setColorControl('dots-grad-stop2', style.dots.coloring.gradient.colorStop2);
  setSelectControl('dots-grad-type', style.dots.coloring.gradient.type);
  setSliderControl('dots-grad-rotation', style.dots.coloring.gradient.rotation, '°');

  setToggleControl('bg-transparent-toggle', style.background.transparent);
  document
    .getElementById('bg-color-controls')
    ?.classList.toggle('hidden', style.background.transparent);
  setColorControl('bg-solid-color', style.background.coloring.color);
  setToggleControl('bg-gradient-toggle', style.background.coloring.gradient.enabled);
  document
    .getElementById('bg-gradient-panel')
    ?.classList.toggle('hidden', !style.background.coloring.gradient.enabled);
  setColorControl('bg-grad-stop1', style.background.coloring.gradient.colorStop1);
  setColorControl('bg-grad-stop2', style.background.coloring.gradient.colorStop2);
  setSelectControl('bg-grad-type', style.background.coloring.gradient.type);
  setSliderControl('bg-grad-rotation', style.background.coloring.gradient.rotation, '°');

  // 4. Logo
  const activeLogoBar = document.getElementById('logo-active-bar');
  const thumbPreview = document.getElementById('logo-thumb-preview') as HTMLImageElement | null;
  const logoFilename = document.getElementById('logo-filename');
  const hasLogo = Boolean(style.logo.dataUrl);
  activeLogoBar?.classList.toggle('hidden', !hasLogo);
  activeLogoBar?.classList.toggle('flex', hasLogo);
  if (hasLogo && thumbPreview && style.logo.dataUrl) {
    thumbPreview.src = style.logo.dataUrl;
  }
  if (logoFilename) {
    logoFilename.textContent = style.logo.name || 'logo.png';
  }
  setSliderControl('logo-size-slider', Math.round(style.logo.size * 100), '%');
  setSliderControl('logo-margin-slider', style.logo.margin, 'px');
  setToggleControl('logo-hide-dots-toggle', style.logo.hideBackgroundDots);

  // 5. Technical
  document.querySelectorAll<HTMLButtonElement>('[data-ecc-level]').forEach((btn) => {
    const isSel = btn.getAttribute('data-ecc-level') === style.technical.errorCorrectionLevel;
    btn.className = isSel
      ? 'flex flex-col items-center py-2 px-2 rounded-lg border transition-all bg-app-accent/15 border-app-accent text-app-text'
      : 'flex flex-col items-center py-2 px-2 rounded-lg border transition-all bg-app-elevated/70 border-app-border text-app-muted hover:text-app-text';
  });
  setSliderControl('tech-size-slider', style.technical.size, 'px');
  setSliderControl('tech-margin-slider', style.technical.margin, 'px');
}

export function initDesignController(): void {
  // Mount initial 60fps QR Renderer
  const mountEl = document.getElementById('qr-canvas-mount');
  if (mountEl) {
    const initState = appStore.getState();
    liveQrRenderer.mount(mountEl, initState.computedPayload.raw, initState.style);
  }

  // Helper to bind both color swatch and hex text input to a style mutator
  const bindColorPicker = (id: string, applyHex: (hex: string) => void) => {
    const swatch = document.getElementById(id) as HTMLInputElement | null;
    const hexInput = document.getElementById(`${id}-hex`) as HTMLInputElement | null;

    swatch?.addEventListener('input', () => {
      applyHex(swatch.value.toUpperCase());
    });

    hexInput?.addEventListener('input', () => {
      let val = hexInput.value.trim();
      if (!val.startsWith('#')) val = `#${val}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        applyHex(val.toUpperCase());
      }
    });
  };

  // 1. Dots Type buttons
  document.querySelectorAll<HTMLButtonElement>('[data-dot-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dotType = btn.getAttribute('data-dot-type') as DotType | null;
      if (!dotType) return;
      appStore.updateStyle((s) => {
        s.dots.type = dotType;
      });
    });
  });

  // 2. Corners (Outer & Inner + Independent Colors)
  document.querySelectorAll<HTMLButtonElement>('[data-corner-square]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cType = btn.getAttribute('data-corner-square') as CornerSquareType | null;
      if (!cType) return;
      appStore.updateStyle((s) => {
        s.cornersSquare.type = cType;
      });
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-corner-dot]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dType = btn.getAttribute('data-corner-dot') as CornerDotType | null;
      if (!dType) return;
      appStore.updateStyle((s) => {
        s.cornersDot.type = dType;
      });
    });
  });

  const customCornersToggle = document.getElementById(
    'corners-custom-color-toggle'
  ) as HTMLInputElement | null;
  customCornersToggle?.addEventListener('change', () => {
    const enabled = customCornersToggle.checked;
    appStore.updateStyle((s) => {
      s.cornersSquare.customColor = enabled;
      s.cornersDot.customColor = enabled;
    });
  });

  bindColorPicker('corner-square-color', (hex) => {
    appStore.updateStyle((s) => {
      s.cornersSquare.coloring.color = hex;
    });
  });

  bindColorPicker('corner-dot-color', (hex) => {
    appStore.updateStyle((s) => {
      s.cornersDot.coloring.color = hex;
    });
  });

  // 3. Colors & Gradients (Dots & Background)
  bindColorPicker('dots-solid-color', (hex) => {
    appStore.updateStyle((s) => {
      s.dots.coloring.color = hex;
    });
  });

  const dotsGradToggle = document.getElementById('dots-gradient-toggle') as HTMLInputElement | null;
  dotsGradToggle?.addEventListener('change', () => {
    appStore.updateStyle((s) => {
      s.dots.coloring.gradient.enabled = dotsGradToggle.checked;
    });
  });

  bindColorPicker('dots-grad-stop1', (hex) => {
    appStore.updateStyle((s) => {
      s.dots.coloring.gradient.colorStop1 = hex;
    });
  });

  bindColorPicker('dots-grad-stop2', (hex) => {
    appStore.updateStyle((s) => {
      s.dots.coloring.gradient.colorStop2 = hex;
    });
  });

  const dotsGradType = document.getElementById('dots-grad-type') as HTMLSelectElement | null;
  dotsGradType?.addEventListener('change', () => {
    appStore.updateStyle((s) => {
      s.dots.coloring.gradient.type = dotsGradType.value as GradientType;
    });
  });

  const dotsGradRot = document.getElementById('dots-grad-rotation') as HTMLInputElement | null;
  dotsGradRot?.addEventListener('input', () => {
    appStore.updateStyle((s) => {
      s.dots.coloring.gradient.rotation = Number(dotsGradRot.value);
    });
  });

  // Background
  const bgTransToggle = document.getElementById('bg-transparent-toggle') as HTMLInputElement | null;
  bgTransToggle?.addEventListener('change', () => {
    appStore.updateStyle((s) => {
      s.background.transparent = bgTransToggle.checked;
    });
  });

  bindColorPicker('bg-solid-color', (hex) => {
    appStore.updateStyle((s) => {
      s.background.coloring.color = hex;
    });
  });

  const bgGradToggle = document.getElementById('bg-gradient-toggle') as HTMLInputElement | null;
  bgGradToggle?.addEventListener('change', () => {
    appStore.updateStyle((s) => {
      s.background.coloring.gradient.enabled = bgGradToggle.checked;
    });
  });

  bindColorPicker('bg-grad-stop1', (hex) => {
    appStore.updateStyle((s) => {
      s.background.coloring.gradient.colorStop1 = hex;
    });
  });

  bindColorPicker('bg-grad-stop2', (hex) => {
    appStore.updateStyle((s) => {
      s.background.coloring.gradient.colorStop2 = hex;
    });
  });

  const bgGradType = document.getElementById('bg-grad-type') as HTMLSelectElement | null;
  bgGradType?.addEventListener('change', () => {
    appStore.updateStyle((s) => {
      s.background.coloring.gradient.type = bgGradType.value as GradientType;
    });
  });

  const bgGradRot = document.getElementById('bg-grad-rotation') as HTMLInputElement | null;
  bgGradRot?.addEventListener('input', () => {
    appStore.updateStyle((s) => {
      s.background.coloring.gradient.rotation = Number(bgGradRot.value);
    });
  });

  // 4. Logo Central (Drag & Drop + File Input + Sliders)
  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      appStore.updateStyle((s) => {
        s.logo.dataUrl = dataUrl;
        s.logo.name = file.name;
        if (s.technical.errorCorrectionLevel === 'L') {
          s.technical.errorCorrectionLevel = 'Q';
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const logoDropzone = document.getElementById('logo-dropzone');
  const logoFileInput = document.getElementById('logo-file-input') as HTMLInputElement | null;

  logoDropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    logoDropzone.classList.add('border-app-accent', 'bg-app-accent/10');
  });

  logoDropzone?.addEventListener('dragleave', () => {
    logoDropzone.classList.remove('border-app-accent', 'bg-app-accent/10');
  });

  logoDropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    logoDropzone.classList.remove('border-app-accent', 'bg-app-accent/10');
    const file = e.dataTransfer?.files?.[0];
    if (file) handleLogoFile(file);
  });

  logoFileInput?.addEventListener('change', () => {
    const file = logoFileInput.files?.[0];
    if (file) handleLogoFile(file);
  });

  const logoRemoveBtn = document.getElementById('logo-remove-btn');
  logoRemoveBtn?.addEventListener('click', () => {
    if (logoFileInput) logoFileInput.value = '';
    appStore.updateStyle((s) => {
      s.logo.dataUrl = null;
      s.logo.name = null;
    });
  });

  const logoSizeSlider = document.getElementById('logo-size-slider') as HTMLInputElement | null;
  logoSizeSlider?.addEventListener('input', () => {
    appStore.updateStyle((s) => {
      s.logo.size = Number(logoSizeSlider.value) / 100;
    });
  });

  const logoMarginSlider = document.getElementById('logo-margin-slider') as HTMLInputElement | null;
  logoMarginSlider?.addEventListener('input', () => {
    appStore.updateStyle((s) => {
      s.logo.margin = Number(logoMarginSlider.value);
    });
  });

  const logoHideDotsToggle = document.getElementById(
    'logo-hide-dots-toggle'
  ) as HTMLInputElement | null;
  logoHideDotsToggle?.addEventListener('change', () => {
    appStore.updateStyle((s) => {
      s.logo.hideBackgroundDots = logoHideDotsToggle.checked;
    });
  });

  // 5. Technical Options (ECC, Resolution, Quiet Zone)
  document.querySelectorAll<HTMLButtonElement>('[data-ecc-level]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lvl = btn.getAttribute('data-ecc-level') as ErrorCorrectionLevel | null;
      if (!lvl) return;
      appStore.updateStyle((s) => {
        s.technical.errorCorrectionLevel = lvl;
      });
    });
  });

  const techSizeSlider = document.getElementById('tech-size-slider') as HTMLInputElement | null;
  techSizeSlider?.addEventListener('input', () => {
    appStore.updateStyle((s) => {
      s.technical.size = Number(techSizeSlider.value);
    });
  });

  const techMarginSlider = document.getElementById('tech-margin-slider') as HTMLInputElement | null;
  techMarginSlider?.addEventListener('input', () => {
    appStore.updateStyle((s) => {
      s.technical.margin = Number(techMarginSlider.value);
    });
  });

  // 6. Reset All button
  const resetBtn = document.getElementById('reset-all-btn');
  resetBtn?.addEventListener('click', () => {
    appStore.resetAll();
    const urlInput = document.getElementById('url-input') as HTMLInputElement | null;
    if (urlInput) urlInput.value = 'https://chromaqr.app';
  });

  // 7. Subscribe to Store to update 60fps QR Canvas, Accordion Badges, Metadata & Scannability UX Pro Badge
  const badgeDots = document.getElementById('badge-dots-type');
  const badgeCorners = document.getElementById('badge-corners-type');
  const badgeColors = document.getElementById('badge-colors-summary');
  const badgeLogo = document.getElementById('badge-logo-status');
  const badgeTech = document.getElementById('badge-tech-summary');

  const metaRes = document.getElementById('canvas-meta-resolution');
  const metaEcc = document.getElementById('canvas-meta-ecc');

  const scanBadge = document.getElementById('scannability-badge');
  const scanIconOk = document.getElementById('scannability-icon-ok');
  const scanIconWarn = document.getElementById('scannability-icon-warn');
  const scanSummary = document.getElementById('scannability-summary');
  const scanRatio = document.getElementById('scannability-ratio');
  const scanDetail = document.getElementById('scannability-detail');

  const eccPercentage: Record<ErrorCorrectionLevel, string> = {
    L: '7%',
    M: '15%',
    Q: '25%',
    H: '30%',
  };

  appStore.subscribe((state, reason) => {
    const { style, computedPayload } = state;

    if (reason === 'style-change' || reason === 'state-reset' || reason === 'init') {
      syncDesignInputsFromStyle(style);
    }

    // Schedule 60fps QR update
    liveQrRenderer.scheduleUpdate(computedPayload.raw, style);

    // Update Accordion Summary Badges
    if (badgeDots) badgeDots.textContent = style.dots.type;
    if (badgeCorners) {
      badgeCorners.textContent = `${style.cornersSquare.type} / ${style.cornersDot.type}`;
    }
    if (badgeColors) {
      const fgLabel = style.dots.coloring.gradient.enabled
        ? 'Gradiente'
        : style.dots.coloring.color.toUpperCase();
      const bgLabel = style.background.transparent
        ? 'Transp.'
        : style.background.coloring.gradient.enabled
          ? 'Gradiente'
          : style.background.coloring.color.toUpperCase();
      badgeColors.textContent = `${fgLabel} / ${bgLabel}`;
    }
    if (badgeLogo) {
      badgeLogo.textContent = style.logo.dataUrl
        ? `${Math.round(style.logo.size * 100)}% · Activo`
        : 'Sin logo';
    }
    if (badgeTech) {
      badgeTech.textContent = `ECC: ${style.technical.errorCorrectionLevel} · ${style.technical.size}px`;
    }

    // Update Canvas Metadata Pills
    if (metaRes) {
      metaRes.textContent = `${style.technical.size} × ${style.technical.size} px`;
    }
    if (metaEcc) {
      const ecc = style.technical.errorCorrectionLevel;
      metaEcc.textContent = `ECC: ${ecc} (${eccPercentage[ecc]})`;
    }

    // Evaluate Scannability & Contrast
    const report = evaluateScannability(style, computedPayload.byteLength);

    if (scanBadge && scanSummary && scanRatio && scanDetail) {
      scanSummary.textContent = report.summary;
      scanRatio.textContent = `${report.contrastRatio}:1`;

      const isGood = report.level === 'excellent' || report.level === 'good';
      scanIconOk?.classList.toggle('hidden', !isGood);
      scanIconWarn?.classList.toggle('hidden', isGood);

      if (report.level === 'excellent') {
        scanBadge.className =
          'w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-app-success/10 border-app-success/30 text-app-success transition-colors';
      } else if (report.level === 'good') {
        scanBadge.className =
          'w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-app-accent/10 border-app-accent/30 text-app-accent transition-colors';
      } else if (report.level === 'warning') {
        scanBadge.className =
          'w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-400 transition-colors';
      } else {
        scanBadge.className =
          'w-full flex items-center justify-between px-3 py-2 rounded-xl border bg-app-danger/10 border-app-danger/30 text-app-danger transition-colors';
      }

      scanDetail.textContent =
        report.issues.length > 0
          ? report.issues[0]
          : 'Lectura óptima en cámaras móviles y lectores ópticos industriales.';
      scanDetail.className =
        report.level === 'critical'
          ? 'text-[11px] text-app-danger text-center leading-tight px-2'
          : report.level === 'warning'
            ? 'text-[11px] text-amber-300 text-center leading-tight px-2'
            : 'text-[11px] text-app-muted text-center leading-tight px-2';
    }
  });
}
