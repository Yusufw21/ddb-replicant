const Database = require("better-sqlite3");
const db = new Database("posts.db");
const bcrypt = require("bcrypt");
const path = require("path");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { error } = require("console");
const fs = require("fs");

const env = require("dotenv").config();

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use((req, res, next) => {
  req.isAuthenticated = req.cookies.admin_auth === "true";

  next();
});

// ^ ^ ^ База данных

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    descr TEXT NOT NULL,
    text TEXT NOT NULL,
    imagePath TEXT NOT NULL
  )
`
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL
  )
`
).run();

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS syllabi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacherName TEXT NOT NULL,
    subjectName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacherName, subjectName)
  )
`
).run();

// Миграция старой схемы syllabi -> добавить subjectName и уникальность по (teacherName, subjectName)
try {
  // Попытка обратиться к колонке subjectName; если её нет — выбросит ошибку
  db.prepare("SELECT subjectName FROM syllabi LIMIT 1").get();
} catch (e) {
  try {
    db.exec("BEGIN TRANSACTION");
    db.prepare(
      `
      CREATE TABLE IF NOT EXISTS syllabi__new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacherName TEXT NOT NULL,
        subjectName TEXT NOT NULL,
        filePath TEXT NOT NULL,
        uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(teacherName, subjectName)
      )
    `
    ).run();

    // Если старая таблица не имела subjectName — заполним значением по умолчанию
    const hasOld = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='syllabi'"
      )
      .get();
    if (hasOld) {
      const oldRows = db.prepare("PRAGMA table_info(syllabi)").all();
      const hasSubject = oldRows.some((r) => r.name === "subjectName");
      if (hasSubject) {
        db.prepare(
          `INSERT INTO syllabi__new (id, teacherName, subjectName, filePath, uploadDate)
           SELECT id, teacherName, subjectName, filePath, uploadDate FROM syllabi`
        ).run();
      } else {
        // Переносим, подставляя subjectName как 'Силлабус' по умолчанию
        const rows = db
          .prepare("SELECT id, teacherName, filePath, uploadDate FROM syllabi")
          .all();
        const insertNew = db.prepare(
          `INSERT OR IGNORE INTO syllabi__new (teacherName, subjectName, filePath, uploadDate)
           VALUES (?, ?, ?, ?)`
        );
        for (const r of rows) {
          insertNew.run(r.teacherName, "Силлабус", r.filePath, r.uploadDate);
        }
      }
      db.prepare("DROP TABLE syllabi").run();
    }
    db.prepare("ALTER TABLE syllabi__new RENAME TO syllabi").run();
    db.exec("COMMIT");
    console.log("✅ Миграция таблицы syllabi завершена");
  } catch (mErr) {
    db.exec("ROLLBACK");
    console.error("❌ Ошибка миграции syllabi:", mErr);
  }
}

const AdminUsername = "admin";
const AdminPassword = "882888863";

const existingAdmin = db.prepare("SELECT 1 FROM admin LIMIT 1").get();

if (!existingAdmin) {
  const saltRound = 12;
  const hash = bcrypt.hashSync(AdminPassword, saltRound);

  const insertAdmin = db.prepare(`
    INSERT INTO admin (username, passwordHash)
      VALUES(? , ?)
    `);

  insertAdmin.run(AdminUsername, hash);
  console.log("✅ Админ успешно создан:", AdminUsername);
} else {
  console.log("ℹ️ Админ уже существует, пропускаем создание.");
}

// ^ ^ ^ База данных

const port = process.env.PORT || 3001;

const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://localhost:3001",
  ]);
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Не разрешено политикой CORS"));
    },
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
  };
  // Включаем CORS только для API, чтобы статика assets раздавалась без помех
  app.use("/api", cors(corsOptions));
}

// Настройка CURL безопасности

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

//  ^ ^ ^ Логика сохранения изображения в папку

app.post("/api/posts", upload.single("image"), (req, res) => {
  try {
    const { name, descr, text } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    if (!name || !descr || !text || !imagePath) {
      return res
        .status(400)
        .json({ error: "Пур намудани хама маълумотхо хатмист." });
    }

    const stmt = db.prepare(`
                    INSERT INTO posts (name , descr , text , imagePath)
                    VALUES (?,?,?,?)
                `);

    stmt.run(name, descr, text, imagePath);

    res.json({ message: "Пост успешно сохранен", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ошыбка сервера" });
  }
});

// ^ ^ ^ Сохранение данных в базу

app.get("/api/posts", (req, res) => {
  try {
    const posts = db.prepare("SELECT * FROM posts").all();
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.delete("/api/posts/:id", (req, res) => {
  try {
    const { id } = req.params;

    // Сначала получаем путь к изображению
    const post = db.prepare("SELECT imagePath FROM posts WHERE id = ?").get(id);

    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    // Удаляем пост из базы
    const stmt = db.prepare("DELETE FROM posts WHERE id = ?");
    stmt.run(id);

    // Удаляем файл изображения
    const filePath = path.join(__dirname, "uploads", post.imagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Пост удалён успешно" });
  } catch (error) {
    console.error("Ошибка при удалении поста", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ^ ^ ^ Раздача постов

// Раздаём собранный фронтенд (Vite dist), если он существует
const clientDist = path.join(__dirname, "ddb-site", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

app.post(
  "/api/admin/login",
  express.urlencoded({ extended: true }),
  (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Ном ва рамзро пур кунед." });
    }

    const admin = db
      .prepare("SELECT * FROM admin WHERE username = ?")
      .get(username);

    if (!admin) {
      return res
        .status(401)
        .json({ error: "Номи корбар ё рамз нодуруст аст." });
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Номи корбар ё рамз нодуруст аст." });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 365 * 24 * 60 * 60 * 1000, // ~30 лет
      sameSite: "lax",
    };

    res.cookie("admin_auth", "true", cookieOptions);
    res.json({ success: true, message: "Ворид шудед" });
  }
);

// ^ ^ ^ Проверка данных и создание куки

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("admin_auth");
  res.json({ success: true });
});

// ^ ^ ^ Очистка куки для Logout

app.get("/api/admin/auth-status", (req, res) => {
  res.json({ authenticated: req.isAuthenticated });
});

// ^ ^ ^ Проверка статуса авторизации

app.put("/api/posts/:id", upload.single("imagePath"), (req, res) => {
  try {
    const { id } = req.params;
    const { name, descr, text } = req.body;

    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);

    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    if (req.file && post.imagePath) {
      const oldFile = path.join(__dirname, "uploads", post.imagePath);
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }

    const imagePath = req.file ? req.file.filename : post.imagePath;

    const stmt = db.prepare(`
        UPDATE posts SET
        name = ? , 
        descr = ? , 
        text = ? , 
        imagePath = ?
        WHERE id = ?
      `);

    stmt.run(
      name || post.name,
      descr || post.descr,
      text || post.text,
      imagePath,
      id
    );

    const updatedPost = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера при обновлении поста" });
  }
});

// ^ ^ ^ Обновление поста

app.put("/api/admin/reset-password", async (req, res) => {
  try {
    const { keycode, newPassword } = req.body;

    if (!keycode || !newPassword) {
      return res.status(400).json({ error: "Калид ва парол хатмист." });
    }

    // сверяем с мастер-ключом (нормализуем значения)
    const sanitizeKey = (k) =>
      String(k || "")
        .trim()
        .replace(/^['"]|['"]$/g, "");
    const providedKey = sanitizeKey(keycode);
    const expectedKey = sanitizeKey(process.env.KEYCODE);

    console.log("🔑 Reset-password attempt:", {
      providedLen: providedKey.length,
      expectedLen: expectedKey.length,
    });

    if (!expectedKey) {
      console.warn("⚠️ KEYCODE не задан в переменных окружения");
      return res
        .status(500)
        .json({ error: "KEYCODE дар муҳит муайян нашудааст." });
    }

    if (providedKey !== expectedKey) {
      return res.status(403).json({ error: "Нодуруст калид." });
    }

    // находим админа
    const admin = db
      .prepare("SELECT * FROM admin WHERE username = ?")
      .get("admin");
    if (!admin) {
      return res.status(404).json({ error: "Админ ёфт нашуд." });
    }

    // хэшируем пароль
    const saltRounds = 12;
    const hash = await bcrypt.hash(newPassword, saltRounds);

    db.prepare("UPDATE admin SET passwordHash = ? WHERE id = ?").run(
      hash,
      admin.id
    );

    res.json({ success: true, message: "Парол бо муваффақият иваз шуд." });
  } catch (err) {
    console.error("❌ Ошибка при смене пароля:", err);
    res.status(500).json({ error: "Хатои сервер." });
  }
});

// ^ ^ ^ Смена пароля админа

const syllabusStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const syllabusDir = path.join(__dirname, "uploads", "syllabi");
    if (!fs.existsSync(syllabusDir)) {
      fs.mkdirSync(syllabusDir, { recursive: true });
    }
    cb(null, syllabusDir);
  },
  filename: (req, file, cb) => {
    const teacherName = req.body.teacher?.replace(/\s+/g, "_") || "unknown";
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${teacherName}_${uniqueSuffix}${ext}`);
  },
});

