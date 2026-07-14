// Estado global de la aplicación
const appState = {
    user: {
        name: "",
        age: 0,
        goal: "",
        activity: ""
    }
};

// Navegación fluida entre pantallas
function navigateTo(stepId) {
    document.querySelectorAll('.card').forEach(card => card.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

// Manejo del registro (Paso 1)
document.getElementById('form-register').addEventListener('submit', (e) => {
    e.preventDefault();
    appState.user.name = document.getElementById('name').value;
    appState.user.age = parseInt(document.getElementById('age').value);
    navigateTo('step-quiz');
});

// Manejo del cuestionario y generación (Paso 2)
document.getElementById('form-quiz').addEventListener('submit', (e) => {
    e.preventDefault();
    appState.user.goal = document.getElementById('goal').value;
    appState.user.activity = document.getElementById('activity').value;
    
    generatePlan();
});

// Botón reiniciar
document.getElementById('btn-restart').addEventListener('click', () => {
    document.getElementById('form-register').reset();
    document.getElementById('form-quiz').reset();
    navigateTo('step-register');
});

// Motor de Renderizado del Dashboard
function generatePlan() {
    document.getElementById('user-welcome').textContent = appState.user.name;

    // NOTA DE ARQUITECTURA SENIOR: 
    // Aquí se invoca la lógica algorítmica. Si WebAssembly está compilado, se llama a Module.getRecommendations().
    // Como fallback inmediato para desarrollo local autónomo, ejecutamos la réplica exacta de la lógica C++.
    const recommendations = coreRecommendationEngine(appState.user.goal, appState.user.activity);

    // Renderizar Hábitos
    const habitsContainer = document.getElementById('habits-list');
    habitsContainer.innerHTML = '';
    recommendations.habits.forEach(habit => {
        const li = document.createElement('li');
        li.textContent = habit;
        habitsContainer.appendChild(li);
    });

    // Renderizar Dieta
    const dietContainer = document.getElementById('diet-list');
    dietContainer.innerHTML = '';
    recommendations.diet.forEach(meal => {
        const li = document.createElement('li');
        li.textContent = meal;
        dietContainer.appendChild(li);
    });

    navigateTo('step-dashboard');
}

// Réplica espejo del motor C++ (Garantiza funcionamiento standalone inmediato)
function coreRecommendationEngine(goal, activity) {
    let habits = ["Beber 2.5 litros de agua al día", "Dormir entre 7 y 8 horas diarias"];
    let diet = [];

    if (goal === "perder_peso") {
        habits.push("Realizar 30 min de actividad cardiovascular continua");
        habits.push("Registrar comidas diarias en un diario de alimentos");
        
        diet = [
            "Desayuno: Tortilla de 3 claras de huevo con espinacas y una taza de té verde.",
            "Almuerzo: Pechuga de pollo a la plancha (150g) con ensalada verde mixta y aderezo de limón.",
            "Merienda: Un puñado de almendras crudas (30g).",
            "Cena: Filete de merluza o pescado blanco al horno con brócoli al vapor."
        ];
    } else if (goal === "ganar_musculo") {
        habits.push("Entrenamiento de fuerza enfocado en hipertrofia (45-60 min)");
        habits.push("Priorizar descansos musculares de 48 horas por grupo muscular");
        
        diet = [
            "Desayuno: Licuado de avena (50g), 1 plátano, 1 scoop de proteína y leche entera.",
            "Almuerzo: Arroz integral (100g) con carne picada de ternera magra (180g) y aguacate.",
            "Merienda: Yogur griego natural con nueces y una cucharada de miel.",
            "Cena: Salmón a la plancha con puré de patatas o boniato (150g)."
        ];
    } else { // vida_saludable
        habits.push("Caminar 10,000 pasos a lo largo del día");
        habits.push("Hacer pausas activas de 5 minutos cada hora de trabajo");
        
        diet = [
            "Desayuno: Tostadas de pan integral con aguacate, huevo poché y fruta de temporada.",
            "Almuerzo: Lentejas o garbanzos guisados con verduras y una porción de pollo.",
            "Merienda: Una pieza de fruta (manzana o pera) junto a un té o café.",
            "Cena: Ensalada de quinoa con queso feta, tomates cherry y pechuga de pavo."
        ];
    }

    if (activity === "sedentario" && goal !== "ganar_musculo") {
        habits.push("Evitar el uso de ascensores; usar escaleras siempre.");
    }

    return { habits, diet };
}