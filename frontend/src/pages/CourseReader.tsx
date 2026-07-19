import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { coursePdfBase, readingEntry } from "../data/courseRoadmap";
import { studyReadingEntry } from "../data/studySyllabus";
import { isDone, toggleDone, useProgress } from "../progress";
import { useEmphasis, toggleEmphasis } from "../emphasis";
import { Emphasis } from "../components/Emphasis";
import { Mermaid } from "../components/Mermaid";
import { buildDocMindmap, isQuestionBlock } from "../data/mindmapCourse";

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

function Block({ text, emphasis }: { text: string; emphasis: boolean }) {
  if (looksLikeCode(text)) return <pre className="reader-code">{text}</pre>;
  if (isQuestionBlock(text)) return <p className="reader-q">{text}</p>;
  return (
    <p className="reader-p">
      <Emphasis text={text} on={emphasis} />
    </p>
  );
}

function PageView({ page, base, emphasis }: { page: ReaderPage; base: string; emphasis: boolean }) {
  return (
    <section className="reader-page" id={`p${page.n}`}>
      <span className="reader-pagenum">página {page.n}</span>
      {"image" in page ? (
        <ScanImage src={base + page.image} n={page.n} />
      ) : (
        page.blocks.map((b, i) => <Block key={i} text={b} emphasis={emphasis} />)
      )}
    </section>
  );
}

/** Página manuscrita (imagem). Na versão hospedada as imagens pesadas não vão
 *  junto — se não carregar, mostra um aviso em vez de imagem quebrada. */
