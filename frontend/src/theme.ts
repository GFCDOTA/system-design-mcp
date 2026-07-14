// Tema claro/escuro — escuro é o padrão. Preferência salva localmente.
// applyTheme roda antes do render (em main.tsx) pra não piscar branco.
import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
const KEY = "sdsl-theme-v1";

export function getTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(t: Theme) {
  // escuro = ausência do atributo (default do :root); claro = data-theme="light"
  const root = document.documentElement;
  if (t === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "light" ? "#F6F7FA" : "#191E26");
}

const listeners = new Set<() => void>();
let current: Theme = getTheme();

export function setTheme(t: Theme) {
  if (t === current) return;
  current = t;
  try {
    localStorage.setItem(KEY, current);
  } catch {
    /* modo privado — perder a preferência não pode quebrar */
  }
  applyTheme(current);
  for (const l of listeners) l();
}

export function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark");
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "dark",
  );
}
