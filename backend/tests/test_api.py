from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_levels_begin_with_greetings_available() -> None:
    response = client.get("/api/game/levels")

    assert response.status_code == 200
    levels = response.json()
    assert levels[0]["id"] == "cumprimentos"
    assert levels[0]["status"] == "available"
    assert levels[1]["status"] == "locked"
    assert levels[0]["prerequisite_level_id"] is None
    assert levels[1]["prerequisite_level_id"] == "cumprimentos"
    assert levels[2]["prerequisite_level_id"] == "alfabeto"


def test_answer_validation_does_not_expose_answer_in_question() -> None:
    questions_response = client.get("/api/game/levels/cumprimentos/questions")
    question = questions_response.json()[0]

    assert "correct_answer" not in question

    answer_response = client.post(
        "/api/game/levels/cumprimentos/questions/ola/answer",
        json={"answer": "Olá"},
    )
    assert answer_response.status_code == 200
    assert answer_response.json()["correct"] is True
