const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, 'project.db');
const db = new Database(dbPath, { verbose: console.log });
console.log('Подключено к базе данных SQLite через better-sqlite3.');
db.pragma('foreign_keys = ON');
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