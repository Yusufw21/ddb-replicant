import { useEffect } from "react";
export function Scroll_Eraser_Burger(menu_switch) {
  useEffect(() => {
    if (menu_switch) {
      // Простая блокировка скролла
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      // Восстанавливаем скролл
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      // Очистка при размонтировании
      document.body.style.overflow = "";
    };
  }, [menu_switch]);
}

// REMOVES SCROLLING WHEN MENU IS OPEN
