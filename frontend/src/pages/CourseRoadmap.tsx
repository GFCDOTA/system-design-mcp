import { Link } from "react-router-dom";
import { courseUrl, coursePdfBase, bonusGuidePdf, contents, modules, type RoadmapModule } from "../data/courseRoadmap";
import { ProgressBar } from "../components/Progress";
import { isDone, toggleDone, useProgress } from "../progress";

function StepRow({ contentId, seq, files }: { contentId: string; seq?: string; files?: string[] }) {
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
      {files?.map((f, i) => (
        <a key={f} href={`${coursePdfBase}${f}`} target="_blank" rel="noreferrer" className="chip link rm-inapp">
          {files.length > 1 ? `PDF ${i + 1}` : "PDF"} ↗
        </a>
      ))}
      {c.inApp && (
        <Link to={c.inApp.to} className="chip rm-inapp">
          treinar: {c.inApp.label}
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
              <StepRow key={id} contentId={id} files={m.files[id]} />
            ))}
          </div>
        </>
      )}
      <h4>{m.common.length > 0 ? "Sequência" : "Materiais"}</h4>
      <div className="rm-steps">
        {m.steps.map((id, i) => (
          <StepRow key={id} contentId={id} seq={String(i + 1)} files={m.files[id]} />
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
        <strong>Como usar.</strong> Os PDFs do curso estão baixados NESTA máquina (pasta local, fora do git —
        material pago não vai pro repositório público): clique em <span className="chip link">PDF ↗</span> pra
        abrir o material do passo, direto do app. Cada módulo tem a própria versão dos PDFs. Original no{" "}
        <a href={courseUrl} target="_blank" rel="noreferrer">
          curso ↗
        </a>{" "}
        · bônus:{" "}
        <a href={`${coursePdfBase}${bonusGuidePdf}`} target="_blank" rel="noreferrer">
          Guia completo de orientação (PDF) ↗
        </a>
        . E cruze cada tema com o que dá pra treinar no app — Core Java na aba{" "}
        <Link to="/entrevista/java">Java Core</Link>, coding em <Link to="/entrevista/dsa">DSA</Link>,
        microserviços e padrões na <Link to="/topics">Base de Conhecimento</Link>.
      </div>
      {modules.map((m) => (
        <ModuleCard key={m.id} m={m} />
      ))}
    </div>
  );
}
