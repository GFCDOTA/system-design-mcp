# HANDOFF — Base de Prep pra Entrevista (system-design-mcp)

> Fio da meada entre sessões. Seção vazia = pergunta aberta, não "N/A" mudo.
> Atualizado em 2026-09-13 (sessão "Failure Modes at Scale + idempotência HTTP + base para o Lab").

- **Repo:** `GFCDOTA/system-design-mcp` (público). Clone de trabalho desta sessão: `D:\Claude\system-design-mcp`.
- **Branch:** `feat/interview-knowledge-foundation` → PR para `main` (merge commit, padrão do repo).
- **Status:** 🟢 frontend `npm test` 114/114 + build; MCP build + smoke verdes; 92 URLs de fontes
  verificadas (0 falhas). O CI do `main` estava **vermelho desde julho** (smoke com contagem
  hard-coded) — corrigido nesta branch.

## 1. O que mudou
- **Pilar Produção & Falhas** (ADR-0005): `failure-modes.json` (15), `incident-drills.json` (11),
  `comparisons.json` (15), `learning-paths.json` (6), `rubrics.json` (1); diagramas de
  comportamento (8); exemplos de produção em 6 tópicos.
- **Idempotência HTTP financeira:** `q36` + pattern `idempotent-request` + diagrama
  `financial-http-idempotency`; `q18` ligada; `q02/q31/q35` relacionadas.
- **Pacotes de entrevista** para agentes (follow-ups, red flags, strong signals, failure
  injections, acceptable solutions, decision criteria, rubric dimensions) em 12 perguntas; `q37`
  (cache progressiva) e `q38` (break this system).
- **`shared/`** (ADR-0006): registro de coleções, busca determinística por sintoma e grafo, usados
  pelo MCP e pelo frontend.
- **MCP 0.2.0:** novas coleções nas tools existentes, `search` por sintoma (+`matched`), tool `related`.
- **Frontend:** failure modes, drills, cadeias, quiz/jogo, revisão espaçada, trilhas, busca global;
  Compare lendo a base; SW só em produção.
- **Guards:** schema de toda a base validado em teste; ids únicos; grafo (arestas, cadeias,
  quality gates, órfãos); regressão de busca (46 casos).

## 2. Decisões
- Coleções first-class em vez de inflar tópicos/perguntas (ADR-0005); relação guardada uma vez,
  inverso derivado.
- Busca lexical + sinônimos curados, **sem embeddings** (ADR-0006); `related` é a única tool nova.
- Números de cenário são **didáticos** e rotulados; dado real só com fonte que o publica.
- Draft IETF de Idempotency-Key citado como **expirado**; Builders' Library migrado para SPA não citado.
- Categoria do pattern `idempotent-request` = `API` (taxonomia existente), com keywords de resiliência.

## 3. Pendências / próximos passos
1. Merge do PR desta branch (CI verde) e `git pull --ff-only` no `main`.
2. **`GFCDOTA/system-design-lab`** (repo já existe, privado): Java 21 + Spring AI + Ollama +
   React consumindo este MCP por stdio (ver FOR-AGENTS §Registrar). O Lab deve tratar a rubrica e
   os pacotes de entrevista como authoritative e nunca duplicar a KB.
3. Segunda onda de failure modes com fonte: split brain, clock skew, lost update/write skew, noisy
   neighbor, rebalancing storm.
4. Branch órfã `origin/feat/content-batch` (era BFF): decisão do Felipe — conteúdo já está quase
   todo no `main`.

## 4. Gotchas
- `topics.json`/`patterns.json`/`databases.json` não são JSON canônico: edite com inserção
  textual (diff pequeno), não reserialize.
- `scripts/resolve_source_urls.py` REESCREVE os JSON (formatação muda); para só verificar URLs,
  faça um curl de leitura.
- `scripts/merge_validate_kb.py` regenera de `_parts/` desatualizado — não rodar.
- Conteúdo pago: `git ls-files frontend/public/course frontend/public/kb` = 0 antes de push.
- Se o navegador tiver SW antigo registrado em dev, desregistre (versões anteriores registravam).

## 5. Comandos
```bash
cd frontend && npm ci && npm test && npm run build
cd mcp && npm ci && npm run build && npm run smoke
```
