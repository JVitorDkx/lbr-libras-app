import { Flame, Settings, Star } from "lucide-react";

interface MenuHeaderProps {
  xp: number;
  streakDays: number;
}

export function MenuHeader({ xp, streakDays }: MenuHeaderProps) {
  return (
    <header className="px-5 pb-5 pt-6">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-gradient-to-br from-[#234f4d] to-[#17383a] p-[2px] ring-2 ring-[#5c42ff]">
          <div className="grid size-full place-items-center rounded-full bg-[#174446] text-sm font-black">JV</div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-extrabold">JVitor</p>
          <p className="text-[11px] text-[#9098a3]">Level 14</p>
        </div>
        <button type="button" aria-label="Configurações" className="grid size-11 place-items-center rounded-full text-white transition hover:bg-white/5">
          <Settings className="size-5" />
        </button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="flex items-center gap-2 text-xl font-black"><Star className="size-5 fill-[#ffe500] text-[#ffe500]" />{xp.toLocaleString("pt-BR")}</p>
          <p className="mt-0.5 text-[11px] text-[#9098a3]">Estrelas conquistadas</p>
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-2 text-xl font-black"><Flame className="size-5 fill-[#ff3f4f] text-[#ff3f4f]" />{streakDays}</p>
          <p className="mt-0.5 text-[11px] text-[#9098a3]">Sequência do dia</p>
        </div>
      </div>
    </header>
  );
}
