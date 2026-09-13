// Busca determinística da knowledge base — a MESMA implementação no MCP e no frontend.
// Sem embeddings, sem rede, sem LLM: normalização + sinônimos curados + prefixo + pesos por campo.
//
// Por que não o "conta ocorrências no JSON inteiro" de antes: a pergunta real de quem estuda (ou de
// um agente) é pelo SINTOMA — "cliente cobrado duas vezes", "fila crescendo", "replica dado velho" —
// e não pelo nome do conceito. Contagem crua premia textos longos e palavras genéricas ("cliente").
// Aqui cada termo da consulta vira um CONCEITO (termo + variantes + sinônimos), cada campo tem peso
// (título > aliases > keywords/sintomas > resumo > corpo), o idf derruba termos onipresentes e a
// cobertura (quantos conceitos da consulta o item atende) decide a ordem.

// ---------------------------------------------------------------------------------- normalização

const DIACRITICS = /[̀-ͯ]/g;

/** Frases que viram um termo canônico ANTES de tokenizar (aplicado igual em consulta e documento). */
const PHRASES = [
  [/\bn\s*\+\s*1\b/g, " nplus1 "],
  [/\b(duas|2) vezes\b/g, " duplicado "],
  [/\b(twice|two times)\b/g, " duplicado "],
  [/\bdouble[\s-]*charg\w*/g, " duplicado cobranca "],
  [/\bdouble[\s-]*click\w*/g, " cliqueduplo "],
  [/\bclic\w* duas vezes\b/g, " cliqueduplo "],
  [/\b(ao )?mesmo tempo\b/g, " simultaneo "],
  [/\ball at once\b/g, " simultaneo "],
  [/\btudo junto\b/g, " simultaneo "],
  [/\bcheck[\s-]*then[\s-]*act\b/g, " checkthenact "],
  [/\bexists?[\s-]*by[\s-]*key\b/g, " existsbykey checkthenact "],
  [/\bidempotency[\s-]*key\b/g, " idempotencykey idempotencia chave "],
  [/\bdead[\s-]*letter\b/g, " dlq "],
  [/\bout of memory\b/g, " oom "],
  [/\bread[\s-]*your[\s-]*writes\b/g, " readyourwrites "],
  [/\bsingle[\s-]*flight\b/g, " singleflight "],
  [/\bload[\s-]*shedding\b/g, " loadshedding "],
  [/\bback[\s-]*pressure\b/g, " backpressure "],
  [/\bthundering[\s-]*herd\b/g, " thunderingherd "],
  [/\bcache[\s-]*stampede\b/g, " cachestampede "],
  [/\bretry[\s-]*storm\b/g, " retrystorm "],
  [/\bhot[\s-]*(key|partition|shard|spot)s?\b/g, " hotkey "],
];

const STOPWORDS = new Set(
  (
    "a o as os um uma uns umas de da do das dos em no na nos nas por pelo pela pelos pelas para pra pro " +
    "com sem e ou que se ja ta esta estao esse essa isso este esta isto aquele aquela eu voce ele ela eles " +
    "elas me te lhe nos vos meu minha seu sua como quando onde qual quais quem ao aos mais muito muita " +
    "tudo todo toda todos todas foi era ser sao tem ter vai the of to is are was were be been an and or " +
    "in on at for with by from it its this that these those as how what when why which do does did my"
  ).split(/\s+/),
);

export function normalize(text) {
  let s = String(text ?? "").normalize("NFD").replace(DIACRITICS, "").toLowerCase();
  for (const [re, rep] of PHRASES) s = s.replace(re, rep);
  return s.replace(/[^a-z0-9]+/g, " ").trim();
}

export function tokenize(text) {
  const out = [];
  for (const t of normalize(text).split(" ")) {
    if (t.length < 2 || STOPWORDS.has(t)) continue;
    out.push(t);
  }
  return out;
}

// ------------------------------------------------------------------------------------ sinônimos

/**
 * Grupos de sinônimos (já normalizados). Se um termo da consulta casa com um grupo, os demais
 * membros entram como alternativas de MENOR peso do mesmo conceito. Curado à mão, versionado e
 * coberto por testes de regressão (frontend/test/kb-search.test.mjs).
 */
