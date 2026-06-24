import { Link } from "react-router-dom";
import { api } from "../api";
import { useAsync } from "../hooks";
import { Async } from "../components/States";

export function Labs() {
  const state = useAsync(() => api.labs(), []);
  return (
    <div>
      <h1>Labs de System Design</h1>
      <p className="lede">
        Laboratórios práticos no estilo das perguntas que as empresas cobram. Cada lab traz prompt,
        requisitos, estimativas, deep-dives e uma rubrica de autoavaliação — desenhe a sua solução
        antes de abrir a abordagem de referência.
      </p>
      <Async state={state}>
        {(list) => (
          <div className="card-list">
            {list.map((l) => (
              <Link key={l.id} to={`/labs/${l.id}`} className="list-card">
                <h3>{l.title}</h3>
                <p>{l.summary}</p>
                <div>
                  {l.difficulty ? <span className="badge small">{l.difficulty}</span> : null}
                  {l.companies ? <span className="chip">{l.companies}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Async>
    </div>
  );
}
