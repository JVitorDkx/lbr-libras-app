import { useEffect, useState } from "react";

import { apiGet } from "../lib/api";
import {
  initialProgress,
  PROGRESS_STORAGE_KEY,
  readProgress,
  type PlayerProgress,
} from "../lib/progress";
import type { ApiPlayerProgress } from "../types/game";

export function usePlayerProgress() {
  const [progress, setProgress] = useState<PlayerProgress>(readProgress);

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<ApiPlayerProgress>("/game/progress", controller.signal)
      .then((serverProgress) => {
        setProgress((current) => ({
          ...current,
          completedLevelIds: serverProgress.completed_level_ids,
          xp: serverProgress.xp,
        }));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return {
    progress,
    applyServerProgress: (serverProgress: ApiPlayerProgress) =>
      setProgress((current) => ({
        ...current,
        completedLevelIds: serverProgress.completed_level_ids,
        xp: serverProgress.xp,
      })),
    reset: () => setProgress(initialProgress),
  };
}
