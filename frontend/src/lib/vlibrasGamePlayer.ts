import {
  ensureVLibrasWidget,
  getVLibrasRoot,
  waitFor,
  type VLibrasPlayer,
  type VLibrasPlugin,
} from "./vlibras";

const DISPOSE_DELAY_MS = 1_200;
const PLUGIN_WAIT_MS = 10_000;
const PLAYER_WAIT_MS = 25_000;
const POLL_INTERVAL_MS = 500;
const ACTIVATE_RETRY_MS = 2_500;
const WELCOME_TIMEOUT_MS = 4_500;
const FIRST_PLAYBACK_SETTLE_MS = 250;
const NEXT_PLAYBACK_SETTLE_MS = 120;

let widgetHost: HTMLElement | null = null;
let wrapper: HTMLElement | null = null;
let plugin: VLibrasPlugin | null = null;
let initialization: Promise<VLibrasPlugin> | null = null;
let welcomeBarrier: Promise<void> | null = null;
let welcomeCompleted = false;
let playbackVersion = 0;
let disposeTimer: number | null = null;
let interactionGuardTimers: number[] = [];

function delay(milliseconds: number) {
  return new Promise<void>((resolve) =>
    window.setTimeout(resolve, milliseconds),
  );
}

function disableWidgetInteractionCapture() {
  document.documentElement.classList.add("lbr-vlibras-game-active");
  interactionGuardTimers.forEach((timer) => window.clearTimeout(timer));

  const disableCapture = () => {
    document.querySelector<HTMLElement>(".vw-links")?.style.setProperty(
      "display",
      "none",
      "important",
    );
    window.dispatchEvent(new CustomEvent("vp-disable-text-capture"));
  };

  disableCapture();
  interactionGuardTimers = [750, 1_500, 2_500].map((milliseconds) =>
    window.setTimeout(disableCapture, milliseconds),
  );
}

function keepWidgetInteractionDisabled() {
  interactionGuardTimers.forEach((timer) => window.clearTimeout(timer));
  interactionGuardTimers = [];
  document.querySelector<HTMLElement>(".vw-links")?.style.setProperty(
    "display",
    "none",
    "important",
  );
  window.dispatchEvent(new CustomEvent("vp-disable-text-capture"));
}

function waitForWelcomeToStop(player: VLibrasPlayer) {
  if (welcomeBarrier) return welcomeBarrier;

  welcomeBarrier = new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      player.removeListener?.("stop:welcome", finish);
      resolve();
    };

    player.on?.("stop:welcome", finish);
    window.setTimeout(finish, WELCOME_TIMEOUT_MS);

    // Solicita a interrupção da apresentação padrão. O evento acima confirma
    // quando o motor Unity terminou de liberar o player para a nossa frase.
    player.stop();
  });

  return welcomeBarrier;
}

async function playCorrectAnswer(
  player: VLibrasPlayer,
  correctAnswerPhrase: string,
) {
  const currentVersion = ++playbackVersion;

  player.stop();
  if (!welcomeCompleted) {
    await waitForWelcomeToStop(player);
    await delay(FIRST_PLAYBACK_SETTLE_MS);
    welcomeCompleted = true;
  } else {
    await delay(NEXT_PLAYBACK_SETTLE_MS);
  }

  if (currentVersion !== playbackVersion) return;
  player.stop();
  player.translate(correctAnswerPhrase.trim());
}

async function waitForWidgetButton(currentRoot: HTMLElement) {
  return waitFor(
    () => {
      const button =
        currentRoot.querySelector<HTMLElement>("[vw-access-button]");

      // O elemento já existe no HTML inicial, mas só está pronto quando o
      // script oficial injeta o conteúdo interno e registra seus listeners.
      return button && button.childElementCount > 0 ? button : null;
    },
    PLUGIN_WAIT_MS,
    POLL_INTERVAL_MS,
  );
}

