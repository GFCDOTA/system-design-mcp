import { AppearanceMenu } from "./AppearanceMenu";
import { TopSearch } from "../pages/StudyModes";

/** Barra de topo: busca por sintoma/conceito + menu de aparência (tema + cor de destaque). */
export function TopBar() {
  return (
    <div className="topbar">
      <TopSearch />
      <AppearanceMenu />
    </div>
  );
}
