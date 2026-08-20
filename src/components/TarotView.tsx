import React, { useState } from 'react';
import { UserProfile, TarotCard, DrawnCard, TarotSpread, SavedReading } from '../types';
import { MAJOR_ARCANA, TAROT_SPREADS } from '../data/tarotDeck';
import { askMysticAI } from '../services/mysticAI';
import { mysticAudio } from '../services/audioAmbience';
import confetti from 'canvas-confetti';

interface TarotViewProps {
  user: UserProfile;
  onSaveReading: (reading: SavedReading) => void;
  onShareReading: (title: string, summary: string) => void;
}

export const TarotView: React.FC<TarotViewProps> = ({
  user,
  onSaveReading,
  onShareReading
}) => {
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>(TAROT_SPREADS[0]);
  const [deck, setDeck] = useState<TarotCard[]>(MAJOR_ARCANA);
  const [isShuffling, setIsShuffling] = useState(false);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [flippedIndex, setFlippedIndex] = useState<Record<number, boolean>>({});
  const [activeCardModal, setActiveCardModal] = useState<DrawnCard | null>(null);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Shuffle deck
  const handleShuffle = () => {
    setIsShuffling(true);
    mysticAudio.playChime();
    setDrawnCards([]);
    setFlippedIndex({});
    setAiReading(null);

    setTimeout(() => {
      const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setIsShuffling(false);
      mysticAudio.playChime();
    }, 900);
  };

  // Draw card from fanned deck
  const handlePickCard = (card: TarotCard, index: number) => {
    if (drawnCards.length >= selectedSpread.cardCount) return;
    const isAlreadyPicked = drawnCards.some(d => d.card.id === card.id);
    if (isAlreadyPicked) return;

    mysticAudio.playChime();
    const posIndex = drawnCards.length;
    const pos = selectedSpread.positions[posIndex] || {
      name: `Posición ${posIndex + 1}`,
      meaning: 'Energía cósmica'
    };

    const isReversed = Math.random() > 0.75;
    const newDrawn: DrawnCard = {
      card,
      isReversed,
      positionName: pos.name,
      positionMeaning: pos.meaning
    };

    const updated = [...drawnCards, newDrawn];
    setDrawnCards(updated);
    setFlippedIndex(prev => ({ ...prev, [posIndex]: true }));

    if (updated.length === selectedSpread.cardCount) {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#dcb8ff', '#f2ca50', '#ffe088']
      });

      // Automatically record in user history
      onSaveReading({
        id: `tarot-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'tarot',
        title: `Tirada de Tarot: ${selectedSpread.name}`,
        summary: updated.map(d => `${d.positionName}: ${d.card.name}`).join(' • '),
        details: updated,
        cards: updated.map(d => d.card.name)
      });
    }
  };

  // Reset current spread
  const handleReset = () => {
    setDrawnCards([]);
    setFlippedIndex({});
    setAiReading(null);
  };

  // Ask Gemini AI for complete spread synthesis
  const handleRequestAISynthesis = async () => {
    if (drawnCards.length === 0) return;
    setIsLoadingAI(true);
    const reading = await askMysticAI({
      type: 'tarot',
      prompt: `Realiza una interpretación integral de la tirada de Tarot "${selectedSpread.name}". Las cartas extraídas son:\n` +
        drawnCards
          .map(
            d => `- ${d.positionName}: ${d.card.name} (${d.isReversed ? 'Invertida' : 'Al Derecho'}). Significado de posición: ${d.positionMeaning}`
          )
          .join('\n') +
        `\nConsultante: ${user.fullName || 'Iniciado'} (Signo ${user.zodiacSign}).`,
      context: {
        spread: selectedSpread.name,
        cards: drawnCards.map(d => d.card.name)
      }
    });
    setAiReading(reading);
    setIsLoadingAI(false);
  };

  const isSpreadComplete = drawnCards.length === selectedSpread.cardCount;

  return (
    <div className="flex flex-col w-full min-h-full pb-28 px-4 text-gray-200">
      {/* Header */}
      <div className="pt-4 pb-3 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
          Oráculo de los Arcanos Sagrados
        </span>
        <h2 className="font-serif italic text-[26px] font-bold text-white">
          El Espejo del Alma
        </h2>
        <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 italic">
          Formula tu pregunta con el corazón en calma y extrae las cartas sagradas.
        </p>
      </div>

      {/* Spread Selector Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none py-1">
        {TAROT_SPREADS.map(spread => {
          const isSelected = selectedSpread.id === spread.id;
          return (
            <button
              key={spread.id}
              onClick={() => {
                setSelectedSpread(spread);
                handleReset();
                mysticAudio.playChime();
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-sans uppercase tracking-wider font-semibold transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {spread.name}
            </button>
          );
        })}
      </div>

      {/* Spread Board Display */}
      <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-5 border border-white/10 mb-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif italic text-lg font-bold text-white">
              {selectedSpread.name}
            </h3>
            <p className="text-xs text-gray-400">
              {drawnCards.length} de {selectedSpread.cardCount} cartas elegidas
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShuffle}
              disabled={isShuffling}
              className="px-3.5 py-1.5 rounded-full bg-white/10 text-[#D4AF37] text-xs font-semibold hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isShuffling ? 'sync' : 'shuffle'}
              </span>
              {isShuffling ? 'Barajando...' : 'Barajar'}
            </button>
            {drawnCards.length > 0 && (
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-full bg-white/5 text-gray-400 text-xs hover:text-white transition-colors cursor-pointer"
              >
                Reiniciar
              </button>
            )}
          </div>
        </div>

        {/* Drawn Cards Layout Grid */}
        <div className={`grid gap-3.5 ${
          selectedSpread.cardCount === 1
            ? 'grid-cols-1 max-w-[200px] mx-auto'
            : selectedSpread.cardCount === 3
            ? 'grid-cols-3'
            : selectedSpread.cardCount === 5
            ? 'grid-cols-2 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-5'
        }`}>
          {selectedSpread.positions.map((pos, idx) => {
            const drawn = drawnCards[idx];
            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider text-center mb-1.5 line-clamp-1">
                  {pos.name}
                </span>

                {drawn ? (
                  /* Revealed Card */
                  <div
                    onClick={() => setActiveCardModal(drawn)}
                    className="relative w-full aspect-[2/3] rounded-2xl bg-gradient-to-b from-[#2a1b4e] to-[#0f0c1d] border border-[#D4AF37]/50 p-2.5 flex flex-col justify-between items-center text-center cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:scale-105 transition-all group"
                  >
                    <div className="w-full flex justify-between items-center text-[10px] text-[#D4AF37]">
                      <span>{drawn.card.number}</span>
                      <span>{drawn.card.symbol}</span>
                    </div>

                    <div className="text-3xl my-auto drop-shadow-md group-hover:scale-110 transition-transform">
                      {drawn.card.image}
                    </div>

                    <div className="w-full">
                      <div className="font-serif italic text-[11px] font-bold text-white line-clamp-1">
                        {drawn.card.name.split('(')[0]}
                      </div>
                      {drawn.isReversed && (
                        <span className="text-[9px] text-pink-400 font-bold uppercase">
                          Invertida
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Placeholder slot */
                  <div className="w-full aspect-[2/3] rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-center p-2">
                    <span className="material-symbols-outlined text-gray-500 text-2xl mb-1">
                      touch_app
                    </span>
                    <span className="text-[9px] text-gray-400 text-center">
                      Elige abajo
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Deck Fan (Cards to pick from) */}
      {!isSpreadComplete && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300 font-semibold">
              Mazo Sagrado (Toca una carta para revelarla)
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">
              {deck.length} Arcanos
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto py-3 px-2 bg-white/5 rounded-2xl border border-white/10 scrollbar-none">
            {deck.map((card, idx) => {
              const isSelected = drawnCards.some(d => d.card.id === card.id);
              if (isSelected) return null;
              return (
                <button
                  key={card.id}
                  onClick={() => handlePickCard(card, idx)}
                  className="shrink-0 w-16 aspect-[2/3] rounded-xl bg-gradient-to-b from-[#2a1b4e] to-[#0f0c1d] border border-white/15 flex flex-col items-center justify-between p-1.5 shadow-lg hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_15px_#D4AF37] transition-all cursor-pointer"
                >
                  <span className="text-[9px] text-[#D4AF37]">✦</span>
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <span className="material-symbols-outlined text-[#D4AF37] text-[12px]">
                      auto_awesome
                    </span>
                  </div>
                  <span className="text-[9px] text-[#D4AF37]">✦</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reading Interpretations & AI Synthesis when complete */}
      {isSpreadComplete && (
        <div className="space-y-4 animate-fadeIn">
          {/* AI Oracle Button or Text */}
          {aiReading ? (
            <div className="bg-white/5 border border-purple-500/40 rounded-[28px] p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-3 text-purple-300">
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                <h4 className="font-serif italic font-bold text-base">
                  Síntesis del Oráculo Celestial Gemini
                </h4>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                {aiReading}
              </p>
            </div>
          ) : (
            <button
              onClick={handleRequestAISynthesis}
              disabled={isLoadingAI}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-[#D4AF37]/20 to-purple-900/40 border border-[#D4AF37]/40 text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                {isLoadingAI ? 'sync' : 'psychology'}
              </span>
              {isLoadingAI
                ? 'Conectando con el plano de los arcanos...'
                : 'Revelar Interpretación Integral con Gemini AI'}
            </button>
          )}

          {/* Individual Card Interpretations List */}
          <div className="space-y-3">
            {drawnCards.map((drawn, idx) => (
              <div
                key={idx}
                onClick={() => setActiveCardModal(drawn)}
                className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#D4AF37]/40 transition-all cursor-pointer flex items-center gap-3.5"
              >
                <div className="w-12 h-16 rounded-xl bg-gradient-to-b from-[#2a1b4e] to-[#0f0c1d] border border-[#D4AF37]/40 flex flex-col items-center justify-center text-2xl shrink-0">
                  {drawn.card.image}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                      {drawn.positionName}
                    </span>
                    {drawn.isReversed && (
                      <span className="text-[9px] text-pink-400 font-bold uppercase">Invertida</span>
                    )}
                  </div>
                  <h4 className="font-serif italic font-bold text-sm text-white">
                    {drawn.card.name}
                  </h4>
                  <p className="text-xs text-gray-300 line-clamp-2 mt-0.5">
                    {drawn.isReversed ? drawn.card.reversedMeaning : drawn.card.uprightMeaning}
                  </p>
                </div>
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
              </div>
            ))}
          </div>

          {/* Share Action */}
          <button
            onClick={() =>
              onShareReading(
                `Tirada de Tarot: ${selectedSpread.name}`,
                drawnCards.map(d => `${d.positionName}: ${d.card.name}`).join(' | ') +
                  ` — "${drawnCards[0]?.card.spiritualAffirmation}"`
              )
            }
            className="w-full bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            Compartir Tirada
          </button>
        </div>
      )}

      {/* Card Detail Modal */}
      {activeCardModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#0f0c1d] border border-white/15 rounded-[32px] p-6 max-w-md w-full shadow-2xl relative my-auto">
            <button
              onClick={() => setActiveCardModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>

            <div className="text-center mb-4">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">
                {activeCardModal.positionName}
              </span>
              <div className="text-6xl my-2">{activeCardModal.card.image}</div>
              <h3 className="font-serif italic text-2xl font-bold text-white">
                {activeCardModal.card.name}
              </h3>
              <span className="text-xs text-purple-300 font-mono">
                {activeCardModal.isReversed ? '⚠️ Posición Invertida' : '✨ Posición Al Derecho'} • Regido por{' '}
                {activeCardModal.card.astrologicalRuler}
              </span>
            </div>

            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 mb-4 text-center">
              <span className="text-xs text-gray-300 italic">
                "{activeCardModal.positionMeaning}"
              </span>
            </div>

            <div className="space-y-3 text-xs text-gray-300 mb-4 leading-relaxed">
              <p>
                {activeCardModal.isReversed
                  ? activeCardModal.card.reversedMeaning
                  : activeCardModal.card.uprightMeaning}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 mb-5">
              {activeCardModal.card.keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-white/5 text-[#D4AF37] text-[10px] font-semibold border border-white/10 uppercase tracking-wider"
                >
                  {kw}
                </span>
              ))}
            </div>

            <div className="bg-gradient-to-b from-[#4c1d95]/20 to-transparent border border-purple-500/30 rounded-2xl p-4 mb-5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] block mb-1">
                Afirmación Sagrada
              </span>
              <p className="font-serif italic text-xs text-gray-200">
                "{activeCardModal.card.spiritualAffirmation}"
              </p>
            </div>

            <button
              onClick={() => {
                onShareReading(
                  `Arcano: ${activeCardModal.card.name}`,
                  `"${activeCardModal.card.spiritualAffirmation}" — ${activeCardModal.card.uprightMeaning}`
                );
                setActiveCardModal(null);
              }}
              className="w-full bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3 rounded-2xl text-[10px] hover:brightness-110 transition-colors cursor-pointer"
            >
              Compartir esta Carta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
