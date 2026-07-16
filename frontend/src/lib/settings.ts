export const SETTINGS_STORAGE_KEY = "lbrlibras.settings.v1";

export interface AppSettings {
  soundsEnabled: boolean;
  vlibrasEnabled: boolean;
}

export const defaultSettings: AppSettings = {
  soundsEnabled: true,
  vlibrasEnabled: false,
};

export function readSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const saved = JSON.parse(raw) as Partial<AppSettings>;
    return {
      soundsEnabled: typeof saved.soundsEnabled === "boolean" ? saved.soundsEnabled : true,
      vlibrasEnabled: typeof saved.vlibrasEnabled === "boolean" ? saved.vlibrasEnabled : false,
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
