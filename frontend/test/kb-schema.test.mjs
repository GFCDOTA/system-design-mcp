// Valida a knowledge-base REAL contra o contrato knowledge-base/schema/knowledge-base.schema.json.
// Antes deste teste o schema era só documentação: nada impedia um campo com typo, um enum fora
// da lista ou um arquivo novo sem contrato. O validador abaixo é deliberadamente mínimo (sem
// dependência nova) e implementa SÓ as palavras-chave que o schema usa — e o primeiro teste
// falha se o schema passar a usar uma palavra-chave que ele não conhece, pra nunca "passar"
// ignorando uma regra em silêncio.
// Roda: npm test (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KB = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "knowledge-base");
const schema = JSON.parse(readFileSync(join(KB, "schema", "knowledge-base.schema.json"), "utf-8"));

const SUPPORTED = new Set([
  "$schema", "$id", "$defs", "$ref", "title", "description",
  "type", "required", "additionalProperties", "properties", "items",
  "enum", "pattern", "minItems", "minLength",
]);

function* walkSchema(node, path = "#") {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* walkSchema(node[i], `${path}/${i}`);
    return;
  }
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    yield { key: k, path };
    if (k === "properties" || k === "$defs") {
      for (const [name, sub] of Object.entries(v)) yield* walkSchema(sub, `${path}/${k}/${name}`);
    } else if (k === "enum" || k === "required") {
      // valores literais, não sub-schemas
    } else if (typeof v === "object") {
      yield* walkSchema(v, `${path}/${k}`);
    }
  }
}

function resolveRef(ref) {
  assert.ok(ref.startsWith("#/$defs/"), `$ref não suportado: ${ref}`);
  const def = schema.$defs[ref.slice("#/$defs/".length)];
  assert.ok(def, `$ref inexistente: ${ref}`);
  return def;
}

function typeOk(value, type) {
  switch (type) {
    case "object": return value !== null && typeof value === "object" && !Array.isArray(value);
    case "array": return Array.isArray(value);
    case "string": return typeof value === "string";
    case "integer": return Number.isInteger(value);
    case "number": return typeof value === "number";
    case "boolean": return typeof value === "boolean";
    case "null": return value === null;
    default: throw new Error(`type não suportado: ${type}`);
  }
}

/** Retorna a lista de violações (vazia = válido). */
function validate(value, node, path, errors) {
  if (node.$ref) return validate(value, resolveRef(node.$ref), path, errors);
  if (node.type) {
    const types = Array.isArray(node.type) ? node.type : [node.type];
    if (!types.some((t) => typeOk(value, t))) {
      errors.push(`${path}: esperava ${types.join("|")}, veio ${JSON.stringify(value)?.slice(0, 60)}`);
      return errors;
    }
  }
  if (node.enum && !node.enum.includes(value)) errors.push(`${path}: '${value}' fora do enum ${node.enum.join("|")}`);
  if (node.pattern && typeof value === "string" && !new RegExp(node.pattern).test(value)) {
    errors.push(`${path}: '${value}' não casa ${node.pattern}`);
  }
  if (node.minLength !== undefined && typeof value === "string" && value.length < node.minLength) {
    errors.push(`${path}: string menor que ${node.minLength}`);
  }
  if (Array.isArray(value)) {
    if (node.minItems !== undefined && value.length < node.minItems) errors.push(`${path}: menos de ${node.minItems} itens`);
    if (node.items) value.forEach((v, i) => validate(v, node.items, `${path}[${i}]`, errors));
  } else if (value && typeof value === "object") {
    for (const r of node.required ?? []) if (!(r in value)) errors.push(`${path}: campo obrigatório ausente '${r}'`);
    const props = node.properties ?? {};
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) validate(v, props[k], `${path}.${k}`, errors);
      else if (node.additionalProperties === false) errors.push(`${path}: campo não previsto no schema '${k}'`);
    }
  }
  return errors;
}

test("schema: só usa palavras-chave que o validador implementa", () => {
  const unknown = [];
  for (const { key, path } of walkSchema(schema)) if (!SUPPORTED.has(key)) unknown.push(`${path} -> ${key}`);
  assert.deepEqual(unknown, [], "palavra-chave sem suporte no validador:\n" + unknown.join("\n"));
});

test("schema: todo JSON na raiz da knowledge-base está declarado no contrato", () => {
  const files = readdirSync(KB).filter((f) => f.endsWith(".json")).sort();
  const declared = Object.keys(schema.properties ?? {}).sort();
  assert.deepEqual(files, declared, "arquivo da KB sem contrato (ou contrato sem arquivo)");
});

test("schema: toda coleção da knowledge-base valida contra o contrato", () => {
  const kb = {};
  for (const f of Object.keys(schema.properties)) kb[f] = JSON.parse(readFileSync(join(KB, f), "utf-8"));
  const errors = validate(kb, schema, "kb", []);
  assert.deepEqual(errors.slice(0, 40), [], `${errors.length} violação(ões) de schema:\n` + errors.slice(0, 40).join("\n"));
});

test("schema: o validador rejeita de fato (sanidade negativa)", () => {
  const bad = { id: "Id Com Espaço", title: "x", mermaid: "graph TD", sourceRefs: [], extra: 1 };
  const errors = validate(bad, schema.$defs.Diagram, "diagram", []);
  assert.ok(errors.some((e) => e.includes("não casa")), "pattern de id deveria falhar");
  assert.ok(errors.some((e) => e.includes("menos de 1")), "minItems de sourceRefs deveria falhar");
  assert.ok(errors.some((e) => e.includes("'extra'")), "additionalProperties:false deveria falhar");
});
