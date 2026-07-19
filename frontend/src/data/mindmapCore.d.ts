export interface MindmapBranch {
  title: string;
  leaves: string[];
  sub?: { title: string; leaves: string[] }[];
}
export function clean(s: string, max?: number): string;
export function firstSentence(s: string): string;
export function humanize(id: string): string;
export function keyConcepts(text: string, limit?: number): string[];
export function build(rootText: string, branches: MindmapBranch[], opts?: { branchMax?: number; leafless?: boolean }): string;
