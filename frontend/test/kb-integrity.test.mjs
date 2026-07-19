// A trava da REGRA DE OURO ("nada sem fonte") — porte 1:1 do antigo
// KnowledgeBaseIntegrityTest do BFF (aposentado junto com bff/): carrega a
// knowledge-base REAL e falha o build se algum item ficar sem sourceRef
// válido, se algum cross-ref apontar pra id inexistente, se o catálogo de
// padrões obrigatórios regredir, ou se alguma coleção esvaziar.
// Roda: npm test (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KB = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "knowledge-base");
const load = (name) => JSON.parse(readFileSync(join(KB, `${name}.json`), "utf-8"));

const topics = load("topics");
const patterns = load("patterns");
const flows = load("flows");
const questions = load("interview-questions");
const diagrams = load("diagrams");
const evidence = load("evidence");
const databases = load("databases");
const aiGlossary = load("ai-agents-glossary");

/** Os 18 padrões que a spec exige mapeados + os 3 extras vindos do livro. */
const REQUIRED_PATTERNS = [
  "database-per-service", "saga", "api-composition", "cqrs", "domain-event", "event-sourcing",
  "transactional-outbox", "polling-publisher", "transaction-log-tailing", "idempotent-consumer",
  "api-gateway", "backend-for-frontend", "circuit-breaker", "health-check-api",
  "application-metrics", "distributed-tracing", "audit-logging",
  "consistent-hashing", "bulkhead", "cell-based-architecture",
];

const notBlank = (s) => typeof s === "string" && s.trim() !== "";
const ids = (arr) => new Set(arr.map((x) => x.id));

function assertHasSource(who, refs) {
  assert.ok(Array.isArray(refs) && refs.length > 0, `${who} sem sourceRefs`);
  const anyValid = refs.some((r) => notBlank(r.kind) && notBlank(r.source) && notBlank(r.locator));
  assert.ok(anyValid, `${who} sem sourceRef válido (kind+source+locator)`);
}

function assertSubset(who, refs, universe) {
  for (const ref of refs || []) assert.ok(universe.has(ref), `${who} -> '${ref}' não resolve`);
}

function assertDbRec(who, rec, databaseIds) {
  if (rec && notBlank(rec.suggestedDbId)) {
    assert.ok(databaseIds.has(rec.suggestedDbId), `${who}.databaseRecommendation -> '${rec.suggestedDbId}' não resolve`);
  }
}

test("kb: nenhuma coleção vazia", () => {
  for (const [name, arr] of Object.entries({ topics, patterns, flows, questions, diagrams, evidence, databases })) {
    assert.ok(arr.length > 0, `${name} vazia`);
  }
});

test("kb: todo item tem ao menos um sourceRef válido", () => {
  topics.forEach((t) => assertHasSource(`topic:${t.id}`, t.sourceRefs));
  patterns.forEach((p) => assertHasSource(`pattern:${p.id}`, p.sourceRefs));
  flows.forEach((f) => assertHasSource(`flow:${f.id}`, f.sourceRefs));
  questions.forEach((q) => assertHasSource(`question:${q.id}`, q.sourceRefs));
  diagrams.forEach((d) => assertHasSource(`diagram:${d.id}`, d.sourceRefs));
  evidence.forEach((e) => assertHasSource(`evidence:${e.id}`, e.sourceRefs));
  databases.forEach((d) => assertHasSource(`database:${d.id}`, d.sourceRefs));
});

test("kb: catálogo de padrões obrigatórios completo", () => {
  const have = ids(patterns);
  for (const p of REQUIRED_PATTERNS) assert.ok(have.has(p), `padrão obrigatório ausente: ${p}`);
});

test("kb: pelo menos 30 perguntas de entrevista", () => {
  assert.ok(questions.length >= 30, `só ${questions.length} perguntas`);
});

test("kb: glossário de IA presente e sourced (trilha separada)", () => {
  assert.ok(aiGlossary.length > 0, "ai glossary vazio");
  aiGlossary.forEach((g) => assertHasSource(`ai:${g.id}`, g.sourceRefs));
});

test("kb: todo cross-ref resolve (topics/patterns/flows/questions/diagrams/evidence/databases)", () => {
  const topicIds = ids(topics);
  const patternIds = ids(patterns);
  const diagramIds = ids(diagrams);
  const databaseIds = ids(databases);

  for (const t of topics) {
    assertSubset(`topic:${t.id}.relatedPatterns`, t.relatedPatterns, patternIds);
    assertSubset(`topic:${t.id}.relatedTopics`, t.relatedTopics, topicIds);
    assertSubset(`topic:${t.id}.diagrams`, t.diagrams, diagramIds);
  }
  for (const p of patterns) {
    assertSubset(`pattern:${p.id}.relatedPatterns`, p.relatedPatterns, patternIds);
    assertSubset(`pattern:${p.id}.diagrams`, p.diagrams, diagramIds);
  }
  for (const f of flows) {
    assertSubset(`flow:${f.id}.relatedPatterns`, f.relatedPatterns, patternIds);
    if (notBlank(f.diagram)) assert.ok(diagramIds.has(f.diagram), `flow:${f.id}.diagram -> '${f.diagram}' não resolve`);
  }
  for (const q of questions) {
    assertSubset(`question:${q.id}.patterns`, q.patterns, patternIds);
    assertSubset(`question:${q.id}.relatedTopics`, q.relatedTopics, topicIds);
    assertSubset(`question:${q.id}.diagrams`, q.diagrams, diagramIds);
  }
  for (const d of diagrams) assert.ok(notBlank(d.mermaid), `diagram:${d.id}.mermaid em branco`);
  for (const e of evidence) assertSubset(`evidence:${e.id}.relatedPatterns`, e.relatedPatterns, patternIds);
  for (const d of databases) {
    assertSubset(`database:${d.id}.relatedPatterns`, d.relatedPatterns, patternIds);
    assertSubset(`database:${d.id}.relatedTopics`, d.relatedTopics, topicIds);
    assertSubset(`database:${d.id}.diagrams`, d.diagrams, diagramIds);
  }
  topics.forEach((t) => assertDbRec(`topic:${t.id}`, t.databaseRecommendation, databaseIds));
  patterns.forEach((p) => assertDbRec(`pattern:${p.id}`, p.databaseRecommendation, databaseIds));
  flows.forEach((f) => assertDbRec(`flow:${f.id}`, f.databaseRecommendation, databaseIds));
});
