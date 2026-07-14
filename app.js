const authView = document.getElementById('authView');
const appView = document.getElementById('appView');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const tabs = document.querySelectorAll('.tab');
const surveyForm = document.getElementById('surveyForm');

const storageKey = 'habits-pro-accounts';
const sessionKey = 'habits-pro-session';

function getAccounts() {
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

function saveAccounts(accounts) {
  localStorage.setItem(storageKey, JSON.stringify(accounts));
}

function getSession() {
  return JSON.parse(localStorage.getItem(sessionKey) || 'null');
}

function setSession(user) {
  localStorage.setItem(sessionKey, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(sessionKey);
}

function showAuth() {
  authView.classList.remove('hidden');
  appView.classList.add('hidden');
  logoutBtn.classList.add('hidden');
}

function showApp(user) {
  authView.classList.add('hidden');
  appView.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
  document.getElementById('welcomeTitle').textContent = `Bienvenido, ${user.name}`;
  document.getElementById('welcomeSubtitle').textContent = 'Aquí tienes una guía personalizada para transformar tu rutina.';
  renderProfile(user);
}

function renderProfile(user) {
  const summary = document.getElementById('profileSummary');
  summary.innerHTML = `
    <div class="plan-item">
      <strong>Nombre</strong><div>${user.name}</div>
    </div>
    <div class="plan-item">
      <strong>Correo</strong><div>${user.email}</div>
    </div>
    <div class="plan-item">
      <strong>Estado</strong><div>${user.lastPlan ? 'Plan generado' : 'Esperando evaluación'}</div>
    </div>
  `;
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.tab === 'register') {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    } else {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    }
  });
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const accounts = getAccounts();
  const user = accounts.find(acc => acc.email === email && acc.password === password);
  if (user) {
    setSession(user);
    showApp(user);
  } else {
    alert('Credenciales incorrectas.');
  }
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const accounts = getAccounts();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  if (!name || !email || !password) return;
  if (accounts.some(acc => acc.email === email)) {
    alert('Ese correo ya está registrado.');
    return;
  }
  const newUser = { name, email, password, lastPlan: null };
  accounts.push(newUser);
  saveAccounts(accounts);
  setSession(newUser);
  showApp(newUser);
});

logoutBtn.addEventListener('click', () => {
  clearSession();
  showAuth();
  loginForm.reset();
  registerForm.reset();
});

surveyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = getSession();
  const age = Number(document.getElementById('age').value);
  const goal = document.getElementById('goal').value;
  const activity = document.getElementById('activity').value;
  const sleep = Number(document.getElementById('sleep').value);
  const stress = document.getElementById('stress').value;
  const water = Number(document.getElementById('water').value);
  const habitsText = document.getElementById('habits').value;

  const score = Math.min(100, 40 + (activity === 'activo' ? 20 : activity === 'moderado' ? 12 : 6) + (sleep >= 7 ? 15 : 8) + (water >= 8 ? 12 : 6) + (stress === 'bajo' ? 10 : stress === 'medio' ? 6 : 3));
  const planType = goal === 'perder peso' ? 'Equilibrio calórico' : goal === 'ganar masa' ? 'Proteína y recuperación' : goal === 'mejorar energia' ? 'Ritmo vital' : 'Calma y resiliencia';
  const nutritionFocus = goal === 'perder peso' ? 'Control de carbohidratos y saciedad' : goal === 'ganar masa' ? 'Proteína + carbohidratos inteligentes' : goal === 'mejorar energia' ? 'Vitaminas, hierro y hidración' : 'Magnesio, omega 3 y sueño';
  const goalText = goal === 'perder peso' ? 'Perder 0.5-1 kg/semana' : goal === 'ganar masa' ? 'Subir masa magra y fuerza' : goal === 'mejorar energia' ? 'Mantener energía estable todo el día' : 'Reducir ansiedad y mejorar descanso';

  const mealPlan = [
    { title: 'Desayuno', desc: goal === 'ganar masa' ? 'Tostadas integrales con huevo, aguacate y fruta' : 'Avena con yogurt, nueces y banana' },
    { title: 'Almuerzo', desc: goal === 'perder peso' ? 'Ensalada de pollo, quinoa y verduras' : 'Arroz integral con pescado, ensalada y aceite de oliva' },
    { title: 'Cena', desc: goal === 'reducir estrés' ? 'Tacos de verduras con legumbres y guacamole' : 'Tofu o carne magra con verduras al vapor' },
    { title: 'Snack', desc: 'Fruta + puñado de frutos secos o un yogur natural' }
  ];

  const habits = [
    'Beber agua al despertar y cada 2-3 horas.',
    'Moverse 10 minutos después de cada comida.',
    'Dormir a la misma hora y reducir pantallas.',
    'Registrar 3 hábitos diarios para mantener foco.',
    'Priorizar alimentos reales, sin ultraprocesados.'
  ];

  const exercisePlan = [
    { title: 'Calentamiento', desc: '5 minutos de movilidad y respiración.' },
    { title: 'Entrenamiento', desc: activity === 'activo' ? '30 min de fuerza o carrera' : activity === 'moderado' ? '20 min de caminata rápida' : '15 min de movilidad y caminata ligera' },
    { title: 'Recuperación', desc: 'Estiramientos de 5-8 minutos al final.' }
  ];

  const tips = [
    'Incluye proteína en cada comida para sostener la saciedad.',
    'Reduce el consumo de azúcar y bebidas azucaradas.',
    'Si el estrés es alto, añade una pausa de 5 minutos de respiración.',
    `Tu evaluación indica que ${habitsText || 'tu rutina necesita más estructura'}.`
  ];

  document.getElementById('scoreValue').textContent = `${score}%`;
  document.getElementById('scoreBar').style.width = `${score}%`;
  document.getElementById('nutritionFocus').textContent = nutritionFocus;
  document.getElementById('planType').textContent = planType;
  document.getElementById('goalText').textContent = goalText;

  document.getElementById('mealPlan').innerHTML = mealPlan.map(item => `<div class="plan-item"><strong>${item.title}</strong><div>${item.desc}</div></div>`).join('');
  document.getElementById('habitChecklist').innerHTML = habits.map(habit => `<label><input type="checkbox" /> ${habit}</label>`).join('');
  document.getElementById('exercisePlan').innerHTML = exercisePlan.map(item => `<div class="plan-item"><strong>${item.title}</strong><div>${item.desc}</div></div>`).join('');
  document.getElementById('nutritionTips').innerHTML = tips.map(tip => `<div class="plan-item">${tip}</div>`).join('');

  if (user) {
    const accounts = getAccounts();
    const index = accounts.findIndex(acc => acc.email === user.email);
    if (index >= 0) {
      accounts[index].lastPlan = { score, planType, goal, nutritionFocus };
      saveAccounts(accounts);
      setSession(accounts[index]);
    }
  }
});

const session = getSession();
if (session) {
  showApp(session);
} else {
  showAuth();
}
