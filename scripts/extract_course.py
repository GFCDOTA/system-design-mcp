"""Extrai o material LOCAL do curso (frontend/public/course/*.pdf) para JSON
lido pelo leitor in-app (/entrevista/curso/...).

Saída (tudo DENTRO da pasta gitignored frontend/public/course/):
  extracted/<nome>.json          — páginas com blocos de texto
  extracted/img/<stem>/p<N>.png  — página sem camada de texto (escaneada) vira imagem
  extracted/_index.json          — inventário {nome: {pages, textPages, imagePages}}

O conteúdo do curso é material comprado: NUNCA entra no git (o .gitignore cobre
frontend/public/course/ inteiro). Este script é idempotente — roda de novo só
no que falta; use --force para reextrair tudo.

Uso:  python scripts/extract_course.py [--force]
      (qualquer python com pymupdf instalado)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import fitz  # pymupdf

ROOT = Path(__file__).resolve().parent.parent
COURSE = ROOT / "frontend" / "public" / "course"
OUT = COURSE / "extracted"
IMG_DPI = 120
MIN_TEXT_CHARS = 20  # página com menos que isto = escaneada -> vira imagem
# Digitalizações manuscritas: o PDF tem uma camada de OCR AUTOMÁTICO ilegível
# ("whot is sQL"...). Extrair o texto dela vira lixo — renderiza como imagem.
FORCE_IMAGE = ("hand-written", "handwritten")


def is_scan(stem: str) -> bool:
    s = stem.lower()
    return any(p in s for p in FORCE_IMAGE)


def extract_pdf(pdf_path: Path, force: bool) -> dict:
    out_json = OUT / (pdf_path.stem + ".json")
    if out_json.exists() and not force:
        data = json.loads(out_json.read_text(encoding="utf-8"))
        return data["stats"]

    scan = is_scan(pdf_path.stem)
    doc = fitz.open(pdf_path)
    pages = []
    text_pages = image_pages = 0
    img_dir = OUT / "img" / pdf_path.stem
    for i, page in enumerate(doc, start=1):
        blocks = [
            b[4].strip()
            for b in page.get_text("blocks")
            if b[6] == 0 and b[4].strip()  # só blocos de texto não-vazios
        ]
        total = sum(len(b) for b in blocks)
        if total >= MIN_TEXT_CHARS and not scan:
            pages.append({"n": i, "blocks": blocks})
            text_pages += 1
        else:
            img_dir.mkdir(parents=True, exist_ok=True)
            png = img_dir / f"p{i}.png"
            if not png.exists() or force:
                page.get_pixmap(dpi=IMG_DPI).save(png)
            pages.append({"n": i, "image": f"extracted/img/{pdf_path.stem}/p{i}.png"})
            image_pages += 1
    doc.close()

    stats = {"pages": len(pages), "textPages": text_pages, "imagePages": image_pages}
    out_json.write_text(
        json.dumps({"file": pdf_path.name, "stats": stats, "pages": pages}, ensure_ascii=False),
        encoding="utf-8",
    )
    return stats


def main() -> int:
    force = "--force" in sys.argv
    pdfs = sorted(COURSE.glob("*.pdf"))
    if not pdfs:
        print(f"nenhum PDF em {COURSE} — baixe o material do curso primeiro (_urls.txt)")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    index = {}
    for pdf in pdfs:
        try:
            stats = extract_pdf(pdf, force)
            index[pdf.name] = stats
            print(f"ok  {pdf.name}: {stats['pages']}p ({stats['textPages']} texto, {stats['imagePages']} imagem)")
        except Exception as e:  # um PDF corrompido não derruba o lote
            index[pdf.name] = {"error": str(e)}
            print(f"ERRO {pdf.name}: {e}")
    (OUT / "_index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
    errs = sum(1 for v in index.values() if "error" in v)
    print(f"\n{len(pdfs)} PDFs, {errs} erros -> {OUT}")
    return 0 if errs == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
