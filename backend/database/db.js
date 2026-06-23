const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, 'project.db');
const db = new Database(dbPath, { verbose: console.log });
console.log('Подключено к базе данных SQLite через better-sqlite3.');
db.pragma('foreign_keys = ON');
db.all = (sql, params, callback) => {
    try {
        const rows = db.prepare(sql).all(params);
        callback(null, rows);
    } catch (err) {
        callback(err, null);
    }
};
db.get = (sql, params, callback) => {
    try {
        const row = db.prepare(sql).get(params);
        callback(null, row);
    } catch (err) {
        callback(err, null);
    }
};
db.run = function(sql, params, callback) {
    try {
        const info = db.prepare(sql).run(params);
        callback.call({ lastID: info.lastInsertRowid }, null);
    } catch (err) {
        callback(err, null);
    }
};
module.exports = db;