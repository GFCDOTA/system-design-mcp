import { useParams, Link } from "react-router-dom";
import { api, type FailureMode, type Mitigation } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Markdown } from "../components/Markdown";
import { SourceRefList } from "../components/SourceRefList";
import { TradeOffTable } from "../components/TradeOffTable";
import { Breadcrumb } from "../components/Breadcrumb";
import { Mermaid } from "../components/Mermaid";
import { DiagramEmbeds } from "../components/DiagramEmbeds";
import { DifficultyBadge, Inline, List, RefChips, Reveal, Section, StudyActions } from "../components/StudyKit";
import { failureChainMermaid } from "../data/failureDiagrams";
import { loadKb, relatedOf, type KbContext } from "../kbGraph";
import { CATEGORY_LABEL } from "./FailureModes";

function MitigationList({ items, kb }: { items: Mitigation[]; kb?: KbContext }) {
  return (
    <ol className="mitigations">
      {items.map((m, i) => (
        <li key={i}>
          <strong>{m.action}.</strong> <Inline text={m.how} />
          {m.tradeOff ? <div className="muted tradeoff-note">Custo: {m.tradeOff}</div> : null}
          <RefChips
            label=""
            refs={[
              ...(m.patterns ?? []).map((id) => ({ kind: "patterns", id })),
              ...(m.topics ?? []).map((id) => ({ kind: "topics", id })),
              ...(m.failureModes ?? []).map((id) => ({ kind: "failure-modes", id })),
            ]}
            titleOf={kb?.titleOf}
          />
        </li>
      ))}
    </ol>
  );
}

