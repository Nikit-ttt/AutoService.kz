const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, 'project.db');
const db = new Database(dbPath, { verbose: console.log });
console.log('Подключено к базе данных SQLite через better-sqlite3.');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    img TEXT,
    duration TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    service_id INTEGER,
    appointment_date TEXT,
    status TEXT DEFAULT 'Ожидается',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
  );
`);
console.log('Проверка структуры таблиц успешно заверешена.');
const getArgs = (params) => (Array.isArray(params) && params.length > 0 ? params : []);
db.all = (sql, params, callback) => {
    try {
        const args = getArgs(params);
        const rows = db.prepare(sql).all(...args);
        callback(null, rows);
    } catch (err) {
        console.error('Ошибка в db.all:', err.message);
        callback(err, null);
    }
};
db.get = (sql, params, callback) => {
    try {
        const args = getArgs(params);
        const row = db.prepare(sql).get(...args);
        callback(null, row);
    } catch (err) {
        console.error('Ошибка в db.get:', err.message);
        callback(err, null);
    }
};
db.run = function(sql, params, callback) {
    try {
        const args = getArgs(params);
        const info = db.prepare(sql).run(...args);
        const context = { 
            lastID: info.lastInsertRowid, 
            changes: info.changes 
        };
        callback.call(context, null);
    } catch (err) {
        console.error('Ошибка в db.run:', err.message);
        callback(err, null);
    }
};
module.exports = db;