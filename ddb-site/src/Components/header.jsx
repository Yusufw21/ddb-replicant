export function Header({ isDesktop, isMobile, isTablet, menu, setMenu }) {
  return (
    <header className="website__header">
      {isMobile && (
        <header className="website__header__wrapper">
          <button
            onClick={() => setMenu(!menu)}
            className="website__header__wrapper__burger"
          ></button>

          <h4 className="website__header__wrapper__title">Тех - иттилооти</h4>

          <button className="website__header__wrapper__search"></button>
        </header>
      )}
      {(isTablet || isDesktop) && (
        <header className="website__header__wrapper">
          <button
            onClick={() => setMenu(!menu)}
            className="website__header__wrapper__burger"
          ></button>

          <h4 className="website__header__wrapper__title">Тех - иттилооти</h4>

          <button className="website__header__wrapper__search"></button>
        </header>
      )}
    </header>
  );
}
