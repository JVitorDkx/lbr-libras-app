import { useState } from "react";

import { GameScreen } from "./components/game/GameScreen";
import { LevelComplete } from "./components/game/LevelComplete";
import { MenuScreen } from "./components/MenuScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { usePlayerProgress } from "./hooks/usePlayerProgress";
import type { CompleteLevelResult, GameLevel } from "./types/game";

type AppScreen = "menu" | "profile" | "game" | "complete";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [activeLevel, setActiveLevel] = useState<GameLevel | null>(null);
  const [awardedXp, setAwardedXp] = useState(0);
  const { progress, applyServerProgress } = usePlayerProgress();

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

  if (screen === "game" && activeLevel) {
    return <GameScreen level={activeLevel} onExit={() => setScreen("menu")} onComplete={finishLevel} />;
  }

  if (screen === "complete") {
    return <LevelComplete awardedXp={awardedXp} streakDays={progress.streakDays} onReturn={() => setScreen("menu")} />;
  }

  if (screen === "profile") {
    return <ProfileScreen onNavigate={setScreen} />;
  }

  return <MenuScreen progress={progress} onPlay={startLevel} onNavigate={setScreen} />;
}
