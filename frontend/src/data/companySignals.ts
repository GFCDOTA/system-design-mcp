// Selos de empresa nas perguntas — sinal de QUE TEMAS costumam ser cobrados
// em processos de cada big tech.
//
// HONESTIDADE (importante): os PDFs do curso NÃO atribuem perguntas a empresas.
// Estes selos vêm de PADRÕES PÚBLICOS conhecidos de entrevista (relatos agregados
// de candidatos, guias públicos), casados por tema. NÃO é dado oficial, não é do
// curso, e não é garantia — é um indicador de estudo. O disclaimer aparece na UI.

export const companyDisclaimer =
  "Selos por TEMA, com base em relatos públicos agregados e padrões conhecidos de entrevista — indicam o que essas empresas costumam cobrar. Não é dado oficial nem garantia.";

export type Company = "Amazon" | "Google" | "Microsoft" | "Meta" | "Uber" | "Netflix";

interface SignalRule {
  re: RegExp;
  companies: Company[];
  topic: string;
}

// Ordem importa só para o "topic" exibido (o primeiro que casar). Empresas são unidas.
const RULES: SignalRule[] = [
  { re: /\bhash\s?map|hashcode|hash code|\bequals\b|hashing\b/i, companies: ["Amazon", "Microsoft"], topic: "Coleções hash / equals-hashCode" },
  { re: /concurren|multithread|\bthread\b|synchroniz|volatile|deadlock|executor|\block\b|atomic|race condition/i, companies: ["Google", "Uber"], topic: "Concorrência & threads" },
  { re: /garbage|\bgc\b|memory|heap|\bstack\b|jvm|classloader|metaspace|memory leak/i, companies: ["Amazon", "Netflix"], topic: "JVM, memória & GC" },
  { re: /immutab|string pool|\bfinal\b|\bstring\b is/i, companies: ["Microsoft", "Meta"], topic: "Imutabilidade / String" },
  { re: /arraylist|linkedlist|\bcollection|list vs|map vs|\bset\b|\bqueue\b|priorityqueue/i, companies: ["Amazon", "Microsoft"], topic: "Collections" },
  { re: /\bstream\b|lambda|functional|\boptional\b|\bmap\(|flatmap|collectors?/i, companies: ["Google", "Amazon"], topic: "Streams & funcional" },
  { re: /polymorph|inheritance|encapsulat|abstract|\binterface\b|\boop\b|\bsolid\b|design pattern|singleton|factory|builder|observer/i, companies: ["Microsoft", "Uber"], topic: "OOP & design patterns" },
  { re: /exception|try.?catch|finally|\bthrow|checked|unchecked/i, companies: ["Amazon"], topic: "Tratamento de exceções" },
  { re: /generics|wildcard|type erasure|\bpecs\b/i, companies: ["Google"], topic: "Generics" },
  { re: /serializ|serialversionuid/i, companies: ["Amazon"], topic: "Serialização" },
  { re: /spring boot|microservice|rest api|dependency inject|\bbean\b|\bioc\b/i, companies: ["Uber", "Netflix"], topic: "Spring / microservices" },
  { re: /\bsql\b|database|\bjpa\b|transaction|\bindex(ing)?\b|\bacid\b|\bjoin\b/i, companies: ["Amazon", "Meta"], topic: "Dados & SQL" },
];

export interface CompanyBadge {
  company: Company;
  topics: string[];
}

/** Selos (empresa + temas que a associam) para o texto de uma pergunta. */
export function signalsFor(text: string): CompanyBadge[] {
  const byCompany = new Map<Company, Set<string>>();
  for (const rule of RULES) {
    if (rule.re.test(text)) {
      for (const c of rule.companies) {
        const set = byCompany.get(c) ?? new Set<string>();
        set.add(rule.topic);
        byCompany.set(c, set);
      }
    }
  }
  return [...byCompany.entries()].map(([company, topics]) => ({ company, topics: [...topics] }));
}
