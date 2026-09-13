// Modos de estudo que atravessam coleções: grafo causal, busca por sintoma, trilhas, quiz/jogo da
// cadeia e fila de revisão. Tudo determinístico e local (sem backend, sem LLM).
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, hrefFor, KIND_LABEL, type FailureMode } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { Mermaid } from "../components/Mermaid";
import { ProgressBar } from "../components/Progress";
import { doneCount, isDone, toggleDone, useProgress } from "../progress";
import { DifficultyBadge, RefChips } from "../components/StudyKit";
import { SourceRefList } from "../components/SourceRefList";
import { causalGraphMermaid } from "../data/failureDiagrams";
import { buildQuiz, chainGame, isCorrectOrder, rng, type ChainGame, type QuizQuestion } from "../data/quiz";
import { masteryLabel } from "../data/srs";
import { dueNow, recordStudy, srsRecords, useSrs } from "../srsStore";
import { loadKb, searchKb } from "../kbGraph";

/* ------------------------------------------------------------------ /chains */

export function FailureChains() {
  const state = useAsync(() => api.failureModes(), []);
  const [params, setParams] = useSearchParams();
  const focus = params.get("focus") ?? "";
  return (
    <div>
      <h1>Cadeias de falha</h1>
      <p className="lede">
        Falhas raramente aparecem sozinhas. Cada seta é uma relação <em>canCause</em> da base: o mecanismo pelo qual um
        problema leva ao outro. Escolha um failure mode para destacar quem o causa e o que ele causa.
      </p>
      <Async state={state}>
        {(fms) => (
          <>
            <label className="field">
              <span>Destacar</span>
              <select value={focus} onChange={(e) => setParams(e.target.value ? { focus: e.target.value } : {})}>
                <option value="">(nenhum)</option>
                {fms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="mindmap-wrap">
              <Mermaid code={causalGraphMermaid(fms, focus || undefined)} />
            </div>
            <h2>Como cada falha se propaga</h2>
            <div className="card-list">
              {fms
                .filter((f) => f.canCause.length)
                .map((f) => (
                  <section key={f.id} className="list-card static">
                    <h3>
                      <Link to={`/failure-modes/${f.id}`}>{f.title}</Link>
                    </h3>
                    <ul>
                      {f.canCause.map((c) => {
                        const target = fms.find((x) => x.id === c.id);
                        return (
                          <li key={c.id}>
                            → <Link to={`/failure-modes/${c.id}`}>{target?.title ?? c.id}</Link>: {c.mechanism}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
            </div>
          </>
        )}
      </Async>
    </div>
  );
}

/* ------------------------------------------------------------------ /search */

const EXAMPLES = ["cliente cobrado duas vezes", "pool sem conexão", "fila crescendo", "replica dado velho", "retries pioram o serviço", "um shard recebe quase todo tráfego"];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);
  const kb = useAsync(() => loadKb(), []);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setParams(draft.trim() ? { q: draft.trim() } : {});
  };
  return (
    <div>
      <h1>Buscar</h1>
      <p className="lede">
        Busque pelo nome do conceito <strong>ou pelo sintoma</strong> que você está vendo. A busca é determinística (a
        mesma do MCP): sinônimos, pesos por campo e cobertura dos termos — sem IA.
      </p>
      <form onSubmit={submit} role="search" className="search-form">
        <input
          className="qbank-search"
          type="search"
          aria-label="Buscar na base"
          placeholder="ex.: cliente cobrado duas vezes"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>
      {!q ? (
        <div className="chips-row">
          <span className="chips-label">Experimente</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip link" onClick={() => { setDraft(ex); setParams({ q: ex }); }}>
              {ex}
            </button>
          ))}
        </div>
      ) : (
        <Async state={kb}>
          {(ctx) => {
            const hits = searchKb(ctx, q, 30);
            return (
              <>
                <p className="muted qbank-count" aria-live="polite">{hits.length} resultado(s) para “{q}”</p>
                <ol className="search-results">
                  {hits.map((h) => {
                    const href = hrefFor(h);
                    return (
                      <li key={`${h.kind}/${h.id}`} className="search-hit">
                        <span className="badge">{KIND_LABEL[h.kind] ?? h.kind}</span>{" "}
                        {href ? <Link to={href}>{h.title}</Link> : <strong>{h.title}</strong>}
                        <p className="muted">{h.summary.slice(0, 220)}{h.summary.length > 220 ? "…" : ""}</p>
                        <span className="trail-meta">termos: {h.matched.join(", ")}</span>
                      </li>
                    );
                  })}
                </ol>
              </>
            );
          }}
        </Async>
      )}
    </div>
  );
}

/** Caixa de busca compacta da barra de topo. */
export function TopSearch() {
  const [v, setV] = useState("");
  const navigate = useNavigate();
  return (
    <form
      role="search"
      className="top-search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(v.trim() ? `/search?q=${encodeURIComponent(v.trim())}` : "/search");
      }}
    >
      <input type="search" aria-label="Buscar por conceito ou sintoma" placeholder="Buscar sintoma ou conceito…" value={v} onChange={(e) => setV(e.target.value)} />
    </form>
  );
}

