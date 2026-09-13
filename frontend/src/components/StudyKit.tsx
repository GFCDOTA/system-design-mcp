// Peças reutilizáveis dos modos de estudo: ações de revisão espaçada, chips de referência da KB,
// listas simples e o bloco "revelar".
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { hrefFor, KIND_LABEL } from "../api";
import { masteryLabel } from "../data/srs";
import { recordStudy, srsRecord, useSrs } from "../srsStore";

/** Entendi / Revisar depois / Preciso estudar — grava no localStorage. */
export function StudyActions({ id }: { id: string }) {
  useSrs();
  const rec = srsRecord(id);
  const next = rec?.nextReview ? new Date(rec.nextReview) : null;
  return (
    <div className="study-actions" role="group" aria-label="Registrar estudo">
      <button type="button" className="btn btn-secondary" onClick={() => recordStudy(id, "understood")}>
        ✓ Entendi
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => recordStudy(id, "later")}>
        ↻ Revisar depois
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => recordStudy(id, "study")}>
        ✎ Preciso estudar
      </button>
      <span className="muted study-status" aria-live="polite">
        {rec
          ? `Nível: ${masteryLabel(rec.mastery)} · próxima revisão: ${next ? next.toLocaleDateString("pt-BR") : "—"}`
          : "Ainda não estudado"}
      </span>
    </div>
  );
}

/** Chips que linkam para itens da KB de qualquer coleção. */
export function RefChips({
  label,
  refs,
  titleOf,
}: {
  label: string;
  refs: { kind: string; id: string; note?: string }[];
  titleOf?: (kind: string, id: string) => string;
}) {
  if (!refs.length) return null;
  return (
    <div className="chips-row">
      <span className="chips-label">{label}</span>
      {refs.map((r) => {
        const href = hrefFor(r);
        const text = titleOf ? titleOf(r.kind, r.id) : r.id;
        const title = r.note ? `${KIND_LABEL[r.kind] ?? r.kind}: ${r.note}` : KIND_LABEL[r.kind];
        return href ? (
          <Link key={`${r.kind}/${r.id}`} className="chip link" to={href} title={title}>
            {text}
          </Link>
        ) : (
          <span key={`${r.kind}/${r.id}`} className="chip" title={title}>
            {text}
          </span>
        );
      })}
    </div>
  );
}

/** Texto curto com `code` e **negrito** renderizados (sem parágrafo). */
export function Inline({ text }: { text: string }) {
  const parts = String(text ?? "").split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== "");
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : p.startsWith("`") && p.endsWith("`") ? (
          <code key={i}>{p.slice(1, -1)}</code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function List({ items, className }: { items?: string[]; className?: string }) {
  if (!items?.length) return null;
  return (
    <ul className={className}>
      {items.map((it, i) => (
        <li key={i}>
          <Inline text={it} />
        </li>
      ))}
    </ul>
  );
}

/** Seção recolhível acessível (details/summary nativos: teclado e leitor de tela de graça). */
export function Section({ title, open, children, id }: { title: string; open?: boolean; children: ReactNode; id?: string }) {
  return (
    <details className="fm-section" open={open} id={id}>
      <summary>
        <h2>{title}</h2>
      </summary>
      <div className="fm-section-body">{children}</div>
    </details>
  );
}

/** Conteúdo escondido até o estudante pedir (recall antes de ler). */
export function Reveal({ label, children }: { label: string; children: ReactNode }) {
  const [shown, setShown] = useState(false);
  if (shown) return <div className="reveal-body">{children}</div>;
  return (
    <button type="button" className="btn btn-primary reveal-btn" onClick={() => setShown(true)}>
      {label}
    </button>
  );
}

export function DifficultyBadge({ level }: { level: string }) {
  return <span className={`badge level-${level}`}>{level === "staff" ? "Staff" : "Senior"}</span>;
}
