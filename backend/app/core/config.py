from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "LBRLibras API"
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    database_url: str = f"sqlite:///{(BACKEND_DIR / 'data' / 'lbrlibras.db').as_posix()}"
    media_dir: Path = BACKEND_DIR / "static" / "media"

    model_config = SettingsConfigDict(env_prefix="LBRLIBRAS_", env_file=".env")


settings = Settings()
