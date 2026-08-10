from datetime import date, datetime, time, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.main import app
from app.db.models import AnswerAttempt, Player
from app.db.session import SessionLocal
from app.services.game_service import GameService, game_service
from app.services.gamification import (
    level_for_xp,
    local_today,
    register_daily_activity,
    xp_threshold_for_level,
)


client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_player_progress() -> None:
    game_service.reset_progress()


def complete_level_through_api(level_id: str):
    questions_response = client.get(f"/api/game/levels/{level_id}/questions")
    assert questions_response.status_code == 200
    for question in questions_response.json():
        answer_response = client.post(
            f"/api/game/levels/{level_id}/questions/{question['id']}/answer",
            json={"answer": question["avatar_phrase"]},
        )
        assert answer_response.status_code == 200
        assert answer_response.json()["correct"] is True
    return client.post(f"/api/game/levels/{level_id}/complete")


def unlock_level(level_id: str) -> None:
    if level_id in {"alfabeto", "numeros"}:
        assert complete_level_through_api("cumprimentos").status_code == 200
    if level_id == "numeros":
        assert complete_level_through_api("alfabeto").status_code == 200


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
    assert answer_response.json()["awarded_xp"] == 25


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


@pytest.mark.parametrize(
    ("level_id", "expected_ids", "expected_phrases"),
    [
        (
            "alfabeto",
            [f"alfabeto-{letter}" for letter in "abcdef"],
            [f"Letra {letter}" for letter in "ABCDEF"],
        ),
        (
            "numeros",
            [
                "numero-zero",
                "numero-um",
                "numero-dois",
                "numero-tres",
                "numero-quatro",
                "numero-cinco",
            ],
            ["Zero", "Um", "Dois", "Três", "Quatro", "Cinco"],
        ),
    ],
)
def test_new_learning_modules_have_playable_questions(
    level_id: str,
    expected_ids: list[str],
    expected_phrases: list[str],
) -> None:
    unlock_level(level_id)
    response = client.get(f"/api/game/levels/{level_id}/questions")

    assert response.status_code == 200
    questions = response.json()
    assert [question["id"] for question in questions] == expected_ids
    assert [question["avatar_phrase"] for question in questions] == expected_phrases
    assert all(len(question["options"]) == 4 for question in questions)
    assert all(
        question["avatar_phrase"] in question["options"]
        for question in questions
    )


def test_catalog_reports_all_three_modules_as_playable() -> None:
    levels = client.get("/api/game/levels").json()
    by_id = {level["id"]: level for level in levels}

    assert by_id["cumprimentos"]["question_count"] == 4
    assert by_id["alfabeto"]["question_count"] == 6
    assert by_id["numeros"]["question_count"] == 6
    assert by_id["alfabeto"]["title"] == "Alfabeto A–F"


def test_level_completion_awards_xp_only_once() -> None:
    first = complete_level_through_api("cumprimentos")
    repeated = client.post("/api/game/levels/cumprimentos/complete")

    assert first.status_code == 200
    assert first.json()["awarded_xp"] == 250
    assert first.json()["xp"] == 350
    assert repeated.json()["awarded_xp"] == 0
    assert repeated.json()["xp"] == 350
    assert first.json()["level_number"] == 3
    assert first.json()["leveled_up"] is True

    levels = client.get("/api/game/levels").json()
    by_id = {level["id"]: level for level in levels}
    assert by_id["alfabeto"]["status"] == "available"
    assert by_id["cumprimentos"]["status"] == "completed"
    assert by_id["cumprimentos"]["progress_percent"] == 100


def test_completing_alphabet_unlocks_all_dependent_topics() -> None:
    complete_level_through_api("cumprimentos")
    complete_level_through_api("alfabeto")

    levels = client.get("/api/game/levels").json()
    by_id = {level["id"]: level for level in levels}
    assert by_id["soletracao"]["status"] == "available"
    assert by_id["numeros"]["status"] == "available"


def test_profile_reads_statistics_and_achievements_from_sqlite() -> None:
    response = client.get("/api/game/profile")

    assert response.status_code == 200
    profile = response.json()
    assert profile["display_name"] == "JVitor"
    assert profile["level_number"] == 1
    assert profile["xp"] == 0
    assert profile["signs_learned"] == 0
    assert profile["lessons_completed"] == 0
    assert profile["best_combo"] == 0
    assert len(profile["achievements"]) == 4
    assert profile["achievements"][0]["title"] == "Mestre do Alfabeto"


def test_reset_clears_sqlite_progress_and_achievements() -> None:
    complete_level_through_api("cumprimentos")

    reset = client.post("/api/game/progress/reset")
    profile = client.get("/api/game/profile").json()
    levels = client.get("/api/game/levels").json()

    assert reset.status_code == 200
    assert reset.json() == {
        "completed_level_ids": [],
        "xp": 0,
        "streak_days": 0,
        "level_number": 1,
        "level_start_xp": 0,
        "next_level_xp": 100,
    }
    assert profile["level_number"] == 1
    assert profile["signs_learned"] == 0
    assert profile["achievements_unlocked"] == 0
    assert all(item["current_value"] == 0 for item in profile["achievements"])
    assert all(level["progress_percent"] == 0 for level in levels)


def test_progress_survives_a_new_service_instance() -> None:
    complete_level_through_api("cumprimentos")

    persisted_progress = GameService().get_progress()

    assert persisted_progress.xp == 350
    assert persisted_progress.completed_level_ids == ["cumprimentos"]


