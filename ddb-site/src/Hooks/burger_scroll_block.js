import { useEffect } from "react";
export function Scroll_Eraser_Burger(menu_switch) {
  useEffect(() => {
    if (menu_switch) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menu_switch]);
}
