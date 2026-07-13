import { Link } from "react-router-dom";
import { courseUrl, contents, modules, type RoadmapModule } from "../data/courseRoadmap";
import { ProgressBar } from "../components/Progress";
import { isDone, toggleDone, useProgress } from "../progress";

function StepRow({ contentId, seq }: { contentId: string; seq?: string }) {
  const c = contents[contentId];
  const done = isDone(`course:${contentId}`);
  return (
    <div className={`rm-step ${done ? "done" : ""}`}>
      <button
        type="button"
        className={`qa-done ${done ? "done" : ""}`}
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `${c.label} — estudado` : `Marcar ${c.label} como estudado`}
        onClick={() => toggleDone(`course:${contentId}`)}
      >
        ✓
      </button>
      {seq && <span className="rm-seq">{seq}</span>}
      <span className="rm-label">{c.label}</span>
      {c.optional && <span className="badge small">opcional</span>}
      {c.inApp && (
        <Link to={c.inApp.to} className="chip link rm-inapp">
          treinar no app: {c.inApp.label}
        </Link>
      )}
    </div>
  );
}

function ModuleCard({ m }: { m: RoadmapModule }) {
  const all = [...new Set([...m.common, ...m.steps])];
  const done = all.filter((id) => isDone(`course:${id}`)).length;
  return (
    <section className="rm-module">
      <div className="rm-head">
        <h2>{m.title}</h2>
        <span className="badge">{m.band}</span>
      </div>
      <p className="muted">{m.desc}</p>
      <ProgressBar done={done} total={all.length} />
      {m.common.length > 0 && (
        <>
          <h4>Passos comuns (em paralelo)</h4>
          <div className="rm-steps">
            {m.common.map((id) => (
              <StepRow key={id} contentId={id} />
            ))}
          </div>
        </>
      )}
      <h4>{m.common.length > 0 ? "Sequência" : "Materiais"}</h4>
      <div className="rm-steps">
        {m.steps.map((id, i) => (
          <StepRow key={id} contentId={id} seq={String(i + 1)} />
        ))}
      </div>
    </section>
  );
}

/** /entrevista/roadmap — trilha do curso Complete Interview Preparation (material do Felipe). */
export function CourseRoadmap() {
  useProgress();
  return (
    <div>
      <h1>Roadmap do curso</h1>
      <p className="lede">
        O mapa do <strong>Complete Interview Preparation</strong> (GenZ Career) — o material que você já comprou,
        organizado por faixa de experiência. Escolha o módulo da sua faixa, siga a sequência e marque cada passo
        estudado: um passo concluído (ex.: Core Java — Level I) conta em <em>todos</em> os módulos que o incluem.
      </p>
      <div className="callout">
        <strong>Como usar.</strong> O conteúdo (PDFs e anotações) fica no{" "}
        <a href={courseUrl} target="_blank" rel="noreferrer">
          curso ↗
        </a>
        ; aqui você acompanha o progresso e cruza cada tema com o que dá pra treinar dentro do app — Core Java na
        aba <Link to="/entrevista/java">Java Core</Link>, coding em <Link to="/entrevista/dsa">DSA</Link>,
        microserviços e padrões na <Link to="/topics">Base de Conhecimento</Link>.
      </div>
      {modules.map((m) => (
        <ModuleCard key={m.id} m={m} />
      ))}
    </div>
  );
}
