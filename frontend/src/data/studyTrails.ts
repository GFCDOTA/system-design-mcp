// Trilhas de estudo curadas — ordens de estudo que fazem sentido pra chegar
// TREINADO no Modo Entrevista. Cada trilha termina apontando pro treino de prova.
//
// Um passo referencia uma página do app: material do curso (/estudos/ler/<stem>),
// o banco de perguntas (/estudos/perguntas), um assunto (/estudos/<id>), ou o
// Modo Entrevista / Base de Conhecimento pra fechar o ciclo estudo → treino.

export type TrailStepKind = "material" | "perguntas" | "assunto" | "treino" | "base";

export interface TrailStep {
  label: string;
  to: string;
  kind: TrailStepKind;
  note?: string;
}

export interface StudyTrail {
  id: string;
  icon: string;
  title: string;
  goal: string;
  weeks: string;
  steps: TrailStep[];
}

export const kindLabel: Record<TrailStepKind, string> = {
  material: "Ler",
  perguntas: "Perguntas",
  assunto: "Assunto",
  treino: "Treinar",
  base: "Base",
};

export const trails: StudyTrail[] = [
  {
    id: "java-do-zero",
    icon: "🌱",
    title: "Java do zero ao sólido",
    goal: "Construir a base de Java que sustenta qualquer entrevista — antes de partir pra Spring.",
    weeks: "~2 semanas",
    steps: [
      { label: "Java — apostila completa", to: "/estudos/ler/Java-PDF-Notes", kind: "material", note: "leia como livro-texto, do começo" },
      { label: "Core Java — Nível I e II", to: "/estudos/perguntas", kind: "perguntas", note: "filtre Nível I, depois II; responda antes de ver" },
      { label: "Estruturas & Big-O", to: "/entrevista/fundamentos", kind: "treino", note: "revise custo das estruturas" },
      { label: "Java Core (teoria curada)", to: "/entrevista/java", kind: "treino", note: "fixe fundamentos/OOP/collections" },
    ],
  },
  {
    id: "backend-senior",
    icon: "🏗️",
    title: "Backend Java sênior (completa)",
    goal: "A trilha longa: do Core Java avançado ao ecossistema Spring, dados e microservices.",
    weeks: "~6–8 semanas",
    steps: [
      { label: "Java — todos os níveis", to: "/estudos/java", kind: "assunto", note: "apostila + Core Java I→V + design patterns" },
      { label: "Perguntas de Java (III→V)", to: "/estudos/perguntas", kind: "perguntas", note: "os níveis avançado/expert" },
      { label: "Spring Framework", to: "/estudos/spring", kind: "assunto" },
      { label: "Spring Boot & Security", to: "/estudos/spring-boot", kind: "assunto" },
      { label: "Dados & Persistência", to: "/estudos/dados", kind: "assunto", note: "SQL, JPA, Kafka" },
      { label: "Microservices & Arquitetura", to: "/estudos/microservices", kind: "assunto" },
      { label: "Ferramentas & Testes", to: "/estudos/ferramentas", kind: "assunto" },
      { label: "System Design (base)", to: "/topics", kind: "base", note: "padrões e consistência distribuída" },
      { label: "Modo Entrevista — completo", to: "/entrevista", kind: "treino", note: "System Design + Java + DSA + comportamental" },
    ],
  },
  {
    id: "reta-final",
    icon: "⏱️",
    title: "Reta final (pré-entrevista)",
    goal: "Já estudou o grosso e a entrevista tá perto — este é o treino intensivo de véspera.",
    weeks: "~2 semanas",
    steps: [
      { label: "Perguntas de Java (revisão rápida)", to: "/estudos/perguntas", kind: "perguntas", note: "só as que você ainda não marcou ✓" },
      { label: "DSA — 16 questões mais cobradas", to: "/entrevista/dsa", kind: "treino" },
      { label: "System Design — 16 designs + framework", to: "/entrevista/system-design", kind: "treino" },
      { label: "Comportamental & STAR", to: "/entrevista/comportamental", kind: "treino" },
      { label: "Relatos de entrevista", to: "/entrevista/relatos", kind: "treino", note: "veja o que caiu em loops reais" },
    ],
  },
];
