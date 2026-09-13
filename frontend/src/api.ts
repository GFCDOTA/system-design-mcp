import { COLLECTIONS } from "../../shared/kb-kinds.mjs";

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
  keywords?: string[];
  productionExample?: string;
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
  keywords?: string[];
  productionExample?: string;
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
  keywords?: string[];
  productionExample?: string;
  followUps?: QA[];
  redFlags?: string[];
  strongSignals?: string[];
  expectedSignals?: string[];
  whatToMonitor?: string[];
  failureModes?: string[];
  relatedQuestions?: string[];
  failureInjections?: { injection: string; expectedReasoning: string }[];
  acceptableSolutions?: string[];
  decisionCriteria?: string[];
  rubricDimensions?: string[];
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

export interface QA {
  question: string;
  answer: string;
}

export interface KbRef {
  kind: string;
  id: string;
}

export interface TimelineEvent {
  t: string;
  event: string;
}

export interface Mitigation {
  action: string;
  how: string;
  tradeOff?: string;
  patterns?: string[];
  topics?: string[];
  failureModes?: string[];
}

export interface FailureModeSummary {
  id: string;
  title: string;
  category: string;
  difficulty: "senior" | "staff";
  summary: string;
}

export interface FailureMode extends FailureModeSummary {
  aliases?: string[];
  keywords: string[];
  definition: string;
  whyItHappens: string;
  confusedWith?: { id: string; difference: string }[];
  productionScenario: {
    dataKind: "didactic";
    context: string;
    normalState: string;
    trigger: string;
    timeline: TimelineEvent[];
    impact: string;
    numbers?: { label: string; value: string }[];
  };
  capacityMath?: { exercise: string; steps: string[]; answer: string; caveat: string };
  failureChain: { step: string; failureMode?: string }[];
  canCause: { id: string; mechanism: string }[];
  symptoms: { userVisible: string[]; system: string[] };
  rootCauses: string[];
  diagnosis: { firstSignal: string; confirm: string[]; causeVsSymptom: string };
  immediateMitigation: Mitigation[];
  longTermSolutions: Mitigation[];
  antiPatterns: { dont: string; why: string }[];
  tradeOffs: TradeOff[];
  observability: { metrics: string[]; logs?: string[]; traces?: string[]; alerts: string[]; dashboard?: string };
  implementationNotes?: { tech: string; note: string }[];
  interview: {
    question: string;
    shortAnswer: string;
    strongAnswer: string;
    followUps: QA[];
    redFlags: string[];
    strongSignals: string[];
    ladder: { junior: string; senior: string; staff: string };
    whatIf?: { question: string; answer: string; leadsTo?: string[] }[];
  };
  relatedTopics: string[];
  relatedPatterns: string[];
  diagrams?: string[];
  sourceRefs: SourceRef[];
}

export type SignalTrend = "up" | "down" | "flat" | "spike" | "saturated";

export interface IncidentDrill {
  id: string;
  title: string;
  format: "incident" | "metrics-detective" | "timeline";
  difficulty: "senior" | "staff";
  keywords?: string[];
  scenario: {
    dataKind: "didactic";
    context: string;
    setup: string[];
    timeline?: TimelineEvent[];
    signals: { metric: string; value: string; trend: SignalTrend }[];
  };
  question: string;
  hints: string[];
  answer: {
    diagnosis: string;
    rootCause: string;
    rootCauseAt?: number;
    reasoning: string;
    ruledOut?: { failureMode: string; why: string }[];
    confirmWith: string[];
    immediateMitigation: string[];
    permanentFix: string[];
    wouldMakeItWorse: string[];
    whatToMonitor: string[];
  };
  failureModes: string[];
  relatedQuestions?: string[];
  sourceRefs: SourceRef[];
}

