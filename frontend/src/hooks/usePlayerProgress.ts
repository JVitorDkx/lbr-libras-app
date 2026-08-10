import { useEffect, useState } from "react";

import { apiGet } from "../lib/api";
import { initialProgress, type PlayerProgress } from "../lib/progress";
import type { AnswerResult, ApiPlayerProgress } from "../types/game";

export function usePlayerProgress() {
  const [progress, setProgress] = useState<PlayerProgress>(initialProgress);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<ApiPlayerProgress>("/game/progress", controller.signal)
      .then((serverProgress) => {
        setProgress((current) => ({
          ...current,
          completedLevelIds: serverProgress.completed_level_ids,
          xp: serverProgress.xp,
          streakDays: serverProgress.streak_days,
          levelNumber: serverProgress.level_number,
          levelStartXp: serverProgress.level_start_xp,
          nextLevelXp: serverProgress.next_level_xp,
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
        streakDays: serverProgress.streak_days,
        levelNumber: serverProgress.level_number,
        levelStartXp: serverProgress.level_start_xp,
        nextLevelXp: serverProgress.next_level_xp,
      })),
    applyAnswerProgress: (answer: AnswerResult) =>
      setProgress((current) => ({
        ...current,
        xp: answer.xp,
        streakDays: answer.streak_days,
        levelNumber: answer.level_number,
        levelStartXp: answer.level_start_xp,
        nextLevelXp: answer.next_level_xp,
      })),
    reset: () => setProgress(initialProgress),
  };
}
