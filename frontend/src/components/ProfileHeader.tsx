import { Flame, Hand, Star } from "lucide-react";

interface ProfileHeaderProps {
  xp: number;
  streakDays: number;
}

const XP_PER_LEVEL = 500;

export function ProfileHeader({ xp, streakDays }: ProfileHeaderProps) {
  const playerLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;
  const progress = Math.min(100, (xpInLevel / XP_PER_LEVEL) * 100);

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-app-border/80 bg-app/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[5.5rem] w-full max-w-md items-center gap-3 px-5 sm:px-6">
        <div className="relative grid size-12 shrink-0 place-items-center rounded-2xl border border-brand-violet-light/30 bg-gradient-to-br from-brand-violet to-brand-violet-dark shadow-[0_8px_24px_var(--color-brand-violet-glow)]">
          <Hand aria-hidden="true" className="size-6" strokeWidth={2.4} />
          <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-app bg-brand-cyan text-[10px] font-black text-app">
            {playerLevel}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">Olá, João!</p>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-app-muted">
                <Star aria-hidden="true" className="size-3 text-brand-amber" fill="currentColor" />
                Nível {playerLevel} · {xp} XP
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-brand-amber/15 bg-brand-amber/10 px-2.5 py-1.5 text-brand-amber">
              <Flame aria-hidden="true" className="size-4" fill="currentColor" />
              <span className="text-sm font-black tabular-nums">{streakDays}</span>
            </div>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-app-elevated" aria-label={`${xpInLevel} de ${XP_PER_LEVEL} XP no nível atual`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
