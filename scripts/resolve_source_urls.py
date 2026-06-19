#!/usr/bin/env python
"""Bake a curl-verified `url` into every sourceRef across the knowledge base.

Rules:
- pdf  -> no url (the workbook has no public link).
- repo -> link to the repository root (always valid); locators are often prose, not file paths.
- reference (microservices.io) -> deep page if it resolves, else the patterns index.
- reference (AI docs) -> the URL embedded in the locator if it resolves, else a known homepage.

Every candidate is verified with `curl` (GET, follow redirects). Only URLs that return < 400
are written. Results are cached per candidate so we hit each URL at most once.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KB = ROOT / "knowledge-base"
FILES = ["topics.json", "patterns.json", "flows.json", "interview-questions.json",
         "diagrams.json", "evidence.json", "ai-agents-glossary.json"]

REPO_ROOTS = {
    "msc-shard-router": "https://github.com/msfidelis/msc-shard-router",
    "msc-transactions-api": "https://github.com/msfidelis/msc-transactions-api",
    "event-source-distributed-ledger": "https://github.com/msfidelis/event-source-distributed-ledger",
}
MS_INDEX = "https://microservices.io/patterns/index.html"
# Fallback homepages for AI references, by a substring of the source name.
AI_HOMEPAGES = {
    "Model Context Protocol": "https://modelcontextprotocol.io",
    "Contextual Retrieval": "https://www.anthropic.com/news/contextual-retrieval",
    "Building Effective Agents": "https://www.anthropic.com/engineering/building-effective-agents",
    "Spec-Driven": "https://github.com/github/spec-kit",
    "Anthropic docs": "https://docs.claude.com",
}

_cache: dict[str, bool] = {}


def resolves(url: str) -> bool:
    if url in _cache:
        return _cache[url]
    try:
        out = subprocess.run(
            ["curl", "-sL", "-m", "15", "-o", os.devnull, "-w", "%{http_code}", url],
            capture_output=True, text=True, timeout=20).stdout.strip()
        ok = out.isdigit() and int(out) < 400
    except Exception:
        ok = False
    _cache[url] = ok
    print(f"  [{'ok ' if ok else 'XX '}] {url}")
    return ok


def url_in_locator(locator: str) -> str | None:
    m = re.search(r"((?:[a-z0-9-]+\.)+[a-z]{2,}(?:/[^\s)]+)?)", locator, re.I)
    if not m:
        return None
    return "https://" + m.group(1).rstrip(".,);")


def homepage_for(source: str) -> str | None:
    for key, url in AI_HOMEPAGES.items():
        if key.lower() in (source or "").lower():
            return url
    return None


def resolve_ref(ref: dict) -> str | None:
    kind = ref.get("kind")
    source = ref.get("source", "")
    locator = ref.get("locator", "")
    if kind == "pdf":
        return None
    if kind == "repo":
        root = REPO_ROOTS.get(source)
        return root if root and resolves(root) else None
    if kind == "reference":
        if source == "microservices.io":
            deep = "https://microservices.io/" + locator.lstrip("/")
            if resolves(deep):
                return deep
            return MS_INDEX if resolves(MS_INDEX) else None
        # AI docs: prefer the URL embedded in the locator, else a known homepage.
        cand = url_in_locator(locator)
        if cand and resolves(cand):
            return cand
        hp = homepage_for(source)
        return hp if hp and resolves(hp) else None
    return None


def walk(node):
    """Yield every sourceRef dict found anywhere in the structure."""
    if isinstance(node, dict):
        for k, v in node.items():
            if k == "sourceRefs" and isinstance(v, list):
                for ref in v:
                    if isinstance(ref, dict):
                        yield ref
            else:
                yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def main():
    total, linked = 0, 0
    for fname in FILES:
        path = KB / fname
        data = json.loads(path.read_text("utf-8"))
        print(f"== {fname} ==")
        for ref in walk(data):
            total += 1
            url = resolve_ref(ref)
            if url:
                ref["url"] = url
                linked += 1
            else:
                ref.pop("url", None)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")
    print(f"\nDone: {linked}/{total} sourceRefs now have a verified url "
          f"({total - linked} are pdf/no-link).")
    if linked == 0:
        sys.exit("No URLs resolved — aborting (network issue?).")


if __name__ == "__main__":
    main()
