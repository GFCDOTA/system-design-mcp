# System Design Specialist Lab

Base de conhecimento **interativa** de System Design — um produto de estudo/consulta
que funciona como um especialista em arquitetura distribuída, sistemas financeiros,
event-driven, sharding, CQRS, Event Sourcing, consistência distribuída, observabilidade,
resiliência e BFF/API Gateway.

Não é um chatbot e **não usa LLM em runtime**: todo o conteúdo é uma base de
conhecimento versionada (JSON), servida como arquivos estáticos e navegada por um
frontend React (100% estático, PWA instalável). **Cada afirmação aponta para a sua
fonte** — nada é inventado.

[![CI](https://github.com/fmodesto30/system-design-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/fmodesto30/system-design-mcp/actions/workflows/ci.yml)
![tópicos](https://img.shields.io/badge/tópicos-29-5b9dff) ![padrões](https://img.shields.io/badge/padrões-20-5b9dff) ![perguntas](https://img.shields.io/badge/perguntas%20de%20entrevista-31-5b9dff) ![diagramas](https://img.shields.io/badge/diagramas%20mermaid-12-7ee0c0)

---

## Objetivo

Estudar e demonstrar System Design no nível de entrevista de arquiteto/staff, com:
- um **mapa de conhecimento** dos temas centrais (CAP/PACELC, sharding, CQRS, Event
  Sourcing, Saga, resiliência, observabilidade, capacity planning…);
- um **catálogo de padrões** (microservices.io + extras do livro) mapeado para **onde
  cada padrão aparece em três implementações reais**;
- **fluxos arquiteturais** passo a passo;
- **30 perguntas de entrevista** com resposta curta, detalhada, desenho mental, riscos,
  trade-offs e como responder;
- **diagramas Mermaid**;
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
prática dos mesmos conceitos. O inventário completo está em
[`docs/source-inventory.md`](docs/source-inventory.md).

## Arquitetura (resumo)

```
frontend (React + Vite + TS, :5173 — 100% estático, PWA)
      │  fetch /kb/*.json  (copiados no predev/prebuild)
      ▼
knowledge-base/*.json  (fonte de verdade, versionada)
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

Início (mapa de tópicos) · Tópicos · Padrões · Fluxos · Diagramas ·
**Modo Entrevista** (Q&A expansível) · **Comparar** (transacional×event sourcing,
API Gateway×BFF, forte×eventual) · **Evidências e fontes** · **IA & Agentes**
(glossário pra dev backend — trilha separada, sourced a refs de IA).

## MCP server (`system-design-mcp`)

A base também é exposta como **MCP server stdio** (Node) — pra outro Claude/agente consultar como
**tools nativas**, com as fontes junto. Lê os mesmos `knowledge-base/*.json` (sem LLM/rede em runtime).

```bash
cd mcp && npm install && npm run build && npm run smoke   # build + prova
```
Tools: `overview` · `search {query,kinds?,limit?}` · `list {kind}` · `get {kind,id}`. Registro e
exemplos em [`docs/FOR-AGENTS.md`](docs/FOR-AGENTS.md); o repo já traz um `.mcp.json`. Um MCP stdio
**não é daemon**: o harness spawna `node mcp/dist/server.js` sob demanda; "rodar" = registrar.

## Estrutura

```
system-design-specialist-lab/
  frontend/            # React + Vite + TypeScript (100% estático, PWA)
  mcp/                 # MCP server stdio (Node) — expõe a base como tools
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

## Próximos passos

Busca full-text · export do guia em PDF · um modo “quiz” cronometrado · diagramas
adicionais por fluxo · CI rodando os testes de integridade. Ver
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
