import { useState, useEffect } from "react";
import { useNavigate, redirect, Link } from "react-router-dom";

export default function LoginScreen() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    navigate("/"); // или window.history.back(), или другая логика
  };

  function openForgotPassword() {
    navigate("/forgotsite");
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const resp = await fetch("/api/admin/auth-status", {
          credentials: "include",
        });
        const data = await resp.json();
        if (data && data.authenticated) {
          navigate("/");
        } else {
          setLoading(false);
        }
      } catch (e) {
        // игнорируем: просто остаёмся на странице логина
        console.error("auth-status check failed", e);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  async function formGrabber(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (formData.get("username") === "") {
      setError("Шумо номи корбарро холӣ гузоштед.");
      return;
    }
    if (formData.get("password") === "") {
      setError("Шумо паролатоно холӣ гузоштед.");
      return;
    }

    const payload = new URLSearchParams();
    payload.append("username", formData.get("username"));
    payload.append("password", formData.get("password"));

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
      });

      const answer = await response.json();

      if (answer.success) {
        window.location.href = "/";
      } else {
        setError(answer.error || "Хатои номаълум");
      }
    } catch (err) {
      console.error(err);
      setError("Хатои шабака. Санҷед пайвастшавӣ.");
    }
  }

  const handleFieldChange = () => {
    if (error) setError("");
  };

  if (loading) {
    return (
      <div className="login">
        <div className="login__loader">
          <div className="login__spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-box">
        <button
          type="button"
          className="login-close-btn"
          onClick={handleClose}
          aria-label="Закрыть"
        >
          ✕
        </button>
        <h2>Ворид ба система</h2>

        <form onSubmit={formGrabber}>
          <div className="form-group">
            <label htmlFor="username">Номи корбар</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Yusuf"
              onChange={handleFieldChange}
              onFocus={handleFieldChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Рамз</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleFieldChange}
              onFocus={handleFieldChange}
            />
          </div>

          <div className="error-container">
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit">Вуруд</button>
        </form>
        <button
          onClick={() => openForgotPassword()}
          className="login-box__forgotPassword"
        >
          Паролро фаромуш кадам
        </button>
      </div>
    </div>
  );
}
