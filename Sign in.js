document.addEventListener("DOMContentLoaded", () => {
    initAuthForm();
});
function initAuthForm() {
    const authForm = document.querySelector(".auth-form");
    if (!authForm) return;
    authForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const emailInput = authForm.querySelector("input[name='username']");
        const passwordInput = authForm.querySelector("input[name='password']");
        const loginEmail = emailInput.value.trim().toLowerCase();
        const loginPassword = passwordInput.value.trim();
        if (loginEmail === "" || loginPassword === "") {
            alert("Пожалуйста, заполните все поля!");
            return;
        }
        const usersBase =
            JSON.parse(localStorage.getItem("registeredUsers")) || [];
        console.log("База пользователей:", usersBase);
        const targetUser = usersBase.find((user) => {
            return (
                user.email?.trim().toLowerCase() === loginEmail &&
                user.password === loginPassword
            );
        });
        if (targetUser) {
            localStorage.setItem(
                "currentUser",
                JSON.stringify({
                    fullname: targetUser.fullname,
                    email: targetUser.email,
                })
            );
            alert("Вход выполнен успешно!");
            window.location.href = "index.html";
        } else {
            alert("Неверный логин или пароль!");
        }
    });
}