export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  notes: Note[];
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  quizCount: number;
  correctRate: number;
  attachments: string[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface Quiz {
  id: string;
  noteId: string;
  noteTitle: string;
  subjectId: string;
  subjectName: string;
  questions: Question[];
  startedAt: string;
  completedAt?: string;
  score: number;
  totalQuestions: number;
}

export interface ErrorLogEntry {
  id: string;
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  subjectId: string;
  subjectName: string;
  noteId: string;
  createdAt: string;
}

export interface UserStats {
  xp: number;
  level: number;
  coins: number;
  streak: number;
  streakShield: boolean;
  maxStreak: number;
  lastStudyDate: string;
  xpMultiplier: number;
  xpMultiplierExpiry: string;
  totalQuizzesCompleted: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
  focusMinutes: number;
}

export interface AppSettings {
  theme: string;
  soundEnabled: boolean;
  pomodoroWork: number;
  pomodoroBreak: number;
  activeSounds: string[];
  soundVolumes: Record<string, number>;
}

export interface AppState {
  user: UserStats;
  subjects: Subject[];
  quizHistory: Quiz[];
  errorLog: ErrorLogEntry[];
  unlockedThemes: string[];
  settings: AppSettings;
  activeNoteId: string | null;
  currentView: 'notes' | 'quiz' | 'dashboard' | 'focus';
  currentQuiz: Quiz | null;
  isStoreOpen: boolean;
  isFocusModeOpen: boolean;
}

export type ThemeType =
  | 'default'
  | 'matrix'
  | 'galaxy'
  | 'vaporwave'
  | 'aurora'
  | 'neon'
  | 'retro'
  | 'nature'
  | 'ocean'
  | 'sunset'
  | 'cyberpunk';

export interface Theme {
  id: ThemeType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  particleColor: string;
  animationType: 'matrix' | 'stars' | 'waves' | 'aurora' | 'neon' | 'scanlines' | 'particles' | 'bubbles' | 'gradient' | 'glitch';
  price: number;
  isUnlocked: boolean;
}

export const THEMES: Theme[] = [
  { id: 'default', name: 'Default', primaryColor: '#8B5CF6', secondaryColor: '#F59E0B', backgroundColor: '#0F0F1A', particleColor: '#8B5CF6', animationType: 'particles', price: 0, isUnlocked: true },
  { id: 'matrix', name: 'Matrix', primaryColor: '#00FF00', secondaryColor: '#00CC00', backgroundColor: '#000000', particleColor: '#00FF00', animationType: 'matrix', price: 0, isUnlocked: true },
  { id: 'galaxy', name: 'Galaxia', primaryColor: '#9333EA', secondaryColor: '#3B82F6', backgroundColor: '#0A0A1F', particleColor: '#FFFFFF', animationType: 'stars', price: 100, isUnlocked: false },
  { id: 'vaporwave', name: 'Vaporwave', primaryColor: '#FF69B4', secondaryColor: '#00FFFF', backgroundColor: '#1A0A2E', particleColor: '#FF69B4', animationType: 'waves', price: 100, isUnlocked: false },
  { id: 'aurora', name: 'Aurora', primaryColor: '#10B981', secondaryColor: '#8B5CF6', backgroundColor: '#0F172A', particleColor: '#10B981', animationType: 'aurora', price: 150, isUnlocked: false },
  { id: 'neon', name: 'Neon', primaryColor: '#FF0080', secondaryColor: '#00FFFF', backgroundColor: '#0D0D0D', particleColor: '#FF0080', animationType: 'neon', price: 150, isUnlocked: false },
  { id: 'retro', name: 'Retro', primaryColor: '#FF6B35', secondaryColor: '#8B4513', backgroundColor: '#2D1810', particleColor: '#FF6B35', animationType: 'scanlines', price: 200, isUnlocked: false },
  { id: 'nature', name: 'Nature', primaryColor: '#22C55E', secondaryColor: '#3B82F6', backgroundColor: '#0F2419', particleColor: '#22C55E', animationType: 'particles', price: 200, isUnlocked: false },
  { id: 'ocean', name: 'Ocean', primaryColor: '#06B6D4', secondaryColor: '#0EA5E9', backgroundColor: '#0C1929', particleColor: '#06B6D4', animationType: 'bubbles', price: 200, isUnlocked: false },
  { id: 'sunset', name: 'Sunset', primaryColor: '#F97316', secondaryColor: '#EC4899', backgroundColor: '#1F0A1F', particleColor: '#F97316', animationType: 'gradient', price: 250, isUnlocked: false },
  { id: 'cyberpunk', name: 'Cyberpunk', primaryColor: '#FFE500', secondaryColor: '#FF0055', backgroundColor: '#0A0A0A', particleColor: '#FFE500', animationType: 'glitch', price: 300, isUnlocked: false },
];

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: number;
  effect: 'xp_multiplier' | 'streak_shield' | 'rest_day';
}

export const POWERUPS: PowerUp[] = [
  { id: 'double_xp', name: 'Doble XP', description: 'x2 experiencia por 1 hora', price: 100, duration: 3600000, effect: 'xp_multiplier' },
  { id: 'streak_shield', name: 'Escudo de Racha', description: 'Protege tu racha por 1 día', price: 150, duration: 86400000, effect: 'streak_shield' },
  { id: 'rest_day', name: 'Día Libre', description: 'Pausa tu racha sin romperla', price: 200, duration: 86400000, effect: 'rest_day' },
];

export const LEVEL_TITLES = [
  { minLevel: 1, maxLevel: 10, title: 'Novato' },
  { minLevel: 11, maxLevel: 25, title: 'Aprendiz' },
  { minLevel: 26, maxLevel: 50, title: 'Estudiante' },
  { minLevel: 51, maxLevel: 75, title: 'Escolar' },
  { minLevel: 76, maxLevel: 99, title: 'Maestro' },
  { minLevel: 100, maxLevel: 100, title: 'Leyenda' },
];

export const SOUND_PRESETS = [
  { id: 'lofi', name: 'Lo-Fi Beats', icon: 'music', category: 'music' },
  { id: 'rain', name: 'Lluvia', icon: 'cloud-rain', category: 'ambient' },
  { id: 'nature', name: 'Naturaleza', icon: 'trees', category: 'ambient' },
  { id: 'cafe', name: 'Cafetería', icon: 'coffee', category: 'ambient' },
  { id: 'fire', name: 'Fogata', icon: 'flame', category: 'ambient' },
  { id: 'ocean', name: 'Océano', icon: 'waves', category: 'ambient' },
];
