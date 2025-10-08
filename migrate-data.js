const fs = require("fs");
const path = require("path");

// Скрипт для миграции данных из корня проекта в папку data
console.log("🚀 Начинаем миграцию данных...");

const dataDir = path.join(__dirname, "data");
const uploadsDir = path.join(dataDir, "uploads");
const syllabiDir = path.join(uploadsDir, "syllabi");

// Создаем папки если их нет
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("✅ Создана папка data");
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Создана папка data/uploads");
}

if (!fs.existsSync(syllabiDir)) {
  fs.mkdirSync(syllabiDir, { recursive: true });
  console.log("✅ Создана папка data/uploads/syllabi");
}

// Мигрируем базу данных
const oldDbPath = path.join(__dirname, "posts.db");
const newDbPath = path.join(dataDir, "posts.db");

if (fs.existsSync(oldDbPath) && !fs.existsSync(newDbPath)) {
  fs.copyFileSync(oldDbPath, newDbPath);
  console.log("✅ База данных posts.db скопирована в data/");
} else if (fs.existsSync(newDbPath)) {
  console.log("ℹ️ База данных уже существует в data/");
} else {
  console.log("ℹ️ База данных posts.db не найдена в корне");
}

// Мигрируем файлы uploads
const oldUploadsDir = path.join(__dirname, "uploads");
if (fs.existsSync(oldUploadsDir)) {
  const files = fs.readdirSync(oldUploadsDir);

  files.forEach((file) => {
    const oldFilePath = path.join(oldUploadsDir, file);
    const newFilePath = path.join(uploadsDir, file);

    if (fs.statSync(oldFilePath).isFile()) {
      if (!fs.existsSync(newFilePath)) {
        fs.copyFileSync(oldFilePath, newFilePath);
        console.log(`✅ Файл ${file} скопирован в data/uploads/`);
      } else {
        console.log(`ℹ️ Файл ${file} уже существует в data/uploads/`);
      }
    } else if (fs.statSync(oldFilePath).isDirectory()) {
      // Обрабатываем подпапки (например, syllabi)
      const subDirPath = path.join(uploadsDir, file);
      if (!fs.existsSync(subDirPath)) {
        fs.mkdirSync(subDirPath, { recursive: true });
      }

      const subFiles = fs.readdirSync(oldFilePath);
      subFiles.forEach((subFile) => {
        const oldSubFilePath = path.join(oldFilePath, subFile);
        const newSubFilePath = path.join(subDirPath, subFile);

        if (!fs.existsSync(newSubFilePath)) {
          fs.copyFileSync(oldSubFilePath, newSubFilePath);
          console.log(`✅ Файл ${file}/${subFile} скопирован в data/uploads/`);
        } else {
          console.log(
            `ℹ️ Файл ${file}/${subFile} уже существует в data/uploads/`
          );
        }
      });
    }
  });

  console.log("✅ Все файлы из uploads/ скопированы в data/uploads/");
} else {
  console.log("ℹ️ Папка uploads/ не найдена в корне");
}

console.log("🎉 Миграция завершена!");
console.log("");
console.log("📋 Что нужно сделать дальше:");
console.log("1. Создай Volume в Railway с mount path: /app/data");
console.log("2. Закоммить и запушь изменения");
console.log("3. Railway автоматически подключит Volume и данные сохранятся");
