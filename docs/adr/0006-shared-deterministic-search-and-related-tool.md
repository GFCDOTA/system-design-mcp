# ADR-0006 — Busca determinística compartilhada (MCP + web) e tool `related`

- **Status:** aceito (2026-09-13)
- **Contexto:** a busca do MCP contava ocorrências dos termos no JSON inteiro de cada item (título
  com peso 3). Isso achava nomes ("idempotência kafka"), mas não **sintomas** ("cliente cobrado duas
  vezes", "pool sem conexão", "fila crescendo"): palavras genéricas dominavam e textos longos
  ganhavam por tamanho. O frontend não tinha busca global, e cada lado implementaria a sua.
  Agentes que navegam a base também precisavam de N chamadas `get` para descobrir quem aponta para
  um item (inversos não existem no dado).
- **Decisão:**
  1. `shared/kb-search.mjs` — um único módulo ESM sem dependências, importado pelo MCP (Node) e pelo
     frontend (Vite): normalização (acentos, frases canônicas), stopwords PT/EN, prefixo, grupos de
     sinônimos PT↔EN curados, pesos por campo (título > aliases > keywords > resumo > corpo), idf,
     BM25 no corpo, cobertura dos conceitos da consulta e bônus de frase/nome exato.
  2. `shared/kb-kinds.mjs` — registro único das coleções (arquivo, descrição, rota).
  3. `shared/kb-graph.mjs` — arestas derivadas de todos os campos de relação + `related()`.
  4. Tool MCP nova **`related {kind,id}`** (saídas + entradas derivadas, com títulos).
- **Por que uma tool nova (e só uma):** as quatro tools continuam atendendo CRUD/busca e mantêm o
  contrato. `related` é uma operação de **grafo**, não de CRUD nem de busca, e troca varrer coleções
  com `list`+`get` por uma chamada. `quiz`, `study-path` e `incident` **não** viraram tools: são
  itens recuperáveis por `list/get` (`learning-paths`, `incident-drills`) ou geração determinística
  que pertence à UI.
- **Alternativas consideradas:**
  - *Embeddings / vector DB:* sem necessidade comprovada — a base é pequena (~250 itens),
    estruturada e versionada; exigiria modelo de embedding, índice a sincronizar e avaliação de
    recall, contra a regra "sem LLM/rede em runtime". Reavaliar se um benchmark de consultas
    reais mostrar recall insuficiente da busca lexical+sinônimos.
  - *Lunr/MiniSearch:* dependência para um problema que cabe em ~300 linhas testadas; sinônimos
    de domínio continuariam sendo curados à mão.
  - *Incluir inversos em `get`:* mudaria o payload de todas as coleções; `related` é explícito.
- **Consequências:** consultas por sintoma com regressão em `frontend/test/kb-search.test.mjs`
  (46 casos, incluindo a distinção dedup de request HTTP × dedup de mensagem); a mesma resposta no
  app e no MCP. Custo: sinônimos são curadoria contínua; mudança de conteúdo pode mexer no ranking
  (o teste aceita qualquer id correto no top-N, não um ranking exato). O `search` ganhou só um campo
  aditivo (`matched`); inputs e demais campos não mudaram.
