// Cor de destaque (accent) escolhível — muda --brand e derivados via CSS vars.
// "violeta" = padrão (não sobrescreve: deixa o CSS controlar por tema); as demais
// aplicam a mesma cor nos dois temas. Preferência salva local.
import { useSyncExternalStore } from "react";

const KEY = "sdsl-accent-v1";

export interface Accent {
  id: string;
  label: string;
  brand: string;
  hover: string;
}

export const ACCENTS: Accent[] = [
  { id: "violeta", label: "Violeta", brand: "#8F7DFF", hover: "#A99BFF" },
  { id: "azul", label: "Azul", brand: "#5B9DFF", hover: "#83B6FF" },
  { id: "teal", label: "Teal", brand: "#22C3B4", hover: "#48D6C8" },
  { id: "verde", label: "Verde", brand: "#46D17F", hover: "#6ADD98" },
  { id: "ambar", label: "Âmbar", brand: "#F6B64B", hover: "#FAC873" },
  { id: "rosa", label: "Rosa", brand: "#FB6FA4", hover: "#FF93BC" },
  { id: "coral", label: "Coral", brand: "#FB7185", hover: "#FF95A5" },
];

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const BRAND_VARS = ["--brand", "--brand-hover", "--brand-soft", "--brand-border", "--shadow-brand"];

export function getAccent(): string {
  try {
    const v = localStorage.getItem(KEY);
    return v && ACCENTS.some((a) => a.id === v) ? v : "violeta";
  } catch {
    return "violeta";
  }
}

export function applyAccent(id: string) {
  const root = document.documentElement;
  const a = ACCENTS.find((x) => x.id === id);
  // violeta (padrão) ou id inválido: limpa overrides e deixa o CSS por-tema mandar
  if (!a || a.id === "violeta") {
    for (const v of BRAND_VARS) root.style.removeProperty(v);
    return;
  }
  root.style.setProperty("--brand", a.brand);
  root.style.setProperty("--brand-hover", a.hover);
  root.style.setProperty("--brand-soft", hexToRgba(a.brand, 0.16));
  root.style.setProperty("--brand-border", hexToRgba(a.brand, 0.4));
  root.style.setProperty("--shadow-brand", `0 0 0 1px ${hexToRgba(a.brand, 0.22)}, 0 16px 40px ${hexToRgba(a.brand, 0.16)}`);
}

let current = getAccent();
const listeners = new Set<() => void>();

export function setAccent(id: string) {
  current = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* privado — sem persistência não pode quebrar */
  }
  applyAccent(id);
  for (const l of listeners) l();
}

export function useAccent(): string {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "violeta",
  );
}
