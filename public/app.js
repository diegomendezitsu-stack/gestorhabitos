const API_URL = `${window.location.origin}/api`;

let token = localStorage.getItem('habitlife_token') || null;
let refreshToken = localStorage.getItem('habitlife_refresh') || null;

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ══════════════════════════════════════════════════════════════
   SPLASH SCREEN
   ══════════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => $('#splash')?.classList.add('hidden'), 1400);
});

/* ══════════════════════════════════════════════════════════════
   TOASTS
   ══════════════════════════════════════════════════════════════ */
function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: '✓', error: '✕', info: 'i', warning: '!' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  $('#toast-container').appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ══════════════════════════════════════════════════════════════
   CONFETTI
   ══════════════════════════════════════════════════════════════ */
function fireConfetti() {
  const canvas = $('#confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  const colors = ['#a855f7','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#8b5cf6','#06b6d4'];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 120,
      w: 5 + Math.random() * 7,
      h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 5,
      vy: 2 + Math.random() * 5,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
      life: 1,
    });
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach((p) => {
      if (p.life <= 0) return;
      alive = true;
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.rot += p.vr; p.life -= 0.007;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    if (alive) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

/* ══════════════════════════════════════════════════════════════
   SOUND EFFECTS (Web Audio API)
   ══════════════════════════════════════════════════════════════ */
let audioCtx;
function playSound(type) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.value = 0.08;
    if (type === 'complete') { osc.frequency.setValueAtTime(523, audioCtx.currentTime); osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.08); osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.16); }
    else if (type === 'levelup') { osc.frequency.setValueAtTime(523, audioCtx.currentTime); osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1); osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2); osc.frequency.setValueAtTime(1047, audioCtx.currentTime + 0.3); gain.gain.value = 0.1; }
    else if (type === 'buy') { osc.frequency.setValueAtTime(880, audioCtx.currentTime); osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1); }
    osc.type = 'sine'; osc.start(); osc.stop(audioCtx.currentTime + 0.5);
  } catch {}
}

/* ══════════════════════════════════════════════════════════════
   THEME
   ══════════════════════════════════════════════════════════════ */
const savedTheme = localStorage.getItem('habitlife_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

$('#btn-theme').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('habitlife_theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(t) { const b = $('#btn-theme'); if (b) b.textContent = t === 'dark' ? '☀️' : '🌙'; }

/* ══════════════════════════════════════════════════════════════
   LOADING
   ══════════════════════════════════════════════════════════════ */
function showLoading() { $('#loading-overlay').classList.remove('hidden'); }
function hideLoading() { $('#loading-overlay').classList.add('hidden'); }
function setBtnLoading(btn, loading) {
  if (!btn) return;
  const t = btn.querySelector('.btn-text'), s = btn.querySelector('.btn-spinner');
  btn.disabled = loading;
  if (t) t.style.opacity = loading ? '0' : '1';
  if (s) s.style.display = loading ? 'inline-block' : 'none';
}

/* ══════════════════════════════════════════════════════════════
   SCROLL TO TOP
   ══════════════════════════════════════════════════════════════ */
const scrollBtn = $('#scroll-top');
window.addEventListener('scroll', () => {
  scrollBtn.classList.toggle('visible', window.scrollY > 300);
});
scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════════════════════════════
   NAV TABS
   ══════════════════════════════════════════════════════════════ */
$$('.nav-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.nav-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const view = tab.dataset.view;
    $$('.view-panel').forEach((v) => v.style.display = 'none');
    const target = $(`#view-${view}`);
    if (target) { target.style.display = ''; target.classList.add('active'); }
    if (view === 'stats') loadStats();
    if (view === 'badges') loadBadges();
    if (view === 'profile') loadProfile();
    if (view === 'shop') loadShopHistory();
  });
});

/* ══════════════════════════════════════════════════════════════
   AUTH TABS
   ══════════════════════════════════════════════════════════════ */
