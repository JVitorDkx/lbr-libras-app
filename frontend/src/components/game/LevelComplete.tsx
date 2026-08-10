import { motion } from "framer-motion";
import { ArrowRight, Check, Crown, Flame, Sparkles, Star, Trophy } from "lucide-react";

import type { CompleteLevelResult, GameLevel } from "../../types/game";

interface LevelCompleteProps {
  level: GameLevel;
  awardedXp: number;
  startXp: number;
  startLevel: number;
  maxCombo: number;
  result: CompleteLevelResult;
  onReturn: () => void;
}

export function LevelComplete({ level, awardedXp, startXp, startLevel, maxCombo, result, onReturn }: LevelCompleteProps) {
  const leveledUp = result.level_number > startLevel;
  const levelRange = result.next_level_xp - result.level_start_xp;
  const startPercent = leveledUp
    ? 0
    : Math.max(0, Math.min(100, ((startXp - result.level_start_xp) / levelRange) * 100));
  const endPercent = Math.max(
    0,
    Math.min(100, ((result.xp - result.level_start_xp) / levelRange) * 100),
  );

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-app px-5 py-10 text-app-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgb(255_200_61_/_0.18),transparent_34%),radial-gradient(circle_at_50%_42%,var(--color-brand-violet-glow),transparent_55%)]" />
      <div className="relative mx-auto flex w-full max-w-sm flex-col items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.4, rotate: -18 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 16 }} className="relative grid size-32 place-items-center rounded-[2.5rem] border-4 border-brand-amber/25 bg-brand-amber text-app shadow-[0_10px_0_#b97913,0_30px_70px_rgb(255_200_61_/_0.22)]">
          <Trophy className="size-16" strokeWidth={2.2} />
          <Sparkles className="absolute -right-5 -top-4 size-8 text-brand-cyan" />
          <Star className="absolute -bottom-4 -left-5 size-8 fill-brand-violet-light text-brand-violet-light" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <p className="mt-10 text-[11px] font-black uppercase tracking-[0.22em] text-brand-amber">Nível concluído</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight">Mandou muito bem!</h1>
          <p className="mt-3 text-sm leading-6 text-app-muted">Você completou {level.title} e deu mais um passo na sua jornada em Libras.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mt-8 grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl border border-brand-violet/25 bg-brand-violet/10 p-4">
            <Star className="mx-auto size-5 fill-brand-violet-light text-brand-violet-light" />
            <p className="mt-2 font-display text-2xl font-black">+{awardedXp}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-app-muted">XP ganhos</p>
          </div>
          <div className="rounded-2xl border border-brand-amber/20 bg-brand-amber/10 p-4">
            <Flame className="mx-auto size-5 fill-brand-amber text-brand-amber" />
            <p className="mt-2 font-display text-2xl font-black">{result.streak_days}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-app-muted">dias de ofensiva</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 220, damping: 18 }}
          className="mt-3 flex w-full items-center justify-between rounded-2xl border border-brand-amber/25 bg-gradient-to-r from-brand-amber/10 to-danger/5 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-amber/15 text-brand-amber">
              <Flame className="size-5 fill-brand-amber" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-app-muted">Maior combo da aula</p>
              <p className="mt-0.5 text-xs font-bold text-app-text">Acertos consecutivos</p>
            </div>
          </div>
          <p className="font-display text-2xl font-black text-brand-amber">{maxCombo}x</p>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-5 w-full rounded-2xl border border-white/10 bg-app-card/80 p-4 text-left">
          <div className="flex items-center justify-between text-xs font-black">
            <span>Level {result.level_number}</span>
            <span className="text-brand-violet-light">{result.xp - result.level_start_xp}/{levelRange} XP</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/5 bg-app-elevated">
            <motion.div
              initial={{ width: `${startPercent}%` }}
              animate={{ width: `${endPercent}%` }}
              transition={{ delay: 0.65, duration: 1.15, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan"
            />
          </div>
          <p className="mt-2 text-[10px] text-app-muted">Próximo nível em {Math.max(0, result.next_level_xp - result.xp)} XP</p>
        </motion.section>

        {leveledUp && (
          <motion.div initial={{ opacity: 0, scale: 0.72, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1, type: "spring", stiffness: 240, damping: 17 }} className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-brand-amber/30 bg-brand-amber/10 p-4 text-left">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-amber text-app"><Crown className="size-6" /></span>
            <div><p className="font-display text-lg font-black text-brand-amber">Level Up! 🌟</p><p className="text-xs text-app-muted">Você avançou do nível {startLevel} para o nível {result.level_number}.</p></div>
          </motion.div>
        )}

        {result.awarded_xp > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-4 flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-4 py-2 text-xs font-extrabold text-success">
            <Check className="size-4" strokeWidth={3} />
            Progresso da trilha atualizado
          </motion.div>
        )}

        <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ y: 4, scale: 0.99 }} onClick={onReturn} className="mt-9 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-violet px-5 font-black shadow-tactile-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan">
          Continuar para a trilha
          <ArrowRight className="size-5" />
        </motion.button>
      </div>
    </main>
  );
}
