import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  to?: string; // sem `to` = item atual (não-clicável)
}

/** Trilha de navegação "onde estou" — âncora de contexto no topo de páginas fundas. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Trilha de navegação">
      {items.map((it, i) => (
        <span key={i} className="breadcrumb-item">
          {i > 0 && (
            <span className="breadcrumb-sep" aria-hidden>
              ›
            </span>
          )}
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span className="breadcrumb-cur">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}
