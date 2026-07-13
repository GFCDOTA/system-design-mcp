import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { analyzeResume } from "../data/atsValidator";
import type { AtsReport, Severity } from "../data/atsValidator";
import { sampleResume } from "../data/sampleResume";

const SEV_LABEL: Record<Severity, string> = { high: "Prioridade alta", medium: "Média", low: "Baixa" };

function scoreColor(pct: number): string {
  if (pct >= 85) return "var(--success)";
  if (pct >= 65) return "var(--amber)";
  return "var(--danger)";
}

function Report({ r }: { r: AtsReport }) {
  const pct = r.overall;
  return (
    <div className="ats-report">
      <div className="ats-score" style={{ ["--sc" as string]: scoreColor(pct) }}>
        <div className="ats-score-num">{pct}</div>
        <div className="ats-score-of">/100</div>
      </div>

      <div className="ats-cats">
        {r.categories.map((c) => (
          <div key={c.key} className="ats-cat">
            <div className="ats-cat-head">
              <span>{c.label}</span>
              <span className="ats-cat-score">
                {c.score}/{c.max}
              </span>
            </div>
            <div className="trail-progress-track">
              <div
                className="trail-progress-fill"
                style={{ width: `${(c.score / c.max) * 100}%`, background: scoreColor((c.score / c.max) * 100) }}
              />
            </div>
            {c.notes.length > 0 && <p className="ats-cat-notes">{c.notes.join(" · ")}</p>}
          </div>
        ))}
      </div>

      <div className="ats-stats">
        <span><b>{r.stats.words}</b> palavras</span>
        <span><b>{r.stats.bullets}</b> bullets</span>
        <span><b>{r.stats.quantifiedPct}%</b> com número</span>
        <span><b>{r.stats.weakOpeners}</b> aberturas fracas</span>
        <span>datas: <b>{r.stats.datesConsistent ? "consistentes" : "misturadas"}</b></span>
      </div>

      <h2>O que consertar ({r.issues.length})</h2>
      {r.issues.length === 0 ? (
        <p className="muted">Nenhum problema detectado. 🎉</p>
      ) : (
        <ul className="ats-issues">
          {r.issues.map((iss, i) => (
            <li key={i} className={`ats-issue sev-${iss.severity}`}>
              <div className="ats-issue-head">
                <strong>{iss.title}</strong>
                <span className={`study-kind sev-badge-${iss.severity}`}>{SEV_LABEL[iss.severity]}</span>
              </div>
              <p className="ats-issue-detail">{iss.detail}</p>
              <p className="ats-issue-fix">
                <span aria-hidden>🔧</span> {iss.fix}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** /estudos/validador — cola o currículo e recebe score + validações + consertos. */
export function AtsChecker() {
  const [text, setText] = useState("");
  const report = useMemo(() => (text.trim() ? analyzeResume(text) : null), [text]);

  return (
    <div>
      <div className="reader-bar">
        <Link to="/estudos" className="chip">
          ← Estudos
        </Link>
        <Link to="/estudos/curriculo" className="chip">
          Guia de ATS
        </Link>
      </div>
      <h1>Validador de currículo (ATS)</h1>
      <p className="lede">
        Cole o TEXTO do seu currículo abaixo — o validador roda todas as checagens na hora (contato, experiência,
        projetos, skills, formação e os "diversos"), calcula o score por categoria e lista o conserto de cada
        problema. Roda 100% no seu navegador; nada é enviado a lugar nenhum.
      </p>
      <p className="muted cbadge-note">
        ℹ É uma checagem HEURÍSTICA e transparente (o peso de cada critério é aberto), não o ATS exato de uma
        empresa específica. Serve pra pegar problema de parse, keyword e impacto — use como sanidade, não como
        verdade absoluta.
      </p>

      <div className="ats-toolbar">
        <button className="btn btn-secondary" type="button" onClick={() => setText(sampleResume)}>
          Carregar exemplo corrigido
        </button>
        {text && (
          <button className="btn btn-secondary" type="button" onClick={() => setText("")}>
            Limpar
          </button>
        )}
      </div>

      <textarea
        className="ats-input"
        placeholder="Cole aqui o texto do seu currículo (copie do PDF/Word e cole)…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
      />

      {report ? (
        <Report r={report} />
      ) : (
        <p className="muted">Cole seu currículo acima (ou carregue o exemplo) pra ver o score e os consertos.</p>
      )}
    </div>
  );
}
