# Runbook — System Design Specialist Lab

Como rodar, testar e operar o Lab localmente. Sem segredos, sem serviços pagos, sem backend.

## Pré-requisitos

- **Node 20+** (validado com Node 24). Python 3 só para scripts de manutenção de fontes.

## Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173 (predev copia knowledge-base/*.json -> public/kb/)
npm run dev -- --host    # exposto na LAN (celular)
npm test                 # schema, integridade, grafo, busca, lógica de estudo, rotas
npm run build            # tsc strict + vite (prebuild sincroniza a KB)
npm run build:deploy     # dist-deploy/ enxuto
```

Se uma tela mostrar "Erro ao carregar /kb/…", rode `npm run sync-kb` e recarregue.

## MCP server

```bash
cd mcp
npm install
npm run build            # dist/server.js
npm run smoke            # sobe via stdio e exercita overview/search/list/get/related
```

Registrar num harness: ver `docs/FOR-AGENTS.md` (o repo traz `.mcp.json`).

## Atalhos

```bash
scripts/test.sh          # frontend: npm test + build
scripts/build.sh         # bundle estático
scripts/run.sh           # dev server com --host
```

## Editar a base

1. Edite `knowledge-base/<coleção>.json` (ver `CONTRIBUTING.md` para campos obrigatórios).
2. `python scripts/resolve_source_urls.py` para (re)verificar `url` das fontes com curl.
3. `cd frontend && npm test` — schema, integridade, grafo e busca.
4. `cd mcp && npm run build && npm run smoke`.

⚠️ `scripts/merge_validate_kb.py` regenera a partir de `knowledge-base/_parts/` (gitignored, pode
estar desatualizado) — não rode sem sincronizar.

## Gotchas

- **Service worker** (só em produção) pode servir o shell antigo após deploy: Ctrl+Shift+R.
- Em dev, se o navegador ainda tiver um SW antigo registrado, desregistre-o (DevTools →
  Application → Service Workers) — versões anteriores registravam SW também em dev.
- `frontend/public/kb/` e `frontend/public/course/` são **gitignored** (derivado e conteúdo pago).
  Antes de push: `git ls-files frontend/public/course frontend/public/kb` deve dar 0.

## Portas

| Porta | Serviço |
|-------|---------|
| 5173 | Frontend (Vite dev) |
| — | MCP (stdio, spawnado pelo harness) |
