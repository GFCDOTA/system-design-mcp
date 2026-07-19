// Mapas mentais de tópico/padrão da KB — projeções tipadas sobre o núcleo
// (mindmapCore.js). Determinístico, sem LLM: usa os campos já estruturados
// (resumo, trade-offs, relacionados) + os termos em **negrito** do texto
// detalhado (o autor já marcou o que importa) como conceitos-chave.
import type { Topic, Pattern } from "../api";
import { build, clean, firstSentence, humanize, keyConcepts } from "./mindmapCore";

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
