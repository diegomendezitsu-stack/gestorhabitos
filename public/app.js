const API_URL = 'http://localhost:5000/api';

let token = localStorage.getItem('habitlife_token') || null;
let refreshToken = localStorage.getItem('habitlife_refresh') || null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const loadingOverlay = $('#loading-overlay');
const toastContainer = $('#toast-container');
const confettiCanvas = $('#confetti-canvas');

// ══════════════════════════════════════════════════════════════
// TOAST SYSTEM
// ══════════════════════════════════════════════════════════════
function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ══════════════════════════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════════════════════════
function fireConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#a855f7', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 100,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10,
      life: 1,
    });
  }

  let frame;
  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    particles.forEach((p) => {
      if (p.life <= 0) return;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.rot += p.vr;
      p.life -= 0.008;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (alive) frame = requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
  animate();
}

// ══════════════════════════════════════════════════════════════
// THEME
// ══════════════════════════════════════════════════════════════
const savedTheme = localStorage.getItem('habitlife_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

$('#btn-theme').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('habitlife_theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  const btn = $('#btn-theme');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ══════════════════════════════════════════════════════════════
// LOADING
// ══════════════════════════════════════════════════════════════
function showLoading() { loadingOverlay.classList.remove('hidden'); }
function hideLoading() { loadingOverlay.classList.add('hidden'); }

function setBtnLoading(btn, loading) {
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  if (text) text.style.opacity = loading ? '0' : '1';
  if (spinner) spinner.style.display = loading ? 'inline-block' : 'none';
}

// ══════════════════════════════════════════════════════════════
// AUTH TABS
// ══════════════════════════════════════════════════════════════
$$('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.auth-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    $('#login-form').style.display = isLogin ? '' : 'none';
    $('#register-form').style.display = isLogin ? 'none' : '';
  });
});

// ══════════════════════════════════════════════════════════════
// PASSWORD RULES LIVE
// ══════════════════════════════════════════════════════════════
const pwInput = $('#register-password');
if (pwInput) {
  pwInput.addEventListener('input', () => {
    const v = pwInput.value;
    $$('#password-rules li').forEach((li) => {
      const rule = li.dataset.rule;
      let pass = false;
      if (rule === 'length') pass = v.length >= 8;
      else if (rule === 'upper') pass = /[A-Z]/.test(v);
      else if (rule === 'lower') pass = /[a-z]/.test(v);
      else if (rule === 'number') pass = /[0-9]/.test(v);
      else if (rule === 'symbol') pass = /[!@#$%^&*]/.test(v);
      li.classList.toggle('valid', pass);
    });
  });
}

// ══════════════════════════════════════════════════════════════
// FORM VALIDATION
// ══════════════════════════════════════════════════════════════
function validateField(input, errorEl, rules) {
  const val = input.value.trim();
  let error = '';

  for (const rule of rules) {
    if (rule.required && !val) { error = rule.msg; break; }
    if (rule.minLength && val.length < rule.minLength) { error = rule.msg; break; }
    if (rule.pattern && !rule.pattern.test(val)) { error = rule.msg; break; }
    if (rule.custom && !rule.custom(val)) { error = rule.msg; break; }
  }

  input.classList.toggle('error', !!error);
  if (errorEl) errorEl.textContent = error;
  return !error;
}

function clearErrors(form) {
  form.querySelectorAll('.input-error').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('input.error').forEach((el) => el.classList.remove('error'));
}

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors($('#login-form'));
  const loginError = $('#login-error');
  loginError.textContent = '';

  const email = $('#login-email');
  const password = $('#login-password');

  const emailOk = validateField(email, $('#login-email-error'), [
    { required: true, msg: 'El email es obligatorio.' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Formato de email no válido.' },
  ]);
  const passOk = validateField(password, $('#login-password-error'), [
    { required: true, msg: 'La contraseña es obligatoria.' },
  ]);
  if (!emailOk || !passOk) return;

  const btn = $('#login-btn');
  setBtnLoading(btn, true);

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    const data = await res.json();
    if (!res.ok) { loginError.textContent = data.error; return; }
    token = data.token;
    refreshToken = data.refreshToken;
    localStorage.setItem('habitlife_token', token);
    localStorage.setItem('habitlife_refresh', refreshToken);
    showToast(`Bienvenido, ${data.usuario.nombre}!`, 'success');
    showApp(data.usuario);
  } catch {
    loginError.textContent = 'Error de conexión.';
  } finally {
    setBtnLoading(btn, false);
  }
});

