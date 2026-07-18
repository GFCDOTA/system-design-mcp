import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { TrackVisit } from "./Progress";
import { TopBar } from "./TopBar";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}
interface NavGroup {
  title?: string;
  items: NavItem[];
}

// Um espaço só: Estudar (aprender) → Treinar (entrevista) → Referência (System Design).
// Ícone por item ajuda a ESCANEAR a lista (22 itens) em vez de ler linha a linha.
const GROUPS: NavGroup[] = [
  { items: [{ to: "/", label: "Início", icon: "🏠", end: true }] },
  {
    title: "Estudar",
    items: [
      { to: "/estudos", label: "Material do curso", icon: "📚", end: true },
      { to: "/estudos/trilhas", label: "Trilhas de estudo", icon: "🧭" },
      { to: "/estudos/perguntas", label: "Perguntas de Java", icon: "❓" },
      { to: "/estudos/curriculo", label: "Currículo & ATS", icon: "📄" },
      { to: "/estudos/validador", label: "Validador de ATS", icon: "✅" },
    ],
  },
  {
    title: "Treinar (entrevista)",
    items: [
      { to: "/entrevista", label: "Visão geral", icon: "📊", end: true },
      { to: "/entrevista/system-design", label: "System Design", icon: "🎯" },
      { to: "/entrevista/java", label: "Java Core", icon: "☕" },
      { to: "/entrevista/dsa", label: "DSA", icon: "🧩" },
      { to: "/entrevista/fundamentos", label: "Estruturas & Big-O", icon: "⏱️" },
      { to: "/entrevista/comportamental", label: "Comportamental", icon: "💬" },
      { to: "/entrevista/relatos", label: "Relatos de entrevista", icon: "📋" },
      { to: "/entrevista/roadmap", label: "Roadmap do curso", icon: "🗺️" },
    ],
  },
  {
    title: "Referência (System Design)",
    items: [
      { to: "/topics", label: "Tópicos", icon: "📖" },
      { to: "/patterns", label: "Padrões", icon: "🧱" },
      { to: "/flows", label: "Fluxos", icon: "🔀" },
      { to: "/diagrams", label: "Diagramas", icon: "📐" },
      { to: "/databases", label: "Bancos de Dados", icon: "🗄️" },
      { to: "/compare", label: "Comparar", icon: "⚖️" },
      { to: "/evidence", label: "Evidências", icon: "🔎" },
      { to: "/ai-agents", label: "IA & Agentes", icon: "🤖" },
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
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Menu">
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
                  <span className="nav-ico" aria-hidden>{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p>Estudar → treinar → consultar, num espaço só. Sem LLM em runtime.</p>
        </div>
      </aside>
      <main className="content">
        <TopBar />
        <Outlet />
      </main>
    </div>
  );
}
