import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";

/**
 * Página 404 amigável. Ligada ao catch-all `*` do router, então renderiza
 * DENTRO do <Layout> (com a navegação) — o usuário volta com um clique.
 */
export function NotFound() {
  return (
    <div className="page-head">
      <h1>404 — página não encontrada</h1>
      <p className="lede">
        Essa rota não existe. Pode ser um link antigo ou um endereço digitado errado.
      </p>
      <p>
        <Link to="/">← Voltar para o início</Link>
      </p>
    </div>
  );
}

/**
 * errorElement da rota raiz: substitui o boundary padrão do React Router
 * (a tela "Unexpected Application Error") por uma página amigável. Cobre
 * respostas de rota (404 etc.) e erros de runtime.
 */
export function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Erro inesperado.";

  return (
    <div className="page-head">
      <h1>Algo deu errado</h1>
      <p className="lede">Não foi possível carregar esta página.</p>
      <pre className="muted" style={{ whiteSpace: "pre-wrap" }}>
        {detail}
      </pre>
      <p>
        <Link to="/">← Voltar para o início</Link>
      </p>
    </div>
  );
}
