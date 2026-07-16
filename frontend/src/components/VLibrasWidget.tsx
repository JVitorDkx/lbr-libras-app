import { useEffect } from "react";

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
  }
}

const SCRIPT_ID = "lbrlibras-vlibras-script";
const ROOT_ID = "lbrlibras-vlibras-root";

export function VLibrasWidget({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = '<div vw class="enabled"><div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div></div>';
    document.body.appendChild(root);

    const initialize = () => {
      if (window.VLibras && document.getElementById(ROOT_ID)) {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
      }
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (window.VLibras) {
      initialize();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener("load", initialize);
    }

    return () => {
      script?.removeEventListener("load", initialize);
      document.getElementById(ROOT_ID)?.remove();
    };
  }, [enabled]);

  return null;
}
