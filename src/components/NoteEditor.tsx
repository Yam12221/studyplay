'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Trash2, Wand2, Upload, X, Image } from 'lucide-react';
import { useStore } from '@/lib/store';
import { generateQuiz, MOTIVATIONAL_MESSAGES } from '@/lib/groq';
import type { Question } from '@/lib/types';

export default function NoteEditor() {
  const {
    subjects,
    activeNoteId,
    updateNote,
    deleteNote,
    startQuiz,
    user,
  } = useStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);

  const activeNote = subjects
    .flatMap((s) => s.notes)
    .find((n) => n.id === activeNoteId);

  const activeSubject = subjects.find((s) =>
    s.notes.some((n) => n.id === activeNoteId)
  );

  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeNote]);

  const handleSave = useCallback(async () => {
    if (!activeNoteId || !activeSubject) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    updateNote(activeSubject.id, activeNoteId, { title, content });
    setIsSaving(false);
  }, [activeNoteId, activeSubject, title, content, updateNote]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (activeNoteId && activeSubject && (title !== activeNote?.title || content !== activeNote?.content)) {
        handleSave();
      }
    }, 1000);
    return () => clearTimeout(debounce);
  }, [title, content]);

  const handleDelete = () => {
    if (!activeNoteId || !activeSubject) return;
    if (confirm('¿Eliminar esta nota?')) {
      deleteNote(activeSubject.id, activeNoteId);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!activeNoteId || !activeSubject || !activeNote) return;
    setIsGenerating(true);
    const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    setGeneratingMessage(randomMessage);

    await new Promise((r) => setTimeout(r, 1500));

    try {
      const questions: Question[] = await generateQuiz(activeNote.content, activeNote.title);
      startQuiz({
        noteId: activeNoteId,
        noteTitle: activeNote.title,
        subjectId: activeSubject.id,
        subjectName: activeSubject.name,
        questions,
      });
      updateNote(activeSubject.id, activeNoteId, { quizCount: activeNote.quizCount + 1 });
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeNoteId || !activeSubject) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const currentAttachments = activeNote?.attachments || [];
        updateNote(activeSubject.id, activeNoteId, {
          attachments: [...currentAttachments, result],
        });
      };
      reader.readAsDataURL(file);
    });
  };

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white/60 mb-2">Selecciona una nota</h2>
          <p className="text-white/40">Elige una nota del panel lateral o crea una nueva</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeSubject?.color }}
          />
          <span className="text-sm text-white/60">{activeSubject?.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
          >
            <Image className="w-4 h-4" />
            <span className="text-sm">{activeNote.attachments.length}</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/80 text-white transition-all duration-200 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generar Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-white/80 text-lg">{generatingMessage}</p>
            <p className="text-white/40 text-sm mt-2">La IA esta creando preguntas personalizadas...</p>
          </div>
        </div>
      )}

      {showAttachments && activeNote.attachments.length > 0 && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-4 flex-wrap">
            {activeNote.attachments.map((attachment, index) => (
              <div key={index} className="relative group">
                <img
                  src={attachment}
                  alt={`Attachment ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    const newAttachments = activeNote.attachments.filter((_, i) => i !== index);
                    updateNote(activeSubject!.id, activeNoteId!, { attachments: newAttachments });
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo de la nota..."
            className="w-full text-3xl font-bold bg-transparent border-none outline-none text-white placeholder:text-white/30"
          />

          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span>Creada: {new Date(activeNote.createdAt).toLocaleDateString()}</span>
            </div>
            {activeNote.quizCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-green-400">{activeNote.quizCount} quizzes</span>
                <span className="text-sm text-green-300/70">({Math.round(activeNote.correctRate)}% acierto)</span>
              </div>
            )}
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tus apuntes aqui...

Puedes usar:
- **negrita** para enfatizar
- *cursiva* para conceptos importantes
- - Viñetas para listas
- ## Encabezados para organizar

Adjunta imagenes con el boton de subir o arrastra archivos aqui."
              className="w-full min-h-[400px] p-4 bg-white/5 rounded-xl border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-primary/50 transition-colors leading-relaxed"
            />
            <label className="absolute bottom-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-white/50" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-white/60">Guardado automatico activo</span>
            </div>
            <div className="flex-1" />
            <span className="text-sm text-white/40">{content.length} caracteres</span>
          </div>
        </div>
      </div>
    </div>
  );
}
