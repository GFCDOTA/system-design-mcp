// Roadmap do curso "Complete Interview Preparation" (GenZ Career) — material
// COMPRADO pelo Felipe. Aqui vive só a ESTRUTURA (módulos por faixa de
// experiência e a ordem dos passos) + tracking local de progresso; o conteúdo
// (PDFs/anotações) fica no curso — este repo é público.
//
// Um passo é um CONTEÚDO canônico compartilhado: "Core Java — Level I" marcado
// como estudado conta em todos os módulos que o incluem.

export const courseUrl = "https://courses.genzcareer.org/complete-interview-prepration-id23242555de32f5/";

export interface CourseContent {
  label: string;
  optional?: boolean;
  /** Onde o app já cobre/treina este tema. */
  inApp?: { to: string; label: string };
}

export const contents: Record<string, CourseContent> = {
  "java-coding": { label: "Java Coding (questões de codificação)", inApp: { to: "/entrevista/dsa", label: "DSA" } },
  "stream-1": { label: "Stream API Coding — Level I", inApp: { to: "/entrevista/java", label: "Java Core · Streams" } },
  "stream-2": { label: "Stream API Coding — Level II", inApp: { to: "/entrevista/java", label: "Java Core · Streams" } },
  "core-java-1": { label: "Core Java — Level I", inApp: { to: "/entrevista/java", label: "Java Core" } },
  "core-java-2": { label: "Core Java — Level II", inApp: { to: "/entrevista/java", label: "Java Core" } },
  "core-java-3": { label: "Core Java — Level III", inApp: { to: "/entrevista/java", label: "Java Core" } },
  "core-java-4": { label: "Core Java — Level IV (Advance)", inApp: { to: "/entrevista/java", label: "Java Core" } },
  "core-java-5": { label: "Core Java — Level V (Expert)", inApp: { to: "/entrevista/java", label: "Java Core" } },
  "design-patterns": { label: "Java Design Patterns", inApp: { to: "/patterns", label: "Padrões" } },
  "spring-fw-1": { label: "Spring Framework — Level I" },
  "spring-fw-2": { label: "Spring Framework — Level II" },
  "spring-boot-1": { label: "Spring Boot — Level I" },
  "spring-boot-2": { label: "Spring Boot — Level II" },
  "spring-boot-3": { label: "Spring Boot — Level III (Scenario Based)" },
  "spring-boot-4": { label: "Spring Boot — Level IV (Advance)" },
  "spring-boot-5": { label: "Spring Boot — Level V (Expert)" },
  "spring-sec-1": { label: "Spring Security — Level I" },
  "spring-sec-2": { label: "Spring Security — Level II" },
  "spring-mvc-1": { label: "Spring MVC — Level I", optional: true },
  sql: { label: "SQL" },
  "spring-data-jpa": { label: "Spring Data JPA e outros bancos — Level I", inApp: { to: "/databases", label: "Bancos de Dados" } },
  kafka: { label: "Kafka", optional: true, inApp: { to: "/topics", label: "Tópicos · mensageria" } },
  "micro-1": { label: "Microservices — Level I", inApp: { to: "/topics", label: "Tópicos" } },
  "micro-2": { label: "Microservices — Level II", inApp: { to: "/topics", label: "Tópicos" } },
  "micro-patterns": { label: "Microservices Design Patterns", inApp: { to: "/patterns", label: "Padrões" } },
  "maven-git-1": { label: "Maven e Git — Level I" },
  "maven-git-2": { label: "Maven e Git (+ Gradle e Deployments) — Level II" },
  "junit-mockito": { label: "JUnit e Mockito" },
  "lead-questions": { label: "Perguntas não-técnicas de liderança" },
  "rev-sql": { label: "Revisão: SQL (PDF + anotações)" },
  "rev-spring": { label: "Revisão: Spring Framework e Spring Boot" },
  "rev-java": { label: "Revisão: Java (PDF + anotações)" },
};

export interface RoadmapModule {
  id: string;
  title: string;
  band: string;
  desc: string;
  /** Passos comuns (rodam em paralelo à trilha). */
  common: string[];
  /** Passos sequenciais (ids de `contents`). */
  steps: string[];
}

export const modules: RoadmapModule[] = [
  {
    id: "m0",
    title: "Módulo 0 — Revisão",
    band: "opcional",
    desc: "Materiais de referência pra quem já tem estrada e quer só revisar antes de atacar o módulo da sua faixa.",
    common: [],
    steps: ["rev-sql", "rev-spring", "rev-java"],
  },
  {
    id: "m1",
    title: "Módulo 1",
    band: "0–3 anos",
    desc: "A fundação: Core Java, Spring, SQL e o primeiro contato com microserviços.",
    common: ["java-coding", "stream-1"],
    steps: [
      "core-java-1",
      "core-java-2",
      "spring-fw-1",
      "spring-boot-1",
      "spring-mvc-1",
      "spring-data-jpa",
      "sql",
      "micro-1",
      "maven-git-1",
    ],
  },
  {
    id: "m2",
    title: "Módulo 2",
    band: "3–5 anos",
    desc: "Aprofunda Core Java (nível III), Spring Boot cenário-based, Security, Kafka e testes.",
    common: ["java-coding", "stream-1", "stream-2"],
    steps: [
      "core-java-1",
      "core-java-2",
      "core-java-3",
      "spring-fw-1",
      "spring-fw-2",
      "spring-boot-1",
      "spring-boot-2",
      "spring-boot-3",
      "spring-sec-1",
      "spring-mvc-1",
      "sql",
      "spring-data-jpa",
      "kafka",
      "micro-1",
      "maven-git-1",
      "maven-git-2",
      "junit-mockito",
    ],
  },
  {
    id: "m3",
    title: "Módulo 3",
    band: "5–8 anos",
    desc: "Entra o nível avançado: Core Java IV, Design Patterns, Spring Boot IV, Security II e padrões de microserviços.",
    common: ["java-coding", "stream-1", "stream-2"],
    steps: [
      "core-java-1",
      "core-java-2",
      "core-java-3",
      "core-java-4",
      "design-patterns",
      "spring-fw-1",
      "spring-fw-2",
      "spring-boot-1",
      "spring-boot-3",
      "spring-boot-4",
      "spring-sec-1",
      "spring-sec-2",
      "spring-mvc-1",
      "sql",
      "spring-data-jpa",
      "kafka",
      "micro-1",
      "micro-2",
      "micro-patterns",
      "maven-git-1",
      "maven-git-2",
      "junit-mockito",
    ],
  },
  {
    id: "m4",
    title: "Módulo 4",
    band: "8–15 anos",
    desc: "A trilha completa até o nível expert: Core Java V, Spring Boot V e perguntas de liderança.",
    common: ["java-coding", "stream-1", "stream-2"],
    steps: [
      "core-java-1",
      "core-java-2",
      "core-java-3",
      "core-java-4",
      "core-java-5",
      "design-patterns",
      "spring-fw-1",
      "spring-fw-2",
      "spring-boot-1",
      "spring-boot-2",
      "spring-boot-3",
      "spring-boot-4",
      "spring-boot-5",
      "spring-sec-1",
      "spring-sec-2",
      "spring-mvc-1",
      "sql",
      "spring-data-jpa",
      "kafka",
      "micro-1",
      "micro-2",
      "micro-patterns",
      "maven-git-1",
      "maven-git-2",
      "junit-mockito",
      "lead-questions",
    ],
  },
];
