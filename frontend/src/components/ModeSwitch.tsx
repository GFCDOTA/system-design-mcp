import { Link, useLocation } from "react-router-dom";

/**
 * Seletor de WORKSPACE no topo de cada sidebar: a Base de Conhecimento de System
 * Design e o Modo Entrevista. Não é uma aba qualquer — é troca de "mundo".
 */
export function ModeSwitch() {
  const inInterview = useLocation().pathname.startsWith("/entrevista");
  return (
    <div className="mode-switch" role="tablist" aria-label="Workspace">
      <Link to="/" className={inInterview ? "" : "active"} aria-selected={!inInterview}>
        <span className="ms-label">Base de Conhecimento</span>
        <span className="ms-sub">Tópicos · padrões · diagramas</span>
      </Link>
      <Link to="/entrevista" className={inInterview ? "active" : ""} aria-selected={inInterview}>
        <span className="ms-label">Modo Entrevista</span>
        <span className="ms-sub">System Design · DSA · comportamental</span>
      </Link>
    </div>
  );
}
