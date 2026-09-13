import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { DiagramEmbed } from "../components/DiagramEmbeds";
import { SourceRefList } from "../components/SourceRefList";
import { List, RefChips } from "../components/StudyKit";
import { loadKb } from "../kbGraph";

// Comparações vêm da knowledge base (comparisons.json), com fontes — antes eram 3 blocos fixos neste arquivo.
export function Compare() {
  const state = useAsync(() => Promise.all([api.comparisons(), loadKb().catch(() => undefined)]), []);
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash || state.loading) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: "start" });
  }, [hash, state.loading]);
  return (
    <div>
      <h1>Comparar</h1>
      <p className="lede">
        Conceitos que costumam ser confundidos, lado a lado: que problema cada um resolve, quando usar e evitar, como
        falha, o trade-off e um exemplo.
      </p>
      <Async state={state}>
        {([list, kb]) => (
          <>
            <nav className="chips-row" aria-label="Comparações">
              <span className="chips-label">Ir para</span>
              {list.map((c) => (
                <a key={c.id} className="chip link" href={`#${c.id}`}>{c.title}</a>
              ))}
            </nav>
            {list.map((c) => (
              <section key={c.id} id={c.id} className="comparison">
                <h2>{c.title}</h2>
                <p className="muted">{c.summary}</p>
                <div className="callout"><strong>A diferença essencial.</strong> {c.keyDifference}</div>
                <div className="compare-grid" style={{ ["--cols" as string]: String(c.options.length) }}>
                  {c.options.map((o) => (
                    <div key={o.name} className="vs-side compare-option">
                      <h3>{o.name}</h3>
                      <p><strong>Resolve:</strong> {o.problemSolved}</p>
                      <details open>
                        <summary>Quando usar / evitar</summary>
                        <h4>Usar</h4>
                        <List items={o.whenToUse} />
                        <h4>Evitar</h4>
                        <List items={o.whenToAvoid} />
                      </details>
                      <details>
                        <summary>Como falha · trade-off · exemplo</summary>
                        <p><strong>Como falha:</strong> {o.howItFails}</p>
                        <p><strong>Trade-off:</strong> {o.tradeOff}</p>
                        <p><strong>Exemplo:</strong> {o.example}</p>
                      </details>
                      <RefChips label="" refs={o.refs ?? []} titleOf={kb?.titleOf} />
                    </div>
                  ))}
                </div>
                <div className="callout callout-decision"><strong>Como escolher.</strong> {c.howToChoose}</div>
                {c.diagrams?.length ? (
                  <details>
                    <summary>Diagramas ({c.diagrams.length})</summary>
                    {c.diagrams.map((d) => <DiagramEmbed key={d} id={d} />)}
                  </details>
                ) : null}
                <SourceRefList refs={c.sourceRefs} />
              </section>
            ))}
          </>
        )}
      </Async>
    </div>
  );
}
