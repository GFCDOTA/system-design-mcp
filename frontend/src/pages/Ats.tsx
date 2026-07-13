import { Link } from "react-router-dom";
import { PrepSection } from "../components/PrepSection";
import { atsGuide, resumeStructure } from "../data/atsGuide";

/** /estudos/curriculo — guia de currículo & ATS (formatação que passa no parser). */
export function Ats() {
  return (
    <div>
      <div className="reader-bar">
        <Link to="/estudos" className="chip">
          ← Estudos
        </Link>
      </div>
      <h1>Currículo & ATS</h1>
      <p className="lede">
        Antes da entrevista vem o currículo — e antes do recrutador vem o <strong>ATS</strong>, o software que
        filtra candidatos. Aqui está como montar um currículo que passa no parser e impressiona o humano depois.
      </p>

      <PrepSection pillar={atsGuide} />

      <h2>Estrutura recomendada</h2>
      <p className="muted">A ordem das seções que o ATS entende bem e o recrutador espera encontrar.</p>
      <ol className="ats-structure">
        {resumeStructure.map((r, i) => (
          <li key={i} className="ats-structure-item">
            <span className="ats-structure-n">{i + 1}</span>
            <div>
              <strong>{r.section}</strong>
              <span className="ats-structure-hint">{r.hint}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="callout">
        <strong>Próximo passo.</strong> Com o currículo pronto, treine as respostas que ele vai gerar — histórias
        no formato STAR em <Link to="/entrevista/comportamental">Comportamental</Link> e o técnico nas{" "}
        <Link to="/estudos/trilhas">trilhas de estudo</Link>.
      </div>
    </div>
  );
}
