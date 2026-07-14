import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// App 100% estático — os dados vêm de public/kb/*.json (copiados do
// knowledge-base no predev/prebuild). Sem backend, sem proxy.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
