// Lógica pura dos modos de estudo: revisão espaçada, quiz determinístico e diagramas de cadeia.
// Roda contra os failure modes REAIS da KB.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyAction, dueIds, emptyRecord, isDue, DAY_MS, INTERVALS_DAYS, MAX_MASTERY } from "../src/data/srs.js";
import { buildQuiz, chainGame, isCorrectOrder, rng, worsenQuestion, identifyQuestion } from "../src/data/quiz.js";
import { failureChainMermaid, causalGraphMermaid, mermaidLabel } from "../src/data/failureDiagrams.js";

const KB = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "knowledge-base");
const fms = JSON.parse(readFileSync(join(KB, "failure-modes.json"), "utf-8"));
const NOW = Date.UTC(2026, 8, 13, 12);

test("srs: Entendi sobe mastery e agenda pelo intervalo do nível", () => {
  let r = applyAction(emptyRecord(), "understood", NOW);
  assert.equal(r.mastery, 1);
  assert.equal(r.nextReview, NOW + INTERVALS_DAYS[1] * DAY_MS);
  for (let i = 0; i < 10; i++) r = applyAction(r, "understood", NOW);
  assert.equal(r.mastery, MAX_MASTERY, "mastery tem teto");
});

test("srs: Revisar depois não muda mastery; Preciso estudar zera e fica devido agora", () => {
  const base = applyAction(applyAction(emptyRecord(), "understood", NOW), "understood", NOW);
  const later = applyAction(base, "later", NOW);
  assert.equal(later.mastery, base.mastery);
  assert.equal(later.nextReview, NOW + DAY_MS);
  const study = applyAction(base, "study", NOW);
  assert.equal(study.mastery, 0);
  assert.ok(isDue(study, NOW));
  assert.equal(study.timesIncorrect, 1);
});

test("srs: quiz registra acertos/erros e não muta o registro original", () => {
  const r0 = emptyRecord();
  const r1 = applyAction(r0, "correct", NOW);
  assert.equal(r0.timesCorrect, 0);
  assert.equal(r1.timesCorrect, 1);
  const r2 = applyAction(r1, "incorrect", NOW);
  assert.equal(r2.mastery, 0);
  assert.throws(() => applyAction(r2, "whatever", NOW));
});

test("srs: fila de revisão ordena do mais atrasado e ignora itens futuros", () => {
  const records = {
    "fm:a": { ...emptyRecord(), nextReview: NOW - 2 * DAY_MS },
    "fm:b": { ...emptyRecord(), nextReview: NOW + DAY_MS },
    "fm:c": { ...emptyRecord(), nextReview: NOW - 5 * DAY_MS },
    "fm:d": emptyRecord(),
  };
  assert.deepEqual(dueIds(records, NOW), ["fm:c", "fm:a"]);
});

test("quiz: mesma seed gera o mesmo quiz; seeds diferentes variam", () => {
  const a = buildQuiz(fms, { seed: 42, count: 8 });
  const b = buildQuiz(fms, { seed: 42, count: 8 });
  assert.deepEqual(a, b);
  const c = buildQuiz(fms, { seed: 7, count: 8 });
  assert.notDeepEqual(a.map((q) => q.fmId), c.map((q) => q.fmId));
});

test("quiz: questões de múltipla escolha têm 4 opções únicas e a resposta está entre elas", () => {
  for (const q of buildQuiz(fms, { seed: 3, count: 16 })) {
    if (q.type === "open") {
      assert.ok(q.answer.length > 20);
      continue;
    }
    assert.equal(q.options.length, 4, `${q.type}/${q.fmId}`);
    assert.equal(new Set(q.options.map((o) => o.id)).size, 4);
    assert.ok(q.options.some((o) => o.id === q.answer));
  }
});

test("quiz: distratores do 'identifique' preferem os conceitos confundíveis", () => {
  const stampede = fms.find((f) => f.id === "cache-stampede");
  const q = identifyQuestion(stampede, fms, rng(1));
  const confusable = new Set(stampede.confusedWith.map((c) => c.id));
  assert.ok(q.options.filter((o) => confusable.has(o.id)).length >= 2);
});

test("quiz: 'o que pioraria' marca o anti-pattern como resposta", () => {
  const pool = fms.find((f) => f.id === "connection-pool-exhaustion");
  const q = worsenQuestion(pool, rng(9));
  const bad = q.options.find((o) => o.id === q.answer);
  assert.ok(pool.antiPatterns.some((a) => a.dont === bad.label));
});

test("jogo de cadeia: embaralha e só aceita a ordem original", () => {
  const retry = fms.find((f) => f.id === "retry-storm");
  const game = chainGame(retry, rng(5));
  assert.notDeepEqual(game.steps, game.answer);
  assert.deepEqual([...game.steps].sort(), [...game.answer].sort());
  assert.ok(isCorrectOrder(game, game.answer));
  assert.ok(!isCorrectOrder(game, game.steps));
});

test("diagramas: rótulo seguro e Mermaid com todos os passos/arestas", () => {
  assert.equal(mermaidLabel('a "b" [c] (d) #e;'), "a b c d e");
  const pool = fms.find((f) => f.id === "connection-pool-exhaustion");
  const chain = failureChainMermaid(pool, Object.fromEntries(fms.map((f) => [f.id, f.title])));
  assert.match(chain, /^flowchart TD/);
  assert.equal((chain.match(/-->/g) ?? []).length, pool.failureChain.length - 1);
  const graph = causalGraphMermaid(fms, "retry-storm");
  const edges = fms.reduce((n, f) => n + f.canCause.length, 0);
  assert.equal((graph.match(/-->/g) ?? []).length, edges);
  assert.match(graph, /:::focus/);
});
