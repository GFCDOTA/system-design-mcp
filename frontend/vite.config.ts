import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

// App 100% estático — os dados vêm de public/kb/*.json (copiados do
// knowledge-base no predev/prebuild). Sem backend, sem proxy.
// ../shared/*.mjs (busca, grafo e registro de coleções) é o MESMO código usado pelo MCP;
// o dev server precisa de permissão explícita para servir arquivos fora de frontend/.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    fs: { allow: [searchForWorkspaceRoot(process.cwd()), "../shared"] },
  },
});
