import React, { useState } from 'react';
import { TabType, UserProfile } from '../types';
import { mysticAudio } from '../services/audioAmbience';

interface HeaderProps {
  currentTab: TabType;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenWidgets: () => void;
}

const TAB_TITLES: Record<TabType, string> = {
  inicio: 'Inicio',
  quiromancia: 'Quiromancia',
  tarot: 'Tarot Sagrado',
  astrologia: 'Astrología'
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  user,
  onOpenProfile,
  onOpenWidgets
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleToggleAudio = () => {
    const active = mysticAudio.toggle();
    setIsPlayingAudio(active);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-md pt-safe border-b border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="h-16 max-w-lg mx-auto px-4 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-gradient-to-tr from-indigo-900 to-purple-800 shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0">
            <span className="text-base select-none">🌙</span>
          </div>
          <div>
            <h1 className="font-serif italic text-[19px] font-bold text-[#D4AF37] leading-none mb-0.5 tracking-wide">
              {TAB_TITLES[currentTab]}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-sans">
              Sincronización Astral Activa
            </p>
          </div>
        </div>

        {/* Action icons & Profile */}
        <div className="flex items-center gap-2">
          {/* Ambient Sound Toggle */}
          <button
            id="ambient-sound-btn"
            onClick={handleToggleAudio}
            title={isPlayingAudio ? 'Silenciar frecuencia mística (432Hz)' : 'Activar sonido etéreo celestial'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isPlayingAudio
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-[#D4AF37]'
            }`}
          >
            {isPlayingAudio ? (
              <span className="material-symbols-outlined text-[18px] animate-pulse">graphic_eq</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">music_note</span>
            )}
          </button>

          {/* Widgets Shortcut */}
          <button
            id="widgets-btn"
            onClick={onOpenWidgets}
            title="Widgets para celular"
            className="w-9 h-9 rounded-full bg-white/5 text-gray-300 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-[#D4AF37] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">widgets</span>
          </button>

          {/* Profile Avatar Button */}
          <button
            id="user-profile-btn"
            onClick={onOpenProfile}
            className="relative group p-0.5 rounded-full ring-1 ring-[#D4AF37]/60 hover:ring-[#D4AF37] transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)] cursor-pointer"
            title="Perfil Místico & Lecturas Guardadas"
          >
            <img
              src={user.avatarUrl}
              alt={user.fullName || 'Perfil'}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#050208] rounded-full ${
                user.isGoogleAuth ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-[#D4AF37]'
              }`}
            ></span>
          </button>
        </div>
      </div>
    </header>
  );
};
