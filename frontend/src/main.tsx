import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Home } from "./pages/Home";
import { Topics } from "./pages/Topics";
import { TopicDetail } from "./pages/TopicDetail";
import { Patterns } from "./pages/Patterns";
import { PatternDetail } from "./pages/PatternDetail";
import { Flows } from "./pages/Flows";
import { FlowDetail } from "./pages/FlowDetail";
import { Diagrams } from "./pages/Diagrams";
import { DiagramDetail } from "./pages/DiagramDetail";
import { Compare } from "./pages/Compare";
import { EvidencePage } from "./pages/Evidence";
import { AiGlossary } from "./pages/AiGlossary";
import { Databases } from "./pages/Databases";
import { DatabaseDetail } from "./pages/DatabaseDetail";
import { DatabaseBuilder } from "./pages/DatabaseBuilder";
import {
  InterviewOverview,
  InterviewSystemDesign,
  InterviewDsa,
  InterviewBehavioral,
  InterviewFundamentos,
  InterviewRelatos,
} from "./pages/Interview";
import { JavaCore } from "./pages/JavaCore";
import { CourseRoadmap } from "./pages/CourseRoadmap";
import { CourseReader } from "./pages/CourseReader";
import { StudyOverview, StudySubjectPage } from "./pages/Study";
import { JavaQuestions } from "./pages/JavaQuestions";
import { StudyTrails } from "./pages/StudyTrails";
import { Ats } from "./pages/Ats";
import { AtsChecker } from "./pages/AtsChecker";
import { RouteError, NotFound } from "./pages/RouteError";
import { InstallHint } from "./components/InstallHint";
import { applyTheme, getTheme } from "./theme";
import { applyLang, getLang } from "./i18n";
import "./styles.css";

// aplica tema e idioma salvos antes do render (evita flash)
applyTheme(getTheme());
applyLang(getLang());

const router = createBrowserRouter([
  {
    // Um espaço só — estudar, treinar e consultar sob o mesmo layout.
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },

      // Referência (System Design)
      { path: "topics", element: <Topics /> },
      { path: "topics/:id", element: <TopicDetail /> },
      { path: "patterns", element: <Patterns /> },
      { path: "patterns/:id", element: <PatternDetail /> },
      { path: "flows", element: <Flows /> },
      { path: "flows/:id", element: <FlowDetail /> },
      { path: "diagrams", element: <Diagrams /> },
      { path: "diagrams/:id", element: <DiagramDetail /> },
      { path: "compare", element: <Compare /> },
      { path: "evidence", element: <EvidencePage /> },
      { path: "ai-agents", element: <AiGlossary /> },
      { path: "databases", element: <Databases /> },
      { path: "databases/builder", element: <DatabaseBuilder /> },
      { path: "databases/:id", element: <DatabaseDetail /> },

      // Estudar (material do curso)
      { path: "estudos", element: <StudyOverview /> },
      { path: "estudos/perguntas", element: <JavaQuestions /> },
      { path: "estudos/trilhas", element: <StudyTrails /> },
      { path: "estudos/curriculo", element: <Ats /> },
      { path: "estudos/validador", element: <AtsChecker /> },
      { path: "estudos/ler/:file", element: <CourseReader /> },
      { path: "estudos/:subject", element: <StudySubjectPage /> },

      // Treinar (entrevista)
      { path: "entrevista", element: <InterviewOverview /> },
      { path: "entrevista/system-design", element: <InterviewSystemDesign /> },
      { path: "entrevista/java", element: <JavaCore /> },
      { path: "entrevista/roadmap", element: <CourseRoadmap /> },
      { path: "entrevista/curso/:file", element: <CourseReader /> },
      { path: "entrevista/dsa", element: <InterviewDsa /> },
      { path: "entrevista/fundamentos", element: <InterviewFundamentos /> },
      { path: "entrevista/comportamental", element: <InterviewBehavioral /> },
      { path: "entrevista/relatos", element: <InterviewRelatos /> },

      { path: "*", element: <NotFound /> },
    ],
  },
  // back-compat: /interview antigo → visão de treino
  { path: "/interview", element: <Navigate to="/entrevista" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <InstallHint />
  </React.StrictMode>,
);

// PWA: registra o service worker (offline + instalável). Falha silenciosa fora de https/localhost.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
