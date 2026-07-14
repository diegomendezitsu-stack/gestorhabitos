# 🎯 HabitLife - Gestor Inteligente de Hábitos y Alimentación

HabitLife es una aplicación web moderna, minimalista y de alto rendimiento diseñada para personalizar planes de hábitos y alimentación según los objetivos y el estilo de vida del usuario. El proyecto combina un diseño responsivo con una arquitectura técnica híbrida que aprovecha la potencia de **JavaScript (ES6)** y un motor algorítmico en **C++** preparado para **WebAssembly (Wasm)**.

---

## 🚀 Características Clave

* **Onboarding Fluido (SPA):** Flujo de registro y cuestionario dinámico por pasos sin recarga de página.
* **Motor de Recomendación Inteligente:** Algoritmo que analiza el objetivo principal (pérdida de peso, ganancia muscular o vida saludable) y el nivel de actividad física para generar planes a medida.
* **Arquitectura de Alto Rendimiento:** Motor lógico principal desarrollado en C++, listo para ejecutarse a velocidad nativa en el navegador mediante WebAssembly.
* **Diseño UI/UX Premium:** Interfaz limpia, responsiva, con transiciones suaves y modo adaptable a móviles y escritorio.
* **Modo de Resiliencia (Fallback JS):** Lógica espejo implementada en JavaScript para garantizar el funcionamiento autónomo e inmediato del proyecto sin necesidad de herramientas de compilación externas.

---

## 🛠️ Stack Tecnológico

* **Frontend:** HTML5 Semántico, CSS3 (con variables globales y Grid/Flexbox).
* **Controlador de Estado:** JavaScript ES6.
* **Motor Lógico Core:** C++ (Estándar moderno).
* **Compilador e Interfaz:** Emscripten (WebAssembly).

---

## ⚙️ Arquitectura del Sistema

La aplicación sigue un patrón de diseño desacoplado donde la interfaz de usuario se comunica con un motor de procesamiento de datos independiente.
[ index.html ] <---> [ styles.css ]
         |
         v
    [ app.js ]  <--- (Controlador y Orquestador)
    /        \
   /          \
  v            v

  ---

## 💻 Instalación y Uso Local

Para probar o desarrollar el proyecto localmente, no necesitas un servidor web pesado.

1. **Clona el repositorio:**
   ```bash
   git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)