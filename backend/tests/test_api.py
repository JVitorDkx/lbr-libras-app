import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.game_service import GameService, game_service


client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_player_progress() -> None:
    game_service.reset_progress()


def test_health_check() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_levels_begin_with_greetings_available() -> None:
    response = client.get("/api/game/levels")

    assert response.status_code == 200
    levels = response.json()
    by_id = {level["id"]: level for level in levels}
    assert levels[0]["id"] == "cumprimentos"
    assert by_id["cumprimentos"]["status"] == "available"
    assert by_id["expressoes"]["status"] == "available"
    assert by_id["alfabeto"]["status"] == "locked"
    assert by_id["cumprimentos"]["category"] == "Princípios básicos"
    assert by_id["cumprimentos"]["progress_percent"] == 0
    assert by_id["alfabeto"]["prerequisite_level_id"] == "cumprimentos"
    assert by_id["numeros"]["prerequisite_level_id"] == "alfabeto"


def test_answer_validation_does_not_expose_answer_in_question() -> None:
    questions_response = client.get("/api/game/levels/cumprimentos/questions")
    question = questions_response.json()[0]

    assert "correct_answer" not in question
    assert question["avatar_phrase"] == "Olá"

    answer_response = client.post(
        "/api/game/levels/cumprimentos/questions/ola/answer",
        json={"answer": "Olá"},
    )
    assert answer_response.status_code == 200
    assert answer_response.json()["correct"] is True
    assert answer_response.json()["correct_answer"] == "Olá"


def test_greetings_level_has_four_questions() -> None:
    response = client.get("/api/game/levels/cumprimentos/questions")

    assert response.status_code == 200
    questions = response.json()
    assert [question["id"] for question in questions] == [
        "ola",
        "bom-dia",
        "boa-tarde",
        "tchau",
    ]
    assert [question["avatar_phrase"] for question in questions] == [
        "Olá",
        "Bom dia",
        "Boa tarde",
        "Tchau",
    ]
    assert all(
        question["avatar_phrase"] in question["options"]
        for question in questions
    )
    assert "media_url" not in questions[0]
    assert "media_type" not in questions[0]


def test_level_completion_awards_xp_only_once() -> None:
    first = client.post("/api/game/levels/cumprimentos/complete")
    repeated = client.post("/api/game/levels/cumprimentos/complete")

    assert first.status_code == 200
    assert first.json()["awarded_xp"] == 250
    assert first.json()["xp"] == 250
    assert repeated.json()["awarded_xp"] == 0
    assert repeated.json()["xp"] == 250

    levels = client.get("/api/game/levels").json()
    by_id = {level["id"]: level for level in levels}
    assert by_id["alfabeto"]["status"] == "available"
    assert by_id["cumprimentos"]["progress_percent"] == 100


def test_profile_reads_statistics_and_achievements_from_sqlite() -> None:
    response = client.get("/api/game/profile")

    assert response.status_code == 200
    profile = response.json()
    assert profile["display_name"] == "JVitor"
    assert profile["level_number"] == 1
    assert profile["total_play_seconds"] >= 0
    assert profile["signs_learned"] >= 0
    assert profile["challenges_completed"] >= 0
    assert len(profile["achievements"]) == 4
    assert profile["achievements"][0]["title"] == "Mestre do Alfabeto"


def test_reset_clears_sqlite_progress_and_achievements() -> None:
    client.post("/api/game/levels/cumprimentos/complete")

    reset = client.post("/api/game/progress/reset")
    profile = client.get("/api/game/profile").json()
    levels = client.get("/api/game/levels").json()

    assert reset.status_code == 200
    assert reset.json() == {"completed_level_ids": [], "xp": 0, "streak_days": 0}
    assert profile["level_number"] == 1
    assert profile["signs_learned"] == 0
    assert profile["achievements_unlocked"] == 0
    assert all(item["current_value"] == 0 for item in profile["achievements"])
    assert all(level["progress_percent"] == 0 for level in levels)


def test_progress_survives_a_new_service_instance() -> None:
    client.post("/api/game/levels/cumprimentos/complete")

    persisted_progress = GameService().get_progress()

    assert persisted_progress.xp == 250
    assert persisted_progress.completed_level_ids == ["cumprimentos"]


def test_answer_attempt_is_persisted() -> None:
    client.post(
        "/api/game/levels/cumprimentos/questions/ola/answer",
        json={"answer": "Bom dia"},
    )

    attempts = client.get("/api/game/progress/answers")

    assert attempts.status_code == 200
    assert attempts.json()[0]["question_id"] == "ola"
    assert attempts.json()[0]["selected_answer"] == "Bom dia"
    assert attempts.json()[0]["correct"] is False


def test_static_media_directory_is_exposed() -> None:
    response = client.get("/static/media/signs/README.md")

    assert response.status_code == 200
    assert "Mídias validadas de Libras" in response.text
