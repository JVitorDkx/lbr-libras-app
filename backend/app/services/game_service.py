from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

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
    LearningAnalytics,
    LevelStatus,
    LevelSummary,
    MasteryStatus,
    ModulePerformance,
    PlayerProgress,
    PlayerProfile,
    QuestionPublic,
)
from app.services.gamification import ANSWER_XP, level_bounds, level_for_xp, local_today


DEFAULT_PLAYER_ID = 1


class LevelNotFoundError(Exception):
    pass


class LevelLockedError(Exception):
    pass


class LevelIncompleteError(Exception):
    pass


class QuestionNotFoundError(Exception):
    pass


@dataclass(frozen=True)
class PlayerMetrics:
    xp: int
    streak_days: int
    signs_learned: int
    lessons_completed: int
    best_combo: int


def _local_activity_date(timestamp: datetime) -> date:
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    return timestamp.astimezone().date()


def _current_streak(activity_dates: set[date], today: date) -> int:
    if not activity_dates:
        return 0

    latest = max(activity_dates)
    if latest < today - timedelta(days=1):
        return 0

    streak = 1
    cursor = latest - timedelta(days=1)
    while cursor in activity_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


class GameService:
    def _player(self, session: Session) -> Player:
        player = session.get(Player, DEFAULT_PLAYER_ID)
        if player is None:
            raise RuntimeError("Jogador padrão não foi inicializado")
        return player

    def _level_access(
        self,
        session: Session,
        level_id: str,
    ) -> tuple[Level, PlayerLevelProgress]:
        level = session.get(Level, level_id)
        if level is None:
            raise LevelNotFoundError

        progress = session.scalar(
            select(PlayerLevelProgress).where(
                PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                PlayerLevelProgress.level_id == level_id,
            )
        )
        if progress is None or progress.status == "locked":
            raise LevelLockedError
        return level, progress

    def _attempt_rows(self, session: Session) -> list[tuple[AnswerAttempt, str]]:
        return list(
            session.execute(
                select(AnswerAttempt, Question.level_id)
                .join(Question, AnswerAttempt.question_id == Question.id)
                .where(AnswerAttempt.player_id == DEFAULT_PLAYER_ID)
                .order_by(AnswerAttempt.answered_at, AnswerAttempt.id)
            ).all()
        )

    def _best_combo(self, rows: list[tuple[AnswerAttempt, str]]) -> int:
        current_combo = 0
        best_combo = 0
        current_level_id: str | None = None
        seen_questions: set[str] = set()

        for attempt, level_id in rows:
            if level_id != current_level_id or attempt.question_id in seen_questions:
                current_combo = 0
                current_level_id = level_id
                seen_questions = set()

            seen_questions.add(attempt.question_id)
            current_combo = current_combo + 1 if attempt.is_correct else 0
            best_combo = max(best_combo, current_combo)

        return best_combo

    def _recalculate_player_metrics(self, session: Session, player: Player) -> PlayerMetrics:
        rows = self._attempt_rows(session)
        correct_question_ids = {
            attempt.question_id for attempt, _ in rows if attempt.is_correct
        }
        completed_progress = list(
            session.scalars(
                select(PlayerLevelProgress).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                    PlayerLevelProgress.status == "completed",
                )
            ).all()
        )

        answer_xp = len(correct_question_ids) * ANSWER_XP
        completion_xp = sum(item.xp_awarded for item in completed_progress)
        xp = answer_xp + completion_xp
        activity_dates = {
            _local_activity_date(attempt.answered_at) for attempt, _ in rows
        }
        streak_days = _current_streak(activity_dates, local_today())
        best_combo = self._best_combo(rows)

        correct_by_level: dict[str, set[str]] = defaultdict(set)
        wrong_levels: set[str] = set()
        for attempt, level_id in rows:
            if attempt.is_correct:
                correct_by_level[level_id].add(attempt.question_id)
            else:
                wrong_levels.add(level_id)

        progress_items = list(
            session.scalars(
                select(PlayerLevelProgress).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID
                )
            ).all()
        )
        question_counts = dict(
            session.execute(
                select(Question.level_id, func.count(Question.id)).group_by(Question.level_id)
            ).all()
        )
        for progress in progress_items:
            if progress.status == "completed":
                progress.progress_percent = 100
                continue
            total = question_counts.get(progress.level_id, 0)
            progress.progress_percent = (
                round(len(correct_by_level[progress.level_id]) / total * 100)
                if total
                else 0
            )

        completed_level_ids = {item.level_id for item in completed_progress}
        perfect_lessons = sum(
            1 for level_id in completed_level_ids if level_id not in wrong_levels
        )
        alphabet_letters = len(correct_by_level["alfabeto"])
        achievement_values = {
            "alphabet-master": alphabet_letters,
            "hundred-signs": len(correct_question_ids),
            "daily-streak": streak_days,
            "perfect-score": perfect_lessons,
        }
        achievement_progress = list(
            session.scalars(
                select(PlayerAchievementProgress).where(
                    PlayerAchievementProgress.player_id == DEFAULT_PLAYER_ID
                )
            ).all()
        )
        unlocked_count = 0
        for item in achievement_progress:
            item.current_value = achievement_values.get(item.achievement_id, 0)
            achievement = session.get(Achievement, item.achievement_id)
            if achievement is not None and item.current_value >= achievement.target_value:
                unlocked_count += 1
                item.unlocked_at = item.unlocked_at or datetime.now(timezone.utc)
            else:
                item.unlocked_at = None

        player.xp = xp
        player.level_number = level_for_xp(xp)
        player.streak_days = streak_days
        player.last_played_date = max(activity_dates) if activity_dates else None
        player.signs_learned = len(correct_question_ids)
        player.challenges_completed = len(completed_progress)
        player.achievements_unlocked = unlocked_count
        player.achievements_total = session.scalar(select(func.count(Achievement.id))) or 0

        return PlayerMetrics(
            xp=xp,
            streak_days=streak_days,
            signs_learned=len(correct_question_ids),
            lessons_completed=len(completed_progress),
            best_combo=best_combo,
        )

    def list_levels(self) -> list[LevelSummary]:
        with SessionLocal() as session:
            player = self._player(session)
            self._recalculate_player_metrics(session, player)
            levels = session.scalars(select(Level).order_by(Level.order)).all()
            progress_by_level = {
                item.level_id: item
                for item in session.scalars(
                    select(PlayerLevelProgress).where(
                        PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID
                    )
                )
            }
            result = [
                LevelSummary(
                    id=level.id,
                    order=level.order,
                    title=level.title,
                    description=level.description,
                    status=LevelStatus(
                        progress_by_level.get(level.id).status
                        if progress_by_level.get(level.id)
                        else "locked"
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
            session.commit()
            return result

    def list_questions(self, level_id: str) -> list[QuestionPublic]:
        with SessionLocal() as session:
            self._level_access(session, level_id)
            records = session.scalars(
                select(Question).where(Question.level_id == level_id).order_by(Question.position)
            ).all()
            return [
                QuestionPublic(
                    id=question.id,
                    prompt=question.prompt,
                    avatar_phrase=question.correct_answer.strip(),
                    options=question.options,
                )
                for question in records
            ]

    def validate_answer(
        self,
        level_id: str,
        question_id: str,
        selected_answer: str,
    ) -> AnswerResult:
        with SessionLocal() as session:
            _, progress = self._level_access(session, level_id)
            question = session.scalar(
                select(Question).where(
                    Question.id == question_id,
                    Question.level_id == level_id,
                )
            )
            if question is None:
                raise QuestionNotFoundError

            player = self._player(session)
            self._recalculate_player_metrics(session, player)
            previous_level = player.level_number
            already_rewarded = session.scalar(
                select(AnswerAttempt.id).where(
                    AnswerAttempt.player_id == DEFAULT_PLAYER_ID,
                    AnswerAttempt.question_id == question.id,
                    AnswerAttempt.is_correct.is_(True),
                )
            )
            is_correct = selected_answer.casefold().strip() == question.correct_answer.casefold()
            awarded_xp = ANSWER_XP if is_correct and already_rewarded is None else 0
            session.add(
                AnswerAttempt(
                    player_id=DEFAULT_PLAYER_ID,
                    question_id=question.id,
                    selected_answer=selected_answer.strip(),
                    is_correct=is_correct,
                )
            )
            session.flush()
            metrics = self._recalculate_player_metrics(session, player)
            session.flush()
            session.refresh(progress)
            session.commit()

            feedback = (
                "Parabéns! Você identificou o sinal corretamente."
                if is_correct
                else "Quase! Observe o sinal novamente e tente outra resposta."
            )
            level_number, level_start_xp, next_level_xp = level_bounds(metrics.xp)
            return AnswerResult(
                correct=is_correct,
                feedback=feedback,
                correct_answer=question.correct_answer,
                awarded_xp=awarded_xp,
                xp=metrics.xp,
                level_number=level_number,
                leveled_up=level_number > previous_level,
                streak_days=metrics.streak_days,
                level_start_xp=level_start_xp,
                next_level_xp=next_level_xp,
            )

    def get_progress(self) -> PlayerProgress:
        with SessionLocal() as session:
            player = self._player(session)
            metrics = self._recalculate_player_metrics(session, player)
            completed = session.scalars(
                select(PlayerLevelProgress.level_id).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                    PlayerLevelProgress.status == "completed",
                )
            ).all()
            level_number, level_start_xp, next_level_xp = level_bounds(metrics.xp)
            session.commit()
            return PlayerProgress(
                completed_level_ids=sorted(completed),
                xp=metrics.xp,
                streak_days=metrics.streak_days,
                level_number=level_number,
                level_start_xp=level_start_xp,
                next_level_xp=next_level_xp,
            )

    def get_profile(self) -> PlayerProfile:
        with SessionLocal() as session:
            player = self._player(session)
            metrics = self._recalculate_player_metrics(session, player)
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
                    description=(
                        f"{progress.current_value}/{achievement.target_value} "
                        f"{achievement.unit}"
                    ),
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
            total_questions = session.scalar(select(func.count(Question.id))) or 0
            profile = PlayerProfile(
                display_name=player.display_name,
                level_number=player.level_number,
                xp=metrics.xp,
                streak_days=metrics.streak_days,
                total_play_seconds=player.total_play_seconds,
                signs_learned=metrics.signs_learned,
                challenges_completed=metrics.lessons_completed,
                lessons_completed=metrics.lessons_completed,
                best_combo=metrics.best_combo,
                achievements_unlocked=player.achievements_unlocked,
                achievements_total=player.achievements_total,
                learning_progress_percent=(
                    min(100, round(metrics.signs_learned / total_questions * 100))
                    if total_questions
                    else 0
                ),
                achievements=achievements,
            )
            session.commit()
            return profile

    def get_learning_analytics(self) -> LearningAnalytics:
        with SessionLocal() as session:
            player = self._player(session)
            self._recalculate_player_metrics(session, player)
            levels = session.scalars(select(Level).order_by(Level.order)).all()
            progress_by_level = {
                item.level_id: item
                for item in session.scalars(
                    select(PlayerLevelProgress).where(
                        PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID
                    )
                )
            }
            rows = self._attempt_rows(session)
            attempts_by_level: dict[str, list[AnswerAttempt]] = defaultdict(list)
            for attempt, level_id in rows:
                attempts_by_level[level_id].append(attempt)

            modules: list[ModulePerformance] = []
            for level in levels:
                total_signs = len(level.questions)
                if total_signs == 0:
                    continue

                attempts = attempts_by_level[level.id]
                correct_attempts = sum(1 for attempt in attempts if attempt.is_correct)
                signs_mastered = len(
                    {attempt.question_id for attempt in attempts if attempt.is_correct}
                )
                accuracy_percent = (
                    round(correct_attempts / len(attempts) * 100) if attempts else 0
                )
                progress = progress_by_level.get(level.id)
                progress_percent = progress.progress_percent if progress is not None else 0
                if not attempts:
                    mastery_status = MasteryStatus.NOT_STARTED
                elif progress_percent == 100 and accuracy_percent >= 80:
                    mastery_status = MasteryStatus.EXCELLENT
                elif accuracy_percent >= 60:
                    mastery_status = MasteryStatus.GOOD_PROGRESS
                else:
                    mastery_status = MasteryStatus.NEEDS_PRACTICE

                modules.append(
                    ModulePerformance(
                        level_id=level.id,
                        title=level.title,
                        category=level.category,
                        level_status=LevelStatus(progress.status if progress else "locked"),
                        attempts=len(attempts),
                        correct_attempts=correct_attempts,
                        accuracy_percent=accuracy_percent,
                        signs_mastered=signs_mastered,
                        total_signs=total_signs,
                        progress_percent=progress_percent,
                        mastery_status=mastery_status,
                    )
                )

            total_attempts = len(rows)
            total_correct = sum(1 for attempt, _ in rows if attempt.is_correct)
            session.commit()
            return LearningAnalytics(
                total_attempts=total_attempts,
                correct_attempts=total_correct,
                overall_accuracy_percent=(
                    round(total_correct / total_attempts * 100) if total_attempts else 0
                ),
                modules=modules,
            )

    def list_answer_attempts(self) -> list[AnswerAttemptSummary]:
        with SessionLocal() as session:
            attempts = session.scalars(
                select(AnswerAttempt)
                .where(AnswerAttempt.player_id == DEFAULT_PLAYER_ID)
                .order_by(AnswerAttempt.answered_at, AnswerAttempt.id)
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

    def complete_level(self, level_id: str) -> CompleteLevelResult:
        with SessionLocal() as session:
            level, progress = self._level_access(session, level_id)
            player = self._player(session)
            question_ids = set(
                session.scalars(
                    select(Question.id).where(Question.level_id == level_id)
                ).all()
            )
            correct_question_ids = set(
                session.scalars(
                    select(AnswerAttempt.question_id)
                    .join(Question, AnswerAttempt.question_id == Question.id)
                    .where(
                        AnswerAttempt.player_id == DEFAULT_PLAYER_ID,
                        Question.level_id == level_id,
                        AnswerAttempt.is_correct.is_(True),
                    )
                ).all()
            )
            if not question_ids or not question_ids.issubset(correct_question_ids):
                raise LevelIncompleteError

            metrics_before = self._recalculate_player_metrics(session, player)
            previous_xp = metrics_before.xp
            previous_level = player.level_number
            awarded_xp = 0
            if progress.status != "completed":
                awarded_xp = level.reward_xp
                progress.status = "completed"
                progress.progress_percent = 100
                progress.xp_awarded = awarded_xp
                progress.completed_at = datetime.now(timezone.utc)

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

            session.flush()
            metrics = self._recalculate_player_metrics(session, player)
            completed = session.scalars(
                select(PlayerLevelProgress.level_id).where(
                    PlayerLevelProgress.player_id == DEFAULT_PLAYER_ID,
                    PlayerLevelProgress.status == "completed",
                )
            ).all()
            level_number, level_start_xp, next_level_xp = level_bounds(metrics.xp)
            session.commit()
            return CompleteLevelResult(
                completed_level_ids=sorted(completed),
                xp=metrics.xp,
                streak_days=metrics.streak_days,
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