$('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors($('#register-form'));
  const regError = $('#register-error');
  regError.textContent = '';

  const name = $('#register-name');
  const email = $('#register-email');
  const password = $('#register-password');

  const nameOk = validateField(name, $('#register-name-error'), [
    { required: true, msg: 'El nombre es obligatorio.' },
    { minLength: 2, msg: 'Mínimo 2 caracteres.' },
    { pattern: /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, msg: 'Solo letras y espacios.' },
  ]);
  const emailOk = validateField(email, $('#register-email-error'), [
    { required: true, msg: 'El email es obligatorio.' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Formato de email no válido.' },
  ]);
  const passOk = validateField(password, $('#register-password-error'), [
    { required: true, msg: 'La contraseña es obligatoria.' },
    { minLength: 8, msg: 'Mínimo 8 caracteres.' },
    { pattern: /[A-Z]/, msg: 'Falta una mayúscula.' },
    { pattern: /[a-z]/, msg: 'Falta una minúscula.' },
    { pattern: /[0-9]/, msg: 'Falta un número.' },
    { pattern: /[!@#$%^&*]/, msg: 'Falta un símbolo (!@#$%^&*).' },
  ]);
  if (!nameOk || !emailOk || !passOk) return;

  const btn = $('#register-btn');
  setBtnLoading(btn, true);

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: name.value, email: email.value, password: password.value }),
    });
    const data = await res.json();
    if (!res.ok) { regError.textContent = data.error; return; }
    token = data.token;
    refreshToken = data.refreshToken;
    localStorage.setItem('habitlife_token', token);
    localStorage.setItem('habitlife_refresh', refreshToken);
    showToast(`Cuenta creada! Bienvenido, ${data.usuario.nombre}`, 'success');
    showApp(data.usuario);
  } catch {
    regError.textContent = 'Error de conexión.';
  } finally {
    setBtnLoading(btn, false);
  }
});

$('#btn-logout').addEventListener('click', () => {
  token = null;
  refreshToken = null;
  localStorage.removeItem('habitlife_token');
  localStorage.removeItem('habitlife_refresh');
  $('#app-screen').style.display = 'none';
  $('#auth-screen').style.display = '';
  showToast('Sesión cerrada.', 'info');
});

// ══════════════════════════════════════════════════════════════
// API HELPERS
// ══════════════════════════════════════════════════════════════
function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function refreshAccessToken() {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    token = data.token;
    refreshToken = data.refreshToken;
    localStorage.setItem('habitlife_token', token);
    localStorage.setItem('habitlife_refresh', refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function authFetch(url, options = {}) {
  let res = await fetch(url, { ...options, headers: authHeaders() });
  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(url, { ...options, headers: authHeaders() });
    } else {
      token = null;
      refreshToken = null;
      localStorage.removeItem('habitlife_token');
      localStorage.removeItem('habitlife_refresh');
      location.reload();
    }
  }
  return res;
}

// ══════════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════════
function showApp(usuario) {
  $('#auth-screen').style.display = 'none';
  $('#app-screen').style.display = '';
  updateUI(usuario);
  fetchHabits();
}

async function init() {
  showLoading();
  if (token) {
    try {
      const res = await authFetch(`${API_URL}/habits`);
      if (res.ok) {
        const habits = await res.json();
        const userRes = await authFetch(`${API_URL}/health`);
        showApp({ nombre: 'Jugador', nivel: 1, xp: 0, xp_siguiente_nivel: 100, oro: 0 });
        hideLoading();
        return;
      }
    } catch {}
  }
  hideLoading();
  $('#auth-screen').style.display = '';
  $('#app-screen').style.display = 'none';
}

