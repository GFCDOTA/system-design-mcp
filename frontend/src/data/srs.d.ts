export interface SrsRecord {
  mastery: number;
  lastSeen: number | null;
  nextReview: number | null;
  timesCorrect: number;
  timesIncorrect: number;
}
export type SrsAction = "understood" | "later" | "study" | "correct" | "incorrect";
export declare const DAY_MS: number;
export declare const INTERVALS_DAYS: number[];
export declare const MAX_MASTERY: number;
export declare function emptyRecord(): SrsRecord;
export declare function applyAction(record: SrsRecord | undefined | null, action: SrsAction, now: number): SrsRecord;
export declare function isDue(record: SrsRecord | undefined | null, now: number): boolean;
export declare function dueIds(records: Record<string, SrsRecord>, now: number): string[];
export declare function masteryLabel(mastery: number): string;
