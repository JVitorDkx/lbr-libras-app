import { motion } from "framer-motion";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

import type { AnswerResult } from "../../types/game";

interface FeedbackSheetProps {
  result: AnswerResult;
  isLastQuestion: boolean;
  saving: boolean;
  saveError: boolean;
  onContinue: () => void;
}

export function FeedbackSheet({ result, isLastQuestion, saving, saveError, onContinue }: FeedbackSheetProps) {
  const correct = result.correct;

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={`fixed inset-x-0 bottom-0 z-50 border-t ${correct ? "border-success/30 bg-success-surface" : "border-danger/30 bg-danger-surface"}`}
    >
      <div className="mx-auto flex w-full max-w-md items-start gap-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
        <div className={`grid size-11 shrink-0 place-items-center rounded-2xl ${correct ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
          {correct ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className={`font-display text-xl font-black ${correct ? "text-success" : "text-danger"}`}>
            {correct ? "Muito bem!" : "Quase lá!"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-app-text/85">
            {correct ? result.feedback : `A resposta correta é “${result.correct_answer}”.`}
          </p>
          {saveError && <p className="mt-2 text-xs font-bold text-danger">Não foi possível salvar o progresso. Tente novamente.</p>}
          <motion.button
            type="button"
            whileTap={{ y: 3, scale: 0.99 }}
            disabled={saving}
            onClick={onContinue}
            className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-app shadow-[0_4px_0_rgb(0_0_0_/_0.28)] disabled:opacity-70 ${correct ? "bg-success" : "bg-danger"}`}
          >
            {saving && <LoaderCircle className="size-4 animate-spin" />}
            {saving ? "Salvando..." : saveError ? "Tentar novamente" : isLastQuestion ? "Concluir nível" : "Continuar"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
