// Busca e grafo da KB no app — a MESMA implementação do MCP (../../shared/*.mjs), sobre os JSON
// estáticos. O índice é construído uma vez por sessão, sob demanda (só quando alguém busca ou abre
// uma página que precisa de backlinks).
import { api } from "./api";
import { COLLECTIONS, titleOf, summaryOf } from "../../shared/kb-kinds.mjs";
import { createIndex, searchIndex, type KbSearchIndex } from "../../shared/kb-search.mjs";
import { buildGraph, related, type KbGraph, type RelatedResult } from "../../shared/kb-graph.mjs";

export interface KbContext {
  collections: Record<string, Array<Record<string, any>>>;
  index: KbSearchIndex;
  graph: KbGraph;
  titleOf: (kind: string, id: string) => string;
}

let ctx: Promise<KbContext> | null = null;

export function loadKb(): Promise<KbContext> {
  if (!ctx) {
    ctx = api.all().then((collections) => {
      const ordered = Object.fromEntries(COLLECTIONS.map((c) => [c.kind, collections[c.kind] ?? []]));
      const graph = buildGraph(ordered);
      return {
        collections: ordered,
        index: createIndex(ordered),
        graph,
        titleOf: (kind, id) => titleOf(graph.nodes.get(`${kind}/${id}`)?.item) || id,
      };
    });
    ctx.catch(() => {
      ctx = null; // falha de rede não fica cacheada
    });
  }
  return ctx;
}

export interface UiSearchHit {
  kind: string;
  id: string;
  title: string;
  summary: string;
  score: number;
  matched: string[];
}

export function searchKb(kb: KbContext, query: string, limit = 30): UiSearchHit[] {
  return searchIndex<Record<string, any>>(kb.index, query, { limit }).map((h) => ({
    kind: h.kind,
    id: h.id,
    title: titleOf(h.item),
    summary: summaryOf(h.item),
    score: h.score,
    matched: h.matched,
  }));
}

export function relatedOf(kb: KbContext, kind: string, id: string): RelatedResult | null {
  return related(kb.graph, kind, id);
}
