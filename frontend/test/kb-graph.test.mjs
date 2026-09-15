// Integridade do GRAFO da knowledge base (todas as coleções, inclusive as novas: failure-modes,
// incident-drills, comparisons, learning-paths). Complementa kb-integrity.test.mjs:
// - toda aresta (relatedX, canCause, mitigatedBy, passos de trilha…) aponta para um item que existe;
// - nenhum item aponta para si mesmo por acidente;
// - a narrativa da cadeia de falha é coerente com as arestas causais;
// - todo failure mode passa pelos quality gates mínimos e não fica órfão.
// Usa o MESMO módulo de grafo que o MCP e o frontend (shared/kb-graph.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COLLECTIONS } from "../../shared/kb-kinds.mjs";
import { buildGraph, brokenEdges, reachableFailureModes } from "../../shared/kb-graph.mjs";

const KB = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "knowledge-base");
const collections = {};
for (const c of COLLECTIONS) {
  const p = join(KB, c.file);
  if (existsSync(p)) collections[c.kind] = JSON.parse(readFileSync(p, "utf-8"));
}
const graph = buildGraph(collections);
const fms = collections["failure-modes"] ?? [];
const fmIds = new Set(fms.map((f) => f.id));

test("grafo: toda coleção do registro existe como arquivo", () => {
  const missing = COLLECTIONS.filter((c) => !collections[c.kind]).map((c) => c.file);
  assert.deepEqual(missing, [], "coleção registrada em shared/kb-kinds.mjs sem arquivo na KB");
});

test("grafo: ids únicos em todas as coleções", () => {
  for (const [kind, items] of Object.entries(collections)) {
    const seen = new Set();
    const dups = items.map((x) => x.id).filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    assert.deepEqual(dups, [], `${kind}: ids duplicados`);
  }
});

test("grafo: toda aresta resolve e não há self-reference", () => {
  const bad = brokenEdges(graph).map((e) => `${e.from.kind}/${e.from.id} -[${e.type}]-> ${e.to.kind}/${e.to.id}: ${e.problem}`);
  assert.deepEqual(bad, [], "\n" + bad.join("\n"));
  assert.ok(graph.edges.length > 1000, "grafo suspeitamente pequeno");
});

test("failure modes: pelo menos os 10 obrigatórios existem", () => {
  const required = [
    "cache-stampede", "thundering-herd", "hot-key-partition", "n-plus-one-queries", "retry-storm",
    "unbounded-cache", "connection-pool-exhaustion", "read-replica-lag", "missing-idempotency", "no-backpressure",
  ];
  for (const id of required) assert.ok(fmIds.has(id), `failure mode obrigatório ausente: ${id}`);
});

test("failure modes: cadeia de falha coerente com as arestas canCause", () => {
  const problems = [];
  for (const fm of fms) {
    const selfIdx = fm.failureChain.findIndex((s) => s.failureMode === fm.id);
    const fromSelf = reachableFailureModes(fms, fm.id);
    fm.failureChain.forEach((s, i) => {
      if (!s.failureMode || s.failureMode === fm.id) return;
      if (!fmIds.has(s.failureMode)) return problems.push(`${fm.id}: passo ${i} aponta para '${s.failureMode}' inexistente`);
      const after = selfIdx < 0 || i > selfIdx;
      if (after && !fromSelf.has(s.failureMode)) {
        problems.push(`${fm.id}: passo '${s.step}' (${s.failureMode}) vem depois, mas não é alcançável por canCause`);
      }
      if (!after && !reachableFailureModes(fms, s.failureMode).has(fm.id)) {
        problems.push(`${fm.id}: passo '${s.step}' (${s.failureMode}) vem antes, mas não leva a ${fm.id} por canCause`);
      }
    });
    for (const c of fm.canCause) if (c.id === fm.id) problems.push(`${fm.id}: canCause aponta para si mesmo`);
  }
  assert.deepEqual(problems, [], "\n" + problems.join("\n"));
});

