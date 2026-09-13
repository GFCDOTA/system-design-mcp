// Registro ÚNICO das coleções da knowledge base. MCP e frontend leem daqui qual arquivo é qual
// coleção, como achar título/resumo de um item e a descrição de cada coleção.
// Puro ESM sem dependência: importado pelo MCP (Node) e pelo frontend (Vite) — e testado por node --test.

/** @type {ReadonlyArray<{kind: string, file: string, description: string, route?: string}>} */
export const COLLECTIONS = Object.freeze([
  { kind: "topics", file: "topics.json", route: "/topics", description: "Topicos de System Design (capitulos do workbook)" },
  { kind: "patterns", file: "patterns.json", route: "/patterns", description: "Padroes arquiteturais (microservices.io + extras do livro)" },
  { kind: "flows", file: "flows.json", route: "/flows", description: "Fluxos arquiteturais passo a passo dos repositorios de referencia" },
  { kind: "interview-questions", file: "interview-questions.json", route: "/entrevista/system-design", description: "Perguntas de entrevista de System Design (senior/staff) com follow-ups, red flags e sinais fortes" },
  { kind: "diagrams", file: "diagrams.json", route: "/diagrams", description: "Diagramas Mermaid de arquiteturas, fluxos e comportamento de falhas" },
  { kind: "evidence", file: "evidence.json", route: "/evidence", description: "Matriz afirmacao -> evidencia -> fonte" },
  { kind: "ai-glossary", file: "ai-agents-glossary.json", route: "/ai-agents", description: "Glossario IA & Agentes (pra dev backend)" },
  { kind: "databases", file: "databases.json", route: "/databases", description: "Bancos de dados AWS (Aurora, RDS, DynamoDB, DocumentDB, ElastiCache) com preco, CAP/PACELC e trade-offs" },
  { kind: "failure-modes", file: "failure-modes.json", route: "/failure-modes", description: "Failure modes at scale: como sistemas quebram em producao — cenario com numeros, cadeia de falha, sintomas, diagnostico, mitigacao agora vs correcao definitiva, observabilidade e resposta de entrevista" },
  { kind: "incident-drills", file: "incident-drills.json", route: "/drills", description: "Incident drills: sinais de producao -> diagnostico -> mitigacao (treino deterministico, sem LLM)" },
  { kind: "comparisons", file: "comparisons.json", route: "/compare", description: "Comparacoes lado a lado de conceitos que costumam ser confundidos (problema, quando usar/evitar, como falha, trade-off)" },
  { kind: "learning-paths", file: "learning-paths.json", route: "/paths", description: "Trilhas de estudo curadas: conceito -> padrao -> falha -> treino" },
  { kind: "rubrics", file: "rubrics.json", description: "Rubricas de avaliacao de entrevista por criterio (0-5) com evidencia obrigatoria do transcript" },
]);

export const KINDS = Object.freeze(COLLECTIONS.map((c) => c.kind));

export function collectionOf(kind) {
  return COLLECTIONS.find((c) => c.kind === kind);
}

export function titleOf(it) {
  return it?.title ?? it?.name ?? it?.term ?? it?.question ?? it?.claim ?? it?.id ?? "";
}

export function summaryOf(it) {
  return (
    it?.summary ?? it?.problem ?? it?.definition ?? it?.shortAnswer ?? it?.goal ?? it?.description ??
    it?.evidence ?? (it?.scenario ? it.question : undefined) ?? ""
  );
}
