import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs';
import type { QRPreset, QRStyleConfig } from '../../types/qr';
import { DEFAULT_PRESETS } from './default-presets';

const PRESETS_FILENAME = 'presets.json';
const LOCAL_STORAGE_KEY = 'chromaqr_user_presets_v1';

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function loadUserPresets(): Promise<QRPreset[]> {
  if (isTauriRuntime()) {
    try {
      const fileExists = await exists(PRESETS_FILENAME, {
        baseDir: BaseDirectory.AppData,
      });
      if (fileExists) {
        const raw = await readTextFile(PRESETS_FILENAME, {
          baseDir: BaseDirectory.AppData,
        });
        const parsed = JSON.parse(raw) as QRPreset[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Fallback to localStorage presets:', err);
    }
  }

  try {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as QRPreset[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage read error
  }
  return [];
}

export async function saveUserPresets(userPresets: QRPreset[]): Promise<void> {
  const json = JSON.stringify(userPresets, null, 2);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, json);
  } catch {
    // Ignore localStorage quota error
  }

  if (isTauriRuntime()) {
    try {
      await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
      await writeTextFile(PRESETS_FILENAME, json, {
        baseDir: BaseDirectory.AppData,
      });
    } catch (err) {
      console.warn('Could not persist presets to AppData via Tauri FS:', err);
    }
  }
}

export async function getAllPresets(): Promise<QRPreset[]> {
  const userPresets = await loadUserPresets();
  return [...DEFAULT_PRESETS, ...userPresets];
}

export async function addCustomPreset(
  name: string,
  style: QRStyleConfig
): Promise<QRPreset> {
  const userPresets = await loadUserPresets();
  const newPreset: QRPreset = {
    id: `custom-${Date.now()}`,
    name: name.trim() || `Mi Preset ${userPresets.length + 1}`,
    builtIn: false,
    style: JSON.parse(JSON.stringify(style)),
  };
  userPresets.push(newPreset);
  await saveUserPresets(userPresets);
  return newPreset;
}

export async function removeCustomPreset(id: string): Promise<void> {
  const userPresets = await loadUserPresets();
  const filtered = userPresets.filter((p) => p.id !== id);
  await saveUserPresets(filtered);
}
