// Loads the knowledge base from the SINGLE source of truth (../../knowledge-base/*.json) and builds the
// search index + relationship graph with the SAME modules the frontend uses (../../shared/*.mjs).
// No copy of the data, no network, no LLM.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { COLLECTIONS, titleOf, summaryOf } from "../../shared/kb-kinds.mjs";
import { createIndex, searchIndex } from "../../shared/kb-search.mjs";
import { buildGraph, related as relatedOf } from "../../shared/kb-graph.mjs";

// dist/kb.js -> up to mcp/ -> up to repo root -> knowledge-base/
const HERE = dirname(fileURLToPath(import.meta.url));
const KB_DIR = join(HERE, "..", "..", "knowledge-base");

/** Collection kinds, in registry order (the order is also the search tie-break). */
export const KINDS = COLLECTIONS.map((c) => c.kind) as [string, ...string[]];
export type Kind = (typeof KINDS)[number];

export type Item = Record<string, any>;

const store: Record<string, Item[]> = Object.create(null);
for (const c of COLLECTIONS) {
  store[c.kind] = JSON.parse(readFileSync(join(KB_DIR, c.file), "utf8")) as Item[];
}

const index = createIndex(store);
const graph = buildGraph(store);

export { titleOf, summaryOf };

export function overview() {
  return COLLECTIONS.map((c) => ({ kind: c.kind, count: store[c.kind].length, description: c.description }));
}
export function list(kind: Kind) {
  return store[kind].map((it) => ({ id: it.id, title: titleOf(it) }));
}
export function get(kind: Kind, id: string): Item | undefined {
  return store[kind].find((it) => it.id === id);
}

export interface SearchHit {
  kind: Kind;
  id: string;
  title: string;
  summary: string;
  score: number;
  /** normalized query terms this item matched (additive field) */
  matched: string[];
  sourceRefs: unknown[];
}

/** Symptom-aware deterministic search (weights, synonyms, prefix, coverage). No embeddings. */
export function search(query: string, kinds?: Kind[], limit = 8): SearchHit[] {
  return searchIndex<Item>(index, query, { kinds, limit }).map((h) => ({
    kind: h.kind,
    id: h.id,
    title: titleOf(h.item),
    summary: summaryOf(h.item),
    score: h.score,
    matched: h.matched,
    sourceRefs: (h.item.sourceRefs as unknown[]) ?? [],
  }));
}

/** One-hop neighbourhood (outgoing + derived incoming edges) with titles. */
export function related(kind: Kind, id: string) {
  return relatedOf(graph, kind, id);
}
