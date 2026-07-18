import { AnimatePresence, motion } from "framer-motion";
import { Info, WifiOff, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { PlayerProgress } from "../lib/progress";
import { apiGet } from "../lib/api";
import { getLevelStatus } from "../lib/progress";
import type { GameLevel, LevelViewStatus } from "../types/game";
import { AppNavigation, type MainTab } from "./AppNavigation";
import { MenuHeader } from "./MenuHeader";
import { TopicCircle } from "./TopicCircle";

interface MenuScreenProps {
  progress: PlayerProgress;
  onPlay: (level: GameLevel) => void;
  onNavigate: (tab: MainTab) => void;
  onOpenSettings: () => void;
}

interface Notice { title: string; message: string }

export function MenuScreen({ progress, onPlay, onNavigate, onOpenSettings }: MenuScreenProps) {
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

  const categories = useMemo(() => {
    const grouped = new Map<string, GameLevel[]>();
    levels.forEach((level) => grouped.set(level.category, [...(grouped.get(level.category) ?? []), level]));
    return [...grouped.entries()];
  }, [levels]);

  const selectLevel = (level: GameLevel, status: LevelViewStatus) => {
    if (status === "locked") {
      const prerequisite = levels.find((item) => item.id === level.prerequisite_level_id)?.title ?? "o tópico anterior";
      setNotice({ title: "Tópico bloqueado", message: `Conclua ${prerequisite} para liberar este conteúdo.` });
      return;
    }
    if (!level.question_count) {
      setNotice({ title: `${level.title} está em preparação`, message: "O progresso já está no banco; as atividades entram no próximo bloco de conteúdo." });
      return;
    }
    onPlay(level);
  };

  return (
    <main className="min-h-dvh bg-[#0b0d12] text-white">
      <div className="mx-auto min-h-dvh w-full max-w-md border-x border-white/[0.03] bg-[#0b0d12] shadow-2xl">
        <MenuHeader xp={progress.xp} streakDays={progress.streakDays} levelNumber={progress.levelNumber} levelStartXp={progress.levelStartXp} nextLevelXp={progress.nextLevelXp} onOpenSettings={onOpenSettings} />
        <AppNavigation active="menu" onNavigate={onNavigate} />

        <div className="px-5 pb-16 pt-10">
          {loading && <MenuSkeleton />}
          {!loading && loadError && (
            <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-6 text-center">
              <WifiOff className="mx-auto size-7 text-red-400" />
              <p className="mt-3 font-extrabold">Não foi possível carregar o menu</p>
              <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-black text-black">Tentar novamente</button>
            </div>
          )}
          {!loading && !loadError && categories.map(([category, items], categoryIndex) => (
            <motion.section key={category} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: categoryIndex * 0.12 }} className="mb-14 last:mb-3">
              <h1 className="mb-8 text-center font-display text-[1.35rem] font-black tracking-tight">{category}</h1>
              <div className="mx-auto grid w-full max-w-[20rem] grid-cols-2 justify-items-center gap-x-10 gap-y-9">
                {items.map((level, index) => {
                  const status = getLevelStatus(level, progress);
                  return (
                    <div key={level.id} className={`flex w-full justify-center ${items.length === 1 ? "col-span-2" : ""}`}>
                      <TopicCircle level={level} status={status} index={categoryIndex * 2 + index} onSelect={() => selectLevel(level, status)} />
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-sm rounded-2xl border border-[#6c50ff]/25 bg-[#151922]/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex gap-3"><Info className="mt-0.5 size-5 shrink-0 text-[#6c50ff]" /><div className="flex-1"><p className="text-sm font-extrabold">{notice.title}</p><p className="mt-1 text-xs leading-5 text-[#9aa2ad]">{notice.message}</p></div><button type="button" aria-label="Fechar" onClick={() => setNotice(null)}><X className="size-4 text-[#9aa2ad]" /></button></div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function MenuSkeleton() {
  return <div className="space-y-14">{[0, 1, 2].map((item) => <div key={item} className="animate-pulse"><div className="mx-auto h-6 w-40 rounded bg-white/5" /><div className="mt-8 flex justify-center gap-16"><div className="size-24 rounded-full bg-white/5" /><div className="size-24 rounded-full bg-white/5" /></div></div>)}</div>;
}
