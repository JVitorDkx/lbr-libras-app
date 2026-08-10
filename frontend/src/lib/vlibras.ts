export const VLIBRAS_APP_URL = "https://vlibras.gov.br/app";
export const VLIBRAS_SCRIPT_ID = "lbrlibras-vlibras-script";
export const VLIBRAS_ROOT_ID = "lbrlibras-vlibras-root";

export interface VLibrasPlayer {
  loaded: boolean;
  stop: () => void;
  translate: (text: string) => void;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
}

export interface VLibrasPlugin {
  player: VLibrasPlayer;
}

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
      Plugin?: new (options: Record<string, unknown>) => VLibrasPlugin;
    };
    plugin?: VLibrasPlugin;
    __lbrlibrasVLibrasWidget?: unknown;
  }
}

let scriptPromise: Promise<void> | null = null;
let widgetPromise: Promise<unknown> | null = null;

/**
 * Libera somente o estado de carregamento que pode ser recriado com segurança.
 * Uma instância saudável do widget nunca é duplicada: a tag externa só é
 * removida quando a biblioteca nem chegou a registrar `window.VLibras`.
 */
export function resetVLibrasLoaderForRetry() {
  scriptPromise = null;
  widgetPromise = null;

  if (!window.VLibras) {
    document.getElementById(VLIBRAS_SCRIPT_ID)?.remove();
  }
}

export function loadVLibrasScript(timeoutMs = 12_000): Promise<void> {
  if (window.VLibras) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    let script = document.getElementById(VLIBRAS_SCRIPT_ID) as HTMLScriptElement | null;
    const timeout = window.setTimeout(() => {
      scriptPromise = null;
      reject(new Error("Tempo limite ao carregar o VLibras."));
    }, timeoutMs);

    const finish = () => {
      window.clearTimeout(timeout);
      window.VLibras ? resolve() : reject(new Error("VLibras indisponível."));
    };
    const fail = () => {
      window.clearTimeout(timeout);
      scriptPromise = null;
      reject(new Error("Falha ao carregar o script do VLibras."));
    };

    if (!script) {
      script = document.createElement("script");
      script.id = VLIBRAS_SCRIPT_ID;
      script.src = `${VLIBRAS_APP_URL}/vlibras-plugin.js`;
      script.async = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", fail, { once: true });
  });

  return scriptPromise;
}

export function getVLibrasRoot(): HTMLElement | null {
  return document.getElementById(VLIBRAS_ROOT_ID);
}

export function ensureVLibrasWidget(): Promise<unknown> {
  if (window.__lbrlibrasVLibrasWidget) {
    return Promise.resolve(window.__lbrlibrasVLibrasWidget);
  }
  if (widgetPromise) return widgetPromise;

  widgetPromise = loadVLibrasScript()
    .then(() => {
      if (!window.VLibras?.Widget) {
        throw new Error("Biblioteca VLibras indisponível.");
      }

      window.__lbrlibrasVLibrasWidget ??= new window.VLibras.Widget(
        VLIBRAS_APP_URL,
      );
      return window.__lbrlibrasVLibrasWidget;
    })
    .catch((error) => {
      widgetPromise = null;
      throw error;
    });

  return widgetPromise;
}

export async function waitFor<T>(
  readValue: () => T | null | undefined | false,
  timeoutMs = 18_000,
  intervalMs = 100,
): Promise<T> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = readValue();
    if (value) return value;
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }
  throw new Error("Tempo limite de inicialização do player VLibras.");
}
