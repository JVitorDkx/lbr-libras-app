import { motion } from "framer-motion";
import { Check, Hash, Languages, LockKeyhole, MessageCircleMore, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getLevelStatus, type PlayerProgress } from "../lib/progress";
import type { GameLevel, LevelAccent, LevelViewStatus } from "../types/game";

interface LevelPathProps {
  levels: GameLevel[];
  progress: PlayerProgress;
  onSelect: (level: GameLevel, status: LevelViewStatus) => void;
}

const icons: Record<string, LucideIcon> = {
  cumprimentos: MessageCircleMore,
  alfabeto: Languages,
  numeros: Hash,
};

const accents: Record<LevelAccent, { node: string; glow: string; text: string }> = {
  violet: {
    node: "from-brand-violet-light to-brand-violet-dark",
    glow: "shadow-[0_8px_0_#4a2fd6,0_18px_35px_var(--color-brand-violet-glow)]",
    text: "text-brand-violet-light",
  },
  cyan: {
    node: "from-brand-cyan to-[#159f99]",
    glow: "shadow-[0_8px_0_#117c78,0_18px_35px_rgb(53_214_197_/_0.18)]",
    text: "text-brand-cyan",
  },
  amber: {
    node: "from-brand-amber to-[#e49b18]",
    glow: "shadow-[0_8px_0_#a86d10,0_18px_35px_rgb(255_200_61_/_0.16)]",
    text: "text-brand-amber",
  },
};

export function LevelPath({ levels, progress, onSelect }: LevelPathProps) {
  return (
    <div className="relative mt-7 pb-3">
      <div className="absolute bottom-20 left-1/2 top-16 w-1 -translate-x-1/2 rounded-full bg-[linear-gradient(to_bottom,var(--color-brand-violet),var(--color-app-border)_38%,var(--color-app-border))]" />

      <div className="relative space-y-12">
        {levels.map((level, index) => {
          const status = getLevelStatus(level, progress);
          const Icon = icons[level.id] ?? Languages;
          const accent = accents[level.accent];
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const offset = index % 2 === 0 ? "-translate-x-10" : "translate-x-10";

          return (
            <motion.article
              key={level.id}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.14 + index * 0.12, type: "spring", stiffness: 240, damping: 22 }}
              className="flex flex-col items-center"
            >
              <motion.button
                type="button"
                whileHover={isLocked ? undefined : { y: -3, scale: 1.03 }}
                whileTap={isLocked ? { scale: 0.97 } : { y: 5, scale: 0.98 }}
                onClick={() => onSelect(level, status)}
                aria-label={`${level.title}: ${isCompleted ? "concluído" : isLocked ? "bloqueado" : "disponível"}`}
                className={`relative grid size-[5.5rem] place-items-center rounded-[1.8rem] border-4 border-app transition-[filter,opacity] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan ${offset} ${
                  isLocked
                    ? "bg-app-elevated text-app-subtle shadow-[0_7px_0_#0f1218]"
                    : `bg-gradient-to-b text-white ${accent.node} ${accent.glow}`
                }`}
              >
                {isLocked ? <LockKeyhole className="size-8" /> : <Icon className="size-9" strokeWidth={2.3} />}
                <span className={`absolute -right-2 -top-2 grid size-7 place-items-center rounded-full border-[3px] border-app text-xs font-black ${
                  isCompleted ? "bg-success text-app" : isLocked ? "bg-app-border text-app-muted" : "bg-app-text text-app"
                }`}>
                  {isCompleted ? <Check className="size-4" strokeWidth={3.5} /> : level.order}
                </span>
                {!isLocked && !isCompleted && (
                  <motion.span
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="absolute -bottom-3 -right-4 grid size-8 place-items-center rounded-full border-[3px] border-app bg-app-text text-app"
                  >
                    <Play className="ml-0.5 size-3.5" fill="currentColor" />
                  </motion.span>
                )}
              </motion.button>

              <div className={`mt-5 w-full max-w-[17rem] rounded-2xl border bg-app-card/95 px-4 py-3 text-center backdrop-blur ${
                isLocked ? "border-app-border opacity-65" : "border-app-border shadow-card"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isLocked ? "text-app-subtle" : accent.text}`}>
                    Nível {level.order}
                  </p>
                  {isCompleted && <span className="rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-black uppercase text-success">Concluído</span>}
                </div>
                <h3 className="mt-1 font-display text-lg font-extrabold">{level.title}</h3>
                <p className="mt-0.5 text-xs leading-5 text-app-muted">{level.description}</p>
                <p className="mt-2 text-[10px] font-bold text-app-subtle">{isLocked ? "Conclua a fase anterior" : `+${level.reward_xp} XP · ${level.question_count || "em breve"} questões`}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
