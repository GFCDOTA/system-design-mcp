# Contributing

Obrigado por contribuir com o **System Design Specialist Lab**. Este guia cobre setup, fluxo de
git, padrão de commit e — o mais importante aqui — a **regra de fontes**.

## Pré-requisitos

- **Node 20+** · Python 3 (opcional — só pra regenerar conteúdo/fontes com `scripts/*.py`).
- O app é **100% estático** (React/Vite/TS) — o antigo BFF Java foi aposentado e removido
  (vive no histórico do git).

## Setup & comandos

| Componente | Setup | Testar / Buildar | Rodar |
|------------|-------|------------------|-------|
| **Frontend** (`frontend/`) | `npm install` | `npm test` + `npm run build` (tsc strict + vite) | `npm run dev` (:5173) |
| **MCP** (`mcp/`) | `npm install && npm run build` | `npm run smoke` | spawnado pelo harness |
| **Tudo** | — | `scripts/test.sh` | `scripts/run.sh` |

## A regra de ouro: nada sem fonte

O lab vale porque **toda afirmação aponta pra uma fonte**. Ao mexer em conteúdo
(`knowledge-base/*.json`):

1. todo item precisa de `sourceRefs` com `kind`/`source`/`locator` reais;
2. depois de editar, rode **`python scripts/resolve_source_urls.py`** pra (re)verificar os `url`
   com `curl` — links quebrados não entram;
3. `npm test` (frontend) roda o **`kb-integrity.test.mjs`**, que falha o build se algum item não
   tiver fonte ou se um cross-ref (`relatedPatterns`/`diagrams`/…) não resolver.

Conteúdo de **IA & Agentes** vai só em `ai-agents-glossary.json` (trilha separada, sourced a refs
de IA) — não misture com o System Design (que é sourced ao workbook).

### Fontes aceitas

Prefira documentação oficial, o workbook (por página), microservices.io, Google SRE Book, AWS/Azure
architecture docs, docs de PostgreSQL/Redis/Kafka/Java/Hikari, Stripe (idempotência), RFCs e papers
originais. Posts servem de inspiração, não de autoridade. Parafraseie — nunca copie texto.
Draft expirado ou material não normativo deve estar **rotulado** como tal no `source`/`note`.
Números inventados só como **exemplo didático** rotulado (`productionScenario.dataKind: "didactic"`
ou "Exemplo didático" no texto) — nunca como dado de produção de uma empresa.

## Adicionar conteúdo de produção (failure modes, drills, comparações, trilhas)

Antes de criar: `search` pelo conceito e pelos sintomas (no app em `/search` ou pelo MCP). Se o
conceito já existe, **enriqueça e relacione** em vez de criar outra versão.

### Failure mode (`knowledge-base/failure-modes.json`)

Obrigatórios (o schema e o `kb-graph.test.mjs` cobram): `id`, `title`, `category`
(Caching|Database|Messaging|Resilience|Scalability|Consistency|Runtime), `difficulty`
(senior|staff), `summary`, `keywords` (≥3 sintomas/frases coloquiais PT/EN — alimentam a busca),
`definition`, `whyItHappens`, `productionScenario` (`dataKind`, contexto, estado normal, gatilho,
timeline ≥3, impacto), `failureChain` (≥3 passos), `canCause`, `symptoms` (usuário e sistema),
`rootCauses`, `diagnosis` (primeiro sinal, confirmação, causa vs sintoma), `immediateMitigation` e
`longTermSolutions` (separados!), `antiPatterns` (≥2), `tradeOffs` (≥2), `observability` (≥3
métricas, ≥1 alerta), `interview` (pergunta, resposta curta e forte, follow-ups, red flags,
strong signals, ladder junior/senior/staff), `relatedTopics`, `relatedPatterns` e `sourceRefs`
(≥2 fontes distintas). Opcionais: `aliases`, `confusedWith`, `capacityMath`,
`implementationNotes` (exemplo de implementação separado do conceito), `interview.whatIf`,
`diagrams`.

