document.addEventListener("DOMContentLoaded", () => {
    initRegisterFormValidation();
});
function initRegisterFormValidation() {
    const form = document.getElementById('register-form');
    if (!form) return;
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => { 
            if (input.classList.contains('error')) validateField(input); 
        });
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        inputs.forEach(input => { 
            if (!validateField(input)) isValid = false; 
        });
        if (isValid) {
            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = form.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Регистрация...';
            }
            try {
                const response = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name: fullname,
                        email, 
                        phone, 
                        password 
                    })
                });
                const data = await response.json();
                if (!response.ok) {
                    alert(data.error || 'Произошла ошибка при регистрации.');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Зарегистрироваться';
                    }
                    return;
                }
                const authCard = document.querySelector('.auth-card');
                if (authCard) {
                    authCard.innerHTML = `
                        <div style="padding: 20px; text-align: center;">
                            <h2 style="color: #4caf50; margin-bottom: 15px;">Регистрация успешна!</h2>
                            <p style="margin-bottom: 20px;">Добро пожаловать, <strong>${escapeHtml(fullname)}</strong>. Данные сохранены в базу данных SQLite.</p>
                            <a href="Sign in.html" class="signin-button" style="display: inline-block; text-align: center; text-decoration: none; line-height: 40px; height: 40px; width: 100%;">Перейти ко входу</a>
                        </div>
                    `;
                }
            } catch (err) {
                console.error('Ошибка отправки формы:', err);
                alert('Ошибка соединения с сервером. Проверьте работоспособность бэкенда.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Зарегистрироваться';
                }
            }
        }
    });
}
function showError(input, message) {
    const group = input.closest('.form-group');
    const errorDiv = group.querySelector('.error-message');
    input.classList.add('error');
    if (errorDiv) { errorDiv.textContent = message; errorDiv.style.display = 'block'; }
}
function clearError(input) {
    const group = input.closest('.form-group');
    const errorDiv = group.querySelector('.error-message');
    input.classList.remove('error');
    if (errorDiv) { errorDiv.textContent = ''; errorDiv.style.display = 'none'; }
}
function validateField(field) {
    const id = field.id;
    let error = '';
    const value = field.value.trim();
    if (id === 'fullname' && value.length < 2) error = 'Имя должно содержать минимум 2 символа';
    if (id === 'email' && !/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(value)) error = 'Введите корректный email';
    if (id === 'phone' && value.replace(/\D/g, '').length < 10) error = 'Введите корректный телефон (мин. 10 цифр)';
    if (id === 'password' && field.value.length < 6) error = 'Пароль должен содержать минимум 6 символов';
    if (id === 'confirm_password') {
        const pass = document.getElementById('password').value;
        if (field.value !== pass) error = 'Пароли не совпадают';
    }
    if (error) { showError(field, error); return false; } 
    else { clearError(field); return true; }
}
function escapeHtml(str) {
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}