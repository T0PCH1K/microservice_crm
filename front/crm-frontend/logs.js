function loadLogs(reset = false) {
    if (reset) document.getElementById('log-filter').value = '';
    const filter = document.getElementById('log-filter').value;
    let url = CONFIG.API_BASE + '/api/logs?limit=100';
    if (filter) url += '&username=' + filter;

    fetch(url)
    .then(r => r.json())
    .then(data => {
        document.querySelector('#logs-table tbody').innerHTML = data.map(l => `
            <tr><td>${l.id}</td><td>${l.username}</td><td>${l.action}</td><td>${l.ip_address || ''}</td><td>${l.created_at}</td></tr>
        `).join('');
        document.getElementById('logs-error').textContent = '';
    })
    .catch(() => document.getElementById('logs-error').textContent = 'Сервис логов недоступен');
}
