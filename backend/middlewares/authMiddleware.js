module.exports = (req, res, next) => {
    const userRole = req.headers['x-user-role'] || req.headers['X-User-Role'];
    console.log(`[Проверка доступа] Путь: ${req.method} ${req.url} | Полученная роль:`, userRole);
    if (!userRole) {
        return res.status(401).json({ error: 'Доступ запрещен. Вы не авторизованы (отсутствует заголовок роли).' });
    }
    if (userRole.trim().toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Отказ в доступе. Требуются права администратора.' });
    }
    next();
};