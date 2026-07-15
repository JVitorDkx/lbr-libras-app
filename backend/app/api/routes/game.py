from fastapi import APIRouter, HTTPException, status

from app.models.game import (
    AnswerRequest,
    AnswerResult,
    CompleteLevelResult,
    LevelSummary,
    PlayerProgress,
    QuestionPublic,
)
from app.services.game_service import game_service


router = APIRouter()


@router.get("/levels", response_model=list[LevelSummary], summary="Listar níveis do jogo")
def list_levels() -> list[LevelSummary]:
    return game_service.list_levels()


@router.get(
    "/levels/{level_id}/questions",
    response_model=list[QuestionPublic],
    summary="Listar perguntas públicas de um nível",
)
def list_level_questions(level_id: str) -> list[QuestionPublic]:
    questions = game_service.list_questions(level_id)
    if questions is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nível não encontrado")
    return questions


@router.post(
    "/levels/{level_id}/questions/{question_id}/answer",
    response_model=AnswerResult,
    summary="Validar uma resposta sem revelar o gabarito",
)
def validate_answer(level_id: str, question_id: str, payload: AnswerRequest) -> AnswerResult:
    result = game_service.validate_answer(level_id, question_id, payload.answer)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pergunta não encontrada")
    return result


@router.get("/progress", response_model=PlayerProgress, summary="Consultar progresso do protótipo")
def get_progress() -> PlayerProgress:
    return game_service.get_progress()


@router.post(
    "/levels/{level_id}/complete",
    response_model=CompleteLevelResult,
    summary="Concluir um nível e conceder XP uma única vez",
)
def complete_level(level_id: str) -> CompleteLevelResult:
    result = game_service.complete_level(level_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nível não encontrado")
    return result
