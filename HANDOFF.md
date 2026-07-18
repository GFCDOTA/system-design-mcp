# HANDOFF — Base de Prep pra Entrevista (system-design-specialist-lab)

> Fio da meada entre sessões. Seção vazia = pergunta aberta, não "N/A" mudo.
> Atualizado ao FIM da sessão longa de 2026-07-17/18 (kickoff pra próxima).

- **Data / sessão:** 2026-07-18 · sessão longa (conteúdo → estático → UX → aparência → mapa mental)
- **Repo / app:** `E:\Claude\apps\system-design-specialist-lab` · remote `origin` =
  `github.com/fmodesto30/system-design-mcp` (⚠️ transferido p/ `GFCDOTA/system-design-mcp`;
  a URL antiga redireciona, push funciona).
- **Status geral:** 🟢 GREEN — `npm test` 15 verdes, build limpo, app 100% React estático
  (sem Java), working tree limpa, tudo pushado em `main` @ `71abd30`, app servindo (200).

## 1. Objetivo atual
App pessoal de **preparação pra entrevista de SWE**, num espaço só: **Estudar** (material do
curso comprado + trilhas + 408 perguntas de Java + currículo/ATS + validador), **Treinar**
(System Design, DSA, Java Core, comportamental, relatos, roadmap) e **Referência** (KB de
System Design). Home = painel de preparação (confiança + troféus + norte). **Sem LLM em
runtime.** ROI desta sessão: app confiável (estático), legível (reforma de UX), digerível
(realce do essencial + "Ver como mapa"), personalizável (tema + 7 cores) e instalável (PWA).

## 2. Branch atual
- **Branch:** `main` · **HEAD:** `71abd30` (merge do "Ver como mapa").
- **vs `origin/main`:** `0 0` — **100% em sync (pushado)**. Working tree **limpa**.
- Fluxo consolidado: `feat/*` off `main` → `merge --no-ff` → push → delete branch.
- Últimos landes (ordem): reforma UX 15 itens → realce (`17191e5`) → menu Aparência →
  remoção do i18n/PT-EN → mapa mental.

## 3. Arquivos/áreas (estado atual do frontend)
- **`frontend/src/`** — React/Vite/TS, tudo estático:
  - `components/`: AppLayout (nav única c/ ícones, 3 grupos), TopBar (só 🎨 Aparência),
    AppearanceMenu, Breadcrumb, ReadinessDashboard (part=header|detail), Emphasis (realce),
    Progress, CompanyBadges, Mermaid, PrepSection…
  - `pages/`: Home (painel+trilhas), Study/JavaQuestions/StudyTrails/CourseReader (leitor com
    barra sticky, salto por página, progresso, voltar-ao-topo, ✨Realce), Ats/AtsChecker,
    JavaCore, Interview (banco SD com busca+filtro), TopicDetail/PatternDetail (🧠 Ver como mapa).
  - `data/`: api.ts (lê `/kb/*.json`, cache), mindmap.ts (gera Mermaid mindmap da estrutura),
    readiness.js, atsValidator.js, javaCore.ts, studySyllabus/Trails, companySignals, atsGuide,
    courseRoadmap. Raiz src: theme.ts, accent.ts (7 cores), emphasis.ts, progress.ts.
  - `test/` (node --test): route-coverage(4) + ats-validator(5) + readiness(6) = **15**.
  - `scripts/`: kb-to-public.mjs (predev/prebuild), build-deploy.mjs (dist enxuto 7.6MB).
- **Raiz `scripts/`**: extract_course.py (PDFs→JSON/img), extract_qbank.py (408 perguntas).
- ⚠️ **gitignored (privado/derivado):** `frontend/public/course/` (PDFs+extração do curso PAGO,
  ~570MB) e `frontend/public/kb/`. **`bff/` (Java) + `.tools/` = MORTOS** (candidatos a arquivar).

