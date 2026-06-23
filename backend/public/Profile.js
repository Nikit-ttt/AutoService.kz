document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || !user.id) {
        window.location.href = 'login.html';
        return;
    }
    const tbody = document.getElementById('appointmentsBody');
    try {
        const response = await fetch(`/api/appointments/user/${user.id}`);
        if (!response.ok) throw new Error('Ошибка сети');
        
        const appointments = await response.json();

        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">У вас пока нет записей.</td></tr>';
            return;
        }
        tbody.innerHTML = appointments.map(app => `
            <tr>
                <td>${app.title}</td>
                <td>${new Date(app.appointment_date).toLocaleString()}</td>
                <td><span class="status-badge">${app.status}</span></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error("Ошибка загрузки:", e);
        tbody.innerHTML = '<tr><td colspan="3">Ошибка при загрузке данных.</td></tr>';
    }
});