import { useEffect, useRef, useState } from "react";
import { setTheme, useTheme } from "../theme";
import { ACCENTS, setAccent, useAccent } from "../accent";

/** Menu de Aparência (no topo): tema claro/escuro + cor de destaque. */
export function AppearanceMenu() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const accent = useAccent();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="appearance" ref={ref}>
      <button
        type="button"
        className="appearance-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Aparência"
      >
        🎨 Aparência
      </button>
      {open && (
        <div className="appearance-pop" role="menu">
          <div className="appearance-sec">
            <span className="appearance-label">Tema</span>
            <div className="seg">
              <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>
                ☾ Escuro
              </button>
              <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>
                ☀ Claro
              </button>
            </div>
          </div>
          <div className="appearance-sec">
            <span className="appearance-label">Cor de destaque</span>
            <div className="swatches">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  className={`swatch ${accent === a.id ? "active" : ""}`}
                  style={{ background: a.brand }}
                  onClick={() => setAccent(a.id)}
                  aria-label={a.label}
                  title={a.label}
                >
                  {accent === a.id ? "✓" : ""}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
