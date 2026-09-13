import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type IncidentDrill } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Breadcrumb } from "../components/Breadcrumb";
import { SourceRefList } from "../components/SourceRefList";
import { DifficultyBadge, List, RefChips } from "../components/StudyKit";
import { recordStudy } from "../srsStore";
import { loadKb } from "../kbGraph";

const FORMAT_LABEL: Record<IncidentDrill["format"], string> = {
  incident: "Incidente",
  "metrics-detective": "Detetive de métricas",
  timeline: "Linha do tempo",
};
const TREND: Record<string, string> = { up: "↑", down: "↓", flat: "→", spike: "⚡", saturated: "■" };
const TREND_LABEL: Record<string, string> = { up: "subindo", down: "caindo", flat: "estável", spike: "pico", saturated: "saturado" };

/** /drills — lista de incident drills (títulos não entregam o diagnóstico). */
export function Drills() {
  const state = useAsync(() => api.drills(), []);
  return (
    <div>
      <h1>Incident Drills</h1>
      <p className="lede">
        Treino de produção sem LLM: você recebe sinais reais de um incidente (didático), formula a hipótese e só então
        revela diagnóstico, mitigação e correção. O título nunca entrega a resposta.
      </p>
      <Async state={state}>
        {(list) => (
          <div className="card-list">
            {list.map((d) => (
              <Link key={d.id} to={`/drills/${d.id}`} className="list-card">
                <div className="list-card-head">
                  <span className="badge">{FORMAT_LABEL[d.format]}</span>
                  <DifficultyBadge level={d.difficulty} />
                  <h3>{d.title}</h3>
                </div>
                <p>{d.question}</p>
              </Link>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}

function DrillRunner({ d, titleOf }: { d: IncidentDrill; titleOf?: (k: string, id: string) => string }) {
  const [hints, setHints] = useState(0);
  const [stage, setStage] = useState(0); // 0 cenário, 1 diagnóstico, 2 mitigação/correção
  const [picked, setPicked] = useState<number | null>(null);
  const a = d.answer;
  const reveal = (next: number) => {
    setStage(next);
    if (next === 1) recordStudy(`fm:${d.failureModes[0]}`, "later");
  };
  return (
    <article className="detail drill">
      <Breadcrumb items={[{ label: "Incident drills", to: "/drills" }, { label: d.title }]} />
      <span className="badge">{FORMAT_LABEL[d.format]}</span> <DifficultyBadge level={d.difficulty} />
      <h1>{d.title}</h1>
      <p className="muted">Cenário didático.</p>
      <section className="prep-block">
        <h2>Contexto</h2>
        <p>{d.scenario.context}</p>
        <List items={d.scenario.setup} />
      </section>
      {d.scenario.timeline?.length ? (
        <section>
          <h2>Linha do tempo</h2>
          <ol className="timeline">
            {d.scenario.timeline.map((e, i) => {
              const isCause = stage >= 1 && a.rootCauseAt === i;
              return (
                <li key={i} className={isCause ? "is-cause" : picked === i ? "is-picked" : ""}>
                  <span className="timeline-t">{e.t}</span>
                  <span>{e.event}</span>
                  {d.format === "timeline" && stage === 0 ? (
                    <button type="button" className="chip link timeline-pick" onClick={() => setPicked(i)} aria-pressed={picked === i}>
                      começou aqui?
                    </button>
                  ) : null}
                  {isCause ? <strong className="cause-tag"> ← começou aqui</strong> : null}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
      <section>
        <h2>Sinais</h2>
        <div className="signal-grid">
          {d.scenario.signals.map((s, i) => (
            <div key={i} className={`signal trend-${s.trend}`}>
              <span className="signal-metric">{s.metric}</span>
              <span className="signal-value">
                <span aria-hidden>{TREND[s.trend]}</span> {s.value}
              </span>
              <span className="sr-only">tendência: {TREND_LABEL[s.trend]}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="callout"><strong>Pergunta.</strong> {d.question}</div>

      <div className="drill-controls">
        {hints < d.hints.length && stage === 0 ? (
          <button type="button" className="btn btn-secondary" onClick={() => setHints((h) => h + 1)}>
            Mostrar dica ({hints + 1}/{d.hints.length})
          </button>
        ) : null}
        {stage === 0 ? (
          <button type="button" className="btn btn-primary" onClick={() => reveal(1)}>
            Revelar diagnóstico
          </button>
        ) : null}
      </div>
      {hints > 0 ? <ol className="hints">{d.hints.slice(0, hints).map((h, i) => <li key={i}>{h}</li>)}</ol> : null}
      {d.format === "timeline" && picked !== null && stage >= 1 ? (
        <p className={picked === a.rootCauseAt ? "feedback ok" : "feedback bad"} role="status">
          {picked === a.rootCauseAt ? "✓ Você apontou o evento certo." : "✗ Esse evento é sintoma ou amplificador, não a origem."}
        </p>
      ) : null}

      {stage >= 1 ? (
        <section className="prep-block">
          <h2>Diagnóstico</h2>
          <p><strong>{a.diagnosis}</strong></p>
          <p><strong>Causa raiz:</strong> {a.rootCause}</p>
          <p>{a.reasoning}</p>
          {a.ruledOut?.length ? (
            <>
              <h3>Por que NÃO é…</h3>
              <ul>
                {a.ruledOut.map((r) => (
                  <li key={r.failureMode}>
                    <Link to={`/failure-modes/${r.failureMode}`}>{titleOf?.("failure-modes", r.failureMode) ?? r.failureMode}</Link> — {r.why}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {stage === 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStage(2)}>
              Revelar confirmação, mitigação e correção
            </button>
          ) : null}
        </section>
      ) : null}

      {stage >= 2 ? (
        <>
          <div className="two-col">
            <section className="bullets"><h3>Como confirmar</h3><List items={a.confirmWith} /></section>
            <section className="bullets"><h3>O que monitorar</h3><List items={a.whatToMonitor} /></section>
          </div>
          <div className="two-col">
            <section className="bullets use"><h3>Mitigação imediata</h3><List items={a.immediateMitigation} /></section>
            <section className="bullets use"><h3>Correção definitiva</h3><List items={a.permanentFix} /></section>
          </div>
          <section className="bullets avoid"><h3>O que pioraria</h3><List items={a.wouldMakeItWorse} /></section>
          <RefChips label="Failure modes" refs={d.failureModes.map((id) => ({ kind: "failure-modes", id }))} titleOf={titleOf} />
          <RefChips label="Perguntas" refs={(d.relatedQuestions ?? []).map((id) => ({ kind: "interview-questions", id }))} titleOf={titleOf} />
        </>
      ) : null}
      <SourceRefList refs={d.sourceRefs} />
    </article>
  );
}

/** /drills/:id — cenário → dicas → diagnóstico → mitigação (progressive disclosure). */
export function DrillDetail() {
  const { id = "" } = useParams();
  const state = useAsync(() => Promise.all([api.drill(id), loadKb().catch(() => undefined)]), [id]);
  return <Async state={state}>{([d, kb]) => <DrillRunner key={d.id} d={d} titleOf={kb?.titleOf} />}</Async>;
}
