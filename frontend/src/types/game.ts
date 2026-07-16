export type LevelAccent = "violet" | "cyan" | "coral" | "indigo" | "teal" | "amber";

export interface GameLevel {
  id: string;
  order: number;
  title: string;
  description: string;
  status: "available" | "locked";
  accent: LevelAccent;
  category: string;
  icon_key: string;
  progress_percent: number;
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
  streak_days: number;
  awarded_xp: number;
}

export interface ApiPlayerProgress {
  completed_level_ids: string[];
  xp: number;
  streak_days: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_key: string;
  accent: LevelAccent;
  current_value: number;
  target_value: number;
  unit: string;
  progress_percent: number;
}

export interface PlayerProfile {
  display_name: string;
  level_number: number;
  xp: number;
  streak_days: number;
  total_play_seconds: number;
  signs_learned: number;
  challenges_completed: number;
  achievements_unlocked: number;
  achievements_total: number;
  learning_progress_percent: number;
  achievements: Achievement[];
}
