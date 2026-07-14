import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { TrackVisit } from "./Progress";
import { TopBar } from "./TopBar";
import { useI18n } from "../i18n";

interface NavItem {
  to: string;
  key: string;
  end?: boolean;
}
interface NavGroup {
  titleKey?: string;
  items: NavItem[];
}

// Um espaço só: Estudar (aprender) → Treinar (entrevista) → Referência (System Design).
const GROUPS: NavGroup[] = [
  { items: [{ to: "/", key: "nav.home", end: true }] },
  {
    titleKey: "nav.g.study",
    items: [
      { to: "/estudos", key: "nav.study.material", end: true },
      { to: "/estudos/trilhas", key: "nav.study.trails" },
      { to: "/estudos/perguntas", key: "nav.study.javaq" },
      { to: "/estudos/curriculo", key: "nav.study.resume" },
      { to: "/estudos/validador", key: "nav.study.validator" },
    ],
  },
  {
    titleKey: "nav.g.train",
    items: [
      { to: "/entrevista", key: "nav.train.overview", end: true },
      { to: "/entrevista/system-design", key: "nav.train.sd" },
      { to: "/entrevista/java", key: "nav.train.java" },
      { to: "/entrevista/dsa", key: "nav.train.dsa" },
      { to: "/entrevista/fundamentos", key: "nav.train.bigo" },
      { to: "/entrevista/comportamental", key: "nav.train.behavioral" },
      { to: "/entrevista/relatos", key: "nav.train.reports" },
      { to: "/entrevista/roadmap", key: "nav.train.roadmap" },
    ],
  },
  {
    titleKey: "nav.g.reference",
    items: [
      { to: "/topics", key: "nav.ref.topics" },
      { to: "/patterns", key: "nav.ref.patterns" },
      { to: "/flows", key: "nav.ref.flows" },
      { to: "/diagrams", key: "nav.ref.diagrams" },
      { to: "/databases", key: "nav.ref.databases" },
      { to: "/compare", key: "nav.ref.compare" },
      { to: "/evidence", key: "nav.ref.evidence" },
      { to: "/ai-agents", key: "nav.ref.ai" },
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
