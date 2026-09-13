// Estado da revisão espaçada no navegador (localStorage, sem backend). A lógica pura está em
// src/data/srs.js (testada); aqui só persistência + assinatura para re-render.
import { useSyncExternalStore } from "react";
import { applyAction, dueIds, type SrsAction, type SrsRecord } from "./data/srs";

const KEY = "sdsl-srs-v1";

function read(): Record<string, SrsRecord> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  } catch {
    return {};
  }
}

let records = read();
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version++;
  for (const l of listeners) l();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      records = read();
      emit();
    }
  });
}

export function srsRecord(id: string): SrsRecord | undefined {
  return records[id];
}

export function srsRecords(): Record<string, SrsRecord> {
  return records;
}

export function recordStudy(id: string, action: SrsAction) {
  records = { ...records, [id]: applyAction(records[id], action, Date.now()) };
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    /* quota/modo privado: o estudo segue na memória da sessão */
  }
  emit();
}

export function dueNow(): string[] {
  return dueIds(records, Date.now());
}

export function useSrs(): number {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => version,
  );
}
