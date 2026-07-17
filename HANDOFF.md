# HANDOFF — Base de Prep pra Entrevista (system-design-specialist-lab)

> Fio da meada entre sessões. Seção vazia = pergunta aberta, não "N/A" mudo.
> ⚠️ Este handoff SUBSTITUI o de 2026-06-19 (BFF Java + Docker) — aquele estado
> está OBSOLETO: o app virou **React puro estático, sem backend**.

- **Data / sessão:** 2026-07-17 · sessão longa (app pra entrevista: conteúdo, UI, PWA)
- **Repo / app:** `E:\Claude\apps\system-design-specialist-lab` · remote `origin` =
  `github.com/fmodesto30/system-design-mcp` (⚠️ transferido p/ `GFCDOTA/system-design-mcp`;
  a URL antiga redireciona, o push funciona).
- **Status geral:** 🟢 GREEN — `npm test` 15 verdes, build limpo, app roda 100% no frontend
  (sem Java), working tree limpa, tudo pushado em `main`.

## 1. Objetivo atual
App pessoal de **preparação pra entrevista de SWE**, num espaço só: **Estudar** (material do
curso comprado + trilhas + 408 perguntas de Java + currículo/ATS), **Treinar** (System Design,
DSA, Java Core, comportamental, relatos) e **Referência** (a KB de System Design original).
Home = **painel de preparação** (nível de confiança + troféus + norte de estudo). **Sem LLM em
runtime.** ROI da sessão: tirar toda a dor do backend (virou estático) e deixar instalável no
iPhone (PWA).

## 2. Branch atual
- **Branch:** `main` · **HEAD:** `dc4c832` (merge "build enxuto pra deploy").
- **vs `origin/main`:** `0 0` — **100% em sync (pushado)**. Nada ahead/behind.
- **Working tree:** limpa. Não há nada pendente pra commitar.
- Fluxo da sessão: cada feature em branch `feat/*` off `main` → `merge --no-ff` → push → delete.

## 3. Arquivos/áreas alteradas (nesta sessão)
- **`frontend/src/`** — TODO o produto é React/Vite/TS:
  - `components/AppLayout.tsx` (layout ÚNICO, nav agrupada Estudar/Treinar/Referência), `TopBar.tsx`
    (botões tema + idioma), `ReadinessDashboard.tsx`, `CompanyBadges.tsx`, `Progress.tsx`.
  - `pages/`: Home (painel), Study/JavaQuestions/StudyTrails/CourseReader/Ats/AtsChecker, JavaCore,
    Interview, + as de referência (Topics/Patterns/…).
  - `data/`: `api.ts` (agora lê `/kb/*.json` estático, cache em memória), `readiness.js`(+`.d.ts`),
    `atsValidator.js`(+`.d.ts`), `studySyllabus.ts`, `studyTrails.ts`, `javaCore.ts`, `companySignals.ts`,
    `atsGuide.ts`, `courseRoadmap.ts`, `sampleResume.ts`. `theme.ts`, `i18n.ts`, `progress.ts`.
  - `test/` (node --test): `route-coverage`, `ats-validator`, `readiness` = **15 testes**.
  - `scripts/`: `kb-to-public.mjs` (copia knowledge-base→public/kb no predev/prebuild),
    `build-deploy.mjs` (build enxuto p/ hospedar), `extract_course.py`+`extract_qbank.py` (raiz `scripts/`).
- **`frontend/public/`** — `manifest.webmanifest`, `sw.js` (v2, offline estático), `icons/`.
  ⚠️ **gitignored (derivado/privado):** `public/kb/` (copiado da KB), `public/course/` (PDFs+extração).
- **BFF Java (`bff/`) e `.tools/`** — **APOSENTADOS** (não usados em runtime). Continuam no repo;
  candidatos a arquivar.

## 4. Decisões tomadas
- **App 100% React estático, BFF Java aposentado** (o Java só servia os JSON e vivia caindo — causa
  de TODOS os "500" da sessão). `api.ts` lê `/kb/<coleção>.json` (copiado de `knowledge-base/` no
  predev/prebuild via `kb-to-public.mjs`), projeta lista/detalhe/stats no cliente. MESMA interface,
  zero mudança nas páginas. → não cai, roda offline (SW), sobe em qualquer host estático.