export const SYNONYM_GROUPS = [
  ["duplicado", "duplicada", "duplicidade", "duplicate", "duplicates", "duplicated", "dobro", "double", "dedup", "deduplicacao"],
  ["cobrado", "cobrada", "cobranca", "cobrar", "charge", "charged", "debito", "debitou", "debit", "pagamento", "payment"],
  ["idempotencia", "idempotente", "idempotency", "idempotent", "idempotencykey"],
  ["cliqueduplo", "clicou", "clique", "click"],
  ["lento", "lenta", "lentidao", "slow", "latencia", "latency", "degradado", "degradacao", "degraded"],
  ["banco", "db", "database", "postgres", "postgresql", "sql", "mysql"],
  ["fila", "queue", "backlog", "enfileirado", "enfileiramento"],
  ["crescendo", "cresce", "crescer", "crescimento", "growing", "grows", "growth", "acumulando", "acumula", "acumulo", "accumulating"],
  ["consumidor", "consumer", "consumo", "consumers"],
  ["produtor", "producer", "publisher", "produz"],
  ["cache", "redis", "memcached", "caffeine"],
  ["expirou", "expira", "expirar", "expiracao", "expired", "expiry", "expiration", "ttl"],
  ["simultaneo", "simultanea", "simultaneamente", "simultaneous", "juntos", "junto", "concorrente", "concorrentes", "concurrent", "concorrencia", "concurrency", "sincronizado", "sincronizados", "synchronized", "paralelo"],
  ["reconectam", "reconectar", "reconecta", "reconexao", "reconnect", "reconnects", "reconnection"],
  ["retry", "retries", "retentativa", "retentativas", "tentativa", "tentativas", "reenvio", "reenvia", "repetida", "repetido", "repete", "repetir", "retrying"],
  ["piora", "pioram", "piorar", "piorou", "worse", "amplifica", "amplificacao", "amplification", "amplify"],
  ["replica", "replicas", "replicacao", "replication", "standby", "secundario"],
  ["velho", "velha", "antigo", "antiga", "desatualizado", "stale", "obsoleto", "outdated"],
  ["pool", "hikari", "hikaricp"],
  ["conexao", "conexoes", "connection", "connections"],
  ["ocupadas", "ocupado", "esgotado", "esgotou", "esgotamento", "exhausted", "exhaustion", "saturado", "saturacao", "saturation", "saturated"],
  ["shard", "shards", "particao", "particoes", "partition", "partitions"],
  ["quente", "hotkey", "hot", "popular", "viral", "skew", "desbalanceado", "desigual"],
  ["memoria", "memory", "heap", "oom", "outofmemoryerror", "ram"],
  ["caiu", "cair", "queda", "down", "crash", "indisponivel", "unavailable", "outage", "derrubou", "overload", "sobrecarga"],
  ["timeout", "timeouts", "estourou"],
  ["request", "requests", "requisicao", "requisicoes", "chamada", "chamadas"],
  ["chave", "key", "keys", "chaves"],
  ["payload", "body", "corpo", "parametros", "parameters", "fingerprint"],
  ["diferente", "diferentes", "different", "outro", "outra", "mudou", "divergente"],
  ["mensagem", "mensagens", "message", "messages", "evento", "eventos", "event", "events"],
  ["entregou", "entrega", "entregue", "delivered", "delivery", "redelivery", "reentrega", "reentregou"],
  ["query", "queries", "consulta", "consultas", "select"],
  ["nplus1", "lazy", "joinfetch"],
  ["indice", "index", "indexes", "indices", "indexacao"],
  ["checkthenact", "existsbykey", "race", "corrida"],
  ["dlq", "poison", "venenosa", "envenenada"],
  ["thunderingherd", "herd", "manada", "horda"],
  ["cachestampede", "stampede", "dogpile"],
  ["retrystorm", "tempestade"],
  ["loadshedding", "shedding", "descarte"],
  ["backpressure", "contrapressao"],
];

const GROUP_OF = new Map();
SYNONYM_GROUPS.forEach((g, i) => g.forEach((t) => { if (!GROUP_OF.has(t)) GROUP_OF.set(t, i); }));

