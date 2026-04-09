'use client';

import { useState } from 'react';
import { BarChart3, Flame, Target, Trophy, TrendingUp, BookOpen, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { LEVEL_TITLES } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899', '#06B6D4', '#84CC16'];

export default function ProgressDashboard() {
  const { user, subjects, quizHistory, errorLog, setCurrentView } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'errors'>('overview');

  const levelTitle = LEVEL_TITLES.find(
    (t) => user.level >= t.minLevel && user.level <= t.maxLevel
  )?.title || 'Novato';

  const weeklyXP = getWeeklyXPData();
  const subjectStats = getSubjectStats();
  const accuracyRate = user.totalQuestionsAnswered > 0
    ? Math.round((user.totalCorrectAnswers / user.totalQuestionsAnswered) * 100)
    : 0;

  function getWeeklyXPData() {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weekData = days.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateStr = date.toDateString();

      const dayXP = quizHistory
        .filter((q) => new Date(q.startedAt).toDateString() === dateStr)
        .reduce((sum, q) => sum + q.score * 10, 0);

      return { day: days[index], xp: dayXP };
    });

    return weekData;
  }

  function getSubjectStats() {
    const stats: Record<string, { name: string; color: string; quizzes: number; correct: number }> = {};

    subjects.forEach((subject) => {
      stats[subject.id] = { name: subject.name, color: subject.color, quizzes: 0, correct: 0 };
    });

    quizHistory.forEach((quiz) => {
      if (stats[quiz.subjectId]) {
        stats[quiz.subjectId].quizzes += 1;
        stats[quiz.subjectId].correct += quiz.score;
      }
    });

    return Object.values(stats).filter((s) => s.quizzes > 0);
  }

  const statsCards = [
    {
      label: 'Nivel Actual',
      value: user.level,
      subValue: levelTitle,
      icon: Trophy,
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Racha Actual',
      value: user.streak,
      subValue: `Max: ${user.maxStreak}`,
      icon: Flame,
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'Tasa de Aciertos',
      value: `${accuracyRate}%`,
      subValue: `${user.totalCorrectAnswers}/${user.totalQuestionsAnswered}`,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Quizzes Completados',
      value: user.totalQuizzesCompleted,
      subValue: 'Total',
      icon: CheckCircle,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Tiempo de Enfoque',
      value: `${user.focusMinutes}`,
      subValue: 'minutos',
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'StudyCoins',
      value: user.coins,
      subValue: 'Balance',
      icon: TrendingUp,
      color: 'from-yellow-500 to-amber-500',
    },
  ];

  return (
    <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-secondary">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard de Progreso</h1>
              <p className="text-white/50">Tu evolucion academica en un vistazo</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('notes')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Volver a notas
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statsCards.map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
              <div className="text-xs text-white/30">{stat.subValue}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'errors'
                ? 'bg-primary text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Errores para Repasar ({errorLog.length})
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">XP Semanal</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyXP}>
                    <XAxis dataKey="day" stroke="#A1A1AA" fontSize={12} />
                    <YAxis stroke="#A1A1AA" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 15, 26, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${value} XP`, 'Ganado']}
                    />
                    <Bar dataKey="xp" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quizzes por Materia</h3>
              <div className="h-64">
                {subjectStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subjectStats}
                        dataKey="quizzes"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {subjectStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 15, 26, 0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/40">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Completa quizzes para ver estadisticas</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Logro de Nivel</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#levelGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(user.level / 100) * 283} 283`}
                    />
                    <defs>
                      <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{user.level}</span>
                    <span className="text-xs text-white/50">Nivel</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-2">{levelTitle}</h4>
                  <p className="text-white/60 mb-4">
                    {user.level < 100
                      ? `Nivel ${user.level + 1} en ${Math.ceil((100 * (user.level + 1) * (user.level + 2) / 2 - user.xp) / 10)} XP`
                      : 'Has alcanzado el nivel maximo!'}
                  </p>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{user.totalCorrectAnswers}</div>
                      <div className="text-xs text-white/50">Respuestas correctas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{user.totalQuestionsAnswered}</div>
                      <div className="text-xs text-white/50">Total respondidas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Preguntas para Repasar
              </h3>
              {errorLog.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('¿Limpiar registro de errores?')) {
                      useStore.getState().clearErrorLog();
                    }
                  }}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {errorLog.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400/50" />
                <h4 className="text-xl font-semibold text-white mb-2">¡Sin errores!</h4>
                <p className="text-white/50">Sigue asi. Tus respuestas incorrectas apareceran aqui para que puedas repasarlas.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {errorLog.map((error) => (
                  <div key={error.id} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ backgroundColor: `${subjects.find((s) => s.id === error.subjectId)?.color}20`, color: subjects.find((s) => s.id === error.subjectId)?.color }}
                      >
                        {error.subjectName}
                      </span>
                      <span className="text-xs text-white/40">
                        {new Date(error.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white/90 mb-2">{error.question}</p>
                    <div className="text-sm">
                      <span className="text-green-400">Correcta: {error.correctAnswer}</span>
                      {error.userAnswer && (
                        <span className="text-red-400 ml-4">Tu respuesta: {error.userAnswer}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
