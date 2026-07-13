import { useState } from "react";
import { javaCategories, javaQuestionCount, type JavaQuestion } from "../data/javaCore";
import { ProgressBar } from "../components/Progress";
import { isDone, toggleDone, doneCount, useProgress } from "../progress";

/** Renderiza **negrito** e `code` inline (mesmo markdown leve do prep). */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== "");
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function JavaCard({ q }: { q: JavaQuestion }) {
  const [open, setOpen] = useState(false);
  useProgress();
  const studied = isDone(`jq:${q.id}`);
  return (
    <div className={`qa ${open ? "open" : ""} ${studied ? "studied" : ""}`}>
      <button className="qa-head" onClick={() => setOpen((v) => !v)}>
        <span
          className={`qa-done ${studied ? "done" : ""}`}
          role="checkbox"
          aria-checked={studied}
          aria-label={studied ? "Estudada — clique para desmarcar" : "Marcar como estudada"}
          title={studied ? "Estudada" : "Marcar como estudada"}
          onClick={(e) => {
            e.stopPropagation();
            toggleDone(`jq:${q.id}`);
          }}
        >
          ✓
        </span>
        <span className="qa-q">{q.q}</span>
        <span className="qa-toggle">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="qa-body">
          <p className="java-answer">
            <Inline text={q.a} />
          </p>
          {q.pitfall && (
            <div className="callout">
              <strong>Pegadinha.</strong> <Inline text={q.pitfall} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** /entrevista/java — banco de perguntas teóricas de Java Core. */
export function JavaCore() {
  useProgress();
  return (
    <div>
      <h1>Java Core — teoria</h1>
      <p className="lede">
        O banco de perguntas TEÓRICAS de Java que sustenta os passos de Core Java do roadmap — fundamentos, JVM,
        collections, concorrência, exceções, generics, streams e o que mudou do 8 ao 21. Abra, responda em voz
        alta ANTES de ler, e marque a ✓ quando a resposta sair sem tropeço.
      </p>
      <div className="prep-block">
        <h3>Seu progresso</h3>
        <ProgressBar done={Math.min(doneCount("jq:"), javaQuestionCount)} total={javaQuestionCount} />
      </div>
      {javaCategories.map((cat) => (
        <section key={cat.id} className="java-cat">
          <h2>{cat.title}</h2>
          <p className="muted">{cat.intro}</p>
          <div className="qa-list">
            {cat.questions.map((q) => (
              <JavaCard key={q.id} q={q} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
