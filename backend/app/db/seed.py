from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.db.models import (
    Achievement,
    Level,
    Player,
    PlayerAchievementProgress,
    PlayerLevelProgress,
    Question,
)


LEVELS = [
    {
        "id": "cumprimentos",
        "order": 1,
        "title": "Cumprimentos",
        "description": "Olá, bom dia, boa tarde e tchau",
        "accent": "violet",
        "category": "Princípios básicos",
        "icon_key": "hands",
        "reward_xp": 250,
        "prerequisite_level_id": None,
        "initial_progress": 80,
    },
    {
        "id": "expressoes",
        "order": 2,
        "title": "Expressões",
        "description": "Expressões faciais e comunicação",
        "accent": "cyan",
        "category": "Princípios básicos",
        "icon_key": "smile",
        "reward_xp": 200,
        "prerequisite_level_id": None,
        "initial_progress": 60,
    },
    {
        "id": "alfabeto",
        "order": 3,
        "title": "Alfabeto A–Z",
        "description": "Introdução ao alfabeto manual",
        "accent": "coral",
        "category": "Alfabeto",
        "icon_key": "letters",
        "reward_xp": 300,
        "prerequisite_level_id": "cumprimentos",
        "initial_progress": 45,
    },
    {
        "id": "soletracao",
        "order": 4,
        "title": "Soletração",
        "description": "Formação de palavras em Libras",
        "accent": "indigo",
        "category": "Alfabeto",
        "icon_key": "spell",
        "reward_xp": 300,
        "prerequisite_level_id": "alfabeto",
        "initial_progress": 30,
    },
    {
        "id": "numeros",
        "order": 5,
        "title": "Números",
        "description": "Sinais numéricos básicos",
        "accent": "teal",
        "category": "Números",
        "icon_key": "numbers",
        "reward_xp": 300,
        "prerequisite_level_id": "alfabeto",
        "initial_progress": 90,
    },
]

ACHIEVEMENTS = [
    (
        "alphabet-master",
        "Mestre do Alfabeto",
        "25/26 letras",
        "trophy",
        "violet",
        25,
        26,
        "letras",
        1,
    ),
    ("hundred-signs", "100 Sinais", "92/100 sinais", "medal", "cyan", 92, 100, "sinais", 2),
    ("daily-streak", "Sequência diária", "15 dias", "badge", "coral", 15, 30, "dias", 3),
    ("perfect-score", "Pontuação Perfeita", "4/5 testes", "star", "amber", 4, 5, "testes", 4),
]

QUESTIONS = [
    ("ola", "video", "/static/media/signs/ola.mp4", "Olá", 1),
    ("bom-dia", "gif", "/static/media/signs/bom-dia.gif", "Bom dia", 2),
    ("boa-tarde", "video", "/static/media/signs/boa-tarde.mp4", "Boa tarde", 3),
    ("tchau", "image", "/static/media/signs/tchau.webp", "Tchau", 4),
]


def seed_database(session: Session) -> None:
    if session.scalar(select(Level.id).limit(1)) is not None:
        session.execute(update(Level).values(order=Level.order + 100))

    for source in LEVELS:
        data = {key: value for key, value in source.items() if key != "initial_progress"}
        level = session.get(Level, data["id"])
        if level is None:
            level = Level(**data)
            session.add(level)
        else:
            for key, value in data.items():
                setattr(level, key, value)
    session.flush()

    options = ["Olá", "Bom dia", "Boa tarde", "Tchau"]
    for question_id, media_type, media_url, correct_answer, position in QUESTIONS:
        question = session.get(Question, question_id)
        if question is None:
            question = Question(id=question_id, level_id="cumprimentos")
            session.add(question)
        question.prompt = "Qual cumprimento está sendo apresentado?"
        question.media_type = media_type
        question.media_url = media_url
        question.options = options
        question.correct_answer = correct_answer
        question.position = position

    player = session.get(Player, 1)
    if player is None:
        player = Player(id=1, display_name="JVitor", xp=7_450, streak_days=15)
        session.add(player)
        session.flush()
    player.display_name = "JVitor"
    player.xp = max(player.xp, 7_450)
    player.streak_days = max(player.streak_days, 15)
    player.level_number = 14
    player.total_play_seconds = 115_200
    player.signs_learned = 248
    player.challenges_completed = 56
    player.achievements_unlocked = 12
    player.achievements_total = 30

    progress_by_level = {
        item.level_id: item
        for item in session.scalars(
            select(PlayerLevelProgress).where(PlayerLevelProgress.player_id == player.id)
        )
    }
    for source in LEVELS:
        progress = progress_by_level.get(source["id"])
        if progress is None:
            progress = PlayerLevelProgress(
                player_id=player.id,
                level_id=source["id"],
                status="available" if source["prerequisite_level_id"] is None else "locked",
                progress_percent=source["initial_progress"],
            )
            session.add(progress)
        elif progress.status == "completed":
            progress.progress_percent = 100
        elif progress.progress_percent == 0:
            progress.progress_percent = source["initial_progress"]

    for (
        achievement_id,
        title,
        description,
        icon,
        accent,
        current,
        target,
        unit,
        order,
    ) in ACHIEVEMENTS:
        achievement = session.get(Achievement, achievement_id)
        if achievement is None:
            achievement = Achievement(id=achievement_id)
            session.add(achievement)
        achievement.title = title
        achievement.description = description
        achievement.icon_key = icon
        achievement.accent = accent
        achievement.target_value = target
        achievement.unit = unit
        achievement.order = order
        session.flush()

        progress = session.scalar(
            select(PlayerAchievementProgress).where(
                PlayerAchievementProgress.player_id == player.id,
                PlayerAchievementProgress.achievement_id == achievement_id,
            )
        )
        if progress is None:
            session.add(
                PlayerAchievementProgress(
                    player_id=player.id,
                    achievement_id=achievement_id,
                    current_value=current,
                )
            )
        else:
            progress.current_value = current

    session.commit()
