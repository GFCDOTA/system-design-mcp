import { AppearanceMenu } from "./AppearanceMenu";

/** Barra de topo: menu de aparência (tema + cor de destaque). */
export function TopBar() {
  return (
    <div className="topbar">
      <AppearanceMenu />
    </div>
  );
}
