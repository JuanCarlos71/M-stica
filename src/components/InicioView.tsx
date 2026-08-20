import React, { useState } from 'react';
import { UserProfile, MoonPhaseInfo } from '../types';
import {
  calculateDailyEnergy,
  LIFE_PATH_DETAILS,
  EXPRESSION_DETAILS,
  SOUL_URGE_DETAILS
} from '../data/numerologyData';
import { ZODIAC_AFFIRMATIONS, getCurrentMoonPhase } from '../data/astrologyData';
import { mysticAudio } from '../services/audioAmbience';

interface InicioViewProps {
  user: UserProfile;
  onOpenSinastria: () => void;
  onOpenEditProfile: () => void;
  onShareItem: (title: string, text: string) => void;
  onNavigateTab: (tab: 'quiromancia' | 'tarot' | 'astrologia') => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  user,
  onOpenSinastria,
  onOpenEditProfile,
  onShareItem,
  onNavigateTab
}) => {
  const [selectedNumDetail, setSelectedNumDetail] = useState<{
    title: string;
    num: number;
    desc: string;
    keywords?: string[];
  } | null>(null);

  const dailyEnergy = calculateDailyEnergy();
  const moonPhase: MoonPhaseInfo = getCurrentMoonPhase();

  const userAffirmations =
    ZODIAC_AFFIRMATIONS[user.zodiacSign] || ZODIAC_AFFIRMATIONS['Leo'];
  const dailyAffirmation = userAffirmations[0];

  const lifePath = LIFE_PATH_DETAILS[user.lifePathNumber] || LIFE_PATH_DETAILS[7];
  const expression = EXPRESSION_DETAILS[user.expressionNumber] || EXPRESSION_DETAILS[11];
  const soulUrge = SOUL_URGE_DETAILS[user.soulUrgeNumber] || SOUL_URGE_DETAILS[4];

  const [copiedAffirmation, setCopiedAffirmation] = useState(false);

  const handleCopyAffirmation = () => {
    navigator.clipboard.writeText(`✨ Afirmación de ${user.zodiacSign}: "${dailyAffirmation}" — Celestial Alchemy`);
    setCopiedAffirmation(true);
    mysticAudio.playChime();
    setTimeout(() => setCopiedAffirmation(false), 2000);
  };

  return (
    <div className="flex flex-col w-full min-h-full pb-28">
      {/* Top Hero Section */}
      <div className="px-6 pt-4 pb-4 flex flex-col items-center text-center relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-950 to-purple-900 border border-[#D4AF37]/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(212,175,55,0.25)] animate-pulse">
          <span
            className="material-symbols-outlined text-[#D4AF37] text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] mb-1 font-medium">
          Tu Guía Astral & Cósmica
        </span>
        <h1 className="font-serif italic text-[28px] md:text-[32px] font-bold text-white tracking-tight mb-1">
          Tu Código Divino
        </h1>
        <div className="h-px w-12 bg-[#D4AF37] my-2 opacity-50"></div>
        <p className="font-sans text-[14px] text-gray-400 max-w-xs leading-relaxed italic">
          Descubre la frecuencia vibratoria oculta en tu fecha de nacimiento y nombre.
        </p>
      </div>

      {/* Número del Día Card */}
      <div className="px-5 mb-6">
        <div className="relative bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95]/10 to-transparent pointer-events-none"></div>
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-3xl group-hover:bg-[#D4AF37]/20 transition-all duration-700"></div>

          <div className="flex items-start justify-between relative z-10 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className="material-symbols-outlined text-[#D4AF37] text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  light_mode
                </span>
                <span className="font-sans text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
                  Número del Día
                </span>
              </div>
              <h2 className="font-serif italic text-[22px] font-semibold text-white mb-2 leading-snug">
                {dailyEnergy.title}
              </h2>
              <div className="h-px w-8 bg-[#D4AF37] my-2 opacity-40"></div>
              <p className="font-sans text-[13px] text-gray-300 leading-relaxed line-clamp-3 italic">
                "{dailyEnergy.description}"
              </p>
            </div>

            {/* Glowing Number Badge */}
            <div className="w-20 h-24 shrink-0 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/25 to-transparent rounded-2xl blur-md animate-pulse"></div>
              <div className="relative w-full h-full bg-[#050208]/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/50 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                <span className="font-serif italic text-[44px] font-bold text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.7)]">
                  {dailyEnergy.number}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 relative z-10 border-t border-white/10 flex justify-between items-center">
            <span className="font-sans text-[12px] text-gray-400 italic">
              ✦ {dailyEnergy.theme}
            </span>
            <button
              id="daily-number-expand-btn"
              onClick={() =>
                setSelectedNumDetail({
                  title: `Número del Día: ${dailyEnergy.number} — ${dailyEnergy.title}`,
                  num: dailyEnergy.number,
                  desc: `${dailyEnergy.description}\n\nConsejo Sagrado: ${dailyEnergy.advice}`,
                  keywords: [dailyEnergy.theme]
                })
              }
              className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
              title="Ver consejo sagrado"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Affirmation Card */}
      <div className="px-5 mb-6">
        <div className="bg-gradient-to-b from-[#0f0c1d] to-[#050208] backdrop-blur-md rounded-[32px] p-6 border border-white/10 flex flex-col gap-3 relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">
                Tu Guía Diaria • Signo {user.zodiacSign}
              </span>
            </div>
            <button
              onClick={handleCopyAffirmation}
              className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                {copiedAffirmation ? 'check' : 'content_copy'}
              </span>
              {copiedAffirmation ? 'Copiada' : 'Copiar'}
            </button>
          </div>
          <h3 className="font-serif italic text-[20px] text-white leading-tight">
            Afirmación de {user.zodiacSign}
          </h3>
          <div className="h-px w-12 bg-[#D4AF37] my-1 opacity-50"></div>
          <p className="font-serif italic text-[15px] text-gray-300 leading-relaxed">
            "{dailyAffirmation}"
          </p>
          <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-gray-400">
              Asc. {user.ascendant} • Luna {user.moonSign}
            </span>
            <button
              onClick={() => onShareItem(`Afirmación ${user.zodiacSign}`, dailyAffirmation)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] uppercase tracking-[0.2em] text-white transition-all flex items-center gap-1.5"
            >
              <span>Compartir</span>
              <span className="text-[#D4AF37]">✦</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tu Carta Numerológica Section */}
      <div className="px-5 mb-4 flex justify-between items-end">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] block mb-0.5">
            Geometría Sagrada
          </span>
          <h3 className="font-serif italic text-[22px] font-bold text-white">
            Tu Carta Numerológica
          </h3>
        </div>
        <button
          id="edit-numerology-data-btn"
          onClick={onOpenEditProfile}
          className="font-sans text-[10px] font-bold text-[#D4AF37] tracking-[0.2em] hover:brightness-125 transition-all uppercase px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10"
        >
          EDITAR DATOS
        </button>
      </div>

      <div className="px-5 grid grid-cols-1 gap-3.5 mb-6">
        {/* Camino de Vida */}
        <div
          id="num-card-life-path"
          onClick={() =>
            setSelectedNumDetail({
              title: 'Camino de Vida (Sendero Natal)',
              num: user.lifePathNumber,
              desc: lifePath.description,
              keywords: lifePath.keywords
            })
          }
          className="bg-white/5 backdrop-blur-md rounded-[28px] p-5 border border-white/10 flex items-center gap-4 hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        >
          <div className="w-14 h-16 rounded-2xl bg-gradient-to-br from-[#1a1630] to-[#050208] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-inner group-hover:border-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="font-serif italic text-[28px] font-bold text-[#D4AF37]">
              {user.lifePathNumber}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] block mb-0.5">Sendero Natal</span>
            <h4 className="font-serif italic text-[17px] font-semibold text-white mb-0.5">
              Camino de Vida
            </h4>
            <p className="font-sans text-[13px] text-gray-400 line-clamp-2 leading-relaxed">
              {lifePath.title}. {lifePath.description}
            </p>
          </div>
          <span className="material-symbols-outlined text-gray-500 group-hover:text-[#D4AF37] transition-colors">
            chevron_right
          </span>
        </div>

        {/* Destino (Expresión) */}
        <div
          id="num-card-expression"
          onClick={() =>
            setSelectedNumDetail({
              title: 'Destino / Número de Expresión',
              num: user.expressionNumber,
              desc: expression.description
            })
          }
          className="bg-white/5 backdrop-blur-md rounded-[28px] p-5 border border-white/10 flex items-center gap-4 hover:border-purple-400/50 hover:bg-white/10 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        >
          <div className="w-14 h-16 rounded-2xl bg-gradient-to-br from-[#1a1630] to-[#050208] flex items-center justify-center shrink-0 border border-purple-400/40 shadow-inner group-hover:border-purple-400 group-hover:shadow-[0_0_15px_rgba(192,132,252,0.3)]">
            <span className="font-serif italic text-[28px] font-bold text-purple-300">
              {user.expressionNumber}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] uppercase tracking-[0.2em] text-purple-300 block mb-0.5">Vibración de Nombre</span>
            <h4 className="font-serif italic text-[17px] font-semibold text-white mb-0.5">
              Destino (Expresión)
            </h4>
            <p className="font-sans text-[13px] text-gray-400 line-clamp-2 leading-relaxed">
              {expression.title}. {expression.description}
            </p>
          </div>
          <span className="material-symbols-outlined text-gray-500 group-hover:text-purple-300 transition-colors">
            chevron_right
          </span>
        </div>

        {/* Deseo del Alma */}
        <div
          id="num-card-soul-urge"
          onClick={() =>
            setSelectedNumDetail({
              title: 'Deseo del Alma (Impulso Íntimo)',
              num: user.soulUrgeNumber,
              desc: soulUrge.description
            })
          }
          className="bg-white/5 backdrop-blur-md rounded-[28px] p-5 border border-white/10 flex items-center gap-4 hover:border-[#D4AF37]/50 hover:bg-white/10 transition-all cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        >
          <div className="w-14 h-16 rounded-2xl bg-gradient-to-br from-[#1a1630] to-[#050208] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-inner group-hover:border-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="font-serif italic text-[28px] font-bold text-[#D4AF37]">
              {user.soulUrgeNumber}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] block mb-0.5">Impulso Íntimo</span>
            <h4 className="font-serif italic text-[17px] font-semibold text-white mb-0.5">
              Deseo del Alma
            </h4>
            <p className="font-sans text-[13px] text-gray-400 line-clamp-2 leading-relaxed">
              {soulUrge.title}. {soulUrge.description}
            </p>
          </div>
          <span className="material-symbols-outlined text-gray-500 group-hover:text-[#D4AF37] transition-colors">
            chevron_right
          </span>
        </div>
      </div>

      {/* Afinidad Numérica Banner */}
      <div className="px-5 mb-6">
        <div className="relative rounded-[32px] border border-white/10 overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Background Nebula & Mandala */}
          <div
            className="bg-cover bg-center w-full h-52 absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0UvV8_BcapsiAL7Eu4yyd7qsevyQ6jI4rLlFKU7zqxw0cZeGASf2EGnIDXgF2xjAcR7j82eKgDbmjbQqzoZ3zo--g5FnNkBgLX8azvhrjR2GFm6_FoSpEivfCjnN5p2nafYS2GqPul9GgVxA8s68vg3JB-SDbvBLsX9mqXtlamvlt_D8fqQDHA8nFpTru_onsQ_1eD9CCaY5zhbfkcw5mH7wJ_snnGo-7cxCmjPlJ8fXBNntPrg')"
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050208] via-[#050208]/85 to-[#050208]/60 backdrop-blur-[2px]"></div>

          <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[13rem]">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-sans text-[10px] font-bold border border-[#D4AF37]/40 mb-3 tracking-[0.2em] uppercase">
                ✦ SINASTRÍA
              </span>
              <h3 className="font-serif italic text-[24px] font-bold text-white mb-1">
                Afinidad Cósmica
              </h3>
              <p className="font-sans text-[13px] text-gray-300 max-w-[260px] leading-snug">
                Descubre con quién compartes resonancia vibratoria y sinastría estelar.
              </p>
            </div>

            <button
              id="calculate-synastry-btn"
              onClick={onOpenSinastria}
              className="mt-4 self-start bg-[#D4AF37] text-black font-sans text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition-all active:scale-95 cursor-pointer"
            >
              <span>CALCULAR SINASTRÍA</span>
              <span className="material-symbols-outlined text-[16px]">magic_button</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Moon Phase Card (Immersive Orb Aesthetic) */}
      <div className="px-5 mb-6">
        <div className="bg-gradient-to-b from-[#0f0c1d] to-[#050208] rounded-[32px] border border-white/10 p-6 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center p-1 shrink-0">
              <div className="w-full h-full rounded-full border border-[#D4AF37]/60 flex items-center justify-center animate-pulse bg-gradient-to-t from-black to-indigo-900/40 text-2xl">
                🌙
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Fase Lunar ({moonPhase.illumination}%)
                </span>
              </div>
              <h4 className="font-serif italic text-[18px] font-semibold text-white">
                {moonPhase.phaseName} en {moonPhase.moonSign}
              </h4>
              <p className="font-sans text-[12px] text-gray-400 line-clamp-1 italic">
                {moonPhase.spiritualMeaning}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('astrologia')}
            className="shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] hover:bg-white/10 transition-colors"
            title="Ver calendario astral"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Numerology Detail Modal */}
      {selectedNumDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5 animate-fadeIn">
          <div className="bg-[#0f0c1d] border border-white/15 rounded-[32px] p-6 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.9)] relative">
            <button
              onClick={() => setSelectedNumDetail(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-900 to-purple-800 border-2 border-[#D4AF37] mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <span className="font-serif italic text-3xl font-bold text-[#D4AF37]">
                {selectedNumDetail.num}
              </span>
            </div>

            <h3 className="font-serif italic text-xl font-bold text-white text-center mb-1">
              {selectedNumDetail.title}
            </h3>
            <div className="h-px w-12 bg-[#D4AF37] my-3 mx-auto opacity-50"></div>

            <p className="font-sans text-sm text-gray-300 leading-relaxed text-center mb-4 whitespace-pre-line">
              {selectedNumDetail.desc}
            </p>

            {selectedNumDetail.keywords && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                {selectedNumDetail.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/5 text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase border border-white/10"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                onShareItem(selectedNumDetail.title, selectedNumDetail.desc);
                setSelectedNumDetail(null);
              }}
              className="w-full bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[11px] hover:brightness-110 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              Compartir este Número
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
