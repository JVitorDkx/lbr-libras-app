from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Level, Player, PlayerLevelProgress, Question


LEVELS = [
    {
        "id": "cumprimentos",
        "order": 1,
        "title": "Cumprimentos",
        "description": "Olá, bom dia, boa tarde e tchau",
        "accent": "violet",
        "reward_xp": 250,
        "prerequisite_level_id": None,
    },
    {
        "id": "alfabeto",
        "order": 2,
        "title": "Alfabeto",
        "description": "Introdução ao alfabeto manual",
        "accent": "cyan",
        "reward_xp": 300,
        "prerequisite_level_id": "cumprimentos",
    },
    {
        "id": "numeros",
        "order": 3,
        "title": "Números",
        "description": "Sinais numéricos básicos",
        "accent": "amber",
        "reward_xp": 300,
        "prerequisite_level_id": "alfabeto",
    },
]

QUESTIONS = [
    ("ola", "video", "/static/media/signs/ola.mp4", "Olá", 1),
    ("bom-dia", "gif", "/static/media/signs/bom-dia.gif", "Bom dia", 2),
    ("boa-tarde", "video", "/static/media/signs/boa-tarde.mp4", "Boa tarde", 3),
    ("tchau", "image", "/static/media/signs/tchau.webp", "Tchau", 4),
]


def seed_database(session: Session) -> None:
    for data in LEVELS:
        if session.get(Level, data["id"]) is None:
            session.add(Level(**data))
    session.flush()

    options = ["Olá", "Bom dia", "Boa tarde", "Tchau"]
    for question_id, media_type, media_url, correct_answer, position in QUESTIONS:
        if session.get(Question, question_id) is None:
            session.add(
                Question(
                    id=question_id,
                    level_id="cumprimentos",
                    prompt="Qual cumprimento está sendo apresentado?",
                    media_type=media_type,
                    media_url=media_url,
                    options=options,
                    correct_answer=correct_answer,
                    position=position,
                )
            )

    player = session.get(Player, 1)
    if player is None:
        player = Player(id=1, display_name="João", xp=0, streak_days=3)
        session.add(player)
        session.flush()

    existing_progress = {
        item.level_id
        for item in session.scalars(
            select(PlayerLevelProgress).where(PlayerLevelProgress.player_id == player.id)
        )
    }
    for level in LEVELS:
        if level["id"] not in existing_progress:
            session.add(
                PlayerLevelProgress(
                    player_id=player.id,
                    level_id=level["id"],
                    status="available" if level["prerequisite_level_id"] is None else "locked",
                )
            )

    session.commit()
