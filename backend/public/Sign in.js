document.addEventListener("DOMContentLoaded", () => {
    const existing = JSON.parse(localStorage.getItem("currentUser"));
    if (existing) {
        window.location.href = existing.role === 'admin' ? 'Admin.html' : 'index.html';
        return;
    }
    initAuthForm();
});
function initAuthForm() {
    const authForm = document.querySelector(".auth-form");
    if (!authForm) return;
    authForm.removeAttribute('action');
    authForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const emailInput    = authForm.querySelector("input[name='username']");
        const passwordInput = authForm.querySelector("input[name='password']");
        const submitBtn     = authForm.querySelector("button[type='submit']");
        if (!emailInput || !passwordInput) return;
        const email    = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value.trim();
        if (!email || !password) {
            showError('Пожалуйста, заполните все поля!');
            return;
        }
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Входим...';
        try {
            const response = await fetch('/api/users/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                showError(data.error || 'Неверный логин или пароль!');
                return;
            }
            localStorage.setItem('currentUser', JSON.stringify({
    id:       data.id,
    fullname: data.fullname,
    email:    data.email,
    phone:    data.phone,
    role:     data.role
}));
            if (data.role === 'admin') {
                window.location.href = 'Admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (err) {
            console.error('Ошибка входа:', err);
            showError('Ошибка соединения с сервером. Убедитесь, что бэкенд запущен.');
        } finally {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Войти';
        }
    });
}
function showError(msg) {
    let errEl = document.getElementById('login-error');
    if (!errEl) {
        errEl = document.createElement('p');
        errEl.id = 'login-error';
        errEl.style.cssText = 'color:#e30613; font-size:14px; text-align:center; margin:15px 0 0 0; font-weight:bold;';
        const form = document.querySelector(".auth-form");
        if (form) form.appendChild(errEl);
    }
    errEl.textContent = msg;
}