// Regressão da busca por SINTOMAS (shared/kb-search.mjs — mesma implementação usada pelo MCP e pelo
// frontend). Não exige ranking exato quando há mais de um resultado correto: exige que um dos ids
// esperados apareça no top-N. Se uma mudança de conteúdo/sinônimos derrubar uma dessas consultas,
// o teste mostra o ranking obtido.
// Roda: npm test (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { COLLECTIONS } from "../../shared/kb-kinds.mjs";
import { createIndex, searchIndex, normalize, tokenize, expandQuery } from "../../shared/kb-search.mjs";

const KB = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "knowledge-base");
const collections = {};
for (const c of COLLECTIONS) collections[c.kind] = JSON.parse(readFileSync(join(KB, c.file), "utf-8"));
const index = createIndex(collections);
const top = (q, n = 3, opts = {}) => searchIndex(index, q, { limit: n, ...opts }).map((h) => h.id);

/** [consulta, ids aceitos, top-N] */
const CASES = [
  // pedido 1 — failure modes por sintoma
  ["cobrado duas vezes", ["missing-idempotency", "q36", "idempotent-request"], 3],
  ["cliente cobrado duas vezes", ["missing-idempotency", "q36", "idempotent-request"], 3],
  ["replica dado velho", ["read-replica-lag"], 3],
  ["replica retornando dado velho", ["read-replica-lag"], 3],
  ["todos reconectam juntos", ["thundering-herd"], 3],
  ["pool sem conexão", ["connection-pool-exhaustion"], 3],
  ["todas conexões ocupadas", ["connection-pool-exhaustion"], 3],
  ["banco lento pool", ["connection-pool-exhaustion"], 3],
  ["DB lento pool", ["connection-pool-exhaustion"], 3],
  ["DB ficando lento", ["slow-query", "connection-pool-exhaustion"], 3],
  ["fila cresce mais rápido que consumo", ["no-backpressure"], 3],
  ["fila crescendo", ["no-backpressure"], 3],
  ["queue growing", ["no-backpressure"], 3],
  ["Kafka acumulando mensagem", ["no-backpressure", "drill-kafka-backlog-campaign"], 3],
  ["cache expirou e DB caiu", ["cache-stampede", "cache-avalanche"], 3],
  ["cache expirou tudo junto", ["cache-avalanche"], 3],
  ["um shard está muito mais quente", ["hot-key-partition"], 3],
  ["hot shard", ["hot-key-partition"], 3],
  ["retries pioram serviço", ["retry-storm"], 3],
  ["muitos retries", ["retry-storm"], 3],
  ["retry storm", ["retry-storm"], 1],
  // pedido 2 — idempotência HTTP financeira
  ["cliente clicou duas vezes", ["q36", "idempotent-request", "missing-idempotency"], 3],
  ["cobrança duplicada", ["q36", "idempotent-request", "missing-idempotency"], 3],
  ["double charge", ["q36", "idempotent-request", "missing-idempotency"], 3],
  ["retry depois de timeout", ["q36", "idempotent-request", "missing-idempotency", "retry-storm"], 3],
  ["mesma idempotency key payload diferente", ["q36", "idempotent-request"], 2],
  ["same idempotency key different payload", ["q36", "idempotent-request"], 2],
  ["duas requests ao mesmo tempo mesma chave", ["q36", "idempotent-request"], 2],
  ["duas requests simultâneas mesma chave", ["q36", "idempotent-request"], 2],
  ["Idempotency-Key", ["q36", "idempotent-request"], 2],
  ["check then act idempotency", ["q36", "idempotent-request"], 2],
  ["existsByKey race", ["q36", "idempotent-request"], 2],
  ["request repetida pagamento", ["q36", "idempotent-request", "missing-idempotency"], 3],
  ["cliente clicou duas vezes e cobrou duas vezes", ["q36", "idempotent-request", "missing-idempotency"], 3],
  ["Kafka entregou a mesma mensagem duas vezes", ["q02", "q35", "idempotent-consumer"], 3],
  // pedido 3
  ["cache expirou e banco caiu", ["cache-stampede", "cache-avalanche"], 3],
  ["todos reconectaram juntos", ["thundering-herd"], 3],
  ["replica retornou dado velho", ["read-replica-lag"], 3],
  ["retries pioraram serviço", ["retry-storm"], 3],
  ["um shard recebe quase todo tráfego", ["hot-key-partition"], 3],
  // compatibilidade com a busca antiga (smoke do MCP)
  ["idempotência kafka consumidor", ["q02", "idempotent-consumer"], 3],
];

for (const [query, accepted, n] of CASES) {
  test(`busca: "${query}" → ${accepted.join(" | ")} no top-${n}`, () => {
    const got = top(query, n);
    assert.ok(got.some((id) => accepted.includes(id)), `top-${n} obtido: ${got.join(", ")}`);
  });
}

test("busca distingue dedup de REQUEST (HTTP) de dedup de MENSAGEM", () => {
  const http = top("duas requests simultâneas mesma chave", 3);
  assert.notEqual(http[0], "idempotent-consumer", `HTTP não deveria abrir com o consumidor: ${http}`);
  const kafka = top("Kafka entregou a mesma mensagem duas vezes", 3);
  assert.notEqual(kafka[0], "q36", `mensagem Kafka não deveria abrir com a q36: ${kafka}`);
  assert.ok(!kafka.includes("idempotent-request") || kafka.indexOf("idempotent-request") > 0, `${kafka}`);
});

test("normalização: acento, caixa, pontuação e frases canônicas", () => {
  assert.equal(normalize("Idempotência!"), "idempotencia");
  assert.match(normalize("N+1 queries"), /nplus1/);
  assert.match(normalize("cobrado duas vezes"), /duplicado/);
  assert.match(normalize("double-click"), /cliqueduplo/);
  assert.deepEqual(tokenize("o banco de dados está lento"), ["banco", "dados", "lento"]);
});

test("sinônimos: 'fila' também procura queue/backlog e 'lento' procura latência", () => {
  const [fila] = expandQuery(index, "fila");
  assert.ok(fila.alts.has("queue") || fila.alts.has("backlog"), [...fila.alts.keys()].slice(0, 20).join(","));
  const [lento] = expandQuery(index, "lento");
  assert.ok([...lento.alts.keys()].some((t) => t.startsWith("latenc") || t === "slow"));
});

test("busca é determinística, respeita kinds/limit e ignora consulta vazia", () => {
  assert.deepEqual(top("retry storm", 8), top("retry storm", 8));
  const onlyFm = searchIndex(index, "cache expirou", { kinds: ["failure-modes"], limit: 4 });
  assert.ok(onlyFm.length > 0 && onlyFm.length <= 4);
  assert.ok(onlyFm.every((h) => h.kind === "failure-modes"));
  assert.deepEqual(searchIndex(index, "   ", {}), []);
  assert.deepEqual(searchIndex(index, "de o a", {}), []);
});

test("todo hit carrega o item com sourceRefs (o valor do lab é responder com fonte)", () => {
  for (const h of searchIndex(index, "idempotência", { limit: 10 })) {
    assert.ok(Array.isArray(h.item.sourceRefs) && h.item.sourceRefs.length > 0, `${h.kind}/${h.id} sem sourceRefs`);
  }
});
