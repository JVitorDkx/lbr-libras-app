from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.db.init_db import initialize_database


initialize_database()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="API do protótipo gamificado para ensino introdutório de Libras.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)
app.mount("/static/media", StaticFiles(directory=settings.media_dir), name="media")
