// Testes do motor de validação de ATS (determinístico, sem browser).
// Roda: npm test (node --test). Cobre score, contagens e detecção de problemas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeResume } from "../src/data/atsValidator.js";

const GOOD = `João Silva
joao@email.com | +55 11 90000-0000 | linkedin.com/in/joao | github.com/joao

WORK EXPERIENCE
Empresa — Senior Engineer
Jan 2021 - Present
• Led a team of 5 to build a platform in React, increasing engagement by 30%.
• Automated CI/CD with Docker, reducing deployment time by 50%.
• Optimized queries, cutting load time by 40%.
• Delivered 12 features, boosting revenue by 15%.
• Migrated services to AWS, improving uptime to 99.9%.
• Refactored the auth module, reducing incidents by 25%.
• Scaled the API to 3,000 req/s, handling 20% more traffic.
• Mentored 3 juniors, shortening onboarding by 30%.
• Integrated payments, growing checkout conversion by 10%.
• Designed a caching layer, decreasing DB cost by 35%.
• Standardized tests, raising coverage to 85%.
• Championed code review, cutting review time by 20%.
• Debugged a memory leak, improving stability by 40%.
• Deployed monitoring, reducing MTTR by 50%.

PROJECTS
App
• Constructed a booking app in Node, handling 2,000 users per month.
• Hosted on AWS with 99.9% uptime across 3 regions.

SKILLS
• Back-end: Node.js, Express.js, REST.

EDUCATION
USP — BSc Computer Science
Feb 2014 - Dec 2017

CERTIFICATIONS
• AWS Certified Solutions Architect
`;

const BAD = `Amit Sharma
WORK EXPERIENCE
Company - Engineer
Jan 2020 - Present
• Responsible for the e-commerce platform.
• Designed a payment flow.
• Designed the reporting module.
• Worked on CI/CD pipelines.
2019 - 2020
• Built features.
`;

test("currículo bom pontua alto e sem problemas high", () => {
  const r = analyzeResume(GOOD);
  assert.ok(r.overall >= 85, `esperava >=85, veio ${r.overall}`);
  assert.equal(r.stats.datesConsistent, true);
  assert.equal(r.stats.repeatedVerbs.length, 0, "não deveria ter verbo repetido");
  const highs = r.issues.filter((i) => i.severity === "high");
  assert.equal(highs.length, 0, `não deveria ter issue high: ${JSON.stringify(highs)}`);
});

test("currículo ruim pontua baixo e acha os problemas certos", () => {
  const r = analyzeResume(BAD);
  assert.ok(r.overall < 65, `esperava <65, veio ${r.overall}`);
  // datas misturadas (Mon YYYY + YYYY-YYYY)
  assert.equal(r.stats.datesConsistent, false);
  assert.ok(r.issues.some((i) => i.title.includes("Datas")), "deveria flagar datas");
  // 'designed' repetido ×2
  const dup = r.stats.repeatedVerbs.find((v) => v.verb === "designed");
  assert.ok(dup && dup.count === 2, "deveria pegar designed ×2");
  // aberturas fracas: 'Responsible for' e 'Worked on'
  assert.ok(r.stats.weakOpeners >= 2, `esperava >=2 aberturas fracas, veio ${r.stats.weakOpeners}`);
  // faltam seções
  assert.ok(r.issues.some((i) => i.title.includes("Skills")), "deveria flagar Skills faltando");
});

test("contagem de bullets e quantificação", () => {
  const r = analyzeResume(GOOD);
  assert.ok(r.stats.bullets >= 15, `bullets: ${r.stats.bullets}`);
  assert.ok(r.stats.quantifiedPct >= 90, `quantificados: ${r.stats.quantifiedPct}%`);
});

test("categorias somam o overall e respeitam o max", () => {
  const r = analyzeResume(GOOD);
  const sum = r.categories.reduce((n, c) => n + c.score, 0);
  assert.equal(sum, r.overall);
  for (const c of r.categories) assert.ok(c.score <= c.max, `${c.label} passou do max`);
});

test("texto vazio não quebra", () => {
  const r = analyzeResume("");
  assert.equal(typeof r.overall, "number");
  assert.ok(r.issues.length > 0);
});