const uploadSyllabus = multer({
  storage: syllabusStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Танҳо .pdf, .doc, .docx, .txt иҷозат аст!"));
    }
  },
});

// ^ ^ ^ Настройка создания папки загрузи файлов силабусов

app.post(
  "/api/syllabus/upload",
  uploadSyllabus.single("syllabus"),
  (req, res) => {
    try {
      const { teacher, subject } = req.body;
      const file = req.file;

      if (!teacher) {
        return res.status(400).json({ error: "Номи омӯзгор хатмист." });
      }
      if (!subject || !String(subject).trim()) {
        return res.status(400).json({ error: "Номи фан хатмист." });
      }

      if (!file) {
        return res.status(400).json({ error: "Файли силлабус интихоб нашуд." });
      }
      const existing = db
        .prepare(
          "SELECT * FROM syllabi WHERE teacherName = ? AND subjectName = ?"
        )
        .get(teacher, subject);
      if (existing) {
        const oldPath = path.join(
          __dirname,
          "uploads",
          "syllabi",
          existing.filePath
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        db.prepare(
          "UPDATE syllabi SET filePath = ? WHERE teacherName = ? AND subjectName = ?"
        ).run(file.filename, teacher, subject);
      } else {
        db.prepare(
          "INSERT INTO syllabi (teacherName, subjectName, filePath) VALUES (?, ?, ?)"
        ).run(teacher, subject, file.filename);
      }

      return res.json({ success: true, message: "Силлабус бор шуд." });
    } catch (err) {
      console.error("❌ Хатои боркунии силлабус:", err);
      if (err.message?.includes("иҷозат аст")) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: "Хатои сервер ҳангоми боркунӣ." });
    }
  }
);