function ScanImage({ src, n }: { src: string; n: number }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <p className="reader-scan-missing">
        📄 Página {n} é uma anotação manuscrita (imagem) — disponível na versão do app rodando no seu PC.
      </p>
    );
  return (
    <img
      className="reader-img"
      src={src}
      alt={`Página ${n} (digitalizada)`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Corpo do doc carregado (jump + mapa/texto). Componente próprio (não
 * render-prop) por dois motivos apontados no review: o useMemo evita re-gerar
 * o mapa a cada re-render de scroll, e o key={file} no pai reseta o toggle 🧠
 * ao navegar Anterior/Próximo.
 */
function ReaderDoc({ doc, title, emphasis }: { doc: ExtractedDoc; title: string; emphasis: boolean }) {
  const [map, setMap] = useState(false);
  const mapCode = useMemo(() => buildDocMindmap(doc, title), [doc, title]);
  const hasMap = mapCode.split("\n").length >= 3; // doc só de scans não tem o que mapear
  return (
    <>
      <div className="reader-jump">
        <span className="muted reader-meta">
          {doc.stats.pages} página(s){doc.stats.imagePages ? ` · ${doc.stats.imagePages} digitalizada(s)` : ""}
        </span>
        {hasMap && (
          <button
            type="button"
            className="view-toggle"
            onClick={() => setMap((v) => !v)}
            aria-pressed={map}
            title="Mapa mental do que este material cobre, com a página de cada seção"
          >
            {map ? "📄 Ver texto" : "🧠 Ver como mapa"}
          </button>
        )}
        {!map && doc.pages.length > 8 && (
          <label className="reader-jump-sel">
            Ir para a página
            <select
              defaultValue=""
              onChange={(e) => {
                const el = document.getElementById(`p${e.target.value}`);
                el?.scrollIntoView({ behavior: "smooth" });
                e.target.value = "";
              }}
            >
              <option value="" disabled>
                —
              </option>
              {doc.pages.map((p) => (
                <option key={p.n} value={p.n}>
                  {p.n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {map && hasMap ? (
        <div className="mindmap-wrap">
          <Mermaid code={mapCode} />
        </div>
      ) : (
        <article className="reader-body">
          {doc.pages.map((p) => (
            <PageView key={p.n} page={p} base={coursePdfBase} emphasis={emphasis} />
          ))}
        </article>
      )}
    </>
  );
}

interface NavLink {
  to: string;
  label: string;
}
interface ReaderNav {
  title: string;
  sub?: string;
  back: NavLink;
  prev?: NavLink;
  next?: NavLink;
  pdf: string;
}

/** Resolve rótulos/navegação conforme o workspace (estudos ou entrevista). */
function useReaderNav(file: string, study: boolean): ReaderNav {
  return useMemo(() => {
    if (study) {
      const { entry, prev, next } = studyReadingEntry(file);
      return {
        title: entry?.material.label ?? file,
        sub: entry?.subject.title,
        back: { to: entry ? `/estudos/${entry.subject.id}` : "/estudos", label: entry?.subject.title ?? "Estudos" },
        prev: prev ? { to: `/estudos/ler/${prev.material.stem}`, label: prev.material.label } : undefined,
        next: next ? { to: `/estudos/ler/${next.material.stem}`, label: next.material.label } : undefined,
        pdf: `${file}.pdf`,
      };
    }
    const { entry, prev, next } = readingEntry(file);
    return {
      title: entry?.contentLabel ?? file,
      sub: entry?.moduleTitle,
      back: { to: "/entrevista/roadmap", label: "Roadmap" },
      prev: prev ? { to: `/entrevista/curso/${prev.stem}`, label: prev.contentLabel } : undefined,
      next: next ? { to: `/entrevista/curso/${next.stem}`, label: next.contentLabel } : undefined,
      pdf: entry?.pdf ?? `${file}.pdf`,
    };
  }, [file, study]);
}

/** Leitor do material do curso, dentro do app. Serve ao Modo Estudos e ao Modo Entrevista. */
export function CourseReader() {
  const { file = "" } = useParams();
  const study = useLocation().pathname.startsWith("/estudos");
  useProgress();
  const emphasis = useEmphasis();
  const nav = useReaderNav(file, study);
  const state = useAsync<ExtractedDoc>(
    () =>
      fetch(`${coursePdfBase}extracted/${encodeURIComponent(file)}.json`).then((r) => {
        if (!r.ok) throw new Error(`Material não encontrado (${r.status}). Rode a extração: python scripts/extract_course.py`);
        return r.json();
      }),
    [file],
  );

  const read = isDone(`read:${file}`);

  // progresso de leitura (barra fina no topo) + botão voltar-ao-topo
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
      setShowTop(h.scrollTop > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [file]);

  return (
    <div className="reader">
      <div className="reader-progress" style={{ width: `${progress}%` }} aria-hidden />
      <div className="reader-bar">
        <Link to={nav.back.to} className="chip">
          ← {nav.back.label}
        </Link>
        <a href={`${coursePdfBase}${nav.pdf}`} target="_blank" rel="noreferrer" className="chip link">
          PDF original ↗
        </a>
        <button
          type="button"
          className={`chip emph-toggle ${emphasis ? "on" : ""}`}
          onClick={toggleEmphasis}
          aria-pressed={emphasis}
          title="Realçar a frase-chave e os números de cada resposta"
        >
          ✨ Realce {emphasis ? "ligado" : "desligado"}
        </button>
        {study && (
          <button
            type="button"
            className={`mark-done ${read ? "done" : ""}`}
            onClick={() => toggleDone(`read:${file}`)}
            aria-pressed={read}
          >
            {read ? "✓ Lido" : "Marcar como lido"}
          </button>
        )}
      </div>

      <h1>{nav.title}</h1>
      {nav.sub && <p className="muted reader-sub">{nav.sub}</p>}

      <Async state={state}>
        {(doc) => <ReaderDoc key={file} doc={doc} title={nav.title} emphasis={emphasis} />}
      </Async>

      <nav className="reader-nav">
        {nav.prev ? (
          <Link to={nav.prev.to} className="reader-navlink prev">
            <span className="reader-navdir">← Anterior</span>
            <span className="reader-navlabel">{nav.prev.label}</span>
          </Link>
        ) : (
          <span />
        )}
        {nav.next ? (
          <Link to={nav.next.to} className="reader-navlink next">
            <span className="reader-navdir">Próximo →</span>
            <span className="reader-navlabel">{nav.next.label}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>

      {showTop && (
        <button
          type="button"
          className="reader-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          ↑
        </button>
      )}
    </div>
  );
}
