# System Design Specialist Lab

Laboratório **interativo** de System Design para entrevistas Senior/Staff e para entender
problemas reais de produção: conceito → cenário de produção → falha → diagnóstico → solução →
trade-offs → observabilidade → resposta de entrevista. Cobre arquitetura distribuída, sistemas
financeiros, event-driven, sharding, CQRS, Event Sourcing, consistência, observabilidade,
resiliência e **Failure Modes at Scale** (o que não aparece em teste pequeno e quebra quando escala).

Não é um chatbot e **não usa LLM em runtime**: todo o conteúdo é uma base de
conhecimento versionada (JSON), servida como arquivos estáticos e navegada por um
frontend React (100% estático, PWA instalável). **Cada afirmação aponta para a sua
fonte** — nada é inventado.

[![CI](https://github.com/GFCDOTA/system-design-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/GFCDOTA/system-design-mcp/actions/workflows/ci.yml)
![tópicos](https://img.shields.io/badge/tópicos-29-5b9dff) ![padrões](https://img.shields.io/badge/padrões-26-5b9dff) ![perguntas](https://img.shields.io/badge/perguntas%20de%20entrevista-38-5b9dff) ![failure modes](https://img.shields.io/badge/failure%20modes-15-fb7185) ![drills](https://img.shields.io/badge/incident%20drills-11-fb7185) ![diagramas](https://img.shields.io/badge/diagramas%20mermaid-20-7ee0c0)

---

## Objetivo

Estudar e demonstrar System Design no nível de entrevista de arquiteto/staff, com:
- um **mapa de conhecimento** dos temas centrais (CAP/PACELC, sharding, CQRS, Event
  Sourcing, Saga, resiliência, observabilidade, capacity planning…);
- um **catálogo de padrões** (microservices.io + extras do livro) mapeado para **onde
  cada padrão aparece em três implementações reais**;
- **fluxos arquiteturais** passo a passo;
- **38 perguntas de entrevista** com resposta curta, detalhada, desenho mental, riscos,
  trade-offs e como responder — as principais com follow-ups, red flags, strong signals, falhas
  injetadas e dimensões de rubrica;
- **15 failure modes at scale** (cache stampede, thundering herd, hot key, N+1, retry storm,
  unbounded cache, connection pool exhaustion, read replica lag, missing idempotency, no
  backpressure, cascading failure, slow query, cache avalanche, cache penetration, poison message)
  com cenário numérico didático, cadeia de falha, sintomas, diagnóstico, mitigação imediata vs
  correção definitiva, anti-patterns, trade-offs, o que monitorar e resposta de entrevista;
- **11 incident drills**, **15 comparações**, **6 trilhas de estudo** e uma **rubrica** de
  entrevista por critério (0–5, evidência obrigatória);
- **diagramas Mermaid** (inclusive de comportamento de falha);
- uma **matriz de evidências** “afirmação → evidência → fonte”.

## Fontes (e por que confiar)

| Fonte | O que é | Papel |
|-------|---------|-------|
| **System Design Workbook** (Matheus Scarpato Fidelis, 682 p.) | Livro de System Design (PT-BR) | Teoria — citada por página (`p.X`) |
| [`msc-shard-router`](https://github.com/msfidelis/msc-shard-router) | Proxy/router Go com hashing consistente, bulkheads, circuit breaker | Impl. de referência (sharding/cell-based) |
| [`msc-transactions-api`](https://github.com/msfidelis/msc-transactions-api) | API transacional Go/Fiber, Postgres+Redis | Impl. de referência (consistência forte) |
| [`event-source-distributed-ledger`](https://github.com/msfidelis/event-source-distributed-ledger) | Ledger Go com Event Sourcing + CQRS, Kafka, Scylla, Mongo | Impl. de referência (event-driven) |
| [microservices.io](https://microservices.io/patterns/index.html) | Catálogo de padrões | Referência conceitual (escrito com nossas palavras) |

O autor do livro é o mesmo dos três repositórios — o livro é a teoria, os repos são a
prática dos mesmos conceitos. Os failure modes e o deep-dive de idempotência HTTP citam também
fontes primárias verificadas: Google SRE Book, Azure Architecture Center, AWS (Builders' Library,
blog de arquitetura, DynamoDB, RDS), PostgreSQL, Stripe, RFC 8785/5861, HikariCP, Caffeine, Redis,
Kafka, Hibernate, Java SE e os papers VLDB'15 (cache stampede) e NSDI'13 (memcache do Facebook).
O inventário completo está em
[`docs/source-inventory.md`](docs/source-inventory.md).

## Arquitetura (resumo)

```
frontend (React + Vite + TS, estático, PWA) ── fetch /kb/*.json ──┐
                                                                   ├─► knowledge-base/*.json (fonte de verdade)
mcp/ (stdio: overview · search · list · get · related) ── read ───┘
        └──────── shared/ (registro · busca por sintoma · grafo): mesmo código nos dois ────────┘
```

Detalhes em [`docs/architecture.md`](docs/architecture.md) e nos [ADRs](docs/adr/).
O antigo **BFF Java/Spring foi aposentado e removido** (vive no histórico do git e
no `CHANGELOG.md`): sem backend, o app lê a base direto como arquivo estático —
`frontend/scripts/kb-to-public.mjs` copia `knowledge-base/` → `public/kb/` no
predev/prebuild.

## Como rodar

Pré-requisito: **Node 20+**.

```bash
cd frontend
npm install
npm run dev                     # sobe em http://localhost:5173
npm run dev -- --host           # idem, exposto na LAN (celular)
```

### Atalhos
```bash
scripts/test.sh                 # npm test (unit + kb-integrity) + build estrito
scripts/build.sh                # build do bundle estático (dist/)
scripts/run.sh                  # dev server com --host
```

## Telas

Início · Tópicos · Padrões · Fluxos · Diagramas · Bancos · **Modo Entrevista** (Q&A expansível com
follow-ups e sinais) · **Comparar** (15 comparações com fontes) · Evidências · IA & Agentes.

**Produção & Falhas:** Failure modes (detalhe com progressive disclosure) · Incident drills
(cenário → dicas → diagnóstico → mitigação) · Cadeias de falha (grafo causal) · Quiz & jogo da
cadeia · Revisão espaçada (Entendi / Revisar depois / Preciso estudar, em localStorage) · Trilhas
de System Design · Busca por sintoma (a mesma do MCP).

## MCP server (`system-design-mcp`)

A base também é exposta como **MCP server stdio** (Node) — pra outro Claude/agente consultar como
**tools nativas**, com as fontes junto. Lê os mesmos `knowledge-base/*.json` (sem LLM/rede em runtime).

```bash
cd mcp && npm install && npm run build && npm run smoke   # build + prova
```
Tools: `overview` · `search {query,kinds?,limit?}` (por nome **ou sintoma**) · `list {kind}` · `get {kind,id}` · `related {kind,id}` (vizinhança no grafo, com arestas de entrada derivadas). Registro e
exemplos em [`docs/FOR-AGENTS.md`](docs/FOR-AGENTS.md); o repo já traz um `.mcp.json`. Um MCP stdio
**não é daemon**: o harness spawna `node mcp/dist/server.js` sob demanda; "rodar" = registrar.

```text
search "cliente cobrado duas vezes"  → failure-modes/missing-idempotency · q36 · drill-double-charges-peak
search "pool sem conexão"            → failure-modes/connection-pool-exhaustion
search "todos reconectaram juntos"   → failure-modes/thundering-herd
search "fila crescendo"              → failure-modes/no-backpressure
search "Kafka entregou a mesma mensagem duas vezes" → q02 · idempotent-consumer
```

## Estrutura

```
system-design-specialist-lab/
  frontend/            # React + Vite + TypeScript (100% estático, PWA)
  mcp/                 # MCP server stdio (Node) — expõe a base como tools
  shared/              # ESM puro usado por frontend E mcp: registro, busca, grafo
  knowledge-base/      # JSON versionado (fonte de verdade) + schema/
  docs/                # inventário, mapa de conhecimento, ADRs, runbook, guia, trade-offs, glossário, FOR-AGENTS
  scripts/             # build / test / run + extração de conteúdo (Python)
  .mcp.json
```

## Limitações

- O conteúdo do código dos repos foi lido via README/estrutura, não linha a linha —
  citações `repo:<arquivo>` indicam o arquivo provável (ver `docs/open-questions.md`).
- Não há banco de dados: a base é JSON em memória (read-only). Isso é uma decisão
  consciente (ADR-0003), não uma pendência.
- `Polling Publisher` e `Transaction Log Tailing` são tratados como referência
  conceitual (sem capítulo dedicado no livro).

## Como a base é validada

`cd frontend && npm test` roda: schema de toda a base, integridade (fontes, ids, cross-refs), grafo
(toda aresta resolve; cadeia de falha coerente com `canCause`; quality gates por failure mode), regressão
da busca por sintoma, lógica de estudo e cobertura de rotas. `cd mcp && npm run smoke` prova as tools por
stdio. O CI roda os dois.

## Próximos passos

Segunda onda de failure modes com fonte (split brain, clock skew, lost update/write skew, noisy
neighbor, rebalancing storm) · export do guia em PDF · quiz cronometrado · mais drills de
linha do tempo. Decisões em [`docs/adr/`](docs/adr/); histórico em
[`docs/final-report.md`](docs/final-report.md).

## Contribuindo

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) — setup, fluxo de git (GitHub Flow), Conventional
Commits e a **regra de ouro**: todo item de conteúdo precisa de fonte verificada (o
`kb-integrity.test.mjs` falha o build se faltar). Também:
[`SECURITY.md`](SECURITY.md) · [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) ·
[`CHANGELOG.md`](CHANGELOG.md).

## Licença

Código sob **[MIT](LICENSE)**. O conteúdo (`knowledge-base/`, `docs/`) é escrito com palavras
próprias e **cita** terceiros — *System Design Workbook* (M. S. Fidelis), os repos `msfidelis` e
microservices.io — que continuam de seus autores. **Não** redistribui o PDF nem código de terceiros.
