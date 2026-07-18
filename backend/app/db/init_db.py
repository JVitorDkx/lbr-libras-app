from app.core.config import settings
from sqlalchemy import inspect, text

from app.db.models import Base
from app.db.seed import seed_database
from app.db.session import SessionLocal, engine


def initialize_database() -> None:
    settings.media_dir.mkdir(parents=True, exist_ok=True)
    if settings.database_url.startswith("sqlite"):
        from pathlib import Path

        Path(settings.database_url.removeprefix("sqlite:///")).parent.mkdir(
            parents=True, exist_ok=True
        )
    _migrate_existing_database()
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        seed_database(session)


def _migrate_existing_database() -> None:
    """Mantém bancos do Bloco 4 compatíveis sem apagar o progresso local."""
    inspector = inspect(engine)
    if "players" not in inspector.get_table_names():
        return

    additions = {
        "players": {
            "level_number": "INTEGER NOT NULL DEFAULT 14",
            "last_played_date": "DATE",
            "total_play_seconds": "INTEGER NOT NULL DEFAULT 115200",
            "signs_learned": "INTEGER NOT NULL DEFAULT 248",
            "challenges_completed": "INTEGER NOT NULL DEFAULT 56",
            "achievements_unlocked": "INTEGER NOT NULL DEFAULT 12",
            "achievements_total": "INTEGER NOT NULL DEFAULT 30",
        },
        "levels": {
            "category": "VARCHAR(80) NOT NULL DEFAULT 'Princípios básicos'",
            "icon_key": "VARCHAR(30) NOT NULL DEFAULT 'hands'",
        },
        "player_level_progress": {
            "progress_percent": "INTEGER NOT NULL DEFAULT 0",
        },
    }
    with engine.begin() as connection:
        for table_name, columns in additions.items():
            existing = {column["name"] for column in inspector.get_columns(table_name)}
            for column_name, definition in columns.items():
                if column_name not in existing:
                    connection.execute(
                        text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}")
                    )
