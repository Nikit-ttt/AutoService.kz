document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    initTabs();
    initServiceModal();
    initConfirmModal();
    initLogout();
    loadServices();
    loadUsers();
    loadAppointments();
    initSearch();
});
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const userRole = currentUser ? currentUser.role : 'user';
function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (window.location.search.includes('dev')) return;
    if (!user || user.role !== 'admin') {
        showToast('Доступ запрещён. Войдите как администратор.', 'error');
        setTimeout(() => { window.location.href = 'Sign in.html'; }, 1500);
    }
}
const TAB_TITLES = {
    services:     'Управление услугами',
    users:        'Пользователи',
    appointments: 'Записи на сервис',
};
function initTabs() {
    document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}
function switchTab(tab) {
    document.querySelectorAll('.nav-item[data-tab]').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
    const tabEl = document.getElementById(`tab-${tab}`);
    if (navItem) navItem.classList.add('active');
    if (tabEl) tabEl.classList.add('active');
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = TAB_TITLES[tab] || '';
}
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}
let confirmCallback = null;
function initConfirmModal() {
    document.getElementById('confirm-cancel').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('open');
        confirmCallback = null;
    });
    document.getElementById('confirm-ok').addEventListener('click', () => {
        document.getElementById('confirm-modal').classList.remove('open');
        if (typeof confirmCallback === 'function') confirmCallback();
        confirmCallback = null;
    });
}
function showConfirm(text, callback) {
    document.getElementById('confirm-text').textContent = text;
    confirmCallback = callback;
    document.getElementById('confirm-modal').classList.add('open');
}
let allServices = [];
let editingServiceId = null;
function loadServices() {
    fetch('/api/services')
        .then(r => r.json())
        .then(data => {
            allServices = data;
            renderServices(data);
        })
        .catch(() => {
            document.getElementById('services-tbody').innerHTML =
                `<tr><td colspan="6" class="loading">Ошибка загрузки. Сервер не запущен?</td></tr>`;
        });
}
function renderServices(list) {
    const tbody = document.getElementById('services-tbody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="loading">Услуги не найдены</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(s => `
        <tr>
            <td>${s.id}</td>
            <td><strong>${esc(s.title)}</strong></td>
            <td style="max-width:220px; color:#aaa">${esc(s.description || '—')}</td>
            <td>${s.price} ₸</td>
            <td>${esc(s.duration || '—')}</td>
            <td>
                <button class="btn-edit" onclick="openEditService(${s.id})">Изменить</button>
                <button class="btn-delete" onclick="deleteService(${s.id}, '${esc(s.title)}')">Удалить</button>
            </td>
        </tr>
    `).join('');
}
function initServiceModal() {
    document.getElementById('open-add-service').addEventListener('click', () => openAddService());
    document.getElementById('close-service-modal').addEventListener('click', closeServiceModal);
    document.getElementById('cancel-service-modal').addEventListener('click', closeServiceModal);
    document.getElementById('save-service').addEventListener('click', saveService);
    document.getElementById('service-modal').addEventListener('click', (e) => {
        if (e.target.id === 'service-modal') closeServiceModal();
    });
}
function openAddService() {
    editingServiceId = null;
    document.getElementById('modal-title').textContent = 'Добавить услугу';
    ['svc-title','svc-desc','svc-price','svc-img','svc-duration'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('service-modal').classList.add('open');
}
window.openEditService = function(id) {
    const s = allServices.find(x => x.id === id);
    if (!s) return;
    editingServiceId = id;
    document.getElementById('modal-title').textContent = 'Редактировать услугу';
    document.getElementById('svc-title').value    = s.title || '';
    document.getElementById('svc-desc').value     = s.description || '';
    document.getElementById('svc-price').value    = s.price || '';
    document.getElementById('svc-img').value      = s.img || '';
    document.getElementById('svc-duration').value = s.duration || '';
    document.getElementById('service-modal').classList.add('open');
};
function closeServiceModal() {
    document.getElementById('service-modal').classList.remove('open');
    editingServiceId = null;
}
function saveService() {
    const title    = document.getElementById('svc-title').value.trim();
    const desc     = document.getElementById('svc-desc').value.trim();
    const price    = parseFloat(document.getElementById('svc-price').value);
    const img      = document.getElementById('svc-img').value.trim();
    const duration = document.getElementById('svc-duration').value.trim();
    if (!title) { showToast('Введите название услуги', 'error'); return; }
    if (isNaN(price) || price < 0) { showToast('Введите корректную цену', 'error'); return; }
    const body = { title, description: desc, price, img, duration };
    const isEdit = editingServiceId !== null;
    const url    = isEdit ? `/api/admin/services/${editingServiceId}` : '/api/admin/services';
    const method = isEdit ? 'PUT' : 'POST';
    fetch(url, { 
        method, 
        headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole
        }, 
        body: JSON.stringify(body) 
    })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(() => {
            showToast(isEdit ? 'Услуга обновлена!' : 'Услуга добавлена!', 'success');
            closeServiceModal();
            loadServices();
        })
        .catch(() => showToast('Ошибка при сохранении (Отказ в доступе)', 'error'));
}
window.deleteService = function(id, title) {
    showConfirm(`Удалить услугу "${title}"?`, () => {
        fetch(`/api/admin/services/${id}`, { 
            method: 'DELETE',
            headers: { 'x-user-role': userRole }
        })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => { showToast('Услуга удалена', 'success'); loadServices(); })
            .catch(() => showToast('Ошибка при удалении (Отказ в доступе)', 'error'));
    });
};
let allUsers = [];
function loadUsers() {
    fetch('/api/admin/users', {
        method: 'GET',
        headers: { 'x-user-role': userRole }
    })
        .then(r => r.json())
        .then(data => {
            allUsers = data;
            renderUsers(data);
        })
        .catch(() => {
            document.getElementById('users-tbody').innerHTML =
                `<tr><td colspan="5" class="loading">Ошибка доступа или загрузки данных.</td></tr>`;
        });
}
function renderUsers(list) {
    const tbody = document.getElementById('users-tbody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="loading">Пользователи не найдены</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(u => `
        <tr>
            <td>${u.id}</td>
            <td><strong>${esc(u.name)}</strong></td>
            <td>${esc(u.email)}</td>
            <td>${esc(u.phone || '—')}</td>
            <td>
                <button class="btn-delete" onclick="deleteUser(${u.id}, '${esc(u.name)}')">🗑 Удалить</button>
            </td>
        </tr>
    `).join('');
}
window.deleteUser = function(id, name) {
    showConfirm(`Удалить пользователя "${name}"? Все его записи тоже будут удалены.`, () => {
        fetch(`/api/admin/users/${id}`, { 
            method: 'DELETE',
            headers: { 'x-user-role': userRole }
        })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => { showToast('Пользователь удалён', 'success'); loadUsers(); loadAppointments(); })
            .catch(() => showToast('Ошибка при удалении', 'error'));
    });
};
let allAppointments = [];
function loadAppointments() {
    fetch('/api/admin/appointments', {
        method: 'GET',
        headers: { 'x-user-role': userRole }
    })
        .then(r => r.json())
        .then(data => {
            allAppointments = data;
            renderAppointments(data);
        })
        .catch(() => {
            document.getElementById('appointments-tbody').innerHTML =
                `<tr><td colspan="6" class="loading">Ошибка доступа при чтении записей.</td></tr>`;
        });
}
function renderAppointments(list) {
    const tbody = document.getElementById('appointments-tbody');
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="loading">Записи не найдены</td></tr>`;
        return;
    }
    const statuses = ['Ожидается','Подтверждено','Выполнено','Отменено'];
    tbody.innerHTML = list.map(a => {
        const date = a.appointment_date
            ? new Date(a.appointment_date).toLocaleString('ru-RU', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
            : '—';
        const statusClass = `status-${a.status}`;
        const options = statuses.map(s =>
            `<option value="${s}" ${s === a.status ? 'selected' : ''}>${s}</option>`
        ).join('');
        return `
        <tr>
            <td>${a.id}</td>
            <td>
                <strong>${esc(a.user_name || '—')}</strong><br>
                <span style="color:#888;font-size:12px">${esc(a.user_email || '')}</span>
            </td>
            <td>
                ${esc(a.service_title || '—')}<br>
                <span style="color:#888;font-size:12px">${a.service_price ? a.service_price + ' ₸' : ''}</span>
            </td>
            <td>${date}</td>
            <td><span class="status-badge ${statusClass}">${esc(a.status)}</span></td>
            <td>
                <select class="action-select" onchange="changeStatus(${a.id}, this.value)">
                    ${options}
                </select>
                <button class="btn-delete" style="margin-top:4px" onclick="deleteAppointment(${a.id})">🗑</button>
            </td>
        </tr>`;
    }).join('');
}
window.changeStatus = function(id, status) {
    fetch(`/api/admin/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-user-role': userRole
        },
        body: JSON.stringify({ status })
    })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(() => { showToast('Статус обновлён', 'info'); loadAppointments(); })
        .catch(() => showToast('Ошибка обновления статуса', 'error'));
};
window.deleteAppointment = function(id) {
    showConfirm('Удалить запись?', () => {
        fetch(`/api/admin/appointments/${id}`, { 
            method: 'DELETE',
            headers: { 'x-user-role': userRole }
        })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => { showToast('Запись удалена', 'success'); loadAppointments(); })
            .catch(() => showToast('Ошибка при удалении', 'error'));
    });
};
function initSearch() {
    document.getElementById('search-services').addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        renderServices(q
            ? allServices.filter(s => s.title.toLowerCase().includes(q) || (s.description||'').toLowerCase().includes(q))
            : allServices
        );
    });
    document.getElementById('search-users').addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        renderUsers(q
            ? allUsers.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
            : allUsers
        );
    });
    document.getElementById('search-appointments').addEventListener('input', filterAppointments);
    document.getElementById('filter-status').addEventListener('change', filterAppointments);
}
function filterAppointments() {
    const q      = document.getElementById('search-appointments').value.trim().toLowerCase();
    const status = document.getElementById('filter-status').value;
    let result   = [...allAppointments];
    if (q) result = result.filter(a =>
        (a.user_name||'').toLowerCase().includes(q) ||
            (a.service_title||'').toLowerCase().includes(q) ||
            (a.user_email||'').toLowerCase().includes(q)
    );
    if (status !== 'all') result = result.filter(a => a.status === status);
    renderAppointments(result);
}
function initLogout() {
    document.getElementById('admin-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}
function esc(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
}