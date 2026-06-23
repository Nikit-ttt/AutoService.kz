const db = require('../database/db');
exports.getMyAppointments = (req, res) => {
    const userId = Number(req.params.userId); 
    console.log(`[Личный кабинет] Запрос записей для userId (как число):`, userId);
    if (isNaN(userId)) {
        console.error(`[Личный кабинет] Ошибка: получен некорректный userId (NaN)`);
        return res.status(400).json({ error: 'Некорректный ID пользователя' });
    }
    const sql = `
        SELECT a.id, 
               COALESCE(s.title, 'Услуга не указана') AS title, 
               COALESCE(s.price, 0) AS price, 
               COALESCE(s.duration, '-') AS duration, 
               a.appointment_date, 
               a.status 
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.user_id = ?
        ORDER BY a.appointment_date DESC`;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error('Ошибка БД (getMyAppointments):', err.message);
            return res.status(500).json({ error: 'Ошибка сервера при получении истории записей' });
        }
        console.log(`[Личный кабинет] Найдено записей в БД для пользователя ${userId}:`, rows.length);
        res.status(200).json(rows);
    });
};
exports.getAllServices = (req, res) => {
    db.all('SELECT * FROM services', [], (err, rows) => {
        if (err) {
            console.error('Ошибка БД (getAllServices):', err.message);
            return res.status(500).json({ error: 'Ошибка сервера при получении услуг' });
        }
        res.status(200).json(rows);
    });
};
exports.getServiceById = (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM services WHERE id = ?', [Number(id)], (err, row) => {
        if (err) {
            console.error('Ошибка БД (getServiceById):', err.message);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        if (!row) return res.status(404).json({ error: 'Услуга не найдена' });
        res.status(200).json(row);
    });
};
exports.createAppointment = (req, res) => {
    const { user_id, service_id, appointment_date } = req.body;
    if (!user_id || !service_id || !appointment_date) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля для записи' });
    }
    const sql = 'INSERT INTO appointments (user_id, service_id, appointment_date, status) VALUES (?, ?, ?, ?)';
    db.run(sql, [Number(user_id), Number(service_id), appointment_date, 'Ожидается'], function (err) {
        if (err) {
            console.error('Ошибка БД (createAppointment):', err.message);
            return res.status(500).json({ error: 'Не удалось создать запись' });
        }
        res.status(201).json({
            message: 'Вы успешно записались на услугу!',
            appointmentId: this.lastID
        });
    });
};