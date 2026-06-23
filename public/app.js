const API_URL = 'http://localhost:5000/api/habits';

// Elementos del DOM (Conectados con el nuevo HTML profesional)
const habitsList = document.getElementById('habits-list');
const habitForm = document.getElementById('habit-form');
const playerName = document.getElementById('player-name');
const playerLevel = document.getElementById('player-level');
const playerGold = document.getElementById('player-gold');
const xpText = document.getElementById('xp-text');
const xpFill = document.getElementById('xp-fill');

// Variable local para llevar el control del oro actual del jugador en el Frontend
let oroActual = 0;

// 1. Cargar datos iniciales al abrir la página
async function init() {
    await fetchHabits();
    // Estado inicial simulado que empareja con el backend mock
    updateUI({ nombre: "Jugador Uno", nivel: 1, xpActual: 0, xpNecesaria: 100, oroTotal: 0 });
    setupShop(); // Inicializar los botones de la tienda
}

// 2. Obtener hábitos de la API y renderizarlos con el diseño premium
async function fetchHabits() {
    try {
        const res = await fetch(API_URL);
        const habits = await res.json();
        
        habitsList.innerHTML = ''; // Limpiar lista anterior
        
        if (habits.length === 0) {
            habitsList.innerHTML = `<li class="habit-item" style="color: #64748b; justify-content: center;">No hay misiones activas. ¡Crea una arriba! ⚔️</li>`;
            return;
        }

        habits.forEach(habit => {
            const li = document.createElement('li');
            li.className = 'habit-item';
            li.innerHTML = `
                <div>
                    <strong>${habit.nombre}</strong> 
                    <span style="font-size:0.85rem; color:#94a3b8;">
                        Dificultad: <span style="color:#c084fc; font-weight:600;">${habit.dificultad}</span> | 🔥 Racha: ${habit.racha_actual} días
                    </span>
                </div>
                <button class="habit-btn" onclick="completeHabit(${habit.id})">✓ Logrado</button>
            `;
            habitsList.appendChild(li);
        });
    } catch (error) {
        console.error("Error al obtener hábitos:", error);
    }
}

// 3. Crear un nuevo hábito (CORREGIDO)
habitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombreInput = document.getElementById('habit-name');
    const dificultadSelect = document.getElementById('habit-difficulty');

    // Validar que los elementos existan en el HTML
    if (!nombreInput || !dificultadSelect) {
        console.error("No se encontraron los inputs en el HTML. Revisa los IDs.");
        return;
    }

    const nombre = nombreInput.value;
    const dificultad = dificultadSelect.value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, dificultad })
        });

        if (response.ok) {
            habitForm.reset(); // Limpiar el formulario
            await fetchHabits(); // Recargar la lista para mostrar el nuevo hábito
        } else {
            alert("Error al guardar la misión en el servidor.");
        }
    } catch (error) {
        console.error("Error en la petición POST:", error);
    }
});

// 4. Marcar hábito como completado
window.completeHabit = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}/complete`, { method: 'POST' });
        const data = await res.json();
        
        if (data.subioDeNivel) {
            alert("🎉 ¡¡LEVEL UP!! Has subido de nivel. ¡Sigue así, héroe! 🎉");
        }
        
        updateUI(data.estadoUsuario);
        await fetchHabits(); // Actualizar las rachas visualmente
    } catch (error) {
        console.error("Error al completar el hábito:", error);
    }
};

// 5. Actualizar los marcadores premium en la pantalla
function updateUI(user) {
    oroActual = user.oroTotal; // Guardamos el oro en la variable local
    
    if(playerName) playerName.textContent = user.nombre;
    if(playerLevel) playerLevel.textContent = user.nivel;
    if(playerGold) playerGold.textContent = user.oroTotal;
    if(xpText) xpText.textContent = `${user.xpActual} / ${user.xpNecesaria} XP`;
    
    // Calcular porcentaje de la barra de XP con suavizado
    if(xpFill) {
        const porcentaje = (user.xpActual / user.xpNecesaria) * 100;
        xpFill.style.width = `${porcentaje}%`;
    }
}

// 🏪 BONUS: Hacer que la tienda funcione de verdad
function setupShop() {
    const shopButtons = document.querySelectorAll('.btn-buy');
    shopButtons.forEach(button => {
        button.onclick = function() {
            // Extraer el precio numérico del texto del botón (ej: "🪙 30 Oro" -> 30)
            const costo = parseInt(this.textContent.replace(/[^0-9]/g, ""));
            const recompensa = this.parentElement.querySelector('span').textContent;

            if (oroActual >= costo) {
                oroActual -= costo;
                if(playerGold) playerGold.textContent = oroActual; // Restar visualmente
                alert(`🛍️ ¡Recompensa adquirida!\nDisfruta de: ${recompensa}.\nSe han deducido 🪙 ${costo} de oro.`);
            } else {
                alert(`❌ ¡Oro insuficiente!\nNecesitas 🪙 ${costo} de oro para canjear esta recompensa. ¡Sigue completando misiones!`);
            }
        };
    });
}

// Arrancar la app
init();