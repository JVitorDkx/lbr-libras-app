import type { GameLevel, LevelViewStatus } from "../types/game";

export const PROGRESS_STORAGE_KEY = "lbrlibras.progress.v1";

export interface PlayerProgress {
  completedLevelIds: string[];
  xp: number;
  streakDays: number;
  levelNumber: number;
  levelStartXp: number;
  nextLevelXp: number;
}

export const initialProgress: PlayerProgress = {
  completedLevelIds: [],
  xp: 0,
  streakDays: 0,
  levelNumber: 1,
  levelStartXp: 0,
  nextLevelXp: 100,
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
      streakDays: typeof parsed.streakDays === "number" ? Math.max(0, parsed.streakDays) : 0,
      levelNumber: typeof parsed.levelNumber === "number" ? Math.max(1, parsed.levelNumber) : 1,
      levelStartXp: typeof parsed.levelStartXp === "number" ? Math.max(0, parsed.levelStartXp) : 0,
      nextLevelXp: typeof parsed.nextLevelXp === "number" ? Math.max(1, parsed.nextLevelXp) : 100,
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

export function xpThresholdForLevel(levelNumber: number): number {
  const level = Math.max(1, Math.floor(levelNumber));
  return 25 * (level * (level + 1) - 2);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (Math.max(0, xp) >= xpThresholdForLevel(level + 1)) level += 1;
  return level;
}

export function completeLevel(progress: PlayerProgress, level: GameLevel): PlayerProgress {
  if (progress.completedLevelIds.includes(level.id)) return progress;

  const xp = progress.xp + level.reward_xp;
  const levelNumber = levelForXp(xp);
  return {
    ...progress,
    completedLevelIds: [...progress.completedLevelIds, level.id],
    xp,
    levelNumber,
    levelStartXp: xpThresholdForLevel(levelNumber),
    nextLevelXp: xpThresholdForLevel(levelNumber + 1),
  };
}
