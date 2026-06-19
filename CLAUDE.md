# CLAUDE.md — system-design-specialist-lab

> Bootloader do app. Narrativa completa em `README.md`; arquitetura em
> `docs/architecture.md`; como rodar em `docs/runbook.md`.

## O que é

Produto de estudo/consulta de System Design: **BFF Java 21 (hexagonal) + frontend
React/Vite + base de conhecimento JSON**. Conteúdo ancorado no *System Design Workbook*
(M. S. Fidelis) + 3 repos de referência (`msc-shard-router`, `msc-transactions-api`,
`event-source-distributed-ledger`) + microservices.io. **Sem LLM em runtime.**

## Regra-mãe (quebrar = inventar)

**Toda afirmação na base tem `sourceRefs`.** O teste `KnowledgeBaseIntegrityTest` falha o
build se algum item não tiver fonte ou se um cross-ref (relatedPatterns/diagrams/…) não
resolver. Ao editar `knowledge-base/*.json`, mantenha a fonte e rode `./mvnw test`.

## Toolchain (esta máquina)

- JDK 21 + Maven 3.9.9 ficam em `.tools/` (gitignored, baixados). O wrapper `./mvnw`
  funciona standalone (baixa o Maven). Use `JAVA_HOME=.tools/jdk/jdk-21.0.11+10`.
- **Boot live do BFF** precisa do workaround AF_UNIX desta máquina:
  `export JAVA_TOOL_OPTIONS="-Djdk.net.unixdomain.tmpdir=Z:\nope"` (força TCP). Os
  **testes** usam web MOCK (sem socket) e não precisam disso.
- Frontend: `cd frontend && npm install && npm run dev` (:5173, proxy /api → :8080).
- Preview do frontend: config `sdsl-frontend` em `E:\Claude\.claude\launch.json`.

## Pipeline de conteúdo

`docs/_sources/` (PDF extraído + resumos, gitignored) → agentes geram
`knowledge-base/_parts/*.json` → `scripts/merge_validate_kb.py` (merge + schema) →
`knowledge-base/*.json` (fonte de verdade) → gate no `./mvnw test`.

## Git

Repo próprio (init local; remote pretendido = `github.com/fmodesto30/system-design-mcp`,
hoje vazio). Não pushar sem o Felipe pedir. Develop-first em trabalho futuro.
