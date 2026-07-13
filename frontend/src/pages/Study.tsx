import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks";
import {
  subjects,
  subjectById,
  kindLabel,
  totalMaterials,
  type StudySubject,
  type StudyMaterial,
} from "../data/studySyllabus";
import { ProgressBar } from "../components/Progress";
import { isDone, doneCount, useProgress } from "../progress";
import { NotFound } from "./RouteError";

type IndexMap = Record<string, { pages: number; textPages: number; imagePages: number }>;

/** Índice de páginas extraídas (nome do PDF → stats). Null se a extração não rodou. */
function usePageIndex() {
  return useAsync<IndexMap | null>(
    () =>
      fetch("/course/extracted/_index.json")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    [],
  );
}

function subjectRead(s: StudySubject): number {
  return s.materials.filter((m) => isDone(`read:${m.stem}`)).length;
}

function MaterialRow({ m, pages }: { m: StudyMaterial; pages?: number }) {
  const read = isDone(`read:${m.stem}`);
  return (
    <Link to={`/estudos/ler/${m.stem}`} className={`study-mat ${read ? "read" : ""}`}>
      <span className={`study-mat-check ${read ? "read" : ""}`} aria-hidden>
        {read ? "✓" : ""}
      </span>
      <span className="study-mat-label">{m.label}</span>
      <span className={`study-kind k-${m.kind}`}>{kindLabel[m.kind]}</span>
      {pages ? <span className="study-mat-pages">{pages} pág.</span> : null}
      <span className="study-mat-go">Ler →</span>
    </Link>
  );
}

/** /estudos — visão geral do Modo Estudos: assuntos como currículo. */
export function StudyOverview() {
  useProgress();
  const idx = usePageIndex();
  const totalRead = Math.min(doneCount("read:"), totalMaterials);

  return (
    <div>
      <section className="home-hero">
        <span className="home-kicker">Modo Estudos</span>
        <h1>Aprenda o material a fundo, no seu ritmo</h1>
        <p className="lede">
          Todo o conteúdo do curso <strong>Complete Interview Preparation</strong> reunido e organizado por
          assunto — Java, Spring, Spring Boot, dados, microservices e mais. Leia tudo aqui dentro, do zero ao
          avançado. Quando a entrevista chegar, o <Link to="/entrevista">Modo Entrevista</Link> é o treino de
          véspera.
        </p>
        <div className="trail-progress" style={{ maxWidth: 420 }}>
          <div className="trail-progress-track">
            <div
              className="trail-progress-fill"
              style={{ width: `${totalMaterials ? Math.round((totalRead / totalMaterials) * 100) : 0}%` }}
            />
          </div>
          <span className="trail-progress-label">
            {totalRead}/{totalMaterials} materiais
          </span>
        </div>
      </section>

      <div className="study-feature-row">
        <Link to="/estudos/trilhas" className="study-feature">
          <span className="trail-icon" aria-hidden>🧭</span>
          <div>
            <h3>Trilhas de estudo</h3>
            <p>Caminhos prontos, na ordem certa pra chegar treinado na entrevista.</p>
          </div>
        </Link>
        <Link to="/estudos/perguntas" className="study-feature">
          <span className="trail-icon" aria-hidden>❓</span>
          <div>
            <h3>Perguntas de Java (do curso)</h3>
            <p>408 perguntas dos PDFs, na página — com selo das empresas que mais cobram cada tema.</p>
          </div>
        </Link>
      </div>

      <h2>Assuntos</h2>
      <div className="trail-grid">
        {subjects.map((s) => {
          const read = subjectRead(s);
          return (
            <Link key={s.id} to={`/estudos/${s.id}`} className="trail-card">
              <span className="trail-icon" aria-hidden>
                {s.icon}
              </span>
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <ProgressBar done={read} total={s.materials.length} />
            </Link>
          );
        })}
      </div>

      <p className="muted study-total">
        {(() => {
          const map = idx.data;
          if (!map) return `${totalMaterials} materiais no total.`;
          const pages = subjects
            .flatMap((s) => s.materials)
            .reduce((n, m) => n + (map[`${m.stem}.pdf`]?.pages ?? 0), 0);
          return `${totalMaterials} materiais · ${pages.toLocaleString("pt-BR")} páginas de estudo.`;
        })()}
      </p>
    </div>
  );
}

/** /estudos/:subject — um assunto e seus materiais em ordem de estudo. */
export function StudySubjectPage() {
  useProgress();
  const { subject = "" } = useParams();
  const s = subjectById.get(subject);
  const idx = usePageIndex();
  if (!s) return <NotFound />;
  const read = subjectRead(s);
  const map = idx.data;
  return (
    <div>
      <div className="reader-bar">
        <Link to="/estudos" className="chip">
          ← Estudos
        </Link>
      </div>
      <h1>
        {s.icon} {s.title}
      </h1>
      <p className="lede">{s.blurb}</p>
      <ProgressBar done={read} total={s.materials.length} />
      {s.id === "java" && (
        <Link to="/estudos/perguntas" className="interview-cta">
          <span>
            <strong>Banco de perguntas de Java</strong>
            <span>408 perguntas dos PDFs do curso, na página — com selo das empresas que mais cobram.</span>
          </span>
          <span className="interview-cta-go">Abrir →</span>
        </Link>
      )}
      <div className="study-mats">
        {s.materials.map((m) => (
          <MaterialRow key={m.stem} m={m} pages={map?.[`${m.stem}.pdf`]?.pages} />
        ))}
      </div>
      <div className="callout">
        <strong>Dica.</strong> Comece pelas <span className="study-kind k-notes">Apostila</span> de cada assunto
        (o conteúdo denso), depois use as <span className="study-kind k-qa">Perguntas</span> e a{" "}
        <span className="study-kind k-coding">Prática</span> pra fixar. Marque cada material como lido no leitor.
      </div>
    </div>
  );
}
