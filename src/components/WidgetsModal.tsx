import React, { useState } from 'react';
import { UserProfile, MoonPhaseInfo } from '../types';
import { getCurrentMoonPhase, ZODIAC_AFFIRMATIONS } from '../data/astrologyData';
import { calculateDailyEnergy } from '../data/numerologyData';
import { mysticAudio } from '../services/audioAmbience';
import confetti from 'canvas-confetti';

interface WidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const WidgetsModal: React.FC<WidgetsModalProps> = ({ isOpen, onClose, user }) => {
  const [selectedWidget, setSelectedWidget] = useState<'moon' | 'number' | 'affirmation'>('moon');
  const [isInstalled, setIsInstalled] = useState(false);

  if (!isOpen) return null;

  const moonPhase: MoonPhaseInfo = getCurrentMoonPhase();
  const dailyEnergy = calculateDailyEnergy();
  const affirmation = (ZODIAC_AFFIRMATIONS[user.zodiacSign] || ZODIAC_AFFIRMATIONS['Leo'])[0];

  const handleSimulatePinWidget = () => {
    mysticAudio.playChime();
    setIsInstalled(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f2ca50', '#dcb8ff']
    });
    setTimeout(() => setIsInstalled(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0c1d] border border-white/15 rounded-[32px] p-6 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto my-auto relative text-gray-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        <div className="text-center mb-5">
          <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
            Widgets para Pantalla de Inicio
          </span>
          <h3 className="font-serif italic text-2xl font-bold text-white mt-1">
            Artefactos Celestes
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Visualiza eventos astronómicos y tu vibración diaria directamente en tu celular.
          </p>
        </div>

        {/* Widget Type Selector */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-5">
          <button
            onClick={() => setSelectedWidget('moon')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedWidget === 'moon' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            🌙 Luna
          </button>
          <button
            onClick={() => setSelectedWidget('number')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedWidget === 'number' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔢 Número
          </button>
          <button
            onClick={() => setSelectedWidget('affirmation')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedWidget === 'affirmation' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            ✨ Afirmación
          </button>
        </div>

        {/* Widget Interactive Preview Mockup */}
        <div className="bg-black/40 p-5 rounded-3xl border border-white/10 mb-5 flex flex-col items-center">
          <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mb-3">
            Vista Previa en Pantalla de Celular (2x2)
          </span>

          {/* Moon Widget */}
          {selectedWidget === 'moon' && (
            <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-[#18112e] to-[#0a0714] border border-[#D4AF37]/50 p-4 flex flex-col justify-between shadow-[0_0_25px_rgba(212,175,55,0.2)]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider">
                  Luna en Vivo
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="flex items-center gap-3 my-auto">
                <div className="text-4xl">🌕</div>
                <div>
                  <div className="font-serif italic font-bold text-sm text-white">
                    {moonPhase.phaseName}
                  </div>
                  <div className="text-[11px] text-purple-300">Signo {moonPhase.moonSign}</div>
                  <div className="text-[10px] text-[#D4AF37] font-mono">
                    {moonPhase.illumination}% Iluminación
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-gray-400 italic border-t border-white/10 pt-1.5 line-clamp-1">
                {moonPhase.ritualAdvice}
              </div>
            </div>
          )}

          {/* Daily Number Widget */}
          {selectedWidget === 'number' && (
            <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-[#18112e] to-[#0a0714] border border-[#D4AF37]/50 p-4 flex flex-col justify-between shadow-[0_0_25px_rgba(212,175,55,0.2)]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider">
                  Vibración del Día
                </span>
                <span className="text-xs text-purple-300">✧</span>
              </div>
              <div className="flex items-center gap-3 my-auto">
                <div className="w-14 h-16 rounded-2xl bg-white/5 border border-[#D4AF37]/50 flex items-center justify-center font-serif text-3xl font-bold text-[#D4AF37] shadow-md">
                  {dailyEnergy.number}
                </div>
                <div>
                  <div className="font-serif italic font-bold text-sm text-white">
                    {dailyEnergy.title}
                  </div>
                  <div className="text-[10px] text-gray-400 line-clamp-2">
                    {dailyEnergy.theme}
                  </div>
                </div>
              </div>
              <div className="text-[9px] text-[#D4AF37] border-t border-white/10 pt-1.5 truncate">
                Consejo: {dailyEnergy.advice}
              </div>
            </div>
          )}

          {/* Affirmation Widget */}
          {selectedWidget === 'affirmation' && (
            <div className="w-56 h-56 rounded-3xl bg-gradient-to-br from-[#18112e] to-[#0a0714] border border-purple-500/50 p-4 flex flex-col justify-between shadow-[0_0_25px_rgba(168,85,247,0.2)]">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">
                  Afirmación {user.zodiacSign}
                </span>
                <span className="material-symbols-outlined text-[14px] text-purple-300">
                  auto_awesome
                </span>
              </div>
              <p className="font-serif italic text-xs text-white leading-relaxed my-auto line-clamp-4">
                "{affirmation}"
              </p>
              <div className="text-[9px] text-gray-400 border-t border-white/10 pt-1.5 flex justify-between">
                <span>Celestial Alchemy</span>
                <span>✧</span>
              </div>
            </div>
          )}
        </div>

        {isInstalled && (
          <div className="mb-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs p-3 rounded-2xl text-center font-semibold animate-fadeIn">
            ✓ Widget anclado a la pantalla de inicio exitosamente.
          </div>
        )}

        <button
          onClick={handleSimulatePinWidget}
          className="w-full bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">add_to_home_screen</span>
          Anclar Widget a Pantalla de Inicio
        </button>
      </div>
    </div>
  );
};
