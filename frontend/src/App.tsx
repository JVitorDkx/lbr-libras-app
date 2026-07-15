import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FlaskConical, RotateCcw, Sparkles, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LevelPath } from "./components/LevelPath";
import { ProfileHeader } from "./components/ProfileHeader";
import { usePlayerProgress } from "./hooks/usePlayerProgress";
import { apiGet } from "./lib/api";
import { getLevelStatus } from "./lib/progress";
import type { GameLevel, LevelViewStatus } from "./types/game";

interface Notice {
  tone: "success" | "info";
  title: string;
  message: string;
}

export default function App() {
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const { progress, complete, reset } = usePlayerProgress();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);

    apiGet<GameLevel[]>("/game/levels", controller.signal)
      .then((data) => setLevels([...data].sort((a, b) => a.order - b.order)))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [retryKey]);

  const handleLevelSelect = (level: GameLevel, status: LevelViewStatus) => {
    if (status === "locked") {
      setNotice({
        tone: "info",
        title: "Fase ainda bloqueada",
        message: `Conclua ${level.prerequisite_level_id ?? "a fase anterior"} para continuar sua trilha.`,
      });
      return;
    }

    setNotice({
      tone: status === "completed" ? "success" : "info",
      title: status === "completed" ? "Fase já concluída!" : `${level.title} está pronta`,
      message: status === "completed" ? "Você poderá praticar novamente no Bloco 3." : "A experiência de perguntas será conectada no próximo bloco.",
    });
  };

  const greetings = levels.find((level) => level.id === "cumprimentos");
  const greetingsStatus = greetings ? getLevelStatus(greetings, progress) : "locked";

  const simulateCompletion = () => {
    if (!greetings || greetingsStatus === "completed") return;
    complete(greetings);
    setNotice({
      tone: "success",
      title: "Cumprimentos concluído!",
      message: `Você ganhou +${greetings.reward_xp} XP. O Nível 2 foi desbloqueado.`,
    });
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-app text-app-text">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_50%_-8%,var(--color-brand-violet-glow),transparent_68%)]" />
      <ProfileHeader xp={progress.xp} streakDays={progress.streakDays} />

      <section className="relative mx-auto min-h-dvh w-full max-w-md px-5 pb-12 pt-28 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-brand-cyan">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Sua jornada
              </p>
              <h1 className="mt-2 font-display text-3xl font-black tracking-tight">Trilha de Libras</h1>
            </div>
            <span className="mb-1 rounded-full border border-app-border bg-app-card px-3 py-1.5 text-[10px] font-bold text-app-muted">
              {progress.completedLevelIds.length}/{levels.length || 3} fases
            </span>
          </div>
          <p className="mt-2 max-w-xs text-sm leading-6 text-app-muted">Aprenda sinais essenciais, avance nas fases e transforme cada acerto em progresso.</p>
        </motion.div>

        {loading && <LevelSkeleton />}

        {!loading && loadError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 rounded-card border border-danger/20 bg-danger-surface/50 p-6 text-center">
            <WifiOff className="mx-auto size-8 text-danger" />
            <h2 className="mt-3 font-display text-lg font-extrabold">Não foi possível carregar as fases</h2>
            <p className="mt-2 text-sm leading-6 text-app-muted">Confira se a API FastAPI está ligada e tente novamente.</p>
            <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-5 min-h-11 rounded-xl bg-danger px-5 text-sm font-black text-white transition-transform active:translate-y-0.5">
              Tentar novamente
            </button>
          </motion.div>
        )}

        {!loading && !loadError && <LevelPath levels={levels} progress={progress} onSelect={handleLevelSelect} />}

        {!loading && !loadError && greetings && (
          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12 rounded-card border border-app-border bg-app-card p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-violet/15 text-brand-violet-light">
                <FlaskConical className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-violet-light">Modo de validação do protótipo</p>
                <h2 className="mt-1 font-display font-extrabold">Teste o desbloqueio da trilha</h2>
                <p className="mt-1 text-xs leading-5 text-app-muted">Simula o resultado que a tela de jogo enviará ao concluir Cumprimentos.</p>
              </div>
            </div>

            {greetingsStatus === "completed" ? (
              <button type="button" onClick={() => { reset(); setNotice(null); }} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-app-border bg-app-elevated text-sm font-extrabold text-app-muted transition-colors hover:text-app-text active:translate-y-0.5">
                <RotateCcw className="size-4" />
                Reiniciar progresso
              </button>
            ) : (
              <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ y: 4, scale: 0.99 }} onClick={simulateCompletion} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-violet px-4 text-sm font-black shadow-tactile-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan">
                <CheckCircle2 className="size-4" />
                Simular conclusão do Nível 1
              </motion.button>
            )}
          </motion.aside>
        )}

        <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-app-subtle">LBRLibras · Aprender com as mãos</p>
      </section>

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ type: "spring", stiffness: 320, damping: 26 }} className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-sm">
            <div className={`flex items-start gap-3 rounded-2xl border p-4 shadow-card backdrop-blur-xl ${notice.tone === "success" ? "border-success/25 bg-success-surface/95" : "border-brand-cyan/20 bg-app-elevated/95"}`}>
              <CheckCircle2 className={`mt-0.5 size-5 shrink-0 ${notice.tone === "success" ? "text-success" : "text-brand-cyan"}`} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-extrabold">{notice.title}</p>
                <p className="mt-1 text-xs leading-5 text-app-muted">{notice.message}</p>
              </div>
              <button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso" className="grid size-8 shrink-0 place-items-center rounded-lg text-app-muted hover:bg-white/5 hover:text-app-text">
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function LevelSkeleton() {
  return (
    <div aria-label="Carregando fases" className="mt-10 space-y-10">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex flex-col items-center animate-pulse">
          <div className="size-[5.5rem] rounded-[1.8rem] bg-app-elevated" />
          <div className="mt-5 h-24 w-full max-w-[17rem] rounded-2xl bg-app-card" />
        </div>
      ))}
    </div>
  );
}
