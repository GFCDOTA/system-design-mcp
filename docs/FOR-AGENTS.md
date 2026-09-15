# FOR-AGENTS — consumir o System Design Specialist Lab por MCP

Guia para outro Claude (ou qualquer harness MCP, inclusive Spring AI MCP Client) usar a base de
conhecimento como **tools nativas**, com as fontes junto — para aprender, entrevistar e construir
**citando**, sem alucinar.

## O que é

`system-design-mcp` é um **MCP server stdio** (Node) que lê os mesmos `knowledge-base/*.json` do
frontend (fonte de verdade única) e expõe 5 tools. **Sem LLM, sem rede, sem banco** em runtime.
A busca e o grafo são o mesmo código usado pelo app (`shared/*.mjs`, ADR-0006).

## Setup (uma vez)

```bash
cd mcp && npm install && npm run build   # dist/server.js
npm run smoke                            # prova que sobe e responde
```

## Registrar

Um MCP stdio **não é daemon** — o harness spawna `node mcp/dist/server.js` e fala por stdin/stdout.
O repo traz `.mcp.json`:

```json
{ "mcpServers": { "system-design": { "command": "node", "args": ["./mcp/dist/server.js"] } } }
```

- Aberto em outra pasta: use **caminho absoluto** para `mcp/dist/server.js`.
- Spring AI MCP Client (stdio): comando `node`, argumento `<repo>/mcp/dist/server.js`; o processo
  precisa enxergar `<repo>/knowledge-base` e `<repo>/shared` (o server resolve os caminhos relativos
  a `dist/`).
  - Consumidor real: **`GFCDOTA/system-design-lab`** (privado), cujo CI roda um contrato contra o
    `main` daqui. Quebram esse contrato: mudar a mensagem `Não encontrado: kind/id` do `get`, os nomes
    das tools (`search`/`list`/`get`/`overview`) ou a lista de kinds do `overview`, e renomear ou
    remover campos de `interview-questions` (`followUps`, `failureInjections`, `redFlags`,
    `expectedSignals`, `strongSignals`, `acceptableSolutions`, `decisionCriteria`, `rubricDimensions`,
    `scoringSignals`, `clarifications`, `howToAnswerInInterview`),
    de `rubrics` ou de `incident-drills` (`scenario`/`hints`/`answer`).

## As 5 tools

| Tool | Input | Pra quê |
|------|-------|---------|
| `overview` | `{}` | contagem + descrição de cada coleção |
| `search` | `{ query, kinds?, limit? }` | achar por **nome ou sintoma**; retorna `{kind,id,title,summary,score,matched,sourceRefs}` |
| `list` | `{ kind }` | `{id,title}` de uma coleção |
| `get` | `{ kind, id }` | item completo com `sourceRefs` (+ `url` verificada) |
| `related` | `{ kind, id }` | vizinhança no grafo: arestas de **saída** e de **entrada derivadas** (quem causa, quem exercita, quem diagnostica) |

`kind` ∈ `topics · patterns · flows · interview-questions · diagrams · evidence · ai-glossary ·
databases · failure-modes · incident-drills · comparisons · learning-paths · rubrics`.

Compatibilidade: `overview`, `list` e `get` não mudaram; `search` aceita o mesmo input e ganhou só o
campo aditivo `matched`. `related` é nova (operação de grafo — ver ADR-0006).

## Coleções que importam para agentes

- **`failure-modes`** — como sistemas quebram: `productionScenario` (números **didáticos**),
  `failureChain`, `canCause`, `confusedWith`, `symptoms`, `diagnosis` (primeiro sinal, como
  confirmar, causa vs sintoma), `immediateMitigation` vs `longTermSolutions`, `antiPatterns`,
  `tradeOffs`, `observability`, `implementationNotes` e `interview` (ladder junior/senior/staff,
  follow-ups, red flags, strong signals, what-ifs com `leadsTo`).
