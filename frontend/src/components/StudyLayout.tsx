import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { ModeSwitch } from "./ModeSwitch";
import { TrackVisit } from "./Progress";
import { subjects } from "../data/studySyllabus";

/** Layout próprio do Modo Estudos — aprender o material do curso por assunto. */
export function StudyLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="app">
      <TrackVisit />
      <header className="mobile-bar">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Abrir menu">
          ☰
        </button>
        <span className="mobile-title">Modo Estudos</span>
      </header>
      {open ? <div className="drawer-overlay" onClick={close} /> : null}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <ModeSwitch />
        <Link to="/estudos" className="brand" onClick={close}>
          <span className="brand-mark study">📚</span>
          <span className="brand-text">
            Modo
            <br />
            Estudos
          </span>
        </Link>
        <nav onClick={close}>
          <NavLink to="/estudos" end className={({ isActive }) => (isActive ? "active" : "")}>
            Visão geral
          </NavLink>
          <NavLink to="/estudos/trilhas" className={({ isActive }) => (isActive ? "active" : "")}>
            🧭 Trilhas de estudo
          </NavLink>
          <NavLink to="/estudos/perguntas" className={({ isActive }) => (isActive ? "active" : "")}>
            ❓ Perguntas de Java
          </NavLink>
          <NavLink to="/estudos/curriculo" className={({ isActive }) => (isActive ? "active" : "")}>
            📄 Currículo & ATS
          </NavLink>
          <NavLink to="/estudos/validador" className={({ isActive }) => (isActive ? "active" : "")}>
            ✅ Validador de ATS
          </NavLink>
          {subjects.map((s) => (
            <NavLink key={s.id} to={`/estudos/${s.id}`} className={({ isActive }) => (isActive ? "active" : "")}>
              {s.icon} {s.title}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          Material do curso Complete Interview Preparation, organizado por assunto pra estudar a fundo.
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
