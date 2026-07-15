export type LevelAccent = "violet" | "cyan" | "amber";

export interface GameLevel {
  id: string;
  order: number;
  title: string;
  description: string;
  status: "available" | "locked";
  accent: LevelAccent;
  reward_xp: number;
  question_count: number;
  prerequisite_level_id: string | null;
}

export type LevelViewStatus = "completed" | "available" | "locked";
