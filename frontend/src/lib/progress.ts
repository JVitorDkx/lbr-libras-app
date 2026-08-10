import type { GameLevel, LevelViewStatus } from "../types/game";

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

export function getLevelStatus(level: GameLevel): LevelViewStatus {
  return level.status;
}
