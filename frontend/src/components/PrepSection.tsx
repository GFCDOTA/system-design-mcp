import type { PrepPillar, PrepBlock } from "../data/interviewPrep";

/** Renderiza **negrito** e `code` inline (os itens de prep usam markdown leve). */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== "");
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Items({ block }: { block: PrepBlock }) {
  const lis = block.items.map((it, i) => (
    <li key={i}>
      <Inline text={it} />
    </li>
  ));
  if (block.kind === "steps") return <ol className="steps">{lis}</ol>;
  if (block.kind === "roadmap") return <ol className="steps roadmap">{lis}</ol>;
  if (block.kind === "checklist") return <ul className="checklist">{lis}</ul>;
  return <ul className="prep-tips">{lis}</ul>;
}

/** Renderiza um pilar de preparação (intro + blocos de dicas + recursos externos). */
export function PrepSection({ pillar }: { pillar: PrepPillar }) {
  const withNotes = pillar.resources.filter((r) => r.note);
  return (
    <div className="prep-section">
      {pillar.intro && (
        <p className="lede">
          <Inline text={pillar.intro} />
        </p>
      )}
      {pillar.blocks.map((block, i) => (
        <section key={i} className="prep-block">
          <h3>{block.title}</h3>
          {block.note && <p className="muted prep-note">{block.note}</p>}
          <Items block={block} />
        </section>
      ))}
      {pillar.resources.length > 0 && (
        <section className="prep-block prep-resources">
          <h3>O que usar</h3>
          <div className="chips-row">
            {pillar.resources.map((r, i) => (
              <a key={i} className="chip link" href={r.url} target="_blank" rel="noreferrer" title={r.note ?? r.url}>
                {r.label} ↗
              </a>
            ))}
          </div>
          {withNotes.length > 0 && (
            <ul className="prep-tips res-notes">
              {withNotes.map((r, i) => (
                <li key={i}>
                  <strong>{r.label}.</strong> {r.note}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