async function waitForPlugin(accessButton: HTMLElement) {
  const startedAt = Date.now();
  let lastActivationAt = 0;

  while (Date.now() - startedAt < PLUGIN_WAIT_MS) {
    const availablePlugin = window.plugin;
    if (availablePlugin?.player) return availablePlugin;

    const now = Date.now();
    if (now - lastActivationAt >= ACTIVATE_RETRY_MS) {
      accessButton.click();
      lastActivationAt = now;
    }

    await new Promise((resolve) =>
      window.setTimeout(resolve, POLL_INTERVAL_MS),
    );
  }

  throw new Error("O plugin do VLibras não ficou disponível a tempo.");
}

async function initializePlayer(mount: HTMLElement): Promise<VLibrasPlugin> {
  await ensureVLibrasWidget();
  const currentRoot = getVLibrasRoot();
  if (!currentRoot) throw new Error("Raiz oficial do VLibras não encontrada.");
  widgetHost = currentRoot.querySelector<HTMLElement>("[vw]");
  if (!widgetHost) throw new Error("Estrutura oficial do VLibras não encontrada.");

  wrapper = await waitFor(
    () => widgetHost?.querySelector<HTMLElement>("[vw-plugin-wrapper]"),
    4_000,
    POLL_INTERVAL_MS,
  );
  wrapper.classList.add("lbr-vlibras-player-shell");
  mount.appendChild(widgetHost);

  const accessButton = await waitForWidgetButton(widgetHost);
  plugin = await waitForPlugin(accessButton);
  await waitFor(
    () => (plugin?.player.loaded ? plugin : null),
    PLAYER_WAIT_MS,
    POLL_INTERVAL_MS,
  );
  return plugin;
}

function getPlayer(mount: HTMLElement) {
  if (!initialization) initialization = initializePlayer(mount);
  return initialization;
}

export async function attachVLibrasGamePlayer(
  mount: HTMLElement,
  correctAnswerPhrase: string,
): Promise<VLibrasPlayer> {
  try {
    if (disposeTimer !== null) {
      window.clearTimeout(disposeTimer);
      disposeTimer = null;
    }

    const activePlugin = await getPlayer(mount);
    if (!wrapper) throw new Error("Área visual do VLibras não encontrada.");
    if (!widgetHost) throw new Error("Estrutura visual do VLibras não encontrada.");

    wrapper.classList.add("lbr-vlibras-player-shell", "active");
    mount.appendChild(widgetHost);
    disableWidgetInteractionCapture();
    await playCorrectAnswer(activePlugin.player, correctAnswerPhrase);
    return activePlugin.player;
  } catch (error) {
    disposeVLibrasGamePlayer();
    throw error;
  }
}

export function detachVLibrasGamePlayer(mount: HTMLElement) {
  playbackVersion += 1;
  const root = getVLibrasRoot();
  if (wrapper && widgetHost && root && mount.contains(widgetHost)) {
    wrapper.classList.remove("lbr-vlibras-player-shell");
    root.appendChild(widgetHost);
  }
  keepWidgetInteractionDisabled();
  scheduleDispose();
}

function scheduleDispose() {
  if (disposeTimer !== null) window.clearTimeout(disposeTimer);
  disposeTimer = window.setTimeout(disposeVLibrasGamePlayer, DISPOSE_DELAY_MS);
}

export function disposeVLibrasGamePlayer() {
  playbackVersion += 1;
  if (disposeTimer !== null) window.clearTimeout(disposeTimer);
  disposeTimer = null;
  try {
    plugin?.player.stop();
  } catch {
    // O player externo pode já ter encerrado.
  }
  const root = getVLibrasRoot();
  if (wrapper && widgetHost && root && !root.contains(widgetHost)) {
    wrapper.classList.remove("lbr-vlibras-player-shell");
    root.appendChild(widgetHost);
  }
  keepWidgetInteractionDisabled();
  plugin = null;
  initialization = null;
}
