export interface AreaInput {
  id: string;
  label: string;
  icon: string;
  done: number;
  total: number;
}

export type AreaStatus = "zero" | "fraco" | "ok" | "forte";

export interface AreaResult extends AreaInput {
  pct: number;
  status: AreaStatus;
}

export interface Level {
  min: number;
  key: string;
  label: string;
  blurb: string;
}

export interface Trophy {
  id: string;
  icon: string;
  label: string;
  desc: string;
  earned: boolean;
}

export interface Readiness {
  overall: number;
  level: Level;
  areas: AreaResult[];
  weakest?: AreaResult;
  strongest?: AreaResult;
  nextTrailId: string;
  nextTrailWhy: string;
  trophies: Trophy[];
  earnedCount: number;
}

export interface CompanyFocus {
  id: string;
  label: string;
  tip: string;
  areas: string[];
}

export function buildReadiness(areas: AreaInput[]): Readiness;
export const companyFocus: CompanyFocus[];
