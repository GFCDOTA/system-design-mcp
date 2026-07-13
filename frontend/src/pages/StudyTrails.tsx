import { Link } from "react-router-dom";
import { trails, kindLabel, type StudyTrail } from "../data/studyTrails";

function TrailCard({ t }: { t: StudyTrail }) {
  return (
    <section className="rm-module">
      <div className="rm-head">
        <h2>
          {t.icon} {t.title}
        </h2>
        <span className="badge">{t.weeks}</span>
      </div>
      <p className="muted">{t.goal}</p>
      <ol className="trail-steps">
        {t.steps.map((s, i) => (
          <li key={i} className="trail-step">
            <span className="trail-step-n">{i + 1}</span>
            <Link to={s.to} className={`trail-step-link kind-${s.kind}`}>
              <span className="trail-step-label">{s.label}</span>
              <span className={`study-kind k-step-${s.kind}`}>{kindLabel[s.kind]}</span>
            </Link>
            {s.note && <span className="trail-step-note">{s.note}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** /estudos/trilhas — caminhos de estudo curados que terminam no Modo Entrevista. */
export function StudyTrails() {
  return (
    <div>
      <div className="reader-bar">
        <Link to="/estudos" className="chip">
          ← Estudos
        </Link>
      </div>
      <h1>Trilhas de estudo</h1>
      <p className="lede">
        Caminhos prontos, na ordem que faz sentido pra chegar <strong>treinado</strong> na entrevista. Escolha
        pela sua situação — começando do zero, indo fundo, ou na reta final. Cada trilha termina no{" "}
        <Link to="/entrevista">Modo Entrevista</Link>, que é onde você testa se está pronto.
      </p>
      {trails.map((t) => (
        <TrailCard key={t.id} t={t} />
      ))}
    </div>
  );
}
