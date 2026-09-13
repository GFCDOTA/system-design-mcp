// Quiz DETERMINÍSTICO derivado dos failure modes e drills da KB (sem LLM, sem conteúdo novo):
// - identify: cenário + sintomas → qual failure mode? (distratores preferem os 'confusedWith')
// - worsen: qual ação PIORARIA o incidente? (anti-pattern vs mitigações reais)
// - signal: qual sinal costuma mexer primeiro? (firstSignal vs de outros failure modes)
// - open: pergunta de entrevista com resposta escondida
// - chain: ordenar a cadeia de falha (jogo)
// A mesma seed gera o mesmo quiz — testável e reprodutível.

/** PRNG pequeno e determinístico (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const short = (t) => t.split(" (")[0];

function pickDistractors(fm, all, n, random) {
  const byId = new Map(all.map((f) => [f.id, f]));
  const preferred = (fm.confusedWith ?? []).map((c) => byId.get(c.id)).filter(Boolean);
  const others = shuffle(all.filter((f) => f.id !== fm.id && !preferred.includes(f)), random);
  return [...shuffle(preferred, random), ...others].slice(0, n);
}

export function identifyQuestion(fm, all, random) {
  const options = shuffle([fm, ...pickDistractors(fm, all, 3, random)], random).map((f) => ({ id: f.id, label: short(f.title) }));
  return {
    type: "identify",
    fmId: fm.id,
    prompt: `${fm.productionScenario.trigger} Sintomas: ${fm.symptoms.system.slice(0, 2).join(" ")} O que está acontecendo?`,
    options,
    answer: fm.id,
    explanation: fm.summary,
  };
}

export function worsenQuestion(fm, random) {
  const bad = fm.antiPatterns[Math.floor(random() * fm.antiPatterns.length)];
  const good = shuffle([...fm.immediateMitigation, ...fm.longTermSolutions], random).slice(0, 3);
  const options = shuffle(
    [{ id: "bad", label: bad.dont }, ...good.map((m, i) => ({ id: `good-${i}`, label: m.action }))],
    random,
  );
  return {
    type: "worsen",
    fmId: fm.id,
    prompt: `Incidente de ${short(fm.title)}. Qual destas ações PIORARIA a situação?`,
    options,
    answer: "bad",
    explanation: bad.why,
  };
}

export function signalQuestion(fm, all, random) {
  const distractors = pickDistractors(fm, all, 3, random);
  const options = shuffle(
    [{ id: fm.id, label: fm.diagnosis.firstSignal }, ...distractors.map((f) => ({ id: f.id, label: f.diagnosis.firstSignal }))],
    random,
  );
  return {
    type: "signal",
    fmId: fm.id,
    prompt: `Suspeita de ${short(fm.title)}. Qual sinal costuma mexer PRIMEIRO?`,
    options,
    answer: fm.id,
    explanation: fm.diagnosis.causeVsSymptom,
  };
}

export function openQuestion(fm) {
  return { type: "open", fmId: fm.id, prompt: fm.interview.question, answer: fm.interview.shortAnswer, explanation: fm.interview.strongAnswer };
}

/** Jogo de cadeia: passos embaralhados (garante ordem diferente da original quando possível). */
export function chainGame(fm, random) {
  const steps = fm.failureChain.map((s) => s.step);
  let shuffled = shuffle(steps, random);
  for (let tries = 0; tries < 5 && steps.length > 1 && shuffled.every((s, i) => s === steps[i]); tries++) {
    shuffled = shuffle(steps, random);
  }
  return { type: "chain", fmId: fm.id, prompt: `Ordene a cadeia de falha de ${short(fm.title)}.`, steps: shuffled, answer: steps };
}

export function isCorrectOrder(game, attempt) {
  return attempt.length === game.answer.length && attempt.every((s, i) => s === game.answer[i]);
}

/** Monta um quiz de `count` questões alternando tipos entre failure modes, com seed. */
export function buildQuiz(fms, { seed = 1, count = 8, types = ["identify", "worsen", "signal", "open"] } = {}) {
  const random = rng(seed);
  const order = shuffle(fms, random);
  const out = [];
  for (let i = 0; i < count && order.length; i++) {
    const fm = order[i % order.length];
    const type = types[i % types.length];
    if (type === "identify") out.push(identifyQuestion(fm, fms, random));
    else if (type === "worsen") out.push(worsenQuestion(fm, random));
    else if (type === "signal") out.push(signalQuestion(fm, fms, random));
    else out.push(openQuestion(fm));
  }
  return out;
}
