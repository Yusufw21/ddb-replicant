import { KeyRound, Send, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordSite() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const keycode = formData.get("keycode");
    const newPassword = formData.get("newPassword");

    if (!keycode) {
      setError("Калидро ворид кунед.");
      return;
    }

    if (!newPassword) {
      setError("Пароли навро ворид кунед.");
      return;
    }

    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keycode, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Хатои сервер");
      } else {
        setSuccess("✅ Парол бо муваффақият иваз шуд.");
        e.target.reset();
        window.location.href = "/";
      }
    } catch (err) {
      setError("Хатои пайвастшавӣ ба сервер");
    }
  };

  return (
    <article className="Forget-block">
      <div className="Forget-block__background">
        <div className="Forget-block__circle Forget-block__circle--1"></div>
        <div className="Forget-block__circle Forget-block__circle--2"></div>
        <div className="Forget-block__circle Forget-block__circle--3"></div>
      </div>

      <div className="Forget-block__container">
        <Link to="/login" className="Forget-block__close">
          <X className="Forget-block__close-icon" />
        </Link>

        <div className="Forget-block__icon-wrapper">
          <KeyRound className="Forget-block__icon" />
        </div>

        <h3 className="Forget-block__title">Барқароркунии парол</h3>

        <aside className="Forget-block__wrapper">
          <form className="Forget-block__formcase" onSubmit={handleSubmit}>
            {/* KEYCODE */}
            <div className="Forget-block__input-group">
              <label htmlFor="keycode" className="Forget-block__keycodelabel">
                Калиди системавиро ворид созед
              </label>
              <div className="Forget-block__input-wrapper">
                <input
                  type="text"
                  name="keycode"
                  id="keycode"
                  className="Forget-block__keycode"
                  placeholder="Калиди худро ворид кунед"
                />
                <div className="Forget-block__input-line"></div>
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="Forget-block__input-group">
              <label
                htmlFor="newPassword"
                className="Forget-block__keycodelabel"
              >
                Пароли нав
              </label>
              <div className="Forget-block__input-wrapper">
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  className="Forget-block__keycode"
                  placeholder="Пароли навро ворид кунед"
                />
                <div className="Forget-block__input-line"></div>
              </div>
            </div>

            <button type="submit" className="Forget-block__send">
              <span className="Forget-block__send-text">Фиристодан</span>
              <Send className="Forget-block__send-icon" />
            </button>
          </form>

          {/* Ошибка */}
          {error && (
            <div className="ps-error">
              <div className="ps-error__icon">⚠</div>
              <span className="ps-error__text">{error}</span>
              <div className="ps-error__progress"></div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
