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
});