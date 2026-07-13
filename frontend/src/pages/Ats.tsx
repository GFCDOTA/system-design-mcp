import { Link } from "react-router-dom";
import { PrepSection } from "../components/PrepSection";
import { atsGuide, resumeStructure, actionVerbs } from "../data/atsGuide";

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

      <h2>Banco de verbos de ação</h2>
      <p className="muted">
        Não comece dois bullets com o mesmo verbo — é um dos motivos mais comuns de perder pontos. Troque os
        repetidos por um destes, agrupados por intenção.
      </p>
      <div className="verb-bank">
        {actionVerbs.map((g) => (
          <div key={g.group} className="verb-group">
            <h4>{g.group}</h4>
            <div className="verb-chips">
              {g.verbs.map((v) => (
                <span key={v} className="chip">
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="callout">
        <strong>Próximo passo.</strong> Com o currículo pronto, treine as respostas que ele vai gerar — histórias
        no formato STAR em <Link to="/entrevista/comportamental">Comportamental</Link> e o técnico nas{" "}
        <Link to="/estudos/trilhas">trilhas de estudo</Link>.
      </div>
    </div>
  );
}
