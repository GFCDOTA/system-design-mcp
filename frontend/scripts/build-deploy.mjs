// Gera um build ENXUTO pra hospedar (deploy). O build normal (dist/) inclui
// TODO o conteúdo local — inclusive os PDFs originais (~148 MB) e as anotações
// manuscritas rasterizadas (~411 MB), que não cabem em host grátis e seriam um
// download lento no celular. Este script copia o dist/ e remove esse peso,
// deixando o app + TODO o conteúdo de TEXTO (kb, 408 perguntas, material do
// curso legível). Saída: dist-deploy/ (poucos MB), pronto pra arrastar no host.
//
// Uso: npm run build && node scripts/build-deploy.mjs   (ou npm run build:deploy)
import { cpSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(root, "dist");
const OUT = join(root, "dist-deploy");

if (!existsSync(DIST)) {
  console.error("[build-deploy] rode `npm run build` antes.");
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
cpSync(DIST, OUT, { recursive: true });

// remove o peso: PDFs originais + imagens dos manuscritos
const course = join(OUT, "course");
if (existsSync(course)) {
  for (const f of readdirSync(course)) if (f.endsWith(".pdf")) rmSync(join(course, f), { force: true });
}
rmSync(join(OUT, "course", "extracted", "img"), { recursive: true, force: true });

// tamanho final
function size(dir) {
  let n = 0;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
    n += s.isDirectory() ? size(p) : s.size;
  }
  return n;
}
console.log(`[build-deploy] dist-deploy pronto: ${(size(OUT) / 1e6).toFixed(1)} MB → ${OUT}`);