function Body({ fm, kb }: { fm: FailureMode; kb?: KbContext }) {
  const t = (kind: string, id: string) => kb?.titleOf(kind, id) ?? id;
  const titles = kb ? Object.fromEntries((kb.collections["failure-modes"] ?? []).map((f) => [f.id, String(f.title)])) : {};
  const rel = kb ? relatedOf(kb, "failure-modes", fm.id) : null;
  const incoming = (kind: string, type?: string) =>
    (rel?.incoming ?? []).filter((e) => e.kind === kind && (!type || e.type === type)).map((e) => ({ kind: e.kind, id: e.id }));
  const s = fm.productionScenario;
  return (
    <article className="detail fm-detail">
      <Breadcrumb items={[{ label: "Failure modes", to: "/failure-modes" }, { label: fm.title }]} />
      <span className="badge">{CATEGORY_LABEL[fm.category] ?? fm.category}</span> <DifficultyBadge level={fm.difficulty} />
      <h1>{fm.title}</h1>
      <p className="lede">{fm.summary}</p>
      {fm.aliases?.length ? <p className="muted">Também chamado de: {fm.aliases.join(" · ")}</p> : null}
      <StudyActions id={`fm:${fm.id}`} />

      <Section title="O que acontece" open>
        <Markdown>{fm.definition}</Markdown>
        <h3>Por que acontece (e por que teste pequeno não pega)</h3>
        <Markdown>{fm.whyItHappens}</Markdown>
        {fm.confusedWith?.length ? (
          <>
            <h3>Não confundir com</h3>
            <ul>
              {fm.confusedWith.map((c) => (
                <li key={c.id}>
                  <Link to={`/failure-modes/${c.id}`}>{t("failure-modes", c.id)}</Link> — {c.difference}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Section>

      <Section title="Cenário de produção" open>
        <p className="muted scenario-note">Exemplo didático — números ilustrativos, não dado de uma empresa.</p>
        <div className="scenario-grid-3">
          <div className="prep-block"><h4>Contexto</h4><p><Inline text={s.context} /></p></div>
          <div className="prep-block"><h4>Estado normal</h4><p><Inline text={s.normalState} /></p></div>
          <div className="prep-block"><h4>Gatilho</h4><p><Inline text={s.trigger} /></p></div>
        </div>
        <h3>Linha do tempo</h3>
        <ol className="timeline">
          {s.timeline.map((e, i) => (
            <li key={i}>
              <span className="timeline-t">{e.t}</span>
              <span><Inline text={e.event} /></span>
            </li>
          ))}
        </ol>
        <div className="callout"><strong>Impacto.</strong> <Inline text={s.impact} /></div>
        {s.numbers?.length ? (
          <div className="table-wrap">
            <table className="tradeoffs numbers">
              <tbody>
                {s.numbers.map((n, i) => (
                  <tr key={i}>
                    <td className="dim">{n.label}</td>
                    <td>{n.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {fm.capacityMath ? (
          <div className="prep-block capacity">
            <h3>Exercício de capacidade</h3>
            <p>{fm.capacityMath.exercise}</p>
            <Reveal label="Mostrar o raciocínio">
              <List items={fm.capacityMath.steps} />
              <p><strong>Resposta:</strong> {fm.capacityMath.answer}</p>
              <p className="muted">Simplificação: {fm.capacityMath.caveat}</p>
            </Reveal>
          </div>
        ) : null}
      </Section>

      <Section title="Cadeia de falha">
        <div className="mindmap-wrap">
          <Mermaid code={failureChainMermaid(fm, titles)} />
        </div>
        <h3>Pode causar</h3>
        <ul>
          {fm.canCause.length ? fm.canCause.map((c) => (
            <li key={c.id}>
              <Link to={`/failure-modes/${c.id}`}>{t("failure-modes", c.id)}</Link> — {c.mechanism}
            </li>
          )) : <li className="muted">Estado terminal da cadeia: é onde as outras falhas desembocam.</li>}
        </ul>
        <RefChips label="Pode ser causado por" refs={incoming("failure-modes", "canCause")} titleOf={kb?.titleOf} />
        <p className="muted">
          <Link to={`/chains?focus=${fm.id}`}>Ver no grafo causal completo →</Link>
        </p>
      </Section>

      <Section title="Sintomas e diagnóstico">
        <div className="two-col">
          <section className="bullets"><h3>O usuário vê</h3><List items={fm.symptoms.userVisible} /></section>
          <section className="bullets"><h3>O sistema mostra</h3><List items={fm.symptoms.system} /></section>
        </div>
        <div className="callout"><strong>Primeiro sinal.</strong> {fm.diagnosis.firstSignal}</div>
        <h3>Como confirmar</h3>
        <List items={fm.diagnosis.confirm} />
        <div className="callout callout-decision"><strong>Causa vs sintoma.</strong> {fm.diagnosis.causeVsSymptom}</div>
        <h3>Causas raiz</h3>
        <List items={fm.rootCauses} />
      </Section>

      <Section title="Mitigar agora vs corrigir de vez">
        <div className="two-col">
          <section><h3>Mitigação imediata</h3><MitigationList items={fm.immediateMitigation} kb={kb} /></section>
          <section><h3>Correção definitiva</h3><MitigationList items={fm.longTermSolutions} kb={kb} /></section>
        </div>
      </Section>

      <Section title="O que NÃO fazer">
        <ul className="anti-patterns">
          {fm.antiPatterns.map((a, i) => (
            <li key={i}><strong>❌ <Inline text={a.dont} /></strong> — <Inline text={a.why} /></li>
          ))}
        </ul>
      </Section>

      <Section title="Trade-offs">
        <TradeOffTable tradeOffs={fm.tradeOffs} />
      </Section>

      <Section title="O que monitorar">
        <div className="two-col">
          <section><h3>Métricas</h3><List items={fm.observability.metrics} /></section>
          <section><h3>Alertas</h3><List items={fm.observability.alerts} /></section>
        </div>
        {fm.observability.logs?.length ? <><h3>Logs</h3><List items={fm.observability.logs} /></> : null}
        {fm.observability.traces?.length ? <><h3>Traces</h3><List items={fm.observability.traces} /></> : null}
        {fm.observability.dashboard ? <div className="callout"><strong>Dashboard.</strong> {fm.observability.dashboard}</div> : null}
      </Section>

      {fm.implementationNotes?.length ? (
        <Section title="Exemplo de implementação">
          <p className="muted">O conceito acima independe de fornecedor; abaixo, como ele aparece em tecnologias concretas.</p>
          <dl className="impl-notes">
            {fm.implementationNotes.map((n, i) => (
              <div key={i}><dt>{n.tech}</dt><dd><Inline text={n.note} /></dd></div>
            ))}
          </dl>
        </Section>
      ) : null}

      <Section title="Resposta de entrevista">
        <div className="ladder">
          <p><span className="badge">Junior</span> {fm.interview.ladder.junior}</p>
          <p><span className="badge">Senior</span> {fm.interview.ladder.senior}</p>
          <p><span className="badge level-staff">Staff</span> {fm.interview.ladder.staff}</p>
        </div>
        <div className="callout"><strong>Pergunta.</strong> {fm.interview.question}</div>
        <p className="muted">Tente responder em voz alta antes de revelar.</p>
        <Reveal label="Revelar resposta curta">
          <p>{fm.interview.shortAnswer}</p>
          <details className="sourcerefs-ext"><summary>Resposta forte (completa)</summary><Markdown>{fm.interview.strongAnswer}</Markdown></details>
        </Reveal>
        <h3>Follow-ups</h3>
        {fm.interview.followUps.map((f, i) => (
          <details key={i} className="qa-followup"><summary>{f.question}</summary><p>{f.answer}</p></details>
        ))}
        <div className="two-col">
          <section className="bullets avoid"><h3>Red flags</h3><List items={fm.interview.redFlags} /></section>
          <section className="bullets use"><h3>Strong signals</h3><List items={fm.interview.strongSignals} /></section>
        </div>
        {fm.interview.whatIf?.length ? (
          <>
            <h3>E se…? (staff)</h3>
            {fm.interview.whatIf.map((w, i) => (
              <details key={i} className="qa-followup">
                <summary>{w.question}</summary>
                <p>{w.answer}</p>
                <RefChips label="Continua em" refs={(w.leadsTo ?? []).map((id) => ({ kind: "failure-modes", id }))} titleOf={kb?.titleOf} />
              </details>
            ))}
          </>
        ) : null}
      </Section>

      <Section title="Relacionados">
        <RefChips label="Tópicos" refs={fm.relatedTopics.map((id) => ({ kind: "topics", id }))} titleOf={kb?.titleOf} />
        <RefChips label="Padrões" refs={fm.relatedPatterns.map((id) => ({ kind: "patterns", id }))} titleOf={kb?.titleOf} />
        <RefChips label="Perguntas que exercitam" refs={incoming("interview-questions")} titleOf={kb?.titleOf} />
        <RefChips label="Incident drills" refs={incoming("incident-drills", "diagnoses")} titleOf={kb?.titleOf} />
        <RefChips label="Trilhas" refs={incoming("learning-paths")} titleOf={kb?.titleOf} />
        <RefChips label="Comparações" refs={incoming("comparisons")} titleOf={kb?.titleOf} />
      </Section>

      <DiagramEmbeds ids={fm.diagrams ?? []} />
      <SourceRefList refs={fm.sourceRefs} />
    </article>
  );
}

export function FailureModeDetail() {
  const { id = "" } = useParams();
  const state = useAsync(() => Promise.all([api.failureMode(id), loadKb().catch(() => undefined)]), [id]);
  return <Async state={state}>{([fm, kb]) => <Body fm={fm} kb={kb} />}</Async>;
}
