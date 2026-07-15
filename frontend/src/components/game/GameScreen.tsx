import { AnimatePresence, motion } from "framer-motion";
import { Eye, LoaderCircle, RefreshCw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiGet, apiPost } from "../../lib/api";
import type { AnswerResult, CompleteLevelResult, GameLevel, GameQuestion } from "../../types/game";
import { AnswerGrid } from "./AnswerGrid";
import { FeedbackSheet } from "./FeedbackSheet";
import { QuestionMedia } from "./QuestionMedia";

interface GameScreenProps {
  level: GameLevel;
  onExit: () => void;
  onComplete: (result: CompleteLevelResult) => void;
}

export function GameScreen({ level, onExit, onComplete }: GameScreenProps) {
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);

    apiGet<GameQuestion[]>(`/game/levels/${level.id}/questions`, controller.signal)
      .then((data) => {
        setQuestions(data);
        setCurrentIndex(0);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [level.id, retryKey]);

  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentIndex + (result ? 1 : 0)) / questions.length) * 100;
  }, [currentIndex, questions.length, result]);

  const answerQuestion = async (answer: string) => {
    if (!question || submitting || result) return;

    setSelectedAnswer(answer);
    setSubmitting(true);
    try {
      const answerResult = await apiPost<AnswerResult>(
        `/game/levels/${level.id}/questions/${question.id}/answer`,
        { answer },
      );
      setResult(answerResult);
    } catch {
      setSelectedAnswer(null);
    } finally {
      setSubmitting(false);
    }
  };

  const continueGame = async () => {
    if (!result) return;

    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
      setSelectedAnswer(null);
      setResult(null);
      return;
    }

    setSaving(true);
    setSaveError(false);
    try {
      const completion = await apiPost<CompleteLevelResult>(`/game/levels/${level.id}/complete`);
      onComplete(completion);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center bg-app text-app-text">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-brand-violet-light" />
          <p className="mt-3 text-sm font-bold text-app-muted">Preparando sua aula...</p>
        </div>
      </main>
    );
  }

  if (loadError || !question) {
    return (
      <main className="grid min-h-dvh place-items-center bg-app px-5 text-app-text">
        <div className="w-full max-w-sm rounded-card border border-danger/20 bg-danger-surface/40 p-6 text-center">
          <RefreshCw className="mx-auto size-8 text-danger" />
          <h1 className="mt-3 font-display text-xl font-black">Não foi possível iniciar a aula</h1>
          <p className="mt-2 text-sm leading-6 text-app-muted">Confira a conexão com a API e carregue as perguntas novamente.</p>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-5 min-h-12 w-full rounded-xl bg-danger font-black text-white">Tentar novamente</button>
          <button type="button" onClick={onExit} className="mt-3 min-h-11 w-full rounded-xl text-sm font-bold text-app-muted">Voltar ao menu</button>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-dvh overflow-x-hidden bg-app text-app-text ${result ? "pb-52" : "pb-8"}`}>
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,var(--color-brand-violet-glow),transparent_68%)]" />

      <header className="relative mx-auto flex h-20 w-full max-w-md items-center gap-4 px-5 sm:px-6">
        <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={onExit} aria-label="Sair da aula e voltar ao menu" className="grid size-10 shrink-0 place-items-center rounded-xl border border-app-border bg-app-card text-app-muted hover:text-app-text">
          <X className="size-5" strokeWidth={2.5} />
        </motion.button>
        <div className="h-3 flex-1 overflow-hidden rounded-full border border-app-border bg-app-elevated" aria-label={`${Math.round(progressPercent)}% da aula concluída`}>
          <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan" animate={{ width: `${progressPercent}%` }} transition={{ type: "spring", stiffness: 160, damping: 24 }} />
        </div>
        <span className="w-10 text-right text-xs font-black tabular-nums text-app-muted">{currentIndex + 1}/{questions.length}</span>
      </header>

      <section className="relative mx-auto w-full max-w-md px-5 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={question.id} initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: 0.3, ease: "easeOut" }}>
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">Nível 1 · Cumprimentos</p>
              <h1 className="mt-2 font-display text-2xl font-black leading-tight">{question.prompt}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-app-muted">
                <Eye className="size-3.5 text-brand-amber" />
                Observe as mãos, o movimento e a expressão facial.
              </p>
            </div>

            <motion.div initial={{ scale: 0.97 }} animate={{ scale: 1 }} className="rounded-card border border-app-border bg-app-card p-3 shadow-card">
              <QuestionMedia question={question} />
            </motion.div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-extrabold text-app-muted">Escolha uma resposta:</p>
              <AnswerGrid options={question.options} selectedAnswer={selectedAnswer} result={result} disabled={submitting || Boolean(result)} onSelect={answerQuestion} />
              {submitting && <p className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-app-muted"><LoaderCircle className="size-3.5 animate-spin" /> Conferindo resposta...</p>}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {result && <FeedbackSheet result={result} isLastQuestion={isLastQuestion} saving={saving} saveError={saveError} onContinue={continueGame} />}
      </AnimatePresence>
    </main>
  );
}
