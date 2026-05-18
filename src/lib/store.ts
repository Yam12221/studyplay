import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
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
  fetchInitialData: () => Promise<void>;

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

      fetchInitialData: async () => {
        try {
          // Fetch user stats - use select().limit(1) instead of .single() to avoid 406/PGRST116 errors on empty tables
          const { data: statsArray, error: statsError } = await supabase.from('user_stats').select('*').limit(1);
          
          if (statsArray && statsArray.length > 0) {
            const statsData = statsArray[0];
            set((s) => ({
              user: {
                ...s.user,
                xp: statsData.xp ?? s.user.xp,
                level: statsData.level ?? s.user.level,
                coins: statsData.coins ?? s.user.coins,
                streak: statsData.streak ?? s.user.streak,
                streakShield: statsData.streak_shield ?? s.user.streakShield,
                maxStreak: statsData.max_streak ?? s.user.maxStreak,
                lastStudyDate: statsData.last_study_date ?? s.user.lastStudyDate,
                xpMultiplier: statsData.xp_multiplier ?? s.user.xpMultiplier,
                xpMultiplierExpiry: statsData.xp_multiplier_expiry ?? s.user.xpMultiplierExpiry,
                focusMinutes: statsData.focus_minutes ?? s.user.focusMinutes,
                totalQuizzesCompleted: statsData.total_quizzes_completed ?? s.user.totalQuizzesCompleted,
                totalCorrectAnswers: statsData.total_correct_answers ?? s.user.totalCorrectAnswers,
                totalQuestionsAnswered: statsData.total_questions_answered ?? s.user.totalQuestionsAnswered,
              }
            }));
          } else if (!statsError) {
            // Create initial stats only if it's truly missing and no connection error
            const state = get();
            await supabase.from('user_stats').insert([{
              xp: state.user.xp,
              level: state.user.level,
              coins: state.user.coins,
            }]);
          }

          // Fetch subjects
          const { data: subjectsData } = await supabase.from('subjects').select('*');
          if (subjectsData && subjectsData.length > 0) {
            const formattedSubjects: Subject[] = await Promise.all(subjectsData.map(async (sub) => {
              const { data: notesData } = await supabase.from('notes').select('*').eq('subject_id', sub.id);
              return {
                ...sub,
                notes: (notesData || []).map(n => ({
                  id: n.id,
                  subjectId: n.subject_id,
                  title: n.title,
                  content: n.content,
                  createdAt: n.created_at,
                  updatedAt: n.updated_at,
                  quizCount: n.quiz_count,
                  correctRate: n.correct_rate,
                  attachments: n.attachments || [],
                }))
              };
            }));
            
            // Merge with local subjects (avoiding duplicates by ID)
            set((s) => {
              const existingIds = new Set(formattedSubjects.map(sub => sub.id));
              const localOnly = s.subjects.filter(sub => !existingIds.has(sub.id));
              return { subjects: [...formattedSubjects, ...localOnly] };
            });
          }

          // Fetch unlocked themes
          const { data: themesData } = await supabase.from('unlocked_themes').select('theme_id');
          if (themesData) {
            set((s) => ({ 
              unlockedThemes: Array.from(new Set([...s.unlockedThemes, ...themesData.map(t => t.theme_id)])) 
            }));
          }
        } catch (error) {
          console.error('Error fetching initial data:', error);
        }
      },

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

        const updatedUser = {
          ...state.user,
          xp: newXP,
          level: newLevel,
          coins: state.user.coins + Math.floor(actualAmount / 10),
        };

        set({ user: updatedUser });

        // Sync to Supabase - handle error to prevent blocking
        supabase.from('user_stats').upsert([{
          xp: newXP,
          level: newLevel,
          coins: updatedUser.coins,
          streak: updatedUser.streak,
          max_streak: updatedUser.maxStreak,
          last_study_date: updatedUser.lastStudyDate,
          streak_shield: updatedUser.streakShield,
          xp_multiplier: updatedUser.xpMultiplier,
          xp_multiplier_expiry: updatedUser.xpMultiplierExpiry,
          focus_minutes: updatedUser.focusMinutes,
          total_quizzes_completed: updatedUser.totalQuizzesCompleted,
          total_correct_answers: updatedUser.totalCorrectAnswers,
          total_questions_answered: updatedUser.totalQuestionsAnswered,
        }]).catch(err => console.warn('Sync user_stats failed:', err));

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

        // Sync streak to Supabase
        const updated = get().user;
        supabase.from('user_stats').upsert([{
          streak: updated.streak,
          max_streak: updated.maxStreak,
          last_study_date: updated.lastStudyDate,
          streak_shield: updated.streakShield,
        }]).catch(err => console.warn('Sync streak failed:', err));
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
        
        // Sync to Supabase
        supabase.from('subjects').insert([{
          id: subject.id,
          name: subject.name,
          color: subject.color,
          icon: subject.icon
        }]).then();
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

        // Sync to Supabase
        supabase.from('subjects').delete().eq('id', id).then();
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

        // Sync to Supabase - handle error to prevent blocking
        supabase.from('notes').insert([{
          id: newNote.id,
          subject_id: subjectId,
          title: newNote.title,
          content: newNote.content,
          quiz_count: 0,
          correct_rate: 0
        }]).catch(err => console.warn('Sync note failed:', err));

        try {
          get().addXP(50);
          get().addCoins(10);
          get().updateStreak();
        } catch (e) {
          console.warn('Stats update failed:', e);
        }
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

        // Sync to Supabase
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.quizCount !== undefined) dbUpdates.quiz_count = updates.quizCount;
        if (updates.correctRate !== undefined) dbUpdates.correct_rate = updates.correctRate;
        if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;

        if (Object.keys(dbUpdates).length > 0) {
          supabase.from('notes').update(dbUpdates).eq('id', noteId).then();
        }
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

        // Sync to Supabase
        supabase.from('notes').delete().eq('id', noteId).then();
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

        // Sync to Supabase
        supabase.from('unlocked_themes').insert([{ theme_id: themeId }]).then();
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
        get().updateStreak();
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
