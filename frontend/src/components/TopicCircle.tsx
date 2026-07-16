import { motion } from "framer-motion";
import { CaseUpper, Hand, Hash, LockKeyhole, Smile, SpellCheck } from "lucide-react";

import type { GameLevel, LevelViewStatus } from "../types/game";

const colors = { violet: "#5637f5", cyan: "#35cfc2", coral: "#ff8a5d", indigo: "#24216b", teal: "#269f98", amber: "#ffda19" };
const icons = { hands: Hand, smile: Smile, letters: CaseUpper, spell: SpellCheck, numbers: Hash };

interface TopicCircleProps {
  level: GameLevel;
  status: LevelViewStatus;
  index: number;
  onSelect: () => void;
}

export function TopicCircle({ level, status, index, onSelect }: TopicCircleProps) {
  const Icon = icons[level.icon_key as keyof typeof icons] ?? Hand;
  const color = colors[level.accent];
  const locked = status === "locked";
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 18, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.08 * index, type: "spring", stiffness: 280, damping: 22 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.94 }}
      className="group flex flex-col items-center"
      aria-label={`${level.title}: ${level.progress_percent}%${locked ? ", bloqueado" : ""}`}
    >
      <span className="grid size-[5.5rem] place-items-center rounded-full p-[5px] shadow-[0_12px_32px_rgba(0,0,0,.25)]" style={{ background: locked ? "#242932" : `conic-gradient(${color} ${level.progress_percent}%, #242932 0)` }}>
        <span className="grid size-full place-items-center rounded-full border-[5px] border-[#0b0d12] text-white" style={{ backgroundColor: locked ? "#20242b" : color }}>
          <span className="flex flex-col items-center">
            {locked ? <LockKeyhole className="size-7 text-[#7e8792]" /> : <Icon className="size-8" strokeWidth={2.2} />}
            <span className="mt-1 text-[11px] font-black">{level.progress_percent}%</span>
          </span>
        </span>
      </span>
      <span className={`mt-3 max-w-28 text-sm font-extrabold leading-tight ${locked ? "text-[#747c87]" : "text-white"}`}>{level.title}</span>
    </motion.button>
  );
}
