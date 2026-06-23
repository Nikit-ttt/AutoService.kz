--
-- ���� ������������ � ������� SQLiteStudio v3.1.1 � �� ���� 9 15:46:30 2026
--
-- �������������� ��������� ������: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- �������: appointments
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    status TEXT DEFAULT '���������',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);
INSERT INTO appointments (id, user_id, service_id, appointment_date, status) VALUES (1, 1, 1, '2026-06-15 10:00:00', '���������');
INSERT INTO appointments (id, user_id, service_id, appointment_date, status) VALUES (3, 1, 3, '2026-06-16 15:00:00', '���������');

-- �������: services
CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL
);
INSERT INTO services (id, title, description, price) VALUES (1, '������ ��������� �����', '������ ����� � ��������� � ��������� �������. �������� ������ �� ����.', 7500);
INSERT INTO services (id, title, description, price) VALUES (2, '����������� ��������', '������ �������� �������������, ������������� � ��������� �������.', 5500);
INSERT INTO services (id, title, description, price) VALUES (3, '����������', '��������, ������ � ������������ ������� �����.', 5000);
INSERT INTO services (id, title, description, price) VALUES (4, '������ ��������� �������', '������ �������� ��� ������ ��������� �������.', 6000);

-- �������: users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT
);
INSERT INTO users (id, name, email, password, phone) VALUES (1, '��������� ������', 'alex@mail.ru', 'password123', '+79991112233');
INSERT INTO users (id, name, email, password, phone) VALUES (2, '����� �������', 'maria@gmail.com', 'securepass456', '+79992223344');
INSERT INTO users (id, name, email, password, phone) VALUES (3, '������� �������', 'dima@yandex.ru', 'dima2026', '+79993334455');

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
