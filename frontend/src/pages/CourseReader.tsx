import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { coursePdfBase, readingEntry } from "../data/courseRoadmap";

interface PageBlockText {
  n: number;
  blocks: string[];
}
interface PageImage {
  n: number;
  image: string;
}
type ReaderPage = PageBlockText | PageImage;
interface ExtractedDoc {
  file: string;
  stats: { pages: number; textPages: number; imagePages: number };
  pages: ReaderPage[];
}

/** Heurística leve: bloco parece código (chaves, ponto-e-vírgula, palavras-chave Java/SQL). */
function looksLikeCode(text: string): boolean {
  const codey = /[{};]|\b(public|private|class|void|static|new|return|import|package|SELECT|FROM|WHERE|INSERT|UPDATE|@\w+)\b/;
  const lines = text.split("\n");
  const hits = lines.filter((l) => codey.test(l)).length;
  return hits >= 2 || (lines.length > 1 && hits / lines.length > 0.4);
}

/** Pergunta de entrevista: "Q1.", "Question:", ou linha curta terminando em "?". */
function isQuestion(text: string): boolean {
  return /^\s*(Q\d+[.)]|Question\b)/i.test(text) || (text.length < 160 && text.trimEnd().endsWith("?"));
}

function Block({ text }: { text: string }) {
  if (looksLikeCode(text)) return <pre className="reader-code">{text}</pre>;
  if (isQuestion(text)) return <p className="reader-q">{text}</p>;
  return <p className="reader-p">{text}</p>;
}

function PageView({ page, base }: { page: ReaderPage; base: string }) {
  return (
    <section className="reader-page" id={`p${page.n}`}>
      <span className="reader-pagenum">página {page.n}</span>
      {"image" in page ? (
        <img className="reader-img" src={base + page.image} alt={`Página ${page.n} (digitalizada)`} loading="lazy" />
      ) : (
        page.blocks.map((b, i) => <Block key={i} text={b} />)
      )}
    </section>
  );
}

/** /entrevista/curso/:file — lê o material do curso extraído dos PDFs, dentro do app. */
export function CourseReader() {
  const { file = "" } = useParams();
  const nav = useMemo(() => readingEntry(file), [file]);
  const state = useAsync<ExtractedDoc>(
    () =>
      fetch(`${coursePdfBase}extracted/${encodeURIComponent(file)}.json`).then((r) => {
        if (!r.ok) throw new Error(`Material não encontrado (${r.status}). Rode a extração: python scripts/extract_course.py`);
        return r.json();
      }),
    [file],
  );

  const { entry, prev, next } = nav;

  return (
    <div className="reader">
      <div className="reader-bar">
        <Link to="/entrevista/roadmap" className="chip">
          ← Roadmap
        </Link>
        <a href={`${coursePdfBase}${entry?.pdf ?? file + ".pdf"}`} target="_blank" rel="noreferrer" className="chip link">
          PDF original ↗
        </a>
      </div>

      <h1>{entry?.contentLabel ?? file}</h1>
      {entry && <p className="muted reader-sub">{entry.moduleTitle}</p>}

      <Async state={state}>
        {(doc) => (
          <>
            <p className="muted reader-meta">
              {doc.stats.pages} página(s){doc.stats.imagePages ? ` · ${doc.stats.imagePages} digitalizada(s)` : ""}
            </p>
            <article className="reader-body">
              {doc.pages.map((p) => (
                <PageView key={p.n} page={p} base={coursePdfBase} />
              ))}
            </article>
          </>
        )}
      </Async>

      <nav className="reader-nav">
        {prev ? (
          <Link to={`/entrevista/curso/${prev.stem}`} className="reader-navlink prev">
            <span className="reader-navdir">← Anterior</span>
            <span className="reader-navlabel">{prev.contentLabel}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/entrevista/curso/${next.stem}`} className="reader-navlink next">
            <span className="reader-navdir">Próximo →</span>
            <span className="reader-navlabel">{next.contentLabel}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
