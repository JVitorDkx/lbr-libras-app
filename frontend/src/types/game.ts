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

export interface GameQuestion {
  id: string;
  prompt: string;
  media_type: "image" | "gif" | "video";
  media_url: string;
  options: string[];
}

export interface AnswerResult {
  correct: boolean;
  feedback: string;
  correct_answer: string;
}

export interface CompleteLevelResult {
  completed_level_ids: string[];
  xp: number;
  awarded_xp: number;
}

export interface ApiPlayerProgress {
  completed_level_ids: string[];
  xp: number;
}
