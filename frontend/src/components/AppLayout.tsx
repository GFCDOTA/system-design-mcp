import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { TrackVisit } from "./Progress";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}
interface NavGroup {
  title?: string;
  items: NavItem[];
}

// Um espaço só: Estudar (aprender) → Treinar (entrevista) → Referência (System Design).
const GROUPS: NavGroup[] = [
  { items: [{ to: "/", label: "Início", end: true }] },
  {
    title: "Estudar",
    items: [
      { to: "/estudos", label: "Material do curso", end: true },
      { to: "/estudos/trilhas", label: "Trilhas de estudo" },
      { to: "/estudos/perguntas", label: "Perguntas de Java" },
      { to: "/estudos/curriculo", label: "Currículo & ATS" },
      { to: "/estudos/validador", label: "Validador de ATS" },
    ],
  },
  {
    title: "Treinar (entrevista)",
    items: [
      { to: "/entrevista", label: "Visão geral", end: true },
      { to: "/entrevista/system-design", label: "System Design" },
      { to: "/entrevista/java", label: "Java Core" },
      { to: "/entrevista/dsa", label: "DSA" },
      { to: "/entrevista/fundamentos", label: "Estruturas & Big-O" },
      { to: "/entrevista/comportamental", label: "Comportamental" },
      { to: "/entrevista/relatos", label: "Relatos de entrevista" },
      { to: "/entrevista/roadmap", label: "Roadmap do curso" },
    ],
  },
  {
    title: "Referência (System Design)",
    items: [
      { to: "/topics", label: "Tópicos" },
      { to: "/patterns", label: "Padrões" },
      { to: "/flows", label: "Fluxos" },
      { to: "/diagrams", label: "Diagramas" },
      { to: "/databases", label: "Bancos de Dados" },
      { to: "/compare", label: "Comparar" },
      { to: "/evidence", label: "Evidências" },
      { to: "/ai-agents", label: "IA & Agentes" },
    ],
  },
];

/** Layout único do app — estudar, treinar e consultar num espaço só. */
export function AppLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="app">
      <TrackVisit />
      <header className="mobile-bar">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Abrir menu">
          ☰
        </button>
        <span className="mobile-title">Base de Prep</span>
      </header>
      {open ? <div className="drawer-overlay" onClick={close} /> : null}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">SD</span>
          <span className="brand-text">
            Base de Prep
            <br />
            pra Entrevista
          </span>
        </Link>
        <nav onClick={close}>
          {GROUPS.map((g, i) => (
            <div key={i} className="nav-group">
              {g.title && <span className="nav-group-title">{g.title}</span>}
              {g.items.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "active" : "")}>
                  {n.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <ThemeToggle />
          <p>Estudar → treinar → consultar, num espaço só. Sem LLM em runtime.</p>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