- **UM espaço só** (Felipe escolheu via pergunta): fim do seletor de modo; `AppLayout` único, nav
  agrupada. Router achatado (tudo filho de `/`), PATHS iguais → nenhum link quebrado.
- **Tema ESCURO dim padrão** (#191E26, "não tão escuro") + toggle claro; **i18n PT/EN** — ⚠️ só a
  CASCA traduzida (nav/topo/home); conteúdo das páginas segue PT (a traduzir progressivo).
- **Conteúdo do curso é PRIVADO** (pago): os 89 PDFs + extração + 408 perguntas ficam LOCAIS,
  gitignored. Nunca vão pro repo público. No deploy só entra o TEXTO (kb + perguntas + material
  legível = 7.6MB); manuscritos (imagem, 411MB) e PDFs (148MB) NÃO hospedam.
- **Selos de empresa** (Amazon/Google/…): por TEMA, padrão público conhecido + disclaimer explícito
  — NÃO é do PDF nem oficial. Nunca copiei o currículo-exemplo (PII) nem links promocionais.
- **PWA pra iPhone**, não nativo: App Store exige Mac+Xcode+conta Apple (impossível no Windows).

## 5. Testes rodados + evidências
- **`cd frontend && npm test`** → **15 testes, 0 falha** (route-coverage 4 · ats-validator 5 · readiness 6).
  Os testes de ats/readiness pegaram bugs reais antes (clamp, telefone-lido-como-data, regex cruzando \n).
- **`npm run build`** → verde (tsc strict + vite; prebuild sincroniza a KB).
- **Prova do "sem backend"**: com o **BFF DESLIGADO**, verifiquei ao vivo (browser) — topics(29),
  perguntas(35)+detalhe, stats/inventário, painel: **tudo carrega, 0 erro**. `/kb/*.json` serve 200.
- **PWA**: manifest servido ("Base de Prep pra Entrevista"/"Prep", standalone, 3 ícones); `dist-deploy`
  = **7.6MB** (zip 2.2MB no Desktop `prep-app-para-deploy.zip`).
- **Veredito visual GPT-via-Chrome:** N/A (não é artefato SKP). Screenshots via headless Chrome ao longo.

## 6. Pendências (onde "continuar")
1. **iPhone em casa (LAN):** falta a **regra de firewall** pro celular enxergar o PC — precisa
   **admin** (não consigo elevar):
   `netsh advfirewall firewall add rule name="sdlab 5173" dir=in action=allow protocol=TCP localport=5173`
   Depois: iPhone (mesma Wi-Fi) → Safari `http://192.168.15.4:5173` → Compartilhar → Adicionar à Tela.
   ⚠️ Local = PC ligado + mesma rede + **sem offline** (iOS só liga SW em HTTPS).
2. **Deploy (opcional, se quiser offline/fora de casa):** Felipe topou "privado com todo o conteúdo",
   mas depois inclinou pra "só rodar aqui". `dist-deploy` (7.6MB) pronto. Host: Cloudflare Pages+Access
   (grátis, e-mail-gated = privado de verdade) ou Netlify Drop (rápido, URL secreta). **Login é do Felipe**
   (não manuseio credencial); eu dirijo o upload.
3. **(opcional)** comprimir os 3 manuscritos (411MB→~50MB WebP) pra caberem num deploy.
4. **(opcional)** traduzir as páginas de conteúdo pra EN (hoje só a casca é i18n).
5. **(opcional)** arquivar `bff/` e `.tools/` (JDK) — mortos.

## 7. Riscos / gotchas
- **Service worker serve o shell ANTIGO em cache** após deploy grande → cliente já aberto precisa
  `Ctrl+Shift+R` (ou unregister SW). Foi a causa de vários "por que não atualizou" da sessão. Chrome
  fresco/headless pega o novo na hora.
- **`merge_validate_kb.py` é footgun**: reescreve `knowledge-base/*.json` a partir de `_parts/`
  (gitignored, stale) → pode REVERTER conteúdo. Não rodar sem os `_parts` sincronizados.
- **Editar hooks/módulos com o vite rodando** trava o HMR (erro stale de export que existe) →
  **reiniciar o vite pelo launcher** resolve; `rm .vite`/kill exigem permissão nesta máquina.
- **Screenshot da Browser pane (mcp) TRAVA** (timeout 30s) — usar `chrome.exe --headless=new
  --screenshot=... URL` direto do shell (o spawn via node morre no AV; CLI direto passa).
- **Conteúdo do curso NUNCA vai pro git** (pago). Confirmar `git ls-files frontend/public/course|kb`
  = 0 antes de qualquer push.

## 8. Próximos 5 passos (menor risco primeiro)
1. **Subir o app** (parou): dois cliques em `SUBIR-SYSTEM-DESIGN.cmd` (Desktop) OU
   `cd frontend && npm run dev -- --host`. Sinal: `curl localhost:5173 → 200`.
2. **Regra de firewall** (admin, 1×) pro iPhone conectar — comando na §6.1.
3. iPhone: abrir `http://192.168.15.4:5173`, Adicionar à Tela de Início → app "Prep".
4. Decidir deploy (só se quiser offline/fora de casa) — §6.2.
5. Higiene: arquivar `bff/`+`.tools/`; considerar traduzir 1ª página de conteúdo pra EN.

## 9. Comandos úteis
```bash
REPO="E:/Claude/apps/system-design-specialist-lab"
# rodar (só frontend, sem Java):
cd "$REPO/frontend" && npm run dev -- --host      # http://localhost:5173  (--host = LAN/iPhone)
# testes + build:
cd "$REPO/frontend" && npm test                   # 15 (node --test)
cd "$REPO/frontend" && npm run build              # prebuild copia a KB p/ public/kb
cd "$REPO/frontend" && npm run build:deploy       # dist-deploy/ enxuto (7.6MB) p/ hospedar
# regenerar conteúdo do curso (LOCAL, se sumir):
PY="E:/Claude/apps/sketchup-mcp/.venv/Scripts/python.exe"
"$PY" "$REPO/scripts/extract_course.py"           # PDFs → JSON/imagens (public/course/extracted)
"$PY" "$REPO/scripts/extract_qbank.py"            # perguntas de Java → qbank/java.json
# launcher Desktop: SUBIR-SYSTEM-DESIGN.cmd / PARAR-SYSTEM-DESIGN.cmd  (só frontend agora)
```

## 10. O que NÃO fazer
- **Não commitar `frontend/public/course/` nem `public/kb/`** (curso pago + derivado). Checar
  `git ls-files` antes de push.
- **Não ressuscitar o BFF Java** pra servir dado — o app é estático de propósito. (Pode reusar `bff/`
  se um dia precisar de escrita/persistência, mas não pra leitura da KB.)
- **Não re-rodar `merge_validate_kb.py`** sem os `_parts` sincronizados (reverte conteúdo).
- **Não subir o conteúdo pago num host PÚBLICO** — deploy do curso só privado (Access/senha).
- **Não declarar visual/veredito** que não foi verificado; screenshot = headless Chrome, não a pane.
- **Não push direto sem branch** — fluxo é `feat/*`→merge `--no-ff`→push→delete.

## 11. Checkpoint p/ próxima sessão
Parei depois de: (a) tornar o app **React puro estático** (BFF aposentado, `api.ts` lê `/kb`), (b)
polir o **PWA instalável** (manifest/marca/SW v2), (c) gerar o **build enxuto** (`dist-deploy` 7.6MB,
zip no Desktop) e o fallback de manuscrito. Felipe perguntou "não seria só gerar o app pra rodar
aqui?" — SIM: pra uso local não precisa deploy. **Primeiro movimento ao retomar:** subir o app
(`SUBIR-SYSTEM-DESIGN.cmd`) e criar a **regra de firewall** (admin) pro iPhone. **Sinal de tudo de
pé:** `curl localhost:5173 → 200` e `curl localhost:5173/kb/topics.json → 200` (sem nenhum processo
Java). Working tree limpa em `dc4c832`, sync com `origin/main`.
