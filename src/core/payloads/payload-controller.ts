import type { PayloadType, WifiEncryption } from '../../types/qr';
import { PAYLOAD_META } from './index';
import { compressImageToQrDataUri, QR_MAX_BINARY_BYTES } from './image';
import { appStore } from '../store/app-store';

export function initPayloadController(): void {
  // 1. Bind Payload Tabs
  const tabButtons = document.querySelectorAll<HTMLButtonElement>('[data-payload-tab]');
  const panels = document.querySelectorAll<HTMLElement>('[data-payload-panel]');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-payload-tab') as PayloadType | null;
      if (!tab) return;
      appStore.setActiveTab(tab);
    });
  });

  // Helper to bind input elements to store updates
  const onInput = (id: string, handler: (val: string) => void) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (!el) return;
    el.addEventListener('input', () => handler(el.value));
    el.addEventListener('change', () => handler(el.value));
  };

  const onCheck = (id: string, handler: (checked: boolean) => void) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    el.addEventListener('change', () => handler(el.checked));
  };

  // 2. Bind URL Form
  onInput('url-input', (url) => appStore.updatePayload('url', { url }));
  onCheck('url-clean-utm', (cleanUtm) => appStore.updatePayload('url', { cleanUtm }));

  // 3. Bind Text Form
  onInput('text-input', (text) => {
    appStore.updatePayload('text', { text });
    const densityEl = document.getElementById('text-density-indicator');
    if (densityEl) {
      const bytes = new TextEncoder().encode(text).length;
      if (bytes > 800) {
        densityEl.textContent = `Alta Densidad (${bytes} B)`;
        densityEl.className = 'font-mono text-[11px] text-amber-400';
      } else if (bytes > 2953) {
        densityEl.textContent = `Excede Límite (${bytes} B)`;
        densityEl.className = 'font-mono text-[11px] text-app-danger';
      } else {
        densityEl.textContent = `Densidad Óptima (${bytes} B)`;
        densityEl.className = 'font-mono text-[11px] text-app-success';
      }
    }
  });

  // 4. Bind vCard Form
  onInput('vcard-version', (version) =>
    appStore.updatePayload('vcard', { version: version as '3.0' | '4.0' })
  );
  onInput('vcard-first-name', (firstName) => appStore.updatePayload('vcard', { firstName }));
  onInput('vcard-last-name', (lastName) => appStore.updatePayload('vcard', { lastName }));
  onInput('vcard-org', (organization) => appStore.updatePayload('vcard', { organization }));
  onInput('vcard-title', (title) => appStore.updatePayload('vcard', { title }));
  onInput('vcard-phone-mobile', (phoneMobile) => appStore.updatePayload('vcard', { phoneMobile }));
  onInput('vcard-phone-work', (phoneWork) => appStore.updatePayload('vcard', { phoneWork }));
  onInput('vcard-email', (email) => appStore.updatePayload('vcard', { email }));
  onInput('vcard-website', (website) => appStore.updatePayload('vcard', { website }));
  onInput('vcard-street', (street) => appStore.updatePayload('vcard', { street }));
  onInput('vcard-city', (city) => appStore.updatePayload('vcard', { city }));
  onInput('vcard-state', (state) => appStore.updatePayload('vcard', { state }));
  onInput('vcard-zip', (zip) => appStore.updatePayload('vcard', { zip }));
  onInput('vcard-country', (country) => appStore.updatePayload('vcard', { country }));

  // 5. Bind Wi-Fi Form + Password Toggle
  onInput('wifi-ssid', (ssid) => appStore.updatePayload('wifi', { ssid }));
  onInput('wifi-password', (password) => appStore.updatePayload('wifi', { password }));
  onInput('wifi-encryption', (encryption) => {
    const enc = encryption as WifiEncryption;
    appStore.updatePayload('wifi', { encryption: enc });
    const pwWrapper = document.getElementById('wifi-password-wrapper');
    pwWrapper?.classList.toggle('hidden', enc === 'nopass');
  });
  onCheck('wifi-hidden', (hidden) => appStore.updatePayload('wifi', { hidden }));

  const wifiToggleBtn = document.getElementById('wifi-toggle-password');
  const wifiPwInput = document.getElementById('wifi-password') as HTMLInputElement | null;
  const eyeOpen = document.getElementById('wifi-eye-open');
  const eyeClosed = document.getElementById('wifi-eye-closed');

  wifiToggleBtn?.addEventListener('click', () => {
    if (!wifiPwInput) return;
    const isPassword = wifiPwInput.type === 'password';
    wifiPwInput.type = isPassword ? 'text' : 'password';
    eyeOpen?.classList.toggle('hidden', isPassword);
    eyeClosed?.classList.toggle('hidden', !isPassword);
  });

  // 6. Bind Email Form
  onInput('email-to', (to) => appStore.updatePayload('email', { to }));
  onInput('email-subject', (subject) => appStore.updatePayload('email', { subject }));
  onInput('email-body', (body) => appStore.updatePayload('email', { body }));

  // 7. Bind SMS / WhatsApp Form
  onInput('sms-mode', (mode) =>
    appStore.updatePayload('sms', { mode: mode as 'sms' | 'whatsapp' })
  );
  onInput('sms-country', (countryCode) => appStore.updatePayload('sms', { countryCode }));
  onInput('sms-phone', (phone) => appStore.updatePayload('sms', { phone }));
  onInput('sms-message', (message) => appStore.updatePayload('sms', { message }));

  // 8. Bind Geo Form
  onInput('geo-lat', (latitude) => appStore.updatePayload('geo', { latitude }));
  onInput('geo-lng', (longitude) => appStore.updatePayload('geo', { longitude }));
  onInput('geo-format', (format) =>
    appStore.updatePayload('geo', { format: format as 'geo_uri' | 'google_maps' })
  );
  onInput('geo-query', (query) => appStore.updatePayload('geo', { query }));

  // 9. Bind Calendar Form
  onInput('cal-title', (title) => appStore.updatePayload('calendar', { title }));
  onInput('cal-location', (location) => appStore.updatePayload('calendar', { location }));
  onInput('cal-start', (startDate) => appStore.updatePayload('calendar', { startDate }));
  onInput('cal-end', (endDate) => appStore.updatePayload('calendar', { endDate }));
  onCheck('cal-allday', (allDay) => appStore.updatePayload('calendar', { allDay }));
  onInput('cal-desc', (description) => appStore.updatePayload('calendar', { description }));

  // 10. Bind Image Form (Mode 1 Offline Base64 & Mode 2 Remote URL)
  let currentOfflineFile: File | null = null;

  const updateImageCapacityBar = (bytes: number) => {
    const label = document.getElementById('img-capacity-label');
    const bar = document.getElementById('img-capacity-bar');
    const pct = Math.min(100, Math.round((bytes / QR_MAX_BINARY_BYTES) * 100));
    if (label) {
      label.textContent = `${bytes} / ${QR_MAX_BINARY_BYTES} bytes (${pct}%)`;
      label.className =
        bytes > QR_MAX_BINARY_BYTES
          ? 'font-mono text-[11px] text-app-danger'
          : bytes > 1800
            ? 'font-mono text-[11px] text-amber-400'
            : 'font-mono text-[11px] text-app-success';
    }
    if (bar) {
      bar.style.width = `${pct}%`;
      bar.className =
        bytes > QR_MAX_BINARY_BYTES
          ? 'h-full bg-app-danger transition-all duration-200'
          : bytes > 1800
            ? 'h-full bg-amber-400 transition-all duration-200'
            : 'h-full bg-app-accent transition-all duration-200';
    }
  };

  const recompressOfflineImage = async () => {
    if (!currentOfflineFile) return;
    const state = appStore.getState().payloads.image;
    try {
      const { dataUri, bytes } = await compressImageToQrDataUri(
        currentOfflineFile,
        state.maxDimension,
        state.quality
      );
      const previewImg = document.getElementById('img-offline-preview') as HTMLImageElement | null;
      if (previewImg) previewImg.src = dataUri;
      updateImageCapacityBar(bytes);
      appStore.updatePayload('image', {
        dataUri,
        encodedBytes: bytes,
        originalName: currentOfflineFile.name,
      });
    } catch (err) {
      console.error('Image compression error:', err);
    }
  };

  onInput('img-mode', (mode) => {
    const m = mode as 'offline_base64' | 'remote_url';
    appStore.updatePayload('image', { mode: m });
    document.getElementById('img-offline-panel')?.classList.toggle('hidden', m !== 'offline_base64');
    document.getElementById('img-remote-panel')?.classList.toggle('hidden', m !== 'remote_url');
  });

  const offlineFileInput = document.getElementById('img-offline-file') as HTMLInputElement | null;
  offlineFileInput?.addEventListener('change', async () => {
    const file = offlineFileInput.files?.[0];
    if (!file) return;
    currentOfflineFile = file;
    const fnameEl = document.getElementById('img-offline-filename');
    if (fnameEl) fnameEl.textContent = file.name;
    await recompressOfflineImage();
  });

  onInput('img-max-dim', async (val) => {
    appStore.updatePayload('image', { maxDimension: Number(val) });
    await recompressOfflineImage();
  });

  onInput('img-quality', async (val) => {
    appStore.updatePayload('image', { quality: Number(val) / 100 });
    await recompressOfflineImage();
  });

  onInput('img-remote-url', (remoteUrl) => {
    appStore.updatePayload('image', { remoteUrl });
    const remotePreview = document.getElementById('img-remote-preview') as HTMLImageElement | null;
    if (remotePreview && /^https?:\/\/.+/i.test(remoteUrl.trim())) {
      remotePreview.src = remoteUrl.trim();
    }
  });

  // 11. Subscribe to Store updates to sync UI tabs, titles, validation banners & raw payload viewer
  const titleEl = document.getElementById('payload-section-title');
  const subtitleEl = document.getElementById('payload-section-subtitle');
  const byteCounterEl = document.getElementById('payload-byte-counter');
  const charCountEl = document.getElementById('payload-char-count');
  const rawPreviewEl = document.getElementById('raw-payload-preview');
  const errorBannerEl = document.getElementById('payload-validation-banner');
  const errorMsgEl = document.getElementById('payload-validation-message');
  const warnBannerEl = document.getElementById('payload-warning-banner');
  const warnMsgEl = document.getElementById('payload-warning-message');

  appStore.subscribe((state) => {
    const { activeTab, computedPayload } = state;

    // Update active tab styling
    tabButtons.forEach((btn) => {
      const isSelected = btn.getAttribute('data-payload-tab') === activeTab;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.className = isSelected
        ? 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border bg-app-accent/15 text-app-text border-app-accent/40 shadow-sm'
        : 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border bg-transparent text-app-muted border-transparent hover:bg-app-elevated hover:text-app-text';
    });

    // Show active form panel
    panels.forEach((panel) => {
      const isTarget = panel.getAttribute('data-payload-panel') === activeTab;
      panel.classList.toggle('hidden', !isTarget);
    });

    // Update section header
    const meta = PAYLOAD_META[activeTab];
    if (titleEl) titleEl.textContent = meta.title;
    if (subtitleEl) subtitleEl.textContent = meta.subtitle;

    // Update byte & char counters
    if (byteCounterEl) {
      byteCounterEl.textContent = `${computedPayload.byteLength} bytes`;
      byteCounterEl.className = computedPayload.isValid
        ? 'px-2 py-0.5 rounded bg-app-elevated border border-app-border font-mono text-[11px] text-app-muted'
        : 'px-2 py-0.5 rounded bg-app-danger/15 border border-app-danger/40 font-mono text-[11px] text-app-danger';
    }
    if (charCountEl) {
      charCountEl.textContent = `${computedPayload.charLength} chars`;
    }
    if (rawPreviewEl) {
      rawPreviewEl.textContent = computedPayload.raw;
    }

    // Update validation error banner
    if (errorBannerEl && errorMsgEl) {
      const hasErrors = computedPayload.errors.length > 0;
      errorBannerEl.classList.toggle('hidden', !hasErrors);
      errorBannerEl.classList.toggle('flex', hasErrors);
      if (hasErrors) {
        errorMsgEl.textContent = computedPayload.errors[0];
      }
    }

    // Update validation warning banner
    if (warnBannerEl && warnMsgEl) {
      const hasWarnings = computedPayload.errors.length === 0 && computedPayload.warnings.length > 0;
      warnBannerEl.classList.toggle('hidden', !hasWarnings);
      warnBannerEl.classList.toggle('flex', hasWarnings);
      if (hasWarnings) {
        warnMsgEl.textContent = computedPayload.warnings[0];
      }
    }
  });
}