function prefixOf(t) {
  if (t.length < 5) return null; // termos curtos só casam exatos (db, ttl, pool, hot, lag, key)
  // 5 letras: só extensões da própria palavra ("cache" → "caches"; "storm" não vira "store").
  // 6+: raiz de 5–6 letras ("expirou" → "expir", "consumidor" → "consum", sem pegar "consulta").
  return t.slice(0, Math.max(5, Math.min(6, t.length - 2)));
}

// ----------------------------------------------------------------------------------- indexação

/** Pesos por campo. */
export const FIELD_WEIGHTS = Object.freeze({ title: 6, aliases: 5, keywords: 4, summary: 2.5, body: 1 });

const TITLE_FIELDS = ["title", "name", "term", "question", "claim"];
const SUMMARY_FIELDS = ["summary", "problem", "definition", "shortAnswer", "keyDifference", "goal", "description"];
const SKIP_KEYS = new Set(["id", "url", "sourceRefs", "suggestedDbId", "mermaid"]);

function collectStrings(node, out, key) {
  if (node == null || SKIP_KEYS.has(key)) return;
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((v) => collectStrings(v, out, key));
  else if (typeof node === "object") for (const [k, v] of Object.entries(node)) collectStrings(v, out, k);
}

function countTokens(tokens) {
  const m = new Map();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

/**
 * Constrói o índice. `collections` = { [kind]: item[] } (ordem das chaves = ordem de desempate).
 * Aceita também `itemsOf(kind)` implícito via objeto simples.
 */
export function createIndex(collections) {
  const docs = [];
  const df = new Map();
  let bodyLenSum = 0;
  const kindOrder = Object.keys(collections);
  for (const kind of kindOrder) {
    for (const it of collections[kind] ?? []) {
      const titleText = TITLE_FIELDS.map((f) => it[f]).find((v) => typeof v === "string") ?? it.id ?? "";
      const summaryText = SUMMARY_FIELDS.map((f) => (typeof it[f] === "string" ? it[f] : "")).join(" ");
      const aliasList = Array.isArray(it.aliases) ? it.aliases : [];
      const keywordList = Array.isArray(it.keywords) ? it.keywords : [];
      const body = [];
      for (const [k, v] of Object.entries(it)) {
        if (TITLE_FIELDS.includes(k) || SUMMARY_FIELDS.includes(k) || k === "aliases" || k === "keywords") continue;
        collectStrings(v, body, k);
      }
      body.push(String(it.id ?? "").replace(/-/g, " "));
      const fields = {
        title: countTokens(tokenize(titleText)),
        aliases: countTokens(tokenize(aliasList.join(" "))),
        keywords: countTokens(tokenize(keywordList.join(" "))),
        summary: countTokens(tokenize(summaryText)),
        body: countTokens(tokenize(body.join(" "))),
      };
      let bodyLen = 0;
      for (const n of fields.body.values()) bodyLen += n;
      bodyLenSum += bodyLen;
      const seen = new Set();
      for (const f of Object.values(fields)) for (const t of f.keys()) seen.add(t);
      for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
      docs.push({
        kind,
        id: it.id,
        item: it,
        fields,
        bodyLen,
        phraseTexts: [...aliasList, ...keywordList, titleText].map((s) => new Set(tokenize(s))),
        exactNames: new Set([titleText, ...aliasList].map((s) => tokenize(s).join(" "))),
      });
    }
  }
  const vocab = [...df.keys()].sort();
  return { docs, df, vocab, avgBodyLen: docs.length ? bodyLenSum / docs.length : 1, kindOrder };
}

function vocabWithPrefix(index, p) {
  const v = index.vocab;
  let lo = 0;
  let hi = v.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (v[mid] < p) lo = mid + 1;
    else hi = mid;
  }
  const out = [];
  for (let i = lo; i < v.length && v[i].startsWith(p); i++) out.push(v[i]);
  return out;
}

