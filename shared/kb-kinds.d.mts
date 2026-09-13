export interface CollectionInfo {
  kind: string;
  file: string;
  description: string;
  route?: string;
}
export declare const COLLECTIONS: ReadonlyArray<CollectionInfo>;
export declare const KINDS: ReadonlyArray<string>;
export declare function collectionOf(kind: string): CollectionInfo | undefined;
export declare function titleOf(it: unknown): string;
export declare function summaryOf(it: unknown): string;
