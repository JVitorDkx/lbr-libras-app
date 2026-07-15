import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Sparkles, WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { PlayerProgress } from "../lib/progress";
import { apiGet } from "../lib/api";
import type { GameLevel, LevelViewStatus } from "../types/game";
import { LevelPath } from "./LevelPath";
import { ProfileHeader } from "./ProfileHeader";

interface MenuScreenProps {
  progress: PlayerProgress;
  onPlay: (level: GameLevel) => void;
}

interface Notice {
  tone: "success" | "info";
  title: string;
  message: string;
}

export function MenuScreen({ progress, onPlay }: MenuScreenProps) {
  const [levels, setLevels] = useState<GameLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [notice, setNotice] = useState<Notice | null>(null);

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
      const prerequisite = levels.find((item) => item.id === level.prerequisite_level_id)?.title ?? "a fase anterior";
      setNotice({ tone: "info", title: "Fase ainda bloqueada", message: `Conclua ${prerequisite} para continuar sua trilha.` });
      return;
    }

    if (!level.question_count) {
      setNotice({ tone: "info", title: `${level.title} está a caminho`, message: "Esta aula será construída em um dos próximos blocos do protótipo." });
      return;
    }

    onPlay(level);
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-app text-app-text">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_50%_-8%,var(--color-brand-violet-glow),transparent_68%)]" />
      <ProfileHeader xp={progress.xp} streakDays={progress.streakDays} />

      <section className="relative mx-auto min-h-dvh w-full max-w-md px-5 pb-12 pt-28 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-brand-cyan"><Sparkles className="size-3.5" /> Sua jornada</p>
              <h1 className="mt-2 font-display text-3xl font-black tracking-tight">Trilha de Libras</h1>
            </div>
            <span className="mb-1 rounded-full border border-app-border bg-app-card px-3 py-1.5 text-[10px] font-bold text-app-muted">{progress.completedLevelIds.length}/{levels.length || 3} fases</span>
          </div>
          <p className="mt-2 max-w-xs text-sm leading-6 text-app-muted">Aprenda sinais essenciais, avance nas fases e transforme cada acerto em progresso.</p>
        </motion.div>

        {loading && <LevelSkeleton />}
        {!loading && loadError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 rounded-card border border-danger/20 bg-danger-surface/50 p-6 text-center">
            <WifiOff className="mx-auto size-8 text-danger" />
            <h2 className="mt-3 font-display text-lg font-extrabold">Não foi possível carregar as fases</h2>
            <p className="mt-2 text-sm leading-6 text-app-muted">Confira se a API FastAPI está ligada e tente novamente.</p>
            <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-5 min-h-11 rounded-xl bg-danger px-5 text-sm font-black text-white">Tentar novamente</button>
          </motion.div>
        )}
        {!loading && !loadError && <LevelPath levels={levels} progress={progress} onSelect={handleLevelSelect} />}

        {!loading && !loadError && (
          <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-12 flex gap-3 rounded-2xl border border-brand-cyan/15 bg-brand-cyan/5 p-4">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-brand-cyan" />
            <div>
              <p className="text-xs font-extrabold text-brand-cyan">Dica para aprender Libras</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">Observe também a expressão facial: ela faz parte da comunicação, não é apenas um detalhe.</p>
            </div>
          </motion.aside>
        )}

        <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-app-subtle">LBRLibras · Aprender com as mãos</p>
      </section>

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ type: "spring", stiffness: 320, damping: 26 }} className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-sm">
            <div className={`flex items-start gap-3 rounded-2xl border p-4 shadow-card backdrop-blur-xl ${notice.tone === "success" ? "border-success/25 bg-success-surface/95" : "border-brand-cyan/20 bg-app-elevated/95"}`}>
              <CheckCircle2 className={`mt-0.5 size-5 shrink-0 ${notice.tone === "success" ? "text-success" : "text-brand-cyan"}`} />
              <div className="min-w-0 flex-1"><p className="font-display text-sm font-extrabold">{notice.title}</p><p className="mt-1 text-xs leading-5 text-app-muted">{notice.message}</p></div>
              <button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso" className="grid size-8 shrink-0 place-items-center rounded-lg text-app-muted hover:bg-white/5"><X className="size-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function LevelSkeleton() {
  return <div aria-label="Carregando fases" className="mt-10 space-y-10">{[0, 1, 2].map((item) => <div key={item} className="flex animate-pulse flex-col items-center"><div className="size-[5.5rem] rounded-[1.8rem] bg-app-elevated" /><div className="mt-5 h-24 w-full max-w-[17rem] rounded-2xl bg-app-card" /></div>)}</div>;
}
