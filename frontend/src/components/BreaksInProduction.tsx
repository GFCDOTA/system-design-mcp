import { api } from "../api";
import { useAsync } from "../hooks";
import { RefChips } from "./StudyKit";

/** "Como isso quebra em produção": failure modes que apontam para este tópico/padrão (relação derivada). */
export function BreaksInProduction({ field, id }: { field: "relatedTopics" | "relatedPatterns"; id: string }) {
  const state = useAsync(() => api.failureModes(), []);
  const fms = (state.data ?? []).filter((f) => f[field].includes(id));
  if (!fms.length) return null;
  const titles = Object.fromEntries(fms.map((f) => [f.id, f.title]));
  return (
    <section>
      <h2>Como isso quebra em produção</h2>
      <RefChips label="Failure modes" refs={fms.map((f) => ({ kind: "failure-modes", id: f.id }))} titleOf={(_, fid) => titles[fid] ?? fid} />
    </section>
  );
}
