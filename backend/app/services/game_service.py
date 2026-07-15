from dataclasses import dataclass

from app.models.game import (
    AnswerResult,
    LevelStatus,
    LevelSummary,
    MediaType,
    QuestionPublic,
)


@dataclass(frozen=True)
class QuestionRecord:
    id: str
    prompt: str
    media_type: MediaType
    media_url: str
    options: list[str]
    correct_answer: str

    def to_public(self) -> QuestionPublic:
        return QuestionPublic(
            id=self.id,
            prompt=self.prompt,
            media_type=self.media_type,
            media_url=self.media_url,
            options=self.options,
        )


class GameService:
    def __init__(self) -> None:
        self._questions: dict[str, list[QuestionRecord]] = {
            "cumprimentos": [
                QuestionRecord(
                    id="ola",
                    prompt="Qual cumprimento está sendo apresentado?",
                    media_type=MediaType.IMAGE,
                    media_url="/media/signs/ola-placeholder.svg",
                    options=["Olá", "Bom dia", "Boa tarde", "Tchau"],
                    correct_answer="Olá",
                ),
                QuestionRecord(
                    id="bom-dia",
                    prompt="Qual cumprimento está sendo apresentado?",
                    media_type=MediaType.IMAGE,
                    media_url="/media/signs/bom-dia-placeholder.svg",
                    options=["Olá", "Bom dia", "Boa tarde", "Tchau"],
                    correct_answer="Bom dia",
                ),
            ]
        }

    def list_levels(self) -> list[LevelSummary]:
        return [
            LevelSummary(
                id="cumprimentos",
                order=1,
                title="Cumprimentos",
                description="Olá, bom dia, boa tarde e tchau",
                status=LevelStatus.AVAILABLE,
                accent="violet",
                reward_xp=250,
                question_count=len(self._questions["cumprimentos"]),
            ),
            LevelSummary(
                id="alfabeto",
                order=2,
                title="Alfabeto",
                description="Introdução ao alfabeto manual",
                status=LevelStatus.LOCKED,
                accent="cyan",
                reward_xp=300,
                question_count=0,
            ),
            LevelSummary(
                id="numeros",
                order=3,
                title="Números",
                description="Sinais numéricos básicos",
                status=LevelStatus.LOCKED,
                accent="amber",
                reward_xp=300,
                question_count=0,
            ),
        ]

    def list_questions(self, level_id: str) -> list[QuestionPublic] | None:
        records = self._questions.get(level_id)
        if records is None:
            return None
        return [question.to_public() for question in records]

    def validate_answer(
        self, level_id: str, question_id: str, selected_answer: str
    ) -> AnswerResult | None:
        records = self._questions.get(level_id)
        if records is None:
            return None

        question = next((item for item in records if item.id == question_id), None)
        if question is None:
            return None

        is_correct = selected_answer.casefold().strip() == question.correct_answer.casefold()
        feedback = (
            "Parabéns! Você identificou o sinal corretamente."
            if is_correct
            else "Quase! Observe o sinal novamente e tente outra resposta."
        )
        return AnswerResult(correct=is_correct, feedback=feedback)


game_service = GameService()

