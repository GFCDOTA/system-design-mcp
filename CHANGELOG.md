# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- **Failure Modes at Scale** (`knowledge-base/failure-modes.json`, 15 itens) com cenário didático
  numérico, cadeia de falha, `canCause`/`confusedWith`, sintomas, diagnóstico, mitigação imediata vs
  correção definitiva, anti-patterns, trade-offs, observabilidade, notas de implementação e pacote
  de entrevista (ADR-0005).
- **Deep-dive de idempotência HTTP financeira**: pergunta `q36`, pattern `idempotent-request` e
  diagrama `financial-http-idempotency` (claim atômico, fingerprint semântico, replay × conflito ×
  concorrência, crash windows, retenção, testes). `q18` ligada; `q02/q31/q35` relacionadas.
- `incident-drills.json` (11), `comparisons.json` (15, incluindo as 3 que eram hard-coded),
  `learning-paths.json` (6) e `rubrics.json` (rubrica 0–5 por critério com evidência).
- Perguntas `q37` (entrevista progressiva de cache) e `q38` (break this system); pacotes de
  entrevista em `q02/q09/q14/q15/q16/q24/q25/q27/q31/q36`.
- Exemplos de produção com números em 6 tópicos centrais; 8 diagramas de comportamento de falha.
- `shared/`: registro de coleções, **busca determinística por sintoma** e grafo derivado, usados
  pelo MCP e pelo frontend (ADR-0006).
- MCP: novas coleções nas tools existentes, `search` por sintoma (campo aditivo `matched`) e tool
  **`related`**; versão 0.2.0.
- Frontend: grupo **Produção & Falhas** (failure modes, drills, cadeias, quiz e jogo da cadeia,
  revisão espaçada, trilhas, busca global); Compare lendo a base; tópicos/padrões com "Em produção"
  e "Como isso quebra"; perguntas com follow-ups, sinais e falhas injetadas.
- Testes: `kb-schema` (schema de toda a base), `kb-graph`, `kb-search` (46 consultas) e
  `study-logic`.

### Fixed
- CI do MCP vermelho no `main` desde julho: smoke esperava `databases === 6` hard-coded.
- `id` duplicado `rag` no glossário de IA; ids agora únicos por teste.
- Cross-refs de `diagrams` e `evidence.relatedTopics` não eram verificados.
- Service worker registrado em dev servia módulos antigos do Vite.

### Changed
- `docs/architecture.md` e `docs/runbook.md` descrevem o app estático + MCP (sem BFF);
  ADR-0002 marcado como substituído.

### Removed
- **BFF Java/Spring (`bff/`) removido** — aposentado desde a migração pro app 100% estático
  (`api.ts` lê `/kb/*.json`); o código segue no histórico do git. Junto: `docker-compose.yml`,
  `frontend/Dockerfile`/`nginx.conf` e o toolchain local `.tools/` (JDK/Maven baixáveis).
  O `KnowledgeBaseIntegrityTest` (regra "nada sem fonte") foi **portado 1:1** pra
  `frontend/test/kb-integrity.test.mjs` e agora roda no CI via `npm test`.

### Added
- `docs/deep-dive-dedup-kafka.md` — análise de deduplicação ponta a ponta num pipeline Kafka
  ~1M TPS (DynamoDB write side + CDC/CQRS pra PostgreSQL), preservada do `main` pré-existente.
- Pergunta de entrevista **q31** integrando esse deep-dive ao lab (sourced: workbook p.494/p.308,
  microservices.io idempotent-consumer, RFC 8785, PostgreSQL ON CONFLICT, Morling). Total: 31 perguntas.

## [0.1.0] — 2026-06-19

### Added
- **BFF** (Java 21 + Spring Boot 3.4, arquitetura hexagonal): endpoints REST de topics,
  patterns, flows, interview-questions, diagrams, evidence, ai-glossary, meta/stats; actuator +
  métricas Prometheus; handler global de erro; filtro de request-id. 17 testes (unit + contrato +
  integridade da base).
- **Frontend** (React + Vite + TypeScript): telas de tópicos, padrões, fluxos, diagramas (Mermaid),
  Modo Entrevista, Comparar arquiteturas, Evidências e **IA & Agentes**.
- **Knowledge base** versionada (JSON + JSON Schema): 29 tópicos, 20 padrões, 7 fluxos, 30 perguntas,
  12 diagramas, 24 evidências, 13 termos de IA&Agentes — toda entrada com `sourceRefs` e `url`
  verificada por `curl`.
- **MCP server** (`mcp/`, Node stdio): tools `overview`/`search`/`list`/`get`, lendo a mesma base.
- **Docs:** source-inventory, system-design-knowledge-map, architecture, ADRs, runbook,
  interview-guide, tradeoffs, glossary, ai-agents-glossary, mcp-server-plan, FOR-AGENTS, final-report.
- **Infra:** docker-compose + Dockerfiles + scripts (build/test/run + manutenção de fontes).

### Fixed
- Links de fonte quebrados: cada `sourceRef` agora carrega um `url` curl-verificado (deep-link
  quando resolve, fallback pro índice de padrões quando não, raiz do repo pra repos).

[Unreleased]: https://github.com/fmodesto30/system-design-mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fmodesto30/system-design-mcp/releases/tag/v0.1.0
