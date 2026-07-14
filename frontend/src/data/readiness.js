// Motor de "preparação" — calcula o NÍVEL DE CONFIANÇA pra entrevista, os
// TROFÉUS e o NORTE (qual trilha seguir, ponto forte/fraco) a partir do progresso
// já rastreado. Determinístico e puro → testável (node --test). Tipos em .d.ts.
//
// Entrada: áreas [{ id, label, icon, done, total }] (o componente monta do
// localStorage + totais). Saída: overall %, nível, áreas com %, troféus, norte.

const LEVELS = [
  { min: 0, key: "start", label: "Começando", blurb: "Marque tópicos e perguntas como estudados pra o ponteiro andar." },
  { min: 15, key: "warm", label: "Aquecendo", blurb: "Já saiu do zero — mantenha o ritmo por uma área de cada vez." },
  { min: 40, key: "prep", label: "Preparando", blurb: "Boa base. Agora feche as áreas fracas antes de treinar a fundo." },
  { min: 70, key: "almost", label: "Quase lá", blurb: "Falta pouco — reforce os pontos fracos e faça mocks." },
  { min: 88, key: "ready", label: "Pronto pra entrevista", blurb: "Confiança alta em todas as frentes. Vá pra reta final e mocks." },
];

function levelFor(pct) {
  let out = LEVELS[0];
  for (const l of LEVELS) if (pct >= l.min) out = l;
  return out;
}

function statusFor(pct) {
  if (pct === 0) return "zero";
  if (pct < 34) return "fraco";
  if (pct < 70) return "ok";
  return "forte";
}

const clampPct = (done, total) => (total > 0 ? Math.round((100 * Math.min(done, total)) / total) : 0);

/**
 * @param {{id:string,label:string,icon:string,done:number,total:number}[]} areas
 * @returns {import("./readiness").Readiness}
 */
export function buildReadiness(areas) {
  const withPct = areas.map((a) => ({ ...a, pct: clampPct(a.done, a.total), status: statusFor(clampPct(a.done, a.total)) }));
  const rated = withPct.filter((a) => a.total > 0);
  const overall = rated.length ? Math.round(rated.reduce((s, a) => s + a.pct, 0) / rated.length) : 0;
  const level = levelFor(overall);

  const byPct = [...rated].sort((a, b) => a.pct - b.pct);
  const weakest = byPct[0];
  const strongest = byPct[byPct.length - 1];

  // norte: qual trilha seguir agora (ids de studyTrails)
  let nextTrailId, nextTrailWhy;
  if (overall < 25) {
    nextTrailId = "java-do-zero";
    nextTrailWhy = "Você está começando — construa a base de Java antes de partir pro resto.";
  } else if (overall < 65) {
    nextTrailId = "backend-senior";
    nextTrailWhy = weakest ? `Aprofunde o ecossistema; seu ponto mais fraco é ${weakest.label}.` : "Aprofunde o ecossistema backend.";
  } else {
    nextTrailId = "reta-final";
    nextTrailWhy = "Você já tem base — foque no treino intensivo de véspera (DSA + System Design + comportamental).";
  }

  const byId = Object.fromEntries(withPct.map((a) => [a.id, a]));
  const pct = (id) => (byId[id] ? byId[id].pct : 0);
  const done = (id) => (byId[id] ? byId[id].done : 0);
  const full = (id) => byId[id] && byId[id].total > 0 && byId[id].done >= byId[id].total;

  const trophies = [
    { id: "first", icon: "🥉", label: "Primeiro passo", desc: "Marcou o primeiro item como estudado", earned: withPct.some((a) => a.done > 0) },
    { id: "fund", icon: "📚", label: "Fundamentos", desc: "100% dos tópicos de System Design", earned: pct("fundamentos") >= 100 },
    { id: "arch", icon: "🧩", label: "Arquiteto", desc: "100% dos padrões de arquitetura", earned: pct("padroes") >= 100 },
    { id: "sd", icon: "🎯", label: "System Designer", desc: "Banco de System Design completo", earned: pct("sd") >= 100 },
    { id: "javat", icon: "☕", label: "Java teórico", desc: "Teoria de Java Core completa", earned: pct("java-teoria") >= 100 },
    { id: "mara", icon: "🏃", label: "Maratona Java", desc: "100 perguntas do curso estudadas", earned: done("java-curso") >= 100 },
    { id: "jsr", icon: "🔥", label: "Java sênior", desc: "300 perguntas do curso estudadas", earned: done("java-curso") >= 300 },
    { id: "read", icon: "📖", label: "Devorador", desc: "Todo o material do curso lido", earned: full("material") },
    { id: "ready", icon: "🏆", label: "Pronto pra entrevista", desc: "85% de confiança geral", earned: overall >= 85 },
  ];
  const earnedCount = trophies.filter((t) => t.earned).length;

  return { overall, level, areas: withPct, weakest, strongest, nextTrailId, nextTrailWhy, trophies, earnedCount };
}

// Foco por tipo de empresa — norte estático (o que priorizar por perfil de vaga).
export const companyFocus = [
  { id: "bigtech", label: "Big tech (FAANG)", tip: "DSA e System Design pesados; comportamental (leadership principles).", areas: ["sd", "java-teoria"] },
  { id: "startup", label: "Startup / produto", tip: "Java + Spring + entrega ponta-a-ponta; menos teoria, mais construir.", areas: ["java-curso", "material"] },
  { id: "banco", label: "Banco / consultoria", tip: "Fundamentos sólidos, SQL, boas práticas e arquitetura hexagonal.", areas: ["fundamentos", "padroes"] },
];