app.get("/api/syllabus/list", (req, res) => {
  try {
    const syllabi = db
      .prepare(
        "SELECT id, teacherName, subjectName, filePath FROM syllabi ORDER BY teacherName, subjectName"
      )
      .all();
    res.json(syllabi);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Хатои сервер" });
  }
});

// ^ ^ ^ Передача списка силабусов

app.delete("/api/syllabus/:id", (req, res) => {
  try {
    const { id } = req.params;
    const record = db
      .prepare("SELECT filePath FROM syllabi WHERE id = ?")
      .get(id);
    if (!record) {
      return res.status(404).json({ error: "Силлабус ёфт нашуд" });
    }
    const filePath = path.join(
      __dirname,
      "uploads",
      "syllabi",
      record.filePath
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    db.prepare("DELETE FROM syllabi WHERE id = ?").run(id);
    res.json({ success: true, message: "Силлабус нобуд карда шуд!" });
  } catch (err) {
    console.error("❌ Хатои нобудкунии силлабус:", err);
    res.status(500).json({ error: "Хатои сервер ҳангоми нобудкунӣ." });
  }
});

// ^ ^ ^ Удаление силабусов

// В сервере (server.js)
app.get("/api/check", (req, res) => {
  if (req.isAuthenticated) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// SPA fallback: все не-API маршруты отдаём index.html, если он есть
app.get(/^(?!\/api|\/uploads).*/, (req, res, next) => {
  const indexPath = path.join(__dirname, "ddb-site", "dist", "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return next();
});

// Обработка необработанных ошибок
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("✅ Process terminated");
    process.exit(0);
  });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
