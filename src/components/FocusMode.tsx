'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Clock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SOUND_PRESETS } from '@/lib/types';

const SOUND_URLS: Record<string, string> = {
  lofi: 'https://cdn.pixabay.com/audio/2022/10/25/audio_946ba7e4fa.mp3',
  rain: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1e6e153a94.mp3',
  nature: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8eb02c6b9d.mp3',
  cafe: 'https://cdn.pixabay.com/audio/2021/09/07/audio_a47d5a49b3.mp3',
  fire: 'https://cdn.pixabay.com/audio/2021/08/09/audio_dc39bede8e.mp3',
  ocean: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9c5b21c21.mp3',
};

export default function FocusMode() {
  const { isFocusModeOpen, setFocusModeOpen, settings, toggleSound, setSoundVolume, addFocusMinute, user } = useStore();

  const [pomodoroTime, setPomodoroTime] = useState(settings.pomodoroWork * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isFocusModeOpen) {
      Object.entries(SOUND_URLS).forEach(([id, url]) => {
        if (!audioRefs.current[id]) {
          audioRefs.current[id] = new Audio(url);
          audioRefs.current[id].loop = true;
          audioRefs.current[id].volume = settings.soundVolumes[id] || 0.5;
        }
      });
    }
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
      });
    };
  }, [isFocusModeOpen]);

  useEffect(() => {
    settings.activeSounds.forEach((soundId) => {
      const audio = audioRefs.current[soundId];
      if (audio && audio.paused && settings.soundEnabled) {
        audio.play().catch(() => {});
      }
    });

    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (!settings.activeSounds.includes(id)) {
        audio.pause();
      }
    });
  }, [settings.activeSounds, settings.soundEnabled]);

  useEffect(() => {
    if (isRunning && !isBreak) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            setIsBreak(true);
            setIsRunning(false);
            setSessions((s) => s + 1);
            setPomodoroTime(settings.pomodoroBreak * 60);
            new Notification('StudyPlay', { body: 'Tiempo de descanso!' });
            return settings.pomodoroBreak * 60;
          }
          if (prev % 60 === 0) {
            addFocusMinute();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isRunning && isBreak) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            setIsBreak(false);
            setIsRunning(false);
            setPomodoroTime(settings.pomodoroWork * 60);
            new Notification('StudyPlay', { body: 'Tiempo de estudio!' });
            return settings.pomodoroWork * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isBreak, settings.pomodoroWork, settings.pomodoroBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setPomodoroTime(settings.pomodoroWork * 60);
  };

  const progress = isBreak
    ? ((settings.pomodoroBreak * 60 - pomodoroTime) / (settings.pomodoroBreak * 60)) * 100
    : ((settings.pomodoroWork * 60 - pomodoroTime) / (settings.pomodoroWork * 60)) * 100;

  if (!isFocusModeOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setFocusModeOpen(false)} />

      <div className="relative w-full max-w-2xl glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Modo Enfoque</h2>
                <p className="text-sm text-white/50">Maximiza tu concentracion</p>
              </div>
            </div>
            <button
              onClick={() => setFocusModeOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white/60" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-64 h-64 mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={isBreak ? '#10B981' : '#8B5CF6'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} 283`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${isBreak ? 'text-green-400' : 'text-white'}`}>
                  {formatTime(pomodoroTime)}
                </span>
                <span className="text-white/50 mt-2">
                  {isBreak ? 'Descanso' : 'Enfoque'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={resetTimer}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <RotateCcw className="w-6 h-6 text-white/60" />
              </button>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`p-6 rounded-full transition-all ${
                  isRunning
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary hover:bg-primary/80'
                }`}
              >
                {isRunning ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white" />
                )}
              </button>
              <div className="w-14" />
            </div>

            <div className="flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-white/10">
              <span className="text-white/60 text-sm">Sesiones completadas:</span>
              <span className="text-white font-bold">{sessions}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sonidos Ambientales</h3>
              <button
                onClick={() => useStore.getState().setSoundEnabled(!settings.soundEnabled)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-white/60" />
                ) : (
                  <VolumeX className="w-5 h-5 text-red-400" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SOUND_PRESETS.map((sound) => {
                const isActive = settings.activeSounds.includes(sound.id);
                const volume = settings.soundVolumes[sound.id] || 0.5;

                return (
                  <div
                    key={sound.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-primary/20 border-primary'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <button
                      onClick={() => toggleSound(sound.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-white/20'}`} />
                        <span className="text-white font-medium">{sound.name}</span>
                      </div>
                    </button>
                    {isActive && (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume * 100}
                        onChange={(e) => setSoundVolume(sound.id, parseInt(e.target.value) / 100)}
                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Tiempo total de enfoque hoy:</span>
              <span className="text-white font-medium">{user.focusMinutes} minutos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