- **`interview-questions`** — pacote de entrevista: `shortAnswer`, `detailedAnswer`,
  `howToAnswerInInterview`, e (quando existem) `expectedSignals`, `strongSignals`, `redFlags`,
  `followUps`, `failureInjections`, `acceptableSolutions`, `decisionCriteria`, `whatToMonitor`,
  `failureModes`, `relatedQuestions`, `rubricDimensions`. Perguntas entrevistáveis trazem ainda:
  - `scoringSignals`: a **rubrica específica da pergunta**, um sinal verificável por dimensão, `core`
    (esperado na resposta) ou `followup` (só conta se o aprofundamento foi explorado). Avalie a pergunta por
    esses sinais, não pela descrição genérica da dimensão, que menciona circuit breaker, retries etc.
  - `clarifications`: explicação curta, com fonte, para termos que o candidato pode perguntar (ex.:
    rebalance). Explica o conceito sem entregar a solução.
- **`rubrics`** — `system-design-interview`: 8 dimensões (requirements, capacity, architecture,
  data-consistency, reliability, trade-offs, observability, communication), escala 0–5
  (absent → staff signal). **Toda nota precisa citar evidência do transcript**; dimensões não
  exercitadas ficam sem nota.
- **`incident-drills`** — sinais de um incidente, dicas, diagnóstico diferencial e ações.
- **`comparisons`** e **`learning-paths`** — diferenças que confundem e sequências de estudo.

### Política de uso para agentes

- Para **critérios de entrevista** (rubrica, sinais, red flags), a base é *authoritative*.
- Para **fatos técnicos**, a base é referência *grounded* com fontes — mas pode ter lacunas. Em
  conflito relevante, não aceite nem corrija em silêncio: sinalize a divergência e prefira as fontes.
- Números de `productionScenario` e `capacityMath` são exemplos didáticos, não benchmarks.
- Um entrevistador não deve ler a resposta para o candidato: use `failureInjections`/`followUps`
  para explorar o erro (ex.: candidato usa `existsByKey` → pergunte o que acontece com duas requests
  simultâneas).

## Exemplos reais (saída do servidor em 2026-09-13)

```text
search "cliente cobrado duas vezes"   → failure-modes/missing-idempotency | incident-drills/drill-double-charges-peak | interview-questions/q36
search "DB lento pool"                → failure-modes/connection-pool-exhaustion | failure-modes/slow-query | diagrams/fm-connection-pool-exhaustion
search "todos clientes reconectam juntos" → failure-modes/thundering-herd | …
search "fila crescendo"               → failure-modes/no-backpressure | incident-drills/drill-kafka-backlog-campaign | topics/capacity-queueing
search "hot shard"                    → failure-modes/hot-key-partition | interview-questions/q09 | interview-questions/q27
search "same idempotency key different payload" → interview-questions/q36 | patterns/idempotent-request | comparisons/idempotent-request-vs-idempotent-consumer
search "duas requests simultâneas mesma chave"  → interview-questions/q36 | patterns/idempotent-request | …
search "Kafka entregou a mesma mensagem duas vezes" → interview-questions/q02 | patterns/idempotent-consumer | failure-modes/missing-idempotency
related failure-modes/retry-storm     → canCause: cascading-failure, connection-pool-exhaustion, missing-idempotency
                                        causado por: cache-stampede, hot-key-partition, connection-pool-exhaustion, slow-query
```

Formato de um hit:

```json
{
  "kind": "failure-modes",
  "id": "missing-idempotency",
  "title": "Missing Idempotency (Duplicate Side Effects)",
  "summary": "Uma operação com efeito (cobrar, criar pedido, debitar) é executada de novo quando…",
  "score": 219.4,
  "matched": ["cliente", "cobrado", "duplicado"],
  "sourceRefs": [{ "kind": "reference", "source": "Stripe Blog — …", "locator": "stripe.com/blog/idempotency", "url": "https://stripe.com/blog/idempotency" }]
}
```

## Fluxo típico

1. `overview {}` → o que existe.
2. `search { query: "pool sem conexão", limit: 5 }` → candidatos com fontes.
3. `get { kind: "failure-modes", id: "connection-pool-exhaustion" }` → conteúdo completo.
4. `related { kind: "failure-modes", id: "connection-pool-exhaustion" }` → o que causa/é causado,
   drills e perguntas ligadas.
5. **Cite a fonte** (`sourceRefs[].url`).

## Não faça

- Não trate como serviço standing (é spawnado pelo harness).
- Não ignore `sourceRefs` — o valor do lab é responder **com fonte**.
- Não apresente números didáticos como dados de produção de uma empresa.
- Não edite os JSON por aqui; a fonte de verdade é `knowledge-base/` (com schema e testes).
