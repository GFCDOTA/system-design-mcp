// Copia o knowledge-base (fonte única, em ../knowledge-base) para public/kb/
// para o app ser 100% ESTÁTICO — sem backend Java. Roda em predev/prebuild.
// public/kb/ é gitignored: é derivado, não versionado.
import { mkdirSync, copyFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, "..", "..", "knowledge-base");
const DEST = join(here, "..", "public", "kb");

// só os JSON de dados na raiz do knowledge-base (ignora _parts/ e schema/)
const files = existsSync(SRC) ? readdirSync(SRC).filter((f) => f.endsWith(".json")) : [];
if (files.length === 0) {
  console.error(`[kb-to-public] nenhum JSON em ${SRC}`);
  process.exit(1);
}
mkdirSync(DEST, { recursive: true });
for (const f of files) copyFileSync(join(SRC, f), join(DEST, f));
console.log(`[kb-to-public] ${files.length} arquivos → public/kb/`);
