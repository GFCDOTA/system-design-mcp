import type { ReactNode } from "react";

// números/métricas concretos: 50%, O(n), 100ms, 3x, 2 GB, 1.000 req/s…
const NUM_RE = /(\b\d[\d.,]*\s?%|\bO\([^)]{1,12}\)|\b\d[\d.,]*\s?(?:ms|MB|GB|KB|TB|TPS|QPS|req\/s|x|k)\b)/gi;

function withNumbers(text: string): ReactNode {
  const parts = text.split(NUM_RE);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <b key={i} className="reader-num">
        {p}
      </b>
    ) : (
      p
    ),
  );
}

/**
 * Realça o ESSENCIAL de um bloco: a frase-chave (primeira sentença, quando há
 * texto substancial depois) num marcador, e os números/métricas em destaque.
 * `on=false` renderiza o texto cru. Não altera o conteúdo — só o visual.
 */
export function Emphasis({ text, on }: { text: string; on: boolean }) {
  if (!on) return <>{text}</>;
  if (text.length < 60) return <>{withNumbers(text)}</>;
  // primeira sentença (25–240 chars) SÓ se sobrar texto substancial depois
  const m = text.match(/^([\s\S]{25,240}?[.!?])(\s[\s\S]{12,})$/);
  if (!m) return <>{withNumbers(text)}</>;
  return (
    <>
      <mark className="reader-key">{withNumbers(m[1])}</mark>
      {withNumbers(m[2])}
    </>
  );
}
