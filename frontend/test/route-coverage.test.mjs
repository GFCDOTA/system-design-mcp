// Guarda de cobertura de rotas (estático, sem render, sem dependência nova — node --test).
// Impede a classe de bug em que um <Link to> / <NavLink to> aponta para uma rota que não existe
// no router (main.tsx) — o que no SPA-fallback do nginx cai numa <Outlet /> vazia (tela branca).
// Caso real: DiagramEmbed linkava /diagrams/:id antes de a rota existir.
//
// Roda: npm test  (node --test). Lê main.tsx + as páginas/componentes como TEXTO e cruza
// todo destino de link com o registro de rotas. Não importa componentes (sem mermaid/jsdom).
//
// Resolução de rota: o router tem objetos de topo com path ABSOLUTO ("/", "/entrevista") e
// filhos com path relativo ("dsa" → "/entrevista/dsa"). Um path absoluto só vale como destino
// se for folha (sem filhos) ou tiver `index: true` — linkar num layout sem index é a tela
// branca que este guard existe pra pegar. Segmento ":param" casa qualquer valor. O catch-all
// "*" (404) não conta como destino válido.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

function listSourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      out.push(...listSourceFiles(full));
    } else if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.[tj]sx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Rotas COMPLETAS registradas no router de main.tsx (ex.: "/topics/:id", "/entrevista/dsa").
 * Varre `path:`/`index:` em ordem textual: um path absoluto abre um bloco; os relativos
 * seguintes pertencem a ele. Absoluto sem filhos = folha (destino válido); com filhos, só
 * `index: true` registra o próprio path do pai.
 */
function registeredPaths() {
  const text = readFileSync(join(SRC, "main.tsx"), "utf8");
  const set = new Set();
  let base = null; // path absoluto corrente, "" para a raiz "/"
  let baseIsLeaf = false; // ainda não vimos filho/index sob o absoluto corrente
  const closeBase = () => {
    if (base !== null && baseIsLeaf) set.add(base === "" ? "/" : base);
  };
  for (const m of text.matchAll(/\bpath:\s*"([^"]*)"|\bindex:\s*true\b/g)) {
    if (m[0].startsWith("index")) {
      if (base !== null) set.add(base === "" ? "/" : base);
      baseIsLeaf = false;
      continue;
    }
    const p = m[1];
    if (p.startsWith("/")) {
      closeBase();
      base = p === "/" ? "" : p.replace(/\/+$/, "");
      baseIsLeaf = true;
    } else {
      baseIsLeaf = false;
      if (p === "*") continue; // catch-all 404 não é destino de link válido
      set.add(`${base ?? ""}/${p}`);
    }
  }
  closeBase();
  return set;
}

/** Existe rota registrada = base + exatamente um segmento :param? (ex.: "/topics" -> "/topics/:id") */
function hasParamRoute(registered, base) {
  const bparts = base.replace(/^\//, "").split("/");
  for (const p of registered) {
    const parts = p.replace(/^\//, "").split("/");
    if (
      parts.length === bparts.length + 1 &&
      bparts.every((seg, i) => seg === parts[i]) &&
      parts[bparts.length].startsWith(":")
    )
      return true;
  }
  return false;
}

/** O destino estático casa com alguma rota registrada? Segmento ":param" é curinga. */
function matchesRegistered(registered, target) {
  const tparts = target.replace(/^\//, "").split("/");
  for (const p of registered) {
    const parts = p.replace(/^\//, "").split("/");
    if (parts.length !== tparts.length) continue;
    if (parts.every((seg, i) => seg.startsWith(":") || seg === tparts[i])) return true;
  }
  return false;
}

function collectLinks(files) {
  const dynamicBases = [];
  const staticTargets = [];
  const chipBases = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const rel = file.slice(SRC.length + 1).replace(/\\/g, "/");
    // to={`...`}
    for (const m of text.matchAll(/\bto=\{\s*`([^`]*)`\s*\}/g)) {
      const path = m[1].split(/[?#]/)[0];
      const idx = path.indexOf("${");
      if (idx >= 0) {
        const base = path.slice(0, idx).replace(/\/+$/, "");
        if (base.startsWith("/")) dynamicBases.push({ base, use: { file: rel, raw: m[0] } });
      } else if (path.startsWith("/")) {
        staticTargets.push({ target: path, use: { file: rel, raw: m[0] } });
      }
    }
    // to="..." e to: "..." (array NAV)
    for (const m of text.matchAll(/\bto[=:]\s*"([^"]+)"/g)) {
      const t = m[1].split(/[?#]/)[0];
      if (t.startsWith("/")) staticTargets.push({ target: t, use: { file: rel, raw: m[0] } });
    }
    // base="/x" (LinkChips)
    for (const m of text.matchAll(/\bbase="(\/[^"]+)"/g)) {
      chipBases.push({ base: m[1], use: { file: rel, raw: m[0] } });
    }
  }
  return { dynamicBases, staticTargets, chipBases };
}

const registered = registeredPaths();
const { dynamicBases, staticTargets, chipBases } = collectLinks(listSourceFiles(SRC));

test("o registro de rotas é não-trivial (sanidade)", () => {
  assert.ok(registered.has("/topics/:id"), "esperava rota /topics/:id");
  assert.ok(registered.has("/diagrams/:id"), "esperava rota /diagrams/:id");
  assert.ok(registered.has("/entrevista"), "esperava rota /entrevista (index do Modo Entrevista)");
  assert.ok(dynamicBases.length > 0, "esperava ao menos um link dinâmico");
});

test("toda base dinâmica de <Link to> tem rota :param correspondente", () => {
  const v = dynamicBases
    .filter(({ base }) => !hasParamRoute(registered, base))
    .map(({ base, use }) => `${use.file}: ${use.raw} -> falta rota "${base}/:id"`);
  assert.deepEqual(v, [], "\n" + v.join("\n"));
});

test("toda base de LinkChips tem rota :param correspondente", () => {
  const v = chipBases
    .filter(({ base }) => !hasParamRoute(registered, base))
    .map(({ base, use }) => `${use.file}: base="${base}" -> falta rota "${base}/:id"`);
  assert.deepEqual(v, [], "\n" + v.join("\n"));
});

test("todo destino estático de <Link to>/NAV resolve para uma rota registrada", () => {
  const v = [];
  for (const { target, use } of staticTargets) {
    if (!matchesRegistered(registered, target)) v.push(`${use.file}: ${use.raw} -> falta rota "${target}"`);
  }
  assert.deepEqual(v, [], "\n" + v.join("\n"));
});
