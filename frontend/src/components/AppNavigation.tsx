import { motion } from "framer-motion";
import { Home, UserRound } from "lucide-react";

export type MainTab = "menu" | "profile";

interface AppNavigationProps {
  active: MainTab;
  onNavigate: (tab: MainTab) => void;
}

const tabs = [
  { id: "menu" as const, label: "Menu", Icon: Home },
  { id: "profile" as const, label: "Perfil", Icon: UserRound },
];

export function AppNavigation({ active, onNavigate }: AppNavigationProps) {
  return (
    <nav aria-label="Navegação principal" className="grid grid-cols-2 border-y border-white/5 bg-[#0e1117]">
      {tabs.map(({ id, label, Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onNavigate(id)}
            className={`relative flex min-h-16 items-center justify-center gap-2 text-xs font-bold transition-colors ${selected ? "text-[#6c50ff]" : "text-[#8f98a5] hover:text-white"}`}
          >
            <Icon className="size-5" strokeWidth={selected ? 2.6 : 2} />
            <span>{label}</span>
            {selected && <motion.span layoutId="active-tab" className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-[#6042ff]" />}
          </button>
        );
      })}
    </nav>
  );
}
