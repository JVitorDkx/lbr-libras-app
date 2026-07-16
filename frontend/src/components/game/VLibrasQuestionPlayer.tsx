import { Box, CloudOff, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  attachVLibrasGamePlayer,
  detachVLibrasGamePlayer,
} from "../../lib/vlibrasGamePlayer";

interface VLibrasQuestionPlayerProps {
  correctAnswerPhrase: string;
}

type PlayerStatus = "loading" | "ready" | "error";

export function VLibrasQuestionPlayer({
  correctAnswerPhrase,
}: VLibrasQuestionPlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let active = true;
    setStatus("loading");

    attachVLibrasGamePlayer(mount, correctAnswerPhrase)
      .then(() => {
        if (active) setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
      detachVLibrasGamePlayer(mount);
    };
  }, [correctAnswerPhrase, retryKey]);

  return (
    <div className="absolute inset-0">
      <span className="sr-only" data-vlibras-question-target>
        {correctAnswerPhrase}
      </span>
      <div ref={mountRef} className="lbr-vlibras-stage absolute inset-0" />

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgb(109_74_255_/_0.2),transparent_58%),#121722]">
          <div className="text-center">
            <div className="relative mx-auto grid size-20 place-items-center rounded-[1.6rem] border border-brand-violet-light/20 bg-brand-violet/10">
              <Box className="size-9 text-brand-violet-light" />
              <LoaderCircle className="absolute -right-2 -top-2 size-7 animate-spin rounded-full bg-brand-cyan p-1.5 text-app" />
            </div>
            <p className="mt-4 text-sm font-black">Preparando avatar 3D</p>
            <p className="mt-1 text-[11px] text-app-muted">Conectando ao motor do VLibras...</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_42%,rgb(255_95_109_/_0.12),transparent_58%),#121722] p-6 text-center">
          <div>
            <div className="mx-auto grid size-20 place-items-center rounded-[1.6rem] border border-danger/20 bg-danger/10 text-danger">
              <CloudOff className="size-9" />
            </div>
            <p className="mt-4 font-display text-base font-black">Avatar indisponível</p>
            <p className="mx-auto mt-1 max-w-[15rem] text-xs leading-5 text-app-muted">
              Verifique sua conexão com a internet e tente carregar o VLibras novamente.
            </p>
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="mt-4 min-h-10 rounded-xl bg-brand-violet px-4 text-xs font-black text-white"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {status === "ready" && (
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-brand-cyan/20 bg-app/80 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-brand-cyan backdrop-blur">
            <Sparkles className="size-3" />
            Avatar VLibras
          </span>
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-app/80 text-white backdrop-blur hover:bg-app-card"
            aria-label="Repetir sinal no avatar"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
