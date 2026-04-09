# Project Structure

## Overview
StudyPlay es una plataforma de aprendizaje gamificada que fusiona la gestión de apuntes con quizzes generados por IA. Utiliza psicología del juego (XP, niveles, rachas, recompensas) para motivar a los estudiantes.

## Tech Stack
- **Framework**: Next.js 15 con React 19 y TypeScript
- **Styling**: Tailwind CSS 4 con CSS personalizado para animaciones
- **State Management**: Zustand con persistencia en localStorage
- **Charts**: Recharts para visualizaciones
- **Icons**: Lucide React
- **AI**: Groq API (opcional, con fallback)

## Directory Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout con fuentes
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globales y animaciones
├── components/
│   ├── Header.tsx          # Header con XP bar, nivel, racha
│   ├── Sidebar.tsx         # Gestión de materias y notas
│   ├── NoteEditor.tsx      # Editor de notas con guardado automático
│   ├── QuizMode.tsx        # Sistema de quizzes con feedback
│   ├── StoreModal.tsx      # Tienda de temas y power-ups
│   ├── FocusMode.tsx       # Modo Pomodoro con sonidos
│   ├── ProgressDashboard.tsx # Dashboard con estadísticas
│   └── ThemeCanvas.tsx     # Animaciones de fondo por tema
└── lib/
    ├── types.ts            # Tipos TypeScript y constantes
    ├── store.ts            # Estado global con Zustand
    └── groq.ts             # Integración con Groq API
```

## Core Systems

### Gestión de Apuntes
- **Estado**: Implementado
- **Ubicación**: `src/components/Sidebar.tsx`, `src/components/NoteEditor.tsx`
- **Descripción**: Sistema de materias con notas, búsqueda, y guardado automático

### Generador de Quizzes con IA
- **Estado**: Implementado
- **Ubicación**: `src/lib/groq.ts`, `src/components/QuizMode.tsx`
- **Descripción**: Genera preguntas de opción múltiple usando Groq API, con fallback predefinido

### Sistema de Gamificación XP
- **Estado**: Implementado
- **Ubicación**: `src/lib/store.ts`, `src/components/Header.tsx`
- **Descripción**: XP por acciones, niveles (1-100), títulos por nivel, racha diaria con escudo

### StorePlay - Temas y Power-ups
- **Estado**: Implementado
- **Ubicación**: `src/components/StoreModal.tsx`, `src/components/ThemeCanvas.tsx`
- **Descripción**: 10 temas visuales animados, 3 power-ups (Doble XP, Escudo, Día Libre)

### Modos de Enfoque
- **Estado**: Implementado
- **Ubicación**: `src/components/FocusMode.tsx`
- **Descripción**: Temporizador Pomodoro, sonidos ambientales (Lo-Fi, lluvia, etc.)

### Dashboard de Progreso
- **Estado**: Implementado
- **Ubicación**: `src/components/ProgressDashboard.tsx`
- **Descripción**: Estadísticas visuales, gráficos de XP semanal, registro de errores

### File Upload
- **Estado**: Implementado
- **Ubicación**: `src/components/NoteEditor.tsx`
- **Descripción**: Subida de imágenes adjuntas a notas (base64 en localStorage)

## Current State
- [x] Gestión de apuntes por materias
- [x] Editor de notas con Markdown básico
- [x] Generador de quizzes con IA (Groq)
- [x] Sistema XP con niveles y títulos
- [x] Racha diaria con escudo protector
- [x] 10 temas visuales animados
- [x] 3 power-ups comprables
- [x] Modo Pomodoro con sonidos
- [x] Dashboard con gráficos
- [x] Registro de errores para repaso
- [x] Adjuntar imágenes a notas

## Maintenance Log
- 2026-04-09: Creación del proyecto StudyPlay con todas las características principales
