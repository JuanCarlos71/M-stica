import React, { useState } from 'react';
import { UserProfile } from '../types';
import { calculateLifePathNumber, calculateSynastry } from '../data/numerologyData';
import { askMysticAI } from '../services/mysticAI';
import { mysticAudio } from '../services/audioAmbience';
import confetti from 'canvas-confetti';

interface SinastriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const SinastriaModal: React.FC<SinastriaModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [partnerName, setPartnerName] = useState('Alejandro');
  const [partnerBirthDate, setPartnerBirthDate] = useState('1994-11-12');
  const [result, setResult] = useState<{
    lifePath1: number;
    lifePath2: number;
    compatibilityScore: number;
    energyVibration: number;
    title: string;
    description: string;
    advice: string;
  } | null>(null);
  const [aiSynastry, setAiSynastry] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  if (!isOpen) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    mysticAudio.playChime();

    const partnerLifePath = calculateLifePathNumber(partnerBirthDate);
    const synastryData = calculateSynastry(currentUser.lifePathNumber, partnerLifePath);

    setResult({
      lifePath1: currentUser.lifePathNumber,
      lifePath2: partnerLifePath,
      ...synastryData
    });

    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f2ca50', '#dcb8ff', '#f687b3']
    });
  };

  const handleAskAI = async () => {
    if (!result) return;
    setIsLoadingAI(true);
    const reading = await askMysticAI({
      type: 'sinastria',
      prompt: `Analiza la sinastría y afinidad de pareja/vínculo entre ${currentUser.fullName} (Sendero ${result.lifePath1}) y ${partnerName} (Sendero ${result.lifePath2}). Porcentaje de compatibilidad: ${result.compatibilityScore}%.`,
      context: {
        person1: currentUser.fullName,
        person2: partnerName,
        score: result.compatibilityScore
      }
    });
    setAiSynastry(reading);
    setIsLoadingAI(false);
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

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 mx-auto flex items-center justify-center border border-[#D4AF37]/30 mb-3 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <span className="material-symbols-outlined text-[#D4AF37] text-2xl">favorite</span>
          </div>
          <h3 className="font-serif italic text-2xl font-bold text-white mb-1">
            Sinastría & Afinidad Numérica
          </h3>
          <p className="text-xs text-gray-400">
            Calcula la resonancia vibratoria y el contrato de almas entre dos personas.
          </p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-4 mb-6">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-1">
              Persona 1 (Tú)
            </div>
            <div className="text-sm font-semibold text-white">{currentUser.fullName}</div>
            <div className="text-xs text-gray-400">
              Sendero de Vida {currentUser.lifePathNumber} • {currentUser.zodiacSign}
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.2em]">
              Persona 2 (Vínculo a explorar)
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">Nombre</label>
              <input
                type="text"
                value={partnerName}
                onChange={e => setPartnerName(e.target.value)}
                placeholder="Nombre de la otra persona"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={partnerBirthDate}
                onChange={e => setPartnerBirthDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Calcular Afinidad Sagrada
          </button>
        </form>

        {/* Results display */}
        {result && (
          <div className="bg-white/5 p-5 rounded-[24px] border border-white/15 space-y-4 animate-fadeIn">
            <div className="text-center">
              <div className="text-4xl font-serif italic font-bold text-[#D4AF37] mb-1">
                {result.compatibilityScore}%
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-purple-300 font-bold">
                {result.title}
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 text-xs font-mono">
              <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 text-center">
                <span className="text-[#D4AF37] font-bold">Sendero {result.lifePath1}</span>
                <span className="block text-[10px] text-gray-400">{currentUser.fullName.split(' ')[0]}</span>
              </div>
              <span className="text-[#D4AF37] text-lg font-serif">✕</span>
              <div className="bg-white/5 px-3.5 py-2 rounded-xl border border-white/10 text-center">
                <span className="text-purple-300 font-bold">Sendero {result.lifePath2}</span>
                <span className="block text-[10px] text-gray-400">{partnerName.split(' ')[0]}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed text-center">
              {result.description}
            </p>

            <div className="bg-[#D4AF37]/10 p-3.5 rounded-2xl border border-[#D4AF37]/20 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] block mb-1">
                Consejo para la Armonía
              </span>
              <p className="text-xs italic text-gray-200">"{result.advice}"</p>
            </div>

            {aiSynastry ? (
              <div className="bg-purple-900/20 p-4 rounded-2xl border border-purple-500/30 text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                <div className="flex items-center gap-1.5 text-purple-300 font-bold uppercase tracking-wider text-[10px] mb-2">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Interpretación Gemini Oráculo
                </div>
                {aiSynastry}
              </div>
            ) : (
              <button
                onClick={handleAskAI}
                disabled={isLoadingAI}
                className="w-full bg-white/5 border border-purple-400/30 text-purple-300 font-bold uppercase tracking-wider py-3 rounded-2xl text-[10px] hover:bg-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  {isLoadingAI ? 'sync' : 'psychology'}
                </span>
                {isLoadingAI ? 'Consultando al Oráculo...' : 'Pedir Revelación Profunda a Gemini'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
