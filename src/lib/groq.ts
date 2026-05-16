import type { Question } from './types';

const FALLBACK_QUESTIONS: Question[][] = [
  [
    { id: '1', text: '¿Cuál es el concepto principal del tema?', options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correctIndex: 0 },
    { id: '2', text: '¿Qué afirmación es correcta?', options: ['Primero', 'Segundo', 'Tercero', 'Cuarto'], correctIndex: 1 },
    { id: '3', text: '¿Cómo se relaciona con otros conceptos?', options: ['De forma A', 'De forma B', 'De forma C', 'De forma D'], correctIndex: 2 },
    { id: '4', text: '¿Cuál es un ejemplo de esto?', options: ['Ejemplo 1', 'Ejemplo 2', 'Ejemplo 3', 'Ejemplo 4'], correctIndex: 0 },
    { id: '5', text: '¿Qué limitaciones tiene este enfoque?', options: ['Limitación A', 'Limitación B', 'Limitación C', 'Limitación D'], correctIndex: 3 },
  ],
  [
    { id: '1', text: '¿Qué caracteristica es mas importante?', options: ['Caracteristica 1', 'Caracteristica 2', 'Caracteristica 3', 'Caracteristica 4'], correctIndex: 0 },
    { id: '2', text: '¿Cuál es el resultado esperado?', options: ['Resultado A', 'Resultado B', 'Resultado C', 'Resultado D'], correctIndex: 1 },
    { id: '3', text: '¿Cómo se implementa esto?', options: ['Método 1', 'Método 2', 'Método 3', 'Método 4'], correctIndex: 2 },
    { id: '4', text: '¿Qué ventajas ofrece?', options: ['Ventaja A', 'Ventaja B', 'Ventaja C', 'Ventaja D'], correctIndex: 0 },
    { id: '5', text: '¿Cuál es el mejor enfoque?', options: ['Enfoque A', 'Enfoque B', 'Enfoque C', 'Enfoque D'], correctIndex: 3 },
  ],
];

function getFallbackQuestions(): Question[] {
  const randomIndex = Math.floor(Math.random() * FALLBACK_QUESTIONS.length);
  return FALLBACK_QUESTIONS[randomIndex].map((q) => ({
    ...q,
    id: crypto.randomUUID(),
  }));
}

export async function generateQuiz(noteContent: string, noteTitle: string): Promise<Question[]> {
  // Skip API call if note content is too short
  if (!noteContent || noteContent.trim().length < 20) {
    console.log('Note content too short, using fallback questions');
    return getFallbackQuestions();
  }

  try {
    const response = await fetch('/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteContent: noteContent.slice(0, 4000), // Limit content size
        noteTitle,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.fallback) {
      console.warn('Quiz API returned fallback:', data.error);
      return getFallbackQuestions();
    }

    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      console.warn('Invalid quiz response format');
      return getFallbackQuestions();
    }

    return data.questions;
  } catch (error) {
    console.error('Error generating quiz:', error);
    return getFallbackQuestions();
  }
}

export const MOTIVATIONAL_MESSAGES = [
  'Generando preguntas desafiantes...',
  'Creando tu quiz personalizado...',
  'Preparando el desafío...',
  'Analizando el contenido...',
  'Diseñando preguntas especiales para ti...',
  'Optimizando tu experiencia de aprendizaje...',
];