Regras de coerência testadas:
- se um passo de `failureChain` aponta para outro failure mode **depois** do próprio item, ele tem
  que ser alcançável por `canCause`; se vem **antes**, ele tem que levar ao item;
- nenhum failure mode fica sem aresta de entrada (alguma pergunta, drill, trilha ou outro failure
  mode aponta para ele).

### Incident drill (`incident-drills.json`)

`title` **neutro** (o teste falha se o título contiver o nome de um failure mode), `format`
(incident|metrics-detective|timeline), `scenario.signals` (≥2), `hints`, `answer` com diagnóstico,
causa raiz, raciocínio, `confirmWith`, `immediateMitigation`, `permanentFix`, `wouldMakeItWorse`,
`whatToMonitor` (+ `rootCauseAt` no formato timeline) e `failureModes` (o primeiro é o diagnóstico).
Não repita o conteúdo genérico do failure mode: o drill é o caso aplicado.

### Comparação, trilha, rubrica e perguntas

- `comparisons.json`: `keyDifference` em uma frase e ≥2 `options` com `refs` para a base.
- `learning-paths.json`: `steps[].ref {kind,id}` + `why`; toda trilha passa por pelo menos um
  failure mode.
- Perguntas (`interview-questions.json`): campos de pacote são opcionais e aditivos
  (`followUps`, `redFlags`, `strongSignals`, `expectedSignals`, `failureInjections`,
  `acceptableSolutions`, `decisionCriteria`, `whatToMonitor`, `failureModes`, `relatedQuestions`,
  `rubricDimensions` — ids da rubrica `system-design-interview`).

### Relacionar conteúdo

Guarde a relação **uma vez**, no item mais específico (ex.: a pergunta aponta para o failure mode
em `failureModes`); o inverso aparece sozinho em `related` (MCP) e nos backlinks do app
(`shared/kb-graph.mjs`). Nunca crie o campo espelho.

### Validar

```bash
python scripts/resolve_source_urls.py          # url das fontes, verificadas com curl
cd frontend && npm test && npm run build       # schema, integridade, grafo, busca, estudo, rotas
cd ../mcp && npm run build && npm run smoke    # tools por stdio
```

Se a busca por um sintoma importante não achar o item, adicione `keywords` no item (ou um grupo em
`SYNONYM_GROUPS` de `shared/kb-search.mjs`) e um caso em `frontend/test/kb-search.test.mjs`.

## Fluxo de git (GitHub Flow)

- `main` é sempre publicável. **Nunca commite direto em `main`.**
- Crie branch a partir de `main`: `feat/<x>`, `fix/<x>`, `docs/<x>`, `chore/<x>`,
  `refactor/<x>`, `test/<x>`.
- Abra **PR** contra `main`. CI verde (testes + build) é obrigatório pra merge.
- Um commit = uma intenção; prefira commit novo a `--amend` em commit já pushado.

## Commits (Conventional Commits)

`tipo(escopo): assunto no imperativo` — ex.: `feat(mcp): add search tool`,
`fix: resolve broken source links`, `docs: update runbook`.
Tipos: `feat` · `fix` · `docs` · `refactor` · `test` · `chore` · `perf`.

## Estilo de código

- Siga a convenção do arquivo ao redor; respeite o `.editorconfig`.
- **Frontend:** TypeScript strict; componentes reutilizáveis em `src/components`; lógica pura
  testável no padrão `.js` + `.d.ts` em `src/data` (ex.: `atsValidator`, `mindmapCore`).
- **Sem segredo/credencial** no código, teste ou commit (ver `SECURITY.md`).

## Checklist de PR

- [ ] `npm test` verde · `npm run build` (frontend) OK · `npm run smoke` (se mexeu no MCP).
- [ ] `scripts/resolve_source_urls.py` rodado, se tocou conteúdo.
- [ ] Conventional commit; descrição do PR explica o **porquê**.
- [ ] Sem segredo; docs atualizados se o comportamento mudou.
