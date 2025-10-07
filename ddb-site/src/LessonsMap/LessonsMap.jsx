import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Book, FileText, ZoomIn, X } from "lucide-react";

export default function LessonsMap() {
  const [modalImage, setModalImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const lessons = [
    {
      id: 1,
      title: "Басти 1",
      badge: "Тирамоҳӣ",
      icon: <Book size={28} />,
      image: "/lessonsMap/Basti1.jpg",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 2,
      title: "Басти 2",
      badge: "Баҳорӣ",
      icon: <FileText size={28} />,
      image: "/lessonsMap/Basti2.jpg",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
  ];

  // Блокировка скролла при открытой модалке
  useEffect(() => {
    if (modalImage) {
      // Запоминаем текущую позицию скролла
      const scrollY = window.scrollY;

      // Блокируем скролл
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      // Компенсируем ширину скроллбара
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Сохраняем позицию для восстановления
      document.body.dataset.scrollY = scrollY;

      return () => {
        // Восстанавливаем стили
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";

        // Восстанавливаем позицию скролла
        const savedScrollY = parseInt(document.body.dataset.scrollY || "0", 10);
        delete document.body.dataset.scrollY;

        // Используем setTimeout чтобы гарантировать восстановление после рендера
        setTimeout(() => {
          window.scrollTo(0, savedScrollY);
        }, 0);
      };
    }
  }, [modalImage]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && modalImage) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [modalImage]);

  const openModal = (image) => {
    setModalImage(image);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setModalImage(null);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomToggle = () => {
    if (zoomLevel === 1) {
      setZoomLevel(3.5);
    } else {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (id) => {
    setImageLoaded((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <>
      <div className="lessons-container">
        {/* Анимированный фон */}
        <div className="animated-bg">
          <div className="bg-shape shape-1"></div>
          <div className="bg-shape shape-2"></div>
          <div className="bg-shape shape-3"></div>
        </div>

        {/* Кнопка назад */}
        <button className="close-button" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
          <span>Асосӣ</span>
        </button>

        {/* Заголовок */}
        <div className="lessons-header">
          <div className="header-decoration"></div>
          <h1 className="header-title">
            <span className="title-word">Ҷадвали</span>{" "}
            <span className="title-word">дарсҳо</span>
          </h1>
          <p className="header-subtitle">Нақшаи таълимии семестр</p>
        </div>

        {/* Сетка карточек */}
        <div className="lessons-content">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="lesson-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Заголовок карточки */}
              <div className="card-header" style={{ background: lesson.color }}>
                <div className="card-icon">{lesson.icon}</div>
                <div className="card-title-wrapper">
                  <h2 className="card-title">{lesson.title}</h2>
                  <span className="card-badge">{lesson.badge}</span>
                </div>
              </div>

              {/* Изображение */}
              <div
                className="card-image-wrapper"
                onClick={() => openModal(lesson.image)}
              >
                {!imageLoaded[lesson.id] && (
                  <div className="image-skeleton">
                    <div className="skeleton-shimmer"></div>
                  </div>
                )}
                <img
                  src={lesson.image}
                  alt={`Ҷадвали дарсҳои ${lesson.title}`}
                  className={`card-image ${
                    imageLoaded[lesson.id] ? "loaded" : ""
                  }`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(lesson.id)}
                />
                <div className="image-overlay">
                  <ZoomIn size={24} />
                </div>
              </div>

              {/* Футер */}
              <div className="card-footer">
                <button
                  className="btn-view"
                  onClick={() => openModal(lesson.image)}
                >
                  Кушодан
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно через Portal */}
      {modalImage &&
        createPortal(
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Пӯшидан"
              >
                <X size={24} />
              </button>

              <button
                className="modal-zoom-btn"
                onClick={handleZoomToggle}
                aria-label={zoomLevel === 1 ? "Калон кардан" : "Хурд кардан"}
              >
                {zoomLevel === 1 ? <ZoomIn size={20} /> : "1:1"}
              </button>

              <div
                className="modal-image-wrapper"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  cursor:
                    zoomLevel > 1
                      ? isDragging
                        ? "grabbing"
                        : "grab"
                      : "zoom-in",
                }}
                onClick={(e) => {
                  if (zoomLevel === 1) {
                    e.stopPropagation();
                    handleZoomToggle();
                  }
                }}
              >
                <img
                  src={modalImage}
                  alt="Ҷадвали дарсҳо"
                  className="modal-image"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${
                      position.x / zoomLevel
                    }px, ${position.y / zoomLevel}px)`,
                    transition: isDragging ? "none" : "transform 0.3s ease",
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
