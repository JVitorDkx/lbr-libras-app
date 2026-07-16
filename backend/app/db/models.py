from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Player(Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    display_name: Mapped[str] = mapped_column(String(80), default="João")
    xp: Mapped[int] = mapped_column(Integer, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=3)
    level_number: Mapped[int] = mapped_column(Integer, default=14)
    total_play_seconds: Mapped[int] = mapped_column(Integer, default=115_200)
    signs_learned: Mapped[int] = mapped_column(Integer, default=248)
    challenges_completed: Mapped[int] = mapped_column(Integer, default=56)
    achievements_unlocked: Mapped[int] = mapped_column(Integer, default=12)
    achievements_total: Mapped[int] = mapped_column(Integer, default=30)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    level_progress: Mapped[list[PlayerLevelProgress]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )
    answer_attempts: Mapped[list[AnswerAttempt]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )
    achievement_progress: Mapped[list[PlayerAchievementProgress]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )


class Level(Base):
    __tablename__ = "levels"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    order: Mapped[int] = mapped_column(Integer, unique=True)
    title: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(String(200))
    accent: Mapped[str] = mapped_column(String(20))
    category: Mapped[str] = mapped_column(String(80), default="Princípios básicos")
    icon_key: Mapped[str] = mapped_column(String(30), default="hands")
    reward_xp: Mapped[int] = mapped_column(Integer, default=0)
    prerequisite_level_id: Mapped[str | None] = mapped_column(
        ForeignKey("levels.id"), nullable=True
    )

    questions: Mapped[list[Question]] = relationship(
        back_populates="level", cascade="all, delete-orphan"
    )
    player_progress: Mapped[list[PlayerLevelProgress]] = relationship(
        back_populates="level", cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    level_id: Mapped[str] = mapped_column(ForeignKey("levels.id"), index=True)
    prompt: Mapped[str] = mapped_column(String(240))
    media_type: Mapped[str] = mapped_column(String(20))
    media_url: Mapped[str] = mapped_column(String(300))
    options: Mapped[list[str]] = mapped_column(JSON)
    correct_answer: Mapped[str] = mapped_column(String(80))
    position: Mapped[int] = mapped_column(Integer)

    level: Mapped[Level] = relationship(back_populates="questions")
    answer_attempts: Mapped[list[AnswerAttempt]] = relationship(
        back_populates="question", cascade="all, delete-orphan"
    )


class PlayerLevelProgress(Base):
    __tablename__ = "player_level_progress"
    __table_args__ = (UniqueConstraint("player_id", "level_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), index=True)
    level_id: Mapped[str] = mapped_column(ForeignKey("levels.id"), index=True)
    status: Mapped[str] = mapped_column(String(20), default="locked")
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0)
    progress_percent: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    player: Mapped[Player] = relationship(back_populates="level_progress")
    level: Mapped[Level] = relationship(back_populates="player_progress")


class AnswerAttempt(Base):
    __tablename__ = "answer_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), index=True)
    question_id: Mapped[str] = mapped_column(ForeignKey("questions.id"), index=True)
    selected_answer: Mapped[str] = mapped_column(String(80))
    is_correct: Mapped[bool] = mapped_column(Boolean)
    answered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    player: Mapped[Player] = relationship(back_populates="answer_attempts")
    question: Mapped[Question] = relationship(back_populates="answer_attempts")


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(160))
    icon_key: Mapped[str] = mapped_column(String(30))
    accent: Mapped[str] = mapped_column(String(20))
    target_value: Mapped[int] = mapped_column(Integer)
    unit: Mapped[str] = mapped_column(String(30))
    order: Mapped[int] = mapped_column(Integer, unique=True)

    player_progress: Mapped[list[PlayerAchievementProgress]] = relationship(
        back_populates="achievement", cascade="all, delete-orphan"
    )


class PlayerAchievementProgress(Base):
    __tablename__ = "player_achievement_progress"
    __table_args__ = (UniqueConstraint("player_id", "achievement_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), index=True)
    achievement_id: Mapped[str] = mapped_column(ForeignKey("achievements.id"), index=True)
    current_value: Mapped[int] = mapped_column(Integer, default=0)
    unlocked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    player: Mapped[Player] = relationship(back_populates="achievement_progress")
    achievement: Mapped[Achievement] = relationship(back_populates="player_progress")
