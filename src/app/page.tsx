'use client';

import { useState, useEffect } from 'react';
import { BarChart3, BookOpen, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import NoteEditor from '@/components/NoteEditor';
import QuizMode from '@/components/QuizMode';
import StoreModal from '@/components/StoreModal';
import ProgressDashboard from '@/components/ProgressDashboard';
import ThemeCanvas from '@/components/ThemeCanvas';
import { useStore } from '@/lib/store';

export default function Home() {
  const { currentView, setCurrentView, user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white/60">Cargando StudyPlay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <ThemeCanvas />
      <Header />

      <div className="flex pt-16">
        {currentView !== 'quiz' && currentView !== 'dashboard' && (
          <Sidebar />
        )}

        <main className={`flex-1 ${(currentView !== 'quiz' && currentView !== 'dashboard') ? 'md:ml-80' : ''}`}>
          {currentView === 'notes' && <NoteEditor />}
          {currentView === 'quiz' && <QuizMode />}
          {currentView === 'dashboard' && <ProgressDashboard />}
        </main>
      </div>

      <StoreModal />

      {currentView !== 'dashboard' && currentView !== 'quiz' && (
        <button
          onClick={() => setCurrentView('dashboard')}
          className="fixed bottom-6 right-24 z-40 p-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          title="Ver Progreso"
        >
          <BarChart3 className="w-6 h-6" />
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-white/10 md:hidden">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => setCurrentView('notes')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'notes' ? 'text-primary' : 'text-white/60'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Notas</span>
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 ${
              currentView === 'dashboard' ? 'text-primary' : 'text-white/60'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Progreso</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
