import { motion } from "framer-motion";
import { Braces, Check, Hand } from "lucide-react";

const foundations = [
  { label: "React + Vite", detail: "Interface mobile-first", color: "bg-brand-violet" },
  { label: "FastAPI", detail: "Dados e regras do jogo", color: "bg-brand-cyan" },
  { label: "Tailwind CSS", detail: "Design system premium", color: "bg-brand-amber" },
];

export default function App() {
  return (
    <main className="min-h-dvh overflow-hidden bg-app text-app-text">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,var(--color-brand-violet-glow),transparent_68%)]" />

      <section className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8 sm:px-7">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <div className="grid size-12 place-items-center rounded-2xl bg-brand-violet shadow-tactile-violet">
            <Hand aria-hidden="true" className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-cyan">IFRO • TCC</p>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">LBRLibras</h1>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
          className="mt-14 rounded-[2rem] border border-app-border bg-app-card/90 p-6 shadow-card backdrop-blur"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1.5 text-xs font-bold text-brand-cyan">
            <Check className="size-3.5" strokeWidth={3} />
            Bloco 1 preparado
          </span>

          <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight">
            Uma base limpa para aprender Libras jogando.
          </h2>
          <p className="mt-3 text-sm leading-6 text-app-muted">
            A fundação técnica está separada em frontend e backend para evoluirmos cada experiência com clareza.
          </p>

          <div className="mt-7 space-y-3">
            {foundations.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + index * 0.08 }}
                className="flex items-center gap-4 rounded-2xl border border-app-border bg-app-elevated p-4"
              >
                <span className={`size-3 rounded-full ${item.color} shadow-[0_0_18px_currentColor]`} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{item.label}</p>
                  <p className="text-xs text-app-muted">{item.detail}</p>
                </div>
                <Check className="size-5 text-success" strokeWidth={3} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-auto pt-10">
          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ y: 3, scale: 0.99 }}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-violet px-5 font-extrabold shadow-tactile-violet transition-shadow hover:shadow-tactile-violet-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-cyan"
          >
            <Braces aria-hidden="true" className="size-5" />
            Próximo: trilha de níveis
          </motion.button>
          <p className="mt-4 text-center text-xs text-app-subtle">Protótipo acadêmico • Sistemas para Internet</p>
        </div>
      </section>
    </main>
  );
}

