import { useState } from "react";

export default function PostView({
  openWindow,
  setOpenWindow,
  choosedData,
  setChoosedData,
}) {
  const hiddenStyle = {
    transform: "translateX(-100%) ",
    pointerEvents: "none",
    transition: "transform 0.2s ease-in-out",
  };

  const openStyle = {
    transform: "translateX(0) rotateX(0)",
    pointerEvents: "auto",
    transition: "transform 0.2s ease-in-out",
  };

  if (!choosedData) {
    return null; // или можно показать "Выберите пост"
  }
  return (
    <div
      style={!openWindow ? hiddenStyle : openStyle}
      className={`post-view ${openWindow ? "openmenu" : ""}`}
    >
      {/* Изображение — на всю ширину, фиксированная высота */}
      <div className="post-view__image-container">
        <img
          src={`/uploads/${choosedData.imagePath}`}
          alt={choosedData.name}
          className="post-view__image"
          loading="lazy"
        />
        <button
          onClick={() => setOpenWindow(!openWindow)}
          className="post-view__back"
        ></button>
      </div>

      {/* Основной контент */}
      <div className="post-view__content">
        {/* Заголовок */}
        <h1 className="post-view__title">{choosedData.name}</h1>

        {/* Описание */}
        <p className="post-view__description">{choosedData.descr}</p>

        {/* Основной текст */}
        <span className="post-view__text">{choosedData.text}</span>
      </div>
    </div>
  );
}
