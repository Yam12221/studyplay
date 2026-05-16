import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { noteContent, noteTitle } = await request.json();

    if (!noteContent || !noteTitle) {
      return NextResponse.json(
        { error: 'noteContent and noteTitle are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey || apiKey === 'your-groq-api-key') {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured', fallback: true },
        { status: 503 }
      );
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
            content: 'Eres un profesor experto que genera preguntas de quiz educativas y desafiantes. Responde SOLO con JSON válido, sin texto adicional.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Groq API error: ${response.status}`, fallback: true },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content in Groq response', fallback: true },
        { status: 502 }
      );
    }

    // Parse JSON - try direct parse first, then regex fallback
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: 'No valid JSON in Groq response', fallback: true },
          { status: 502 }
        );
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid questions format', fallback: true },
        { status: 502 }
      );
    }

    // Validate each question structure
    const validatedQuestions = parsed.questions.map((q: { text?: string; options?: string[]; correctIndex?: number }, index: number) => {
      if (!q.text || !Array.isArray(q.options) || q.options.length < 2 || typeof q.correctIndex !== 'number') {
        throw new Error(`Invalid question at index ${index}`);
      }
      return {
        id: crypto.randomUUID(),
        text: q.text,
        options: q.options.slice(0, 4), // Max 4 options
        correctIndex: Math.min(q.correctIndex, q.options.length - 1),
      };
    });

    return NextResponse.json({ questions: validatedQuestions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz', fallback: true },
      { status: 500 }
    );
  }
}
