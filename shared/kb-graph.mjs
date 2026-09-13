// Grafo lógico da knowledge base derivado dos campos de relação dos JSON — sem graph database.
// Cada relação é GUARDADA uma vez (no item mais específico) e o inverso é DERIVADO aqui, pra não
// existir "A aponta pra B mas B não aponta pra A" divergente no dado.
// Usado por: MCP (tool `related`), frontend (backlinks, cadeias) e testes de integridade (toda
// aresta resolve, sem self-reference acidental).

import { titleOf } from "./kb-kinds.mjs";

const ids = (arr) => (Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);

/**
 * Extrai as arestas dirigidas de UM item.
 * @returns {Array<{ type: string, to: { kind: string, id: string }, label?: string }>}
 */
export function edgesOf(kind, it) {
  const out = [];
  const push = (type, toKind, toIds, label) => {
    for (const id of ids(toIds)) out.push({ type, to: { kind: toKind, id }, ...(label ? { label } : {}) });
  };
  const dbRec = it.databaseRecommendation?.suggestedDbId;
  switch (kind) {
    case "topics":
      push("relatedTopic", "topics", it.relatedTopics);
      push("relatedPattern", "patterns", it.relatedPatterns);
      push("diagram", "diagrams", it.diagrams);
      break;
    case "patterns":
      push("relatedPattern", "patterns", it.relatedPatterns);
      push("diagram", "diagrams", it.diagrams);
      break;
    case "flows":
      push("relatedPattern", "patterns", it.relatedPatterns);
      if (it.diagram) push("diagram", "diagrams", [it.diagram]);
      break;
    case "interview-questions":
      push("relatedPattern", "patterns", it.patterns);
      push("relatedTopic", "topics", it.relatedTopics);
      push("diagram", "diagrams", it.diagrams);
      push("exercisesFailureMode", "failure-modes", it.failureModes);
      push("relatedQuestion", "interview-questions", it.relatedQuestions);
      break;
    case "diagrams":
    case "evidence":
      push("relatedTopic", "topics", it.relatedTopics);
      push("relatedPattern", "patterns", it.relatedPatterns);
      break;
    case "databases":
      push("relatedPattern", "patterns", it.relatedPatterns);
      push("relatedTopic", "topics", it.relatedTopics);
      push("diagram", "diagrams", it.diagrams);
      break;
    case "failure-modes": {
      push("relatedTopic", "topics", it.relatedTopics);
      push("relatedPattern", "patterns", it.relatedPatterns);
      push("diagram", "diagrams", it.diagrams);
      for (const c of it.canCause ?? []) push("canCause", "failure-modes", [c.id], c.mechanism);
      for (const c of it.confusedWith ?? []) push("confusedWith", "failure-modes", [c.id], c.difference);
      for (const m of [...(it.immediateMitigation ?? []), ...(it.longTermSolutions ?? [])]) {
        push("mitigatedBy", "patterns", m.patterns, m.action);
        push("mitigatedBy", "topics", m.topics, m.action);
        push("mitigatedBy", "failure-modes", m.failureModes, m.action);
      }
      for (const w of it.interview?.whatIf ?? []) push("whatIfLeadsTo", "failure-modes", w.leadsTo, w.question);
      break;
    }
    case "incident-drills":
      push("diagnoses", "failure-modes", it.failureModes);
      for (const r of it.answer?.ruledOut ?? []) push("ruledOut", "failure-modes", [r.failureMode], r.why);
      push("relatedQuestion", "interview-questions", it.relatedQuestions);
      break;
    case "comparisons":
      for (const o of it.options ?? []) for (const r of o.refs ?? []) push("compares", r.kind, [r.id], o.name);
      push("diagram", "diagrams", it.diagrams);
      break;
    case "learning-paths":
      for (const s of it.steps ?? []) if (s.ref) push("pathStep", s.ref.kind, [s.ref.id], s.why);
      break;
    default:
      break;
  }
  if (dbRec) push("suggestsDatabase", "databases", [dbRec]);
  // passos da cadeia de falha que apontam para OUTROS failure modes
  if (kind === "failure-modes") {
    for (const s of it.failureChain ?? []) {
      if (s.failureMode && s.failureMode !== it.id) push("chainStep", "failure-modes", [s.failureMode], s.step);
    }
  }
  return out;
}

/** Grafo completo: { nodes: Map<"kind/id", item>, edges: [{from,to,type,label}] }. */
export function buildGraph(collections) {
  const nodes = new Map();
  const edges = [];
  for (const [kind, items] of Object.entries(collections)) {
    for (const it of items ?? []) nodes.set(`${kind}/${it.id}`, { kind, item: it });
  }
  for (const [kind, items] of Object.entries(collections)) {
    for (const it of items ?? []) {
      for (const e of edgesOf(kind, it)) edges.push({ from: { kind, id: it.id }, ...e });
    }
  }
  return { nodes, edges };
}

/** Arestas cujo destino não existe (ou que apontam para o próprio item). */
export function brokenEdges(graph) {
  const bad = [];
  for (const e of graph.edges) {
    const key = `${e.to.kind}/${e.to.id}`;
    if (!graph.nodes.has(key)) bad.push({ ...e, problem: "destino inexistente" });
    else if (e.from.kind === e.to.kind && e.from.id === e.to.id) bad.push({ ...e, problem: "self-reference" });
  }
  return bad;
}

/** Vizinhança de 1 salto (saídas + entradas), com títulos, deduplicada. */
export function related(graph, kind, id) {
  const self = graph.nodes.get(`${kind}/${id}`);
  if (!self) return null;
  const titled = (k, i) => ({ kind: k, id: i, title: titleOf(graph.nodes.get(`${k}/${i}`)?.item) });
  const dedupe = (list) => {
    const seen = new Set();
    return list.filter((x) => {
      const key = `${x.type}|${x.kind}|${x.id}`;
      return seen.has(key) ? false : (seen.add(key), true);
    });
  };
  const outgoing = dedupe(
    graph.edges
      .filter((e) => e.from.kind === kind && e.from.id === id)
      .map((e) => ({ type: e.type, ...titled(e.to.kind, e.to.id), ...(e.label ? { label: e.label } : {}) })),
  );
  const incoming = dedupe(
    graph.edges
      .filter((e) => e.to.kind === kind && e.to.id === id)
      .map((e) => ({ type: e.type, ...titled(e.from.kind, e.from.id), ...(e.label ? { label: e.label } : {}) })),
  );
  return { item: titled(kind, id), outgoing, incoming };
}

/** Ids de failure modes alcançáveis a partir de `fromId` seguindo `canCause`. */
export function reachableFailureModes(failureModes, fromId) {
  const byId = new Map(failureModes.map((f) => [f.id, f]));
  const seen = new Set();
  const stack = [fromId];
  while (stack.length) {
    const cur = byId.get(stack.pop());
    for (const c of cur?.canCause ?? []) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        stack.push(c.id);
      }
    }
  }
  return seen;
}
