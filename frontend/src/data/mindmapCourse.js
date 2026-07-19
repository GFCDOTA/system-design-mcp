// Mapas mentais do CONTEÚDO DO CURSO — pergunta do qbank e doc extraído do
// leitor. Projeção determinística (sem LLM) sobre a estrutura que EXISTE no
// texto: sentenças da resposta, enumerações, blocos de código, headings
// detectáveis e páginas. A maioria das perguntas (375/408) tem resposta de um
// parágrafo só — por isso o mapa da pergunta abre em SENTENÇAS, não em blocos.
import { build, clean, firstSentence } from "./mindmapCore.js";

/** Mesma heurística de código do leitor/qbank (mantida em sincronia). */
function isCode(text) {
  return /[{};]/.test(text) && (/\b(public|private|class|void|return|new|import)\b/.test(text) || text.includes("\n"));
}

/** Itens enumerados de um bloco ("1. x", "- y", "o z") — viram folhas. */
function enumItems(text, limit = 5) {
  const out = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(?:\d+[.)]\s+|[-•*–]\s+|o\s+)(.{3,})/);
    if (m) out.push(m[1]);
    if (out.length >= limit) break;
  }
  return out;
}

/** Sentenças de um parágrafo (corte em .!? seguido de maiúscula/dígito). */
function sentences(text, limit = 6) {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 15)
    .slice(0, limit);
}

/**
 * Mapa de UMA pergunta do qbank: root = pergunta; ramos = as sentenças da
 * resposta (o fan de ideias); enumerações viram folhas do seu bloco; código
 * vira um ramo próprio com a primeira linha de cada exemplo.
 */
export function buildQuestionMindmap(q) {
  const branches = [];
  const codeLines = [];
  for (const b of q.blocks || []) {
    if (isCode(b)) {
      const first = b.split("\n").find((l) => l.trim());
      if (first && codeLines.length < 3) codeLines.push(first);
      continue;
    }
    const items = enumItems(b);
    if (items.length) {
      branches.push({ title: firstSentence(b), leaves: items });
      continue;
    }
    for (const s of sentences(b)) {
      if (branches.length < 8) branches.push({ title: s, leaves: [] });
    }
  }
  const out = branches.slice(0, codeLines.length ? 8 : 9);
  if (codeLines.length) out.push({ title: "Código de exemplo", leaves: codeLines });
  return build(q.q, out, { branchMax: 48, leafless: true });
}

const PAGE_ARTIFACT = /^\d+\s*\|\s*p\s*a\s*g\s*e/i;
const BULLET = /^(?:o|•|•|-|\*|–)\s/;

/** Pergunta de entrevista dentro de um doc (mesma heurística do leitor). */
function isQuestionBlock(t) {
  return /^\s*(Q\d+[.)]|Question\b)/i.test(t) || (t.length < 160 && t.trimEnd().endsWith("?"));
}

/**
 * Mapa de um DOC extraído: outline "o que este doc cobre" + onde (p.N).
 * Headings = linhas curtas sem pontuação final, filtrando artefatos de página
 * ("N | P a g e"), bullets e running headers (texto que repete em 3+ páginas).
 * Doc de Q&A (perguntas dominam) mapeia as PERGUNTAS em vez dos headings.
 * Até 12 ramos na ordem do doc; o excedente de cada trecho vira folha.
 */
export function buildDocMindmap(doc, title) {
  const headings = [];
  const questions = [];
  const freq = new Map();
  for (const p of doc.pages || []) {
    if (!p.blocks) continue;
    for (const raw of p.blocks) {
      const t = raw.trim();
      if (isQuestionBlock(t)) {
        questions.push({ text: t.replace(/^\s*(?:Q\d+[.)]|Question\s*\d*[.:)]?)\s*/i, ""), page: p.n });
        continue;
      }
      if (t.includes("\n") || t.length < 4 || t.length > 60) continue;
      if (/[.:;,]$/.test(t) || PAGE_ARTIFACT.test(t) || BULLET.test(t) || /^\d+$/.test(t) || isCode(t)) continue;
      headings.push({ text: t, page: p.n });
      const k = t.toLowerCase();
      freq.set(k, (freq.get(k) || 0) + 1);
    }
  }
  // running headers (repetem pelo doc) caem inteiros; duplicata fica só a 1ª
  const seen = new Set();
  const outline = headings.filter((h) => {
    const k = h.text.toLowerCase();
    if ((freq.get(k) || 0) >= 3 || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const qa = questions.length >= 8 && questions.length >= outline.length;
  const items = qa ? questions : outline;
  const size = Math.max(1, Math.ceil(items.length / 12));
  const branches = [];
  for (let i = 0; i < items.length; i += size) {
    const g = items.slice(i, i + size);
    branches.push({
      title: `${clean(g[0].text, 38)} · p.${g[0].page}`,
      leaves: g.slice(1, 4).map((x) => x.text),
    });
  }
  return build(title, branches, { branchMax: 60, leafless: true });
}
