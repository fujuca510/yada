# ESQA - Documento de Requerimientos de Producto (PRD)

## 1. Visión General del Proyecto
**Nombre del Proyecto:** ESQA (Escuela Sabática, Preguntas y respuestas)
**Objetivo:** Desarrollar una aplicación de escritorio portátil (offline) para realizar dinámicas de preguntas y respuestas bíblicas en la Escuela Sabática.
**Público Objetivo:** Maestros de Escuela Sabática, líderes de jóvenes y coordinadores de programas de iglesia.
**Propuesta de Valor:** Una herramienta visualmente impactante y fácil de controlar para presentar preguntas bíblicas, diseñada específicamente para entornos donde el presentador controla el flujo y la audiencia participa verbalmente o mentalmente.

## 2. Escenarios de Uso
*   **Aulas de Escuela Sabática:** Maestros usando una laptop conectada a un TV o proyector.
*   **Programas de Iglesia:** Proyección en pantalla grande durante el repaso de la lección.
*   **Grupos Pequeños:** Uso en laptops o tablets en reuniones de hogares.

## 3. Requerimientos Funcionales

### 3.1 Flujo del Juego (Game Loop)
1.  **Pantalla de Inicio:** Título animado y botón para iniciar la sesión de preguntas.
2.  **Presentación de Pregunta:** Aparece la pregunta y las opciones (si es selección múltiple). **El usuario/audiencia NO interactúa con la pantalla**.
3.  **Temporizador:** Se inicia una cuenta regresiva visual y sonora para dar tiempo a la audiencia a pensar o discutir.
4.  **Cierre de Tiempo:** Al finalizar el tiempo, se bloquea la espera, pero **NO se muestra la respuesta automáticamente**.
5.  **Acción de Revelar:** Aparece un botón habilitado para "Mostrar Respuesta" que debe ser accionado por el presentador.
6.  **Revelación Completa:** Al hacer clic en "Mostrar Respuesta", se despliega una animación que muestra simultáneamente:
    *   La opción correcta destacada.
    *   El texto explicativo.
    *   El versículo bíblico de referencia.
7.  **Navegación:** Botón para avanzar a la siguiente pregunta.

### 3.2 Tipos de Preguntas
*   **Selección Múltiple:** 1 Pregunta, 4 Opciones visibles.
*   **Verdadero / Falso:** 1 Afirmación, 2 Opciones (V/F).
*   **Pregunta Abierta:** Texto de la pregunta, sin opciones. Ideal para versículos de memoria.

### 3.3 Controles y Entradas (Solo Presentador)
*   La aplicación es **manejada exclusivamente por un operador/presentador**.
*   **Ratón/Touch:** Interfaz navegable (Botones "Iniciar", "Mostrar Respuesta", "Siguiente").
*   **Teclado (Atajos):**
    *   `Espacio`: Siguiente paso (Iniciar timer -> Mostrar botón respuesta -> Siguiente pregunta).
    *   `Enter`: Mostrar respuesta.
    *   **Nota:** No existen teclas para seleccionar opciones (A, B, C, D) ya que la app no registra respuestas de la audiencia.

## 4. Especificaciones Técnicas

### 4.1 Arquitectura (Offline First)
La aplicación debe ser un ejecutable autocontenido (.exe / .dmg / .AppImage) que funcione sin internet.

### 4.2 Stack Tecnológico
*   **Core / Empaquetado:** **Electron**.
*   **Frontend End:** **Vue 3** + **Vite**.
*   **Estilos:** **Tailwind CSS**.
*   **Estado:** **Pinia** (Gestión de: pregunta actual, configuración de visualización. **SIN sistema de puntaje**).
*   **Animaciones:** **VueUse Motion** o **Framer Motion**.
*   **Persistencia:** Archivos **JSON** para cargar los paquetes de preguntas.

## 5. Modelo de Datos (JSON Schema)

```json
[
  {
    "id": "1",
    "type": "multiple", 
    "question": "¿Quién fue tragado por un gran pez?",
    "options": [
      "Moisés",
      "Jonás",
      "Pedro",
      "Noé"
    ],
    "correctIndex": 1, 
    "explanation": "Jonás huyó de Dios y fue tragado por un gran pez para ser llevado a Nínive.",
    "verseReference": "Jonás 1:17",
    "timeLimit": 30
  }
]
```

## 6. Guías de UI/UX
*   **Diseño para Proyección:** Textos grandes y alto contraste.
*   **No Interactiva para Audiencia:** La UI no debe parecer que espera un clic en las opciones (no hover effects de "clickable" en las respuestas incorrectas/correctas antes de revelar).
*   **Feedback Visual:** Enfasis total en la respuesta correcta al revelar.

## 7. Plan de Implementación Excluido (Fuera de alcance)
*   Registro de puntajes o competencia.
*   Modo multijugador.
*   Conexión a internet.