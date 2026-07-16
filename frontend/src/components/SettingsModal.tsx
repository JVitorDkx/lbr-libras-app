import { AnimatePresence, motion } from "framer-motion";
import { Info, RotateCcw, Settings, Volume2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import type { AppSettings } from "../lib/settings";

interface SettingsModalProps {
  open: boolean;
  settings: AppSettings;
  resetting: boolean;
  resetError: boolean;
  onChange: <Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]) => void;
  onReset: () => Promise<void>;
  onClose: () => void;
}

export function SettingsModal({ open, settings, resetting, resetError, onChange, onReset, onClose }: SettingsModalProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!open) setConfirmReset(false);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 px-3 backdrop-blur-sm sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
          <motion.section role="dialog" aria-modal="true" aria-labelledby="settings-title" initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 28, scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 28 }} className="mb-3 w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#141820] shadow-2xl sm:mb-0">
            <header className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
              <span className="grid size-10 place-items-center rounded-xl bg-[#6042ff]/15 text-[#806aff]"><Settings className="size-5" /></span>
              <div className="flex-1"><h1 id="settings-title" className="font-display text-lg font-black">Configurações</h1><p className="text-xs text-[#9098a3]">Personalize sua experiência</p></div>
              <button type="button" onClick={onClose} aria-label="Fechar configurações" className="grid size-10 place-items-center rounded-full text-[#9aa2ad] hover:bg-white/5"><X className="size-5" /></button>
            </header>

            <div className="space-y-2 p-4">
              <SettingToggle icon={<Volume2 className="size-5" />} title="Sons e efeitos" description="Feedback sonoro de acertos e erros" checked={settings.soundsEnabled} onChange={(value) => onChange("soundsEnabled", value)} />

              <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-4">
                <div className="flex gap-3"><RotateCcw className="mt-0.5 size-5 shrink-0 text-red-400" /><div><h2 className="text-sm font-extrabold">Resetar progresso</h2><p className="mt-1 text-xs leading-5 text-[#929aa6]">Zera XP, fases, estatísticas, respostas e conquistas neste protótipo.</p></div></div>
                {!confirmReset ? (
                  <button type="button" onClick={() => setConfirmReset(true)} className="mt-3 min-h-11 w-full rounded-xl border border-red-400/25 text-xs font-black text-red-300 transition hover:bg-red-400/10">Resetar progresso</button>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={resetting} onClick={() => setConfirmReset(false)} className="min-h-11 rounded-xl bg-white/5 text-xs font-bold">Cancelar</button><button type="button" disabled={resetting} onClick={() => void onReset()} className="min-h-11 rounded-xl bg-red-500 text-xs font-black text-white disabled:opacity-60">{resetting ? "Resetando..." : "Confirmar reset"}</button></div>
                )}
                {resetError && <p role="alert" className="mt-2 text-center text-xs font-bold text-red-300">Não foi possível resetar. Verifique a API.</p>}
              </div>

              <div className="flex gap-3 rounded-2xl bg-white/[0.025] p-4"><Info className="mt-0.5 size-5 shrink-0 text-[#38d6c5]" /><div><h2 className="text-sm font-extrabold">Sobre o App</h2><p className="mt-1 text-xs leading-5 text-[#929aa6]">LBRLibras v1.0 — TCC Sistemas para Internet IFRO</p></div></div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SettingToggleProps { icon: ReactNode; title: string; description: string; checked: boolean; onChange: (value: boolean) => void }

function SettingToggle({ icon, title, description, checked, onChange }: SettingToggleProps) {
  return <div className="flex items-center gap-3 rounded-2xl bg-white/[0.025] p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#6042ff]/10 text-[#806aff]">{icon}</span><label className="min-w-0 flex-1"><span className="block text-sm font-extrabold">{title}</span><span className="mt-1 block text-[11px] leading-4 text-[#929aa6]">{description}</span></label><button type="button" role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-[#6042ff]" : "bg-[#303641]"}`}><motion.span animate={{ x: checked ? 22 : 3 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} className="absolute left-0 top-1 size-5 rounded-full bg-white shadow" /></button></div>;
}
