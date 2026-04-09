'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, X, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SOUND_PRESETS } from '@/lib/types';

export default function FocusWidget() {
  const { settings, toggleSound, setSoundVolume, addFocusMinute, user, setFocusModeOpen, isFocusModeOpen } = useStore();
  
  const isMinimized = !isFocusModeOpen;
  const setIsMinimized = (val: boolean) => setFocusModeOpen(!val);
  const [pomodoroTime, setPomodoroTime] = useState(settings.pomodoroWork * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setPomodoroTime((prev) => {
          if (prev <= 1) {
            setIsBreak(!isBreak);
            const nextTime = (!isBreak ? settings.pomodoroBreak : settings.pomodoroWork) * 60;
            return nextTime;
          }
          if (!isBreak && prev % 60 === 0) {
            addFocusMinute();
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-500 ease-spring ${isMinimized ? 'w-14 h-14' : 'w-80 h-[420px]'}`}>
      {/* Botón flotante circual (Cerrado) */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className={`absolute inset-0 flex items-center justify-center rounded-2xl glass-card border border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${isMinimized ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="relative">
          <Clock className={`w-7 h-7 ${isRunning ? 'text-primary animate-pulse' : 'text-white'}`} />
          {isRunning && (
            <span className="absolute -top-4 -right-2 text-[10px] font-bold text-primary bg-black/50 px-1 rounded">
              {formatTime(pomodoroTime)}
            </span>
          )}
        </div>
      </button>

      {/* Widget expandido */}
      <div className={`w-full h-full glass-card border border-white/20 shadow-2xl rounded-3xl p-6 flex flex-col overflow-hidden transition-all duration-500 ${isMinimized ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isBreak ? 'bg-green-400' : 'bg-primary'}`} />
            <h3 className="font-bold text-white">{isBreak ? 'Descanso' : 'Estudiando'}</h3>
          </div>
          <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-white/10 rounded-lg">
            <ChevronDown className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Timer Principal */}
        <div className="text-center mb-6">
          <div className="text-5xl font-black text-white mb-2 tabular-nums">
            {formatTime(pomodoroTime)}
          </div>
          <p className="text-xs text-white/40 uppercase tracking-widest">
            {isRunning ? 'Sesión activa' : 'En pausa'}
          </p>
        </div>

        {/* Controles de Timer */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button 
            onClick={() => { setPomodoroTime(settings.pomodoroWork * 60); setIsRunning(false); }}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-white/60" />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-5 rounded-3xl transition-all duration-300 scale-110 shadow-lg ${isRunning ? 'bg-red-500 shadow-red-500/20' : 'bg-primary shadow-primary/20'}`}
          >
            {isRunning ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
          </button>
          <div className="w-11" /> {/* Espaciador */}
        </div>

        {/* Sección de Audios Simplificada */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white/60 uppercase">Sonidos</span>
            <Volume2 className="w-4 h-4 text-white/30" />
          </div>
          <div className="space-y-2">
            {SOUND_PRESETS.map((sound) => {
              const isActive = settings.activeSounds.includes(sound.id);
              return (
                <div key={sound.id} className={`group p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 border border-white/5'}`}>
                  <button onClick={() => toggleSound(sound.id)} className="w-full flex items-center justify-between">
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/50'}`}>{sound.name}</span>
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
                  </button>
                  {isActive && (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(settings.soundVolumes[sound.id] ?? 0.5) * 100}
                      onChange={(e) => setSoundVolume(sound.id, parseInt(e.target.value) / 100)}
                      className="w-full h-1 bg-white/10 rounded-full accent-primary mt-2"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .ease-spring { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
}
