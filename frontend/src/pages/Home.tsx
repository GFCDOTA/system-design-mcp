import { Link } from "react-router-dom";
import { api, type TopicSummary } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { DoneMark, ProgressBar } from "../components/Progress";
import { doneCount, lastVisit, useProgress } from "../progress";
import { javaQuestionCount } from "../data/javaCore";
import { ReadinessDashboard } from "../components/ReadinessDashboard";

function groupByCategory(topics: TopicSummary[]): [string, TopicSummary[]][] {
  const map = new Map<string, TopicSummary[]>();
  for (const t of topics) {
    const list = map.get(t.category) ?? [];
    list.push(t);
    map.set(t.category, list);
  }
  return [...map.entries()];
}

interface Trail {
  to: string;
  icon: string;
  title: string;
  desc: string;
  /** prefixo do progresso (progress.ts) — sem prefixo, a trilha mostra só a contagem */
  prefix?: string;
  total?: number;
  meta?: string;
}

export function Home() {
  const stats = useAsync(() => api.stats(), []);
  const topics = useAsync(() => api.topics(), []);
  useProgress();
  const last = lastVisit();

  return (
    <div>
      {last && (
        <p className="home-continue rd-continue">
          <Link to={last.path} className="btn btn-secondary">
            Continuar: {last.label} →
          </Link>
        </p>
      )}

      <ReadinessDashboard part="header" />

      <h2>Trilhas de estudo</h2>
      <Async state={stats}>
        {(s) => {
          const trails: Trail[] = [
            {
              to: "/topics",
              icon: "📚",
              title: "Fundamentos de System Design",
              desc: "Os capítulos do workbook como tópicos navegáveis — consistência, escala, resiliência, mensageria.",
              prefix: "topic:",
              total: s.topics,
            },
            {
              to: "/patterns",
              icon: "🧩",
              title: "Padrões de arquitetura",
              desc: "Event Sourcing, CQRS, Saga, Outbox e companhia — quando usar, quando evitar, trade-offs.",
              prefix: "pattern:",
              total: s.patterns,
            },
            {
              to: "/entrevista",
              icon: "🎯",
              title: "Modo Entrevista",
              desc: "Framework de resposta, banco de perguntas, as 16 mais cobradas de DSA e de System Design.",
              prefix: "q:",
              total: s.interviewQuestions,
            },
            {
              to: "/entrevista/java",
              icon: "☕",
              title: "Java Core — teoria",
              desc: "As perguntas teóricas de Java que caem em toda faixa de experiência: JVM, collections, concorrência, streams.",
              prefix: "jq:",
              total: javaQuestionCount,
            },
            {
              to: "/databases",
              icon: "🗄️",
              title: "Bancos de Dados",
              desc: "Estudo comparativo AWS + decisor interativo: ACID, workload, latência e custo lado a lado.",
              meta: `${s.databases} bancos · comparativo + decisor`,
            },
            {
              to: "/entrevista/fundamentos",
              icon: "⏱️",
              title: "Estruturas & Big-O",
              desc: "Revisão das estruturas de dados com custo de cada operação e desafios do LeetCode.",
              meta: "9 estruturas · guia de complexidade",
            },
            {
              to: "/ai-agents",
              icon: "🤖",
              title: "IA & Agentes",
              desc: "O vocabulário de IA pra quem vem do backend — LLM, harness, agente, RAG, embeddings.",
              meta: `${s.aiGlossary} termos`,
            },
          ];
          return (
            <div className="trail-grid">
              {trails.map((t) => (
                <Link key={t.to} to={t.to} className="trail-card">
                  <span className="trail-icon" aria-hidden>{t.icon}</span>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                  {t.prefix && t.total ? (
                    <ProgressBar done={Math.min(doneCount(t.prefix), t.total)} total={t.total} />
                  ) : (
                    <span className="trail-meta">{t.meta}</span>
                  )}
                </Link>
              ))}
            </div>
          );
        }}
      </Async>

      <ReadinessDashboard part="detail" />

      <h2>Mapa de tópicos</h2>
      <Async state={topics}>
        {(list) => (
          <div className="topic-map">
            {groupByCategory(list).map(([cat, ts]) => (
              <section key={cat} className="cat-card">
                <h3>{cat}</h3>
                <ul>
                  {ts.map((t) => (
                    <li key={t.id}>
                      <DoneMark id={`topic:${t.id}`} /> <Link to={`/topics/${t.id}`}>{t.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
