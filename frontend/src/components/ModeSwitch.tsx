import { Link, useLocation } from "react-router-dom";

/**
 * Seletor de WORKSPACE no topo de cada sidebar: Base de Conhecimento (System
 * Design), Modo Estudos (aprender o material a fundo) e Modo Entrevista (treinar
 * pra prova). São "mundos" diferentes — mesmo material, momentos diferentes.
 */
export function ModeSwitch() {
  const path = useLocation().pathname;
  const inInterview = path.startsWith("/entrevista");
  const inStudy = path.startsWith("/estudos");
  const inKb = !inInterview && !inStudy;
  return (
    <div className="mode-switch" role="tablist" aria-label="Workspace">
      <Link to="/" className={inKb ? "active" : ""} aria-selected={inKb}>
        <span className="ms-label">Base de Conhecimento</span>
        <span className="ms-sub">Tópicos · padrões · diagramas</span>
      </Link>
      <Link to="/estudos" className={inStudy ? "active" : ""} aria-selected={inStudy}>
        <span className="ms-label">Modo Estudos</span>
        <span className="ms-sub">Aprender Java, Spring, SQL…</span>
      </Link>
      <Link to="/entrevista" className={inInterview ? "active" : ""} aria-selected={inInterview}>
        <span className="ms-label">Modo Entrevista</span>
        <span className="ms-sub">System Design · DSA · comportamental</span>
      </Link>
    </div>
  );
}
