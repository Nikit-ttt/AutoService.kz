const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'project.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к SQLite:', err.message);
    } else {
        console.log('Успешное подключение к базе данных SQLite.');
        db.run('PRAGMA foreign_keys = ON;');
        initDatabaseStructure();
    }
});
function initDatabaseStructure() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS services (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                title    TEXT NOT NULL,
                description TEXT,
                price    REAL NOT NULL,
                img      TEXT,
                duration TEXT
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                name     TEXT NOT NULL,
                email    TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                phone    TEXT,
                role     TEXT DEFAULT 'user'
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS appointments (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id          INTEGER NOT NULL,
                service_id       INTEGER NOT NULL,
                appointment_date TEXT NOT NULL,
                status           TEXT DEFAULT 'Ожидается',
                FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
                FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
            )
        `, (err) => {
            if (!err) {
                checkAndFillServices();
                checkAndCreateAdmin();
            }
        });
    });
}
function checkAndFillServices() {
    db.get("SELECT COUNT(*) as count FROM services", [], (err, row) => {
        if (!err && row.count === 0) {
            console.log('Таблица услуг пуста. Наполняем тестовыми данными...');
            const stmt = db.prepare(
                "INSERT INTO services (title, description, price, img, duration) VALUES (?, ?, ?, ?, ?)"
            );
            stmt.run("Замена моторного масла",    "Замена масла в двигателе и масляного фильтра.",         7500, "Cartin/oil.jpg",        "30-40 мин");
            stmt.run("Диагностика подвески",       "Полная проверка амортизаторов и тормозной системы.",    5500, "Cartin/diagnostic.jpg", "20 мин");
            stmt.run("Шиномонтаж",                 "Демонтаж, монтаж и балансировка четырех колес.",        5000, "Cartin/Hodovka.jpg",    "40-50 мин");
            stmt.run("Замена тормозных колодок",   "Замена передних или задних тормозных колодок.",         6000, "Cartin/tormoz.jpg",     "30 мин");
            stmt.finalize();
            console.log('Тестовые услуги добавлены.');
        }
    });
}
function checkAndCreateAdmin() {
    const adminEmail = 'n@gmail.com';
    const adminPassword = '12345';
    db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
        if (!err && !row) {
            console.log('Администратор не найден. Создаем учетную запись...');
            db.run(
                "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
                ['Администратор', adminEmail, adminPassword, '+77775124548', 'admin'],
                (e) => {
                    if (!e) console.log(`Администратор успешно создан: ${adminEmail} / ${adminPassword}`);
                }
            );
        } else if (!err && row) {
            db.run(
                "UPDATE users SET password = ?, role = 'admin' WHERE email = ?", 
                [adminPassword, adminEmail],
                (updateErr) => {
                    if (!updateErr) console.log(`Данные администратора актуализированы: ${adminEmail}`);
                }
            );
        }
    });
}
module.exports = db;