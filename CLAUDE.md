# CLAUDE.md — system-design-specialist-lab ("Base de Prep pra Entrevista")

> Bootloader do app. Fio da meada da última sessão em `HANDOFF.md` (leia primeiro).
> Narrativa em `README.md`; como rodar em `docs/runbook.md`.

## O que é

App pessoal do Felipe de **preparação pra entrevista de SWE** — Estudar (material do curso
comprado + trilhas + perguntas de Java + currículo/ATS) · Treinar (System Design, DSA, Java,
comportamental) · Referência (KB de System Design ancorada no *System Design Workbook* de
M. S. Fidelis + 3 repos de referência + microservices.io). **Sem LLM em runtime.**

**Arquitetura: 100% React estático** (Vite + React + TS). O antigo BFF Java (`bff/`) está
**APOSENTADO** — não é usado em runtime; `api.ts` lê `/kb/*.json` copiados do
`knowledge-base/` no predev/prebuild (`frontend/scripts/kb-to-public.mjs`). PWA instalável.

## Regras-mãe

1. **Toda afirmação na KB tem `sourceRefs`** (`knowledge-base/*.json` é a fonte de verdade).
   Nada de conteúdo inventado; features "inteligentes" (realce, mapa mental) são
   **determinísticas**, sem LLM.
2. **Conteúdo do curso é PAGO e PRIVADO**: `frontend/public/course/` (PDFs + extração +
   qbank) e `frontend/public/kb/` são **gitignored** — NUNCA commitar/publicar. Antes de
   push: `git ls-files frontend/public/course frontend/public/kb` deve dar 0.
3. **Git:** `feat/*` off `main` → `merge --no-ff` → push → delete. Nunca deixar trabalho
   não-landado ao fim da sessão.

## Rodar / testar (esta máquina)

- **Rodar:** `cd frontend && npm run dev -- --host` (:5173) — OU 2 cliques em
  `SUBIR-SYSTEM-DESIGN.cmd` no Desktop (PARAR-… derruba). Sem Java, sem proxy.
- **Testes:** `cd frontend && npm test` (node --test, 15) · **Build:** `npm run build`
  (prebuild sincroniza a KB) · **Deploy enxuto:** `npm run build:deploy` (dist-deploy ~7.6MB).
- **Regenerar conteúdo do curso (local):** venv `E:\Claude\apps\sketchup-mcp\.venv` →
  `scripts/extract_course.py` e `scripts/extract_qbank.py`.
- ⚠️ Gotchas: service worker cacheia shell antigo (Ctrl+Shift+R pós-deploy); HMR trava após
  editar módulos com página aberta → reiniciar o vite pelo launcher; screenshot = headless
  Chrome CLI (a Browser pane trava). Mais em `HANDOFF.md` §7.

## Pipeline de conteúdo da KB (System Design)

`docs/_sources/` (gitignored) → `knowledge-base/_parts/*.json` → `scripts/merge_validate_kb.py`
→ `knowledge-base/*.json`. ⚠️ **Footgun:** merge_validate regenera do `_parts/` stale e pode
REVERTER conteúdo — não rodar sem sincronizar.

## Git / remote

Remote `origin` = `github.com/fmodesto30/system-design-mcp` (transferido p/
`GFCDOTA/system-design-mcp`; URL antiga redireciona). Repo é PÚBLICO — ver regra-mãe 2.
`bff/` + `.tools/` são legado morto (candidatos a arquivar).
