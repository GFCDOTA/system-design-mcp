# HANDOFF — Base de Prep pra Entrevista (system-design-specialist-lab)

> Fio da meada entre sessões. Seção vazia = pergunta aberta, não "N/A" mudo.
> Atualizado ao FIM da sessão de 2026-07-19 (mapa mental everywhere + BFF aposentado).

- **Data / sessão:** 2026-07-19 · sessão de retomada do handoff de 2026-07-18
- **Repo / app:** `E:\Claude\apps\system-design-specialist-lab` · remote `origin` =
  `github.com/fmodesto30/system-design-mcp` (⚠️ transferido p/ `GFCDOTA/system-design-mcp`;
  a URL antiga redireciona, push funciona).
- **Status geral:** 🟢 GREEN — `npm test` **31 verdes** (15 antigos + 8 mindmap + 2 fixes
  + 6 kb-integrity), build limpo, working tree limpa, `main` @ `a6c9ecc` 100% pushado,
  app servindo (app/kb/qbank = 200). **`bff/` e `.tools/` não existem mais no repo.**

## 1. Objetivo atual
App pessoal de **preparação pra entrevista de SWE**: Estudar (curso + trilhas + 408
perguntas + ATS), Treinar (SD, DSA, Java, comportamental), Referência (KB de SD). **Sem
LLM em runtime.** ROI desta sessão: fechar as pendências do handoff anterior — **"Ver
como mapa" em TODO conteúdo denso** (408 do qbank + 49 curadas do JavaCore + docs do
curso com âncora de página) e **higiene estrutural** (BFF/docker/toolchain fora,
trava da KB preservada).

## 2. Branch atual
- **Branch:** `main` · **HEAD:** `a6c9ecc` (merge do chore do BFF).
- **vs `origin/main`:** em sync (0/0), working tree **limpa**. Fluxo mantido:
  `feat/*`|`chore/*` off `main` → `merge --no-ff` → push → delete branch.
- ⚠️ **2 branches locais NÃO-mergeadas de sessões antigas** (decisão pendente — §6.3):
  `feat/content-batch` (2026-06-19, 2 commits, +664/−40: lote 2 de conteúdo da KB) e
  `feat/system-design-labs` (2026-06-24, 3 commits, +1566/−44: labs hands-on, **construído
  sobre o BFF que agora foi removido**). `feat/interview-mode` e `feat/pwa-ios` já
  estavam em main → deletadas.

## 3. Arquivos alterados (esta sessão, tudo landado)
- **Mapa mental** (merge `d95dd53`): `src/data/mindmapCore.js|.d.ts` (núcleo extraído,
  padrão testável), `mindmap.ts` (agora só as projeções tipadas de tópico/padrão),
  `mindmapCourse.js|.d.ts` (buildQuestionMindmap + buildDocMindmap + isQuestionBlock),
  `pages/JavaQuestions.tsx`, `pages/JavaCore.tsx`, `pages/CourseReader.tsx` (corpo
  extraído pra `ReaderDoc key={file}` com useMemo), `test/mindmap-course.test.mjs` (10),
  `styles.css` (1 linha).
- **Chore BFF** (merge `a6c9ecc`): `bff/` REMOVIDO (histórico preserva), `docker-compose.yml`
  + `frontend/Dockerfile` + `frontend/nginx.conf` removidos, `.gitignore` limpo,
  `.github/workflows/ci.yml` (job Java fora; **`npm test` agora roda no CI**),
  `scripts/{test,build,run}.sh` reescritos frontend-only, `test/kb-integrity.test.mjs`
  (porte 1:1 do KnowledgeBaseIntegrityTest), README/CONTRIBUTING/SECURITY/CHANGELOG.
