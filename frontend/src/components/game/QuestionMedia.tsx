import { Hand, ImageOff, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";

import { resolveMediaUrl } from "../../lib/api";
import type { GameQuestion } from "../../types/game";

interface QuestionMediaProps {
  question: GameQuestion;
}

export function QuestionMedia({ question }: QuestionMediaProps) {
  const isPlaceholder = question.media_url.includes("-placeholder.");
  const [failed, setFailed] = useState(isPlaceholder);

  useEffect(() => setFailed(isPlaceholder), [isPlaceholder, question.id]);

  const mediaUrl = resolveMediaUrl(question.media_url);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] border border-app-border bg-[radial-gradient(circle_at_50%_35%,rgb(109_74_255_/_0.22),transparent_58%),var(--color-app-elevated)]">
      {!failed && question.media_type === "video" && (
        <video
          key={question.id}
          src={mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setFailed(true)}
          className="size-full object-cover"
          aria-label="Demonstração em vídeo do sinal de Libras"
        />
      )}

      {!failed && question.media_type !== "video" && (
        <img
          key={question.id}
          src={mediaUrl}
          alt="Demonstração visual do sinal de Libras"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      )}

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative grid size-24 place-items-center rounded-[2rem] border border-brand-violet-light/25 bg-brand-violet/15 text-brand-violet-light shadow-[0_18px_45px_var(--color-brand-violet-glow)]">
            <Hand className="size-11" strokeWidth={1.8} />
            <ScanLine className="absolute -right-2 -top-2 size-7 rounded-lg bg-brand-cyan p-1.5 text-app" />
          </div>
          <p className="mt-5 font-display text-lg font-extrabold">Demonstração do sinal</p>
          <p className="mt-1 max-w-[15rem] text-xs leading-5 text-app-muted">
            Espaço preparado para vídeo, GIF ou imagem validada por um profissional de Libras.
          </p>
        </div>
      )}

      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-app/75 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-app-muted backdrop-blur">
        {failed && <ImageOff className="size-3" />}
        Mídia visual
      </div>
    </div>
  );
}
