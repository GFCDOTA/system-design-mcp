import { useState } from "react";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";
import { SourceRefList } from "../components/SourceRefList";

const QUIZ: { q: string; a: string }[] = [
  {
    q: "Se o LLM é stateless, como o agent \"lembra\" do que fez 3 passos atrás?",
    a: "Ele não lembra. O harness guarda o histórico e remonta o prompt com tudo a cada volta do loop — a memória é o harness recolando contexto, não o modelo. (Igual estado em sessão/banco indo junto em cada request stateless.)",
  },
  {
    q: "Política que muda toda semana: RAG ou fine-tuning?",
    a: "RAG. Conhecimento volátil você busca fresco e injeta no prompt (atualizar = trocar o doc, e dá pra citar a fonte). Fine-tuning seria re-treinar toda semana — caro e lento.",
  },
  {
    q: "Numa tool call de saldo, quem decide chamar getSaldo e quem executa?",
    a: "O LLM PEDE (decide e emite o pedido), o harness EXECUTA (roda e devolve o resultado). Mantra: LLM pede, harness executa.",
  },
];

function QuizItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`qa ${open ? "open" : ""}`}>
      <button className="qa-head" onClick={() => setOpen((v) => !v)}>
        <span className="qa-q">{q}</span>
        <span className="qa-toggle">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="qa-body">{a}</div>}
    </div>
  );
}

export function AiGlossary() {
  const state = useAsync(() => api.aiGlossary(), []);
  return (
    <div>
      <h1>IA &amp; Agentes — glossário pra dev backend</h1>
      <p className="lede">
        Trilha <strong>separada</strong> do System Design. Enquadramento: o <strong>LLM é o MOTOR</strong>{" "}
        (prevê o próximo token, stateless); o <strong>harness é a CASCA/runtime</strong> (dá loop, memória,
        ferramentas); o <strong>agent</strong> é esse motor rodando em loop dentro do harness com um objetivo.
        Fontes são referências de IA (Anthropic, spec do MCP), em nível de artigo/site.
      </p>

      <Async state={state}>
        {(list) => (
          <div className="glossary-list">
            {list.map((g) => (
              <div key={g.id} className="glossary-card">
                <div className="glossary-head">
                  <h3>{g.term}</h3>
                  {g.framing ? <span className="badge">{g.framing}</span> : null}
                </div>
                <p>
                  <span className="gl-label">Definição.</span> {g.definition}
                </p>
                <p>
                  <span className="gl-label">Analogia backend.</span> {g.backendAnalogy}
                </p>
                <p>
                  <span className={`gl-label ${g.kind === "comparison" ? "contrast" : "pitfall"}`}>
                    {g.kind === "comparison" ? "Contraste." : "Equívoco a evitar."}
                  </span>{" "}
                  {g.pitfall}
                </p>
                <SourceRefList refs={g.sourceRefs} />
              </div>
            ))}
          </div>
        )}
      </Async>

      <h2>Teste rápido (com gabarito)</h2>
      <div className="qa-list">
        {QUIZ.map((item, i) => (
          <QuizItem key={i} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
