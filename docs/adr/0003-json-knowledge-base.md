# ADR-0003 — Base de conhecimento como JSON versionado (sem banco)

- **Status:** aceito
- **Contexto:** o conteúdo é majoritariamente de leitura, curado, e precisa ser
  **rastreável até a fonte** e revisável em diff. Não há escrita de usuário nem volume
  que justifique um banco.
- **Decisão:** a fonte de verdade é `knowledge-base/*.json`, validada por um **JSON
  Schema** (`knowledge-base/schema/`) e por um **teste de integridade** no BFF que falha
  o build se algum item não tiver `sourceRefs` ou se um cross-ref não resolver. O BFF
  carrega tudo em memória no boot via `JsonKnowledgeBaseAdapter` (porta de saída).
- **Alternativas consideradas:**
  - *Postgres/Mongo:* query rica e escrita, mas infra desnecessária, menos
    git-friendly e sem ganho para um produto read-only.
  - *Markdown solto:* fácil de escrever, difícil de validar contrato/cross-refs e de
    servir como API tipada.
- **Consequências:** simples, determinístico, versionável, diffável; o gate de schema +
  integridade impede “invenção”. Custo: sem busca/query no servidor (feita no front) e
  recarga só no restart. Trocar para um banco depois é só um novo adapter (ADR-0002).

- **Atualização (2026-09):** com o BFF aposentado, a trava mudou de lugar mas continua no build:
  `frontend/test/kb-schema.test.mjs` valida TODA a base contra o JSON Schema (antes o schema não era
  checado por teste), `kb-integrity.test.mjs` e `kb-graph.test.mjs` garantem fontes, ids únicos e
  que toda aresta resolve. O MCP e o frontend leem os mesmos JSON; não há adapter/banco. As novas
  coleções (ADR-0005) seguem a mesma decisão: JSON versionado, sem banco.
