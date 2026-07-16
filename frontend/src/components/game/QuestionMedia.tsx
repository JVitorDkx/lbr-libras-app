import type { GameQuestion } from "../../types/game";
import { VLibrasQuestionPlayer } from "./VLibrasQuestionPlayer";

interface QuestionMediaProps {
  question: GameQuestion;
}

export function QuestionMedia({ question }: QuestionMediaProps) {
  const correctAnswerPhrase = question.avatar_phrase.trim();

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-app-border bg-[radial-gradient(circle_at_50%_35%,rgb(109_74_255_/_0.22),transparent_58%),var(--color-app-elevated)]">
      <VLibrasQuestionPlayer
        key={question.id}
        correctAnswerPhrase={correctAnswerPhrase}
      />
    </div>
  );
}
