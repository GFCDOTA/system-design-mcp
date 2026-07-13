"""Parseia as perguntas de Java dos PDFs do curso (já extraídos por
extract_course.py) num banco estruturado que o app lê na própria página —
assim não precisa abrir os PDFs.

Entrada:  frontend/public/course/extracted/<Core Java step>.json
Saída:    frontend/public/course/qbank/java.json   (GITIGNORED — é conteúdo do
          curso comprado; nunca entra no repo público)

Formato de saída:
  { "generatedFrom": [...], "levels": [
      { "level": "I", "title": "Core Java — Nível I", "stem": "...",
        "questions": [ { "id": "cj-I-1", "n": 1, "q": "...",
                         "blocks": ["resposta...", "código..."] } ] } ] }

O app renderiza `blocks` com a mesma heurística do leitor (código em mono).
Idempotente: roda de novo = mesmo resultado.

Uso:  python scripts/extract_qbank.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXTRACTED = ROOT / "frontend" / "public" / "course" / "extracted"
OUT = ROOT / "frontend" / "public" / "course" / "qbank"

# Core Java, nível I → V (stem do PDF já extraído, na ordem pedagógica).
LEVELS = [
    ("I", "Core Java — Nível I", "Step-1-Core-Java-Level-I-2"),
    ("II", "Core Java — Nível II", "Step-2-Core-Java-Level-II-2"),
    ("III", "Core Java — Nível III", "Step-3-Core-Java-Level-III-1"),
    ("IV", "Core Java — Nível IV (Avançado)", "Step-4-Core-Java-Level-IV-Advance-Level"),
    ("V", "Core Java — Nível V (Expert)", "Step-5-Core-Java-Level-V-Expert"),
]

# ruído de cabeçalho/rodapé e linhas de índice
NOISE = re.compile(r"GenZ Career on YouTube|Subscribe for Interview|^\s*Index\s*$|…{2,}|\.{6,}", re.I)
# marcador numerado: "Q1.", "Q1)", "1.", "1)"  no início do bloco
Q_MARK = re.compile(r"^\s*(?:Q\s*)?(\d{1,3})\s*[.)]\s*(.+)", re.S)


def clean(text: str) -> str:
    # junta quebras internas do PDF, normaliza espaços
    return re.sub(r"[ \t]*\n[ \t]*", " ", text).strip()


def looks_code(b: str) -> bool:
    # estrito: precisa de sintaxe real (; { }) + keyword — prosa multi-linha NÃO conta
    if "\n" not in b:
        return False
    if (b.count(";") + b.count("{") + b.count("}")) == 0:
        return False
    return bool(re.search(r"[{};]|\b(public|private|protected|class|void|static|return|import|new|@\w+)\b", b))


def is_section_header(line: str) -> bool:
    # linha curta, Title Case, sem "?" nem ponto final — ex.: "Java Fundamentals"
    s = line.strip()
    return 3 < len(s) < 70 and "?" not in s and not s.endswith((".", ":", ";")) and s[:1].isupper() and s == s.title()


def is_question_line(line: str) -> bool:
    s = line.strip()
    return 8 <= len(s) <= 220 and s.endswith("?") and s[:1].isupper()


def parse_numbered(blocks: list[str]) -> list[dict]:
    questions: list[dict] = []
    cur: dict | None = None
    for b in blocks:
        m = Q_MARK.match(b)
        if m and len(m.group(2).strip()) > 3:
            if cur:
                questions.append(cur)
            cur = {"q": clean(m.group(2)), "blocks": []}
        elif cur is not None:
            cur["blocks"].append(b.rstrip() if looks_code(b) else clean(b))
    if cur:
        questions.append(cur)
    return questions


def parse_by_question_line(blocks: list[str]) -> list[dict]:
    """Formato sem numeração: a pergunta é uma linha terminando em '?'."""
    questions: list[dict] = []
    cur: dict | None = None
    for b in blocks:
        if looks_code(b):
            if cur:
                cur["blocks"].append(b.rstrip())
            continue
        lines = b.split("\n")
        for ln in lines:
            s = ln.strip()
            if not s:
                continue
            if is_question_line(s):
                if cur:
                    questions.append(cur)
                cur = {"q": s, "blocks": []}
            elif is_section_header(s) and (cur is None or cur["blocks"]):
                continue  # cabeçalho de seção: ignora
            elif cur is not None:
                cur["blocks"].append(s)
    if cur:
        questions.append(cur)
    # junta linhas soltas da resposta num parágrafo só
    for q in questions:
        merged: list[str] = []
        buf: list[str] = []
        for blk in q["blocks"]:
            if "\n" in blk:  # código já formatado
                if buf:
                    merged.append(" ".join(buf))
                    buf = []
                merged.append(blk)
            else:
                buf.append(blk)
        if buf:
            merged.append(" ".join(buf))
        q["blocks"] = merged
    return questions


def parse_doc(stem: str) -> list[dict]:
    data = json.loads((EXTRACTED / f"{stem}.json").read_text(encoding="utf-8"))
    blocks: list[str] = []
    for p in data["pages"]:
        for b in p.get("blocks", []):
            if not NOISE.search(b):
                blocks.append(b)

    numbered = parse_numbered(blocks)
    if len(numbered) >= 15:
        return numbered
    # poucos marcadores numerados -> formato "pergunta termina em ?"
    return parse_by_question_line(blocks)


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    levels = []
    total = 0
    for lvl, title, stem in LEVELS:
        src = EXTRACTED / f"{stem}.json"
        if not src.exists():
            print(f"AUSENTE {stem} — rode extract_course.py primeiro")
            continue
        qs = parse_doc(stem)
        # descarta itens sem resposta real (ruído de parsing)
        qs = [q for q in qs if len(" ".join(q["blocks"])) >= 15 and len(q["q"]) >= 10]
        for i, q in enumerate(qs, start=1):
            q["id"] = f"cj-{lvl}-{i}"
        levels.append({"level": lvl, "title": title, "stem": stem, "questions": qs})
        total += len(qs)
        print(f"nível {lvl}: {len(qs)} perguntas ({stem})")
    payload = {"generatedFrom": [s for _, _, s in LEVELS], "count": total, "levels": levels}
    (OUT / "java.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"\n{total} perguntas -> {OUT / 'java.json'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