- **Fora do repo:** `.tools/` (544MB JDK/Maven) e `bff/target/` residual →
  `E:\Claude\archive\old-repos\sdlab-{tools-jdk-maven,bff-target-leftover}\`.
  Desktop: `LIBERAR-IPHONE-5173.cmd` (novo).

## 4. Decisões tomadas
- **Projeção do mapa por pergunta = SENTENÇAS, não blocos:** 375/408 perguntas têm
  resposta de parágrafo único (medido no qbank real) — mapa por bloco seria root+1 ramo.
  Sentenças viram o fan de ideias; enumeração vira folhas; código vira ramo
  "Código de exemplo" com as assinaturas.
- **Botão 🧠 SEMPRE visível por pergunta** (consistência > threshold que pisca) —
  bifurcação consultada no deepseek-r1 local (GPT-Docker :8899 estava OFF): CONVERGE.
- **Doc do curso = outline com âncora `· p.N`** (headings filtrados de "N | P a g e",
  bullets e running headers 3+), modo Q&A quando perguntas dominam, cap 12 ramos com
  excedente declarado ("+N itens neste trecho") — nunca perda silenciosa (achado do review).
- **Realce ✨ NO JavaCore curado: NÃO** — as 49 respostas já têm `**negrito**` do autor;
  realce automático duplicaria. Em troca a página ganhou o mesmo 🧠.
- **Review multi-agente antes do merge** (16 agentes, 9 achados → 4 confirmados após
  refutação adversarial, todos corrigidos; 5 refutados com prova empírica no corpus real).
- **Remover BFF ≠ remover a trava da regra de ouro:** o `KnowledgeBaseIntegrityTest`
  (única enforcement do "nada sem fonte") foi portado 1:1 pra node --test ANTES do
  `git rm` — e agora roda no CI, coisa que o job antigo já fazia mas o frontend não.
- **`.tools/`/target arquivados, não deletados** (convenção do workspace; deletes
  recursivos foram negados pelo harness — respeitado).

## 5. Testes rodados + evidências
- **Suíte:** `cd frontend && npm test` → **31 passed / 0 failed**. `npm run build` →
  verde (tsc strict). CI atualizado roda `npm ci && npm test && npm run build`.
- **Prova nos dados reais:** buildQuestionMindmap nas 408 perguntas → 0 mapas root-only;
  Java-PDF-Notes (79 pgs) → outline de 12 capítulos com páginas; doc Q&A mapeia perguntas.
- **Ao vivo (Browser pane):** clique em pergunta → 🧠 → SVG renderiza, 0 erro Mermaid,
  console limpo; leitor idem (49 nós); JavaCore curado idem. Screenshot da prova
  (headless Chrome, gotcha da pane confirmado de novo) enviado ao Felipe.
- **Veredito visual GPT-via-Chrome:** N/A (feature de UI utilitária, não artefato SKP).

## 6. Pendências
1. **iPhone em casa — falta SÓ o Felipe:** clicar com botão direito →
   "Executar como administrador" em **`Desktop\LIBERAR-IPHONE-5173.cmd`** (novo, idempotente).
   Depois: Safari → `http://192.168.15.4:5173` → Compartilhar → Adicionar à Tela de Início.
2. **Deploy privado (opcional, herdado):** `dist-deploy` pronto; se retomar, Cloudflare
   Pages+Access (login do Felipe; eu dirijo).
3. **Decidir as 2 branches órfãs (§2):** `feat/content-batch` (conteúdo de KB — talvez
   ainda landável com conflitos de conteúdo) e `feat/system-design-labs` (assumia o BFF;
   landar exigiria replantar a UI sobre o app estático). Locais, sem backup remoto.
   Landar, descartar explicitamente, ou arquivar patch em `archive\pending-merge`.
4. **`docs/runbook.md` e `docs/architecture.md`** ainda narram o BFF (docs históricos;
   README/CONTRIBUTING/SECURITY/CLAUDE.md já refletem o estático). Atualizar se incomodar.

## 7. Riscos / gotchas
- **Service worker** serve shell antigo pós-mudança → Ctrl+Shift+R no cliente aberto.
- **HMR trava** após editar módulos com página montada (erros stale no console com
  `?t=` antigo — aconteceu nesta sessão; reload duro resolve; se o vite morrer,
  launcher do Desktop).
