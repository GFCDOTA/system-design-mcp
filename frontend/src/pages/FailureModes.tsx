import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { DifficultyBadge } from "../components/StudyKit";
import { masteryLabel } from "../data/srs";
import { srsRecord, useSrs } from "../srsStore";

export const CATEGORY_LABEL: Record<string, string> = {
  Caching: "Cache",
  Database: "Banco",
  Messaging: "Mensageria",
  Resilience: "Resiliência",
  Scalability: "Escala",
  Consistency: "Consistência",
  Runtime: "Runtime",
};

/** /failure-modes — como sistemas quebram em produção. Cards enxutos; o detalhe abre por seções. */
export function FailureModes() {
  const state = useAsync(() => api.failureModes(), []);
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  useSrs();
  return (
    <div>
      <h1>Failure Modes at Scale</h1>
      <p className="lede">
        Problemas que não aparecem em teste pequeno e surgem quando o sistema escala. Cada um segue a mesma narrativa:
        sistema saudável → gatilho → mecanismo → sintomas → diagnóstico → mitigar agora → corrigir de vez → trade-off →
        o que monitorar → como explicar na entrevista.
      </p>
      <p className="muted">
        Os números dos cenários são <strong>exemplos didáticos</strong>; dados reais aparecem só quando a fonte citada os
        publica. Veja também as <Link to="/chains">cadeias de falha</Link> e os <Link to="/drills">incident drills</Link>.
      </p>
      <Async state={state}>
        {(list) => {
          const categories = Array.from(new Set(list.map((f) => f.category)));
          const filtered = list.filter((f) => (category === "all" || f.category === category) && (level === "all" || f.difficulty === level));
          return (
            <>
              <div className="button-group prep-filter" role="group" aria-label="Filtrar por categoria">
                <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")} aria-pressed={category === "all"}>
                  Todas ({list.length})
                </button>
                {categories.map((c) => (
                  <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)} aria-pressed={category === c}>
                    {CATEGORY_LABEL[c] ?? c}
                  </button>
                ))}
              </div>
              <div className="button-group prep-filter" role="group" aria-label="Filtrar por nível">
                {["all", "senior", "staff"].map((l) => (
                  <button key={l} className={level === l ? "active" : ""} onClick={() => setLevel(l)} aria-pressed={level === l}>
                    {l === "all" ? "Qualquer nível" : l === "staff" ? "Staff" : "Senior"}
                  </button>
                ))}
              </div>
              <div className="card-list">
                {filtered.map((f) => {
                  const rec = srsRecord(`fm:${f.id}`);
                  return (
                    <Link key={f.id} to={`/failure-modes/${f.id}`} className="list-card">
                      <div className="list-card-head">
                        <span className="badge">{CATEGORY_LABEL[f.category] ?? f.category}</span>
                        <DifficultyBadge level={f.difficulty} />
                        <h3>{f.title}</h3>
                      </div>
                      <p>{f.summary}</p>
                      {rec ? <span className="trail-meta">Revisão: {masteryLabel(rec.mastery)}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </>
          );
        }}
      </Async>
    </div>
  );
}
