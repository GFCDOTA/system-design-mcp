import { toggleTheme, useTheme } from "../theme";

/** Botão de alternar claro/escuro (fica no rodapé da sidebar). */
export function ThemeToggle() {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
    >
      <span aria-hidden>{dark ? "☀️" : "🌙"}</span>
      {dark ? "Tema claro" : "Tema escuro"}
    </button>
  );
}
