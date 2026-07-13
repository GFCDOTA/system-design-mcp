import { useState } from "react";
import { Link } from "react-router-dom";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { CompanyBadges } from "../components/CompanyBadges";
import { companyDisclaimer } from "../data/companySignals";
import { isDone, toggleDone, doneCount, useProgress } from "../progress";
import { ProgressBar } from "../components/Progress";

interface QBQuestion {
  id: string;
  q: string;
  blocks: string[];
}
interface QBLevel {
  level: string;
  title: string;
  stem: string;
  questions: QBQuestion[];
}
interface QBank {
  count: number;
  levels: QBLevel[];
}

/** Detecta código pra render em mono (mesma heurística do leitor). */
function isCode(text: string): boolean {
  return /[{};]/.test(text) && (/\b(public|private|class|void|return|new|import)\b/.test(text) || text.includes("\n"));
}

function AnswerBlock({ text }: { text: string }) {
  if (isCode(text)) return <pre className="reader-code">{text}</pre>;
  return <p className="reader-p">{text}</p>;
}

function QCard({ q }: { q: QBQuestion }) {
  const [open, setOpen] = useState(false);
  useProgress();
  const studied = isDone(`cq:${q.id}`);
  return (
    <div className={`qa ${open ? "open" : ""} ${studied ? "studied" : ""}`}>
      <button className="qa-head" onClick={() => setOpen((v) => !v)}>
        <span
          className={`qa-done ${studied ? "done" : ""}`}
          role="checkbox"
          aria-checked={studied}
          aria-label={studied ? "Estudada — desmarcar" : "Marcar como estudada"}
          onClick={(e) => {
            e.stopPropagation();
            toggleDone(`cq:${q.id}`);
          }}
        >
          ✓
        </span>
        <span className="qa-q">{q.q}</span>
        <CompanyBadges text={q.q + " " + q.blocks.join(" ")} />
        <span className="qa-toggle">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="qa-body">
          {q.blocks.map((b, i) => (
            <AnswerBlock key={i} text={b} />
          ))}
        </div>
      )}
    </div>
  );
}

/** /estudos/perguntas — banco de perguntas de Java extraído dos PDFs do curso. */
export function JavaQuestions() {
  useProgress();
  const state = useAsync<QBank>(
    () =>
      fetch("/course/qbank/java.json").then((r) => {
        if (!r.ok) throw new Error(`Banco não encontrado (${r.status}). Rode: python scripts/extract_qbank.py`);
        return r.json();
      }),
    [],
  );
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");

  return (
    <div>
      <div className="reader-bar">
        <Link to="/estudos" className="chip">
          ← Estudos
        </Link>
        <Link to="/estudos/java" className="chip">
          Materiais de Java
        </Link>
      </div>
      <h1>Perguntas de Java — do curso</h1>
      <p className="lede">
        Todas as perguntas de Core Java que o curso traz nos PDFs, extraídas e reunidas aqui — leia direto na
        página, sem abrir PDF. Abra cada uma, responda em voz alta <em>antes</em> de ver a resposta, e marque a ✓.
        Depois, treine no <Link to="/entrevista/java">Modo Entrevista → Java Core</Link>.
      </p>

      <Async state={state}>
        {(bank) => {
          const allQ = bank.levels.flatMap((l) => l.questions.map((q) => ({ ...q, level: l.level })));
          const studied = Math.min(doneCount("cq:"), allQ.length);
          const q = query.trim().toLowerCase();
          const filtered = allQ.filter(
            (x) =>
              (level === "all" || x.level === level) &&
              (q === "" || x.q.toLowerCase().includes(q) || x.blocks.join(" ").toLowerCase().includes(q)),
          );
          return (
            <>
              <div className="prep-block">
                <h3>Seu progresso ({allQ.length} perguntas do curso)</h3>
                <ProgressBar done={studied} total={allQ.length} />
              </div>

              <p className="muted cbadge-note">ℹ {companyDisclaimer}</p>

              <input
                className="qbank-search"
                type="search"
                placeholder="Buscar por palavra (ex.: HashMap, thread, garbage…)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="button-group prep-filter">
                <button className={level === "all" ? "active" : ""} onClick={() => setLevel("all")}>
                  Todos ({allQ.length})
                </button>
                {bank.levels.map((l) => (
                  <button key={l.level} className={level === l.level ? "active" : ""} onClick={() => setLevel(l.level)}>
                    Nível {l.level} ({l.questions.length})
                  </button>
                ))}
              </div>

              <p className="muted qbank-count">{filtered.length} pergunta(s)</p>
              <div className="qa-list">
                {filtered.map((x) => (
                  <QCard key={x.id} q={x} />
                ))}
              </div>
            </>
          );
        }}
      </Async>
    </div>
  );
}
