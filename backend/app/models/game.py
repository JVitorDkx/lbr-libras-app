from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class LevelStatus(StrEnum):
    AVAILABLE = "available"
    LOCKED = "locked"


class MediaType(StrEnum):
    IMAGE = "image"
    GIF = "gif"
    VIDEO = "video"


class LevelSummary(BaseModel):
    id: str
    order: int
    title: str
    description: str
    status: LevelStatus
    accent: str
    reward_xp: int = Field(ge=0)
    question_count: int = Field(ge=0)
    prerequisite_level_id: str | None = None


class QuestionPublic(BaseModel):
    id: str
    prompt: str
    media_type: MediaType
    media_url: str
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


class CompleteLevelResult(PlayerProgress):
    awarded_xp: int = Field(ge=0)


class AnswerAttemptSummary(BaseModel):
    question_id: str
    selected_answer: str
    correct: bool
    answered_at: datetime
