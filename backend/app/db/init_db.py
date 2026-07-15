from app.core.config import settings
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
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        seed_database(session)
