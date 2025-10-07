// AdminPanel.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function AdminPanel() {
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/check", {
          credentials: "include",
        });
        const result = await response.json();

        if (!result.authenticated) {
          window.location.href = "/";
        } else {
          setIsChecking(false);
        }
      } catch (err) {
        console.error("Ошибка проверки:", err);
        window.location.href = "/";
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  async function sendData(e) {
    e.preventDefault();

    const data = new FormData(e.target);

    if (data.get("image") === null || data.get("image").name === "") {
      setError("Шумо тасвирро интихоб накардаед.");
      return;
    }
    if (data.get("name") === "") {
      setError("Шумо номро холӣ гузоштед.");
      return;
    }
    if (data.get("descr") === "") {
      setError("Шумо тавсифро холӣ гузоштед.");
      return;
    }
    if (data.get("text") === "") {
      setError("Шумо матнро холӣ гузоштед.");
      return;
    }

    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Хатои номаълум");
      } else {
        console.log("✅ Успех:", result.message);
        setError("");
        e.target.reset();
        // Редирект на главную страницу после успешного добавления
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Ошибка сети:", err);
      setError("Хатои шабака. Санҷед пайвастшавӣ.");
    }
  }

  async function logout() {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
  }

  if (isChecking) {
    return (
      <div className="admin">
        <div className="admin__loader">
          <div className="admin__spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <button onClick={logout} className="admin__logout">
        <LogOut size={20} />
      </button>

      <div className="admin__card">
        <div className="admin__header">
          <div className="admin__header-top">
            <h1>Хабари нав</h1>
            <Link to="/" className="admin__close-btn">
              ✕
            </Link>
          </div>

          <div className="admin__header-links">
            <Link to="/editpost" className="admin__manage-link">
              Чурсозии хабархо →
            </Link>
            <Link to="/syllabusEdits" className="admin__syllabus-link">
              Чурсозии силабусхо →
            </Link>
          </div>
        </div>

        <form onSubmit={sendData} className="admin__form">
          <input type="file" accept="image/*" name="image" />
          <input
            type="text"
            maxLength={20}
            placeholder="Номи хабар"
            name="name"
          />
          <input
            maxLength={35}
            type="text"
            placeholder="Тавсифи хабар"
            name="descr"
          />
          <textarea
            placeholder="Маълумоти хабар"
            rows="6"
            name="text"
          ></textarea>
          <button type="submit">Нашр кардан</button>

          {error && <span className="admin__error">{error}</span>}
        </form>
      </div>
    </div>
  );
}
