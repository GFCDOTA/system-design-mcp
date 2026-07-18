// Realce do essencial — marca a frase-chave (topic sentence) e os números/
// métricas de cada bloco de texto, pra dar pra SKIMMAR o conteúdo denso sem
// ler tudo. Estado global (liga/desliga), salvo local. Default = ligado.
import { useSyncExternalStore } from "react";

const KEY = "sdsl-emphasis-v1";

let on = (() => {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
})();

const listeners = new Set<() => void>();

export function toggleEmphasis() {
  on = !on;
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* privado — sem persistência não pode quebrar */
  }
  for (const l of listeners) l();
}

export function useEmphasis(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => on,
    () => true,
  );
}
