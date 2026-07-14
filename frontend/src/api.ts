// Cliente de dados 100% ESTÁTICO — lê os JSON do knowledge-base servidos em
// /kb/*.json (copiados de ../knowledge-base no predev/prebuild). Sem backend:
// as listas e o /stats são projetados/contados no próprio cliente.

export interface SourceRef {
  kind: "pdf" | "repo" | "reference";
  source: string;
  locator: string;
  note?: string | null;
  url?: string | null;
}

export interface TradeOff {
  dimension: string;
  pro: string;
  con: string;
}

export interface DatabaseRecommendation {
  suggestedDbId: string;
  level?: string;
  rationale: string;
}

export interface DatabaseSummary {
  id: string;
  name: string;
  category: string;
  engine: string;
  summary: string;
  priceMonthly: string;
  capTheorem: string;
}

export interface Database extends DatabaseSummary {
  priceAnnual: string;
  pacelc: string;
  failover: string;
  azs: string;
  whenToUse: string[];
  whenToAvoid: string[];
  tradeOffs: TradeOff[];
  relatedPatterns: string[];
  relatedTopics: string[];
  diagrams: string[];
  sourceRefs: SourceRef[];
}

export interface TopicSummary {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface Topic extends TopicSummary {
  detailedExplanation: string;
  relatedTopics: string[];
  relatedPatterns: string[];
  tradeOffs: TradeOff[];
  interviewAngle: string;
  example: string;
  diagrams: string[];
  databaseRecommendation?: DatabaseRecommendation;
  sourceRefs: SourceRef[];
}

export interface PatternSummary {
  id: string;
  name: string;
  category: string;
  problem: string;
}

export interface Pattern extends PatternSummary {
  solution: string;
  whenToUse: string[];
  whenToAvoid: string[];
  exampleFromRepo: string;
  financialExample: string;
  tradeOffs: TradeOff[];
  relatedPatterns: string[];
  interviewAngle: string;
  diagrams: string[];
  databaseRecommendation?: DatabaseRecommendation;
  sourceRefs: SourceRef[];
}

export interface FlowStep {
  order: number;
  actor: string;
  action: string;
  note?: string | null;
}

export interface FlowSummary {
  id: string;
  title: string;
  summary: string;
}

export interface Flow extends FlowSummary {
  components: string[];
  steps: FlowStep[];
  relatedPatterns: string[];
  diagram?: string | null;
  databaseRecommendation?: DatabaseRecommendation;
  sourceRefs: SourceRef[];
}

export interface QuestionSummary {
  id: string;
  question: string;
  difficulty: string;
}

export interface InterviewQuestion extends QuestionSummary {
  shortAnswer: string;
  detailedAnswer: string;
  mentalModel: string;
  patterns: string[];
  risks: string[];
  tradeOffs: TradeOff[];
  repoExample: string;
  howToAnswerInInterview: string;
  relatedTopics: string[];
  diagrams: string[];
  sourceRefs: SourceRef[];
}

export interface DiagramSummary {
  id: string;
  title: string;
  description: string;
}

export interface Diagram extends DiagramSummary {
  mermaid: string;
  relatedTopics: string[];
  relatedPatterns: string[];
  sourceRefs: SourceRef[];
}

export interface Evidence {
  id: string;
  claim: string;
  evidence: string;
  relatedTopics: string[];
  relatedPatterns: string[];
  sourceRefs: SourceRef[];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  framing?: string | null;
  kind: "term" | "comparison";
  definition: string;
  backendAnalogy: string;
  pitfall: string;
  sourceRefs: SourceRef[];
}

export interface Stats {
  topics: number;
  patterns: number;
  flows: number;
  interviewQuestions: number;
  diagrams: number;
  evidence: number;
  aiGlossary: number;
  databases: number;
}

// Cada coleção é carregada UMA vez de /kb/<arquivo>.json e cacheada (a lista e
// os detalhes saem do mesmo array). O SW cacheia o arquivo; isto evita re-parse.
const cache = new Map<string, Promise<unknown[]>>();

function load<T>(file: string): Promise<T[]> {
  let p = cache.get(file);
  if (!p) {
    p = fetch(`/kb/${file}.json`, { headers: { Accept: "application/json" } }).then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} em /kb/${file}.json`);
      return res.json();
    });
    cache.set(file, p);
  }
  return p as Promise<T[]>;
}

async function byId<T extends { id: string }>(file: string, id: string): Promise<T> {
  const all = await load<T>(file);
  const found = all.find((x) => x.id === id);
  if (!found) throw new Error(`"${id}" não encontrado em ${file}`);
  return found;
}

export const api = {
  stats: async (): Promise<Stats> => {
    const [topics, patterns, flows, interviewQuestions, diagrams, evidence, aiGlossary, databases] = await Promise.all([
      load("topics"),
      load("patterns"),
      load("flows"),
      load("interview-questions"),
      load("diagrams"),
      load("evidence"),
      load("ai-agents-glossary"),
      load("databases"),
    ]);
    return {
      topics: topics.length,
      patterns: patterns.length,
      flows: flows.length,
      interviewQuestions: interviewQuestions.length,
      diagrams: diagrams.length,
      evidence: evidence.length,
      aiGlossary: aiGlossary.length,
      databases: databases.length,
    };
  },
  topics: () => load<TopicSummary>("topics"),
  topic: (id: string) => byId<Topic>("topics", id),
  patterns: () => load<PatternSummary>("patterns"),
  pattern: (id: string) => byId<Pattern>("patterns", id),
  flows: () => load<FlowSummary>("flows"),
  flow: (id: string) => byId<Flow>("flows", id),
  questions: () => load<QuestionSummary>("interview-questions"),
  question: (id: string) => byId<InterviewQuestion>("interview-questions", id),
  diagrams: () => load<DiagramSummary>("diagrams"),
  diagram: (id: string) => byId<Diagram>("diagrams", id),
  evidence: () => load<Evidence>("evidence"),
  aiGlossary: () => load<GlossaryEntry>("ai-agents-glossary"),
  databases: () => load<DatabaseSummary>("databases"),
  database: (id: string) => byId<Database>("databases", id),
};
