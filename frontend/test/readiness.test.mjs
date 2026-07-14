// Testes do motor de preparação (troféus + confiança + norte). node --test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReadiness } from "../src/data/readiness.js";

const AREAS = (over) => [
  { id: "fundamentos", label: "Fundamentos", icon: "📚", done: over, total: 100 },
  { id: "padroes", label: "Padrões", icon: "🧩", done: over, total: 100 },
  { id: "sd", label: "System Design", icon: "🎯", done: over, total: 100 },
  { id: "java-teoria", label: "Java teoria", icon: "☕", done: over, total: 100 },
  { id: "java-curso", label: "Java curso", icon: "📝", done: over, total: 400 },
  { id: "material", label: "Material", icon: "📖", done: over, total: 40 },
];

test("zerado: overall 0, nível início, nenhum troféu", () => {
  const r = buildReadiness(AREAS(0));
  assert.equal(r.overall, 0);
  assert.equal(r.level.key, "start");
  assert.equal(r.earnedCount, 0);
  assert.equal(r.nextTrailId, "java-do-zero");
});

test("primeiro item marcado ganha o troféu 'Primeiro passo'", () => {
  const areas = AREAS(0);
  areas[0].done = 1;
  const r = buildReadiness(areas);
  assert.ok(r.trophies.find((t) => t.id === "first").earned);
  assert.ok(!r.trophies.find((t) => t.id === "fund").earned);
});

test("tudo completo: overall 100, pronto, todos os troféus", () => {
  const areas = AREAS(100);
  areas[4].done = 400; // java-curso cheio
  areas[5].done = 40; // material cheio
  const r = buildReadiness(areas);
  assert.equal(r.overall, 100);
  assert.equal(r.level.key, "ready");
  assert.equal(r.earnedCount, r.trophies.length);
  assert.equal(r.nextTrailId, "reta-final");
});

test("ponto fraco e forte são identificados", () => {
  const areas = AREAS(50);
  areas[0].done = 5; // fundamentos fraco (5%)
  areas[2].done = 90; // sd forte (90%)
  areas[5].done = 4; // material 10% (não deixa clampar em 100%)
  const r = buildReadiness(areas);
  assert.equal(r.weakest.id, "fundamentos");
  assert.equal(r.strongest.id, "sd");
});

test("marcos de java-curso (100 e 300) destravam troféus", () => {
  const areas = AREAS(0);
  areas[4].done = 100;
  let r = buildReadiness(areas);
  assert.ok(r.trophies.find((t) => t.id === "mara").earned);
  assert.ok(!r.trophies.find((t) => t.id === "jsr").earned);
  areas[4].done = 300;
  r = buildReadiness(areas);
  assert.ok(r.trophies.find((t) => t.id === "jsr").earned);
});

test("área com total 0 não entra na média de confiança", () => {
  const areas = AREAS(0);
  areas[0].done = 100;
  areas[0].total = 100; // 100%
  for (let i = 1; i < areas.length; i++) areas[i].total = 0; // resto sem total
  const r = buildReadiness(areas);
  assert.equal(r.overall, 100); // só a área com total conta
});