## 4. Decisões tomadas (as desta sessão, com o porquê)
- **Reforma de UX via auditoria multi-agente (ultracode/Workflow):** 5 dimensões → 36 achados →
  plano de 15 itens (CSS/token primeiro, componente depois). Contraste AA no muted, bordas 0.10,
  h3=18/h4=15, medida 68–74ch, leitor 16.5px, ícones na nav, breadcrumbs, leitor navegável,
  busca no banco SD, Home reordenada (ação antes de status), mobile ≥16px/44px.
- **Realce do essencial (✨, default ON):** heurística determinística marca a 1ª sentença
  (frase-chave) + números/métricas — pra SKIMMAR o conteúdo denso. Toggle no leitor.
- **Menu 🎨 Aparência:** tema Escuro/Claro + 7 cores de destaque (accent.ts muda --brand e
  derivados via CSS vars; violeta=default não sobrescreve). Salvo local, aplicado pré-render.
- **i18n/PT-EN REMOVIDO (decisão do Felipe):** o conteúdo tem idioma FIXO (curso=EN, KB/guias=PT);
  o toggle só traduzia menus e confundia ("não tá funcionando"). i18n.ts deletado, strings PT.
- **🧠 "Ver como mapa" (mapa mental):** tópico/padrão vira Mermaid `mindmap` gerado da ESTRUTURA
  (root=título; ramos=Resumo/Conceitos-chave [os **negritos** do texto]/Trade-offs/Em entrevista/
  Relacionados). Determinístico, sem LLM — coerente com a regra-mãe do app.
- (Sessão anterior, ainda vigente): app estático sem BFF; conteúdo pago NUNCA no git; PWA.

## 5. Testes rodados + evidências
- **`cd frontend && npm test`** → **15 testes, 0 falha**. **`npm run build`** → verde (tsc strict).
- **Realce:** verificado ao vivo — 19 frases-chave marcadas no Core Java Nível I, toggle presente.
- **Mapa mental:** CAP-ACID-BASE renderiza **35 nós, 0 erro** de sintaxe Mermaid; screenshot do
  mapa radial correto (root + Conceitos-chave/Trade-offs/Relacionados).
- **Aparência:** clicar "Verde" muda `--brand` p/ #46D17F e propaga (anel de confiança verde); salva.
- **UX:** salto de página (80 opções no doc de 79 pgs), barra sticky, breadcrumb, busca no banco SD —
  tudo verificado no browser. Console: zero erro do app (só warning de HMR websocket, inofensivo).
- **Veredito visual GPT-via-Chrome:** N/A (não é artefato SKP; evidência = screenshots headless).

## 6. Pendências (onde continuar)
1. **iPhone em casa:** falta SÓ a regra de firewall (admin — "Acesso negado" pra mim):
   `netsh advfirewall firewall add rule name="sdlab 5173" dir=in action=allow protocol=TCP localport=5173`
   Depois: Safari → `http://192.168.15.4:5173` → Compartilhar → Adicionar à Tela de Início.
2. **"Ver como mapa" nas perguntas de Java e materiais do curso** — proposto ao Felipe, sem
   resposta ainda. O gerador (mindmap.ts) é reusável; falta definir a projeção por pergunta/doc.
3. **Deploy privado (opcional):** `dist-deploy` (7.6MB, zip 2.2MB no Desktop) pronto; Felipe topou
   "privado com todo o conteúdo" mas depois preferiu local. Se retomar: Cloudflare Pages+Access
   (login é dele; eu dirijo). Manuscritos (411MB) ficariam de fora ou comprimidos (~50MB WebP).
4. **Higiene:** arquivar `bff/` + `.tools/` (mortos desde o app estático).
5. **Emphasis no JavaCore curado** — o realce está no leitor e nas 408 do curso; a página
  `/entrevista/java` (49 curadas) usa markdown próprio e ficou sem — avaliar se vale.

## 7. Riscos / gotchas
- **Service worker serve shell ANTIGO** após deploy → cliente aberto precisa Ctrl+Shift+R (ou
  unregister). Causou vários "não atualizou" na sessão. Headless Chrome fresco pega o novo.
