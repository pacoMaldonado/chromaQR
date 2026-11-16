import type { QRPreset } from '../../types/qr';
import {
  addCustomPreset,
  getAllPresets,
  removeCustomPreset,
} from '../presets/preset-manager';
import { appStore } from '../store/app-store';
import { showToast } from '../ui/toast';
import { copyQrToClipboard, exportQrToFile } from './exporter';

export async function initExportAndPresetController(): Promise<void> {
  const selectorEl = document.getElementById('preset-selector') as HTMLSelectElement | null;
  const saveBtn = document.getElementById('preset-save-btn');
  const deleteBtn = document.getElementById('preset-delete-btn');
  const newNameRow = document.getElementById('preset-new-name-row');
  const newNameInput = document.getElementById('preset-new-name-input') as HTMLInputElement | null;
  const confirmSaveBtn = document.getElementById('preset-confirm-save-btn');
  const cancelSaveBtn = document.getElementById('preset-cancel-save-btn');

  let presetsCache: QRPreset[] = [];

  const refreshPresetOptions = async (selectId?: string) => {
    presetsCache = await getAllPresets();
    if (!selectorEl) return;

    const currentId = selectId ?? selectorEl.value ?? 'chroma-indigo';
    selectorEl.innerHTML = '';

    presetsCache.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.builtIn ? p.name : `★ ${p.name}`;
      if (p.id === currentId) {
        opt.selected = true;
      }
      selectorEl.appendChild(opt);
    });

    const selectedPreset = presetsCache.find((p) => p.id === selectorEl.value);
    const isCustom = Boolean(selectedPreset && !selectedPreset.builtIn);
    deleteBtn?.classList.toggle('hidden', !isCustom);
  };

  await refreshPresetOptions('chroma-indigo');

  selectorEl?.addEventListener('change', () => {
    const chosen = presetsCache.find((p) => p.id === selectorEl.value);
    if (!chosen) return;
    appStore.setStyle(chosen.style);
    const isCustom = !chosen.builtIn;
    deleteBtn?.classList.toggle('hidden', !isCustom);
    showToast(`Plantilla "${chosen.name}" aplicada`, 'info');
  });

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
    if (!selectorEl) return;
    const targetId = selectorEl.value;
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

  // Bind Clipboard & Export Buttons
  const copyBtn = document.getElementById('copy-clipboard-btn');
  const pngBtn = document.getElementById('export-png-btn');
  const svgBtn = document.getElementById('export-svg-btn');
  const webpBtn = document.getElementById('export-webp-btn');
  const pdfBtn = document.getElementById('export-pdf-btn');

  copyBtn?.addEventListener('click', async () => {
    const { computedPayload, style } = appStore.getState();
    await copyQrToClipboard(computedPayload.raw, style);
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
