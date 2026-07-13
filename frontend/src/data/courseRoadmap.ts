// Roadmap do curso "Complete Interview Preparation" (GenZ Career) — material
// COMPRADO pelo Felipe. Aqui vive só a ESTRUTURA (módulos por faixa de
// experiência e a ordem dos passos) + tracking local de progresso; o conteúdo
// (PDFs/anotações) fica no curso — este repo é público.
//
// Um passo é um CONTEÚDO canônico compartilhado: "Core Java — Level I" marcado
// como estudado conta em todos os módulos que o incluem.

export const courseUrl = "https://courses.genzcareer.org/complete-interview-prepration-id23242555de32f5/";

/** Base local dos PDFs baixados (frontend/public/course/ — gitignored, só nesta máquina). */
export const coursePdfBase = "/course/";

/** Guia bônus de orientação (currículo etc.). */
export const bonusGuidePdf = "Complete-Guidance.pdf";

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
  /**
   * PDF(s) locais DESTE módulo por passo — cada módulo tem a própria versão
   * do material (só o de SQL é idêntico entre módulos). Nomes de arquivo em
   * `coursePdfBase`; o conteúdo fica fora do git.
   */
  files: Record<string, string[]>;
}

export const modules: RoadmapModule[] = [
  {
    id: "m0",
    title: "Módulo 0 — Revisão",
    band: "opcional",
    desc: "Materiais de referência pra quem já tem estrada e quer só revisar antes de atacar o módulo da sua faixa.",
    common: [],
    steps: ["rev-sql", "rev-spring", "rev-java"],
    files: {
      "rev-sql": ["SQL-PDF-Notes.pdf", "SQL-Hand-written-notes.pdf"],
      "rev-spring": ["Spring-Framework-Notes.pdf", "Spring-Boot-PDF-Notes.pdf", "Spring-ALL-Hand-written-notes.pdf"],
      "rev-java": ["Java-PDF-Notes.pdf", "Java-Hand-written-notes.pdf"],
    },
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
    files: {
      "java-coding": ["Common-Step-Java-Coding-Questions.pdf"],
      "stream-1": ["Common-Step-Stream-API-Coding-Questions-Level-I.pdf"],
      "core-java-1": ["Step-1-Core-Java-Level-I.pdf"],
      "core-java-2": ["Step-2-Core-Java-Level-II.pdf"],
      "spring-fw-1": ["Step-3-Spring-Framework-Level-I.pdf"],
      "spring-boot-1": ["Step-4-Spring-Boot-Level-I.pdf"],
      "spring-mvc-1": ["Step-5-Spring-MVC-Level-I-Optional.pdf"],
      "spring-data-jpa": ["Step-6-Spring-Data-JPA-and-Other-DB-Level-I.pdf"],
      sql: ["Step-7-SQL.pdf"],
      "micro-1": ["Step-8-Microservices-Level-I.pdf"],
      "maven-git-1": ["Step-9-Maven-and-Git-Level-I.pdf"],
    },
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
    files: {
      "java-coding": ["Common-Step-Java-Coding.pdf"],
      "stream-1": ["Common-Step-Stream-API-Coding-Level-I.pdf"],
      "stream-2": ["Common-Step-Stream-API-Coding-Level-II.pdf"],
      "core-java-1": ["Step-1-Core-Java-Level-I-1.pdf"],
      "core-java-2": ["Step-2-Core-Java-Level-II-1.pdf"],
      "core-java-3": ["Step-3-Core-Java-Level-III.pdf"],
      "spring-fw-1": ["Step-4-Spring-Framework-Level-I.pdf"],
      "spring-fw-2": ["Step-5-Spring-framework-Level-II.pdf"],
      "spring-boot-1": ["Step-6-Spring-Boot-Level-I.pdf"],
      "spring-boot-2": ["Step-7-Spring-Boot-Level-II.pdf"],
      "spring-boot-3": ["Step-8-Spring-Boot-Level-III-Scenario-Based.pdf"],
      "spring-sec-1": ["Step-9-Spring-Security-Level-I.pdf"],
      "spring-mvc-1": ["Step-10-Spring-MVC-Level-I-Optional.pdf"],
      sql: ["Step-11-SQL.pdf"],
      "spring-data-jpa": ["Step-12-Spring-Data-JPA-and-Other-DB-Level-I.pdf"],
      kafka: ["Step-13-Kafka-Optional.pdf"],
      "micro-1": ["Step-14-Microservices-Level-I.pdf"],
      "maven-git-1": ["Step-15-Maven-and-Git-Level-I.pdf"],
      "maven-git-2": ["Step-16-Maven-and-Git-Gradle-and-Deployments-Level-II.pdf"],
      "junit-mockito": ["Step-17-Junit-and-Mockito.pdf"],
    },
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
    files: {
      "java-coding": ["Common-Step-Java-Coding-1.pdf"],
      "stream-1": ["Common-Step-Stream-API-Coding-Level-I-1.pdf"],
      "stream-2": ["Common-Step-Stream-API-Coding-Level-II-1.pdf"],
      "core-java-1": ["Step-1-Core-Java-Level-I-2.pdf"],
      "core-java-2": ["Step-2-Core-Java-Level-II-2.pdf"],
      "core-java-3": ["Step-3-Core-Java-Level-III-1.pdf"],
      "core-java-4": ["Step-4-Core-Java-Level-IV-Advance-Level.pdf"],
      "design-patterns": ["Step-5-Java-Design-Patterns.pdf"],
      "spring-fw-1": ["Step-6-Spring-Framework-Level-I.pdf"],
      "spring-fw-2": ["Step-7-Spring-framework-Level-II.pdf"],
      "spring-boot-1": ["Step-8-Spring-Boot-Level-I.pdf"],
      "spring-boot-3": ["Step-10-Spring-Boot-Level-III-Scenario-Based.pdf"],
      "spring-boot-4": ["Step-11-Spring-Boot-level-IV-Advance.pdf"],
      "spring-sec-1": ["Step-12-Spring-Security-Level-I.pdf"],
      "spring-sec-2": ["Step-9-Spring-Security-Level-II.pdf", "Step-13-Spring-Security-Level-II.pdf"],
      "spring-mvc-1": ["Step-14-Spring-MVC-Level-I-Optional.pdf"],
      sql: ["Step-15-SQL.pdf"],
      "spring-data-jpa": ["Step-16-Spring-Data-JPA-and-Other-DB-Level-I.pdf"],
      kafka: ["Step-17-Kafka-Optional.pdf"],
      "micro-1": ["Step-18-Microservices-Level-I.pdf"],
      "micro-2": ["Step-19-Microservices-Level-II.pdf"],
      "micro-patterns": ["Step-20-Microservices-Design-Patterns.pdf"],
      "maven-git-1": ["Step-21-Maven-and-Git-Level-I.pdf"],
      "maven-git-2": ["Step-22-Maven-and-Git-Gradle-and-Deployments-Level-II.pdf"],
      "junit-mockito": ["Step-23-Junit-and-Mockito.pdf"],
    },
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
    files: {
      "java-coding": ["Common-Step-Java-Coding-2.pdf"],
      "stream-1": ["Common-Step-Stream-API-Coding-Level-I-2.pdf"],
      "stream-2": ["Common-Step-Stream-API-Coding-Level-II-1.pdf"],
      "core-java-1": ["Step-1-Core-Java-Level-I-2.pdf"],
      "core-java-2": ["Step-2-Core-Java-Level-II-2.pdf"],
      "core-java-3": ["Step-3-Core-Java-Level-III-1.pdf"],
      "core-java-4": ["Step-4-Core-Java-Level-IV-Advance-Level.pdf"],
      "core-java-5": ["Step-5-Core-Java-Level-V-Expert.pdf"],
      "design-patterns": ["Step-6-Java-Design-Patterns.pdf"],
      "spring-fw-1": ["Step-7-Spring-Framework-Level-I.pdf"],
      "spring-fw-2": ["Step-8-Spring-framework-Level-II.pdf"],
      "spring-boot-1": ["Step-9-Spring-Boot-Level-I.pdf"],
      "spring-boot-2": ["Step-10-Spring-Boot-Level-II.pdf"],
      "spring-boot-3": ["Step-11-Spring-Boot-Level-III-Scenario-Based.pdf"],
      "spring-boot-4": ["Step-12-Spring-Boot-level-IV-Advance.pdf"],
      "spring-boot-5": ["Step-13-Spring-Boot-Level-V-Expert.pdf"],
      "spring-sec-1": ["Step-14-Spring-Security-Level-I.pdf"],
      "spring-sec-2": ["Step-15-Spring-Security-Level-II.pdf"],
      "spring-mvc-1": ["Step-16-Spring-MVC-Level-I-Optional.pdf"],
      sql: ["Step-17-SQL.pdf"],
      "spring-data-jpa": ["Step-18-Spring-Data-JPA-and-Other-DB-Level-I.pdf"],
      kafka: ["Step-19-Kafka-Optional.pdf"],
      "micro-1": ["Step-20-Microservices-Level-I.pdf"],
      "micro-2": ["Step-21-Microservices-Level-II.pdf"],
      "micro-patterns": ["Step-22-Microservices-Design-Patterns.pdf"],
      "maven-git-1": ["Step-23-Maven-and-Git-Level-I.pdf"],
      "maven-git-2": ["Step-24-Maven-and-Git-Gradle-and-Deployments-Level-II.pdf"],
      "junit-mockito": ["Step-25-Junit-and-Mockito.pdf"],
      "lead-questions": ["Step-26-Non-Techincal-Lead-level-Questions.pdf"],
    },
  },
];