def test_locked_level_rejects_questions_answers_and_completion() -> None:
    questions = client.get("/api/game/levels/alfabeto/questions")
    answer = client.post(
        "/api/game/levels/alfabeto/questions/alfabeto-a/answer",
        json={"answer": "Letra A"},
    )
    completion = client.post("/api/game/levels/alfabeto/complete")

    assert questions.status_code == 403
    assert answer.status_code == 403
    assert completion.status_code == 403
    assert client.get("/api/game/progress").json()["xp"] == 0


def test_incomplete_level_cannot_award_completion_xp() -> None:
    answer = client.post(
        "/api/game/levels/cumprimentos/questions/ola/answer",
        json={"answer": "Olá"},
    )
    completion = client.post("/api/game/levels/cumprimentos/complete")
    levels = client.get("/api/game/levels").json()
    by_id = {level["id"]: level for level in levels}

    assert answer.json()["xp"] == 25
    assert completion.status_code == 409
    assert client.get("/api/game/progress").json()["xp"] == 25
    assert by_id["cumprimentos"]["status"] == "available"
    assert by_id["cumprimentos"]["progress_percent"] == 25
    assert by_id["alfabeto"]["status"] == "locked"


def test_profile_metrics_are_derived_from_answer_history() -> None:
    answers = [
        ("ola", "Olá"),
        ("bom-dia", "Bom dia"),
        ("boa-tarde", "Tchau"),
        ("boa-tarde", "Boa tarde"),
        ("tchau", "Tchau"),
    ]
    for question_id, answer in answers:
        client.post(
            f"/api/game/levels/cumprimentos/questions/{question_id}/answer",
            json={"answer": answer},
        )
    completion = client.post("/api/game/levels/cumprimentos/complete")
    profile = client.get("/api/game/profile").json()

    assert completion.status_code == 200
    assert profile["xp"] == 350
    assert profile["signs_learned"] == 4
    assert profile["lessons_completed"] == 1
    assert profile["challenges_completed"] == 1
    assert profile["best_combo"] == 2
    assert profile["streak_days"] == 1
    achievements = {item["id"]: item for item in profile["achievements"]}
    assert achievements["hundred-signs"]["current_value"] == 4
    assert achievements["perfect-score"]["current_value"] == 0


def test_server_repairs_tampered_player_totals_from_history() -> None:
    client.post(
        "/api/game/levels/cumprimentos/questions/ola/answer",
        json={"answer": "Olá"},
    )
    with SessionLocal() as session:
        player = session.get(Player, 1)
        assert player is not None
        player.xp = 99_999
        player.level_number = 99
        player.signs_learned = 999
        player.challenges_completed = 999
        session.commit()

    progress = client.get("/api/game/progress").json()
    profile = client.get("/api/game/profile").json()

    assert progress["xp"] == 25
    assert progress["level_number"] == 1
    assert profile["signs_learned"] == 1
    assert profile["lessons_completed"] == 0


def test_profile_rebuilds_daily_streak_from_attempt_dates() -> None:
    for question_id, answer in [
        ("ola", "Olá"),
        ("bom-dia", "Bom dia"),
        ("boa-tarde", "Boa tarde"),
    ]:
        client.post(
            f"/api/game/levels/cumprimentos/questions/{question_id}/answer",
            json={"answer": answer},
        )

    today = local_today()
    with SessionLocal() as session:
        attempts = session.scalars(
            select(AnswerAttempt).order_by(AnswerAttempt.id)
        ).all()
        for attempt, played_on in zip(
            attempts,
            [today - timedelta(days=2), today - timedelta(days=1), today],
            strict=True,
        ):
            attempt.answered_at = datetime.combine(
                played_on,
                time(15),
                tzinfo=timezone.utc,
            )
        session.commit()

    assert client.get("/api/game/profile").json()["streak_days"] == 3


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


def test_correct_answer_xp_is_awarded_only_once() -> None:
    first = client.post(
        "/api/game/levels/cumprimentos/questions/ola/answer",
        json={"answer": "Olá"},
    ).json()
    repeated = client.post(
        "/api/game/levels/cumprimentos/questions/ola/answer",
        json={"answer": "Olá"},
    ).json()
    wrong = client.post(
        "/api/game/levels/cumprimentos/questions/bom-dia/answer",
        json={"answer": "Tchau"},
    ).json()

    assert first["awarded_xp"] == 25
    assert first["xp"] == 25
    assert repeated["awarded_xp"] == 0
    assert repeated["xp"] == 25
    assert wrong["awarded_xp"] == 0
    assert wrong["xp"] == 25


def test_level_thresholds_follow_the_progressive_curve() -> None:
    assert xp_threshold_for_level(2) == 100
    assert xp_threshold_for_level(3) == 250
    assert level_for_xp(249) == 2
    assert level_for_xp(250) == 3


def test_daily_streak_increments_once_and_resets_after_a_gap() -> None:
    player = Player(id=99, streak_days=0, level_number=1)
    first_day = date(2026, 7, 15)

    register_daily_activity(player, first_day)
    register_daily_activity(player, first_day)
    assert player.streak_days == 1

    register_daily_activity(player, first_day + timedelta(days=1))
    assert player.streak_days == 2

    register_daily_activity(player, first_day + timedelta(days=3))
    assert player.streak_days == 1
