let servicesData = [
    { id: 1, title: "Диагностика двигателя", description: "Полная компьютерная диагностика двигателя, выявление скрытых неисправностей.", img: "Cartin/Diagnostic.jpg", category: "diagnostic", price: 12000 },
    { id: 2, title: "Ремонт ходовой части", description: "Замена амортизаторов, сайлентблоков, шаровых опор и рычагов.", img: "Cartin/Hodovka.jpg", category: "repair", price: 7000 },
    { id: 3, title: "Ремонт тормозной системы", description: "Замена тормозных колодок, дисков, шлангов и обслуживание суппортов.", img: "Cartin/tormoz.jpg", category: "repair", price: 5800 },
    { id: 4, title: "Компьютерный сход-развал", description: "Точная регулировка углов установки колес автомобиля на современном стенде.", img: "Cartin/razval.jpg", category: "maintenance", price: 5500 },
    { id: 5, title: "Замена масла и фильтров", description: "Плановое техническое обслуживание с использованием качественных материалов.", img: "Cartin/Fuel.jpg", category: "maintenance", price: 8000 },
    { id: 6, title: "Полный ремонт двигателя", description: "Полный разбор и ремонт двигателя, капитальный ремонт двигателя", img: "Cartin/Motor.jpg", category: "repair", price: 50000 }
];
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('servicesGrid')) {
        initServicesDataManagement();
    }
});
function initServicesDataManagement() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');
    if (!searchInput || !categoryFilter || !sortBy) return;
    if (localStorage.getItem('filter_search') !== null) searchInput.value = localStorage.getItem('filter_search');
    if (localStorage.getItem('filter_category') !== null) categoryFilter.value = localStorage.getItem('filter_category');
    if (localStorage.getItem('filter_sort') !== null) sortBy.value = localStorage.getItem('filter_sort');
    filterAndSortServices();
    searchInput.addEventListener('input', () => {
        localStorage.setItem('filter_search', searchInput.value);
        filterAndSortServices();
    });
    categoryFilter.addEventListener('change', () => {
        localStorage.setItem('filter_category', categoryFilter.value);
        filterAndSortServices();
    });
    sortBy.addEventListener('change', () => {
        localStorage.setItem('filter_sort', sortBy.value);
        filterAndSortServices();
    });
}
function filterAndSortServices() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    const sortType = document.getElementById('sortBy')?.value || 'nameAsc';
    let filtered = [...servicesData];
    if (searchTerm) {
        filtered = filtered.filter(s => s.title.toLowerCase().includes(searchTerm) || s.description.toLowerCase().includes(searchTerm));
    }
    if (category !== 'all') {
        filtered = filtered.filter(s => s.category === category);
    }
    if (sortType === 'nameAsc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortType === 'nameDesc') filtered.sort((a, b) => b.title.localeCompare(a.title));
    else if (sortType === 'priceAsc') filtered.sort((a, b) => a.price - b.price);
    else if (sortType === 'priceDesc') filtered.sort((a, b) => b.price - a.price);
    renderServices(filtered);
}
function renderServices(servicesArray) {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    if (!servicesArray.length) {
        grid.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align:center; padding:20px;">Ничего не найдено.</div>`;
        return;
    }
    grid.innerHTML = '';
    servicesArray.forEach(service => {
        const card = document.createElement('article');
        card.classList.add('service-item');
        card.innerHTML = `
            <img src="${service.img}" alt="${service.title}" onerror="this.src='Cartin/placeholder.jpg'">
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.description)}</p>
            <div class="service-price">Цена: ${service.price} ₸</div>
            <button type="button" class="more-details-btn" data-id="${service.id}">Подробнее</button>
        `;
        grid.appendChild(card);
    });
    document.querySelectorAll('.more-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            const item = servicesData.find(s => s.id === id);
            if (item && typeof window.openModal === 'function') {
                window.openModal(item.title);
            }
        });
    });
}
function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}