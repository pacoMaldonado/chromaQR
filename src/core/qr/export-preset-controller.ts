import { openUrl } from '@tauri-apps/plugin-opener';
import type { QRPreset } from '../../types/qr';
import {
  addCustomPreset,
  getAllPresets,
  removeCustomPreset,
} from '../presets/preset-manager';
import { appStore } from '../store/app-store';
import { showToast } from '../ui/toast';
import {
  copyQrToClipboard,
  exportQrToFile,
  isMobilePlatform,
  shareQrImage,
} from './exporter';

const THEME_STORAGE_KEY = 'chromaqr_ui_theme';
const GITHUB_REPO_URL = 'https://github.com/pacoMaldonado/chromaQR';
const GITHUB_RELEASE_URL = `${GITHUB_REPO_URL}/releases/tag/v${__APP_VERSION__}`;

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function initThemeAndHeaderActions(): void {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');
  const themeLabel = document.getElementById('theme-toggle-label');
  const githubBtn = document.getElementById('github-repo-btn');
  const versionBtn = document.getElementById('app-version-btn');

  const applyTheme = (theme: 'dark' | 'light', notify: boolean = false) => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');

    const isDark = theme === 'dark';
    sunIcon?.classList.toggle('hidden', !isDark);
    moonIcon?.classList.toggle('hidden', isDark);
    if (themeLabel) {
      themeLabel.textContent = isDark ? 'Claro' : 'Oscuro';
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage error
    }

    if (notify) {
      showToast(
        isDark ? 'Tema Oscuro activado' : 'Tema Claro activado',
        'info',
        1800
      );
    }
  };

  // Load saved theme preference (default: dark)
  let initialTheme: 'dark' | 'light' = 'dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      initialTheme = saved;
    }
  } catch {
    // Ignore storage error
  }
  applyTheme(initialTheme, false);

  themeBtn?.addEventListener('click', () => {
    const isCurrentlyLight = document.documentElement.classList.contains('light');
    applyTheme(isCurrentlyLight ? 'dark' : 'light', true);
  });

  const openExternalUrl = async (url: string, toastMsg: string) => {
    if (isTauriRuntime()) {
      try {
        await openUrl(url);
        showToast(toastMsg, 'info', 2000);
        return;
      } catch (err) {
        console.warn('Fallback to window.open:', err);
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  githubBtn?.addEventListener('click', () => {
    void openExternalUrl(GITHUB_REPO_URL, 'Abriendo repositorio en el navegador...');
  });

  versionBtn?.addEventListener('click', () => {
    void openExternalUrl(
      GITHUB_RELEASE_URL,
      `ChromaQR v${__APP_VERSION__} — Abriendo notas de versión...`
    );
  });
}

export async function initExportAndPresetController(): Promise<void> {
  initThemeAndHeaderActions();

  const selectorInput = document.getElementById('preset-selector') as HTMLInputElement | null;
  const dropdownContainer = document.getElementById('preset-dropdown-container');
  const dropdownTrigger = document.getElementById('preset-dropdown-trigger');
  const dropdownLabel = document.getElementById('preset-dropdown-label');
  const dropdownChevron = document.getElementById('preset-dropdown-chevron');
  const dropdownMenu = document.getElementById('preset-dropdown-menu');

  const saveBtn = document.getElementById('preset-save-btn');
  const deleteBtn = document.getElementById('preset-delete-btn');
  const newNameRow = document.getElementById('preset-new-name-row');
  const newNameInput = document.getElementById('preset-new-name-input') as HTMLInputElement | null;
  const confirmSaveBtn = document.getElementById('preset-confirm-save-btn');
  const cancelSaveBtn = document.getElementById('preset-cancel-save-btn');

  let presetsCache: QRPreset[] = [];
  let isMenuOpen = false;

  const setMenuOpen = (open: boolean) => {
    isMenuOpen = open;
    dropdownTrigger?.setAttribute('aria-expanded', open ? 'true' : 'false');
    dropdownMenu?.classList.toggle('hidden', !open);
    dropdownChevron?.classList.toggle('rotate-180', open);
  };

  dropdownTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenuOpen(!isMenuOpen);
  });

  document.addEventListener('click', (e) => {
    if (isMenuOpen && dropdownContainer && !dropdownContainer.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  });

  const selectPresetById = (presetId: string, notify: boolean = true) => {
    const chosen = presetsCache.find((p) => p.id === presetId);
    if (!chosen) return;

    if (selectorInput) selectorInput.value = chosen.id;
    if (dropdownLabel) {
      dropdownLabel.textContent = chosen.builtIn ? chosen.name : `★ ${chosen.name}`;
    }

    const isCustom = !chosen.builtIn;
    deleteBtn?.classList.toggle('hidden', !isCustom);

    // Highlight active item in menu
    dropdownMenu?.querySelectorAll<HTMLLIElement>('[data-preset-option]').forEach((li) => {
      const active = li.getAttribute('data-preset-option') === chosen.id;
      li.className = active
        ? 'px-3 py-2 cursor-pointer flex items-center justify-between bg-app-accent/15 text-app-accent font-semibold transition-colors'
        : 'px-3 py-2 cursor-pointer flex items-center justify-between text-app-text hover:bg-app-elevated transition-colors';
    });

    appStore.setStyle(chosen.style);
    if (notify) {
      showToast(`Plantilla "${chosen.name}" aplicada`, 'info');
    }
  };

  const refreshPresetOptions = async (selectId?: string) => {
    presetsCache = await getAllPresets();
    if (!dropdownMenu) return;

    const currentId = selectId ?? selectorInput?.value ?? 'chroma-indigo';
    dropdownMenu.innerHTML = '';

    presetsCache.forEach((p) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('data-preset-option', p.id);
      const isSelected = p.id === currentId;

      li.className = isSelected
        ? 'px-3 py-2 cursor-pointer flex items-center justify-between bg-app-accent/15 text-app-accent font-semibold transition-colors'
        : 'px-3 py-2 cursor-pointer flex items-center justify-between text-app-text hover:bg-app-elevated transition-colors';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'truncate';
      nameSpan.textContent = p.builtIn ? p.name : `★ ${p.name}`;

      const tagSpan = document.createElement('span');
      tagSpan.className = 'font-mono text-[10px] text-app-muted ml-2 shrink-0';
      tagSpan.textContent = p.builtIn ? 'Oficial' : 'Usuario';

      li.appendChild(nameSpan);
      li.appendChild(tagSpan);

      li.addEventListener('click', () => {
        setMenuOpen(false);
        selectPresetById(p.id, true);
      });

      dropdownMenu.appendChild(li);
    });

    const selectedPreset =
      presetsCache.find((p) => p.id === currentId) ?? presetsCache[0];
    if (selectedPreset) {
      if (selectorInput) selectorInput.value = selectedPreset.id;
      if (dropdownLabel) {
        dropdownLabel.textContent = selectedPreset.builtIn
          ? selectedPreset.name
          : `★ ${selectedPreset.name}`;
      }
      deleteBtn?.classList.toggle('hidden', Boolean(selectedPreset.builtIn));
    }
  };

  await refreshPresetOptions('chroma-indigo');

  saveBtn?.addEventListener('click', () => {
    newNameRow?.classList.remove('hidden');
    newNameRow?.classList.add('flex');
    if (newNameInput) {
      newNameInput.value = '';
      newNameInput.focus();
    }
  });

  const hideNewNameRow = () => {
    newNameRow?.classList.add('hidden');
    newNameRow?.classList.remove('flex');
  };

  cancelSaveBtn?.addEventListener('click', hideNewNameRow);

  const handleConfirmSavePreset = async () => {
    const name = newNameInput?.value.trim() || 'Mi Preset QR';
    const currentStyle = appStore.getState().style;
    const created = await addCustomPreset(name, currentStyle);
    hideNewNameRow();
    await refreshPresetOptions(created.id);
    showToast(`Preset "${created.name}" guardado localmente`, 'success');
  };

  confirmSaveBtn?.addEventListener('click', handleConfirmSavePreset);
  newNameInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmSavePreset();
    } else if (e.key === 'Escape') {
      hideNewNameRow();
    }
  });

  deleteBtn?.addEventListener('click', async () => {
    const targetId = selectorInput?.value;
    if (!targetId) return;
    const target = presetsCache.find((p) => p.id === targetId);
    if (!target || target.builtIn) return;

    await removeCustomPreset(targetId);
    await refreshPresetOptions('chroma-indigo');
    const fallback = presetsCache.find((p) => p.id === 'chroma-indigo');
    if (fallback) {
      appStore.setStyle(fallback.style);
    }
    showToast(`Preset "${target.name}" eliminado`, 'info');
  });

  // Bind Clipboard, Mobile Share & Export Buttons
  const copyBtn = document.getElementById('copy-clipboard-btn');
  const shareBtn = document.getElementById('share-qr-btn');
  const pngBtn = document.getElementById('export-png-btn');
  const svgBtn = document.getElementById('export-svg-btn');
  const webpBtn = document.getElementById('export-webp-btn');
  const pdfBtn = document.getElementById('export-pdf-btn');

  // On Android/iOS, swap primary action from Clipboard to Native Share Sheet
  if (isMobilePlatform()) {
    copyBtn?.classList.add('hidden');
    shareBtn?.classList.remove('hidden');
  }

  copyBtn?.addEventListener('click', async () => {
    const { computedPayload, style } = appStore.getState();
    await copyQrToClipboard(computedPayload.raw, style);
  });

  shareBtn?.addEventListener('click', async () => {
    const { activeTab, computedPayload, style } = appStore.getState();
    await shareQrImage(activeTab, computedPayload.raw, style);
  });

  pngBtn?.addEventListener('click', async () => {
    const { activeTab, computedPayload, style } = appStore.getState();
    await exportQrToFile('png', activeTab, computedPayload.raw, style);
  });

  svgBtn?.addEventListener('click', async () => {
    const { activeTab, computedPayload, style } = appStore.getState();
    await exportQrToFile('svg', activeTab, computedPayload.raw, style);
  });

  webpBtn?.addEventListener('click', async () => {
    const { activeTab, computedPayload, style } = appStore.getState();
    await exportQrToFile('webp', activeTab, computedPayload.raw, style);
  });

  pdfBtn?.addEventListener('click', async () => {
    const { activeTab, computedPayload, style } = appStore.getState();
    await exportQrToFile('pdf', activeTab, computedPayload.raw, style);
  });

  // Global Keyboard Shortcuts (Ctrl/Cmd + C & Ctrl/Cmd + S)
  window.addEventListener('keydown', async (e) => {
    const activeEl = document.activeElement;
    const isTyping =
      activeEl instanceof HTMLInputElement ||
      activeEl instanceof HTMLTextAreaElement ||
      activeEl instanceof HTMLSelectElement;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && !isTyping) {
      const selection = window.getSelection()?.toString();
      if (!selection) {
        e.preventDefault();
        const { computedPayload, style } = appStore.getState();
        await copyQrToClipboard(computedPayload.raw, style);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      const { activeTab, computedPayload, style } = appStore.getState();
      await exportQrToFile('png', activeTab, computedPayload.raw, style);
    }
  });
}
