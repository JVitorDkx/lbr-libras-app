from datetime import datetime, timezone

from sqlalchemy import delete, select

from app.db.models import (
    Achievement,
    AnswerAttempt,
    Level,
    Player,
    PlayerAchievementProgress,
    PlayerLevelProgress,
    Question,
)
from app.db.session import SessionLocal
from app.models.game import (
    AnswerAttemptSummary,
    AnswerResult,
    AchievementSummary,
    CompleteLevelResult,
    LevelStatus,
    LevelSummary,
    PlayerProgress,
    PlayerProfile,
    QuestionPublic,
)
from app.services.gamification import (
    ANSWER_XP,
    level_bounds,
    level_for_xp,
    register_daily_activity,
)


DEFAULT_PLAYER_ID = 1


class GameService:
    def list_levels(self) -> list[LevelSummary]:
        with SessionLocal() as session:
            levels = session.scalars(select(Level).order_by(Level.order)).all()
            progress_by_level = {
                item.level_id: item
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
                        if progress_by_level.get(level.id)
                        and progress_by_level[level.id].status in {"available", "completed"}
                        else LevelStatus.LOCKED
                    ),
                    accent=level.accent,
                    category=level.category,
                    icon_key=level.icon_key,
                    progress_percent=(
                        progress_by_level[level.id].progress_percent
                        if level.id in progress_by_level
                        else 0
                    ),
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
                select(Question).where(Question.level_id == level_id).order_by(Question.position)
            ).all()
            return [
                QuestionPublic(
                    id=question.id,
                    prompt=question.prompt,
                    # O avatar sempre recebe a resposta correta persistida no
                    # SQLite, nunca o enunciado ou uma alternativa selecionada.
                    avatar_phrase=question.correct_answer.strip(),
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
            player = session.get(Player, DEFAULT_PLAYER_ID)
            if player is None:
                return None
            previous_level = player.level_number
            already_rewarded = session.scalar(
                select(AnswerAttempt.id).where(
                    AnswerAttempt.player_id == DEFAULT_PLAYER_ID,
                    AnswerAttempt.question_id == question.id,
                    AnswerAttempt.is_correct.is_(True),
                )
            )
            awarded_xp = ANSWER_XP if is_correct and already_rewarded is None else 0
            if awarded_xp:
                player.xp += awarded_xp
                player.level_number = level_for_xp(player.xp)
            register_daily_activity(player)
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
            level_number, level_start_xp, next_level_xp = level_bounds(player.xp)
            return AnswerResult(
                correct=is_correct,
                feedback=feedback,
                correct_answer=question.correct_answer,
                awarded_xp=awarded_xp,
                xp=player.xp,
                level_number=level_number,
                leveled_up=level_number > previous_level,
                streak_days=player.streak_days,
                level_start_xp=level_start_xp,
                next_level_xp=next_level_xp,
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
            xp = player.xp if player else 0
            level_number, level_start_xp, next_level_xp = level_bounds(xp)
            return PlayerProgress(
                completed_level_ids=sorted(completed),
                xp=xp,
                streak_days=player.streak_days if player else 0,
                level_number=level_number,
                level_start_xp=level_start_xp,
                next_level_xp=next_level_xp,
            )

    def get_profile(self) -> PlayerProfile | None:
        with SessionLocal() as session:
            player = session.get(Player, DEFAULT_PLAYER_ID)
            if player is None:
                return None
            rows = session.execute(
                select(Achievement, PlayerAchievementProgress)
                .join(
                    PlayerAchievementProgress,
                    PlayerAchievementProgress.achievement_id == Achievement.id,
                )
                .where(PlayerAchievementProgress.player_id == DEFAULT_PLAYER_ID)
                .order_by(Achievement.order)
            ).all()
            achievements = [
                AchievementSummary(
                    id=achievement.id,
                    title=achievement.title,
                    description=achievement.description,
                    icon_key=achievement.icon_key,
                    accent=achievement.accent,
                    current_value=progress.current_value,
                    target_value=achievement.target_value,
                    unit=achievement.unit,
                    progress_percent=min(
                        100, round(progress.current_value / achievement.target_value * 100)
                    ),
                )
                for achievement, progress in rows
            ]
            return PlayerProfile(
                display_name=player.display_name,
                level_number=player.level_number,
                xp=player.xp,
                streak_days=player.streak_days,
                total_play_seconds=player.total_play_seconds,
                signs_learned=player.signs_learned,
                challenges_completed=player.challenges_completed,
                achievements_unlocked=player.achievements_unlocked,
                achievements_total=player.achievements_total,
                learning_progress_percent=min(100, round(player.signs_learned / 300 * 100)),
                achievements=achievements,
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
            previous_xp = player.xp
            previous_level = player.level_number
            if progress.status != "completed":
                awarded_xp = level.reward_xp
                progress.status = "completed"
                progress.progress_percent = 100
                progress.xp_awarded = awarded_xp
                progress.completed_at = datetime.now(timezone.utc)
                player.xp += awarded_xp

                next_progress_items = session.scalars(
                    select(PlayerLevelProgress)
                    .join(Level, PlayerLevelProgress.level_id == Level.id)
                    .where(
                        PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                        Level.prerequisite_level_id == level_id,
                    )
                ).all()
                for next_progress in next_progress_items:
                    if next_progress.status == "locked":
                        next_progress.status = "available"

            register_daily_activity(player)
            player.level_number = level_for_xp(player.xp)
            session.commit()

            completed = session.scalars(
                select(PlayerLevelProgress.level_id).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                    PlayerLevelProgress.status == "completed",
                )
            ).all()
            level_number, level_start_xp, next_level_xp = level_bounds(player.xp)
            return CompleteLevelResult(
                completed_level_ids=sorted(completed),
                xp=player.xp,
                streak_days=player.streak_days,
                level_number=level_number,
                level_start_xp=level_start_xp,
                next_level_xp=next_level_xp,
                awarded_xp=awarded_xp,
                previous_xp=previous_xp,
                previous_level=previous_level,
                leveled_up=level_number > previous_level,
            )

    def reset_progress(self) -> None:
        with SessionLocal() as session:
            player = session.get(Player, DEFAULT_PLAYER_ID)
            if player is not None:
                player.xp = 0
                player.streak_days = 0
                player.level_number = 1
                player.last_played_date = None
                player.total_play_seconds = 0
                player.signs_learned = 0
                player.challenges_completed = 0
                player.achievements_unlocked = 0
            session.execute(
                delete(AnswerAttempt).where(AnswerAttempt.player_id == DEFAULT_PLAYER_ID)
            )
            progress_items = session.scalars(
                select(PlayerLevelProgress).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID
                )
            ).all()
            for progress in progress_items:
                level = session.get(Level, progress.level_id)
                progress.status = (
                    "available"
                    if level is not None and level.prerequisite_level_id is None
                    else "locked"
                )
                progress.xp_awarded = 0
                progress.progress_percent = 0
                progress.completed_at = None

            achievement_items = session.scalars(
                select(PlayerAchievementProgress).where(
                    PlayerAchievementProgress.player_id == DEFAULT_PLAYER_ID
                )
            ).all()
            for achievement_progress in achievement_items:
                achievement_progress.current_value = 0
                achievement_progress.unlocked_at = None
            session.commit()

    def reset_and_get_progress(self) -> PlayerProgress:
        self.reset_progress()
        return self.get_progress()


game_service = GameService()
