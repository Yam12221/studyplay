'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Shield, Coffee, Trophy, Check, Lock, Eye, EyeOff } from 'lucide-react';
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
    unlockedThemes,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'themes' | 'powerups'>('themes');
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [originalThemeId] = useState(settings.theme);

  // Al cerrar, si estamos en preview, restauramos el original después de 10 segundos
  const handleClose = () => {
    if (previewThemeId) {
      setTimeout(() => {
        setTheme(originalThemeId);
        setPreviewThemeId(null);
      }, 10000);
    }
    setStoreOpen(false);
  };

  const handlePurchaseTheme = (theme: Theme) => {
    const isAlreadyUnlocked = unlockedThemes.includes(theme.id);

    if (isAlreadyUnlocked) {
      setTheme(theme.id);
      setPreviewThemeId(null);
      showMessage('success', `¡${theme.name} activado!`);
    } else if (user.coins >= theme.price) {
      spendCoins(theme.price);
      unlockTheme(theme.id);
      setTheme(theme.id);
      setPreviewThemeId(null);
      showMessage('success', `¡${theme.name} desbloqueado y activado!`);
    } else {
      showMessage('error', 'Coins insuficientes');
    }
  };

  const handlePreview = (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation();
    if (previewThemeId === themeId) {
      setPreviewThemeId(null);
      setTheme(originalThemeId);
    } else {
      setPreviewThemeId(themeId);
      setTheme(themeId);
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

  if (!isStoreOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

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
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white/60" />
            </button>
          </div>
        </div>

        {purchaseMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl animate-in fade-in slide-in-from-top-2 ${
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
                const isOwned = unlockedThemes.includes(theme.id);
                const isActive = settings.theme === theme.id && !previewThemeId;
                const isPreviewing = previewThemeId === theme.id;
                
                return (
                  <div
                    key={theme.id}
                    onClick={() => handlePurchaseTheme(theme)}
                    className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      isActive
                        ? 'border-primary bg-primary/10'
                        : isPreviewing
                        ? 'border-yellow-500 bg-yellow-500/10 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="h-32 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: theme.backgroundColor }}>
                      <div className="absolute inset-0 opacity-50" style={{ 
                        background: `radial-gradient(circle at center, ${theme.primaryColor}33 0%, transparent 70%)` 
                      }} />
                      
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full blur-xl animate-pulse" style={{ backgroundColor: theme.primaryColor }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{theme.animationType}</span>
                      </div>

                      {/* Botón de Vista Previa */}
                      {!isOwned && (
                        <button
                          onClick={(e) => handlePreview(e, theme.id)}
                          className={`absolute bottom-2 right-2 p-2 rounded-lg backdrop-blur-md transition-all ${
                            isPreviewing ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                          title="Vista Previa"
                        >
                          {isPreviewing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}

                      {isActive && (
                        <div className="absolute top-2 right-2 p-1.5 bg-primary rounded-full shadow-lg">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      {!isOwned && !isPreviewing && (
                        <div className="absolute top-2 left-2 p-1.5 bg-black/40 rounded-full backdrop-blur-sm">
                          <Lock className="w-3 h-3 text-white/40" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div>
                        <h4 className="text-white font-bold">{theme.name}</h4>
                        <p className="text-[10px] text-white/40 uppercase font-medium">{isPreviewing ? 'Previsualizando' : isOwned ? 'En propiedad' : 'Bloqueado'}</p>
                      </div>
                      <div className="text-right">
                        {isOwned ? (
                          <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-green-400'}`}>
                            {isActive ? 'ACTIVO' : 'USAR'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-400 font-black">
                            <Trophy className="w-3 h-3" />
                            <span>{theme.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {POWERUPS.map((powerUp) => {
                const isAffordable = user.coins >= powerUp.price;

                return (
                  <div
                    key={powerUp.id}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center group hover:bg-white/10 transition-all"
                  >
                    <div className="w-20 h-20 mb-4 rounded-3xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center group-hover:scale-110 transition-transform">
                      {powerUp.id === 'double_xp' && <Zap className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />}
                      {powerUp.id === 'streak_shield' && <Shield className="w-10 h-10 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />}
                      {powerUp.id === 'rest_day' && <Coffee className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{powerUp.name}</h3>
                    <p className="text-sm text-white/50 mb-6 leading-relaxed">{powerUp.description}</p>

                    <button
                      onClick={() => handlePurchasePowerUp(powerUp)}
                      disabled={!isAffordable}
                      className={`w-full py-3 rounded-xl font-bold transition-all ${
                        isAffordable
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20'
                          : 'bg-white/10 text-white/20 cursor-not-allowed'
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

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-white/40 font-medium">✨ Los temas desbloqueados se guardan en tu cuenta permanentemente</span>
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full border border-yellow-400/20">
              <Trophy className="w-3.5 h-3.5" />
              <span className="font-bold tracking-tight">Coins: {user.coins}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
