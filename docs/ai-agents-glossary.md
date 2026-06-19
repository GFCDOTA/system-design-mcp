# Glossário IA & Agentes (pra dev backend)

> **Módulo separado** do System Design. Aqui o domínio é IA/agentes, e as fontes são
> referências de IA (Anthropic, spec do MCP) citadas em **nível de artigo/site** — não
> ancoradas por página como o workbook. É de propósito: não polui a regra de sourcing do
> resto do lab. Servido em `/api/ai-glossary` e na tela "IA & Agentes".

## Enquadramento (a base de tudo)

- **LLM = o MOTOR.** Prevê o próximo token e repete; é stateless (não guarda nada).
- **Harness = a CASCA/runtime** em volta do motor. Dá loop, memória e ferramentas (ex.: Claude Code).
- **Agent = o motor rodando em LOOP dentro do harness, com um objetivo.**
- O resto (MCP, RAG, tool calling, eval…) são **padrões/peças** que rodam sobre essa base.

## Glossário progressivo

Cada termo: **Definição** · **Analogia de backend** · **Equívoco a evitar** (ou **Contraste**, nas comparações).

| Termo | Definição | Analogia backend | Equívoco / Contraste |
|-------|-----------|------------------|----------------------|
| **token** | Menor pedaço de texto que o modelo lê/gera (~pedaço de palavra). | Unidade de I/O do modelo, como o byte num stream. | Token ≠ palavra; nº de caracteres ≠ nº de tokens. |
| **context window** | Teto de tokens (entrada+saída) por chamada. | Tamanho máx. do payload de um request (passou → 413). | Não é memória; o que sai da janela some. |
| **LLM** *(MOTOR)* | Prevê o próximo token, token a token; stateless. | Função pura `f(texto)` / endpoint stateless. | Não pensa, não acessa banco/net, não guarda estado. |
| **prompt** | Todo o texto de entrada de uma chamada. | O request body que você POSTa. | Não é config salva; é remontado a cada chamada. |
| **system prompt** | Parte do prompt com papel/regras, prioridade alta. | Middleware / env global da requisição. | Não é lei inviolável nem segredo seguro. |
| **tool / function calling** | O LLM **PEDE** a chamada estruturada; o harness **EXECUTA**. | LLM = cliente que monta o request; harness = servidor que roda a função. | O modelo não executa nada — só pede. |
| **harness** *(CASCA)* | Runtime que dá loop, memória e tools ao motor. | Application server (Tomcat/Spring) em volta do método. | Harness ≠ modelo; trocar de LLM mantém o harness. |
| **agent** *(MOTOR em LOOP)* | Motor em loop no harness com objetivo. | Worker consumindo fila num while-loop. | Não é modelo "mais esperto"; é o mesmo LLM no loop. |
| **MCP** | Protocolo padrão pra harness descobrir/chamar tools. | OpenAPI/JDBC dos agentes (contrato/driver). | Não dá inteligência; é só encanamento. |
| **RAG** | Buscar trechos externos na hora e injetar no prompt. | Cache-aside / lookup antes de montar a response. | Não muda pesos; saiu da janela, sumiu. |
| **fine-tuning vs RAG** | Fine-tuning muda PESOS; RAG injeta no prompt em runtime. | Recompilar/migrar schema vs query em runtime. | **Contraste:** dado volátil → RAG; estilo fixo → fine-tuning. |
| **SDD** | Spec clara ANTES, como fonte de verdade que guia o agente. | API-first (contrato/OpenAPI antes do código). | Não é doc escrita depois; vem antes e dirige. |
| **eval** | Teste sistemático da saída contra casos esperados. | Suíte de testes/CI do mundo de IA. | "Funcionou uma vez" não é eval. |

## Teste rápido (com gabarito)

1. **Se o LLM é stateless, como o agent "lembra" do que fez 3 passos atrás?**
   → Ele não lembra. O **harness** guarda o histórico e **remonta o prompt** com tudo a cada volta do loop. A memória é o harness recolando contexto, não o modelo. (Igual estado em sessão/banco indo junto em cada request stateless.)
2. **Política que muda toda semana: RAG ou fine-tuning?**
   → **RAG.** Conhecimento volátil você busca fresco e injeta no prompt (atualizar = trocar o doc, e dá pra citar a fonte). Fine-tuning seria re-treinar toda semana — caro e lento.
3. **Numa tool call de saldo, quem decide chamar `getSaldo` e quem executa?**
   → O **LLM PEDE** (decide e emite o pedido), o **harness EXECUTA** (roda e devolve o resultado). Mantra: *LLM pede, harness executa.*
