import { useEffect, useState } from "react";

import { readSettings, saveSettings, type AppSettings } from "../lib/settings";

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(readSettings);

  useEffect(() => saveSettings(settings), [settings]);

  return {
    settings,
    updateSetting: <Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]) =>
      setSettings((current) => ({ ...current, [key]: value })),
  };
}
