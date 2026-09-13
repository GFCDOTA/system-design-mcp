export interface KbNodeRef {
  kind: string;
  id: string;
}
export interface KbEdge {
  from: KbNodeRef;
  to: KbNodeRef;
  type: string;
  label?: string;
}
export interface KbGraph {
  nodes: Map<string, { kind: string; item: any }>;
  edges: KbEdge[];
}
export interface RelatedEntry extends KbNodeRef {
  type: string;
  title: string;
  label?: string;
}
export interface RelatedResult {
  item: KbNodeRef & { title: string };
  outgoing: RelatedEntry[];
  incoming: RelatedEntry[];
}
export declare function edgesOf(kind: string, item: any): Array<{ type: string; to: KbNodeRef; label?: string }>;
export declare function buildGraph(collections: Record<string, ReadonlyArray<any>>): KbGraph;
export declare function brokenEdges(graph: KbGraph): Array<KbEdge & { problem: string }>;
export declare function related(graph: KbGraph, kind: string, id: string): RelatedResult | null;
export declare function reachableFailureModes(failureModes: ReadonlyArray<any>, fromId: string): Set<string>;
