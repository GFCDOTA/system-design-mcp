// Progresso de estudo do usuário — 100% local (localStorage), sem backend.
// Ids são namespaced: "topic:cqrs", "pattern:saga", "q:q01". A UI marca/desmarca
// e as trilhas mostram % concluído. useSyncExternalStore mantém tudo em sincronia
// entre componentes (e entre abas, via evento storage).
import { useSyncExternalStore } from "react";

const DONE_KEY = "sdsl-progress-v1";
const LAST_KEY = "sdsl-last-visited-v1";

export interface LastVisit {
  path: string;
  label: string;
}

function loadDone(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(DONE_KEY) ?? "[]");
    return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

let done = loadDone();
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

// outra aba mudou o progresso → recarrega e notifica
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === DONE_KEY) {
      done = loadDone();
      emit();
    }
  });
}

export function isDone(id: string): boolean {
  return done.has(id);
}

export function toggleDone(id: string) {
  if (done.has(id)) done.delete(id);
  else done.add(id);
  localStorage.setItem(DONE_KEY, JSON.stringify([...done]));
  emit();
}

/** Quantos ids concluídos começam com o prefixo (ex.: "topic:"). */
export function doneCount(prefix: string): number {
  let n = 0;
  for (const id of done) if (id.startsWith(prefix)) n++;
  return n;
}

/** Re-renderiza o componente quando o progresso muda. Retorna a versão (opaca). */
export function useProgress(): number {
  return useSyncExternalStore(subscribe, () => version);
}

export function rememberVisit(path: string, label: string) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ path, label } satisfies LastVisit));
  } catch {
    /* quota/privado — perder o "continuar" não pode quebrar a página */
  }
}

export function lastVisit(): LastVisit | null {
  try {
    const v = JSON.parse(localStorage.getItem(LAST_KEY) ?? "null");
    if (v && typeof v.path === "string" && typeof v.label === "string" && v.path.startsWith("/")) return v;
    return null;
  } catch {
    return null;
  }
}