export interface Comparison {
  id: string;
  title: string;
  keywords?: string[];
  summary: string;
  keyDifference: string;
  options: {
    name: string;
    refs?: KbRef[];
    problemSolved: string;
    whenToUse: string[];
    whenToAvoid: string[];
    howItFails: string;
    tradeOff: string;
    example: string;
  }[];
  howToChoose: string;
  diagrams?: string[];
  sourceRefs: SourceRef[];
}

export interface LearningPath {
  id: string;
  title: string;
  track: string;
  level: "senior" | "staff";
  goal: string;
  steps: { ref: KbRef; why: string }[];
  sourceRefs: SourceRef[];
}

export interface Rubric {
  id: string;
  title: string;
  level: string;
  usage: string;
  scale: { score: number; label: string; meaning: string }[];
  dimensions: { id: string; name: string; whatGoodLooksLike: string; evidenceExamples: string[]; commonGaps: string[] }[];
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
  failureModes: number;
  incidentDrills: number;
  comparisons: number;
  learningPaths: number;
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
    const [topics, patterns, flows, interviewQuestions, diagrams, evidence, aiGlossary, databases, failureModes, incidentDrills, comparisons, learningPaths] = await Promise.all([
      load("topics"),
      load("patterns"),
      load("flows"),
      load("interview-questions"),
      load("diagrams"),
      load("evidence"),
      load("ai-agents-glossary"),
      load("databases"),
      load("failure-modes"),
      load("incident-drills"),
      load("comparisons"),
      load("learning-paths"),
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
      failureModes: failureModes.length,
      incidentDrills: incidentDrills.length,
      comparisons: comparisons.length,
      learningPaths: learningPaths.length,
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
  failureModes: () => load<FailureMode>("failure-modes"),
  failureMode: (id: string) => byId<FailureMode>("failure-modes", id),
  drills: () => load<IncidentDrill>("incident-drills"),
  drill: (id: string) => byId<IncidentDrill>("incident-drills", id),
  comparisons: () => load<Comparison>("comparisons"),
  learningPaths: () => load<LearningPath>("learning-paths"),
  rubrics: () => load<Rubric>("rubrics"),
  /** Todas as coleções da KB (busca e grafo), carregadas em paralelo e cacheadas. */
  all: async (): Promise<Record<string, Array<Record<string, any>>>> => {
    const entries = await Promise.all(
      COLLECTIONS.map(async (c) => [c.kind, await load<Record<string, any>>(c.file.replace(/\.json$/, ""))] as const),
    );
    return Object.fromEntries(entries);
  },
};

/** Rota do app para um item da KB (ou null se a coleção não tem página). */
export function hrefFor(ref: { kind: string; id: string }): string | null {
  switch (ref.kind) {
    case "topics":
      return "/topics/" + ref.id;
    case "patterns":
      return "/patterns/" + ref.id;
    case "flows":
      return "/flows/" + ref.id;
    case "diagrams":
      return "/diagrams/" + ref.id;
    case "databases":
      return "/databases/" + ref.id;
    case "failure-modes":
      return "/failure-modes/" + ref.id;
    case "incident-drills":
      return "/drills/" + ref.id;
    case "interview-questions":
      return "/entrevista/system-design?open=" + ref.id;
    case "comparisons":
      return "/compare#" + ref.id;
    case "learning-paths":
      return "/paths#" + ref.id;
    case "evidence":
      return "/evidence";
    case "ai-glossary":
      return "/ai-agents";
    default:
      return null;
  }
}

export const KIND_LABEL: Record<string, string> = {
  topics: "Tópico",
  patterns: "Padrão",
  flows: "Fluxo",
  "interview-questions": "Pergunta",
  diagrams: "Diagrama",
  evidence: "Evidência",
  "ai-glossary": "IA & Agentes",
  databases: "Banco",
  "failure-modes": "Failure mode",
  "incident-drills": "Incident drill",
  comparisons: "Comparação",
  "learning-paths": "Trilha",
  rubrics: "Rubrica",
};

