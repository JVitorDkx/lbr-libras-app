import { useCallback, useState } from "react";

import { GameScreen } from "./components/game/GameScreen";
import { LevelComplete } from "./components/game/LevelComplete";
import { MenuScreen } from "./components/MenuScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SettingsModal } from "./components/SettingsModal";
import { useAppSettings } from "./hooks/useAppSettings";
import { usePlayerProgress } from "./hooks/usePlayerProgress";
import { apiPost } from "./lib/api";
import { PROGRESS_STORAGE_KEY } from "./lib/progress";
import type { ApiPlayerProgress, CompleteLevelResult, GameLevel } from "./types/game";

type AppScreen = "menu" | "profile" | "game" | "complete";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [activeLevel, setActiveLevel] = useState<GameLevel | null>(null);
  const [awardedXp, setAwardedXp] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const { progress, applyServerProgress } = usePlayerProgress();
  const { settings, updateSetting } = useAppSettings();

  const startLevel = (level: GameLevel) => {
    setActiveLevel(level);
    setScreen("game");
  };

  const finishLevel = (result: CompleteLevelResult) => {
    if (!activeLevel) return;
    const alreadyCompleted = progress.completedLevelIds.includes(activeLevel.id);
    applyServerProgress(result);
    setAwardedXp(result.awarded_xp || (alreadyCompleted ? 0 : activeLevel.reward_xp));
    setScreen("complete");
  };

  const closeSettings = useCallback(() => {
    if (!resetting) setSettingsOpen(false);
  }, [resetting]);

  const resetProgress = async () => {
    setResetting(true);
    setResetError(false);
    try {
      const cleanProgress = await apiPost<ApiPlayerProgress>("/game/progress/reset");
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      applyServerProgress(cleanProgress);
      setDataVersion((version) => version + 1);
      setScreen("menu");
      setSettingsOpen(false);
    } catch {
      setResetError(true);
    } finally {
      setResetting(false);
    }
  };

  let content;
  if (screen === "game" && activeLevel) {
    content = <GameScreen level={activeLevel} soundsEnabled={settings.soundsEnabled} onExit={() => setScreen("menu")} onComplete={finishLevel} />;
  } else if (screen === "complete") {
    content = <LevelComplete awardedXp={awardedXp} streakDays={progress.streakDays} onReturn={() => setScreen("menu")} />;
  } else if (screen === "profile") {
    content = <ProfileScreen key={`profile-${dataVersion}`} onNavigate={setScreen} onOpenSettings={() => setSettingsOpen(true)} />;
  } else {
    content = <MenuScreen key={`menu-${dataVersion}`} progress={progress} onPlay={startLevel} onNavigate={setScreen} onOpenSettings={() => setSettingsOpen(true)} />;
  }

  return (
    <>
      {content}
      <SettingsModal open={settingsOpen} settings={settings} resetting={resetting} resetError={resetError} onChange={updateSetting} onReset={resetProgress} onClose={closeSettings} />
    </>
  );
}
