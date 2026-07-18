import { Link } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { doneCount, useProgress } from "../progress";
import { javaQuestionCount } from "../data/javaCore";
import { totalMaterials } from "../data/studySyllabus";
import { trails } from "../data/studyTrails";
import { buildReadiness, companyFocus } from "../data/readiness";
import type { AreaResult, Trophy } from "../data/readiness";
import { ProgressBar } from "./Progress";

function confColor(pct: number): string {
  if (pct >= 70) return "var(--success)";
  if (pct >= 40) return "var(--amber)";
  return "var(--brand)";
}

function AreaRow({ a }: { a: AreaResult }) {
  const tag = { zero: "não começou", fraco: "fraco", ok: "em andamento", forte: "forte" }[a.status];
  return (
    <div className="rd-area">
      <div className="rd-area-head">
        <span>
          {a.icon} {a.label}
        </span>
        <span className={`rd-tag st-${a.status}`}>{tag}</span>
      </div>
      <ProgressBar done={Math.min(a.done, a.total)} total={a.total} />
    </div>
  );
}

function TrophyChip({ t }: { t: Trophy }) {
  return (
    <div className={`rd-trophy ${t.earned ? "earned" : "locked"}`} title={t.desc}>
      <span className="rd-trophy-icon">{t.earned ? t.icon : "🔒"}</span>
      <span className="rd-trophy-label">{t.label}</span>
    </div>
  );
}

// fetch do total de perguntas do curso, cacheado no módulo (evita re-fetch
// quando o painel é renderizado em duas partes na Home).
let courseTotalCache: Promise<number> | null = null;
function loadCourseTotal(): Promise<number> {
  if (!courseTotalCache)
    courseTotalCache = fetch("/course/qbank/java.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && typeof d.count === "number" ? d.count : 0))
      .catch(() => 0);
  return courseTotalCache;
}

/**
 * Painel de preparação: confiança, troféus e o norte de estudo.
 * `part`: "header" (anel + próximo passo) · "detail" (troféus/áreas/empresa) · "full".
 * A Home usa header e detail separados pra encaixar as trilhas no meio.
 */
export function ReadinessDashboard({ part = "full" }: { part?: "header" | "detail" | "full" }) {
  useProgress();
  const stats = useAsync(() => api.stats(), []);
  const courseTotal = useAsync<number>(loadCourseTotal, []);

  const s = stats.data;
  const cTotal = courseTotal.data ?? 0;
  if (!s) return part === "detail" ? null : <div className="state loading">Carregando…</div>;

  const areas = [
    { id: "fundamentos", label: "Fundamentos (System Design)", icon: "📚", done: doneCount("topic:"), total: s.topics },
    { id: "padroes", label: "Padrões de arquitetura", icon: "🧩", done: doneCount("pattern:"), total: s.patterns },
    { id: "sd", label: "System Design (entrevista)", icon: "🎯", done: doneCount("q:"), total: s.interviewQuestions },
    { id: "java-teoria", label: "Java Core (teoria)", icon: "☕", done: doneCount("jq:"), total: javaQuestionCount },
    { id: "java-curso", label: "Perguntas de Java (curso)", icon: "📝", done: doneCount("cq:"), total: cTotal },
    { id: "material", label: "Material do curso lido", icon: "📖", done: doneCount("read:"), total: totalMaterials },
  ];
  const r = buildReadiness(areas);
  const trail = trails.find((t) => t.id === r.nextTrailId) ?? trails[0];

  const header = part !== "detail";
  const detail = part !== "header";

  return (
    <section className="readiness">
      {header && (
      <>
      <div className="rd-top">
        <div className="rd-meter" style={{ ["--cc" as string]: confColor(r.overall) }}>
          <div className="rd-meter-num">{r.overall}%</div>
          <div className="rd-meter-cap">confiança</div>
        </div>
        <div className="rd-headline">
          <span className="home-kicker">Sua preparação pra entrevista</span>
          <h1>{r.level.label}</h1>
          <p className="lede">{r.level.blurb}</p>
          <div className="rd-highlights">
            {r.strongest && r.strongest.pct > 0 && (
              <span className="rd-hl good">
                Indo bem: <b>{r.strongest.label}</b> ({r.strongest.pct}%)
              </span>
            )}
            {r.weakest && (
              <span className="rd-hl bad">
                Foco: <b>{r.weakest.label}</b> ({r.weakest.pct}%)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rd-next">
        <div>
          <span className="rd-next-kicker">🧭 Próximo passo</span>
          <strong>
            {trail.icon} {trail.title}
          </strong>
          <p>{r.nextTrailWhy}</p>
        </div>
        <Link to="/estudos/trilhas" className="btn btn-primary">
          Ver a trilha →
        </Link>
      </div>
      </>
      )}

      {detail && (
      <>
      <div className="rd-block">
        <div className="rd-block-head">
          <h2>Troféus</h2>
          <span className="muted">
            {r.earnedCount}/{r.trophies.length} conquistados
          </span>
        </div>
        <div className="rd-trophies">
          {r.trophies.map((t) => (
            <TrophyChip key={t.id} t={t} />
          ))}
        </div>
      </div>

      <div className="rd-block">
        <h2>Por área</h2>
        <div className="rd-areas">
          {r.areas.map((a) => (
            <AreaRow key={a.id} a={a} />
          ))}
        </div>
      </div>

      <div className="rd-block">
        <h2>Pra que tipo de empresa?</h2>
        <p className="muted">O foco muda conforme o processo — priorize por onde você vai.</p>
        <div className="rd-focus">
          {companyFocus.map((c) => (
            <div key={c.id} className="rd-focus-card">
              <strong>{c.label}</strong>
              <p>{c.tip}</p>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </section>
  );
}