test("failure modes: quality gates (o que é, como piora, métricas, mitigação vs correção, entrevista, fontes)", () => {
  const problems = [];
  for (const fm of fms) {
    const who = `failure-mode:${fm.id}`;
    const need = (cond, msg) => { if (!cond) problems.push(`${who}: ${msg}`); };
    need(fm.definition.length > 200, "definição rasa (O que é?)");
    need(fm.whyItHappens.length > 150, "whyItHappens raso (Por que acontece?)");
    need(fm.productionScenario.timeline.length >= 3, "timeline curta (Como começa/piora?)");
    need(fm.failureChain.length >= 3, "cadeia curta");
    need(fm.symptoms.userVisible.length >= 1 && fm.symptoms.system.length >= 2, "sintomas (usuário e sistema)");
    need(fm.diagnosis.confirm.length >= 2, "confirmação do diagnóstico");
    need(fm.immediateMitigation.length >= 1 && fm.longTermSolutions.length >= 1, "mitigação imediata E correção definitiva");
    need(fm.antiPatterns.length >= 2, "anti-patterns (que solução ingênua pioraria?)");
    need(fm.tradeOffs.length >= 2, "trade-offs");
    need(fm.observability.metrics.length >= 3 && fm.observability.alerts.length >= 1, "observabilidade");
    need(fm.interview.followUps.length >= 1 && fm.interview.redFlags.length >= 2 && fm.interview.strongSignals.length >= 2, "ângulo de entrevista");
    need(fm.interview.strongAnswer.length > 400, "strongAnswer rasa");
    need((fm.relatedTopics.length + fm.relatedPatterns.length) >= 2, "sem relações com a KB existente");
    need(new Set(fm.sourceRefs.map((r) => r.source)).size >= 2, "menos de 2 fontes distintas");
    need(fm.sourceRefs.every((r) => r.kind === "pdf" || /^https:\/\//.test(r.url ?? "")), "sourceRef externo sem url https");
    need(fm.keywords.length >= 3, "poucas keywords de sintoma para a busca");
  }
  assert.deepEqual(problems, [], "\n" + problems.join("\n"));
});

test("failure modes: nenhum fica órfão (alguém aponta para ele)", () => {
  const incoming = new Map([...fmIds].map((id) => [id, 0]));
  for (const e of graph.edges) {
    if (e.to.kind === "failure-modes" && !(e.from.kind === "failure-modes" && e.from.id === e.to.id)) {
      incoming.set(e.to.id, (incoming.get(e.to.id) ?? 0) + 1);
    }
  }
  const orphans = [...incoming].filter(([, n]) => n === 0).map(([id]) => id);
  assert.deepEqual(orphans, [], "failure modes sem nenhuma aresta de entrada");
});

test("incident drills: título não entrega o diagnóstico e timeline aponta causa válida", () => {
  const problems = [];
  const fmTitles = fms.map((f) => f.title.toLowerCase().split(" (")[0]);
  for (const d of collections["incident-drills"] ?? []) {
    const title = d.title.toLowerCase();
    for (const t of fmTitles) if (title.includes(t)) problems.push(`${d.id}: título revela '${t}'`);
    if (d.format === "timeline") {
      const n = d.scenario.timeline?.length ?? 0;
      if (!(Number.isInteger(d.answer.rootCauseAt) && d.answer.rootCauseAt >= 0 && d.answer.rootCauseAt < n)) {
        problems.push(`${d.id}: formato timeline exige answer.rootCauseAt dentro da timeline`);
      }
    }
    if (!fmIds.has(d.failureModes[0])) problems.push(`${d.id}: diagnóstico principal inexistente`);
  }
  assert.deepEqual(problems, [], "\n" + problems.join("\n"));
});

test("rubrica: dimensões usadas pelas perguntas existem e a escala é 0..5", () => {
  const rubric = (collections.rubrics ?? []).find((r) => r.id === "system-design-interview");
  assert.ok(rubric, "rubrica system-design-interview ausente");
  assert.deepEqual(rubric.scale.map((s) => s.score), [0, 1, 2, 3, 4, 5]);
  const dims = new Set(rubric.dimensions.map((d) => d.id));
  const problems = [];
  for (const q of collections["interview-questions"]) {
    for (const d of q.rubricDimensions ?? []) if (!dims.has(d)) problems.push(`${q.id}: dimensão '${d}' fora da rubrica`);
  }
  assert.deepEqual(problems, [], "\n" + problems.join("\n"));
  const packages = collections["interview-questions"].filter((q) => q.rubricDimensions?.length && q.redFlags?.length && q.strongSignals?.length && q.followUps?.length);
  assert.ok(packages.length >= 8, `só ${packages.length} perguntas têm pacote completo para mock interview`);
});

test("rubrica por pergunta: toda pergunta entrevistável tem sinais que cobrem exatamente suas dimensões", () => {
  const problems = [];
  const interviewable = collections["interview-questions"].filter(
    (q) => q.rubricDimensions?.length && (q.followUps?.length || q.failureInjections?.length),
  );
  assert.ok(interviewable.length >= 8, `só ${interviewable.length} perguntas entrevistáveis`);
  const signalIds = new Set();
  for (const q of interviewable) {
    const signals = q.scoringSignals ?? [];
    if (!signals.length) {
      problems.push(`${q.id}: entrevistável sem scoringSignals`);
      continue;
    }
    const dims = new Set(signals.map((s) => s.dimension));
    for (const d of q.rubricDimensions) if (!dims.has(d)) problems.push(`${q.id}: dimensão '${d}' sem sinal`);
    for (const d of dims) if (!q.rubricDimensions.includes(d)) problems.push(`${q.id}: sinal na dimensão '${d}', que a pergunta não declara`);
    if (!signals.some((s) => s.level === "core")) problems.push(`${q.id}: nenhum sinal core`);
    for (const s of signals) {
      if (signalIds.has(s.id)) problems.push(`${q.id}: id de sinal repetido '${s.id}'`);
      signalIds.add(s.id);
      if (!s.id.startsWith(`${q.id}-`)) problems.push(`${q.id}: sinal '${s.id}' sem o prefixo da pergunta`);
    }
    const clarificationIds = new Set();
    for (const c of q.clarifications ?? []) {
      if (clarificationIds.has(c.id)) problems.push(`${q.id}: esclarecimento repetido '${c.id}'`);
      clarificationIds.add(c.id);
      if (c.explanation.length > 400) problems.push(`${q.id}: esclarecimento '${c.id}' longo demais para uma resposta curta`);
    }
  }
  const outside = collections["interview-questions"].filter((q) => q.scoringSignals?.length && !interviewable.includes(q));
  for (const q of outside) problems.push(`${q.id}: scoringSignals numa pergunta sem pacote de entrevista`);
  assert.deepEqual(problems, [], "\n" + problems.join("\n"));
});

test("comparações e trilhas: estrutura mínima útil", () => {
  for (const c of collections.comparisons ?? []) {
    assert.ok(c.options.length >= 2, `${c.id}: menos de 2 opções`);
    assert.ok(c.options.some((o) => o.refs?.length), `${c.id}: nenhuma opção liga à KB`);
  }
  for (const p of collections["learning-paths"] ?? []) {
    assert.ok(p.steps.some((s) => s.ref.kind === "failure-modes"), `${p.id}: trilha sem failure mode`);
  }
});
