# ADR-0005 — Failure modes, drills, comparações, trilhas e rubrica como coleções first-class

- **Status:** aceito (2026-09-13)
- **Contexto:** a base explicava conceitos (tópicos, padrões, perguntas), mas não ensinava **como
  sistemas quebram em produção**: cenário → gatilho → cadeia de falha → sintomas → diagnóstico →
  mitigação imediata vs correção definitiva → trade-off → observabilidade → resposta de entrevista.
  Conceitos como retry storm, thundering herd, hot partition e backpressure apareciam só como uma
  frase dentro de tópicos. Também faltava material para treino ativo (incidentes, comparações,
  trilhas) e um critério de avaliação para mock interviews consumidas por agentes.
- **Decisão:** criar coleções próprias, cada uma com def no JSON Schema, integridade testada e
  exposta pelas mesmas tools do MCP:
  - `failure-modes.json` — o formato rico (cenário didático com `dataKind`, `failureChain`,
    `canCause`, `confusedWith`, diagnóstico, `immediateMitigation` vs `longTermSolutions`,
    anti-patterns, observabilidade, notas de implementação separadas do conceito, pacote de
    entrevista com ladder junior/senior/staff e what-ifs);
  - `incident-drills.json` — cenário + sinais + dicas + diagnóstico diferencial, **sem repetir** o
    conteúdo genérico: aponta para o failure mode;
  - `comparisons.json` — o que estava hard-coded no `Compare.tsx`, agora com fontes;
  - `learning-paths.json` — sequências que atravessam coleções por `KbRef {kind,id}`;
  - `rubrics.json` — rubrica de entrevista por critério (0–5, evidência obrigatória).
  - Perguntas existentes ganham **campos opcionais aditivos** (follow-ups, red flags, strong
    signals, failure injections, acceptable solutions, decision criteria, rubric dimensions).
- **Alternativas consideradas:**
  - *Modelar failure modes dentro de `topics`/`interview-questions`:* evitaria coleções novas,
    mas colaria ~20 campos opcionais em 29 tópicos que são capítulos do workbook, misturando
    "conceito" com "incidente", e a pergunta de entrevista viraria um documento gigante.
  - *Drills derivados só dos failure modes:* o drill precisa esconder o nome e combinar mais de
    um failure mode num incidente (slow query → pool → retry storm); derivar entregaria a
    resposta e não cobriria cadeias.
- **Regras que evitam duplicação:**
  - relação guardada **uma vez** (no item mais específico/novo); o inverso é derivado por
    `shared/kb-graph.mjs` (ex.: `question.failureModes` → "perguntas que exercitam" no failure mode);
  - o deep-dive de idempotência HTTP vive na `q36` + pattern `idempotent-request`; o failure mode
    `missing-idempotency` é o incidente e aponta para eles;
  - números de cenário são **didáticos** (`dataKind: "didactic"`); dado real só com a fonte citada.
- **Consequências:** conteúdo navegável por causalidade, testes que garantem que a narrativa da
  cadeia bate com as arestas `canCause`, quality gates por failure mode e nenhum órfão. Custo:
  schema maior e mais disciplina ao editar (documentada no CONTRIBUTING).
