import { useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Markdown } from "../components/Markdown";
import { SourceRefList } from "../components/SourceRefList";
import { TradeOffTable } from "../components/TradeOffTable";
import { LinkChips } from "../components/Chips";
import { DiagramEmbeds } from "../components/DiagramEmbeds";
import { DbRecommendation } from "../components/DbRecommendation";
import { MarkDoneButton } from "../components/Progress";
import { Breadcrumb } from "../components/Breadcrumb";
import { Mermaid } from "../components/Mermaid";
import { buildTopicMindmap } from "../data/mindmap";

export function TopicDetail() {
  const { id = "" } = useParams();
  const state = useAsync(() => api.topic(id), [id]);
  const [map, setMap] = useState(false);
  return (
    <Async state={state}>
      {(t) => (
        <article className="detail">
          <Breadcrumb items={[{ label: "Tópicos", to: "/topics" }, { label: t.title }]} />
          <span className="badge">{t.category}</span>
          <h1>{t.title}</h1>
          <p className="lede">{t.summary}</p>
          <div className="detail-actions">
            <MarkDoneButton id={`topic:${t.id}`} />
            <button type="button" className="view-toggle" onClick={() => setMap((v) => !v)} aria-pressed={map}>
              {map ? "📄 Ver texto" : "🧠 Ver como mapa"}
            </button>
          </div>

          {map ? (
            <div className="mindmap-wrap">
              <Mermaid code={buildTopicMindmap(t)} />
            </div>
          ) : (
            <>
              <Markdown>{t.detailedExplanation}</Markdown>

              {t.example && (
                <section>
                  <h2>Exemplo</h2>
                  <Markdown>{t.example}</Markdown>
                </section>
              )}

              {t.interviewAngle && (
                <section className="callout">
                  <h2>Em entrevista</h2>
                  <Markdown>{t.interviewAngle}</Markdown>
                </section>
              )}

              {t.tradeOffs.length > 0 && (
                <section>
                  <h2>Trade-offs</h2>
                  <TradeOffTable tradeOffs={t.tradeOffs} />
                </section>
              )}

              <DiagramEmbeds ids={t.diagrams} />

              <LinkChips label="Tópicos relacionados" base="/topics" ids={t.relatedTopics} />
              <LinkChips label="Padrões relacionados" base="/patterns" ids={t.relatedPatterns} />
              <DbRecommendation rec={t.databaseRecommendation} />
              <SourceRefList refs={t.sourceRefs} />
            </>
          )}
        </article>
      )}
    </Async>
  );
}
