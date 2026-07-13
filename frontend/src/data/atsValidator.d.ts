// Tipos do motor de validação (atsValidator.js).

export interface AtsCategory {
  key: string;
  label: string;
  score: number;
  max: number;
  notes: string[];
}

export interface RepeatedVerb {
  verb: string;
  count: number;
}

export interface AtsStats {
  words: number;
  bullets: number;
  quantifiedBullets: number;
  quantifiedPct: number;
  repeatedVerbs: RepeatedVerb[];
  weakOpeners: number;
  dateFormats: string[];
  datesConsistent: boolean;
}

export type Severity = "high" | "medium" | "low";

export interface AtsIssue {
  severity: Severity;
  title: string;
  detail: string;
  fix: string;
}

export interface AtsReport {
  overall: number;
  categories: AtsCategory[];
  stats: AtsStats;
  issues: AtsIssue[];
}

export function analyzeResume(text: string): AtsReport;
