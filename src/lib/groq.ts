import type { Question } from './types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
  }[];
}

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

export async function generateQuiz(noteContent: string, noteTitle: string): Promise<Question[]> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey || apiKey === 'your-groq-api-key') {
    console.log('No Groq API key found, using fallback questions');
    const randomIndex = Math.floor(Math.random() * FALLBACK_QUESTIONS.length);
    return FALLBACK_QUESTIONS[randomIndex].map((q) => ({
      ...q,
      id: crypto.randomUUID(),
    }));
  }

  const prompt = `Eres un profesor experto. Genera 5 preguntas de opción múltiple desafiantes y educativas basadas en el siguiente contenido de estudio.

Título: ${noteTitle}

Contenido:
${noteContent}

Requisitos:
- Las preguntas deben ser desafiantes, no triviales
- Incluir conceptos clave y aplicaciones prácticas
- Mezclar preguntas de recuerdo, comprensión y análisis
- Las opciones deben ser plausibles pero con una claramente correcta
- El campo "correctIndex" indica el índice (0-3) de la respuesta correcta

Formato JSON obligatorio:
{
  "questions": [
    {
      "text": "Pregunta",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correctIndex": 0
    }
  ]
}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Eres un profesor experto que genera preguntas de quiz educativas y desafiantes. Responde SOLO con JSON válido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed: GroqResponse = JSON.parse(jsonMatch[0]);

    return parsed.questions.map((q, index) => ({
      id: crypto.randomUUID(),
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
    }));
  } catch (error) {
    console.error('Groq API error:', error);
    const randomIndex = Math.floor(Math.random() * FALLBACK_QUESTIONS.length);
    return FALLBACK_QUESTIONS[randomIndex].map((q) => ({
      ...q,
      id: crypto.randomUUID(),
    }));
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