/* ------------------------------------------------------------------ /paths */

export function LearningPaths() {
  const state = useAsync(() => Promise.all([api.learningPaths(), loadKb()]), []);
  useProgress();
  return (
    <div>
      <h1>Trilhas de System Design</h1>
      <p className="lede">
        Sequências de estudo que atravessam a base: conceito → padrão → como falha → treino. Marque cada passo ao
        concluir.
      </p>
      <Async state={state}>
        {([paths, kb]) => (
          <>
            <div className="chips-row">
              <span className="chips-label">Ir para</span>
              {paths.map((p) => (
                <a key={p.id} className="chip link" href={`#${p.id}`}>{p.title}</a>
              ))}
            </div>
            {paths.map((p) => {
              const prefix = `path:${p.id}:`;
              return (
                <section key={p.id} id={p.id} className="rm-module">
                  <div className="rm-head">
                    <h2>{p.title}</h2>
                    <span className="badge">{p.track}</span> <DifficultyBadge level={p.level} />
                  </div>
                  <p className="muted">{p.goal}</p>
                  <ProgressBar done={Math.min(doneCount(prefix), p.steps.length)} total={p.steps.length} />
                  <ol className="trail-steps">
                    {p.steps.map((s, i) => {
                      const doneId = `${prefix}${s.ref.kind}/${s.ref.id}`;
                      const href = hrefFor(s.ref);
                      return (
                        <li key={i} className="trail-step">
                          <span className="trail-step-n">{i + 1}</span>
                          <span className="trail-step-body">
                            <span className="badge small">{KIND_LABEL[s.ref.kind]}</span>{" "}
                            {href ? <Link to={href}>{kb.titleOf(s.ref.kind, s.ref.id)}</Link> : kb.titleOf(s.ref.kind, s.ref.id)}
                            <span className="trail-step-note">{s.why}</span>
                          </span>
                          <button
                            type="button"
                            className={`qa-done ${isDone(doneId) ? "done" : ""}`}
                            aria-pressed={isDone(doneId)}
                            aria-label={isDone(doneId) ? "Passo concluído — desmarcar" : "Marcar passo como concluído"}
                            onClick={() => toggleDone(doneId)}
                          >
                            ✓
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  <SourceRefList refs={p.sourceRefs} />
                </section>
              );
            })}
          </>
        )}
      </Async>
    </div>
  );
}

/* ------------------------------------------------------------------ /quiz */

function ChoiceCard({ q, index, onAnswer }: { q: QuizQuestion; index: number; onAnswer: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  if (q.type === "open") {
    return (
      <div className="quiz-card">
        <p className="quiz-n">Pergunta {index + 1} · aberta</p>
        <p className="quiz-prompt">{q.prompt}</p>
        {!shown ? (
          <button type="button" className="btn btn-primary" onClick={() => setShown(true)}>Mostrar resposta</button>
        ) : (
          <>
            <div className="callout">{q.answer}</div>
            <div className="button-group">
              <button type="button" onClick={() => onAnswer(true)}>Acertei o essencial</button>
              <button type="button" onClick={() => onAnswer(false)}>Não acertei</button>
            </div>
          </>
        )}
      </div>
    );
  }
  const answered = picked !== null;
  return (
    <div className="quiz-card">
      <p className="quiz-n">Pergunta {index + 1}</p>
      <p className="quiz-prompt">{q.prompt}</p>
      <div className="quiz-options" role="group" aria-label="Alternativas">
        {q.options.map((o, i) => {
          const state = !answered ? "" : o.id === q.answer ? "correct" : o.id === picked ? "wrong" : "";
          return (
            <button
              key={o.id}
              type="button"
              className={`quiz-option ${state}`}
              disabled={answered}
              onClick={() => {
                setPicked(o.id);
                onAnswer(o.id === q.answer);
              }}
            >
              <span className="quiz-letter" aria-hidden>{"ABCD"[i]}</span> {o.label}
              {state === "correct" ? <span className="sr-only"> (resposta correta)</span> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className={picked === q.answer ? "feedback ok" : "feedback bad"} role="status">
          {picked === q.answer ? "✓ Correto." : "✗ Não."} {q.explanation}{" "}
          <Link to={`/failure-modes/${q.fmId}`}>Estudar →</Link>
        </p>
      ) : null}
    </div>
  );
}

function QuizRun({ fms }: { fms: FailureMode[] }) {
  const [seed, setSeed] = useState(() => Number(new Date().toISOString().slice(0, 10).replace(/-/g, "")));
  const quiz = useMemo(() => buildQuiz(fms, { seed, count: 8 }), [fms, seed]);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const answer = (i: number, ok: boolean) => {
    if (i in results) return;
    setResults((r) => ({ ...r, [i]: ok }));
    recordStudy(`fm:${quiz[i].fmId}`, ok ? "correct" : "incorrect");
  };
  const done = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;
  return (
    <>
      <div className="quiz-bar">
        <span>{done}/{quiz.length} respondidas · {correct} certas</span>
        <button type="button" className="btn btn-secondary" onClick={() => { setSeed((s) => s + 1); setResults({}); }}>Novo quiz</button>
      </div>
      {quiz.map((q, i) => (
        <ChoiceCard key={`${seed}-${i}`} q={q} index={i} onAnswer={(ok) => answer(i, ok)} />
      ))}
    </>
  );
}

function ChainGameRun({ fms }: { fms: FailureMode[] }) {
  const [fmId, setFmId] = useState(fms[0]?.id ?? "");
  const [round, setRound] = useState(1);
  const fm = fms.find((f) => f.id === fmId) ?? fms[0];
  const game: ChainGame = useMemo(() => chainGame(fm, rng(round * 31 + fm.id.length)), [fm, round]);
  const [order, setOrder] = useState<string[]>(game.steps);
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => {
    setOrder(game.steps);
    setChecked(null);
  }, [game]);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setChecked(null);
  };
  return (
    <div className="quiz-card">
      <label className="field">
        <span>Failure mode</span>
        <select value={fm.id} onChange={(e) => setFmId(e.target.value)}>
          {fms.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
        </select>
      </label>
      <p className="quiz-prompt">{game.prompt} Use ↑/↓ para reordenar.</p>
      <ol className="chain-order">
        {order.map((s, i) => (
          <li key={s} className={checked === null ? "" : s === game.answer[i] ? "correct" : "wrong"}>
            <span>{s}</span>
            <span className="chain-moves">
              <button type="button" aria-label={`Subir: ${s}`} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" aria-label={`Descer: ${s}`} onClick={() => move(i, 1)} disabled={i === order.length - 1}>↓</button>
            </span>
          </li>
        ))}
      </ol>
      <div className="button-group">
        <button type="button" onClick={() => setChecked(isCorrectOrder(game, order))}>Verificar</button>
        <button type="button" onClick={() => setRound((r) => r + 1)}>Embaralhar de novo</button>
      </div>
      {checked !== null ? (
        <p className={checked ? "feedback ok" : "feedback bad"} role="status">
          {checked ? "✓ Cadeia correta." : "✗ Ainda não — os itens em vermelho estão fora de lugar."}{" "}
          <Link to={`/failure-modes/${fm.id}`}>Ver a cadeia →</Link>
        </p>
      ) : null}
    </div>
  );
}

export function QuizPage() {
  const state = useAsync(() => api.failureModes(), []);
  const [tab, setTab] = useState<"quiz" | "chain">("quiz");
  return (
    <div>
      <h1>Quiz & jogo da cadeia</h1>
      <p className="lede">
        Perguntas geradas de forma determinística a partir da própria base: identificar o problema, escolher o que
        pioraria, apontar o primeiro sinal e responder em aberto. Cada resposta alimenta a sua fila de revisão.
      </p>
      <div className="button-group prep-filter" role="tablist">
        <button role="tab" aria-selected={tab === "quiz"} className={tab === "quiz" ? "active" : ""} onClick={() => setTab("quiz")}>Quiz</button>
        <button role="tab" aria-selected={tab === "chain"} className={tab === "chain" ? "active" : ""} onClick={() => setTab("chain")}>Ordenar a cadeia de falha</button>
      </div>
      <Async state={state}>{(fms) => (tab === "quiz" ? <QuizRun fms={fms} /> : <ChainGameRun fms={fms} />)}</Async>
    </div>
  );
}

/* ------------------------------------------------------------------ /review */

export function ReviewPage() {
  const state = useAsync(() => loadKb(), []);
  useSrs();
  return (
    <div>
      <h1>Revisão</h1>
      <p className="lede">
        Revisão espaçada simples: “Entendi” afasta a próxima revisão (1, 3, 7, 21 dias), “Preciso estudar” traz o item
        de volta hoje. Tudo fica só neste navegador.
      </p>
      <Async state={state}>
        {(kb) => {
          const records = srsRecords();
          const due = dueNow();
          const tracked = Object.entries(records).sort(([, a], [, b]) => (a.nextReview ?? 0) - (b.nextReview ?? 0));
          const ref = (key: string) => {
            const [prefix, id] = key.split(":");
            return prefix === "fm" ? { kind: "failure-modes", id } : { kind: "topics", id };
          };
          return (
            <>
              <h2>Para revisar agora ({due.length})</h2>
              {due.length ? (
                <RefChips label="" refs={due.map(ref)} titleOf={kb.titleOf} />
              ) : (
                <p className="muted">Nada devido. Estude um <Link to="/failure-modes">failure mode</Link> ou faça o <Link to="/quiz">quiz</Link>.</p>
              )}
              <h2>Tudo que você já estudou ({tracked.length})</h2>
              <div className="table-wrap">
                <table className="tradeoffs">
                  <thead>
                    <tr><th>Item</th><th>Nível</th><th>Próxima revisão</th><th>Acertos / erros</th></tr>
                  </thead>
                  <tbody>
                    {tracked.map(([key, r]) => {
                      const rr = ref(key);
                      const href = hrefFor(rr);
                      return (
                        <tr key={key}>
                          <td>{href ? <Link to={href}>{kb.titleOf(rr.kind, rr.id)}</Link> : key}</td>
                          <td>{masteryLabel(r.mastery)}</td>
                          <td>{r.nextReview ? new Date(r.nextReview).toLocaleDateString("pt-BR") : "—"}</td>
                          <td>{r.timesCorrect} / {r.timesIncorrect}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          );
        }}
      </Async>
    </div>
  );
}