$$('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.auth-tab').forEach((t) => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    const isLogin = tab.dataset.tab === 'login';
    $('#login-form').style.display = isLogin ? '' : 'none';
    $('#register-form').style.display = isLogin ? 'none' : '';
  });
});

/* ══════════════════════════════════════════════════════════════
   PASSWORD RULES
   ══════════════════════════════════════════════════════════════ */
$('#register-password')?.addEventListener('input', (e) => {
  const v = e.target.value;
  $$('#password-rules li').forEach((li) => {
    const r = li.dataset.rule;
    let ok = false;
    if (r === 'length') ok = v.length >= 8;
    else if (r === 'upper') ok = /[A-Z]/.test(v);
    else if (r === 'lower') ok = /[a-z]/.test(v);
    else if (r === 'number') ok = /[0-9]/.test(v);
    else if (r === 'symbol') ok = /[!@#$%^&*]/.test(v);
    li.classList.toggle('valid', ok);
  });
});

/* ══════════════════════════════════════════════════════════════
   FORM VALIDATION
   ══════════════════════════════════════════════════════════════ */
function validateField(input, errorEl, rules) {
  const val = input.value.trim();
  let error = '';
  for (const rule of rules) {
    if (rule.required && !val) { error = rule.msg; break; }
    if (rule.minLength && val.length < rule.minLength) { error = rule.msg; break; }
    if (rule.pattern && !rule.pattern.test(val)) { error = rule.msg; break; }
  }
  input.classList.toggle('error', !!error);
  if (errorEl) errorEl.textContent = error;
  return !error;
}
function clearErrors(form) {
  form.querySelectorAll('.input-error').forEach((el) => (el.textContent = ''));
  form.querySelectorAll('input.error').forEach((el) => el.classList.remove('error'));
}

/* ══════════════════════════════════════════════════════════════
   AUTH
   ══════════════════════════════════════════════════════════════ */
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault(); clearErrors($('#login-form'));
  const loginError = $('#login-error'); loginError.textContent = '';
  const email = $('#login-email'), password = $('#login-password');
  const eOk = validateField(email, $('#login-email-error'), [
    { required: true, msg: 'El email es obligatorio.' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Email no valido.' },
  ]);
  const pOk = validateField(password, $('#login-password-error'), [
    { required: true, msg: 'La contrasena es obligatoria.' },
  ]);
  if (!eOk || !pOk) return;
  const btn = $('#login-btn'); setBtnLoading(btn, true);
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    const data = await res.json();
    if (!res.ok) { loginError.textContent = data.error; return; }
    token = data.token; refreshToken = data.refreshToken;
    localStorage.setItem('habitlife_token', token);
    localStorage.setItem('habitlife_refresh', refreshToken);
    showToast(`Bienvenido, ${data.usuario.nombre}!`, 'success');
    showApp(data.usuario);
  } catch { loginError.textContent = 'Error de conexion.'; }
  finally { setBtnLoading(btn, false); }
});

$('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault(); clearErrors($('#register-form'));
  const regError = $('#register-error'); regError.textContent = '';
  const name = $('#register-name'), email = $('#register-email'), password = $('#register-password');
  const nOk = validateField(name, $('#register-name-error'), [
    { required: true, msg: 'El nombre es obligatorio.' },
    { minLength: 2, msg: 'Minimo 2 caracteres.' },
    { pattern: /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, msg: 'Solo letras y espacios.' },
  ]);
  const eOk = validateField(email, $('#register-email-error'), [
    { required: true, msg: 'El email es obligatorio.' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Email no valido.' },
  ]);
  const pOk = validateField(password, $('#register-password-error'), [
    { required: true, msg: 'La contrasena es obligatoria.' },
    { minLength: 8, msg: 'Minimo 8 caracteres.' },
    { pattern: /[A-Z]/, msg: 'Falta una mayuscula.' },
    { pattern: /[a-z]/, msg: 'Falta una minuscula.' },
    { pattern: /[0-9]/, msg: 'Falta un numero.' },
    { pattern: /[!@#$%^&*]/, msg: 'Falta un simbolo.' },
  ]);
  if (!nOk || !eOk || !pOk) return;
  const btn = $('#register-btn'); setBtnLoading(btn, true);
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: name.value, email: email.value, password: password.value }),
    });
    const data = await res.json();
    if (!res.ok) { regError.textContent = data.error; return; }
    token = data.token; refreshToken = data.refreshToken;
    localStorage.setItem('habitlife_token', token);
    localStorage.setItem('habitlife_refresh', refreshToken);
    showToast(`Cuenta creada! Bienvenido, ${data.usuario.nombre}`, 'success');
    showApp(data.usuario);
  } catch { regError.textContent = 'Error de conexion.'; }
  finally { setBtnLoading(btn, false); }
});

