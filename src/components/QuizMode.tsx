'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, Loader2, Trophy, Target, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function QuizMode() {
  const { currentQuiz, answerQuestion, completeQuiz, clearCurrentQuiz, subjects } = useStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    totalXP: number;
    correctCount: number;
    incorrectQuestions: typeof currentQuiz.questions;
  } | null>(null);

  useEffect(() => {
    if (currentQuiz) {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setQuizResults(null);
    }
  }, [currentQuiz?.id]);

  if (!currentQuiz) return null;

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    answerQuestion(currentQuestionIndex, answerIndex);
  };

  const handleNext = async () => {
    setIsTransitioning(true);
    await new Promise((r) => setTimeout(r, 300));

    if (isLastQuestion) {
      const results = completeQuiz();
      setQuizResults(results);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
    setIsTransitioning(false);
  };

  if (quizResults) {
    const percentage = Math.round((quizResults.correctCount / currentQuiz.questions.length) * 100);
    const isPerfect = percentage === 100;
    const isGood = percentage >= 70;

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="glass-card p-8 text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isPerfect ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
              isGood ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
              'bg-gradient-to-r from-purple-400 to-pink-500'
            }`}>
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {isPerfect ? '¡Perfecto!' : isGood ? '¡Buen trabajo!' : '¡Sigue practicando!'}
            </h2>

            <p className="text-white/60 mb-8">{currentQuiz.noteTitle}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-green-400">{quizResults.correctCount}</div>
                <div className="text-sm text-white/50">Correctas</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-red-400">
                  {currentQuiz.questions.length - quizResults.correctCount}
                </div>
                <div className="text-sm text-white/50">Incorrectas</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-primary">{percentage}%</div>
                <div className="text-sm text-white/50">Aciertos</div>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-8">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="font-bold">+{quizResults.totalXP} XP ganadas!</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>

            {quizResults.incorrectQuestions.length > 0 && (
              <div className="text-left mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Preguntas para repasar
                </h3>
                <div className="space-y-3">
                  {quizResults.incorrectQuestions.map((q, i) => (
                    <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-white/90 mb-2">{q.text}</p>
                      <p className="text-sm text-green-400">
                        Respuesta correcta: {q.options[q.correctIndex]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => clearCurrentQuiz()}
              className="w-full py-4 bg-primary hover:bg-primary/80 text-white rounded-xl font-semibold transition-colors"
            >
              Volver a las notas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => clearCurrentQuiz()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm">
              Pregunta {currentQuestionIndex + 1} de {currentQuiz.questions.length}
            </span>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/80">{currentQuiz.score} correctas</span>
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="glass-card p-8">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm mb-4">
              {currentQuiz.subjectName}
            </span>
            <h2 className="text-2xl font-bold text-white leading-relaxed">
              {currentQuestion.text}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrect = showFeedback && isCorrect;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    showCorrect
                      ? 'bg-green-500/30 border-2 border-green-500'
                      : showIncorrect
                      ? 'bg-red-500/30 border-2 border-red-500'
                      : isSelected
                      ? 'bg-primary/30 border-2 border-primary'
                      : 'bg-white/5 border-2 border-white/10 hover:border-primary/50 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showIncorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {showCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : showIncorrect ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>
                    <span className="text-white flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`mt-6 p-4 rounded-xl ${
              selectedAnswer === currentQuestion.correctIndex
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-red-500/20 border border-red-500/30'
            }`}>
              <p className={`font-semibold ${
                selectedAnswer === currentQuestion.correctIndex
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {selectedAnswer === currentQuestion.correctIndex
                  ? '¡Correcto! +10 XP'
                  : `Incorrecto. La respuesta correcta era: ${currentQuestion.options[currentQuestion.correctIndex]}`}
              </p>
            </div>
          )}

          {showFeedback && (
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="w-full mt-6 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isTransitioning ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLastQuestion ? (
                'Ver Resultados'
              ) : (
                <>
                  Siguiente Pregunta
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {currentQuiz.questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index < currentQuestionIndex
                  ? currentQuiz.questions[index].isCorrect
                    ? 'bg-green-400'
                    : 'bg-red-400'
                  : index === currentQuestionIndex
                  ? 'bg-primary'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
