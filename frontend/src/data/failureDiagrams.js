// Diagramas Mermaid DETERMINÍSTICOS derivados dos failure modes (sem LLM): a cadeia de falha de um item
// e o grafo causal (canCause) de todos. Puro e testável (test/study-logic.test.mjs).

/** Rótulo seguro para Mermaid: remove caracteres com significado sintático e limita o tamanho. */
export function mermaidLabel(text, max = 80) {
  const clean = String(text ?? "")
    .replace(/["<>{}[\]()#;|`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean;
}

/** Cadeia de falha de UM failure mode: passos em ordem; o próprio item e os outros failure modes destacados. */
export function failureChainMermaid(fm, titleById = {}) {
  const lines = ["flowchart TD"];
  fm.failureChain.forEach((s, i) => {
    const ref = s.failureMode && s.failureMode !== fm.id ? ` · ${titleById[s.failureMode] ?? s.failureMode}` : "";
    const cls = s.failureMode === fm.id ? "self" : s.failureMode ? "other" : "step";
    lines.push(`  S${i}["${mermaidLabel(s.step + ref, 90)}"]:::${cls}`);
    if (i > 0) lines.push(`  S${i - 1} --> S${i}`);
  });
  lines.push("  classDef self fill:#8F7DFF,stroke:#8F7DFF,color:#ffffff");
  lines.push("  classDef other fill:#3a2a33,stroke:#FB7185,color:#ffffff");
  lines.push("  classDef step fill:#2B333E,stroke:#AEB7C4,color:#EAEEF5");
  return lines.join("\n");
}

/** Grafo causal de todos os failure modes (arestas canCause). `focusId` destaca um item e seus vizinhos. */
export function causalGraphMermaid(fms, focusId) {
  const idx = new Map(fms.map((f, i) => [f.id, i]));
  const lines = ["flowchart LR"];
  const neighbours = new Set();
  if (focusId) {
    const focus = fms.find((f) => f.id === focusId);
    for (const c of focus?.canCause ?? []) neighbours.add(c.id);
    for (const f of fms) if (f.canCause.some((c) => c.id === focusId)) neighbours.add(f.id);
  }
  fms.forEach((f, i) => {
    const cls = f.id === focusId ? "focus" : neighbours.has(f.id) ? "near" : "node";
    lines.push(`  F${i}["${mermaidLabel(f.title.split(" (")[0], 40)}"]:::${cls}`);
  });
  for (const f of fms) {
    for (const c of f.canCause) {
      if (idx.has(c.id)) lines.push(`  F${idx.get(f.id)} --> F${idx.get(c.id)}`);
    }
  }
  lines.push("  classDef focus fill:#8F7DFF,stroke:#8F7DFF,color:#ffffff");
  lines.push("  classDef near fill:#3a2a33,stroke:#FB7185,color:#ffffff");
  lines.push("  classDef node fill:#2B333E,stroke:#AEB7C4,color:#EAEEF5");
  return lines.join("\n");
}