$('#btn-logout').addEventListener('click', () => {
  token = null; refreshToken = null;
  localStorage.removeItem('habitlife_token');
  localStorage.removeItem('habitlife_refresh');
  $('#app-screen').style.display = 'none';
  $('#auth-screen').style.display = '';
  showToast('Sesion cerrada.', 'info');
});

/* ══════════════════════════════════════════════════════════════
   API HELPERS
   ══════════════════════════════════════════════════════════════ */
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }; }

async function refreshAccessToken() {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    token = data.token; refreshToken = data.refreshToken;
    localStorage.setItem('habitlife_token', token);
    localStorage.setItem('habitlife_refresh', refreshToken);
    return true;
  } catch { return false; }
}

async function authFetch(url, options = {}) {
  let res = await fetch(url, { ...options, headers: authHeaders() });
  if (res.status === 401 && refreshToken) {
    if (await refreshAccessToken()) {
      res = await fetch(url, { ...options, headers: authHeaders() });
    } else {
      token = null; refreshToken = null;
      localStorage.removeItem('habitlife_token');
      localStorage.removeItem('habitlife_refresh');
      location.reload();
    }
  }
  return res;
}

function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

/* ══════════════════════════════════════════════════════════════
   APP INIT
   ══════════════════════════════════════════════════════════════ */
function showApp(usuario) {
  $('#auth-screen').style.display = 'none';
  $('#app-screen').style.display = '';
  updateUI(usuario);
  fetchHabits();
}

async function init() {
  if (token) {
    try {
      const res = await authFetch(`${API_URL}/user/profile`);
      if (res.ok) {
        const user = await res.json();
        showApp(user);
        return;
      }
    } catch {}
  }
  $('#auth-screen').style.display = '';
  $('#app-screen').style.display = 'none';
}

/* ══════════════════════════════════════════════════════════════
   HABITS
   ══════════════════════════════════════════════════════════════ */
const CAT_ICONS = { general:'📋', salud:'💊', estudio:'📖', trabajo:'💼', fitness:'💪', meditacion:'🧘', lectura:'📚', creatividad:'🎨', social:'👥', finanzas:'💰' };
let showArchived = false;
let filterCategory = '';

