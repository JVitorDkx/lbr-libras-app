import { useCallback, useEffect, useState } from "react";

import { GameScreen } from "./components/game/GameScreen";
import { LevelComplete } from "./components/game/LevelComplete";
import { MenuScreen } from "./components/MenuScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { SettingsModal } from "./components/SettingsModal";
import { useAppSettings } from "./hooks/useAppSettings";
import { usePlayerProgress } from "./hooks/usePlayerProgress";
import { apiPost } from "./lib/api";
import { preloadVLibrasGamePlayer } from "./lib/vlibrasGamePlayer";
import type { ApiPlayerProgress, CompleteLevelResult, GameLevel } from "./types/game";

type AppScreen = "menu" | "profile" | "game" | "complete";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [activeLevel, setActiveLevel] = useState<GameLevel | null>(null);
  const [lessonStartXp, setLessonStartXp] = useState(0);
  const [lessonStartLevel, setLessonStartLevel] = useState(1);
  const [lessonMaxCombo, setLessonMaxCombo] = useState(0);
  const [completionResult, setCompletionResult] = useState<CompleteLevelResult | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const { progress, applyServerProgress, applyAnswerProgress } = usePlayerProgress();
  const { settings, updateSetting } = useAppSettings();

  useEffect(() => {
    // O preload e intencionalmente silencioso: se a rede externa falhar, a
    // propria tela do jogo apresenta a opcao de tentar novamente.
    void preloadVLibrasGamePlayer().catch(() => undefined);
  }, []);

  const startLevel = (level: GameLevel) => {
    setActiveLevel(level);
    setLessonStartXp(progress.xp);
    setLessonStartLevel(progress.levelNumber);
    setLessonMaxCombo(0);
    setCompletionResult(null);
    setScreen("game");
  };

  const finishLevel = (result: CompleteLevelResult, maxCombo: number) => {
    if (!activeLevel) return;
    applyServerProgress(result);
    setLessonMaxCombo(maxCombo);
    setCompletionResult(result);
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
    content = <GameScreen level={activeLevel} soundsEnabled={settings.soundsEnabled} onExit={() => setScreen("menu")} onAnswerProgress={applyAnswerProgress} onComplete={finishLevel} />;
  } else if (screen === "complete" && completionResult) {
    content = activeLevel ? <LevelComplete level={activeLevel} awardedXp={Math.max(0, completionResult.xp - lessonStartXp)} startXp={lessonStartXp} startLevel={lessonStartLevel} maxCombo={lessonMaxCombo} result={completionResult} onReturn={() => setScreen("menu")} /> : null;
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
