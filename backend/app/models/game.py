from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class LevelStatus(StrEnum):
    AVAILABLE = "available"
    COMPLETED = "completed"
    LOCKED = "locked"


class MasteryStatus(StrEnum):
    EXCELLENT = "excellent"
    GOOD_PROGRESS = "good_progress"
    NEEDS_PRACTICE = "needs_practice"
    NOT_STARTED = "not_started"


class LevelSummary(BaseModel):
    id: str
    order: int
    title: str
    description: str
    status: LevelStatus
    accent: str
    category: str
    icon_key: str
    progress_percent: int = Field(ge=0, le=100)
    reward_xp: int = Field(ge=0)
    question_count: int = Field(ge=0)
    prerequisite_level_id: str | None = None


class QuestionPublic(BaseModel):
    id: str
    prompt: str
    avatar_phrase: str
    options: list[str]


class AnswerRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=80)


class AnswerResult(BaseModel):
    correct: bool
    feedback: str
    correct_answer: str
    awarded_xp: int = Field(ge=0)
    xp: int = Field(ge=0)
    level_number: int = Field(ge=1)
    leveled_up: bool
    streak_days: int = Field(ge=0)
    level_start_xp: int = Field(ge=0)
    next_level_xp: int = Field(gt=0)


class PlayerProgress(BaseModel):
    completed_level_ids: list[str]
    xp: int = Field(ge=0)
    streak_days: int = Field(ge=0)
    level_number: int = Field(ge=1)
    level_start_xp: int = Field(ge=0)
    next_level_xp: int = Field(gt=0)


class AchievementSummary(BaseModel):
    id: str
    title: str
    description: str
    icon_key: str
    accent: str
    current_value: int = Field(ge=0)
    target_value: int = Field(gt=0)
    unit: str
    progress_percent: int = Field(ge=0, le=100)


class PlayerProfile(BaseModel):
    display_name: str
    level_number: int = Field(ge=1)
    xp: int = Field(ge=0)
    streak_days: int = Field(ge=0)
    total_play_seconds: int = Field(ge=0)
    signs_learned: int = Field(ge=0)
    challenges_completed: int = Field(ge=0)
    lessons_completed: int = Field(ge=0)
    best_combo: int = Field(ge=0)
    achievements_unlocked: int = Field(ge=0)
    achievements_total: int = Field(ge=0)
    learning_progress_percent: int = Field(ge=0, le=100)
    achievements: list[AchievementSummary]


class CompleteLevelResult(PlayerProgress):
    awarded_xp: int = Field(ge=0)
    previous_xp: int = Field(ge=0)
    previous_level: int = Field(ge=1)
    leveled_up: bool


class AnswerAttemptSummary(BaseModel):
    question_id: str
    selected_answer: str
    correct: bool
    answered_at: datetime


class ModulePerformance(BaseModel):
    level_id: str
    title: str
    category: str
    level_status: LevelStatus
    attempts: int = Field(ge=0)
    correct_attempts: int = Field(ge=0)
    accuracy_percent: int = Field(ge=0, le=100)
    signs_mastered: int = Field(ge=0)
    total_signs: int = Field(ge=0)
    progress_percent: int = Field(ge=0, le=100)
    mastery_status: MasteryStatus


class LearningAnalytics(BaseModel):
    total_attempts: int = Field(ge=0)
    correct_attempts: int = Field(ge=0)
    overall_accuracy_percent: int = Field(ge=0, le=100)
    modules: list[ModulePerformance]
