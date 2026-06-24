import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Markdown } from "../components/Markdown";
import { SourceRefList } from "../components/SourceRefList";
import { LinkChips } from "../components/Chips";
import { TradeOffTable } from "../components/TradeOffTable";

function Bullets({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h2>{label}</h2>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </section>
  );
}

export function LabDetail() {
  const { id = "" } = useParams();
  const state = useAsync(() => api.lab(id), [id]);
  const [showRef, setShowRef] = useState(false);
  return (
    <Async state={state}>
      {(l) => (
        <article className="detail">
          <h1>{l.title}</h1>
          <div>
            {l.difficulty ? <span className="badge small">{l.difficulty}</span> : null}
            {l.companies ? <span className="chip">{l.companies}</span> : null}
          </div>
          <p className="lede">{l.summary}</p>
          <div className="callout">
            <strong>Prompt.</strong> {l.prompt}
          </div>
          <Bullets label="Requisitos funcionais" items={l.functionalRequirements} />
          <Bullets label="Requisitos não-funcionais" items={l.nonFunctionalRequirements} />
          <Bullets label="Perguntas de clarificação (faça ANTES de desenhar)" items={l.clarifyingQuestions} />
          <Bullets label="Estimativas (scale-math)" items={l.estimations} />
          <Bullets label="Esboço de API" items={l.apiSketch} />
          <Bullets label="Modelo de dados" items={l.dataNotes} />
          <Bullets label="Deep-dives (onde o entrevistador aperta)" items={l.deepDives} />
          {l.tradeOffs.length > 0 ? (
            <section>
              <h2>Trade-offs</h2>
              <TradeOffTable tradeOffs={l.tradeOffs} />
            </section>
          ) : null}
          <Bullets label="Rubrica de autoavaliação" items={l.rubric} />
          <Bullets label="Follow-ups comuns" items={l.commonFollowUps} />
          {l.referenceApproach ? (
            <section>
              <h2>Abordagem de referência</h2>
              <button className="qa-head" onClick={() => setShowRef((v) => !v)}>
                <span className="qa-toggle">{showRef ? "−" : "+"}</span>
                <span>&nbsp;{showRef ? "Esconder" : "Mostrar"} (tente sozinho primeiro)</span>
              </button>
              {showRef ? <Markdown>{l.referenceApproach}</Markdown> : null}
            </section>
          ) : null}
          <LinkChips label="Padrões relacionados" base="/patterns" ids={l.relatedPatterns} />
          <SourceRefList refs={l.sourceRefs} />
        </article>
      )}
    </Async>
  );
}
