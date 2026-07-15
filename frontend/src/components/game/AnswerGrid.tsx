import { motion } from "framer-motion";

import type { AnswerResult } from "../../types/game";

interface AnswerGridProps {
  options: string[];
  selectedAnswer: string | null;
  result: AnswerResult | null;
  disabled: boolean;
  onSelect: (answer: string) => void;
}

export function AnswerGrid({ options, selectedAnswer, result, disabled, onSelect }: AnswerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3" aria-label="Alternativas">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === option;
        const isCorrect = result?.correct_answer === option;
        const isWrongSelection = Boolean(result && isSelected && !result.correct);

        return (
          <motion.button
            key={option}
            type="button"
            disabled={disabled}
            whileHover={disabled ? undefined : { y: -2 }}
            whileTap={disabled ? undefined : { y: 4, scale: 0.98 }}
            onClick={() => onSelect(option)}
            className={`relative min-h-[4.6rem] rounded-2xl border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-cyan disabled:cursor-default ${
              isCorrect && result
                ? "border-success/60 bg-success-surface text-success"
                : isWrongSelection
                  ? "border-danger/60 bg-danger-surface text-danger"
                  : isSelected
                    ? "border-brand-violet-light bg-brand-violet/15"
                    : "border-app-border bg-app-elevated hover:border-brand-violet-light/45"
            }`}
          >
            <span className="absolute left-3 top-3 grid size-5 place-items-center rounded-md border border-current/15 text-[10px] font-black text-app-subtle">
              {index + 1}
            </span>
            <span className="block pl-7 font-display text-sm font-extrabold leading-5">{option}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
