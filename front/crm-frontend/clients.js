function loadClients() {
    fetch(CONFIG.API_BASE + '/api/clients')
    .then(r => r.json())
    .then(renderClients)
    .catch(() => document.getElementById('clients-error').textContent = 'Сервис клиентов недоступен');
}

function searchClient() {
    const query = document.getElementById('client-search').value.trim();
    if (!query) return loadClients();

    if (/^\d+$/.test(query)) {
        fetch(CONFIG.API_BASE + '/api/clients/' + query)
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                document.getElementById('clients-error').textContent = 'Клиент не найден';
                document.querySelector('#clients-table tbody').innerHTML = '';
            } else {
                renderClients([data]);
            }
        })
        .catch(() => document.getElementById('clients-error').textContent = 'Сервис клиентов недоступен');
        return;
    }

    fetch(CONFIG.API_BASE + '/api/clients')
    .then(r => r.json())
    .then(clients => {
        const filtered = smartFilter(clients, query);
        if (filtered.length) {
            renderClients(filtered);
        } else {
            document.getElementById('clients-error').textContent = 'Ничего не найдено';
            document.querySelector('#clients-table tbody').innerHTML = '';
        }
    })
    .catch(() => document.getElementById('clients-error').textContent = 'Сервис клиентов недоступен');
}

function smartFilter(clients, query) {
    const q = query.toLowerCase();

    if (q.startsWith('+')) {
        const phone = q.substring(1);
        return clients.filter(c => c.phone && c.phone.includes(phone));
    }

    if (q.startsWith('@')) {
        const tg = q.substring(1).toLowerCase();
        return clients.filter(c => c.telegram && c.telegram.toLowerCase().includes(tg));
    }

    if (q.includes('@')) {
        return clients.filter(c => c.email && c.email.toLowerCase().includes(q));
    }

    return clients.filter(c => c.name && c.name.toLowerCase().includes(q));
}

function renderClients(clients) {
    const tbody = document.querySelector('#clients-table tbody');
    tbody.innerHTML = clients.map(c => `
        <tr>
            <td>${c.id}</td><td>${c.name}</td><td>${c.email || ''}</td>
            <td>${c.phone || ''}</td><td>${c.telegram || ''}</td><td>${c.balance}</td>
            <td>
                <button onclick="editClient(${c.id})" title="Изменить">✏️</button>
                <button onclick="deleteClient(${c.id})" title="Удалить">🗑️</button>
            </td>
        </tr>
    `).join('');
    document.getElementById('clients-error').textContent = '';
}

function openAddModal() {
    document.getElementById('modal-title').textContent = 'Добавить клиента';
    document.getElementById('client-id').value = '';
    document.getElementById('client-name').value = '';
    document.getElementById('client-email').value = '';
    document.getElementById('client-phone').value = '';
    document.getElementById('client-telegram').value = '';
    document.getElementById('client-balance').value = '';
    document.getElementById('client-modal').style.display = 'flex';
}

function editClient(id) {
    fetch(CONFIG.API_BASE + '/api/clients/' + id)
    .then(r => r.json())
    .then(c => {
        document.getElementById('modal-title').textContent = 'Изменить клиента';
        document.getElementById('client-id').value = c.id;
        document.getElementById('client-name').value = c.name;
        document.getElementById('client-email').value = c.email || '';
        document.getElementById('client-phone').value = c.phone || '';
        document.getElementById('client-telegram').value = c.telegram || '';
        document.getElementById('client-balance').value = c.balance;
        document.getElementById('client-modal').style.display = 'flex';
    });
}

function closeModal() {
    document.getElementById('client-modal').style.display = 'none';
}

function saveClient() {
    const id = document.getElementById('client-id').value;

    // Получаем и форматируем поля
    let name = document.getElementById('client-name').value.trim();
    let email = document.getElementById('client-email').value.trim();
    let phone = document.getElementById('client-phone').value.trim();
    let telegram = document.getElementById('client-telegram').value.trim();
    const balance = parseFloat(document.getElementById('client-balance').value) || 0;

    // Валидация имени
    if (!name) {
        alert('Имя обязательно для заполнения');
        return;
    }

    // Формат телефона: убираем всё лишнее, добавляем + в начале
    if (phone) {
        phone = phone.replace(/[^\d+]/g, '');
        if (!phone.startsWith('+')) phone = '+' + phone;
        // Базовая проверка: должно быть не менее 11 цифр
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 11) {
            alert('Телефон должен содержать не менее 11 цифр');
            return;
        }
    }

    // Формат telegram: убираем @, потом добавляем одну в начале
    if (telegram) {
        telegram = telegram.replace(/@/g, '').trim();
        if (telegram) telegram = '@' + telegram;
    }

    // Валидация email
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Некорректный формат email');
        return;
    }

    const body = { name, email, phone, telegram, balance };

    const method = id ? 'PUT' : 'POST';
    const url = id ? CONFIG.API_BASE + '/api/clients/' + id : CONFIG.API_BASE + '/api/clients';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(r => r.json())
    .then(() => {
        closeModal();
        loadClients();

        fetch(CONFIG.API_BASE + '/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: getSession().username,
                action: id ? 'update_client' : 'create_client',
                entity_type: 'client',
                entity_id: id || 0,
                details: { name: body.name },
                ip_address: ''
            })
        });
    });
}

function deleteClient(id) {
    if (confirm('Удалить клиента?')) {
        fetch(CONFIG.API_BASE + '/api/clients/' + id, { method: 'DELETE' })
        .then(() => {
            loadClients();

            fetch(CONFIG.API_BASE + '/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: getSession().username,
                    action: 'delete_client',
                    entity_type: 'client',
                    entity_id: id,
                    details: {},
                    ip_address: ''
                })
            });
        });
    }
}
function switchTab(tab) {
    document.getElementById('tab-clients').classList.toggle('active', tab === 'clients');
    document.getElementById('tab-logs').classList.toggle('active', tab === 'logs');
    document.getElementById('panel-clients').style.display = tab === 'clients' ? 'block' : 'none';
    document.getElementById('panel-logs').style.display = tab === 'logs' ? 'block' : 'none';

    if (tab === 'clients') loadClients();
    if (tab === 'logs') loadLogs();
}
