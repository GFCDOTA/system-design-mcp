// system-design-mcp — stdio MCP server exposing the lab's knowledge base as tools.
// Spawned by the harness (Claude Code / Docker MCP Gateway / Spring AI MCP client); talks MCP over stdin/stdout.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { KINDS, overview, list, get, search, related } from "./kb.js";

const server = new McpServer({ name: "system-design", version: "0.2.0" });
const kindEnum = z.enum(KINDS);

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}
function notFound(kind: string, id: string) {
  return {
    content: [{ type: "text" as const, text: `Não encontrado: ${kind}/${id}. Use list/search para ids válidos.` }],
    isError: true,
  };
}

server.tool(
  "overview",
  "Visão geral da base: contagem e descrição de cada coleção (topics, patterns, flows, interview-questions, diagrams, evidence, ai-glossary, databases, failure-modes, incident-drills, comparisons, learning-paths, rubrics). Comece por aqui para se orientar.",
  async () => json(overview()),
);

server.tool(
  "search",
  "Busca determinística na base de System Design por nome OU por sintoma (ex.: 'cliente cobrado duas vezes', 'pool sem conexão', 'fila crescendo'). Retorna {kind,id,title,summary,score,matched,sourceRefs}. Use 'kinds' para restringir coleções (ex.: ['failure-modes']).",
  {
    query: z.string().describe("termos ou sintoma em PT-BR/EN, ex.: 'idempotência kafka', 'retries pioram o serviço'"),
    kinds: z.array(kindEnum).optional().describe("restringe às coleções dadas; vazio = todas"),
    limit: z.number().int().positive().max(50).optional().describe("máx. de resultados (default 8)"),
  },
  async ({ query, kinds, limit }) => json(search(query, kinds, limit ?? 8)),
);

server.tool(
  "list",
  "Lista {id,title} de todos os itens de uma coleção.",
  { kind: kindEnum },
  async ({ kind }) => json(list(kind)),
);

server.tool(
  "get",
  "Item completo (com sourceRefs e url verificadas) de uma coleção, por id. Use 'list' ou 'search' para descobrir ids.",
  { kind: kindEnum, id: z.string() },
  async ({ kind, id }) => {
    const item = get(kind, id);
    return item ? json(item) : notFound(kind, id);
  },
);

server.tool(
  "related",
  "Vizinhança de um item no grafo da base: arestas de SAÍDA (relatedTopics, canCause, mitigatedBy, confusedWith, passos de trilha…) e de ENTRADA derivadas (quem aponta para ele: perguntas que exercitam um failure mode, drills que o diagnosticam, o que pode causá-lo). Uma chamada em vez de varrer coleções com get.",
  { kind: kindEnum, id: z.string() },
  async ({ kind, id }) => {
    const r = related(kind, id);
    return r ? json(r) : notFound(kind, id);
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[system-design-mcp] ready on stdio");
