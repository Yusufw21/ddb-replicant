import {
  BookOpen,
  User,
  GraduationCap,
  FileText,
  ArrowLeft,
  File,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Syllabus() {
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

  const [syllabiByTeacher, setSyllabiByTeacher] = useState({}); // { "Рахимов М": [ {subjectName, filePath}, ... ] }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabi = async () => {
      try {
        const res = await fetch("/api/syllabus/list");
        if (res.ok) {
          const syllabi = await res.json();
          const grouped = {};
          syllabi.forEach((item) => {
            if (!grouped[item.teacherName]) grouped[item.teacherName] = [];
            grouped[item.teacherName].push({
              subjectName: item.subjectName,
              filePath: item.filePath,
            });
          });
          setSyllabiByTeacher(grouped);
        }
      } catch (err) {
        console.error("Хатои боркунии рӯйхати силлабусҳо", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabi();
  }, []);

  const handleOpen = (filePath) => {
    // Открываем файл В БРАУЗЕРЕ (не скачиваем!)
    window.open(`/uploads/syllabi/${filePath}`, "_blank");
  };

  return (
    <div className="syllabus-container">
      <a href="/" className="back-button">
        <ArrowLeft className="back-icon" />
        <span>Назад</span>
      </a>

      <div className="syllabus-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <GraduationCap className="header-icon" />
          </div>
          <h1 className="header-title">Силлабусхои фанхои таълими</h1>
          <p className="header-subtitle">
            Интихоб кунед устодеро барои дидани силлабус
          </p>
        </div>
        <div className="header-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>

      <div className="syllabus-stats">
        <div className="stat-card">
          <BookOpen className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">{teachers.length}</span>
            <span className="stat-label">Устодон</span>
          </div>
        </div>
        <div className="stat-card">
          <FileText className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">
              {Object.values(syllabiByTeacher).reduce(
                (sum, arr) => sum + arr.length,
                0
              )}
            </span>
            <span className="stat-label">Силлабусҳо</span>
          </div>
        </div>
        <div className="stat-card">
          <User className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">12+</span>
            <span className="stat-label">Факулҳо</span>
          </div>
        </div>
      </div>

      <div className="syllabus-grid">
        {teachers.map((teacher) => {
          const syllabi = syllabiByTeacher[teacher] || [];
          return (
            <div key={teacher} className="teacher-card-wrapper">
              <div className="teacher-card">
                <div className="card-background"></div>
                <div className="card-content">
                  <div className="avatar-wrapper">
                    <div className="avatar">
                      <User className="avatar-icon" />
                    </div>
                    <div className="avatar-glow"></div>
                  </div>
                  <div className="teacher-info">
                    <h3 className="teacher-name">{teacher}</h3>
                    {syllabi.length > 0 ? (
                      <div className="subjects-list">
                        {syllabi.map((item, idx) => (
                          <div key={idx} className="subject-item">
                            <File size={14} className="subject-icon" />
                            <span className="subject-name">
                              {item.subjectName}
                            </span>
                            <button
                              className="open-btn"
                              onClick={() => handleOpen(item.filePath)}
                              title={`Намудани силлабуси ${item.subjectName}`}
                            >
                              Намудан
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="teacher-badge error">
                        Силлабус надорад
                      </span>
                    )}
                  </div>
                </div>
                <div className="card-shine"></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="syllabus-footer">
        <div className="footer-content">
          <p className="footer-text">© 2025 Системаи таълимӣ</p>
        </div>
      </div>
    </div>
  );
}
