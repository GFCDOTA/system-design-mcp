// Validador de currículo / ATS — motor DETERMINÍSTICO (sem LLM, roda no browser).
// Recebe o texto colado de um currículo e devolve um score por categoria + os
// problemas encontrados com o conserto de cada um. É uma HEURÍSTICA transparente
// (o peso de cada critério é explícito), não o ATS exato de nenhuma empresa.
//
// JS puro (ESM) pra ser importável pelo app (Vite) E pelo teste (node --test).
// Tipos em atsValidator.d.ts.

const WEAK_OPENERS = /^(responsible for|worked on|helped|assisted|involved in|duties includ|participated in)\b/i;
const BULLET_RE = /^\s*([•\-*‣·▪◦]|•)\s+/;

/** Verbos de ação fortes conhecidos (pra distinguir de aberturas fracas). */
const STRONG_VERBS = new Set(
  [
    "led", "directed", "coordinated", "mentored", "spearheaded", "drove", "owned", "oversaw",
    "built", "developed", "engineered", "implemented", "created", "programmed", "shipped", "prototyped",
    "designed", "architected", "modeled", "structured", "defined", "standardized",
    "improved", "optimized", "refactored", "streamlined", "enhanced", "accelerated", "hardened",
    "reduced", "cut", "decreased", "eliminated", "minimized", "consolidated",
    "increased", "boosted", "grew", "scaled", "doubled", "maximized",
    "delivered", "launched", "deployed", "released", "automated", "integrated", "migrated",
    "collaborated", "partnered", "facilitated", "aligned", "championed", "advocated",
    "analyzed", "researched", "tested", "debugged", "maintained", "configured", "managed",
  ].map((v) => v.toLowerCase()),
);

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/** @param {string} text */
function extractBullets(text) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => BULLET_RE.test(l))
    .map((l) => l.replace(BULLET_RE, "").trim())
    .filter(Boolean);
}

/** Primeira palavra (verbo) de um bullet, minúscula, só letras. */
function firstVerb(bullet) {
  const m = bullet.match(/^([A-Za-z]+)/);
  return m ? m[1].toLowerCase() : "";
}

/** @param {string} text */
function detectSections(text) {
  const has = (re) => re.test(text);
  return {
    experience: has(/\b(work experience|professional experience|experience|employment)\b/i),
    education: has(/\beducation\b/i),
    skills: has(/\bskills?\b/i),
    projects: has(/\bprojects?\b/i),
    certifications: has(/\b(certification|certificate|certified)\b/i),
    awards: has(/\b(award|honou?r|achievement)\b/i),
    languages: has(/\blanguages?\b/i),
  };
}

/** @param {string} text */
function detectContact(text) {
  return {
    email: /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text),
    phone: /(\+?\d[\d\s().-]{7,}\d)/.test(text),
    linkedin: /linkedin\.com|linkedin\b/i.test(text),
    github: /github\.com|github\b/i.test(text),
  };
}

/**
 * Formatos de data presentes, classificados pelo INÍCIO de cada intervalo
 * (uma linha "Jan 2021 - Present" é UM formato só, não dois).
 */
function dateFormats(text) {
  const YEAR = "(?:19|20)\\d{2}"; // ano plausível — evita ler telefone como data
  const START = `([A-Za-z]{3,9}\\.?[ \\t]+${YEAR}|\\d{1,2}\\/${YEAR}|${YEAR})`;
  // present/current ANTES de "letras+ano" pra não engolir o começo do próximo range
  const END = `(present|current|[A-Za-z]{3,9}\\.?[ \\t]+${YEAR}|\\d{1,2}\\/${YEAR}|${YEAR})`;
  const re = new RegExp(`${START}[ \\t]*(?:[-–—]|to)[ \\t]*${END}`, "i");
  const fmts = new Set();
  // linha a linha: intervalos de data vivem na própria linha (evita cruzar \n)
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(re);
    if (!m) continue;
    const s = m[1];
    if (/^[A-Za-z]/.test(s)) fmts.add("Mon YYYY");
    else if (s.includes("/")) fmts.add("MM/YYYY");
    else fmts.add("YYYY");
  }
  return [...fmts];
}

