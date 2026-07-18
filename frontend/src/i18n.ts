// Idioma (PT/EN) — leve, sem dependência. Traduz a CASCA do app (navegação,
// topo, home). O conteúdo denso das páginas segue sendo traduzido aos poucos;
// t() cai no texto PT se a chave não existir no idioma atual.
import { useSyncExternalStore } from "react";

export type Lang = "pt" | "en";
const KEY = "sdsl-lang-v1";

type Dict = Record<string, string>;

const PT: Dict = {
  // topo
  "top.theme.dark": "Escuro",
  "top.theme.light": "Claro",
  "top.appearance": "Aparência",
  "top.theme": "Tema",
  "top.accent": "Cor de destaque",
  // navegação
  "nav.home": "Início",
  "nav.g.study": "Estudar",
  "nav.g.train": "Treinar (entrevista)",
  "nav.g.reference": "Referência (System Design)",
  "nav.study.material": "Material do curso",
  "nav.study.trails": "Trilhas de estudo",
  "nav.study.javaq": "Perguntas de Java",
  "nav.study.resume": "Currículo & ATS",
  "nav.study.validator": "Validador de ATS",
  "nav.train.overview": "Visão geral",
  "nav.train.sd": "System Design",
  "nav.train.java": "Java Core",
  "nav.train.dsa": "DSA",
  "nav.train.bigo": "Estruturas & Big-O",
  "nav.train.behavioral": "Comportamental",
  "nav.train.reports": "Relatos de entrevista",
  "nav.train.roadmap": "Roadmap do curso",
  "nav.ref.topics": "Tópicos",
  "nav.ref.patterns": "Padrões",
  "nav.ref.flows": "Fluxos",
  "nav.ref.diagrams": "Diagramas",
  "nav.ref.databases": "Bancos de Dados",
  "nav.ref.compare": "Comparar",
  "nav.ref.evidence": "Evidências",
  "nav.ref.ai": "IA & Agentes",
  "brand.line1": "Base de Prep",
  "brand.line2": "pra Entrevista",
  "foot.tagline": "Estudar → treinar → consultar, num espaço só. Sem LLM em runtime.",
  // home
  "home.kicker": "Base de prep pra entrevista",
  "home.title": "Estude, treine e consulte — num espaço só",
  "home.lede":
    "Todo o material do curso pra estudar a fundo, o treino de entrevista (System Design + DSA + Java + comportamental) e a referência de System Design, juntos. Aprender e treinar são a mesma jornada — sem trocar de mundo.",
  "home.cta.study": "Começar a estudar →",
  "home.cta.continue": "Continuar",
  "home.cta.train": "Treinar entrevista",
  "home.cta.reference": "Referência",
  "home.trails": "Trilhas de estudo",
  "home.map": "Mapa de tópicos",
};

const EN: Dict = {
  "top.theme.dark": "Dark",
  "top.theme.light": "Light",
  "top.appearance": "Appearance",
  "top.theme": "Theme",
  "top.accent": "Accent color",
  "nav.home": "Home",
  "nav.g.study": "Study",
  "nav.g.train": "Train (interview)",
  "nav.g.reference": "Reference (System Design)",
  "nav.study.material": "Course material",
  "nav.study.trails": "Study trails",
  "nav.study.javaq": "Java questions",
  "nav.study.resume": "Résumé & ATS",
  "nav.study.validator": "ATS checker",
  "nav.train.overview": "Overview",
  "nav.train.sd": "System Design",
  "nav.train.java": "Java Core",
  "nav.train.dsa": "DSA",
  "nav.train.bigo": "Data Structures & Big-O",
  "nav.train.behavioral": "Behavioral",
  "nav.train.reports": "Interview reports",
  "nav.train.roadmap": "Course roadmap",
  "nav.ref.topics": "Topics",
  "nav.ref.patterns": "Patterns",
  "nav.ref.flows": "Flows",
  "nav.ref.diagrams": "Diagrams",
  "nav.ref.databases": "Databases",
  "nav.ref.compare": "Compare",
  "nav.ref.evidence": "Evidence",
  "nav.ref.ai": "AI & Agents",
  "brand.line1": "Interview",
  "brand.line2": "Prep Base",
  "foot.tagline": "Study → train → look it up, in one place. No LLM at runtime.",
  "home.kicker": "Interview prep base",
  "home.title": "Study, train and look it up — in one place",
  "home.lede":
    "All the course material to study in depth, the interview training (System Design + DSA + Java + behavioral) and the System Design reference, together. Learning and training are the same journey — no switching worlds.",
  "home.cta.study": "Start studying →",
  "home.cta.continue": "Resume",
  "home.cta.train": "Train interview",
  "home.cta.reference": "Reference",
  "home.trails": "Study trails",
  "home.map": "Topic map",
};

const DICTS: Record<Lang, Dict> = { pt: PT, en: EN };

export function getLang(): Lang {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "pt";
  } catch {
    return "pt";
  }
}

export function applyLang(l: Lang) {
  document.documentElement.setAttribute("lang", l === "en" ? "en" : "pt-BR");
}

const listeners = new Set<() => void>();
let current: Lang = getLang();

export function setLang(l: Lang) {
  if (l === current) return;
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* privado — perder a preferência não pode quebrar */
  }
  applyLang(l);
  for (const fn of listeners) fn();
}

/** Hook: idioma atual + tradutor. Re-renderiza quando o idioma muda. */
export function useI18n(): { lang: Lang; t: (key: string) => string } {
  const lang = useSyncExternalStore<Lang>(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "pt",
  );
  const t = (key: string) => DICTS[lang][key] ?? PT[key] ?? key;
  return { lang, t };
}
