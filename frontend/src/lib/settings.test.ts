import { beforeEach, describe, expect, it } from "vitest";

import { defaultSettings, readSettings, saveSettings, SETTINGS_STORAGE_KEY } from "./settings";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

describe("preferências do aplicativo", () => {
  beforeEach(() => storage.clear());

  it("usa sons ligados e VLibras desligado por padrão", () => {
    expect(readSettings()).toEqual(defaultSettings);
  });

  it("persiste as escolhas do usuário no dispositivo", () => {
    saveSettings({ soundsEnabled: false, vlibrasEnabled: true });

    expect(storage.has(SETTINGS_STORAGE_KEY)).toBe(true);
    expect(readSettings()).toEqual({ soundsEnabled: false, vlibrasEnabled: true });
  });
});
