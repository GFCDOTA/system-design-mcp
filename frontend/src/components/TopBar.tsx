import { setLang, useI18n } from "../i18n";
import { AppearanceMenu } from "./AppearanceMenu";

/** Barra de topo: menu de aparência (tema + cor) e idioma (PT/EN). */
export function TopBar() {
  const { lang } = useI18n();
  return (
    <div className="topbar">
      <AppearanceMenu />
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
