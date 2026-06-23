const API_URL = 'http://localhost:5000/api/habits';

// Elementos del DOM
const habitsList = document.getElementById('habits-list');
const habitForm = document.getElementById('habit-form');
const playerName = document.getElementById('player-name');
const playerLevel = document.getElementById('player-level');
const playerGold = document.getElementById('player-gold');
const xpText = document.getElementById('xp-text');
const xpFill = document.getElementById('xp-fill');

// 1. Cargar datos iniciales al abrir la página
async function init() {
    await fetchHabits();
    // Forzamos un render inicial simulando el estado del jugador del backend mock
    updateUI({ nombre: "Jugador Uno", nivel: 1, xpActual: 0, xpNecesaria: 100, oroTotal: 0 });
}

// 2. Obtener hábitos de la API
async function fetchHabits() {
    const res = await fetch(API_URL);
    const habits = await res.json();
    
    habitsList.innerHTML = ''; // Limpiar lista
    habits.forEach(habit => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
            <div>
                <strong>${habit.nombre}</strong> 
                <span style="font-size:0.8rem; color:#888;">[${habit.dificultad}] | 🔥 Racha: ${habit.racha_actual}</span>
            </div>
            <button class="habit-btn" onclick="completeHabit(${habit.id})">✓ Logrado</button>
        `;
        habitsList.appendChild(li);
    });
}

// 3. Crear un nuevo hábito
habitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('habit-name').value;
    const dificultad = document.getElementById('habit-difficulty').value;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, dificultad })
    });

    habitForm.reset();
    fetchHabits();
});

// 4. Marcar hábito como completado
window.completeHabit = async (id) => {
    const res = await fetch(`${API_URL}/${id}/complete`, { method: 'POST' });
    const data = await res.json();
    
    alert(`${data.mensaje}\nGanaste: +${data.recompensas.xpGanada} XP y +${data.recompensas.oroGanado} Oro!`);
    
    if (data.subioDeNivel) {
        alert("🎉 ¡¡LEVEL UP!! Has subido de nivel. ¡Sigue así, héroe! 🎉");
    }
    
    updateUI(data.estadoUsuario);
    fetchHabits(); // Recargar la lista para actualizar las rachas visibles
};

// 5. Actualizar los marcadores en la pantalla
function updateUI(user) {
    playerName.textContent = user.nombre;
    playerLevel.textContent = user.nivel;
    playerGold.textContent = user.oroTotal;
    xpText.textContent = `${user.xpActual}/${user.xpNecesaria}`;
    
    // Calcular porcentaje de la barra de XP
    const porcentaje = (user.xpActual / user.xpNecesaria) * 100;
    xpFill.style.width = `${porcentaje}%`;
}

// Arrancar la app
init();