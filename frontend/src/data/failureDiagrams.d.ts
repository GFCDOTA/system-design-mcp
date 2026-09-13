export declare function mermaidLabel(text: string, max?: number): string;
export declare function failureChainMermaid(
  fm: { id: string; failureChain: { step: string; failureMode?: string }[] },
  titleById?: Record<string, string>,
): string;
export declare function causalGraphMermaid(
  fms: { id: string; title: string; canCause: { id: string }[] }[],
  focusId?: string,
): string;
