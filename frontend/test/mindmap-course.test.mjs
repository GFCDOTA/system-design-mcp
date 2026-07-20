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
  // parênteses ASCII só no wrapper root((…)) — no texto viram ❨❩; resto some
  assert.doesNotMatch(code, /[[\]{}#;"|]/);
  assert.match(code, /root\(\(What ❨exactly❩ breaks — mermaid nodes\?\)\)/);
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
  // os 3 headings compartilham "Section" → grupo coeso: 1 ramo com p.N + 2 folhas
  assert.match(code, /^    Intro Section · p\.1$/m);
  assert.match(code, /^      Deep Dive Section$/m);
  assert.match(code, /^      Wrap Up Section$/m);
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

test("doc Q&A: pergunta NUNCA vira filha de outra — sempre irmãs (veredito v3)", () => {
  const blocks = [];
  for (let i = 1; i <= 9; i++) blocks.push(`Question ${i}: what about synthetic topic ${i}?`);
  const doc = { file: "q2.pdf", stats: { pages: 1, textPages: 1, imagePages: 0 }, pages: [{ n: 1, blocks }] };
  const code = buildDocMindmap(doc, "Q Doc");
  // nenhuma pergunta em nível de folha (6 espaços): todas irmãs no nível de ramo
  const leafQuestions = code.split("\n").filter((l) => /^      .*topic/.test(l));
  assert.equal(leafQuestions.length, 0, `perguntas aninhadas: ${leafQuestions.join(" | ")}`);
});

test("compressor: nó técnico crítico não termina em '…' — excedente vira filho completo", () => {
  const code = buildQuestionMindmap({
    id: "syn-c8",
    q: "Qual o contrato?",
    blocks: ["Se a.equals(b) então a.hashCode() == b.hashCode() — obrigatório. Nada mais neste bloco de teste."],
  });
  // o contrato sai COMPLETO no nó (nada escondido) e nenhum nó do mapa trunca
  assert.match(code, /^    Se a\.equals❨b❩ então a\.hashCode❨❩ == b\.hashCode❨❩ — obrigatório$/m);
  assert.doesNotMatch(code, /…/);
});

test("compressor: cauda longa divide em folhas completas, não trunca", () => {
  const code = buildQuestionMindmap({
    id: "syn-c9",
    q: "O que acontece?",
    blocks: [
      "Violando isso, coleções hash quebram: o objeto entra num bucket pelo hash antigo e a busca procura no bucket errado → elemento some da coleção sintética.",
    ],
  });
  assert.match(code, /^    Violando isso, coleções hash quebram$/m);
  // a cauda (~110 chars) vira 2 folhas completas divididas no "→"
  assert.match(code, /^      o objeto entra num bucket pelo hash antigo e a busca procura no bucket errado$/m);
  assert.match(code, /^      elemento some da coleção sintética$/m);
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

test("doc: >48 itens — excedente vira UM nó global, não chip repetido por ramo", () => {
  const pages = [];
  for (let p = 1; p <= 60; p++) pages.push({ n: p, blocks: [`Unique Heading Number ${p}`] });
  const doc = { file: "big.pdf", stats: { pages: 60, textPages: 60, imagePages: 0 }, pages };
  const code = buildDocMindmap(doc, "Huge Doc");
  // 12 grupos de 5: 4 mostrados por grupo, 1 dropado → 12 fora do mapa, declarados 1x só
  const chips = code.match(/itens fora do mapa/g) || [];
  assert.equal(chips.length, 1, `esperado 1 nó global de excedente, veio ${chips.length}`);
  assert.match(code, /\+12 itens fora do mapa/);
  assert.doesNotMatch(code, /neste trecho/); // o chip por ramo morreu (veredito do GPT)
});

test("doc: ruído de extração sem palavra real ('q 20s') é filtrado do outline", () => {
  const doc = {
    file: "n.pdf",
    stats: { pages: 1, textPages: 1, imagePages: 0 },
    pages: [{ n: 1, blocks: ["q 20s", "Real Section Name", "x 9"] }],
  };
  const code = buildDocMindmap(doc, "Noise Doc");
  assert.match(code, /Real Section Name/);
  assert.doesNotMatch(code, /q 20s/);
  assert.doesNotMatch(code, /x 9/);
});

test("compressor: 'X stands for Y' vira 'X = Y' e a cauda vira filho", () => {
  const code = buildQuestionMindmap({
    id: "syn-c1",
    q: "What is SWid?",
    blocks: ["SWid stands for Synthetic Widget, which is the part of the test fixture that renders imaginary data on demand."],
  });
  assert.match(code, /^    SWid = Synthetic Widget$/m);
  assert.match(code, /^      the part of the test fixture/m);
});

test("compressor: filler 'It is important because' cai e sobra o conceito", () => {
  const code = buildQuestionMindmap({
    id: "syn-c2",
    q: "Why does it matter?",
    blocks: ["It is important because it provides a fake runtime environment for executing synthetic scenarios in every test."],
  });
  assert.doesNotMatch(code, /It is important/);
  assert.match(code, /Provides a fake runtime environment/);
});

test("compressor: sentença longa corta em fronteira de cláusula; cauda vira filho", () => {
  const code = buildQuestionMindmap({
    id: "syn-c3",
    q: "How does the pipeline work?",
    blocks: ["A synthetic pipeline bundles many stages, keeping each stage isolated from the others by design."],
  });
  assert.match(code, /^    A synthetic pipeline bundles many stages$/m);
  assert.match(code, /^      keeping each stage isolated/m);
});

test("compressor: sentença curta (formato curado) fica intacta — não regride", () => {
  const code = buildQuestionMindmap({
    id: "syn-c4",
    q: "Qual o contrato?",
    blocks: ["Se a.equalsb então a.hashCode == b.hashCode — obrigatório. O inverso não implica nada aqui."],
  });
  assert.match(code, /Se a.equalsb então a.hashCode == b.hashCode — obrigatório/);
  assert.match(code, /O inverso não implica nada aqui/);
});

test("doc: filho só fica na seção se tiver coesão lexical com o heading", () => {
  // "Widget Advantages"/"Widget Drawbacks" compartilham termo com o head;
  // "Array Basics" não — vai pro excedente, nunca vira filho de seção errada.
  const doc = {
    file: "c.pdf",
    stats: { pages: 1, textPages: 1, imagePages: 0 },
    pages: [{ n: 1, blocks: ["Widget Encapsulation Guide", "Widget Advantages", "Widget Drawbacks", "Array Basics Overview"] }],
  };
  const code = buildDocMindmap(doc, "Cohesion Doc");
  assert.match(code, /^    Widget Encapsulation Guide · p\.1$/m);
  assert.match(code, /^      Widget Advantages$/m);
  assert.doesNotMatch(code, /^      Array Basics Overview$/m); // sem termo em comum → não é filho
  assert.match(code, /^    Array Basics Overview · p\.1$/m); // vira ramo próprio (coeso consigo)
});

test("compressor: corte não deixa conjunção órfã — retrocede pra fronteira autônoma", () => {
  const code = buildQuestionMindmap({
    id: "syn-c6",
    q: "How is it done?",
    blocks: ["Usually done by making fields private and providing public getter and setter methods."],
  });
  // corta ANTES do "and": dois rótulos autônomos
  assert.match(code, /^    Usually done by making fields private$/m);
  assert.match(code, /^      providing public getter and setter methods$/m);
  assert.doesNotMatch(code, /^      and /m); // filho nunca começa com conjunção
});

test("clean: parênteses de chamada sobrevivem (a.equals❨b❩) — sintaxe técnica não degrada", () => {
  const code = buildQuestionMindmap({
    id: "syn-c7",
    q: "Qual o contrato?",
    blocks: ["Se a.equals(b) então a.hashCode() == b.hashCode() — obrigatório. Nada mais importa neste teste."],
  });
  assert.match(code, /a\.equals❨b❩/);
  assert.match(code, /a\.hashCode❨❩ == b\.hashCode❨❩/);
  assert.doesNotMatch(code, /equalsb/); // a corrupção que o juiz apontou
});

test("compressor: fragmento de código solto NÃO vira conceito — vai pro ramo de código", () => {
  const code = buildQuestionMindmap({
    id: "syn-c5",
    q: "Show the setter?",
    blocks: ["The setter assigns the incoming value to the private field.", "self.count = nextCount"],
  });
  assert.match(code, /Código de exemplo/);
  assert.match(code, /^      self.count = nextCount$/m); // folha do ramo de código
  assert.doesNotMatch(code, /^    self.count/m); // nunca ramo-irmão de conceito
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
