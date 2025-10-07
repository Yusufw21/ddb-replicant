import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Menu({ menu }) {
  const [auth, setauth] = useState(null);
  const [location, setlocation] = useState("/login");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth-status", {
          credentials: "include", // ← важно для кук!
        });
        const data = await res.json();
        setauth(data.authenticated); // ← true или false
      } catch (err) {
        setauth(false);
      }
    };
    checkAuth();
  }, []); // ← добавьте пустой deps, чтобы вызывался 1 раз

  const navigate = useNavigate();

  const goToAdmin = () => {
    if (auth) {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  // Базовые стили меню (скрытое состояние)
  const hiddenStyle = {
    transform: "translateX(-100%) ",
    pointerEvents: "none",
    transition: "transform 0.2s ease-in-out",
  };

  // Открытое состояние
  const openStyle = {
    transform: "translateX(0) rotateX(0)",
    pointerEvents: "auto",
    transition: "transform 0.2s ease-in-out",
  };

  return (
    <div
      className={`website__mobilemenu ${menu ? "openmenu" : ""}`}
      style={menu ? openStyle : hiddenStyle}
    >
      <div className="website__mobilemenu__block">
        <div className="website__mobilemenu__block__titlecase">
          <h1 className="website__mobilemenu__block__titlecase__title">
            Танзимот
          </h1>
        </div>
        <div onClick={goToAdmin} className="website__mobilemenu__block__item">
          <div className="website__mobilemenu__block__item__block">
            <img
              src="/Menu/Admin.png"
              alt="Admin"
              className="website__mobilemenu__block__item__block__image"
            />
            <div className="website__mobilemenu__block__item__block__infoblock">
              <h6 className="website__mobilemenu__block__item__block__infoblock__title">
                Корхонаи админ
              </h6>
              <p className="website__mobilemenu__block__item__block__infoblock__descr">
                Корхонаи асосии админи сахифа
              </p>
            </div>
          </div>
          <button className="website__mobilemenu__block__item__block__opening"></button>
        </div>
        <div
          onClick={() => navigate("/lessonsMap")}
          className="website__mobilemenu__block__item"
        >
          <div className="website__mobilemenu__block__item__block">
            <img
              src="/Menu/Lessons.png"
              alt="Lessons"
              className="website__mobilemenu__block__item__block__image"
            />
            <div className="website__mobilemenu__block__item__block__infoblock">
              <h6 className="website__mobilemenu__block__item__block__infoblock__title">
                Чадвалхои дарс
              </h6>
              <p className="website__mobilemenu__block__item__block__infoblock__descr">
                Чадвалхои дарси басти 1 ва 2
              </p>
            </div>
          </div>
          <button className="website__mobilemenu__block__item__block__opening"></button>
        </div>
        <div
          onClick={() => navigate("/syllabus")}
          className="website__mobilemenu__block__item"
        >
          <div className="website__mobilemenu__block__item__block">
            <img
              src="/sillabus/case.png"
              alt="Lessons"
              className="website__mobilemenu__block__item__block__image"
            />
            <div className="website__mobilemenu__block__item__block__infoblock">
              <h6 className="website__mobilemenu__block__item__block__infoblock__title">
                Силлабусхои фанхо
              </h6>
              <p className="website__mobilemenu__block__item__block__infoblock__descr">
                Маводхои дарси ва илми
              </p>
            </div>
          </div>
          <button className="website__mobilemenu__block__item__block__opening"></button>
        </div>
      </div>
    </div>
  );
}