/** Transforma a consulta em conceitos: [{ term, alts: Map<token, peso> }]. */
export function expandQuery(index, query) {
  const concepts = [];
  const seenTerms = new Set();
  for (const term of tokenize(query)) {
    if (seenTerms.has(term)) continue;
    seenTerms.add(term);
    const alts = new Map();
    const add = (tok, w) => { if ((alts.get(tok) ?? 0) < w) alts.set(tok, w); };
    const addWithPrefix = (tok, exactW, prefixW) => {
      if (index.df.has(tok)) add(tok, exactW);
      const p = prefixOf(tok);
      if (p) for (const v of vocabWithPrefix(index, p)) add(v, v === tok ? exactW : prefixW);
    };
    addWithPrefix(term, 1, 0.8);
    const groups = new Set();
    if (GROUP_OF.has(term)) groups.add(GROUP_OF.get(term));
    const p = prefixOf(term);
    if (p) for (const [t, g] of GROUP_OF) if (t.startsWith(p)) groups.add(g);
    for (const g of groups) for (const syn of SYNONYM_GROUPS[g]) if (syn !== term) addWithPrefix(syn, 0.55, 0.45);
    concepts.push({ term, alts });
  }
  return concepts;
}

const K1 = 1.2;
const B = 0.75;

function fieldScore(index, doc, field, token) {
  const tf = doc.fields[field].get(token);
  if (!tf) return 0;
  const idf = Math.log(1 + index.docs.length / (index.df.get(token) ?? 1));
  let tfPart;
  if (field === "body") {
    const norm = 1 - B + B * (doc.bodyLen / index.avgBodyLen);
    tfPart = (tf * (K1 + 1)) / (tf + K1 * norm);
  } else {
    tfPart = 1 + Math.log(tf);
  }
  return FIELD_WEIGHTS[field] * idf * tfPart;
}

/**
 * Busca. Retorna [{ kind, id, title, summary, score, matched, item }] ordenado.
 * @param {ReturnType<typeof createIndex>} index
 * @param {string} query
 * @param {{ kinds?: string[], limit?: number }} [opts]
 */
export function searchIndex(index, query, opts = {}) {
  const { kinds, limit = 8 } = opts;
  const allow = kinds && kinds.length ? new Set(kinds) : null;
  const concepts = expandQuery(index, query);
  if (!concepts.length) return [];
  const queryName = concepts.map((c) => c.term).join(" ");
  const hits = [];
  for (const doc of index.docs) {
    if (allow && !allow.has(doc.kind)) continue;
    let total = 0;
    const matched = [];
    const matchedTokens = [];
    for (const c of concepts) {
      let best = 0;
      let bestTok = null;
      for (const [tok, w] of c.alts) {
        let s = 0;
        for (const field of Object.keys(FIELD_WEIGHTS)) s += fieldScore(index, doc, field, tok);
        s *= w;
        if (s > best) { best = s; bestTok = tok; }
      }
      if (best > 0) {
        total += best;
        matched.push(c.term);
        matchedTokens.push(new Set([...c.alts.keys()]));
      }
    }
    if (!matched.length) continue;
    const coverage = matched.length / concepts.length;
    let score = total * coverage * coverage;
    // bônus de frase: um alias/keyword/título que sozinho cobre (quase) toda a consulta
    if (concepts.length >= 2) {
      let bestPhrase = 0;
      for (const phrase of doc.phraseTexts) {
        let hit = 0;
        for (const alts of matchedTokens) for (const t of alts) if (phrase.has(t)) { hit++; break; }
        bestPhrase = Math.max(bestPhrase, hit / concepts.length);
      }
      if (bestPhrase >= 0.66) score *= 1 + bestPhrase;
    }
    // a consulta É o nome (título ou alias) do item: o conceito em si vem antes de quem só o menciona
    if (doc.exactNames.has(queryName)) score *= 2;
    hits.push({ doc, score, matched });
  }
  const kindRank = new Map(index.kindOrder.map((k, i) => [k, i]));
  hits.sort(
    (a, b) =>
      b.score - a.score ||
      kindRank.get(a.doc.kind) - kindRank.get(b.doc.kind) ||
      String(a.doc.id).localeCompare(String(b.doc.id)),
  );
  return hits.slice(0, limit).map(({ doc, score, matched }) => ({
    kind: doc.kind,
    id: doc.id,
    score: Math.round(score * 100) / 100,
    matched,
    item: doc.item,
  }));
}
