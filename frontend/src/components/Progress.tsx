// Peças de UI do progresso de estudo (ver src/progress.ts).
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isDone, toggleDone, useProgress, rememberVisit } from "../progress";

/** Botão "marcar como concluído" — vive no topo das páginas de detalhe. */
export function MarkDoneButton({ id }: { id: string }) {
  useProgress();
  const done = isDone(id);
  return (
    <button
      type="button"
      className={`mark-done ${done ? "done" : ""}`}
      onClick={() => toggleDone(id)}
      aria-pressed={done}
    >
      {done ? "✓ Concluído" : "Marcar como concluído"}
    </button>
  );
}

/** Check discreto pra listas (cards) — só aparece quando o item está concluído. */
export function DoneMark({ id }: { id: string }) {
  useProgress();
  if (!isDone(id)) return null;
  return (
    <span className="done-mark" title="Concluído" aria-label="Concluído">
      ✓
    </span>
  );
}

/** Barra de progresso de trilha. */
export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="trail-progress">
      <div className="trail-progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="trail-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="trail-progress-label">
        {done}/{total} · {pct}%
      </span>
    </div>
  );
}

const SECTION_LABEL: Record<string, string> = {
  topics: "Tópicos",
  patterns: "Padrões",
  flows: "Fluxos",
  diagrams: "Diagramas",
  databases: "Bancos de Dados",
  compare: "Comparar",
  evidence: "Evidências",
  "ai-agents": "IA & Agentes",
  entrevista: "Modo Entrevista",
};

const INTERVIEW_LABEL: Record<string, string> = {
  "system-design": "System Design",
  java: "Java Core",
  roadmap: "Roadmap do curso",
  dsa: "DSA",
  fundamentos: "Estruturas & Big-O",
  comportamental: "Comportamental",
  relatos: "Relatos de Entrevista",
};

/** Grava a última página visitada (pro "continuar de onde parei" da home). */
export function TrackVisit() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === "/") return; // a própria home não é um "onde parei"
    const [seg1, seg2] = pathname.replace(/^\//, "").split("/");
    let label = SECTION_LABEL[seg1] ?? seg1;
    if (seg1 === "entrevista" && seg2) label += ` · ${INTERVIEW_LABEL[seg2] ?? seg2}`;
    else if (seg2) label += ` · ${seg2}`;
    rememberVisit(pathname, label);
  }, [pathname]);
  return null;
}
