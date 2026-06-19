import type { SourceRef } from "../api";

function label(ref: SourceRef): string {
  if (ref.kind === "pdf") return `📖 ${ref.source} ${ref.locator}`;
  if (ref.kind === "repo") return `</> ${ref.source}:${ref.locator}`;
  return `🔗 ${ref.source} ${ref.locator}`;
}

/**
 * Renders the evidence pointers for any item. Links only when the ref carries a `url` (those are
 * curl-verified at build time by scripts/resolve_source_urls.py); pdf/no-link refs render as plain
 * labels. This is the "no claim without a source" UI — and no broken links.
 */
export function SourceRefList({ refs }: { refs: SourceRef[] }) {
  if (!refs?.length) return null;
  return (
    <div className="sourcerefs">
      <span className="sourcerefs-label">Fontes:</span>
      {refs.map((ref, i) => {
        const text = label(ref);
        const title = ref.note ?? undefined;
        return ref.url ? (
          <a key={i} className={`chip src-${ref.kind}`} href={ref.url} target="_blank" rel="noreferrer" title={title}>
            {text}
          </a>
        ) : (
          <span key={i} className={`chip src-${ref.kind}`} title={title}>
            {text}
          </span>
        );
      })}
    </div>
  );
}
