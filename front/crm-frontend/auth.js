let USERS = {};

fetch('/users.json')
    .then(r => r.json())
    .then(data => { USERS = data; })
    .catch(() => console.error('Не удалось загрузить users.json'));

function getSession() {
    return JSON.parse(localStorage.getItem('session') || '{}');
}

function login() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    if (USERS[user] && USERS[user].password === pass) {
        localStorage.setItem('session', JSON.stringify({
            username: user,
            role: USERS[user].role
        }));

        fetch(CONFIG.API_BASE + '/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                action: 'login',
                entity_type: 'user',
                entity_id: 0,
                details: {},
                ip_address: ''
            })
        });

        showMain();
    } else {
        document.getElementById('login-error').textContent = 'Неверный логин или пароль';
    }
}

function logout() {
    localStorage.removeItem('session');
    showLogin();
}

function showMain() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('current-user').textContent =
        getSession().username + ' (' + getSession().role + ')';

    if (getSession().role === 'admin') {
        document.getElementById('tab-logs').style.display = 'inline-block';
    }

    switchTab('clients');
}

function showLogin() {
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('main-screen').style.display = 'none';
}

if (getSession().username) showMain();
