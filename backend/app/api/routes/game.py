from fastapi import APIRouter, HTTPException, status

from app.models.game import (
    AnswerAttemptSummary,
    AnswerRequest,
    AnswerResult,
    CompleteLevelResult,
    LearningAnalytics,
    LevelSummary,
    PlayerProfile,
    PlayerProgress,
    QuestionPublic,
)
from app.services.game_service import (
    LevelIncompleteError,
    LevelLockedError,
    LevelNotFoundError,
    QuestionNotFoundError,
    game_service,
)


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
    try:
        return game_service.list_questions(level_id)
    except LevelNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nível não encontrado")
    except LevelLockedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conclua o módulo anterior antes de acessar este nível",
        )


@router.post(
    "/levels/{level_id}/questions/{question_id}/answer",
    response_model=AnswerResult,
    summary="Validar uma resposta sem revelar o gabarito",
)
def validate_answer(level_id: str, question_id: str, payload: AnswerRequest) -> AnswerResult:
    try:
        return game_service.validate_answer(level_id, question_id, payload.answer)
    except LevelNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nível não encontrado")
    except LevelLockedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este nível ainda está bloqueado",
        )
    except QuestionNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pergunta não encontrada")


@router.get("/progress", response_model=PlayerProgress, summary="Consultar progresso do protótipo")
def get_progress() -> PlayerProgress:
    return game_service.get_progress()


@router.post(
    "/progress/reset",
    response_model=PlayerProgress,
    summary="Resetar todo o progresso do jogador",
)
def reset_progress() -> PlayerProgress:
    return game_service.reset_and_get_progress()


@router.get("/profile", response_model=PlayerProfile, summary="Consultar perfil e conquistas")
def get_profile() -> PlayerProfile:
    return game_service.get_profile()


@router.get(
    "/analytics",
    response_model=LearningAnalytics,
    summary="Consultar desempenho pedagógico por módulo",
)
def get_learning_analytics() -> LearningAnalytics:
    return game_service.get_learning_analytics()


@router.get(
    "/progress/answers",
    response_model=list[AnswerAttemptSummary],
    summary="Consultar histórico de respostas do protótipo",
)
def get_answer_attempts() -> list[AnswerAttemptSummary]:
    return game_service.list_answer_attempts()


@router.post(
    "/levels/{level_id}/complete",
    response_model=CompleteLevelResult,
    summary="Concluir um nível e conceder XP uma única vez",
)
def complete_level(level_id: str) -> CompleteLevelResult:
    try:
        return game_service.complete_level(level_id)
    except LevelNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nível não encontrado")
    except LevelLockedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este nível ainda está bloqueado",
        )
    except LevelIncompleteError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Responda corretamente todas as questões antes de concluir o nível",
        )