function populateCategoryFilter() {
  const sel = $('#habit-filter-cat');
  if (!sel) return;
  const existing = new Set([...sel.options].map(o => o.value));
  Object.keys(CAT_ICONS).forEach(cat => {
    if (!existing.has(cat)) {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = `${CAT_ICONS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
      sel.appendChild(opt);
    }
  });
}

$('#btn-toggle-archived')?.addEventListener('click', () => {
  showArchived = !showArchived;
  const btn = $('#btn-toggle-archived');
  btn.textContent = showArchived ? 'Activas' : 'Archivados';
  btn.classList.toggle('active-filter', showArchived);
  fetchHabits();
});

$('#habit-filter-cat')?.addEventListener('change', (e) => {
  filterCategory = e.target.value;
  fetchHabits();
});

async function fetchHabits() {
  try {
    populateCategoryFilter();
    const url = showArchived ? `${API_URL}/habits?archivados=true` : `${API_URL}/habits`;
    const res = await authFetch(url);
    if (res.status === 401) return;
    const allHabits = await res.json();
    let habits = showArchived ? allHabits : allHabits.filter(h => h.activo !== false);
    if (filterCategory) habits = habits.filter(h => h.categoria === filterCategory);
    const list = $('#habits-list');
    list.innerHTML = '';
    if (habits.length === 0) {
      const msg = showArchived ? 'No tienes habitos archivados.' : 'No tienes misiones activas.<br>Crea una arriba para empezar!';
      list.innerHTML = `<li class="habits-empty"><span class="habits-empty-icon">${showArchived ? '📦' : '🎯'}</span><p>${msg}</p></li>`;
      return;
    }
    habits.forEach((h) => {
      const li = document.createElement('li');
      li.className = 'habit-item'; li.dataset.id = h.id;
      if (!h.activo) li.classList.add('archived');
      const cat = h.categoria || 'general';
      const icon = CAT_ICONS[cat] || '📋';
      const today = new Date().toISOString().slice(0, 10);
      const lastDone = h.ultima_vez_cumplido ? new Date(h.ultima_vez_cumplido).toISOString().slice(0, 10) : '';
      const doneToday = lastDone === today;
      li.innerHTML = `
        <div class="habit-info">
          <div class="habit-name-row">
            <span class="habit-cat-icon">${icon}</span>
            <strong>${escapeHtml(h.nombre)}</strong>
          </div>
          <div class="habit-meta">
            <span class="habit-difficulty diff-${h.dificultad}">${h.dificultad}</span>
            <span class="habit-category-tag">${cat}</span>
            <span>🔥 ${h.racha_actual} dias</span>
            ${h.mejor_racha > 0 ? `<span class="habit-best-streak">⭐ Max: ${h.mejor_racha}</span>` : ''}
          </div>
        </div>
        <div class="habit-actions">
          ${h.activo !== false
            ? (doneToday
              ? `<button class="btn-undo" data-action="undo">Deshacer</button>`
              : `<button class="btn-complete" data-action="complete">Logrado</button>`)
            : `<button class="btn-restore" data-action="restore">Restaurar</button>`
          }
          <button class="btn-delete" data-action="delete" title="Eliminar">✕</button>
        </div>`;
      list.appendChild(li);
    });
  } catch (e) { console.error(e); }
}

$('#habit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombreInput = $('#habit-name'), diffSelect = $('#habit-difficulty'), catSelect = $('#habit-category'), btn = $('#add-habit-btn');
  if (!nombreInput.value.trim() || nombreInput.value.trim().length < 2) {
    showToast('El nombre debe tener al menos 2 caracteres.', 'warning');
    nombreInput.focus(); return;
  }
  setBtnLoading(btn, true);
  try {
    const res = await authFetch(`${API_URL}/habits`, {
      method: 'POST',
      body: JSON.stringify({ nombre: nombreInput.value.trim(), dificultad: diffSelect.value, categoria: catSelect.value }),
    });
    const data = await res.json();
    if (res.ok) { showToast('Mision creada!', 'success'); nombreInput.value = ''; playSound('complete'); showNewBadges(data.nuevosLogros); await fetchHabits(); }
    else showToast(data.error || 'Error al crear.', 'error');
  } catch { showToast('Error de conexion.', 'error'); }
  finally { setBtnLoading(btn, false); }
});

$('#habits-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const item = btn.closest('.habit-item'), id = item?.dataset.id;
  if (!id) return;

  if (btn.dataset.action === 'complete') {
    btn.disabled = true;
    try {
      const res = await authFetch(`${API_URL}/habits/${id}/complete`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, 'warning'); btn.disabled = false; return; }
      item.classList.add('completing');
      playSound('complete');
      showToast(`+${data.recompensas.xpGanada} XP  +${data.recompensas.oroGanado} Oro`, 'success');
      if (data.subioDeNivel) {
        showToast(`LEVEL UP! Ahora eres Nivel ${data.estadoUsuario.nivel}`, 'success', 5000);
        playSound('levelup'); fireConfetti();
      }
      if (data.estadoUsuario) updateUI(data.estadoUsuario);
      showNewBadges(data.nuevosLogros);
      setTimeout(() => fetchHabits(), 500);
    } catch { showToast('Error de conexion.', 'error'); btn.disabled = false; }
  }

  if (btn.dataset.action === 'undo') {
    btn.disabled = true;
    try {
      const res = await authFetch(`${API_URL}/habits/${id}/undo`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, 'warning'); btn.disabled = false; return; }
      showToast('Habito deshecho.', 'info');
      if (data.estadoUsuario) updateUI(data.estadoUsuario);
      await fetchHabits();
    } catch { showToast('Error de conexion.', 'error'); btn.disabled = false; }
  }

  if (btn.dataset.action === 'restore') {
    btn.disabled = true;
    try {
      const res = await authFetch(`${API_URL}/habits/${id}/restore`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, 'warning'); btn.disabled = false; return; }
      showToast('Habito restaurado.', 'success');
      await fetchHabits();
    } catch { showToast('Error de conexion.', 'error'); btn.disabled = false; }
  }

  if (btn.dataset.action === 'delete') {
    if (!confirm('Eliminar esta mision?')) return;
    try {
      await authFetch(`${API_URL}/habits/${id}`, { method: 'DELETE' });
      showToast('Mision eliminada.', 'info'); await fetchHabits();
    } catch { showToast('Error de conexion.', 'error'); }
  }
});

/* ══════════════════════════════════════════════════════════════
   UI UPDATE
   ══════════════════════════════════════════════════════════════ */
function updateUI(user) {
  const set = (s, v) => { const e = $(s); if (e) e.textContent = v; };
  set('#player-name', user.nombre);
  set('#player-level', user.nivel);
  set('#player-gold', user.oroTotal ?? user.oro ?? 0);
  set('#xp-text', `${user.xpActual ?? user.xp ?? 0} / ${user.xpNecesaria ?? user.xp_siguiente_nivel ?? 100} XP`);
  const fill = $('#xp-fill');
  if (fill) {
    const act = user.xpActual ?? user.xp ?? 0;
    const max = user.xpNecesaria ?? user.xp_siguiente_nivel ?? 100;
    fill.style.width = `${(act / max) * 100}%`;
  }
}

/* ══════════════════════════════════════════════════════════════
   STATS
   ══════════════════════════════════════════════════════════════ */
async function loadStats() {
  try {
    const res = await authFetch(`${API_URL}/stats`);
    if (!res.ok) return;
    const data = await res.json();
    const s = data.stats;
    set('#stat-level', s.usuario.nivel);
    set('#stat-streak', s.rachaMaxima);
    set('#stat-completed', s.completadosHoy);
    set('#stat-gold', s.usuario.oro);
  } catch {}

  try {
    const res = await authFetch(`${API_URL}/stats/heatmap`);
    if (!res.ok) return;
    const data = await res.json();
    const heatmap = $('#heatmap');
    const diaSemana = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
    heatmap.innerHTML = data.map((d) => {
      const date = new Date(d.fecha + 'T12:00:00');
      const nombre = diaSemana[date.getDay()];
      const level = Math.min(d.cantidad, 4);
      return `<div class="heatmap-day">
        <div class="heatmap-block" data-level="${level}" title="${d.cantidad} habitos completados"></div>
        <span class="heatmap-label">${nombre}</span>
        <span class="heatmap-count">${d.cantidad || '-'}</span>
      </div>`;
    }).join('');
  } catch {}
}

/* ══════════════════════════════════════════════════════════════
   BADGES
   ══════════════════════════════════════════════════════════════ */
async function loadBadges() {
  try {
    const res = await authFetch(`${API_URL}/badges`);
    if (!res.ok) return;
    const data = await res.json();
    set('#badges-count', data.desbloqueados);
    set('#badges-total', data.totalBadges);
    const unlocked = data.badges.filter(b => b.desbloqueado);
    const locked = data.badges.filter(b => !b.desbloqueado);
    const renderBadge = (b) => {
      const fecha = b.desbloqueado_en ? new Date(b.desbloqueado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
      if (b.desbloqueado) {
        return `<div class="badge-card unlocked" title="${b.desc}">
          <span class="badge-icon">${b.icono}</span>
          <span class="badge-name">${b.nombre}</span>
          <span class="badge-desc">${b.desc}</span>
          <span class="badge-date">${fecha}</span>
        </div>`;
      }
      let progressHtml = '';
      if (b.progreso) {
        const pct = Math.min(100, Math.round((b.progreso.actual / b.progreso.meta) * 100));
        progressHtml = `<div class="badge-progress">
          <div class="badge-progress-bar"><div class="badge-progress-fill" style="width:${pct}%"></div></div>
          <span class="badge-progress-text">${b.progreso.actual} / ${b.progreso.meta}</span>
        </div>`;
      }
      return `<div class="badge-card locked" title="${b.desc}">
        <span class="badge-icon locked-icon">${b.icono}</span>
        <span class="badge-name">${b.nombre}</span>
        <span class="badge-desc badge-req">${b.desc}</span>
        ${progressHtml}
      </div>`;
    };
    const unlockedGrid = $('#badges-unlocked');
    const lockedGrid = $('#badges-locked');
    if (unlockedGrid) unlockedGrid.innerHTML = unlocked.length > 0 ? unlocked.map(renderBadge).join('') : '<p class="badges-empty">Aun no has desbloqueado ningun logro.</p>';
    if (lockedGrid) lockedGrid.innerHTML = locked.length > 0 ? locked.map(renderBadge).join('') : '<p class="badges-empty">Felicidades! Desbloqueaste todos los logros!</p>';
  } catch {}
}

function showNewBadges(logros) {
  if (!logros || logros.length === 0) return;
  logros.forEach(b => {
    showToast(`${b.icono} Logro desbloqueado: ${b.nombre}!`, 'success');
  });
}

/* ══════════════════════════════════════════════════════════════
   SHOP
   ══════════════════════════════════════════════════════════════ */
$('#shop-items').addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-buy');
  if (!btn) return;
  const producto = btn.dataset.producto, costo = parseInt(btn.dataset.costo);
  btn.disabled = true; const orig = btn.textContent; btn.textContent = '...';
  try {
    const res = await authFetch(`${API_URL}/shop/comprar`, {
      method: 'POST', body: JSON.stringify({ producto, costo }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error, 'error'); }
    else { showToast(data.mensaje, 'success'); playSound('buy'); if (data.estadoUsuario) updateUI(data.estadoUsuario); showNewBadges(data.nuevosLogros); loadShopHistory(); }
  } catch { showToast('Error de conexion.', 'error'); }
  finally { btn.textContent = orig; btn.disabled = false; }
});

async function loadShopHistory() {
  try {
    const res = await authFetch(`${API_URL}/shop/historial`);
    if (!res.ok) return;
    const items = await res.json();
    const container = $('#shop-history');
    if (!container) return;
    if (items.length === 0) {
      container.innerHTML = '<p style="color:#888;text-align:center;">Aun no has reclamado recompensas.</p>';
      return;
    }
    container.innerHTML = items.map(i => {
      const fecha = new Date(i.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
      return `<div class="shop-history-item">
        <span class="shop-history-producto">${escapeHtml(i.producto)}</span>
        <span class="shop-history-costo">🪙 ${i.costo}</span>
        <span class="shop-history-fecha">${fecha}</span>
      </div>`;
    }).join('');
  } catch {}
}

/* ══════════════════════════════════════════════════════════════
   PROFILE
   ══════════════════════════════════════════════════════════════ */
const AVATARS = [
  '🧙‍♂️','🧙‍♀️','🦸‍♂️','🦸‍♀️','🧑‍🚀','🦹‍♂️','🦹‍♀️','🧑‍💻','👨‍🎨','👩‍🎨',
  '🦊','🐱','🐶','🦁','🐯','🐼','🐨','🦄','🐙','🦋',
  '🐲','🐉','🦅','🦉','🐺','🦝','🦌','🐢','🐬','🦈',
  '🤖','👾','👽','🎭','🥷','🧑‍🏭','🧑‍🔬','🧑‍🍳','🧑‍🎓','🧑‍🎤',
  '💀','👻','🎃','🔥','⚡','❄️','🌟','💎','🎲','🎯'
];

async function loadProfile() {
  try {
    const res = await authFetch(`${API_URL}/user/profile`);
    if (!res.ok) return;
    const user = await res.json();
    $('#profile-avatar').textContent = user.avatar || '🧙‍♂️';
    $('#profile-name').value = user.nombre;
    if (user.avatar) $('#player-avatar-header').textContent = user.avatar;
  } catch {}
}

function renderAvatarPicker() {
  const picker = $('#avatar-picker');
  picker.innerHTML = AVATARS.map(a => `<button class="avatar-option" data-avatar="${a}" aria-label="Avatar ${a}">${a}</button>`).join('');
  picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
}

$('#btn-change-avatar')?.addEventListener('click', renderAvatarPicker);

$('#avatar-picker')?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.avatar-option');
  if (!btn) return;
  const avatar = btn.dataset.avatar;
  try {
    const res = await authFetch(`${API_URL}/user/profile`, {
      method: 'PUT', body: JSON.stringify({ avatar }),
    });
    if (res.ok) {
      const data = await res.json();
      $('#profile-avatar').textContent = avatar;
      if (data.avatar) $('#player-avatar-header').textContent = data.avatar;
      $('#avatar-picker').style.display = 'none';
      showToast('Avatar actualizado!', 'success');
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Error al actualizar avatar.', 'error');
    }
  } catch { showToast('Error de conexion.', 'error'); }
});

$('#profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = $('#profile-name').value.trim();
  if (!nombre || nombre.length < 2) { showToast('Minimo 2 caracteres.', 'warning'); return; }
  try {
    const res = await authFetch(`${API_URL}/user/profile`, {
      method: 'PUT', body: JSON.stringify({ nombre }),
    });
    if (res.ok) {
      const data = await res.json();
      updateUI(data);
      $('#profile-name').value = data.nombre;
      showToast('Perfil actualizado!', 'success');
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || 'Error al actualizar perfil.', 'error');
    }
  } catch { showToast('Error de conexion.', 'error'); }
});

$('#btn-export-data')?.addEventListener('click', async () => {
  try {
    const res = await authFetch(`${API_URL}/user/export`);
    if (!res.ok) return;
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `habitlife_datos_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Datos exportados!', 'success');
  } catch { showToast('Error de conexion.', 'error'); }
});

$('#btn-delete-account')?.addEventListener('click', async () => {
  if (!confirm('ESTA ACCION ES PERMANENTE.\n\nSe eliminaran todos tus datos, habitos y progreso.\nEscribe "ELIMINAR" para confirmar.')) return;
  const confirm2 = prompt('Escribe ELIMINAR para confirmar:');
  if (confirm2 !== 'ELIMINAR') { showToast('Cancelado.', 'info'); return; }
  try {
    const res = await authFetch(`${API_URL}/user/account`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Cuenta eliminada.', 'info');
      token = null; refreshToken = null;
      localStorage.removeItem('habitlife_token');
      localStorage.removeItem('habitlife_refresh');
      $('#app-screen').style.display = 'none';
      $('#auth-screen').style.display = '';
    }
  } catch { showToast('Error de conexion.', 'error'); }
});

/* ══════════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════════ */
init();
