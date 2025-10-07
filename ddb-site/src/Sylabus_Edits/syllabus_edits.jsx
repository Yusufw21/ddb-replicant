import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function SyllabusEditFull() {
  const teachers = [
    "Чонмахмадзода И",
    "Рахимов М",
    "Иззатулоева Ф",
    "Астанакулов Х",
    "Ширинов Н",
    "Гулов Ш",
    "Гулова М",
    "Мусавирова Р",
    "Хакимов А",
    "Чоршанбиев Н",
    "Мухамадазизи М",
    "Ибрагимов О",
    "Сайдахмадзода И",
    "Аминов С",
    "Гаюров М",
    "Курбонова З",
    "Хасанов Д",
    "Махмадалиев Х",
    "Абдурахимов А",
    "Рахимзода Ш",
    "Тиллоев Ш",
    "Абдулхаков М",
    "Давлатов Х",
    "Фаттидинов Р",
    "Хабибуллозода К",
    "Рачабзода Н",
    "Наимзода Н",
    "Абдуллоев Т",
    "Ибодов М",
    "Курбонов Ф",
    "Худойназаров Р",
    "Баходуров Ф",
    "Кувватова С",
    "Юсупов С",
    "Нуралиева Ш",
    "Расулова Н",
    "Каримова М",
    "Назаров М",
    "Хусейнов З",
    "Ризомова З",
    "Гулова Г",
    "Самадов Ф",
    "Курбоназаров С",
    "Муродов Б",
    "Бобоева Ш",
    "Абдуллоев С",
    "Нематуллоев О",
    "Зарипов М",
    "Кодирзода Б",
    "Мухсиддинова И",
    "Исмоилов А",
    "Валиев Р",
    "Гулов С",
    "Махмадуллоева Х",
    "Менгилиева М",
    "Сатторов Ф",
    "Розикова Ф",
    "Факеров Г",
    "Саидов С",
    "Азизова П",
    "Абдурахимова С",
    "Абдурозиков Э",
    "Абдусамадзода А",
    "Тагоймуродов А",
    "Абдусаломзода А",
    "Пиров А",
    "Валиева Ш",
    "Тешалиев М",
    "Мирзомуродов С",
    "Бобокулов М",
    "Рачабалиев С",
    "Рамазони И",
    "Шарипова М",
    "Мирзорахимов М",
    "Саъдуллоева Н",
    "Шукуров Ч",
    "Зокиров Ш",
  ];

  const [subjects, setSubjects] = useState({});
  const [files, setFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState(teachers);
  const [syllabiList, setSyllabiList] = useState([]); // ← все загруженные силлабусы
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

  // Загружаем список ВСЕХ силлабусов при открытии
  useEffect(() => {
    const fetchSyllabi = async () => {
      try {
        const res = await fetch("/api/syllabus/list");
        if (res.ok) {
          const data = await res.json();
          setSyllabiList(data);
        }
      } catch (err) {
        console.error("❌ Хатои боркунии рӯйхати силлабусҳо", err);
      }
    };
    fetchSyllabi();
  }, []);

  useEffect(() => {
    const filtered = teachers.filter((teacher) =>
      teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchTerm]);

  const handleFileChange = (teacher, event) => {
    const file = event.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [teacher]: file }));
      setUploadStatus((prev) => ({ ...prev, [teacher]: "ready" }));
    }
  };

  const handleSubjectChange = (teacher, value) => {
    setSubjects((prev) => ({ ...prev, [teacher]: value }));
  };

  const handleUpload = async (teacher) => {
    const subject = subjects[teacher]?.trim();
    if (!subject) {
      alert("Лутфан, номи фан ё гурӯҳро ворид кунед!");
      return;
    }

    const file = files[teacher];
    if (!file) {
      setUploadStatus((prev) => ({ ...prev, [teacher]: "error" }));
      setTimeout(() => {
        setUploadStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[teacher];
          return newStatus;
        });
      }, 3000);
      return;
    }

    setUploadStatus((prev) => ({ ...prev, [teacher]: "uploading" }));

    const formData = new FormData();
    formData.append("teacher", teacher);
    formData.append("subject", subject);
    formData.append("syllabus", file);

    try {
      const res = await fetch("/api/syllabus/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setUploadStatus((prev) => ({ ...prev, [teacher]: "success" }));
        // Очистка после загрузки
        setFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[teacher];
          return newFiles;
        });
        setSubjects((prev) => {
          const newSubjects = { ...prev };
          delete newSubjects[teacher];
          return newSubjects;
        });
        // Обновляем список
        const updatedRes = await fetch("/api/syllabus/list");
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setSyllabiList(updatedData);
        }
        setTimeout(() => {
          setUploadStatus((prev) => ({ ...prev, [teacher]: "" }));
        }, 3000);
      } else {
        const errorData = await res.json();
        alert(`Хато: ${errorData.error || "Номаълум"}`);
        setUploadStatus((prev) => ({ ...prev, [teacher]: "error" }));
        setTimeout(() => {
          setUploadStatus((prev) => ({ ...prev, [teacher]: "" }));
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus((prev) => ({ ...prev, [teacher]: "error" }));
      setTimeout(() => {
        setUploadStatus((prev) => ({ ...prev, [teacher]: "" }));
      }, 3000);
    }
  };

  const handleDelete = async (id, teacher) => {
    if (!window.confirm(`Шумо мехоҳед, ки ин силлабусро нобуд кунед?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/syllabus/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Обновляем список
        const updatedRes = await fetch("/api/syllabus/list");
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setSyllabiList(updatedData);
        }
      } else {
        const errorData = await res.json();
        alert(`Хато: ${errorData.error || "Номаълум"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Хатои сервер ҳангоми нобудкунӣ.");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploading":
        return "⏳";
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "ready":
        return "📁";
      default:
        return "📄";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "uploading":
        return "Бор шуда истодааст...";
      case "success":
        return "Муваффақ!";
      case "error":
        return "Хато!";
      case "ready":
        return "Файл интихоб шуд";
      default:
        return "Интихоби файл";
    }
  };

  if (isChecking) {
    return (
      <div className="syllabus">
        <div className="syllabus__loader">
          <div className="syllabus__spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="syllabus-edit-full">
      <a href="/admin" className="admin-close-button">
        <X className="close-icon" />
      </a>

      <div className="syllabus-header">
        <div className="header-content">
          <h1 className="main-title">Идоракунии силлабусҳо</h1>
          <p className="subtitle">Боркунии ва нобудкунии барномаҳои таълимӣ</p>
        </div>

        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Ҷустуҷӯи омӯзгор..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="stats">
            <span className="stat-item">
              Ҳамагӣ: <strong>{teachers.length}</strong>
            </span>
            <span className="stat-item">
              Ёфт шуд: <strong>{filteredTeachers.length}</strong>
            </span>
            <span className="stat-item">
              Бор карда шудааст: <strong>{syllabiList.length}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="teachers-grid">
        {filteredTeachers.map((teacher, index) => {
          // Фильтруем силлабусы только этого учителя
          const teacherSyllabi = syllabiList.filter(
            (s) => s.teacherName === teacher
          );

          return (
            <div
              key={teacher}
              className="teacher-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="teacher-header">
                <div className="teacher-avatar">
                  {teacher.split(" ")[0][0]}
                  {teacher.split(" ")[1][0]}
                </div>
                <div className="teacher-info">
                  <h3 className="teacher-name">{teacher}</h3>
                  <span className="teacher-initials">
                    {teacher.split(" ")[1]} {teacher.split(" ")[0][0]}.
                  </span>
                </div>
                <div
                  className={`status-indicator ${
                    uploadStatus[teacher] || "default"
                  }`}
                >
                  {getStatusIcon(uploadStatus[teacher])}
                </div>
              </div>

              {/* Форма загрузки НОВОГО силлабуса */}
              <div className="file-upload-section">
                <input
                  type="text"
                  placeholder="Номи фан ё гурӯҳ (масалан: Математика 101)"
                  value={subjects[teacher] || ""}
                  onChange={(e) => handleSubjectChange(teacher, e.target.value)}
                  className="subject-input"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    marginBottom: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "0.9rem",
                  }}
                />

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileChange(teacher, e)}
                  className="file-input"
                  id={`file-${teacher}`}
                />

                <div className="file-info">
                  {files[teacher] && (
                    <div className="file-details">
                      <span className="file-name">{files[teacher].name}</span>
                      <span className="file-size">
                        ({(files[teacher].size / 1024 / 1024).toFixed(2)} МБ)
                      </span>
                    </div>
                  )}
                </div>

                <div className="upload-controls">
                  <button
                    className="file-select-btn"
                    onClick={() =>
                      document.getElementById(`file-${teacher}`).click()
                    }
                  >
                    <span className="btn-icon">📎</span>
                    {getStatusText(uploadStatus[teacher])}
                  </button>

                  <button
                    className={`upload-btn ${uploadStatus[teacher]}`}
                    onClick={() => handleUpload(teacher)}
                    disabled={uploadStatus[teacher] === "uploading"}
                  >
                    {uploadStatus[teacher] === "uploading" ? (
                      <>
                        <div className="spinner"></div>
                        Бор шуда истодааст...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">☁️</span>
                        Боркунӣ
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Список УЖЕ ЗАГРУЖЕННЫХ силлабусов */}
              {teacherSyllabi.length > 0 && (
                <div className="existing-syllabi">
                  <h4
                    style={{
                      margin: "1rem 0 0.5rem 0",
                      fontSize: "0.9rem",
                      color: "#6b7280",
                    }}
                  >
                    Бор карда шудааст ({teacherSyllabi.length}):
                  </h4>
                  {teacherSyllabi.map((syllabus) => (
                    <div
                      key={syllabus.id}
                      className="syllabus-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                        {syllabus.subjectName}
                      </span>
                      <button
                        className="delete-mini-btn"
                        onClick={() => handleDelete(syllabus.id, teacher)}
                        style={{
                          background: "#fee2e2",
                          color: "#ef4444",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Нобуд кардан
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadStatus[teacher] === "success" && (
                <div className="success-message">
                  ✅ Силлабус бомуваффақият бор карда шуд!
                </div>
              )}

              {uploadStatus[teacher] === "error" && (
                <div className="error-message">
                  ❌ Хатогӣ ҳангоми боркунӣ. Аз нав кӯшиш кунед.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>Омӯзгорон ёфт нашуданд</h3>
          <p>Дархости ҷустуҷӯро тағйир диҳед</p>
        </div>
      )}
    </div>
  );
}
