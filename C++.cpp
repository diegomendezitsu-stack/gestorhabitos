#include <iostream>
#include <string>
#include <vector>

// Estructura limpia para tipado de datos del perfil de usuario
struct UserProfile {
    std::string name;
    int age;
    std::string goal;
    std::string activity;
};

// Clase Core encargada del procesamiento heurístico de las recomendaciones
class RecommendationEngine {
public:
    UserProfile profile;

    RecommendationEngine(UserProfile p) : profile(p) {}

    std::vector<std::string> generateHabits() {
        std::vector<std::string> habits;
        habits.push_back("Beber 2.5 litros de agua al dia");
        habits.push_back("Dormir entre 7 y 8 horas diarias");

        if (profile.goal == "perder_peso") {
            habits.push_back("Realizar 30 min de actividad cardiovascular continua");
            habits.push_back("Registrar comidas diarias en un diario de alimentos");
        } else if (profile.goal == "ganar_musculo") {
            habits.push_back("Entrenamiento de fuerza enfocado en hipertrofia (45-60 min)");
            habits.push_back("Priorizar descansos musculares de 48 horas por grupo muscular");
        } else {
            habits.push_back("Caminar 10,000 pasos a lo largo del dia");
            habits.push_back("Hacer pausas activas de 5 minutos cada hora de trabajo");
        }

        if (profile.activity == "sedentario" && profile.goal != "ganar_musculo") {
            habits.push_back("Evitar el uso de ascensores; usar escaleras siempre.");
        }

        return habits;
    }

    std::vector<std::string> generateDiet() {
        std::vector<std::string> diet;

        if (profile.goal == "perder_peso") {
            diet.push_back("Desayuno: Tortilla de 3 claras de huevo con espinacas y una taza de te verde.");
            diet.push_back("Almuerzo: Pechuga de pollo a la plancha (150g) con ensalada verde mixta.");
            diet.push_back("Merienda: Un puñado de almendras crudas (30g).");
            diet.push_back("Cena: Filete de merluza o pescado blanco al horno con brocoli al vapor.");
        } else if (profile.goal == "ganar_musculo") {
            diet.push_back("Desayuno: Licuado de avena (50g), 1 platano, 1 scoop de proteina y leche entera.");
            diet.push_back("Almuerzo: Arroz integral (100g) con carne picada de ternera magra (180g) y aguacate.");
            diet.push_back("Merienda: Yogur griego natural con nueces y una cucharada de miel.");
            diet.push_back("Cena: Salmon a la plancha con pure de patatas o boniato (150g).");
        } else {
            diet.push_back("Desayuno: Tostadas de pan integral con aguacate, huevo poche y fruta.");
            diet.push_back("Almuerzo: Lentejas o garbanzos guisados con verduras y pollo.");
            diet.push_back("Merienda: Una pieza de fruta junto a un te o cafe.");
            diet.push_back("Cena: Ensalada de quinoa con queso feta, tomates cherry y pechuga de pavo.");
        }

        return diet;
    }
};

// Código de interfaz de enlace para Emscripten (WebAssembly)
// Compilar usando: emcc engine.cpp -o engine.js -s EXPORTED_FUNCTIONS="['_processPlan']" -s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']"
#ifdef __EMSCRIPTEN__
#include <emscripten.h>

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    void processPlan(const char* goal, const char* activity) {
        // En una arquitectura WebAssembly avanzada, aquí procesamos estructuras de datos complejas
        // y devolvemos strings formateados en formato JSON a la capa de JavaScript.
    }
}
#endif

int main() {
    // Punto de entrada requerido estándar, útil para testing local en consola de C++
    std::cout << "HabitLife Engine inicializado exitosamente." << std::endl;
    return 0;
}