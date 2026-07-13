// Guia de Currículo & ATS — conteúdo autoral (boas práticas conhecidas de
// currículo pra passar em Applicant Tracking Systems), no mesmo formato dos
// pilares de prep (PrepPillar). Guia curado, não afirmação factual da KB.

import type { PrepPillar } from "./interviewPrep";

/** Estrutura recomendada de currículo (ordem das seções). */
export const resumeStructure: { section: string; hint: string }[] = [
  { section: "Cabeçalho", hint: "Nome + e-mail, telefone, LinkedIn e GitHub — tudo em TEXTO (nunca dentro de imagem)." },
  { section: "Work Experience", hint: "Ordem cronológica inversa: empresa, cargo, datas e 3–5 bullets de impacto." },
  { section: "Projects", hint: "Ótimo pra dev: o que construiu, a stack e o resultado. Mostra prática real." },
  { section: "Skills", hint: "Agrupadas: Front-end / Back-end / Tools. Só o que você sustenta numa entrevista." },
  { section: "Education", hint: "Curso, instituição e período. GPA opcional." },
  { section: "Certifications", hint: "Certificações relevantes (ex.: AWS, Azure). Nome exato + emissor." },
];

export const atsGuide: PrepPillar = {
  intro:
    "**ATS (Applicant Tracking System)** é o software que filtra currículos ANTES de um humano ler. Um currículo bonito com colunas, tabelas e ícones pode ser ilegível pro ATS e ser descartado sem ninguém ver. A meta é dupla: um layout **simples que o ATS parseia perfeitamente** E que impressiona o recrutador depois. Este guia é o caminho pra isso.",
  blocks: [
    {
      title: "Regras de formatação (o que o ATS exige)",
      kind: "checklist",
      note: "A causa nº1 de currículo descartado por ATS é layout — não conteúdo. Simples ganha.",
      items: [
        "**Uma coluna só.** Sem tabelas, caixas de texto ou layout em 2 colunas — o parser embaralha a ordem e mistura as informações.",
        "**Nada de gráficos, ícones, fotos ou logos.** Viram lixo no parse. Barras de 'nível de skill' então, nunca.",
        "**Fonte padrão, 10–12pt:** Arial, Calibri ou Times New Roman. Fonte exótica pode não ser reconhecida.",
        "**Títulos de seção óbvios e padrão:** `Work Experience`, `Education`, `Skills`, `Projects`. Nada de 'Minha jornada' — o ATS não sabe o que é isso.",
        "**Contato no CORPO do documento**, não no header/footer do Word — muitos ATS ignoram header/footer.",
        "**Salve como PDF baseado em texto** (ou .docx). Nunca um PDF que é imagem/scan — o ATS não lê texto de imagem.",
        "**Datas consistentes** (ex.: `Jan 2020 – Present`, sempre no mesmo formato).",
        "**Sem texto dentro de imagem.** Seu nome, e-mail e cargos precisam ser texto selecionável.",
      ],
    },
    {
      title: "Bullets que passam E impressionam",
      kind: "steps",
      note: "A fórmula: verbo de ação + o que você fez + a tecnologia + o impacto quantificado.",
      items: [
        "**Comece com verbo forte:** Led, Built, Designed, Implemented, Reduced, Automated. Evita 'Responsible for' (fraco e passivo).",
        "**Diga a tecnologia** de forma concreta: 'using React and Node.js', 'with Jenkins and Docker'. É o que o ATS casa como keyword E o que o recrutador procura.",
        "**Quantifique SEMPRE:** %, tempo, escala, dinheiro. `increasing user engagement by 30%`, `reducing deployment time by 50%`. Número vale mais que adjetivo.",
        "**Foco em impacto, não tarefa.** 'Cortei o tempo de deploy em 50% com pipeline CI/CD' > 'Trabalhei com CI/CD'.",
        "**3–5 bullets por cargo.** Mais que isso dilui; menos parece raso. Os melhores primeiro.",
        "**Exemplo completo:** *'Led a team of 5 engineers to build a scalable e-commerce platform using React and Node.js, increasing user engagement by 30%.'* — verbo + escala + stack + resultado.",
      ],
    },
    {
      title: "Palavras-chave & tailoring (a parte que ranqueia)",
      kind: "tips",
      note: "O ATS ranqueia seu currículo pelo MATCH de palavras-chave com a descrição da vaga. Genérico perde pra específico.",
      items: [
        "**Leia a vaga e extraia os termos** (skills, tecnologias, responsabilidades). Inclua os que você tem de verdade, com as MESMAS palavras que a vaga usou.",
        "**Não encha de keyword falsa.** Passar o ATS com termo que você não domina só adianta a reprovação na entrevista técnica.",
        "**Sigla + extenso na 1ª vez:** `CI/CD (Continuous Integration/Deployment)`, `REST (RESTful) APIs` — cobre as duas formas que o ATS pode procurar.",
        "**Espelhe o título do cargo** quando fizer sentido (se a vaga é 'Backend Engineer' e você é 'Software Engineer' focado em backend, o alinhamento ajuda).",
        "**Adapte por vaga.** O mesmo currículo pra 20 vagas ranqueia mal. Ajustar skills/keywords por vaga é o que mais move o ponteiro.",
      ],
    },
    {
      title: "Erros que derrubam no ATS",
      kind: "tips",
      items: [
        "**Layout em colunas/tabelas** — a causa mais comum de parse embaralhado.",
        "**Info crítica no header/footer** do Word — some no parse.",
        "**PDF escaneado ou exportado como imagem** — zero texto legível.",
        "**Títulos de seção criativos** que o ATS não mapeia pra 'experiência', 'formação' etc.",
        "**Datas ausentes ou inconsistentes** — confunde o cálculo de tempo de experiência.",
        "**Fonte < 10pt ou decorativa**, e excesso de negrito/itálico que atrapalha o parser.",
      ],
    },
    {
      title: "Sobre o tal 'ATS score'",
      kind: "tips",
      note: "Enquadramento honesto pra você não perseguir um número mágico.",
      items: [
        "**Não existe score universal.** Cada checker e cada empresa usa critérios diferentes — '92' num site não é '92' no ATS real da empresa.",
        "**Use checkers como sanidade**, não como verdade: eles são bons pra pegar problema de PARSE (o texto saiu legível?) e falta de KEYWORD, não pra prever aprovação.",
        "**O que sempre ajuda**, independente do checker: layout simples, keywords reais da vaga, e impacto quantificado. Foque nisso, não no número.",
      ],
    },
    {
      title: "Currículo passou — e agora?",
      kind: "tips",
      note: "O currículo abre a porta; a entrevista é quem decide. Um puxa o outro.",
      items: [
        "**Cada bullet do seu currículo é uma pergunta em potencial.** Se escreveu 'Kafka', esteja pronto pra explicar uma decisão difícil que tomou com ele.",
        "**Prepare as histórias** dos seus projetos no formato STAR (situação, tarefa, ação, resultado) — está tudo em Comportamental no Modo Entrevista.",
        "**Estude o técnico** pelas trilhas do Modo Estudos e treine as respostas no Modo Entrevista. Chegar treinado é o que converte a entrevista que o currículo conquistou.",
      ],
    },
  ],
  resources: [],
};
