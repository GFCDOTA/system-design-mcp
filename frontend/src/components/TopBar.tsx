import { setTheme, useTheme } from "../theme";
import { setLang, useI18n } from "../i18n";

/** Barra de topo: botões de tema (Escuro/Claro) e idioma (PT/EN). */
export function TopBar() {
  const theme = useTheme();
  const { lang, t } = useI18n();

  return (
    <div className="topbar">
      <div className="seg" role="group" aria-label="Tema">
        <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>
          ☾ {t("top.theme.dark")}
        </button>
        <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>
          ☀ {t("top.theme.light")}
        </button>
      </div>
      <div className="seg" role="group" aria-label="Idioma / Language">
        <button className={lang === "pt" ? "active" : ""} onClick={() => setLang("pt")}>
          PT
        </button>
        <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
          EN
        </button>
      </div>
    </div>
  );
}
