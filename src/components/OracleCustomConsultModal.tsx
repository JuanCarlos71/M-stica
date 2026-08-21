import React, { useState } from 'react';
import { UserProfile, MysticConsultType } from '../types';
import { askMysticAI } from '../services/mysticAI';
import { mysticAudio } from '../services/audioAmbience';

interface OracleCustomConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  contextModule?: MysticConsultType;
  contextData?: any;
}

export const OracleCustomConsultModal: React.FC<OracleCustomConsultModalProps> = ({
  isOpen,
  onClose,
  user,
  contextModule = 'general' as MysticConsultType,
  contextData
}) => {
  const [question, setQuestion] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsConsulting(true);
    mysticAudio.playChime();

    try {
      const type: MysticConsultType = (contextModule as MysticConsultType) || 'general';
      const response = await askMysticAI({
        type,
        prompt: `Consulta personalizada del usuario ${user.fullName || 'Consultante'} (Signo: ${user.zodiacSign || 'No especificado'}): "${question}". Por favor analiza su duda integrando la sabiduría esotérica y brindando orientación espiritual práctica.`,
        context: contextData
      });
      setAnswer(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConsulting(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setAnswer(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-[32px] bg-gradient-to-b from-[#1c0e33] via-[#0e071a] to-[#050208] border border-[#D4AF37]/50 p-6 shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-900 to-indigo-800 border border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <span className="material-symbols-outlined text-[#D4AF37] text-2xl">
              auto_awesome
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
                Consulta Extraordinaria
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[9px] text-[#D4AF37] font-semibold">
                IA On-Demand
              </span>
            </div>
            <h3 className="font-serif italic text-xl font-bold text-white">
              Pregunta Libre al Oráculo
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Haz una pregunta específica sobre tu situación actual, proyectos, relaciones o encrucijadas. El oráculo inteligente interpretará tu duda en conexión con tus cartas y datos energéticos.
        </p>

        {!answer ? (
          <form onSubmit={handleConsult} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1.5">
                Formula tu Pregunta
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ejemplo: ¿Qué aspectos debo cuidar en mi nuevo trabajo este mes? ¿Cómo puedo superar este bloqueo con mi pareja?"
                rows={4}
                required
                className="w-full bg-black/60 border border-white/20 rounded-2xl p-3.5 text-xs text-white placeholder:text-gray-500 focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-[11px] text-gray-400 flex items-start gap-2">
              <span className="material-symbols-outlined text-purple-400 text-base shrink-0 mt-0.5">
                info
              </span>
              <span>
                <strong>Modo Híbrido:</strong> Esta consulta se procesa únicamente cuando tú la solicitas, optimizando el rendimiento y cuidando tus recursos.
              </span>
            </div>

            <button
              type="submit"
              disabled={isConsulting || !question.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-purple-600 hover:brightness-110 disabled:opacity-50 text-black font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              {isConsulting ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                  Canalizando Respuesta con el Oráculo...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">psychology</span>
                  Enviar Pregunta al Oráculo
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-black/50 border border-[#D4AF37]/40 rounded-2xl p-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                  Tu Pregunta
                </span>
                <span className="text-[10px] text-gray-400">
                  {user.fullName || 'Consultante'}
                </span>
              </div>
              <p className="text-xs text-gray-300 italic">"{question}"</p>
            </div>

            <div className="bg-gradient-to-b from-[#2a134a]/60 to-[#0d0714]/80 border border-purple-500/40 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2 text-purple-300 mb-2">
                <span className="material-symbols-outlined text-base">auto_awesome</span>
                <h4 className="font-serif italic font-bold text-sm">
                  Respuesta del Oráculo Celestial
                </h4>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                {answer}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Hacer otra pregunta
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-[#D4AF37] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