/** Bullet de LISTA ("Front-end: HTML, CSS…") — não é bullet de impacto. */
function isListLabel(b) {
  return /^[\w][\w &/+-]{0,24}:/.test(b);
}

/**
 * Analisa o texto de um currículo.
 * @param {string} text
 * @returns {import("./atsValidator").AtsReport}
 */
export function analyzeResume(text) {
  const clean = (text || "").replace(/ /g, " ");
  const words = (clean.match(/\b[\w'-]+\b/g) || []).length;
  const bullets = extractBullets(clean);
  const sections = detectSections(clean);
  const contact = detectContact(clean);

  // só bullets de IMPACTO contam pra verbo/quantificação (exclui listas de skills)
  const impactBullets = bullets.filter((b) => !isListLabel(b));

  // verbos de ação e repetições
  const verbCounts = {};
  for (const b of impactBullets) {
    const v = firstVerb(b);
    if (v && STRONG_VERBS.has(v)) verbCounts[v] = (verbCounts[v] || 0) + 1;
  }
  const repeatedVerbs = Object.entries(verbCounts)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([verb, count]) => ({ verb, count }));

  const weakOpeners = impactBullets.filter((b) => WEAK_OPENERS.test(b));
  const quantified = impactBullets.filter((b) => /\d/.test(b));
  const quantifiedPct = impactBullets.length ? Math.round((quantified.length / impactBullets.length) * 100) : 0;
  const fmts = dateFormats(clean);
  const datesConsistent = fmts.length <= 1;

  // ---------- SCORE por categoria (pesos explícitos, total 100) ----------
  const cat = [];

  // Contato (10)
  {
    let s = 0;
    const notes = [];
    if (contact.email) s += 3;
    else notes.push("sem e-mail");
    if (contact.phone) s += 2;
    else notes.push("sem telefone");
    if (contact.linkedin) s += 3;
    else notes.push("sem LinkedIn");
    if (contact.github) s += 2;
    else notes.push("sem GitHub");
    cat.push({ key: "contato", label: "Contato", score: s, max: 10, notes });
  }

  // Experience (35)
  {
    let s = 0;
    const notes = [];
    if (sections.experience) s += 5;
    else notes.push("seção de experiência não detectada");
    const qPart = Math.round((quantifiedPct / 100) * 15);
    s += qPart;
    if (quantifiedPct < 60) notes.push(`só ${quantifiedPct}% dos bullets têm número`);
    let verbPart = 8 - weakOpeners.length * 2;
    verbPart = clamp(verbPart, 0, 8);
    s += verbPart;
    if (weakOpeners.length) notes.push(`${weakOpeners.length} bullet(s) com abertura fraca`);
    const inRange = bullets.length >= 6 && bullets.length <= 28;
    if (inRange) s += 7;
    else notes.push(`${bullets.length} bullets no total (ideal ~12–28)`);
    cat.push({ key: "experience", label: "Experience", score: clamp(s, 0, 35), max: 35, notes });
  }

  // Projects (20)
  {
    let s = 0;
    const notes = [];
    if (sections.projects) s += 12;
    else notes.push("seção de projetos não detectada");
    if (sections.projects && quantified.length >= 2) s += 8;
    else if (sections.projects) notes.push("projetos sem impacto quantificado");
    cat.push({ key: "projects", label: "Projects", score: clamp(s, 0, 20), max: 20, notes });
  }

  // Skills (5)
  {
    const s = sections.skills ? 5 : 0;
    cat.push({ key: "skills", label: "Skills", score: s, max: 5, notes: sections.skills ? [] : ["sem seção de skills"] });
  }

  // Education (5)
  {
    const s = sections.education ? 5 : 0;
    cat.push({ key: "education", label: "Education", score: s, max: 5, notes: sections.education ? [] : ["sem seção de formação"] });
  }

  // Miscellaneous (25): word count, bullets, verbos repetidos, datas, extras
  {
    let s = 0;
    const notes = [];
    // word count ideal 400–850
    if (words >= 400 && words <= 850) s += 6;
    else {
      s += 3;
      notes.push(words < 400 ? `poucas palavras (${words}, ideal 400–850)` : `muitas palavras (${words}, ideal 400–850)`);
    }
    // bullets 12–30
    if (bullets.length >= 12 && bullets.length <= 30) s += 5;
    else {
      s += 2;
      notes.push(`${bullets.length} bullets (ideal 12–30)`);
    }
    // verbos repetidos: -2 por verbo repetido, base 6
    let vPart = 6 - repeatedVerbs.length * 2;
    vPart = clamp(vPart, 0, 6);
    s += vPart;
    if (repeatedVerbs.length) notes.push(`verbos repetidos: ${repeatedVerbs.map((r) => `${r.verb}×${r.count}`).join(", ")}`);
    // datas
    if (datesConsistent) s += 4;
    else notes.push(`formatos de data misturados: ${fmts.join(", ")}`);
    // extras
    const extras = [sections.certifications, sections.awards, sections.languages].filter(Boolean).length;
    s += clamp(extras * 2, 0, 4);
    if (extras === 0) notes.push("sem seções extras (certificações / prêmios / idiomas)");
    cat.push({ key: "misc", label: "Miscellaneous", score: clamp(s, 0, 25), max: 25, notes });
  }

  const overall = cat.reduce((n, c) => n + c.score, 0);

  // ---------- ISSUES priorizados (por peso do conserto) ----------
  const issues = [];
  const push = (severity, title, detail, fix) => issues.push({ severity, title, detail, fix });

  if (!datesConsistent)
    push("high", "Datas inconsistentes", `Formatos misturados: ${fmts.join(", ")}.`, "Padronize tudo em 'Jan 2020 - Dec 2021' / 'Jun 2019 - Present'.");
  if (repeatedVerbs.length)
    push("high", "Verbos de ação repetidos", repeatedVerbs.map((r) => `${r.verb} ×${r.count}`).join(", "), "Troque as repetições por sinônimos (veja o Banco de verbos no guia).");
  if (quantifiedPct < 70 && bullets.length)
    push("high", "Bullets sem número", `${quantifiedPct}% dos bullets têm impacto quantificado.`, "Toda linha precisa de %/tempo/escala. Ex.: 'reduzi o deploy em 50%'.");
  if (weakOpeners.length)
    push("medium", "Aberturas fracas", `${weakOpeners.length} bullet(s) começam com termos passivos.`, "Comece com verbo forte (Led, Built, Reduced), nunca 'Responsible for'.");
  for (const [key, label, extra] of [
    ["experience", "Experience", "Adicione a seção de experiência profissional."],
    ["projects", "Projects", "Adicione uma seção de projetos com stack + resultado."],
    ["skills", "Skills", "Adicione Skills agrupadas (Front-end / Back-end / Tools)."],
    ["education", "Education", "Adicione a formação (curso, instituição, período)."],
  ]) {
    if (!sections[key]) push("medium", `Seção faltando: ${label}`, "Não detectada no texto.", extra);
  }
  if (!contact.email || !contact.phone || !contact.linkedin || !contact.github) {
    const missing = [
      !contact.email && "e-mail",
      !contact.phone && "telefone",
      !contact.linkedin && "LinkedIn",
      !contact.github && "GitHub",
    ].filter(Boolean);
    push("low", "Contato incompleto", `Faltando: ${missing.join(", ")}.`, "Inclua tudo em TEXTO no topo (não dentro de imagem).");
  }
  if (words > 850) push("low", "Currículo longo", `${words} palavras.`, "Enxugue para 1–2 páginas; corte bullets fracos.");
  if (!sections.certifications && !sections.awards && !sections.languages)
    push("low", "Sem seções extras", "Nada de certificações / prêmios / idiomas.", "Adicione se tiver — completa o currículo e ajuda o recrutador.");

  const order = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    overall,
    categories: cat,
    stats: {
      words,
      bullets: bullets.length,
      quantifiedBullets: quantified.length,
      quantifiedPct,
      repeatedVerbs,
      weakOpeners: weakOpeners.length,
      dateFormats: fmts,
      datesConsistent,
    },
    issues,
  };
}
