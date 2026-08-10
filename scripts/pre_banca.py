"""Verificacao reproduzivel do LBRLibras antes da apresentacao do TCC."""

from __future__ import annotations

import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
PLAYABLE_LEVELS = {"cumprimentos": 4, "alfabeto": 6, "numeros": 6}


class VerificationError(RuntimeError):
    """Indica que uma etapa obrigatoria da pre-banca falhou."""


def announce(message: str) -> None:
    print(f"\n[pre-banca] {message}", flush=True)


def run(command: list[str], cwd: Path, env: dict[str, str]) -> None:
    announce("Executando: " + " ".join(command))
    result = subprocess.run(command, cwd=cwd, env=env, check=False)
    if result.returncode != 0:
        raise VerificationError(
            f"O comando falhou com codigo {result.returncode}: {' '.join(command)}"
        )


def find_pnpm() -> str:
    executable = shutil.which("pnpm") or shutil.which("pnpm.cmd")
    if not executable:
        raise VerificationError("pnpm nao foi encontrado no PATH.")
    return executable


def reserve_local_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
        server.bind(("127.0.0.1", 0))
        return int(server.getsockname()[1])


def request_json(url: str) -> Any:
    request = Request(url, headers={"Accept": "application/json"})
    with urlopen(request, timeout=4) as response:
        if response.status != 200:
            raise VerificationError(f"Endpoint {url} retornou HTTP {response.status}.")
        return json.loads(response.read().decode("utf-8"))


def request_status(url: str) -> int:
    try:
        with urlopen(Request(url), timeout=4) as response:
            return response.status
    except HTTPError as error:
        return error.code


def wait_for_api(base_url: str, process: subprocess.Popen[bytes]) -> None:
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise VerificationError("A API encerrou durante a inicializacao.")
        try:
            health = request_json(f"{base_url}/health")
            if health.get("status") == "ok":
                return
        except (OSError, URLError, VerificationError, json.JSONDecodeError):
            time.sleep(0.25)
    raise VerificationError("A API nao respondeu ao health check em 20 segundos.")


def verify_clean_seed(base_url: str) -> None:
    announce("Validando seed limpo e contratos publicos da API")
    progress = request_json(f"{base_url}/game/progress")
    profile = request_json(f"{base_url}/game/profile")
    levels = request_json(f"{base_url}/game/levels")
    analytics = request_json(f"{base_url}/game/analytics")
    greetings = request_json(f"{base_url}/game/levels/cumprimentos/questions")

    expected_progress = {
        "completed_level_ids": [],
        "xp": 0,
        "streak_days": 0,
        "level_number": 1,
        "level_start_xp": 0,
        "next_level_xp": 100,
    }
    if progress != expected_progress:
        raise VerificationError(f"O progresso inicial nao esta zerado: {progress}")

    if any(
        profile[field] != 0
        for field in ("xp", "signs_learned", "lessons_completed", "best_combo")
    ):
        raise VerificationError("O perfil inicial contem metricas de jogo nao zeradas.")

    levels_by_id = {level["id"]: level for level in levels}
    for level_id, question_count in PLAYABLE_LEVELS.items():
        level = levels_by_id.get(level_id)
        if not level or level["question_count"] != question_count:
            raise VerificationError(
                f"O modulo {level_id} nao possui as {question_count} atividades esperadas."
            )

    if levels_by_id["cumprimentos"]["status"] != "available":
        raise VerificationError("Cumprimentos deveria iniciar disponivel.")
    if any(
        levels_by_id[level_id]["status"] != "locked"
        for level_id in ("alfabeto", "numeros")
    ):
        raise VerificationError("Alfabeto e Numeros deveriam iniciar bloqueados.")
    if len(greetings) != PLAYABLE_LEVELS["cumprimentos"]:
        raise VerificationError("O endpoint de Cumprimentos retornou quantidade incorreta.")
    if request_status(f"{base_url}/game/levels/alfabeto/questions") != 403:
        raise VerificationError("A protecao de acesso ao Alfabeto nao retornou HTTP 403.")
    if analytics["total_attempts"] != 0 or analytics["overall_accuracy_percent"] != 0:
        raise VerificationError("O relatorio inicial deveria estar sem tentativas.")
    if any(module["mastery_status"] != "not_started" for module in analytics["modules"]):
        raise VerificationError("Todos os modulos deveriam iniciar como nao praticados.")


def verify_api_with_temporary_database(database_path: Path) -> None:
    port = reserve_local_port()
    base_url = f"http://127.0.0.1:{port}/api"
    env = os.environ.copy()
    env["LBRLIBRAS_DATABASE_URL"] = f"sqlite:///{database_path.as_posix()}"
    command = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        str(port),
    ]
    announce(f"Inicializando API isolada em {base_url}")
    process = subprocess.Popen(
        command,
        cwd=BACKEND,
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        wait_for_api(base_url, process)
        verify_clean_seed(base_url)
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
        # O Windows pode manter o arquivo SQLite bloqueado por alguns
        # milissegundos depois do encerramento do processo do Uvicorn.
        time.sleep(0.25)


def main() -> int:
    announce("Iniciando verificacao completa do LBRLibras")
    pnpm = find_pnpm()

    with tempfile.TemporaryDirectory(
        prefix="lbrlibras-pre-banca-",
        ignore_cleanup_errors=True,
    ) as temp_dir:
        temporary_root = Path(temp_dir)
        test_env = os.environ.copy()
        test_env["LBRLIBRAS_DATABASE_URL"] = (
            f"sqlite:///{(temporary_root / 'tests.db').as_posix()}"
        )

        run([sys.executable, "-m", "pytest", "-q"], BACKEND, test_env)
        run([sys.executable, "-m", "ruff", "check", "."], BACKEND, test_env)
        run([pnpm, "test"], FRONTEND, os.environ.copy())
        run([pnpm, "run", "typecheck"], FRONTEND, os.environ.copy())
        run([pnpm, "run", "build"], FRONTEND, os.environ.copy())
        verify_api_with_temporary_database(temporary_root / "seed-check.db")

    announce("APROVADO: testes, build, seed e endpoints estao integros.")
    print("[pre-banca] O banco local real nao foi alterado.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (VerificationError, OSError, URLError) as error:
        print(f"\n[pre-banca] REPROVADO: {error}", file=sys.stderr)
        raise SystemExit(1) from error
