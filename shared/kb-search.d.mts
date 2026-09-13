export interface KbSearchIndex {
  readonly docs: ReadonlyArray<unknown>;
  readonly kindOrder: ReadonlyArray<string>;
}
export interface KbSearchHit<T = Record<string, unknown>> {
  kind: string;
  id: string;
  score: number;
  /** termos da consulta (normalizados) que o item atendeu */
  matched: string[];
  item: T;
}
export declare const SYNONYM_GROUPS: ReadonlyArray<ReadonlyArray<string>>;
export declare const FIELD_WEIGHTS: Readonly<Record<"title" | "aliases" | "keywords" | "summary" | "body", number>>;
export declare function normalize(text: string): string;
export declare function tokenize(text: string): string[];
export declare function createIndex(collections: Record<string, ReadonlyArray<any>>): KbSearchIndex;
export declare function expandQuery(index: KbSearchIndex, query: string): Array<{ term: string; alts: Map<string, number> }>;
export declare function searchIndex<T = Record<string, unknown>>(
  index: KbSearchIndex,
  query: string,
  opts?: { kinds?: string[]; limit?: number },
): KbSearchHit<T>[];
