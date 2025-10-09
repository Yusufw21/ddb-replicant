import { useState, useEffect } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function EditPosts({ posts, setPosts }) {
  const [localPosts, setLocalPosts] = useState(posts);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    descr: "",
    text: "",
    imagePath: null,
  });
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
    if (editingPost) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [editingPost]);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const openModal = (post) => {
    setEditingPost(post);
    setFormData({
      name: post.name,
      descr: post.descr || "",
      text: post.text || "",
      imagePath: null,
    });
  };

  const closeModal = () => {
    setEditingPost(null);
    setFormData({ name: "", descr: "", text: "", imagePath: null });
  };

  const handleInput = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData((prev) => ({ ...prev, [name]: files[0] }));
    else setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const deletePost = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить этот пост?")) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Ошибка при удалении поста");

      setLocalPosts((prev) => prev.filter((p) => p.id !== id));
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    const fd = new FormData();
    if (formData.imagePath) fd.append("imagePath", formData.imagePath);
    fd.append("name", formData.name);
    fd.append("descr", formData.descr);
    fd.append("text", formData.text);

    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        body: fd,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка обновления");
      }

      const updatedPost = await response.json();
      setLocalPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? updatedPost : p))
      );

      setPosts((prev) =>
        prev.map((el) => (el.id === editingPost.id ? updatedPost : el))
      );

      closeModal();
    } catch (err) {
      console.error("Ошибка при редактировании:", err);
      alert(err.message);
    }
  };

  if (isChecking) {
    return (
      <div className="editpost">
        <div className="editpost__loader">
          <div className="editpost__spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Основной контент */}
      <div className="ep-container">
        <header className="ep-header">
          <Link
            to="/admin"
            className="ep-page-close-btn"
            aria-label="Вернуться в админку"
          >
            <X size={24} />
          </Link>
          <h1>Идоракунии хабарҳо</h1>
          <p>
            Дар умум: <span>{localPosts.length} паём </span>
          </p>
        </header>

        <div className="ep-grid">
          {localPosts.map((post) => (
            <div key={post.id} className="ep-card">
              <div className="ep-card-imgwrap">
                <img src={`/uploads/${post.imagePath}`} alt={post.name} />
                <div className="ep-card-overlay">
                  <button
                    onClick={() => openModal(post)}
                    className="ep-btn ep-btn-edit"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="ep-btn ep-btn-del"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="ep-card-body">
                <h3>{post.name}</h3>
                <p className="descr">{post.descr}</p>
                <p className="text">{post.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно */}
      {editingPost && (
        <div className="ep-modal-overlay" onClick={closeModal}>
          <div className="ep-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Танзимоти хабарҳо</h2>
            <form onSubmit={submitEdit}>
              <label>Тасвирро иваз кардан</label>
              <input
                type="file"
                name="imagePath"
                title="Тасвирро инттихоб кунед"
                onChange={handleInput}
              />
              <label>Номи хабар</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInput}
                required
              />
              <label>Маълумоти хабар</label>
              <input
                type="text"
                name="descr"
                value={formData.descr}
                onChange={handleInput}
              />
              <label>Матни хабар</label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInput}
                rows="4"
              ></textarea>
              <div className="ep-modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-cancel"
                >
                  Бекор кардан
                </button>
                <button type="submit" className="btn-submit">
                  Сабт кардан
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
