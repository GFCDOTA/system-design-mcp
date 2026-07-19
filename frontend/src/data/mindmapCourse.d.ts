export interface QbankQuestion {
  id: string;
  q: string;
  blocks: string[];
}
export interface ExtractedDocPage {
  n: number;
  blocks?: string[];
  image?: string;
}
export interface ExtractedDocLike {
  file: string;
  stats: { pages: number; textPages: number; imagePages: number };
  pages: ExtractedDocPage[];
}
export function isQuestionBlock(t: string): boolean;
export function buildQuestionMindmap(q: QbankQuestion): string;
export function buildDocMindmap(doc: ExtractedDocLike, title: string): string;