// ══════════════════════════════════════════════════════════════
// HABITS
// ══════════════════════════════════════════════════════════════
async function fetchHabits() {
  try {
    const res = await authFetch(`${API_URL}/habits`);
    if (res.status === 401) return;
    const habits = await res.json();
    const list = $('#habits-list');
    list.innerHTML = '';

    if (habits.length === 0) {
      list.innerHTML = '<li class="habits-empty">No hay misiones activas. Crea una arriba!</li>';
      return;
    }

    habits.forEach((h) => {
      const li = document.createElement('li');
      li.className = 'habit-item';
      li.dataset.id = h.id;
      li.innerHTML = `
        <div class="habit-info">
          <strong>${escapeHtml(h.nombre)}</strong>
          <div class="habit-meta">
            <span class="habit-difficulty diff-${h.dificultad}">${h.dificultad}</span>
            <span>🔥 ${h.racha_actual} días</span>
          </div>
        </div>
        <div class="habit-actions">
          <button class="btn-complete" data-action="complete">Logrado</button>
          <button class="btn-delete" data-action="delete" title="Eliminar">✕</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Error al obtener habitos:', error);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

$('#habit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombreInput = $('#habit-name');
  const dificultadSelect = $('#habit-difficulty');
  const btn = $('#add-habit-btn');

  if (!nombreInput.value.trim() || nombreInput.value.trim().length < 2) {
    showToast('El nombre debe tener al menos 2 caracteres.', 'warning');
    nombreInput.focus();
    return;
  }

  setBtnLoading(btn, true);

  try {
    const res = await authFetch(`${API_URL}/habits`, {
      method: 'POST',
      body: JSON.stringify({ nombre: nombreInput.value.trim(), dificultad: dificultadSelect.value }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Misión creada!', 'success');
      nombreInput.value = '';
      await fetchHabits();
    } else {
      showToast(data.error || 'Error al crear.', 'error');
    }
  } catch {
    showToast('Error de conexión.', 'error');
  } finally {
    setBtnLoading(btn, false);
  }
});

// EVENT DELEGATION - Habits
$('#habits-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const item = btn.closest('.habit-item');
  const id = item?.dataset.id;
  if (!id) return;

  if (btn.dataset.action === 'complete') {
    btn.disabled = true;
    try {
      const res = await authFetch(`${API_URL}/habits/${id}/complete`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error, 'warning');
        btn.disabled = false;
        return;
      }

      item.classList.add('completing');
      showToast(`+${data.recompensas.xpGanada} XP  +${data.recompensas.oroGanado} Oro`, 'success');

      if (data.subioDeNivel) {
        showToast(`LEVEL UP! Ahora eres Nivel ${data.estadoUsuario.nivel}`, 'success', 5000);
        fireConfetti();
      }

      if (data.estadoUsuario) updateUI(data.estadoUsuario);
      setTimeout(() => fetchHabits(), 500);
    } catch {
      showToast('Error de conexión.', 'error');
      btn.disabled = false;
    }
  }

  if (btn.dataset.action === 'delete') {
    if (!confirm('Eliminar esta misión?')) return;
    try {
      await authFetch(`${API_URL}/habits/${id}`, { method: 'DELETE' });
      showToast('Misión eliminada.', 'info');
      await fetchHabits();
    } catch {
      showToast('Error de conexión.', 'error');
    }
  }
});

// ══════════════════════════════════════════════════════════════
// UI UPDATE
// ══════════════════════════════════════════════════════════════
function updateUI(user) {
  if ($('#player-name')) $('#player-name').textContent = user.nombre;
  if ($('#player-level')) $('#player-level').textContent = user.nivel;
  if ($('#player-gold')) $('#player-gold').textContent = user.oroTotal ?? user.oro ?? 0;
  if ($('#xp-text')) $('#xp-text').textContent = `${user.xpActual ?? user.xp ?? 0} / ${user.xpNecesaria ?? user.xp_siguiente_nivel ?? 100} XP`;
  if ($('#xp-fill')) {
    const xpAct = user.xpActual ?? user.xp ?? 0;
    const xpMax = user.xpNecesaria ?? user.xp_siguiente_nivel ?? 100;
    $('#xp-fill').style.width = `${(xpAct / xpMax) * 100}%`;
  }
}

// ══════════════════════════════════════════════════════════════
// SHOP - EVENT DELEGATION
// ══════════════════════════════════════════════════════════════
$('#shop-items').addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-buy');
  if (!btn) return;

  const producto = btn.dataset.producto;
  const costo = parseInt(btn.dataset.costo);

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = '...';

  try {
    const res = await authFetch(`${API_URL}/shop/comprar`, {
      method: 'POST',
      body: JSON.stringify({ producto, costo }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error, 'error');
    } else {
      showToast(data.mensaje, 'success');
      if (data.estadoUsuario) updateUI(data.estadoUsuario);
    }
  } catch {
    showToast('Error de conexión.', 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// ══════════════════════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════════════════════
init();
