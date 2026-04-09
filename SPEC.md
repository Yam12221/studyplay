# StudyPlay - Plataforma de Aprendizaje Gamificada

## 1. Concepto & Visión

StudyPlay transforma el estudio en una experiencia inmersiva y adictiva. Combina la gestión de apuntes con quizzes generados por IA en un ecosistema gamificado donde cada nota escrita es un paso hacia el siguiente nivel. La estética Glassmorphism con animaciones de fondo crea un ambiente que no se siente como "trabajo" - se siente como jugar.

## 2. Design Language

### Aesthetic Direction
Glassmorphism premium con animaciones de fondo dinámicas. Inspirado en interfaces de gaming de alta gama con toques cyberpunk y vaporwave.

### Color Palette
- **Primary**: `#8B5CF6` (Violet)
- **Primary Light**: `#A78BFA`
- **Secondary**: `#F59E0B` (Amber/XP)
- **Success**: `#10B981` (Emerald)
- **Error**: `#EF4444` (Red)
- **Background Dark**: `#0F0F1A`
- **Background Glass**: `rgba(255, 255, 255, 0.05)`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#A1A1AA`
- **Border Glass**: `rgba(255, 255, 255, 0.1)`

### Typography
- **Headings**: `Orbitron` (futuristic gaming feel)
- **Body**: `Inter` (clean readability)
- **Monospace**: `JetBrains Mono` (for code in notes)

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Border radius: 8px (small), 12px (medium), 16px (large), 24px (xl)
- Glass blur: 20px backdrop-filter

### Motion Philosophy
- **Micro-interactions**: 200ms ease-out for buttons, hovers
- **Page transitions**: 300ms ease-in-out
- **Background animations**: Continuous, 60fps Canvas animations
- **XP gain**: Confetti burst + number counter animation
- **Level up**: Full-screen celebration with particles
- **Streak fire**: Continuous flame animation with flicker

### Visual Assets
- Icons: Lucide React (consistent stroke width)
- Background: Canvas-based animated themes
- Particles: Custom Canvas implementation per theme

## 3. Layout & Structure

### Main Layout
```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo | XP Bar | Level Badge | Streak | Store  │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  SIDEBAR   │           MAIN CONTENT AREA               │
│            │                                            │
│  Materias  │   Notes Editor / Quiz Mode / Dashboard    │
│  lista     │                                            │
│            │                                            │
│  + Nueva   │                                            │
│            │                                            │
├────────────┴────────────────────────────────────────────┤
│  FOOTER: Focus Mode Toggle | Pomodoro Timer | Sound    │
└─────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- Desktop: Full sidebar + main content
- Tablet: Collapsible sidebar (icon mode)
- Mobile: Bottom navigation, full-screen views

## 4. Features & Interactions

### 4.1 Gestión de Apuntes

**Estructura de Datos:**
```typescript
interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  notes: Note[];
}

interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string; // Markdown supported
  createdAt: Date;
  updatedAt: Date;
  quizCount: number;
  correctRate: number;
}
```

**Funcionalidades:**
- Crear/editar/eliminar materias con color e icono personalizado
- Editor de notas con Markdown básico (bold, italic, lists, headers)
- Búsqueda instantánea por título o contenido
- Vista previa de quiz count y tasa de acierto por nota

**Interacciones:**
- Click en materia → expandir/colapsar notas
- Doble click en nota → abrir editor
- Hover en nota → show quick actions (edit, delete, quiz)
- Drag & drop para reordenar notas

### 4.2 Generador de Quizzes con IA

**Flujo:**
1. Usuario selecciona una nota
2. Click en "Generar Quiz" (botón flotante)
3. Spinner de carga con mensaje motivacional
4. IA genera 5 preguntas de opción múltiple
5. Usuario responde cada pregunta
6. Feedback instantáneo: verde (correcto) o rojo (incorrecto)
7. Al final: resumen con XP ganado y errores para repasar

**Estructura de Quiz:**
```typescript
interface Quiz {
  id: string;
  noteId: string;
  questions: Question[];
  startedAt: Date;
  completedAt?: Date;
  score: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  userAnswer?: number;
  isCorrect?: boolean;
}
```

**Groq API Integration:**
- Model: `llama-3.3-70b-versatile`
- Prompt: Genera preguntas desafiantes, no triviales
- Fallback: Preguntas predefinidas si API falla

### 4.3 Sistema de Gamificación XP

**Mecánicas:**
- Crear nota: +50 XP
- Completar quiz: +10 XP por respuesta correcta
- Racha diaria: +25 XP bonus por día consecutivos
- Estudio en modo enfoque: +1 XP por minuto
- Nivel máximo: 100

**Fórmula de XP por Nivel:**
```
XP_para_nivel_n = 100 * n * (n + 1) / 2
```

**Niveles con Títulos:**
- 1-10: Novato
- 11-25: Aprendiz
- 26-50: Estudiante
- 51-75: Escolar
- 76-99: Maestro
- 100: Leyenda

**Racha:**
- Se rompe si no estudias en 24 horas
- Escudo de racha protege 1 día
- Contador visible con animación de fuego

### 4.4 StorePlay - Temas Premium y Power-ups

**10 Temas Ultra-Premium:**

| Tema | Descripción | Animación |
|------|-------------|-----------|
| Matrix | Verde sobre negro, lluvia de código | Caracteres cayendo |
| Galaxia | púrpuras y azules cósmicos | Estrellas y nebulosas |
| Vaporwave | Rosa neón y grid retro | Ondas de paralaje |
| Aurora | Verde y púrpura boreal | Ondas de luz |
| Neon | Colores neón brillantes | Pulsos de luz |
| Retro | Marrón y naranja vintage | Scanlines |
| Nature | Verdes y azules naturales | Partículas flotantes |
| Ocean | Azules y verdes agua | Burbujas subiendo |
| Sunset | Naranjas y rosas | Gradiente animado |
| Cyberpunk | Amarillo y negro | Glitch effects |

**Power-ups:**
- **Doble XP**: x2 experiencia por 1 hora (coste: 100 StudyCoins)
- **Escudo de Racha**: Protege 1 día sin estudio (coste: 150 StudyCoins)
- **Pase de Día Libre**: Pausa racha sin romperla (coste: 200 StudyCoins)

**StudyCoins:**
- Ganados por logros diarios
- 10 coins por nota creada
- 5 coins por quiz completado
- 1 coin por cada 10 XP ganados

### 4.5 Modos de Enfoque

**Sonidos Ambientales:**
- Lo-Fi Beats (música)
- Lluvia
- Sonidos de naturaleza
- Cafetería
- Fogata
- Oceano

**Mezclador:**
- Volumen independiente por canal
- Toggle on/off por sonido
- Presets: "Productividad", "Relajación", "Intensidad"

**Temporizador Pomodoro:**
- Trabajo: 25 minutos
- Descanso: 5 minutos
- Notificación sonora al cambiar
- Sesiones contadas
- Meta diaria configurable

### 4.6 Dashboard de Progreso

**Estadísticas Visualizadas:**
- XP ganado esta semana (gráfico de barras)
- Materias más estudiadas (pie chart)
- Tasa de acierto general (medidor circular)
- Racha actual vs racha máxima (comparativa)
- Tiempo de estudio total
- Quizzes completados

**Registro de Errores:**
- Lista de preguntas falladas
- Agrupadas por materia
- Botón "Repasar" para cada grupo

### 4.7 File Upload

- Adjuntar imágenes a notas
- Drag & drop en editor
- Preview inline
- Almacenamiento en base64 (localStorage)

## 5. Component Inventory

### Header
- Logo con animación de fuego al subir nivel
- XP Bar: gradient fill, percentage, numeric display
- Level Badge: círculo con número, glow effect
- Streak Counter: icono de llama + número
- Store Button: icono de tienda con badge de coins
- States: default, level-up animation

### Sidebar
- Subject List: cards con color, icono, nota count
- Add Subject Button: + con modal
- Search: input con icono de lupa
- States: expanded, collapsed (mobile), hover

### Note Editor
- Title Input: large, borderless
- Content: textarea con Markdown toolbar
- Action Bar: save, delete, generate quiz
- States: editing, saving, saved, empty

### Quiz Card
- Question Number: badge con progreso
- Question Text: heading grande
- Options: 4 botones radio estilizados
- Feedback: overlay verde/rojo
- States: unanswered, correct, incorrect, completed

### XP Popup
- Número flotante (+10 XP)
- Animación de confetti
- Desaparece después de 2s

### Theme Canvas
- Canvas element con requestAnimationFrame
- Controles de tema en settings
- Preview antes de aplicar

### Pomodoro Timer
- Círculo con progreso circular
- Tiempo restante grande
- Botones: start, pause, reset
- Estados: idle, running, break

### Store Modal
- Grid de temas con preview
- Cards de power-ups con precio
- Balance de coins visible
- States: browsing, purchasing, insufficient funds

## 6. Technical Approach

### Stack
- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS + custom CSS for animations
- **State**: Zustand for global state
- **Storage**: localStorage for persistence
- **Audio**: Howler.js for sound management
- **AI**: Groq API with fallback

### Data Model (localStorage)
```typescript
interface AppState {
  user: {
    xp: number;
    level: number;
    coins: number;
    streak: number;
    streakShield: boolean;
    maxStreak: number;
    lastStudyDate: string;
    xpMultiplier: number;
    xpMultiplierExpiry: string;
  };
  subjects: Subject[];
  quizHistory: Quiz[];
  errorLog: { questionId: string; question: string; subject: string }[];
  settings: {
    theme: string;
    soundEnabled: boolean;
    pomodoroWork: number;
    pomodoroBreak: number;
  };
}
```

### API Integration
**Groq API:**
```typescript
const generateQuiz = async (noteContent: string): Promise<Question[]> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `Genera 5 preguntas de opción múltiple basadas en el siguiente contenido. Formato JSON: ${quizPromptTemplate}`
      }]
    })
  });
};
```

### File Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── notes/
│   │   ├── NoteEditor.tsx
│   │   ├── NoteList.tsx
│   │   └── SubjectManager.tsx
│   ├── quiz/
│   │   ├── QuizGenerator.tsx
│   │   ├── QuizCard.tsx
│   │   └── QuizResults.tsx
│   ├── gamification/
│   │   ├── XPBar.tsx
│   │   ├── LevelBadge.tsx
│   │   ├── StreakCounter.tsx
│   │   └── XPPopup.tsx
│   ├── store/
│   │   ├── StoreModal.tsx
│   │   ├── ThemeCard.tsx
│   │   └── PowerUpCard.tsx
│   ├── focus/
│   │   ├── FocusMode.tsx
│   │   ├── PomodoroTimer.tsx
│   │   └── SoundMixer.tsx
│   ├── dashboard/
│   │   └── ProgressDashboard.tsx
│   └── themes/
│       ├── ThemeCanvas.tsx
│       └── themes/
│           ├── matrix.ts
│           ├── galaxy.ts
│           └── ...
├── hooks/
│   ├── useStore.ts
│   ├── useQuiz.ts
│   └── useSound.ts
├── lib/
│   ├── groq.ts
│   ├── storage.ts
│   └── xp.ts
├── styles/
│   └── animations.css
├── App.tsx
└── main.tsx
```
