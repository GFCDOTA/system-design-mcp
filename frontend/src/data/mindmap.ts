// Gera um mapa mental (sintaxe Mermaid `mindmap`) a partir da ESTRUTURA de um
// tópico/padrão — determinístico, sem LLM. Usa os campos já estruturados
// (resumo, trade-offs, relacionados) + os termos em **negrito** do texto
// detalhado (o autor já marcou o que importa) como conceitos-chave.
import type { Topic, Pattern } from "../api";

/** Limpa texto pra caber num nó Mermaid (tira markdown e chars que quebram a sintaxe). */
function clean(s: string, max = 55): string {
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

function firstSentence(s: string): string {
  const m = (s || "").match(/^([\s\S]{15,140}?[.!?])(\s|$)/);
  return m ? m[1] : s;
}

function humanize(id: string): string {
  const t = id.replace(/-/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Termos em **negrito** do texto, únicos e curtos (os conceitos-chave). */
function keyConcepts(text: string, limit = 8): string[] {
  const found = (text.match(/\*\*([^*]+)\*\*/g) || []).map((x) => x.replace(/\*/g, "").trim());
  const seen = new Set<string>();
  const out: string[] = [];
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

/** Constrói as linhas Mermaid com indentação (2 espaços por nível). */
function build(rootText: string, branches: { title: string; leaves: string[]; sub?: { title: string; leaves: string[] }[] }[]): string {
  const L = ["mindmap", `  root((${clean(rootText, 40) || "Mapa"}))`];
  for (const b of branches) {
    const bt = clean(b.title, 30);
    if (!bt) continue;
    const hasContent = b.leaves.some((x) => clean(x)) || (b.sub && b.sub.length);
    if (!hasContent) continue;
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

export function buildTopicMindmap(t: Topic): string {
  return build(t.title, [
    { title: "Resumo", leaves: [clean(t.summary, 72)] },
    { title: "Conceitos-chave", leaves: keyConcepts(t.detailedExplanation) },
    {
      title: "Trade-offs",
      leaves: [],
      sub: (t.tradeOffs || []).slice(0, 4).map((to) => ({
        title: to.dimension,
        leaves: [to.pro && `Prós ${firstSentence(to.pro)}`, to.con && `Contras ${firstSentence(to.con)}`].filter(Boolean) as string[],
      })),
    },
    { title: "Em entrevista", leaves: t.interviewAngle ? [firstSentence(t.interviewAngle)] : [] },
    {
      title: "Relacionados",
      leaves: [],
      sub: [
        { title: "Tópicos", leaves: (t.relatedTopics || []).slice(0, 6).map(humanize) },
        { title: "Padrões", leaves: (t.relatedPatterns || []).slice(0, 6).map(humanize) },
      ].filter((s) => s.leaves.length),
    },
  ]);
}

export function buildPatternMindmap(p: Pattern): string {
  return build(p.name, [
    { title: "Problema", leaves: [firstSentence(p.problem)] },
    { title: "Solução", leaves: keyConcepts(p.solution).length ? keyConcepts(p.solution) : [firstSentence(p.solution)] },
    { title: "Quando usar", leaves: (p.whenToUse || []).slice(0, 5) },
    { title: "Quando evitar", leaves: (p.whenToAvoid || []).slice(0, 5) },
    {
      title: "Trade-offs",
      leaves: [],
      sub: (p.tradeOffs || []).slice(0, 4).map((to) => ({
        title: to.dimension,
        leaves: [to.pro && `Prós ${firstSentence(to.pro)}`, to.con && `Contras ${firstSentence(to.con)}`].filter(Boolean) as string[],
      })),
    },
    { title: "Em entrevista", leaves: p.interviewAngle ? [firstSentence(p.interviewAngle)] : [] },
    { title: "Relacionados", leaves: (p.relatedPatterns || []).slice(0, 6).map(humanize) },
  ]);
}
