'use client';

import { useState } from 'react';
import { X, Zap, Shield, Coffee, Trophy, Check, Lock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { THEMES, POWERUPS, type Theme, type PowerUp } from '@/lib/types';

export default function StoreModal() {
  const {
    isStoreOpen,
    setStoreOpen,
    user,
    spendCoins,
    setTheme,
    unlockTheme,
    activateXPBoost,
    activateStreakShield,
    useRestDay,
    settings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'themes' | 'powerups'>('themes');
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isStoreOpen) return null;

  const handlePurchaseTheme = (theme: Theme) => {
    if (theme.isUnlocked || settings.theme === theme.id) {
      setTheme(theme.id);
      unlockTheme(theme.id);
      showMessage('success', `¡${theme.name} activado!`);
    } else if (user.coins >= theme.price) {
      spendCoins(theme.price);
      unlockTheme(theme.id);
      setTheme(theme.id);
      showMessage('success', `¡${theme.name} desbloqueado y activado!`);
    } else {
      showMessage('error', 'Coins insuficientes');
    }
  };

  const handlePurchasePowerUp = (powerUp: PowerUp) => {
    if (user.coins < powerUp.price) {
      showMessage('error', 'Coins insuficientes');
      return;
    }

    switch (powerUp.id) {
      case 'double_xp':
        activateXPBoost();
        showMessage('success', '¡Doble XP activado por 1 hora!');
        break;
      case 'streak_shield':
        activateStreakShield();
        showMessage('success', '¡Escudo de racha activado!');
        break;
      case 'rest_day':
        useRestDay();
        showMessage('success', '¡Día libre activado!');
        break;
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setPurchaseMessage({ type, text });
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  const currentTheme = THEMES.find((t) => t.id === settings.theme);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setStoreOpen(false)} />

      <div className="relative w-full max-w-4xl max-h-[90vh] glass-card overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">StorePlay</h2>
              <p className="text-sm text-white/50">Personaliza tu experiencia</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-yellow-400">{user.coins}</span>
            </div>
            <button
              onClick={() => setStoreOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white/60" />
            </button>
          </div>
        </div>

        {purchaseMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl ${
            purchaseMessage.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {purchaseMessage.text}
          </div>
        )}

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'themes'
                ? 'text-primary border-b-2 border-primary'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Temas Visuales
          </button>
          <button
            onClick={() => setActiveTab('powerups')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'powerups'
                ? 'text-primary border-b-2 border-primary'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Power-ups
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'themes' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {THEMES.map((theme) => {
                const isActive = settings.theme === theme.id;
                const isUnlocked = theme.isUnlocked || currentTheme?.id === theme.id || user.coins >= theme.price;

                return (
                  <div
                    key={theme.id}
                    onClick={() => handlePurchaseTheme(theme)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.backgroundColor}aa)`,
                    }}
                  >
                    <div className="h-32 rounded-lg mb-4 relative overflow-hidden" style={{ backgroundColor: theme.backgroundColor }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-16 h-16 rounded-full blur-xl"
                          style={{ backgroundColor: theme.primaryColor, opacity: 0.5 }}
                        />
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <div className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}>
                          {theme.name}
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <div className="p-1 bg-primary rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      {!isUnlocked && !isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Lock className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{theme.name}</span>
                      {theme.price > 0 && !isUnlocked && !isActive ? (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Trophy className="w-4 h-4" />
                          {theme.price}
                        </span>
                      ) : (
                        <span className="text-green-400 text-sm">
                          {isActive ? 'Activo' : 'Gratis'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {POWERUPS.map((powerUp) => {
                const isAffordable = user.coins >= powerUp.price;

                return (
                  <div
                    key={powerUp.id}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      {powerUp.id === 'double_xp' && <Zap className="w-8 h-8 text-yellow-400" />}
                      {powerUp.id === 'streak_shield' && <Shield className="w-8 h-8 text-blue-400" />}
                      {powerUp.id === 'rest_day' && <Coffee className="w-8 h-8 text-green-400" />}
                    </div>

                    <h3 className="text-lg font-bold text-white text-center mb-2">{powerUp.name}</h3>
                    <p className="text-sm text-white/60 text-center mb-4">{powerUp.description}</p>

                    <button
                      onClick={() => handlePurchasePowerUp(powerUp)}
                      disabled={!isAffordable}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        isAffordable
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4" />
                        {powerUp.price}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Gana coins estudiando y completando quizzes</span>
            <div className="flex items-center gap-2 text-yellow-400">
              <Trophy className="w-4 h-4" />
              <span>Tu balance: {user.coins}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
