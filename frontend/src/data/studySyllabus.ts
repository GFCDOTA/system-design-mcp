// Modo Estudos — currículo de aprendizado organizado por ASSUNTO (não por faixa
// de experiência como o roadmap de entrevista). Reúne TODO o material do curso
// (as 1876 páginas extraídas) numa trilha pedagógica: primeiro as notas completas
// de cada tema, depois a prática e o ângulo de entrevista.
//
// Cada material aponta pra UM PDF canônico (a versão mais completa — em geral a do
// módulo mais avançado). O conteúdo em si vive em frontend/public/course/ (fora do
// git); aqui só a estrutura + os nomes de arquivo.

export type MaterialKind = "notes" | "handwritten" | "qa" | "coding" | "guide";

export interface StudyMaterial {
  /** id do leitor (nome do PDF sem .pdf). */
  stem: string;
  label: string;
  kind: MaterialKind;
}

export interface StudySubject {
  id: string;
  icon: string;
  title: string;
  blurb: string;
  materials: StudyMaterial[];
}

export const kindLabel: Record<MaterialKind, string> = {
  notes: "Apostila",
  handwritten: "Manuscrito",
  qa: "Perguntas",
  coding: "Prática",
  guide: "Guia",
};

export const subjects: StudySubject[] = [
  {
    id: "java",
    icon: "☕",
    title: "Java",
    blurb: "A base de tudo — dos fundamentos ao nível expert, mais exercícios de codificação e Stream API.",
    materials: [
      { stem: "Java-PDF-Notes", label: "Java — apostila completa", kind: "notes" },
      { stem: "Java-Hand-written-notes", label: "Java — anotações manuscritas", kind: "handwritten" },
      { stem: "Step-1-Core-Java-Level-I-2", label: "Core Java — Nível I", kind: "qa" },
      { stem: "Step-2-Core-Java-Level-II-2", label: "Core Java — Nível II", kind: "qa" },
      { stem: "Step-3-Core-Java-Level-III-1", label: "Core Java — Nível III", kind: "qa" },
      { stem: "Step-4-Core-Java-Level-IV-Advance-Level", label: "Core Java — Nível IV (Avançado)", kind: "qa" },
      { stem: "Step-5-Core-Java-Level-V-Expert", label: "Core Java — Nível V (Expert)", kind: "qa" },
      { stem: "Common-Step-Java-Coding-2", label: "Exercícios de codificação Java", kind: "coding" },
      { stem: "Common-Step-Stream-API-Coding-Level-I-2", label: "Stream API — Nível I", kind: "coding" },
      { stem: "Common-Step-Stream-API-Coding-Level-II-1", label: "Stream API — Nível II", kind: "coding" },
      { stem: "Step-6-Java-Design-Patterns", label: "Java Design Patterns", kind: "qa" },
    ],
  },
  {
    id: "spring",
    icon: "🌱",
    title: "Spring Framework",
    blurb: "O núcleo do Spring: IoC/DI, o framework em dois níveis e o Spring MVC.",
    materials: [
      { stem: "Spring-Framework-Notes", label: "Spring Framework — apostila", kind: "notes" },
      { stem: "Spring-ALL-Hand-written-notes", label: "Spring — anotações manuscritas", kind: "handwritten" },
      { stem: "Step-7-Spring-Framework-Level-I", label: "Spring Framework — Nível I", kind: "qa" },
      { stem: "Step-8-Spring-framework-Level-II", label: "Spring Framework — Nível II", kind: "qa" },
      { stem: "Step-16-Spring-MVC-Level-I-Optional", label: "Spring MVC", kind: "qa" },
    ],
  },
  {
    id: "spring-boot",
    icon: "🚀",
    title: "Spring Boot & Security",
    blurb: "Do zero ao expert em Spring Boot, incluindo cenários reais e Spring Security.",
    materials: [
      { stem: "Spring-Boot-PDF-Notes", label: "Spring Boot — apostila completa", kind: "notes" },
      { stem: "Step-9-Spring-Boot-Level-I", label: "Spring Boot — Nível I", kind: "qa" },
      { stem: "Step-10-Spring-Boot-Level-II", label: "Spring Boot — Nível II", kind: "qa" },
      { stem: "Step-11-Spring-Boot-Level-III-Scenario-Based", label: "Spring Boot — Nível III (Cenários)", kind: "qa" },
      { stem: "Step-12-Spring-Boot-level-IV-Advance", label: "Spring Boot — Nível IV (Avançado)", kind: "qa" },
      { stem: "Step-13-Spring-Boot-Level-V-Expert", label: "Spring Boot — Nível V (Expert)", kind: "qa" },
      { stem: "Step-14-Spring-Security-Level-I", label: "Spring Security — Nível I", kind: "qa" },
      { stem: "Step-15-Spring-Security-Level-II", label: "Spring Security — Nível II", kind: "qa" },
    ],
  },
  {
    id: "dados",
    icon: "🗄️",
    title: "Dados & Persistência",
    blurb: "SQL do zero, Spring Data JPA e mensageria com Kafka.",
    materials: [
      { stem: "SQL-PDF-Notes", label: "SQL — apostila completa", kind: "notes" },
      { stem: "SQL-Hand-written-notes", label: "SQL — anotações manuscritas", kind: "handwritten" },
      { stem: "Step-17-SQL", label: "SQL — perguntas", kind: "qa" },
      { stem: "Step-18-Spring-Data-JPA-and-Other-DB-Level-I", label: "Spring Data JPA e outros bancos", kind: "qa" },
      { stem: "Step-19-Kafka-Optional", label: "Kafka", kind: "qa" },
    ],
  },
  {
    id: "microservices",
    icon: "🧩",
    title: "Microservices & Arquitetura",
    blurb: "De microservices básico aos padrões de arquitetura distribuída.",
    materials: [
      { stem: "Step-20-Microservices-Level-I", label: "Microservices — Nível I", kind: "qa" },
      { stem: "Step-21-Microservices-Level-II", label: "Microservices — Nível II", kind: "qa" },
      { stem: "Step-22-Microservices-Design-Patterns", label: "Microservices Design Patterns", kind: "qa" },
    ],
  },
  {
    id: "ferramentas",
    icon: "🔧",
    title: "Ferramentas & Testes",
    blurb: "Build e versionamento (Maven, Gradle, Git) e testes com JUnit + Mockito.",
    materials: [
      { stem: "Step-23-Maven-and-Git-Level-I", label: "Maven e Git — Nível I", kind: "qa" },
      { stem: "Step-24-Maven-and-Git-Gradle-and-Deployments-Level-II", label: "Maven, Gradle e Deployments — Nível II", kind: "qa" },
      { stem: "Step-25-Junit-and-Mockito", label: "JUnit e Mockito", kind: "qa" },
    ],
  },
  {
    id: "carreira",
    icon: "🎓",
    title: "Carreira",
    blurb: "Orientação de currículo/processo e as perguntas não-técnicas de liderança.",
    materials: [
      { stem: "Complete-Guidance", label: "Guia completo de orientação", kind: "guide" },
      { stem: "Step-26-Non-Techincal-Lead-level-Questions", label: "Perguntas de liderança (não-técnicas)", kind: "qa" },
    ],
  },
];

export const subjectById = new Map(subjects.map((s) => [s.id, s]));

export interface StudyEntry {
  material: StudyMaterial;
  subject: StudySubject;
}

/** Trilha linear de estudo: todos os materiais na ordem dos assuntos. */
export const studyReadingList: StudyEntry[] = subjects.flatMap((s) =>
  s.materials.map((material) => ({ material, subject: s })),
);

const studyIndexByStem = new Map(studyReadingList.map((e, i) => [e.material.stem, i]));

/** Vizinhos de um material na trilha de estudo (pro Anterior/Próximo do leitor). */
export function studyReadingEntry(stem: string): {
  entry?: StudyEntry;
  prev?: StudyEntry;
  next?: StudyEntry;
} {
  const i = studyIndexByStem.get(stem);
  if (i === undefined) return {};
  return { entry: studyReadingList[i], prev: studyReadingList[i - 1], next: studyReadingList[i + 1] };
}

export const totalMaterials = studyReadingList.length;
