from datetime import datetime, timezone

from sqlalchemy import delete, select

from app.db.models import AnswerAttempt, Level, Player, PlayerLevelProgress, Question
from app.db.session import SessionLocal
from app.models.game import (
    AnswerAttemptSummary,
    AnswerResult,
    CompleteLevelResult,
    LevelStatus,
    LevelSummary,
    MediaType,
    PlayerProgress,
    QuestionPublic,
)


DEFAULT_PLAYER_ID = 1


class GameService:
    def list_levels(self) -> list[LevelSummary]:
        with SessionLocal() as session:
            levels = session.scalars(select(Level).order_by(Level.order)).all()
            progress_by_level = {
                item.level_id: item.status
                for item in session.scalars(
                    select(PlayerLevelProgress).where(
                        PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID
                    )
                )
            }
            return [
                LevelSummary(
                    id=level.id,
                    order=level.order,
                    title=level.title,
                    description=level.description,
                    status=(
                        LevelStatus.AVAILABLE
                        if progress_by_level.get(level.id) in {"available", "completed"}
                        else LevelStatus.LOCKED
                    ),
                    accent=level.accent,
                    reward_xp=level.reward_xp,
                    question_count=len(level.questions),
                    prerequisite_level_id=level.prerequisite_level_id,
                )
                for level in levels
            ]

    def list_questions(self, level_id: str) -> list[QuestionPublic] | None:
        with SessionLocal() as session:
            if session.get(Level, level_id) is None:
                return None
            records = session.scalars(
                select(Question)
                .where(Question.level_id == level_id)
                .order_by(Question.position)
            ).all()
            return [
                QuestionPublic(
                    id=question.id,
                    prompt=question.prompt,
                    media_type=MediaType(question.media_type),
                    media_url=question.media_url,
                    options=question.options,
                )
                for question in records
            ]

    def validate_answer(
        self, level_id: str, question_id: str, selected_answer: str
    ) -> AnswerResult | None:
        with SessionLocal() as session:
            question = session.scalar(
                select(Question).where(
                    Question.id == question_id,
                    Question.level_id == level_id,
                )
            )
            if question is None:
                return None

            is_correct = selected_answer.casefold().strip() == question.correct_answer.casefold()
            session.add(
                AnswerAttempt(
                    player_id=DEFAULT_PLAYER_ID,
                    question_id=question.id,
                    selected_answer=selected_answer.strip(),
                    is_correct=is_correct,
                )
            )
            session.commit()

            feedback = (
                "Parabéns! Você identificou o sinal corretamente."
                if is_correct
                else "Quase! Observe o sinal novamente e tente outra resposta."
            )
            return AnswerResult(
                correct=is_correct,
                feedback=feedback,
                correct_answer=question.correct_answer,
            )

    def get_progress(self) -> PlayerProgress:
        with SessionLocal() as session:
            player = session.get(Player, DEFAULT_PLAYER_ID)
            completed = session.scalars(
                select(PlayerLevelProgress.level_id).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                    PlayerLevelProgress.status == "completed",
                )
            ).all()
            return PlayerProgress(
                completed_level_ids=sorted(completed),
                xp=player.xp if player else 0,
            )

    def list_answer_attempts(self) -> list[AnswerAttemptSummary]:
        with SessionLocal() as session:
            attempts = session.scalars(
                select(AnswerAttempt)
                .where(AnswerAttempt.player_id == DEFAULT_PLAYER_ID)
                .order_by(AnswerAttempt.answered_at)
            ).all()
            return [
                AnswerAttemptSummary(
                    question_id=attempt.question_id,
                    selected_answer=attempt.selected_answer,
                    correct=attempt.is_correct,
                    answered_at=attempt.answered_at,
                )
                for attempt in attempts
            ]

    def complete_level(self, level_id: str) -> CompleteLevelResult | None:
        with SessionLocal() as session:
            level = session.get(Level, level_id)
            player = session.get(Player, DEFAULT_PLAYER_ID)
            progress = session.scalar(
                select(PlayerLevelProgress).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                    PlayerLevelProgress.level_id == level_id,
                )
            )
            if level is None or player is None or progress is None:
                return None

            awarded_xp = 0
            if progress.status != "completed":
                awarded_xp = level.reward_xp
                progress.status = "completed"
                progress.xp_awarded = awarded_xp
                progress.completed_at = datetime.now(timezone.utc)
                player.xp += awarded_xp

                next_progress = session.scalar(
                    select(PlayerLevelProgress)
                    .join(Level, PlayerLevelProgress.level_id == Level.id)
                    .where(
                        PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                        Level.prerequisite_level_id == level_id,
                    )
                )
                if next_progress is not None and next_progress.status == "locked":
                    next_progress.status = "available"

                session.commit()

            completed = session.scalars(
                select(PlayerLevelProgress.level_id).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                    PlayerLevelProgress.status == "completed",
                )
            ).all()
            return CompleteLevelResult(
                completed_level_ids=sorted(completed),
                xp=player.xp,
                awarded_xp=awarded_xp,
            )

    def reset_progress(self) -> None:
        with SessionLocal() as session:
            player = session.get(Player, DEFAULT_PLAYER_ID)
            if player is not None:
                player.xp = 0
            session.execute(
                delete(AnswerAttempt).where(AnswerAttempt.player_id == DEFAULT_PLAYER_ID)
            )
            progress_items = session.scalars(
                select(PlayerLevelProgress).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID
                )
            ).all()
            for progress in progress_items:
                progress.status = "available" if progress.level_id == "cumprimentos" else "locked"
                progress.xp_awarded = 0
                progress.completed_at = None
            session.commit()


game_service = GameService()
