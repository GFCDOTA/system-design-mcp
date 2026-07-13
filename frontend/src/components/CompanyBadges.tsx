import { signalsFor, type Company } from "../data/companySignals";

const EMOJI: Record<Company, string> = {
  Amazon: "🟧",
  Google: "🔵",
  Microsoft: "🟦",
  Meta: "🔷",
  Uber: "⬛",
  Netflix: "🟥",
};

/** Selos de empresa (por tema) para uma pergunta. Vazio => não renderiza nada. */
export function CompanyBadges({ text }: { text: string }) {
  // até 3 selos (mais temas casados = mais relevante) pra não poluir a linha
  const badges = signalsFor(text)
    .sort((a, b) => b.topics.length - a.topics.length)
    .slice(0, 3);
  if (badges.length === 0) return null;
  return (
    <span className="cbadges">
      {badges.map((b) => (
        <span key={b.company} className="cbadge" title={`Tema cobrado com frequência: ${b.topics.join(", ")}`}>
          <span aria-hidden>{EMOJI[b.company]}</span> {b.company}
        </span>
      ))}
    </span>
  );
}
