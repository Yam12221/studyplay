'use client';

import { useState } from 'react';
import { Plus, Search, BookOpen, ChevronDown, ChevronRight, Trash2, Edit2, FileText } from 'lucide-react';
import { useStore } from '@/lib/store';

const SUBJECT_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1',
];

const SUBJECT_ICONS = [
  'book', 'calculator', 'flask', 'globe', 'history',
  'languages', 'music', 'palette', 'science', 'code',
];

export default function Sidebar() {
  const {
    subjects,
    activeNoteId,
    addSubject,
    updateSubject,
    deleteSubject,
    addNote,
    updateNote,
    deleteNote,
    setActiveNote,
    setCurrentView,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(SUBJECT_ICONS[0]);

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    addSubject({
      id: crypto.randomUUID(),
      name: newSubjectName.trim(),
      color: selectedColor,
      icon: selectedIcon,
    });
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.notes.some(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <aside className="w-80 h-[calc(100vh-64px)] fixed left-0 top-16 bg-black/20 backdrop-blur-xl border-r border-white/10 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSubjects.length === 0 && !showAddSubject && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-white/20 mb-3" />
            <p className="text-white/50 text-sm">No hay materias todavia</p>
            <p className="text-white/30 text-xs mt-1">Crea una materia para empezar</p>
          </div>
        )}

        {filteredSubjects.map((subject) => (
          <div key={subject.id} className="space-y-2">
            <div
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer group"
              onClick={() => toggleSubject(subject.id)}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: subject.color }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{subject.name}</h3>
                <p className="text-xs text-white/50">{subject.notes.length} notas</p>
              </div>
              {expandedSubjects.has(subject.id) ? (
                <ChevronDown className="w-4 h-4 text-white/50" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/50" />
              )}
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newName = prompt('Nuevo nombre:', subject.name);
                    if (newName) updateSubject(subject.id, { name: newName });
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-white/50" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Eliminar "${subject.name}"?`)) deleteSubject(subject.id);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>

            {expandedSubjects.has(subject.id) && (
              <div className="ml-7 space-y-1">
                {subject.notes.length === 0 ? (
                  <p className="text-xs text-white/30 py-2 px-3">Sin notas</p>
                ) : (
                  subject.notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => {
                        setActiveNote(note.id);
                        setCurrentView('notes');
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        activeNoteId === note.id
                          ? 'bg-primary/20 border border-primary/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-white/50 flex-shrink-0" />
                      <span className="text-sm text-white/80 truncate flex-1">{note.title || 'Sin titulo'}</span>
                      {note.quizCount > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                          {Math.round(note.correctRate)}%
                        </span>
                      )}
                    </div>
                  ))
                )}
                <button
                  onClick={() => {
                    const title = prompt('Titulo de la nota:');
                    if (title !== null) {
                      addNote(subject.id, {
                        title: title || 'Nueva nota',
                        content: '',
                        attachments: [],
                      });
                      setExpandedSubjects(new Set([...expandedSubjects, subject.id]));
                    }
                  }}
                  className="flex items-center gap-2 w-full p-2 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva nota
                </button>
              </div>
            )}
          </div>
        ))}

        {showAddSubject && (
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
            <input
              type="text"
              placeholder="Nombre de la materia"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
              autoFocus
            />
            <div className="space-y-2">
              <p className="text-xs text-white/50">Color</p>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === color ? 'scale-125 ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddSubject}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                Crear
              </button>
              <button
                onClick={() => setShowAddSubject(false)}
                className="px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {!showAddSubject && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowAddSubject(true)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary/20 border border-primary/30 rounded-xl text-primary hover:bg-primary/30 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nueva Materia
          </button>
        </div>
      )}
    </aside>
  );
}
