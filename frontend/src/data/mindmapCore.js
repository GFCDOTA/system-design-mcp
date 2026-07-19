// Núcleo do gerador de mapa mental (sintaxe Mermaid `mindmap`) — funções puras
// de texto, sem framework, no padrão testável de atsValidator.js/readiness.js:
// o app (TS) importa via .d.ts e os testes (node --test) importam direto.

/** Limpa texto pra caber num nó Mermaid (tira markdown e chars que quebram a sintaxe). */
export function clean(s, max = 55) {
  let t = (s || "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/::/g, " ")
    .replace(/[()[\]{}#;:"|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length > max) t = t.slice(0, max - 1).replace(/\s+\S*$/, "").trim() + "…";
  return t;
}

/** Primeira sentença (15–140 chars) — a frase-chave de um bloco de texto. */
export function firstSentence(s) {
  const m = (s || "").match(/^([\s\S]{15,140}?[.!?])(\s|$)/);
  return m ? m[1] : s;
}

/** "load-balancing" → "Load balancing". */
export function humanize(id) {
  const t = id.replace(/-/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Termos em **negrito** do texto, únicos e curtos (os conceitos-chave). */
export function keyConcepts(text, limit = 8) {
  const found = (text.match(/\*\*([^*]+)\*\*/g) || []).map((x) => x.replace(/\*/g, "").trim());
  const seen = new Set();
  const out = [];
  for (const c of found) {
    const k = c.toLowerCase();
    if (c.length > 1 && c.length < 42 && !seen.has(k)) {
      seen.add(k);
      out.push(c);
    }
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Constrói as linhas Mermaid com indentação (2 espaços por nível).
 * `opts.branchMax` alarga o título do ramo (default 30 — o histórico dos
 * mapas de tópico/padrão) para projeções que carregam sufixo (ex.: "· p.12").
 * `opts.leafless` mantém ramo sem folhas (projeções onde o título É o conteúdo,
 * ex.: sentença de resposta); no default, ramo vazio segue descartado.
 */
export function build(rootText, branches, opts = {}) {
  const branchMax = opts.branchMax ?? 30;
  const L = ["mindmap", `  root((${clean(rootText, 40) || "Mapa"}))`];
  for (const b of branches) {
    const bt = clean(b.title, branchMax);
    if (!bt) continue;
    const hasContent = b.leaves.some((x) => clean(x)) || (b.sub && b.sub.length);
    if (!hasContent && !opts.leafless) continue;
    L.push(`    ${bt}`);
    for (const leaf of b.leaves) {
      const lt = clean(leaf);
      if (lt) L.push(`      ${lt}`);
    }
    for (const s of b.sub || []) {
      const st = clean(s.title, 45);
      if (!st) continue;
      L.push(`      ${st}`);
      for (const leaf of s.leaves) {
        const lt = clean(leaf);
        if (lt) L.push(`        ${lt}`);
      }
    }
  }
  return L.join("\n");
}
