import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Subject, Note, Quiz, ErrorLogEntry, Question } from './types';

const calculateLevel = (xp: number): number => {
  let level = 1;
  let totalXpRequired = 0;
  while (totalXpRequired + 100 * level * (level + 1) / 2 <= xp) {
    totalXpRequired += 100 * level * (level + 1) / 2;
    level++;
    if (level >= 100) break;
  }
  return level;
};

const getXpForNextLevel = (level: number): number => {
  return 100 * level * (level + 1) / 2;
};

const getTotalXpForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += 100 * i * (i + 1) / 2;
  }
  return total;
};

interface AppActions {
  // User actions
  addXP: (amount: number) => { newXP: number; newLevel: number; leveledUp: boolean };
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  updateStreak: () => void;
  activateStreakShield: () => void;
  activateXPBoost: () => void;
  useRestDay: () => void;

  // Subject actions
  addSubject: (subject: Omit<Subject, 'notes'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Note actions
  addNote: (subjectId: string, note: Omit<Note, 'id' | 'subjectId' | 'createdAt' | 'updatedAt' | 'quizCount' | 'correctRate'>) => void;
  updateNote: (subjectId: string, noteId: string, updates: Partial<Note>) => void;
  deleteNote: (subjectId: string, noteId: string) => void;

  // Quiz actions
  startQuiz: (quiz: Omit<Quiz, 'id' | 'startedAt' | 'score' | 'totalQuestions'>) => void;
  answerQuestion: (questionIndex: number, answerIndex: number) => { isCorrect: boolean; xpEarned: number };
  completeQuiz: () => { totalXP: number; correctCount: number; incorrectQuestions: Question[] };
  clearCurrentQuiz: () => void;

  // Error log actions
  addToErrorLog: (entry: Omit<ErrorLogEntry, 'id' | 'createdAt'>) => void;
  clearErrorLog: () => void;

  // View actions
  setActiveNote: (noteId: string | null) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setStoreOpen: (isOpen: boolean) => void;
  setFocusModeOpen: (isOpen: boolean) => void;

  // Settings actions
  setTheme: (themeId: string) => void;
  previewTheme: (themeId: string | null) => void;
  unlockTheme: (themeId: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: (soundId: string) => void;
  setSoundVolume: (soundId: string, volume: number) => void;

  // Stats
  addFocusMinute: () => void;
  incrementQuizCompleted: () => void;
  addCorrectAnswer: () => void;
  addTotalAnswered: () => void;
}

const initialState: AppState = {
  user: {
    xp: 0,
    level: 1,
    coins: 50,
    streak: 0,
    streakShield: false,
    maxStreak: 0,
    lastStudyDate: '',
    xpMultiplier: 1,
    xpMultiplierExpiry: '',
    totalQuizzesCompleted: 0,
    totalCorrectAnswers: 0,
    totalQuestionsAnswered: 0,
    focusMinutes: 0,
  },
  subjects: [],
  quizHistory: [],
  errorLog: [],
  unlockedThemes: ['default', 'matrix'],
  lastConfirmedTheme: 'default',
  settings: {
    theme: 'default',
    soundEnabled: true,
    pomodoroWork: 25,
    pomodoroBreak: 5,
    activeSounds: [],
    soundVolumes: {},
  },
  activeNoteId: null,
  currentView: 'notes',
  currentQuiz: null,
  isStoreOpen: false,
  isFocusModeOpen: false,
};

export const useStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXP: (amount: number) => {
        const state = get();
        let multiplier = 1;
        if (state.user.xpMultiplier > 1 && new Date(state.user.xpMultiplierExpiry) > new Date()) {
          multiplier = state.user.xpMultiplier;
        }
        const actualAmount = Math.floor(amount * multiplier);
        const newXP = state.user.xp + actualAmount;
        const newLevel = calculateLevel(newXP);
        const leveledUp = newLevel > state.user.level;

        set((s) => ({
          user: {
            ...s.user,
            xp: newXP,
            level: newLevel,
            coins: s.user.coins + Math.floor(actualAmount / 10),
          },
        }));

        return { newXP, newLevel, leveledUp };
      },

      addCoins: (amount: number) => {
        set((s) => ({
          user: { ...s.user, coins: s.user.coins + amount },
        }));
      },

      spendCoins: (amount: number) => {
        const state = get();
        if (state.user.coins < amount) return false;
        set((s) => ({
          user: { ...s.user, coins: s.user.coins - amount },
        }));
        return true;
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toDateString();
        const lastStudy = state.user.lastStudyDate;

        if (lastStudy === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastStudy === yesterday.toDateString()) {
          set((s) => ({
            user: {
              ...s.user,
              streak: s.user.streak + 1,
              maxStreak: Math.max(s.user.maxStreak, s.user.streak + 1),
              lastStudyDate: today,
            },
          }));
        } else if (lastStudy !== today) {
          set((s) => ({
            user: {
              ...s.user,
              streak: s.user.streakShield ? s.user.streak : 1,
              streakShield: false,
              lastStudyDate: today,
            },
          }));
        }
      },

      activateStreakShield: () => {
        const state = get();
        if (state.user.coins < 150) return;
        set((s) => ({
          user: { ...s.user, coins: s.user.coins - 150, streakShield: true },
        }));
      },

      activateXPBoost: () => {
        const state = get();
        if (state.user.coins < 100) return;
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        set((s) => ({
          user: {
            ...s.user,
            coins: s.user.coins - 100,
            xpMultiplier: 2,
            xpMultiplierExpiry: expiry.toISOString(),
          },
        }));
      },

      useRestDay: () => {
        const state = get();
        if (state.user.coins < 200) return;
        set((s) => ({
          user: { ...s.user, coins: s.user.coins - 200, lastStudyDate: new Date().toDateString() },
        }));
      },

      addSubject: (subject) => {
        const newSubject: Subject = { ...subject, notes: [] };
        set((s) => ({
          subjects: [...s.subjects, newSubject],
        }));
      },

      updateSubject: (id, updates) => {
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          ),
        }));
      },

      deleteSubject: (id) => {
        set((s) => ({
          subjects: s.subjects.filter((sub) => sub.id !== id),
        }));
      },

      addNote: (subjectId, note) => {
        const newNote: Note = {
          ...note,
          id: crypto.randomUUID(),
          subjectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          quizCount: 0,
          correctRate: 0,
        };
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId ? { ...sub, notes: [...sub.notes, newNote] } : sub
          ),
          activeNoteId: newNote.id,
        }));
        get().addXP(50);
        get().addCoins(10);
      },

      updateNote: (subjectId, noteId, updates) => {
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  notes: sub.notes.map((note) =>
                    note.id === noteId
                      ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                      : note
                  ),
                }
              : sub
          ),
        }));
      },

      deleteNote: (subjectId, noteId) => {
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, notes: sub.notes.filter((note) => note.id !== noteId) }
              : sub
          ),
          activeNoteId: s.activeNoteId === noteId ? null : s.activeNoteId,
        }));
      },

      startQuiz: (quizData) => {
        const quiz: Quiz = {
          ...quizData,
          id: crypto.randomUUID(),
          startedAt: new Date().toISOString(),
          score: 0,
          totalQuestions: quizData.questions.length,
        };
        set({ currentQuiz: quiz, currentView: 'quiz' });
      },

      answerQuestion: (questionIndex, answerIndex) => {
        const state = get();
        if (!state.currentQuiz) return { isCorrect: false, xpEarned: 0 };

        const question = state.currentQuiz.questions[questionIndex];
        const isCorrect = question.correctIndex === answerIndex;

        const updatedQuestions = state.currentQuiz.questions.map((q, i) =>
          i === questionIndex
            ? { ...q, userAnswer: answerIndex, isCorrect }
            : q
        );

        const newScore = state.currentQuiz.score + (isCorrect ? 1 : 0);

        set((s) => ({
          currentQuiz: s.currentQuiz
            ? {
                ...s.currentQuiz,
                questions: updatedQuestions,
                score: newScore,
              }
            : null,
        }));

        let xpEarned = 0;
        if (isCorrect) {
          const result = get().addXP(10);
          xpEarned = result.newXP - state.user.xp;
          get().addCorrectAnswer();
        }
        get().addTotalAnswered();

        if (!isCorrect) {
          get().addToErrorLog({
            questionId: question.id,
            question: question.text,
            options: question.options,
            correctAnswer: question.options[question.correctIndex],
            subjectId: state.currentQuiz.subjectId,
            subjectName: state.currentQuiz.subjectName,
            noteId: state.currentQuiz.noteId,
          });
        }

        return { isCorrect, xpEarned };
      },

      completeQuiz: () => {
        const state = get();
        if (!state.currentQuiz) return { totalXP: 0, correctCount: 0, incorrectQuestions: [] };

        const incorrectQuestions = state.currentQuiz.questions.filter((q) => !q.isCorrect);

        set((s) => ({
          quizHistory: [
            ...s.quizHistory,
            {
              ...s.currentQuiz!,
              completedAt: new Date().toISOString(),
            },
          ],
          currentQuiz: null,
          currentView: 'notes',
        }));

        get().incrementQuizCompleted();
        get().updateStreak();
        get().addCoins(5);

        return {
          totalXP: state.currentQuiz.score * 10,
          correctCount: state.currentQuiz.score,
          incorrectQuestions,
        };
      },

      clearCurrentQuiz: () => {
        set({ currentQuiz: null, currentView: 'notes' });
      },

      addToErrorLog: (entry) => {
        const newEntry: ErrorLogEntry = {
          ...entry,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          errorLog: [newEntry, ...s.errorLog].slice(0, 100),
        }));
      },

      clearErrorLog: () => {
        set({ errorLog: [] });
      },

      setActiveNote: (noteId) => {
        set({ activeNoteId: noteId });
      },

      setCurrentView: (view) => {
        set({ currentView: view });
      },

      setStoreOpen: (isOpen) => {
        set({ isStoreOpen: isOpen });
      },

      setFocusModeOpen: (isOpen) => {
        set({ isFocusModeOpen: isOpen });
      },

      setTheme: (themeId) => {
        set((s) => ({
          settings: { ...s.settings, theme: themeId },
          lastConfirmedTheme: themeId,
        }));
      },

      previewTheme: (themeId) => {
        set((s) => ({
          settings: { ...s.settings, theme: themeId || s.lastConfirmedTheme },
        }));
      },

      unlockTheme: (themeId) => {
        set((s) => ({
          unlockedThemes: Array.from(new Set([...s.unlockedThemes, themeId])),
        }));
      },

      setSoundEnabled: (enabled) => {
        set((s) => ({
          settings: { ...s.settings, soundEnabled: enabled },
        }));
      },

      toggleSound: (soundId) => {
        set((s) => {
          const activeSounds = s.settings.activeSounds.includes(soundId)
            ? s.settings.activeSounds.filter((id) => id !== soundId)
            : [...s.settings.activeSounds, soundId];
          return { settings: { ...s.settings, activeSounds } };
        });
      },

      setSoundVolume: (soundId, volume) => {
        set((s) => ({
          settings: {
            ...s.settings,
            soundVolumes: { ...s.settings.soundVolumes, [soundId]: volume },
          },
        }));
      },

      addFocusMinute: () => {
        set((s) => ({
          user: { ...s.user, focusMinutes: s.user.focusMinutes + 1 },
        }));
        get().addXP(1);
      },

      incrementQuizCompleted: () => {
        set((s) => ({
          user: { ...s.user, totalQuizzesCompleted: s.user.totalQuizzesCompleted + 1 },
        }));
      },

      addCorrectAnswer: () => {
        set((s) => ({
          user: { ...s.user, totalCorrectAnswers: s.user.totalCorrectAnswers + 1 },
        }));
      },

      addTotalAnswered: () => {
        set((s) => ({
          user: { ...s.user, totalQuestionsAnswered: s.user.totalQuestionsAnswered + 1 },
        }));
      },
    }),
    {
      name: 'studyplay-storage',
    }
  )
);

export const getXpProgress = (xp: number, level: number) => {
  const currentLevelXp = getTotalXpForLevel(level);
  const nextLevelXp = getTotalXpForLevel(level + 1);
  const progressXp = xp - currentLevelXp;
  const requiredXp = nextLevelXp - currentLevelXp;
  return Math.min(100, Math.max(0, (progressXp / requiredXp) * 100));
};

export { getXpForNextLevel, getTotalXpForLevel };
