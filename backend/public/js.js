document.addEventListener("DOMContentLoaded", () => {
    initThemeSwitcher();
    checkAuthStatus();
    initMobileMenu();
    initModalWindow();
});
function initThemeSwitcher() {
    const themeBtn = document.getElementById("theme-toggle");
    if (!themeBtn) return;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }
    const newThemeBtn = themeBtn.cloneNode(true);
    themeBtn.parentNode.replaceChild(newThemeBtn, themeBtn);
    newThemeBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        const currentTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
        localStorage.setItem("theme", currentTheme);
    });
}
function checkAuthStatus() {
    const navList = document.querySelector("header nav ul");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
        navList.innerHTML = `
            <li><a href="index.html">Главная</a></li>
            <li><a href="Servis.html">Услуги</a></li>
            <li><a href="Profile.html" style="color: yellow;">Мой кабинет</a></li>
            <li><button type="button" onclick="logout()">Выйти</button></li>
        `;
    }
}
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = 'index.html';
}
function initMobileMenu() {
    const navContainer = document.querySelector("header nav");
    const navList = document.querySelector("header nav ul");
    if (!navContainer || !navList) return;
    let menuBtn = document.querySelector(".mobile-menu-btn");
    if (!menuBtn) {
        menuBtn = document.createElement("button");
        menuBtn.type = "button";
        menuBtn.className = "mobile-menu-btn";
        menuBtn.setAttribute("aria-label", "Открыть меню");
        menuBtn.innerHTML = "<span></span><span></span><span></span>";
        navContainer.insertBefore(menuBtn, navList);
    }
    const newMenuBtn = menuBtn.cloneNode(true);
    menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);
    newMenuBtn.addEventListener("click", () => {
        navList.classList.toggle("active");
        newMenuBtn.classList.toggle("open");
    });
}
function initModalWindow() {
    let modal = document.getElementById("info-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "info-modal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card">
                <button type="button" class="modal-close">&times;</button>
                <h2 class="modal-title"></h2>
                <div class="modal-text"></div>
                <div id="booking-area" style="margin-top:20px;">
                    <input type="datetime-local" id="app-date" style="display:none; width:100%; margin-bottom:10px;">
                    <button type="button" id="action-btn" class="modal-action-btn">Записаться</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    const dateInput = document.getElementById("app-date");
    const actionBtn = document.getElementById("action-btn");
    window.openModal = function(title, desc, serviceId) {
        modal.querySelector(".modal-title").textContent = title;
        modal.querySelector(".modal-text").innerHTML = desc;
        const user = JSON.parse(localStorage.getItem("currentUser"));
        actionBtn.onclick = async () => {
            if (!user) {
                alert("Записаться можно после регистрации");
                return;
            }
            if (dateInput.style.display === "none") {
                dateInput.style.display = "block";
                actionBtn.textContent = "Подтвердить запись";
            } else {
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        service_id: serviceId,
                        appointment_date: dateInput.value
                    })
                });
                if (response.ok) {
                    alert("Запись успешно создана!");
                    modal.classList.remove("visible");
                } else {
                    alert("Ошибка записи.");
                }
            }
        };
        modal.classList.add("visible");
    };
}
    const closeBtn = modal.querySelector(".modal-close");
    const actionBtn = modal.querySelector(".modal-action-btn");
    const closeModal = () => {
        modal.classList.remove("visible");
        document.body.style.overflow = "";
    };
    closeBtn.addEventListener("click", closeModal);
    actionBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    window.openModal = function(titleText, descText = '') {
        const titleEl = modal.querySelector(".modal-title");
        const textEl = modal.querySelector(".modal-text");
        if (titleText && titleEl) titleEl.textContent = titleText;
        if (descText && textEl) textEl.innerHTML = descText;
        modal.classList.add("visible");
        document.body.style.overflow = "hidden";
    };
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}
function updateNavMenu() {
    const nav = document.getElementById('nav-menu');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        nav.innerHTML += `<li><a href="Profile.html">Мой кабинет</a></li>`;
    }
}
updateNavMenu();