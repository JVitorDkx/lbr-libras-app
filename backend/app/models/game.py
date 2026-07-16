from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class LevelStatus(StrEnum):
    AVAILABLE = "available"
    LOCKED = "locked"


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


class PlayerProgress(BaseModel):
    completed_level_ids: list[str]
    xp: int = Field(ge=0)
    streak_days: int = Field(ge=0)


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
    achievements_unlocked: int = Field(ge=0)
    achievements_total: int = Field(ge=0)
    learning_progress_percent: int = Field(ge=0, le=100)
    achievements: list[AchievementSummary]


class CompleteLevelResult(PlayerProgress):
    awarded_xp: int = Field(ge=0)


class AnswerAttemptSummary(BaseModel):
    question_id: str
    selected_answer: str
    correct: bool
    answered_at: datetime
