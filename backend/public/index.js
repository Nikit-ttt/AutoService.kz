console.log("AutoService: Главная страница успешно загружена.");
document.addEventListener("DOMContentLoaded", () => {
    const heroSection = document.querySelector(".hero");
    if (heroSection) {
        const heroParagraph = heroSection.querySelector("p");
        if (heroParagraph && !document.querySelector(".promo-highlight")) {
            const promoBadge = document.createElement("strong");
            promoBadge.textContent = " Акция! При первой записи — диагностика подвески бесплатно.";
            promoBadge.style.color = "#e30613";
            promoBadge.classList.add("promo-highlight");
            heroParagraph.append(promoBadge);
        }
    }
    checkAdminLinkVisibility();
});
function checkAdminLinkVisibility() {
    const navMenu = document.getElementById("nav-menu");
    if (!navMenu) return;
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.role === 'admin') {
        const adminLi = document.createElement("li");
        adminLi.innerHTML = `<a href="Admin.html" style="color: #e30613; font-weight: bold;">Админ-панель</a>`;
        const themeToggleLi = document.getElementById("theme-toggle")?.parentElement;
        if (themeToggleLi) {
            navMenu.insertBefore(adminLi, themeToggleLi);
        } else {
            navMenu.appendChild(adminLi);
        }
    }
}