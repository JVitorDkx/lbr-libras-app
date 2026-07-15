import { useEffect, useState } from "react";

import {
  completeLevel,
  initialProgress,
  PROGRESS_STORAGE_KEY,
  readProgress,
  type PlayerProgress,
} from "../lib/progress";
import type { GameLevel } from "../types/game";

export function usePlayerProgress() {
  const [progress, setProgress] = useState<PlayerProgress>(readProgress);

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  return {
    progress,
    complete: (level: GameLevel) => setProgress((current) => completeLevel(current, level)),
    reset: () => setProgress(initialProgress),
  };
}
