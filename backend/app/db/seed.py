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
from app.services.gamification import level_for_xp


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
        "title": "Alfabeto A–F",
        "description": "Primeiras seis letras do alfabeto manual",
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
        "description": "Números básicos de zero a cinco",
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
    {
        "id": "ola",
        "level_id": "cumprimentos",
        "prompt": "Qual cumprimento está sendo apresentado?",
        "correct_answer": "Olá",
        "options": ["Olá", "Bom dia", "Boa tarde", "Tchau"],
        "position": 1,
    },
    {
        "id": "bom-dia",
        "level_id": "cumprimentos",
        "prompt": "Qual cumprimento está sendo apresentado?",
        "correct_answer": "Bom dia",
        "options": ["Tchau", "Bom dia", "Olá", "Boa tarde"],
        "position": 2,
    },
    {
        "id": "boa-tarde",
        "level_id": "cumprimentos",
        "prompt": "Qual cumprimento está sendo apresentado?",
        "correct_answer": "Boa tarde",
        "options": ["Bom dia", "Tchau", "Boa tarde", "Olá"],
        "position": 3,
    },
    {
        "id": "tchau",
        "level_id": "cumprimentos",
        "prompt": "Qual cumprimento está sendo apresentado?",
        "correct_answer": "Tchau",
        "options": ["Boa tarde", "Olá", "Bom dia", "Tchau"],
        "position": 4,
    },
    {
        "id": "alfabeto-a",
        "level_id": "alfabeto",
        "prompt": "Qual letra está sendo apresentada pelo avatar?",
        "correct_answer": "Letra A",
        "options": ["Letra A", "Letra B", "Letra C", "Letra D"],
        "position": 1,
    },
    {
        "id": "alfabeto-b",
        "level_id": "alfabeto",
        "prompt": "Qual letra está sendo apresentada pelo avatar?",
        "correct_answer": "Letra B",
        "options": ["Letra D", "Letra B", "Letra F", "Letra A"],
        "position": 2,
    },
    {
        "id": "alfabeto-c",
        "level_id": "alfabeto",
        "prompt": "Qual letra está sendo apresentada pelo avatar?",
        "correct_answer": "Letra C",
        "options": ["Letra E", "Letra A", "Letra C", "Letra F"],
        "position": 3,
    },
    {
        "id": "alfabeto-d",
        "level_id": "alfabeto",
        "prompt": "Qual letra está sendo apresentada pelo avatar?",
        "correct_answer": "Letra D",
        "options": ["Letra B", "Letra D", "Letra A", "Letra E"],
        "position": 4,
    },
    {
        "id": "alfabeto-e",
        "level_id": "alfabeto",
        "prompt": "Qual letra está sendo apresentada pelo avatar?",
        "correct_answer": "Letra E",
        "options": ["Letra C", "Letra F", "Letra E", "Letra B"],
        "position": 5,
    },
    {
        "id": "alfabeto-f",
        "level_id": "alfabeto",
        "prompt": "Qual letra está sendo apresentada pelo avatar?",
        "correct_answer": "Letra F",
        "options": ["Letra A", "Letra E", "Letra C", "Letra F"],
        "position": 6,
    },
    {
        "id": "numero-zero",
        "level_id": "numeros",
        "prompt": "Qual número está sendo apresentado pelo avatar?",
        "correct_answer": "Zero",
        "options": ["Zero", "Um", "Dois", "Três"],
        "position": 1,
    },
    {
        "id": "numero-um",
        "level_id": "numeros",
        "prompt": "Qual número está sendo apresentado pelo avatar?",
        "correct_answer": "Um",
        "options": ["Quatro", "Um", "Cinco", "Zero"],
        "position": 2,
    },
    {
        "id": "numero-dois",
        "level_id": "numeros",
        "prompt": "Qual número está sendo apresentado pelo avatar?",
        "correct_answer": "Dois",
        "options": ["Cinco", "Zero", "Dois", "Quatro"],
        "position": 3,
    },
    {
        "id": "numero-tres",
        "level_id": "numeros",
        "prompt": "Qual número está sendo apresentado pelo avatar?",
        "correct_answer": "Três",
        "options": ["Um", "Três", "Zero", "Cinco"],
        "position": 4,
    },
    {
        "id": "numero-quatro",
        "level_id": "numeros",
        "prompt": "Qual número está sendo apresentado pelo avatar?",
        "correct_answer": "Quatro",
        "options": ["Dois", "Cinco", "Quatro", "Um"],
        "position": 5,
    },
    {
        "id": "numero-cinco",
        "level_id": "numeros",
        "prompt": "Qual número está sendo apresentado pelo avatar?",
        "correct_answer": "Cinco",
        "options": ["Zero", "Três", "Dois", "Cinco"],
        "position": 6,
    },
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

    for source in QUESTIONS:
        question = session.get(Question, source["id"])
        if question is None:
            question = Question(id=source["id"], level_id=source["level_id"])
            session.add(question)
        question.level_id = source["level_id"]
        question.prompt = source["prompt"]
        question.media_type = "vlibras"
        question.media_url = ""
        question.options = source["options"]
        question.correct_answer = source["correct_answer"]
        question.position = source["position"]

    player = session.get(Player, 1)
    if player is None:
        player = Player(
            id=1,
            display_name="JVitor",
            xp=7_450,
            streak_days=15,
            level_number=14,
            total_play_seconds=115_200,
            signs_learned=248,
            challenges_completed=56,
            achievements_unlocked=12,
            achievements_total=30,
        )
        session.add(player)
        session.flush()
    player.level_number = level_for_xp(player.xp)

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
    session.commit()
