import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, CircleDashed, Target, TrendingUp } from "lucide-react";

import type { LearningAnalytics, MasteryStatus, ModulePerformance } from "../types/game";

interface LearningAnalyticsSectionProps {
  analytics: LearningAnalytics;
}

const masteryPresentation: Record<
  MasteryStatus,
  { label: string; color: string; surface: string; Icon: typeof CheckCircle2 }
> = {
  excellent: {
    label: "Excelente domínio",
    color: "#42dc84",
    surface: "rgb(66 220 132 / 0.1)",
    Icon: CheckCircle2,
  },
  good_progress: {
    label: "Bom progresso",
    color: "#38d6c5",
    surface: "rgb(56 214 197 / 0.1)",
    Icon: TrendingUp,
  },
  needs_practice: {
    label: "Precisa praticar",
    color: "#ff966a",
    surface: "rgb(255 150 106 / 0.1)",
    Icon: AlertTriangle,
  },
  not_started: {
    label: "Ainda não iniciado",
    color: "#8e97a4",
    surface: "rgb(142 151 164 / 0.08)",
    Icon: CircleDashed,
  },
};

export function LearningAnalyticsSection({ analytics }: LearningAnalyticsSectionProps) {
  return (
    <section className="mt-9" aria-labelledby="learning-analytics-title">
      <div className="mb-3 px-1">
        <h1 id="learning-analytics-title" className="font-display text-[1.35rem] font-black">
          Desempenho por módulo
        </h1>
        <p className="mt-1 text-xs leading-5 text-[#929aa6]">
          Aproveitamento calculado a partir de cada tentativa registrada.
        </p>
      </div>

      <div className="rounded-[1.4rem] border border-[#6042ff]/20 bg-[linear-gradient(135deg,rgb(96_66_255_/_0.13),rgb(14_17_22_/_0.9))] p-5">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#6042ff]/20 text-[#8b78ff]">
            <Target className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#929aa6]">Taxa geral de acerto</p>
            <p className="mt-1 font-display text-3xl font-black">
              {analytics.overall_accuracy_percent}%
            </p>
          </div>
          <div className="text-right text-[11px] leading-5 text-[#929aa6]">
            <p><strong className="text-white">{analytics.correct_attempts}</strong> acertos</p>
            <p><strong className="text-white">{analytics.total_attempts}</strong> tentativas</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#252a32]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${analytics.overall_accuracy_percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#6042ff] to-[#38d6c5]"
          />
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {analytics.modules.map((module, index) => (
          <ModulePerformanceCard key={module.level_id} module={module} index={index} />
        ))}
      </div>
    </section>
  );
}

function ModulePerformanceCard({ module, index }: { module: ModulePerformance; index: number }) {
  const presentation = masteryPresentation[module.mastery_status];
  const Icon = presentation.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index }}
      className="rounded-2xl border border-[#252a32] bg-[#10141a] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7f8895]">
            {module.category}
          </p>
          <h2 className="mt-1 font-display text-base font-black">{module.title}</h2>
        </div>
        <span
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-black"
          style={{ color: presentation.color, backgroundColor: presentation.surface }}
        >
          <Icon className="size-3.5" />
          {presentation.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric value={`${module.accuracy_percent}%`} label="Acertos" />
        <Metric value={`${module.signs_mastered}/${module.total_signs}`} label="Sinais" />
        <Metric value={module.attempts} label="Tentativas" />
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-[#929aa6]">
        <span>Domínio do conteúdo</span>
        <span>{module.progress_percent}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#252a32]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${module.progress_percent}%` }}
          transition={{ delay: 0.12 + index * 0.08, duration: 0.65 }}
          className="h-full rounded-full"
          style={{ backgroundColor: presentation.color }}
        />
      </div>
    </motion.article>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-[#0b0d12]/70 px-2 py-2.5">
      <p className="font-display text-sm font-black">{value}</p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#7f8895]">{label}</p>
    </div>
  );
}
