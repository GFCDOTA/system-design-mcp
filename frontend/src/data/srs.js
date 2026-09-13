// Revisão espaçada SIMPLES (estilo Leitner), 100% local e determinística. Sem algoritmo complexo:
// cada item guarda mastery (0..4), lastSeen, nextReview, timesCorrect e timesIncorrect.
// Ações do estudante: "understood" (Entendi), "later" (Revisar depois), "study" (Preciso estudar);
// o quiz registra "correct"/"incorrect".

export const DAY_MS = 24 * 60 * 60 * 1000;
/** Intervalo (em dias) até a próxima revisão para cada nível de mastery. */
export const INTERVALS_DAYS = [0, 1, 3, 7, 21];
export const MAX_MASTERY = INTERVALS_DAYS.length - 1;

export function emptyRecord() {
  return { mastery: 0, lastSeen: null, nextReview: null, timesCorrect: 0, timesIncorrect: 0 };
}

/** Aplica uma ação e devolve um NOVO registro (não muta). `now` em ms. */
export function applyAction(record, action, now) {
  const r = { ...emptyRecord(), ...(record ?? {}) };
  r.lastSeen = now;
  switch (action) {
    case "correct":
      r.timesCorrect += 1;
    // fallthrough: acertar conta como entender
    case "understood":
      r.mastery = Math.min(MAX_MASTERY, r.mastery + 1);
      r.nextReview = now + INTERVALS_DAYS[r.mastery] * DAY_MS;
      break;
    case "later":
      r.nextReview = now + DAY_MS;
      break;
    case "incorrect":
      r.timesIncorrect += 1;
      r.mastery = Math.max(0, r.mastery - 1);
      r.nextReview = now;
      break;
    case "study":
      r.timesIncorrect += 1;
      r.mastery = 0;
      r.nextReview = now;
      break;
    default:
      throw new Error(`ação de estudo desconhecida: ${action}`);
  }
  return r;
}

export function isDue(record, now) {
  return !!record && record.nextReview !== null && record.nextReview <= now;
}

/** Ids devidos agora, do mais atrasado para o menos atrasado (desempate por id). */
export function dueIds(records, now) {
  return Object.entries(records ?? {})
    .filter(([, r]) => isDue(r, now))
    .sort(([a, ra], [b, rb]) => ra.nextReview - rb.nextReview || a.localeCompare(b))
    .map(([id]) => id);
}

export function masteryLabel(mastery) {
  return ["novo", "aprendendo", "revisando", "firme", "dominado"][Math.max(0, Math.min(MAX_MASTERY, mastery ?? 0))];
}
