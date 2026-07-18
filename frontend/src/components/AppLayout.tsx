import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { TrackVisit } from "./Progress";
import { TopBar } from "./TopBar";
import { useI18n } from "../i18n";

interface NavItem {
  to: string;
  key: string;
  icon: string;
  end?: boolean;
}
interface NavGroup {
  titleKey?: string;
  items: NavItem[];
}

// Um espaço só: Estudar (aprender) → Treinar (entrevista) → Referência (System Design).
// Ícone por item ajuda a ESCANEAR a lista (22 itens) em vez de ler linha a linha.
const GROUPS: NavGroup[] = [
  { items: [{ to: "/", key: "nav.home", icon: "🏠", end: true }] },
  {
    titleKey: "nav.g.study",
    items: [
      { to: "/estudos", key: "nav.study.material", icon: "📚", end: true },
      { to: "/estudos/trilhas", key: "nav.study.trails", icon: "🧭" },
      { to: "/estudos/perguntas", key: "nav.study.javaq", icon: "❓" },
      { to: "/estudos/curriculo", key: "nav.study.resume", icon: "📄" },
      { to: "/estudos/validador", key: "nav.study.validator", icon: "✅" },
    ],
  },
  {
    titleKey: "nav.g.train",
    items: [
      { to: "/entrevista", key: "nav.train.overview", icon: "📊", end: true },
      { to: "/entrevista/system-design", key: "nav.train.sd", icon: "🎯" },
      { to: "/entrevista/java", key: "nav.train.java", icon: "☕" },
      { to: "/entrevista/dsa", key: "nav.train.dsa", icon: "🧩" },
      { to: "/entrevista/fundamentos", key: "nav.train.bigo", icon: "⏱️" },
      { to: "/entrevista/comportamental", key: "nav.train.behavioral", icon: "💬" },
      { to: "/entrevista/relatos", key: "nav.train.reports", icon: "📋" },
      { to: "/entrevista/roadmap", key: "nav.train.roadmap", icon: "🗺️" },
    ],
  },
  {
    titleKey: "nav.g.reference",
    items: [
      { to: "/topics", key: "nav.ref.topics", icon: "📖" },
      { to: "/patterns", key: "nav.ref.patterns", icon: "🧱" },
      { to: "/flows", key: "nav.ref.flows", icon: "🔀" },
      { to: "/diagrams", key: "nav.ref.diagrams", icon: "📐" },
      { to: "/databases", key: "nav.ref.databases", icon: "🗄️" },
      { to: "/compare", key: "nav.ref.compare", icon: "⚖️" },
      { to: "/evidence", key: "nav.ref.evidence", icon: "🔎" },
      { to: "/ai-agents", key: "nav.ref.ai", icon: "🤖" },
    ],
  },
];

/** Layout único do app — estudar, treinar e consultar num espaço só. */
export function AppLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { t } = useI18n();
  return (
    <div className="app">
      <TrackVisit />
      <header className="mobile-bar">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Menu">
          ☰
        </button>
        <span className="mobile-title">{t("brand.line1")}</span>
      </header>
      {open ? <div className="drawer-overlay" onClick={close} /> : null}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">SD</span>
          <span className="brand-text">
            {t("brand.line1")}
            <br />
            {t("brand.line2")}
          </span>
        </Link>
        <nav onClick={close}>
          {GROUPS.map((g, i) => (
            <div key={i} className="nav-group">
              {g.titleKey && <span className="nav-group-title">{t(g.titleKey)}</span>}
              {g.items.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "active" : "")}>
                  <span className="nav-ico" aria-hidden>{n.icon}</span>
                  {t(n.key)}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p>{t("foot.tagline")}</p>
        </div>
      </aside>
      <main className="content">
        <TopBar />
        <Outlet />
      </main>
    </div>
  );
}
