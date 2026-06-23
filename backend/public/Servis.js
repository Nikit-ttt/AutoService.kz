document.addEventListener("DOMContentLoaded", () => {
    checkAdminLinkVisibility();
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');
    const limitSelect = document.getElementById('limitSelect');
    const idInput = document.getElementById('idInput');
    const idSearchBtn = document.getElementById('idSearchBtn');
    if (searchInput && localStorage.getItem('filter_search')) searchInput.value = localStorage.getItem('filter_search');
    if (categoryFilter && localStorage.getItem('filter_category')) categoryFilter.value = localStorage.getItem('filter_category');
    if (sortBy && localStorage.getItem('filter_sort')) sortBy.value = localStorage.getItem('filter_sort');
    let allServices = [];
    fetchServicesFromServer();
    if (searchInput) searchInput.addEventListener('input', () => {
        localStorage.setItem('filter_search', searchInput.value);
        processAndRender();
    });
    if (categoryFilter) categoryFilter.addEventListener('change', () => {
        localStorage.setItem('filter_category', categoryFilter.value);
        processAndRender();
    });
    if (sortBy) sortBy.addEventListener('change', () => {
        localStorage.setItem('filter_sort', sortBy.value);
        processAndRender();
    });
    if (limitSelect) limitSelect.addEventListener('change', processAndRender);
    if (idSearchBtn && idInput) {
        idSearchBtn.addEventListener('click', async () => {
            const id = idInput.value.trim();
            if (!id) { processAndRender(); return; }
            try {
                const res = await fetch(`/api/services/${id}`);
                if (!res.ok) {
                    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1;text-align:center;padding:20px;">Услуга с ID ${id} не найдена.</div>`;
                    return;
                }
                const service = await res.json();
                renderServices([service]);
            } catch(e) {
                console.error('Ошибка поиска по ID:', e);
            }
        });
    }
    async function fetchServicesFromServer() {
        try {
            const response = await fetch('/api/services');
            if (!response.ok) throw new Error('Ошибка сети');
            allServices = await response.json();
            processAndRender();
        } catch (error) {
            console.error("Ошибка при получении данных с сервера:", error);
            grid.innerHTML = `<div class="no-results" style="grid-column:1/-1;text-align:center;padding:20px;">Не удалось загрузить услуги.</div>`;
        }
    }
    function processAndRender() {
        let result = [...allServices];
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const category = categoryFilter ? categoryFilter.value : 'all';
        const sortType = sortBy ? sortBy.value : 'default';
        if (searchTerm) {
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
        }
        if (category !== 'all') {
            result = result.filter(item => item.category === category);
        }
        if (sortType === 'nameAsc') {
            result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        } else if (sortType === 'nameDesc') {
            result.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
        } else if (sortType === 'priceAsc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortType === 'priceDesc') {
            result.sort((a, b) => b.price - a.price);
        }
        if (limitSelect && limitSelect.value !== 'all') {
            result = result.slice(0, parseInt(limitSelect.value));
        }
        renderServices(result);
    }
    function renderServices(servicesArray) {
        grid.innerHTML = '';
        if (!servicesArray || servicesArray.length === 0) {
            grid.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align:center; padding:20px;">Ничего не найдено.</div>`;
            return;
        }
        servicesArray.forEach(service => {
            const card = document.createElement('article');
            card.classList.add('service-item');
            const imgPath = service.img ? service.img : 'Cartin/placeholder.jpg';
            const durationText = service.duration || '30-60 мин';
            card.innerHTML = `
                <img src="${imgPath}" alt="${escapeHtml(service.title)}" onerror="this.src='Cartin/placeholder.jpg'">
                <h3>${escapeHtml(service.title)}</h3>
                <p>${escapeHtml(service.description || '')}</p>
                <div style="font-size: 14px; color: #aaa; margin-bottom: 5px;">⏱ Время: ${durationText}</div>
                <div class="service-price" style="font-weight:bold; font-size:1.1rem; margin-bottom:12px;">Цена: ${service.price} ₸</div>
                <button type="button" class="more-details-btn" data-id="${service.id}">Подробнее</button>
            `;
            grid.appendChild(card);
        });
        document.querySelectorAll('.more-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const item = servicesArray.find(s => String(s.id) === String(id));
                if (item && typeof window.openModal === 'function') {
                    window.openModal(item.title, `
                        <p>${escapeHtml(item.description || '')}</p>
                        <p><strong>Цена:</strong> ${item.price} ₸</p>
                        <p><strong>Время:</strong> ${item.duration || '30-60 мин'}</p>
                    `, item.id);
                }
            });
        });
    }
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
    function checkAdminLinkVisibility() {
        const navMenu = document.getElementById("nav-menu");
        if (!navMenu) return;
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser && currentUser.role === 'admin') {
            const adminLi = document.createElement("li");
            adminLi.innerHTML = `<a href="Admin.html" style="color: #28a745; font-weight: bold;">Админ-панель</a>`;
            const themeToggleLi = document.getElementById("theme-toggle")?.parentElement;
            if (themeToggleLi) {
                navMenu.insertBefore(adminLi, themeToggleLi);
            } else {
                navMenu.appendChild(adminLi);
            }
        }
    }
    app.get('/api/my-appointments/:userId', (req, res) => {
    const sql = `SELECT s.title, a.appointment_date, a.status 
                 FROM appointments a
                 JOIN services s ON a.service_id = s.id
                 WHERE a.user_id = ?`;
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
});