- **Vite morre de vez em quando** (aconteceu 1× nesta sessão, motivo não investigado — janela
  fechada ou crash silencioso). Launcher `SUBIR-SYSTEM-DESIGN.cmd` (Desktop) sobe de volta; é só
  o dev server, o app em si é estático.
- **HMR trava** após editar hooks/módulos com página montada (erro stale de export) → reiniciar
  o vite pelo launcher. `rm node_modules/.vite` e kill de processo exigem permissão nesta máquina.
- **Screenshot da Browser pane TRAVA** (timeout 30s) → usar `chrome.exe --headless=new
  --screenshot=... URL` direto do shell (spawn via node morre no AV; CLI direto passa).
- **`merge_validate_kb.py` é footgun** (regenera KB de `_parts/` stale) — não rodar sem sincronizar.
- **Conteúdo pago NUNCA no git:** checar `git ls-files frontend/public/course frontend/public/kb`
  = 0 antes de push (hoje = 0 ✅).

## 8. Próximos 5 passos (menor risco primeiro)
1. Se o app não estiver de pé: 2 cliques em `SUBIR-SYSTEM-DESIGN.cmd` (Desktop).
   Sinal: `curl localhost:5173 → 200`.
2. **Firewall (admin, 1×)** → instalar no iPhone (§6.1).
3. Decidir: levar o **mapa mental** pras perguntas/materiais (§6.2) — ganho grande de digestão.
4. Arquivar `bff/` + `.tools/` (chore rápido, tira ~500MB e confusão do repo).
5. (se quiser o app no bolso fora de casa) retomar o deploy privado (§6.3).

## 9. Comandos úteis
```bash
REPO="E:/Claude/apps/system-design-specialist-lab"
# rodar (só frontend, sem Java):
cd "$REPO/frontend" && npm run dev -- --host      # http://localhost:5173 (--host = LAN/iPhone)
# testes + build + deploy enxuto:
cd "$REPO/frontend" && npm test                   # 15 (node --test)
cd "$REPO/frontend" && npm run build              # prebuild copia a KB p/ public/kb
cd "$REPO/frontend" && npm run build:deploy       # dist-deploy/ 7.6MB
# regenerar conteúdo do curso (LOCAL):
PY="E:/Claude/apps/sketchup-mcp/.venv/Scripts/python.exe"
"$PY" "$REPO/scripts/extract_course.py" && "$PY" "$REPO/scripts/extract_qbank.py"
# launchers Desktop: SUBIR-SYSTEM-DESIGN.cmd / PARAR-SYSTEM-DESIGN.cmd (só frontend)
```

## 10. O que NÃO fazer
- **Não commitar `frontend/public/course/` nem `public/kb/`** (curso pago + derivado).
- **Não ressuscitar o BFF Java** pra servir dado — o app é estático de propósito.
- **Não reintroduzir o i18n/PT-EN** — decisão explícita do Felipe de remover (conteúdo tem
  idioma fixo); se voltar, é decisão nova dele.
- **Não re-rodar `merge_validate_kb.py`** sem `_parts` sincronizados.
- **Não subir conteúdo pago em host público** — deploy só privado (Access/senha).
- **Não gerar mapa mental via LLM em runtime** — o app é sem-LLM; o mindmap.ts é determinístico.
- **Não push direto sem branch** — `feat/*` → merge `--no-ff` → push → delete.

## 11. Checkpoint p/ próxima sessão
Sessão fechou com TUDO landado e pushado (`main` @ `71abd30`, tree limpa): reforma de UX (15
itens da auditoria), realce do essencial, menu Aparência (tema+7 cores), i18n removido, e o
"Ver como mapa" em tópicos/padrões. App servindo (app/kb/curso = 200). **Primeiro movimento ao
retomar:** conferir `curl localhost:5173 → 200` (se não, launcher do Desktop) e atacar a §6 na
ordem — firewall do iPhone é o quick win. **Sinal de tudo de pé:** 200 no app + `/kb/topics.json`
+ `/course/qbank/java.json`, `npm test` = 15, e nenhum processo Java rodando.
