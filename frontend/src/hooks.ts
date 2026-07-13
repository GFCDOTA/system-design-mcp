import { useCallback, useEffect, useState } from "react";

export interface AsyncState<T> {
  data?: T;
  error?: string;
  loading: boolean;
  /** Reexecuta o loader (botão "Tentar novamente" do estado de erro). */
  retry?: () => void;
}

/* Falha transitória (BFF ainda subindo, rede piscou) se resolve sozinha:
   tenta de novo nesses intervalos antes de mostrar o erro. */
const RETRY_DELAYS_MS = [1200, 2600];

/** Runs an async loader on mount (and when `deps` change). Tiny, no external state lib. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<AsyncState<T>>({ loading: true });
  useEffect(() => {
    let alive = true;
    let timer: number | undefined;
    const run = (attempt: number) => {
      setState((s) => ({ ...s, loading: true, error: undefined }));
      loader()
        .then((data) => alive && setState({ data, loading: false }))
        .catch((e: unknown) => {
          if (!alive) return;
          if (attempt < RETRY_DELAYS_MS.length) {
            timer = window.setTimeout(() => alive && run(attempt + 1), RETRY_DELAYS_MS[attempt]);
          } else {
            setState({ error: e instanceof Error ? e.message : String(e), loading: false });
          }
        });
    };
    run(0);
    return () => {
      alive = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);
  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, retry };
}
