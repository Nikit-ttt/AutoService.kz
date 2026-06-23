const db = require('../database/db');
exports.login = (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Введите email и пароль' });
    }
    const targetEmail = String(email).trim().toLowerCase();
    const targetPassword = String(password).trim();
    db.get(
        'SELECT id, name, email, phone, role FROM users WHERE LOWER(email) = ? AND password = ?',
        [targetEmail, targetPassword],
        (err, user) => {
            if (err) {
                console.error('Ошибка БД (login):', err.message);
                return res.status(500).json({ error: 'Ошибка сервера при авторизации' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Неверный логин или пароль!' });
            }
            res.status(200).json({
                id:       user.id,
                fullname: user.name,
                email:    user.email,
                phone:    user.phone || '',
                role:     user.role || 'user'
            });
        }
    );
};
exports.createService = (req, res) => {
    const { title, description, price, img, duration } = req.body;
    if (!title || price === undefined || price === null || price === '') {
        return res.status(400).json({ error: 'Поля title и price обязательны' });
    }
    let finalImg = 'Cartin/placeholder.jpg';
    if (img && img.trim() !== '') {
        const trimmedImg = img.trim();
        if (trimmedImg.startsWith('Cartin/')) {
            finalImg = trimmedImg;
        } else {
            finalImg = `Cartin/${trimmedImg}`;
        }
    }
    const sql = 'INSERT INTO services (title, description, price, img, duration) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [title, description || '', Number(price), finalImg, duration || ''], function (err) {
        if (err) {
            console.error('Ошибка БД (createService):', err.message);
            return res.status(500).json({ error: 'Ошибка при создании услуги' });
        }
        res.status(201).json({ id: this.lastID, title, description, price: Number(price), img: finalImg, duration });
    });
};
exports.updateService = (req, res) => {
    const { id } = req.params;
    const { title, description, price, img, duration } = req.body;
    if (!title || price === undefined || price === null || price === '') {
        return res.status(400).json({ error: 'Поля title и price обязательны' });
    }
    let finalImg = 'Cartin/placeholder.jpg';
    if (img && img.trim() !== '') {
        const trimmedImg = img.trim();
        if (trimmedImg.startsWith('Cartin/')) {
            finalImg = trimmedImg;
        } else {
            finalImg = `Cartin/${trimmedImg}`;
        }
    }
    const sql = 'UPDATE services SET title=?, description=?, price=?, img=?, duration=? WHERE id=?';
    db.run(sql, [title, description || '', Number(price), finalImg, duration || '', id], function (err) {
        if (err) {
            console.error('Ошибка БД (updateService):', err.message);
            return res.status(500).json({ error: 'Ошибка при bowling услуги' });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Услуга не найдена' });
        res.status(200).json({ id, title, description, price: Number(price), img: finalImg, duration });
    });
};
exports.deleteService = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM services WHERE id=?', [id], function (err) {
        if (err) {
            console.error('Ошибка БД (deleteService):', err.message);
            return res.status(500).json({ error: 'Ошибка при удалении услуги' });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Услуга не найдена' });
        res.status(200).json({ message: 'Услуга удалена' });
    });
};
exports.getAllUsers = (req, res) => {
    db.all('SELECT id, name, email, phone, role FROM users', [], (err, rows) => {
        if (err) {
            console.error('Ошибка БД (getAllUsers):', err.message);
            return res.status(500).json({ error: 'Ошибка при чтении пользователей' });
        }
        res.status(200).json(rows);
    });
};
exports.deleteUser = (req, res) => {
    const { id } = req.params;
    db.get('SELECT role FROM users WHERE id=?', [id], (err, row) => {
        if (row && row.role === 'admin') {
            return res.status(403).json({ error: 'Нельзя удалить администратора' });
        }
        db.run('DELETE FROM users WHERE id=?', [id], function (err2) {
            if (err2) {
                console.error('Ошибка БД (deleteUser):', err2.message);
                return res.status(500).json({ error: 'Ошибка при удалении пользователя' });
            }
            if (this.changes === 0) return res.status(404).json({ error: 'Пользователь не найден' });
            res.status(200).json({ message: 'Пользователь удалён' });
        });
    });
};
exports.getAllAppointments = (req, res) => {
    const sql = `
        SELECT a.id, a.appointment_date, a.status,
               u.name  AS user_name,      u.email AS user_email,
               s.title AS service_title,  s.price AS service_price
        FROM appointments a
        LEFT JOIN users    u ON a.user_id    = u.id
        LEFT JOIN services s ON a.service_id = s.id
        ORDER BY a.appointment_date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Ошибка БД (getAllAppointments):', err.message);
            return res.status(500).json({ error: 'Ошибка при чтении записей' });
        }
        res.status(200).json(rows);
    });
};
exports.updateAppointmentStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Ожидается', 'Подтверждено', 'Выполнено', 'Отменено'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Недопустимый статус' });
    }
    db.run('UPDATE appointments SET status=? WHERE id=?', [status, id], function (err) {
        if (err) {
            console.error('Ошибка БД (updateAppointmentStatus):', err.message);
            return res.status(500).json({ error: 'Ошибка при обновлении статуса' });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Запись не найдена' });
        res.status(200).json({ message: 'Статус обновлён' });
    });
};
exports.deleteAppointment = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM appointments WHERE id=?', [id], function (err) {
        if (err) {
            console.error('Ошибка БД (deleteAppointment):', err.message);
            return res.status(500).json({ error: 'Ошибка при удалении записи' });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Запись не найдена' });
        res.status(200).json({ message: 'Запись удалена' });
    });
};
exports.register = (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Пожалуйста, заполните обязательные поля (Имя, Email, Пароль)' });
    }
    const trimmedEmail = email.trim().toLowerCase();
    db.get('SELECT id FROM users WHERE email = ?', [trimmedEmail], (err, row) => {
        if (err) {
            console.error('Ошибка БД при проверке email:', err.message);
            return res.status(500).json({ error: 'Внутренняя ошибка сервера при проверке email' });
        }
        if (row) {
            return res.status(400).json({ error: 'Пользователь с таким Email уже зарегистрирован!' });
        }
        const sql = 'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [name.trim(), trimmedEmail, password, phone ? phone.trim() : null, 'user'], function (insertErr) {
            if (insertErr) {
                console.error('Ошибка БД при регистрации:', insertErr.message);
                return res.status(500).json({ error: 'Не удалось сохранить данные пользователя' });
            }
            res.status(201).json({
                message: 'Регистрация успешно завершена!',
                userId: this.lastID
            });
        });
    });
};