import { useState, useEffect, useRef } from "react";

export default function PostView({
  openWindow,
  setOpenWindow,
  choosedData,
  setChoosedData,
}) {
  const contentRef = useRef(null);
  const overlayRef = useRef(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (openWindow) {
      scrollPositionRef.current =
        window.pageYOffset || document.documentElement.scrollTop;

      const body = document.body;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollPositionRef.current}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";

      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      body.style.touchAction = "none";
      body.style.overscrollBehavior = "none";
    } else {
      const body = document.body;
      const scrollY = scrollPositionRef.current;

      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.paddingRight = "";
      body.style.touchAction = "";
      body.style.overscrollBehavior = "";

      window.scrollTo(0, scrollY);
    }

    return () => {
      const body = document.body;
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.paddingRight = "";
      body.style.touchAction = "";
      body.style.overscrollBehavior = "";
    };
  }, [openWindow]);

  useEffect(() => {
    if (!openWindow || !overlayRef.current) return;

    const handleTouchMove = (e) => {
      const target = e.target;
      const content = contentRef.current;

      if (content && !content.contains(target)) {
        e.preventDefault();
      }
    };

    const overlay = overlayRef.current;

    overlay.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      overlay.removeEventListener("touchmove", handleTouchMove);
    };
  }, [openWindow]);

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) {
      setOpenWindow(false);
    }
  };

  useEffect(() => {
    if (!openWindow) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpenWindow(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [openWindow, setOpenWindow]);

  if (!choosedData) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={`post-view ${openWindow ? "openmenu" : ""}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-title"
    >
      <div className="post-view__image-container">
        <img
          src={`/uploads/${choosedData.imagePath}`}
          alt={choosedData.name}
          className="post-view__image"
          loading="lazy"
          draggable="false"
        />
        <button
          onClick={() => setOpenWindow(false)}
          className="post-view__back"
          aria-label="Закрыть"
          type="button"
        />
      </div>

      <div
        ref={contentRef}
        className="post-view__content"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 id="post-title" className="post-view__title">
          {choosedData.name}
        </h1>

        <p className="post-view__description">{choosedData.descr}</p>

        <div className="post-view__text">{choosedData.text}</div>
      </div>
    </div>
  );
}
