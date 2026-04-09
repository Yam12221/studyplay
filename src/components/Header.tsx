'use client';

import { useState, useEffect } from 'react';
import { Flame, Store, Zap, Trophy, Crown } from 'lucide-react';
import { useStore, getXpProgress, getTotalXpForLevel } from '@/lib/store';
import { LEVEL_TITLES } from '@/lib/types';

export default function Header() {
  const { user, setStoreOpen, setFocusModeOpen } = useStore();
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpPopups, setXpPopups] = useState<{ id: string; amount: number; x: number; y: number }[]>([]);

  const xpProgress = getXpProgress(user.xp, user.level);
  const levelTitle = LEVEL_TITLES.find(
    (t) => user.level >= t.minLevel && user.level <= t.maxLevel
  )?.title || 'Novato';

  const hasActiveBoost = user.xpMultiplier > 1 && new Date(user.xpMultiplierExpiry) > new Date();

  useEffect(() => {
    const handleXPChange = (event: CustomEvent<{ amount: number; x: number; y: number }>) => {
      const newPopup = {
        id: crypto.randomUUID(),
        amount: event.detail.amount,
        x: event.detail.x,
        y: event.detail.y,
      };
      setXpPopups((prev) => [...prev, newPopup]);
      setShowXPAnimation(true);

      setTimeout(() => {
        setXpPopups((prev) => prev.filter((p) => p.id !== newPopup.id));
      }, 2000);
    };

    window.addEventListener('xpGained', handleXPChange as EventListener);
    return () => {
      window.removeEventListener('xpGained', handleXPChange as EventListener);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="w-8 h-8 text-primary fill-primary animate-pulse" />
              <span className="absolute -top-1 -right-1 text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-full w-5 h-5 flex items-center justify-center">
                S
              </span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              StudyPlay
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <div className="w-48 h-3 bg-black/30 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <span className="ml-3 text-sm font-medium text-white/80">
                  {xpProgress.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">Nivel {user.level}</span>
              <span className="text-xs text-amber-300/70">({levelTitle})</span>
            </div>

            {hasActiveBoost && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 animate-pulse">
                <Zap className="w-3 h-3 text-green-400" />
                <span className="text-xs font-bold text-green-400">x{user.xpMultiplier}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <Flame className={`w-5 h-5 ${user.streak > 0 ? 'text-orange-500 animate-pulse' : 'text-orange-500/50'}`} />
              <span className="font-bold text-orange-400">{user.streak}</span>
              {user.streakShield && (
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" title="Escudo activo" />
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400">{user.coins}</span>
            </div>

            <button
              onClick={() => setFocusModeOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-200"
            >
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="font-medium text-purple-300">Enfoque</span>
            </button>

            <button
              onClick={() => setStoreOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-200"
            >
              <Store className="w-5 h-5 text-pink-400" />
              <span className="font-medium text-pink-300">Tienda</span>
            </button>
          </div>
        </div>
      </div>

      {xpPopups.map((popup) => (
        <div
          key={popup.id}
          className="fixed pointer-events-none z-[100] animate-xp-float"
          style={{
            left: popup.x,
            top: popup.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span className="text-2xl font-bold text-green-400 drop-shadow-lg">
            +{popup.amount} XP
          </span>
        </div>
      ))}

      <style jsx>{`
        @keyframes xp-float {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1.5);
          }
        }
        .animate-xp-float {
          animation: xp-float 2s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
