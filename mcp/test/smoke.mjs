// Smoke test: spawns the built server over stdio with the MCP SDK client and exercises the tools.
// Run after `npm run build`.  `npm run smoke`
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { COLLECTIONS } from "../../shared/kb-kinds.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const serverPath = join(HERE, "..", "dist", "server.js");
const KB = join(HERE, "..", "..", "knowledge-base");
const countOf = (file) => JSON.parse(readFileSync(join(KB, file), "utf8")).length;

const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] });
const client = new Client({ name: "smoke", version: "0.0.0" });
await client.connect(transport);

const parse = (res) => JSON.parse(res.content[0].text);
const call = async (name, args) => parse(await client.callTool({ name, arguments: args }));

// 1. tools/list: the original 4 tools are preserved (backward compatible) + `related`
const { tools } = await client.listTools();
const names = tools.map((t) => t.name).sort();
console.log("tools:", names.join(", "));
assert.deepEqual(names, ["get", "list", "overview", "related", "search"], "unexpected tool set");

// 2. overview returns every registered collection with the REAL count read from knowledge-base/
//    (no hardcoded numbers: a hardcoded "databases === 6" kept this smoke red on main for months).
const ov = await call("overview", {});
assert.equal(ov.length, COLLECTIONS.length, "overview should list every registered collection");
for (const c of COLLECTIONS) {
  assert.ok(ov.some((o) => o.kind === c.kind && o.count === countOf(c.file)), `${c.kind} must be exposed with its real count`);
}

// 3. legacy query still works: idempotency content for "idempotência kafka consumidor"
const legacy = await call("search", { query: "idempotência kafka consumidor" });
console.log("search legacy:", legacy.map((h) => h.id).join(", "));
assert.ok(legacy.some((h) => h.id === "q02" || h.id === "idempotent-consumer"), "expected q02 or idempotent-consumer");
assert.ok(legacy[0].sourceRefs?.length, "hits must carry sourceRefs");

// 4. symptom search finds the right concept (not just names) — with sourceRefs
const symptoms = [
  ["cliente cobrado duas vezes", ["missing-idempotency", "q36", "idempotent-request"]],
  ["pool sem conexão", ["connection-pool-exhaustion"]],
  ["todos reconectaram juntos", ["thundering-herd"]],
  ["fila crescendo", ["no-backpressure"]],
  ["same idempotency key different payload", ["q36", "idempotent-request"]],
  ["duas requests simultâneas mesma chave", ["q36", "idempotent-request"]],
  ["Kafka entregou a mesma mensagem duas vezes", ["q02", "q35", "idempotent-consumer"]],
];
for (const [query, accepted] of symptoms) {
  const hits = await call("search", { query, limit: 3 });
  console.log(`search "${query}":`, hits.map((h) => h.id).join(", "));
  assert.ok(hits.some((h) => accepted.includes(h.id)), `"${query}" should find ${accepted.join("|")}`);
  assert.ok(hits.every((h) => Array.isArray(h.sourceRefs) && h.sourceRefs.length > 0), "hits must carry sourceRefs");
}

// 5. kinds filter on a new collection
const fmOnly = await call("search", { query: "retry storm", kinds: ["failure-modes"], limit: 3 });
assert.equal(fmOnly[0].id, "retry-storm");
assert.ok(fmOnly.every((h) => h.kind === "failure-modes"));

// 6. get returns full items (legacy + new kinds) with verified urls
const pat = await call("get", { kind: "patterns", id: "event-sourcing" });
assert.equal(pat.id, "event-sourcing");
assert.ok(pat.sourceRefs?.some((r) => r.url), "event-sourcing must have a sourceRef with a url");
const fm = await call("get", { kind: "failure-modes", id: "retry-storm" });
assert.ok(fm.failureChain.length >= 3 && fm.observability.metrics.length > 0 && fm.interview.strongAnswer);
const q36 = await call("get", { kind: "interview-questions", id: "q36" });
assert.ok(q36.rubricDimensions?.length && q36.redFlags?.length && q36.failureInjections?.length, "q36 must be a full interview package");
const rubric = await call("get", { kind: "rubrics", id: "system-design-interview" });
assert.equal(rubric.dimensions.length, 8);

// 7. related: outgoing + derived incoming edges
const rel = await call("related", { kind: "failure-modes", id: "connection-pool-exhaustion" });
console.log("related pool-exhaustion: out", rel.outgoing.length, "in", rel.incoming.length);
assert.ok(rel.outgoing.some((e) => e.type === "canCause" && e.id === "retry-storm"), "pool exhaustion canCause retry-storm");
assert.ok(rel.incoming.some((e) => e.kind === "incident-drills"), "a drill should diagnose pool exhaustion");
assert.ok(rel.incoming.some((e) => e.type === "canCause" && e.id === "slow-query"), "slow-query canCause pool exhaustion (derived incoming)");

// 8. typed errors, not crashes
const bad = await client.callTool({ name: "get", arguments: { kind: "patterns", id: "nope-xyz" } });
assert.equal(bad.isError, true, "missing id should return isError");
const badRel = await client.callTool({ name: "related", arguments: { kind: "topics", id: "nope-xyz" } });
assert.equal(badRel.isError, true, "missing id should return isError in related");

await client.close();
console.log("SMOKE OK");
