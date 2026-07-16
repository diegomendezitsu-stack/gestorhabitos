const API_URL = 'http://localhost:5000/api';

// Estado
let token = localStorage.getItem('habitlife_token') || null;

// DOM
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const habitsList = document.getElementById('habits-list');
const habitForm = document.getElementById('habit-form');
const playerName = document.getElementById('player-name');
const playerLevel = document.getElementById('player-level');
const playerGold = document.getElementById('player-gold');
const xpText = document.getElementById('xp-text');
const xpFill = document.getElementById('xp-fill');
const shopMessage = document.getElementById('shop-message');

// ─── AUTH ────────────────────────────────────────────────
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.tab === 'login') {
      loginForm.style.display = '';
      registerForm.style.display = 'none';
    } else {
      loginForm.style.display = 'none';
      registerForm.style.display = '';
    }
  });
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { loginError.textContent = data.error; return; }
    token = data.token;
    localStorage.setItem('habitlife_token', token);
    showApp(data.usuario);
  } catch (err) {
    loginError.textContent = 'Error de conexión.';
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';
  const nombre = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if (!res.ok) { registerError.textContent = data.error; return; }
    token = data.token;
    localStorage.setItem('habitlife_token', token);
    showApp(data.usuario);
  } catch (err) {
    registerError.textContent = 'Error de conexión.';
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  token = null;
  localStorage.removeItem('habitlife_token');
  appScreen.style.display = 'none';
  authScreen.style.display = '';
});

// ─── HEADERS ─────────────────────────────────────────────
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// ─── APP ─────────────────────────────────────────────────
function showApp(usuario) {
  authScreen.style.display = 'none';
  appScreen.style.display = '';
  updateUI(usuario);
  fetchHabits();
}

async function init() {
  if (token) {
    try {
      const res = await fetch(`${API_URL}/habits`, { headers: authHeaders() });
      if (res.ok) {
        const habits = await res.json();
        showApp({ nombre: habits[0] ? 'Jugador' : 'Nuevo Jugador', nivel: 1, xpActual: 0, xpNecesaria: 100, oroTotal: 0 });
        return;
      }
    } catch (e) { /* token inválido */ }
  }
  authScreen.style.display = '';
  appScreen.style.display = 'none';
}

// ─── HABITS ──────────────────────────────────────────────
async function fetchHabits() {
  try {
    const res = await fetch(`${API_URL}/habits`, { headers: authHeaders() });
    if (res.status === 401) { token = null; localStorage.removeItem('habitlife_token'); location.reload(); return; }
    const habits = await res.json();
    habitsList.innerHTML = '';

    if (habits.length === 0) {
      habitsList.innerHTML = '<li class="habit-item" style="color:#64748b;justify-content:center;">No hay misiones activas. Crea una arriba!</li>';
      return;
    }

    habits.forEach(h => {
      const li = document.createElement('li');
      li.className = 'habit-item';
      li.innerHTML = `
        <div>
          <strong>${h.nombre}</strong>
          <span style="font-size:0.85rem;color:#94a3b8;">
            Dificultad: <span style="color:#c084fc;font-weight:600;">${h.dificultad}</span> | Racha: ${h.racha_actual} dias
          </span>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="habit-btn" onclick="completeHabit(${h.id})">Logrado</button>
          <button class="habit-btn-delete" onclick="deleteHabit(${h.id})" title="Eliminar">X</button>
        </div>
      `;
      habitsList.appendChild(li);
    });
  } catch (error) {
    console.error('Error al obtener habitos:', error);
  }
}

habitForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombreInput = document.getElementById('habit-name');
  const dificultadSelect = document.getElementById('habit-difficulty');
  if (!nombreInput || !dificultadSelect) return;

  try {
    const res = await fetch(`${API_URL}/habits`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nombre: nombreInput.value, dificultad: dificultadSelect.value })
    });
    if (res.ok) {
      habitForm.reset();
      await fetchHabits();
    }
  } catch (error) {
    console.error('Error al crear:', error);
  }
});

window.completeHabit = async (id) => {
  try {
    const res = await fetch(`${API_URL}/habits/${id}/complete`, { method: 'POST', headers: authHeaders() });
    const data = await res.json();
    if (data.subioDeNivel) alert('LEVEL UP! Has subido de nivel.');
    if (data.estadoUsuario) updateUI(data.estadoUsuario);
    await fetchHabits();
  } catch (error) {
    console.error('Error:', error);
  }
};

window.deleteHabit = async (id) => {
  if (!confirm('Seguro que quieres eliminar esta mision?')) return;
  try {
    await fetch(`${API_URL}/habits/${id}`, { method: 'DELETE', headers: authHeaders() });
    await fetchHabits();
  } catch (error) {
    console.error('Error:', error);
  }
};

// ─── UI UPDATE ───────────────────────────────────────────
function updateUI(user) {
  if (playerName) playerName.textContent = user.nombre;
  if (playerLevel) playerLevel.textContent = user.nivel;
  if (playerGold) playerGold.textContent = user.oroTotal ?? user.oro ?? 0;
  if (xpText) xpText.textContent = `${user.xpActual ?? user.xp ?? 0} / ${user.xpNecesaria ?? user.xp_siguiente_nivel ?? 100} XP`;
  if (xpFill) {
    const xpAct = user.xpActual ?? user.xp ?? 0;
    const xpMax = user.xpNecesaria ?? user.xp_siguiente_nivel ?? 100;
    xpFill.style.width = `${(xpAct / xpMax) * 100}%`;
  }
}

// ─── TIENDA ──────────────────────────────────────────────
document.querySelectorAll('.btn-buy').forEach(btn => {
  btn.addEventListener('click', async () => {
    const producto = btn.dataset.producto;
    const costo = parseInt(btn.dataset.costo);

    shopMessage.textContent = '';
    shopMessage.className = 'shop-message';

    try {
      const res = await fetch(`${API_URL}/shop/comprar`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ producto, costo })
      });
      const data = await res.json();
      if (!res.ok) {
        shopMessage.textContent = data.error;
        shopMessage.className = 'shop-message error';
        return;
      }
      shopMessage.textContent = data.mensaje;
      shopMessage.className = 'shop-message success';
      if (data.estadoUsuario) updateUI(data.estadoUsuario);
    } catch (error) {
      shopMessage.textContent = 'Error de conexion.';
      shopMessage.className = 'shop-message error';
    }
  });
});

// ─── BOOT ────────────────────────────────────────────────
init();
