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
    if (!navList) return;
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
        navList.innerHTML = `
            <li><a href="index.html">Главная</a></li>
            <li><a href="Servis.html">Услуги</a></li>
            <li class="user-profile-nav" style="color: #fff; padding: 10px 15px; font-weight: bold;">Привет, <span>${escapeHtml(currentUser.fullname)}</span></li>
            <li><button type="button" id="logout-btn" class="theme-btn" style="background-color: #e30613; margin-left: 10px; cursor: pointer;">Выход</button></li>
            <li><button type="button" id="theme-toggle" class="theme-btn">Тема</button></li>
        `;
        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
        initThemeSwitcher();
    }
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
    menuBtn.addEventListener("click", () => {
        navList.classList.toggle("active");
        menuBtn.classList.toggle("open");
    });
}
function initModalWindow() {
    let modal = document.getElementById("info-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "info-modal";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card" role="dialog" aria-modal="true">
                <button type="button" class="modal-close" aria-label="Закрыть">&times;</button>
                <h2 class="modal-title">Информация об услуге</h2>
                <p class="modal-text">Хотите узнать больше или записаться на данную услугу?</p>
                <button type="button" class="modal-action-btn" style="margin-top:15px; padding: 10px 20px; background: #e30613; border:none; color:#fff; cursor:pointer; border-radius:5px;">Понятно</button>
            </div>
        `;
        document.body.appendChild(modal);
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
}
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}