- **Screenshot da Browser pane TRAVA** (30s) — confirmado de novo; usar
  `chrome.exe --headless=new --screenshot=...` (a prova desta sessão foi assim).
- **rtk filtra merge-commits do `git log`** — o grafo parece linear; confira com
  `rtk proxy git log --graph` antes de concluir que um merge sumiu.
- **`merge_validate_kb.py` footgun** (regenera de `_parts/` stale) — inalterado.
- **Conteúdo pago NUNCA no git:** `git ls-files frontend/public/course frontend/public/kb`
  = 0 antes de push (verificado nos 2 merges desta sessão ✅).
- **GPT-Docker :8899 estava OFF** nesta sessão — fallback deepseek-r1/Ollama funcionou
  como canal de decisão. Se precisar do juiz visual, subir o Docker primeiro.

## 8. Próximos 5 passos
1. Felipe: 1 clique admin no `LIBERAR-IPHONE-5173.cmd` → app no iPhone (§6.1).
2. Conferir o CI verde no GitHub após os pushes de hoje (agora roda `npm test`).
3. Decidir destino das branches `feat/content-batch` e `feat/system-design-labs` (§6.3).
4. (opcional) Atualizar `docs/runbook.md`/`architecture.md` pro mundo estático (§6.4).
5. (se quiser o app fora de casa) retomar deploy privado (§6.2).

## 9. Comandos úteis
```bash
REPO="E:/Claude/apps/system-design-specialist-lab"
cd "$REPO/frontend" && npm run dev -- --host      # http://localhost:5173 (LAN/iPhone)
cd "$REPO/frontend" && npm test                   # 31 (unit + mindmap + kb-integrity)
cd "$REPO/frontend" && npm run build              # tsc strict + vite (prebuild copia a KB)
cd "$REPO/frontend" && npm run build:deploy       # dist-deploy/ enxuto
bash "$REPO/scripts/test.sh"                      # suíte completa frontend-only
# launchers Desktop: SUBIR-SYSTEM-DESIGN.cmd / PARAR-SYSTEM-DESIGN.cmd
# firewall iPhone (admin, 1×): Desktop\LIBERAR-IPHONE-5173.cmd
```

## 10. O que NÃO fazer
- **Não commitar `frontend/public/course/` nem `public/kb/`** (curso pago + derivado).
- **Não ressuscitar o BFF** — removido de vez; o app é estático de propósito. Se algum
  doc antigo mandar rodar `./mvnw`, o doc é que está desatualizado.
- **Não deletar `feat/content-batch`/`feat/system-design-labs` sem decisão** — têm
  trabalho único (classe B), e não existem no remoto.
- **Não reintroduzir i18n/PT-EN** (decisão explícita do Felipe, sessão anterior).
- **Não gerar mapa mental via LLM em runtime** — mindmapCore/mindmapCourse são
  determinísticos; é regra-mãe do app.
- **Não re-rodar `merge_validate_kb.py`** sem `_parts` sincronizados.
- **Não push direto sem branch** — `feat/*` → merge `--no-ff` → push → delete.

## 11. Checkpoint p/ próxima sessão
Sessão fechou 100% landada e pushada (`main` @ `a6c9ecc`, tree limpa): 🧠 "Ver como
mapa" nas três superfícies (qbank 408, JavaCore 49, docs do curso), review multi-agente
aplicado (4 fixes), BFF/docker/.tools fora do repo com a trava da KB portada pro
`npm test` (que agora roda no CI). **Primeiro movimento ao retomar:** `curl
localhost:5173 → 200` (se não, launcher) e atacar §8 na ordem — o item 1 é do Felipe
(1 clique admin). **Sinal de tudo de pé:** 200 no app + `/kb/topics.json` +
`/course/qbank/java.json`, `npm test` = 31, `git status` limpo em `main` sincronizada.
