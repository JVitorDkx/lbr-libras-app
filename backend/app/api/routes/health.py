from fastapi import APIRouter


router = APIRouter()


@router.get("/health", summary="Verificar disponibilidade da API")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "lbrlibras-api"}
