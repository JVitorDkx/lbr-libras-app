import { motion } from "framer-motion";
import { Award, Flame, Hand, Medal, Settings, Sparkles, Star, Trophy, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { apiGet } from "../lib/api";
import type { Achievement, PlayerProfile } from "../types/game";
import { AppNavigation, type MainTab } from "./AppNavigation";

interface ProfileScreenProps { onNavigate: (tab: MainTab) => void; onOpenSettings: () => void }

const colors = { violet: "#6042ff", cyan: "#38d6c5", coral: "#ff8b61", indigo: "#4f46e5", teal: "#2aa59e", amber: "#ffe000" };
const achievementIcons = { trophy: Trophy, medal: Medal, badge: Award, star: Star };

export function ProfileScreen({ onNavigate, onOpenSettings }: ProfileScreenProps) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setFailed(false);
    apiGet<PlayerProfile>("/game/profile", controller.signal)
      .then(setProfile)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-dvh bg-[#0b0d12] text-white">
      <div className="mx-auto min-h-dvh w-full max-w-md border-x border-white/[0.03] shadow-2xl">
        {profile ? <ProfileHeader profile={profile} onOpenSettings={onOpenSettings} /> : <div className="h-[7.5rem] animate-pulse bg-white/[0.02]" />}
        <AppNavigation active="profile" onNavigate={onNavigate} />
        {failed && <div className="m-5 rounded-2xl border border-red-400/20 p-6 text-center"><WifiOff className="mx-auto text-red-400" /><p className="mt-3 font-bold">Não foi possível carregar o perfil.</p></div>}
        {profile && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="px-3 pb-16 pt-8">
            <LearningProgress profile={profile} />
            <section className="mt-9">
              <div className="mb-3 flex items-end justify-between px-1">
                <h1 className="font-display text-[1.35rem] font-black">Conquistas</h1>
                <span className="text-xs font-bold text-[#38d6c5]">{profile.achievements_unlocked}/{profile.achievements_total}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {profile.achievements.map((achievement, index) => <AchievementCard key={achievement.id} achievement={achievement} index={index} />)}
              </div>
            </section>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function ProfileHeader({ profile, onOpenSettings }: { profile: PlayerProfile; onOpenSettings: () => void }) {
  return <header className="flex items-center gap-3 px-5 py-6"><div className="size-14 rounded-full bg-[#194446] ring-2 ring-[#6042ff]" /><div className="min-w-0 flex-1"><p className="font-display text-lg font-black">{profile.display_name}</p><div className="mt-2 flex items-center gap-2"><span className="rounded-lg bg-[#6042ff] px-2 py-1 text-[10px] font-black">Level {profile.level_number}</span><span className="text-[11px] text-[#929aa6]">• {profile.xp.toLocaleString("pt-BR")} XP</span></div></div><button type="button" onClick={onOpenSettings} aria-label="Abrir configurações" className="grid size-10 place-items-center rounded-full hover:bg-white/5"><Settings className="size-5" /></button></header>;
}

function LearningProgress({ profile }: { profile: PlayerProfile }) {
  const stats = [
    { value: profile.streak_days, label: "Sequência do dia", Icon: Flame, color: "#ff4656" },
    { value: `${profile.best_combo}x`, label: "Maior combo", Icon: Sparkles, color: "#ff966a" },
    { value: profile.signs_learned, label: "Sinais aprendidos", Icon: Hand, color: "#32d4c3" },
    { value: profile.lessons_completed, label: "Aulas concluídas", Icon: Trophy, color: "#6042ff" },
  ];
  return <section className="rounded-[1.4rem] border border-white/[0.035] bg-[#0e1116] p-5 shadow-[0_12px_35px_rgba(0,0,0,.14)]"><h1 className="font-display text-lg font-black">Progresso de aprendizagem</h1><div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5">{stats.map(({ value, label, Icon, color }) => <div key={label}><p className="flex items-center gap-2 text-2xl font-black" style={{ color }}><Icon className="size-5" fill={label === "Sequência do dia" ? color : "none"} />{value}</p><p className="mt-1 text-xs text-[#969eaa]">{label}</p></div>)}</div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#252a32]"><motion.div initial={{ width: 0 }} animate={{ width: `${profile.learning_progress_percent}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-[#6042ff]" /></div></section>;
}

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const Icon = achievementIcons[achievement.icon_key as keyof typeof achievementIcons] ?? Trophy;
  const color = colors[achievement.accent];
  return <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.08 }} className="flex min-h-44 flex-col items-center justify-end rounded-xl border border-[#252a32] bg-[#10141a] px-4 pb-4 pt-5 text-center"><Icon className="size-7" style={{ color }} fill={achievement.icon_key === "star" ? color : "none"} /><h2 className="mt-4 max-w-28 text-[15px] font-bold leading-[1.08]">{achievement.title}</h2><p className="mt-2 text-xs text-[#9199a5]">{achievement.description}</p><div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#252a32]"><div className="h-full rounded-full" style={{ width: `${achievement.progress_percent}%`, backgroundColor: color }} /></div></motion.article>;
}
