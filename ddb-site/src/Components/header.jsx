import { useEffect } from "react";

export function Header({ isDesktop, isMobile, isTablet, menu, setMenu }) {
  useEffect(() => {
    if (menu) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        window.scrollTo(0, scrollY);
      };
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    }
  }, [menu]);

  return (
    <header className="website__header">
      {isMobile && (
        <div className="website__header__wrapper">
          <button
            onClick={() => setMenu(!menu)}
            className="website__header__wrapper__burger"
            aria-label="Menu"
          />
          <h4 className="website__header__wrapper__title">Тех - иттилооти</h4>
          <button
            className="website__header__wrapper__search"
            aria-label="Search"
          />
        </div>
      )}
      {(isTablet || isDesktop) && (
        <div className="website__header__wrapper">
          <button
            onClick={() => setMenu(!menu)}
            className="website__header__wrapper__burger"
            aria-label="Menu"
          />
          <h4 className="website__header__wrapper__title">Тех - иттилооти</h4>
          <button
            onClick={() => alert("Дар таҳия")}
            className="website__header__wrapper__search"
            aria-label="Search"
          />
        </div>
      )}
    </header>
  );
}
