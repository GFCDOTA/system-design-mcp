// Testes dos mapas mentais do conteúdo do curso (pergunta do qbank + doc do
// leitor). Fixtures 100% SINTÉTICAS — nunca conteúdo do curso pago (regra-mãe
// do repo). Roda: npm test (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildQuestionMindmap, buildDocMindmap, isQuestionBlock } from "../src/data/mindmapCourse.js";

test("pergunta: resposta de 1 parágrafo abre em sentenças como ramos", () => {
  const code = buildQuestionMindmap({
    id: "syn-1",
    q: "What is a synthetic widget?",
    blocks: [
      "A synthetic widget renders imaginary data. It exists only inside this test fixture. Its purpose is to prove the sentence fan works.",
    ],
  });
  assert.match(code, /^mindmap\n/);
  assert.match(code, /root\(\(What is a synthetic widget\?\)\)/);
  assert.match(code, /A synthetic widget renders imaginary data/);
  assert.match(code, /It exists only inside this test fixture/);
});

test("pergunta: enumeração vira folhas do ramo do bloco", () => {
  const code = buildQuestionMindmap({
    id: "syn-2",
    q: "Which properties matter?",
    blocks: ["The main properties are these.\n1. First property\n2. Second property\n- Third item"],
  });
  assert.match(code, /The main properties are these/);
  assert.match(code, /First property/);
  assert.match(code, /Second property/);
  assert.match(code, /Third item/);
});

test("pergunta: bloco de código vira ramo 'Código de exemplo' e nunca é cortado", () => {
  const longBlocks = Array.from(
    { length: 12 },
    (_, i) => `Sentence number ${i} of a very synthetic answer that keeps going with detail.`,
  );
  const code = buildQuestionMindmap({
    id: "syn-3",
    q: "Show me code?",
    blocks: [...longBlocks, "public class Foo {\n  void run() { return; }\n}"],
  });
  assert.match(code, /Código de exemplo/);
  assert.match(code, /public class Foo/);
});

test("pergunta: chars que quebram Mermaid são limpos dos nós", () => {
  const code = buildQuestionMindmap({
    id: "syn-4",
    q: "What (exactly) breaks: mermaid [nodes]?",
    blocks: ["An answer with (parens) and [brackets] mixed in. More explanatory text follows in a second sentence."],
  });
  // parênteses só existem no wrapper root((…)); colchetes/chaves/etc nunca
  assert.doesNotMatch(code, /[[\]{}#;"|]/);
  assert.match(code, /root\(\(What exactly breaks mermaid nodes\?\)\)/);
});

test("doc: outline filtra artefato de página, bullet e running header; marca p.N", () => {
  const doc = {
    file: "syn.pdf",
    stats: { pages: 3, textPages: 3, imagePages: 0 },
    pages: [
      {
        n: 1,
        blocks: [
          "1 | P a g e",
          "Synthetic Running Header",
          "Intro Section",
          "o bullet item",
          "A paragraph explaining things at length, with detail.",
        ],
      },
      { n: 2, blocks: ["2 | P a g e", "Synthetic Running Header", "Deep Dive Section"] },
      { n: 3, blocks: ["3 | P a g e", "Synthetic Running Header", "Wrap Up Section"] },
    ],
  };
  const code = buildDocMindmap(doc, "Synthetic Doc");
  assert.match(code, /root\(\(Synthetic Doc\)\)/);
  assert.match(code, /Intro Section · p\.1/);
  assert.match(code, /Deep Dive Section · p\.2/);
  assert.match(code, /Wrap Up Section · p\.3/);
  assert.doesNotMatch(code, /P a g e/);
  assert.doesNotMatch(code, /Running Header/);
  assert.doesNotMatch(code, /bullet item/);
});

test("doc: modo Q&A quando perguntas dominam — ramos são as perguntas", () => {
  const blocks = [];
  for (let i = 1; i <= 9; i++) blocks.push(`Question ${i}: what about synthetic topic ${i}?`);
  const doc = { file: "q.pdf", stats: { pages: 1, textPages: 1, imagePages: 0 }, pages: [{ n: 1, blocks }] };
  const code = buildDocMindmap(doc, "Q Doc");
  assert.match(code, /what about synthetic topic 1\? · p\.1/);
  assert.match(code, /what about synthetic topic 9/);
});

test("doc: no máximo 12 ramos; headings excedentes viram folhas (nada se perde)", () => {
  const pages = [];
  for (let p = 1; p <= 30; p++) pages.push({ n: p, blocks: [`Unique Heading Number ${p}`] });
  const doc = { file: "h.pdf", stats: { pages: 30, textPages: 30, imagePages: 0 }, pages };
  const code = buildDocMindmap(doc, "Big Doc");
  const branchLines = code.split("\n").filter((l) => /^    \S/.test(l));
  assert.ok(branchLines.length <= 12, `${branchLines.length} ramos (esperado <= 12)`);
  for (let p = 1; p <= 30; p++) assert.match(code, new RegExp(`Unique Heading Number ${p}\\b`));
});

test("doc: >48 itens — excedente vira indicador '+N', nunca perda silenciosa", () => {
  const pages = [];
  for (let p = 1; p <= 60; p++) pages.push({ n: p, blocks: [`Unique Heading Number ${p}`] });
  const doc = { file: "big.pdf", stats: { pages: 60, textPages: 60, imagePages: 0 }, pages };
  const code = buildDocMindmap(doc, "Huge Doc");
  const branchLines = code.split("\n").filter((l) => /^    \S/.test(l));
  assert.ok(branchLines.length <= 12, `${branchLines.length} ramos (esperado <= 12)`);
  // size=5: cada grupo mostra 1 ramo + 3 folhas e declara o que ficou de fora
  assert.match(code, /\+1 item neste trecho/);
});

test("isQuestionBlock: contrato compartilhado com o leitor (Q1., Question, linha com ?)", () => {
  assert.ok(isQuestionBlock("Q3) What is a synthetic thing?"));
  assert.ok(isQuestionBlock("Question: does this trigger?"));
  assert.ok(isQuestionBlock("Short line ending in a question mark?"));
  assert.ok(!isQuestionBlock("A plain statement about nothing."));
  assert.ok(!isQuestionBlock("x".repeat(200) + "?")); // longa demais pra ser pergunta
});

test("doc: sem estrutura textual → mapa fica só na raiz (a UI esconde o botão)", () => {
  const doc = { file: "img.pdf", stats: { pages: 2, textPages: 0, imagePages: 2 }, pages: [{ n: 1, image: "a.png" }, { n: 2, image: "b.png" }] };
  const code = buildDocMindmap(doc, "Scanned Doc");
  assert.equal(code.split("\n").length, 2); // "mindmap" + root
});
