import type { GameLevel, LevelViewStatus } from "../types/game";

export const PROGRESS_STORAGE_KEY = "lbrlibras.progress.v1";

export interface PlayerProgress {
  completedLevelIds: string[];
  xp: number;
  streakDays: number;
}

export const initialProgress: PlayerProgress = {
  completedLevelIds: [],
  xp: 0,
  streakDays: 3,
};

export function readProgress(): PlayerProgress {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!saved) return initialProgress;

    const parsed = JSON.parse(saved) as Partial<PlayerProgress>;
    return {
      completedLevelIds: Array.isArray(parsed.completedLevelIds)
        ? parsed.completedLevelIds.filter((id): id is string => typeof id === "string")
        : [],
      xp: typeof parsed.xp === "number" ? Math.max(0, parsed.xp) : 0,
      streakDays: typeof parsed.streakDays === "number" ? Math.max(0, parsed.streakDays) : 3,
    };
  } catch {
    return initialProgress;
  }
}

export function getLevelStatus(level: GameLevel, progress: PlayerProgress): LevelViewStatus {
  if (progress.completedLevelIds.includes(level.id)) return "completed";
  if (!level.prerequisite_level_id) return "available";
  return progress.completedLevelIds.includes(level.prerequisite_level_id) ? "available" : "locked";
}

export function completeLevel(progress: PlayerProgress, level: GameLevel): PlayerProgress {
  if (progress.completedLevelIds.includes(level.id)) return progress;

  return {
    ...progress,
    completedLevelIds: [...progress.completedLevelIds, level.id],
    xp: progress.xp + level.reward_xp,
  };
}
