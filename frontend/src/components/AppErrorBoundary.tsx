import { RefreshCw, ShieldAlert } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Falha inesperada na interface LBRLibras", error, info);
    }
  }

  private reload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-dvh place-items-center bg-app px-5 py-10 text-app-text">
        <section
          className="w-full max-w-sm rounded-[2rem] border border-danger/20 bg-app-card p-7 text-center shadow-card"
          role="alert"
          aria-labelledby="app-error-title"
        >
          <div className="mx-auto grid size-20 place-items-center rounded-[1.6rem] border border-danger/20 bg-danger/10 text-danger">
            <ShieldAlert className="size-9" aria-hidden="true" />
          </div>
          <h1 id="app-error-title" className="mt-5 font-display text-2xl font-black">
            Algo inesperado aconteceu
          </h1>
          <p className="mt-2 text-sm leading-6 text-app-muted">
            Seu progresso salvo continua protegido. Recarregue o aplicativo para
            restaurar a interface.
          </p>
          <button
            type="button"
            onClick={this.reload}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-violet px-5 font-black text-white shadow-tactile-violet transition hover:-translate-y-0.5 hover:shadow-tactile-violet-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cyan"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Recarregar aplicativo
          </button>
        </section>
      </main>
    );
  }
}
