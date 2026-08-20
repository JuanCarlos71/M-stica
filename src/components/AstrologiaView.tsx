import React, { useState } from 'react';
import { UserProfile, NatalChart, SavedReading } from '../types';
import { calculateFullNatalChart, CELESTIAL_EVENTS, ZODIAC_SIGNS } from '../data/astrologyData';
import { askMysticAI } from '../services/mysticAI';
import { downloadCalendarICS, openGoogleCalendarEvent } from '../services/calendarExporter';
import { mysticAudio } from '../services/audioAmbience';
import confetti from 'canvas-confetti';

interface AstrologiaViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onSaveReading: (reading: SavedReading) => void;
  onShareReading: (title: string, summary: string) => void;
  onExportPDF: (chart: NatalChart) => void;
}

export const AstrologiaView: React.FC<AstrologiaViewProps> = ({
  user,
  onUpdateUser,
  onSaveReading,
  onShareReading,
  onExportPDF
}) => {
  const [fullName, setFullName] = useState(user.fullName || 'Luna Silva');
  const [birthDate, setBirthDate] = useState(user.birthDate || '1996-07-24');
  const [birthTime, setBirthTime] = useState(user.birthTime || '14:30');
  const [birthPlace, setBirthPlace] = useState(user.birthPlace || 'Santiago, Chile');
  const [isCalculated, setIsCalculated] = useState(true);
  const [activePlanet, setActivePlanet] = useState<any | null>(null);
  const [aiAstrologyReading, setAiAstrologyReading] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const natalChart: NatalChart = calculateFullNatalChart(
    fullName,
    birthDate,
    birthTime,
    birthPlace
  );

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    mysticAudio.playChime();

    onUpdateUser({
      fullName,
      birthDate,
      birthTime,
      birthPlace,
      zodiacSign: natalChart.sunSign,
      moonSign: natalChart.moonSign,
      ascendant: natalChart.ascendantSign
    });

    setIsCalculated(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f2ca50', '#dcb8ff', '#ffe088']
    });

    onSaveReading({
      id: `natal-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'astrologia',
      title: `Carta Astral: ${fullName}`,
      summary: `Sol en ${natalChart.sunSign}, Luna en ${natalChart.moonSign}, Ascendente en ${natalChart.ascendantSign}`,
      details: natalChart,
      zodiac: natalChart.sunSign
    });
  };

  const handleRequestAIAstrology = async () => {
    setIsLoadingAI(true);
    const reading = await askMysticAI({
      type: 'astrologia',
      prompt: `Interpreta a fondo la carta natal de ${fullName}: Sol en ${natalChart.sunSign}, Luna en ${natalChart.moonSign}, Ascendente en ${natalChart.ascendantSign}. Elemento dominante: ${natalChart.dominantElement}.`,
      context: {
        sunSign: natalChart.sunSign,
        moonSign: natalChart.moonSign,
        ascendant: natalChart.ascendantSign
      }
    });
    setAiAstrologyReading(reading);
    setIsLoadingAI(false);
  };

  return (
    <div className="flex flex-col w-full min-h-full pb-28 text-gray-200 relative overflow-hidden">
      {/* Background Rotating Zodiac Circle */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-center justify-center overflow-hidden">
        <svg
          className="w-[150%] max-w-[800px] aspect-square animate-spin-slow"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" fill="none" r="95" stroke="#99907c" strokeDasharray="2 4" strokeWidth="0.5"></circle>
          <circle cx="100" cy="100" fill="none" r="75" stroke="#99907c" strokeWidth="0.2"></circle>
          <g fill="none" stroke="#D4AF37" strokeWidth="0.5">
            <path d="M100 5 L100 15 M100 185 L100 195 M5 100 L15 100 M185 100 L195 100"></path>
            <path d="M33 33 L40 40 M167 167 L160 160 M167 33 L160 40 M33 167 L40 160"></path>
          </g>
        </svg>
      </div>

      <div className="relative z-10 px-5 pt-4">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] block mb-1">
            Bóveda Celeste & Efemérides
          </span>
          <h1 className="font-serif italic text-[28px] md:text-[32px] font-bold text-white mb-1.5">
            Desvela tu Destino
          </h1>
          <p className="font-sans text-xs text-gray-400 max-w-sm mx-auto leading-relaxed italic">
            Introduce tus datos natales para calcular tu carta astral y mapa estelar con precisión astronómica.
          </p>
        </div>

        {/* Natal Form Container */}
        <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 shadow-2xl relative overflow-hidden border border-white/10 mb-8">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#D4AF37]/40 rounded-tl-[32px] pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#D4AF37]/40 rounded-tr-[32px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#D4AF37]/40 rounded-bl-[32px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#D4AF37]/40 rounded-br-[32px] pointer-events-none"></div>

          <form onSubmit={handleCalculate} className="space-y-5 flex flex-col">
            {/* Full Name */}
            <div className="relative group">
              <label
                className="block font-sans text-[10px] font-bold text-[#D4AF37] mb-1.5 uppercase tracking-[0.2em]"
                htmlFor="fullNameInput"
              >
                Nombre Completo
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-0 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                  person
                </span>
                <input
                  id="fullNameInput"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ej. Luna Silva"
                  className="w-full bg-transparent border-b border-white/15 py-2 pl-8 pr-2 text-white font-sans text-base focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div className="relative group">
                <label
                  className="block font-sans text-[10px] font-bold text-[#D4AF37] mb-1.5 uppercase tracking-[0.2em]"
                  htmlFor="birthDateInput"
                >
                  Fecha de Nacimiento
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-0 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                    calendar_month
                  </span>
                  <input
                    id="birthDateInput"
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full bg-transparent border-b border-white/15 py-2 pl-8 pr-1 text-white font-sans text-sm focus:outline-none focus:border-[#D4AF37] transition-colors [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              {/* Time of Birth */}
              <div className="relative group">
                <label
                  className="block font-sans text-[10px] font-bold text-[#D4AF37] mb-1.5 uppercase tracking-[0.2em]"
                  htmlFor="birthTimeInput"
                >
                  Hora Exacta
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-0 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                    schedule
                  </span>
                  <input
                    id="birthTimeInput"
                    type="time"
                    value={birthTime}
                    onChange={e => setBirthTime(e.target.value)}
                    className="w-full bg-transparent border-b border-white/15 py-2 pl-8 pr-1 text-white font-sans text-sm focus:outline-none focus:border-[#D4AF37] transition-colors [color-scheme:dark]"
                    required
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 italic mt-[-8px]">
              * La hora exacta es crucial para calcular el Ascendente y las 12 casas.
            </p>

            {/* Place of Birth */}
            <div className="relative group">
              <label
                className="block font-sans text-[10px] font-bold text-[#D4AF37] mb-1.5 uppercase tracking-[0.2em]"
                htmlFor="birthPlaceInput"
              >
                Lugar de Nacimiento
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-0 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors">
                  location_on
                </span>
                <input
                  id="birthPlaceInput"
                  type="text"
                  value={birthPlace}
                  onChange={e => setBirthPlace(e.target.value)}
                  placeholder="Ciudad, País"
                  className="w-full bg-transparent border-b border-white/15 py-2 pl-8 pr-2 text-white font-sans text-base focus:outline-none focus:border-[#D4AF37] transition-colors placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="calculate-astral-chart-btn"
              type="submit"
              className="mt-6 w-full relative group overflow-hidden rounded-2xl bg-[#D4AF37] text-black font-sans uppercase tracking-[0.2em] text-xs py-4 px-6 flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer font-bold"
            >
              <span className="relative z-10">Calcular mi Mapa Estelar</span>
              <span className="material-symbols-outlined relative z-10 text-xl">
                auto_awesome
              </span>
            </button>
          </form>
        </div>

        {/* Natal Chart Wheel & Astral Revelations */}
        {isCalculated && natalChart && (
          <div className="space-y-7 animate-fadeIn">
            {/* Tríada Cósmica Highlights */}
            <div className="grid grid-cols-3 gap-3">
              {/* Sol */}
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 text-center shadow-lg">
                <div className="text-2xl mb-1">☀️</div>
                <div className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider">Sol Natal</div>
                <div className="font-serif italic font-bold text-base text-white">
                  {natalChart.sunSign}
                </div>
                <div className="text-[9px] text-gray-400">Esencia y Propósito</div>
              </div>

              {/* Luna */}
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 text-center shadow-lg">
                <div className="text-2xl mb-1">🌙</div>
                <div className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">Luna Natal</div>
                <div className="font-serif italic font-bold text-base text-white">
                  {natalChart.moonSign}
                </div>
                <div className="text-[9px] text-gray-400">Mundo Emocional</div>
              </div>

              {/* Ascendente */}
              <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 text-center shadow-lg">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-[9px] font-bold text-amber-200 uppercase tracking-wider">Ascendente</div>
                <div className="font-serif italic font-bold text-base text-white">
                  {natalChart.ascendantSign}
                </div>
                <div className="text-[9px] text-gray-400">Vehículo & Proyección</div>
              </div>
            </div>

            {/* Interactive Natal Chart SVG Wheel */}
            <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 shadow-2xl flex flex-col items-center">
              <h3 className="font-serif italic text-xl font-bold text-white mb-1">
                Rueda de la Carta Astral
              </h3>
              <p className="text-xs text-gray-400 mb-4 text-center">
                Toca cualquier planeta para examinar su aspecto e interpretación.
              </p>

              {/* SVG Natal Chart */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  {/* Outer Zodiac Ring */}
                  <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2"></circle>
                  <circle cx="150" cy="150" r="115" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"></circle>
                  <circle cx="150" cy="150" r="85" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"></circle>
                  <circle cx="150" cy="150" r="50" fill="#0f0c1d" stroke="#D4AF37" strokeWidth="1.5"></circle>

                  {/* 12 House Dividing lines */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const x1 = 150 + 50 * Math.cos(angle);
                    const y1 = 150 + 50 * Math.sin(angle);
                    const x2 = 150 + 140 * Math.cos(angle);
                    const y2 = 150 + 140 * Math.sin(angle);
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="rgba(255,255,255,0.1)"
                        strokeDasharray={i % 3 === 0 ? 'none' : '2 3'}
                        strokeWidth={i % 3 === 0 ? '1.5' : '0.5'}
                      />
                    );
                  })}

                  {/* Aspect Lines between Planets */}
                  <line x1="100" y1="100" x2="200" y2="180" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />
                  <line x1="120" y1="210" x2="190" y2="90" stroke="#c084fc" strokeWidth="1" opacity="0.6" />
                  <line x1="80" y1="140" x2="220" y2="140" stroke="#68d391" strokeWidth="1" opacity="0.6" />

                  {/* Zodiac Symbols around outer rim */}
                  {ZODIAC_SIGNS.map((sign, i) => {
                    const angle = ((i * 30 + 15) * Math.PI) / 180;
                    const x = 150 + 128 * Math.cos(angle);
                    const y = 150 + 128 * Math.sin(angle);
                    return (
                      <text
                        key={sign.name}
                        x={x}
                        y={y}
                        fill="#9ca3af"
                        fontSize="11"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {sign.symbol}
                      </text>
                    );
                  })}

                  {/* Planetary Markers */}
                  {natalChart.planets.map((planet, i) => {
                    const angle = ((i * 27.5 + 10) * Math.PI) / 180;
                    const x = 150 + 98 * Math.cos(angle);
                    const y = 150 + 98 * Math.sin(angle);
                    const isSelected = activePlanet?.planet === planet.planet;

                    return (
                      <g
                        key={planet.planet}
                        onClick={() => {
                          setActivePlanet(planet);
                          mysticAudio.playChime();
                        }}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 11 : 9}
                          fill={isSelected ? '#D4AF37' : '#1e1b4b'}
                          stroke={isSelected ? '#fef08a' : '#a855f7'}
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y={y}
                          fill={isSelected ? '#000000' : '#D4AF37'}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          {planet.symbol}
                        </text>
                      </g>
                    );
                  })}

                  {/* Center Sun Disc */}
                  <text
                    x="150"
                    y="150"
                    fill="#D4AF37"
                    fontSize="18"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    ✧
                  </text>
                </svg>
              </div>

              {/* Selected Planet Card */}
              {activePlanet ? (
                <div className="w-full mt-4 bg-white/5 p-4 rounded-2xl border border-white/10 animate-fadeIn">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-[#D4AF37] font-bold">{activePlanet.symbol}</span>
                      <h4 className="font-serif italic font-bold text-base text-white">
                        {activePlanet.planet} en {activePlanet.sign} (Casa {activePlanet.house})
                      </h4>
                    </div>
                    <button
                      onClick={() => setActivePlanet(null)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {activePlanet.description}
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 mt-3 italic">
                  Toca un glifo planetario (☉, ☽, ☿, ♀, ♂...) para abrir su informe.
                </div>
              )}
            </div>

            {/* Elemental Balance Bars */}
            <div className="bg-white/5 rounded-[32px] p-5 border border-white/10">
              <h4 className="font-serif italic text-base font-bold text-white mb-3">
                Equilibrio de los 4 Elementos
              </h4>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-400 font-semibold">🔥 Fuego (Acción, Pasión)</span>
                    <span className="text-gray-400">{natalChart.elementBalance.fuego * 20}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${natalChart.elementBalance.fuego * 20}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-semibold">🌱 Tierra (Solidez, Materialización)</span>
                    <span className="text-gray-400">{natalChart.elementBalance.tierra * 20}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${natalChart.elementBalance.tierra * 20}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-300 font-semibold">💨 Aire (Intelecto, Social)</span>
                    <span className="text-gray-400">{natalChart.elementBalance.aire * 20}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${natalChart.elementBalance.aire * 20}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sky-400 font-semibold">🌊 Agua (Emoción, Intuición)</span>
                    <span className="text-gray-400">{natalChart.elementBalance.agua * 20}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400"
                      style={{ width: `${natalChart.elementBalance.agua * 20}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Deep Astrology Analysis */}
            {aiAstrologyReading ? (
              <div className="bg-white/5 border border-purple-500/40 rounded-[28px] p-5 shadow-2xl animate-fadeIn">
                <div className="flex items-center gap-2 mb-3 text-purple-300">
                  <span className="material-symbols-outlined text-xl">auto_awesome</span>
                  <h4 className="font-serif italic font-bold text-base">
                    Dictamen Astrológico de Gemini AI
                  </h4>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                  {aiAstrologyReading}
                </p>
              </div>
            ) : (
              <button
                onClick={handleRequestAIAstrology}
                disabled={isLoadingAI}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-[#D4AF37]/20 to-purple-900/40 border border-[#D4AF37]/40 text-[#D4AF37] font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {isLoadingAI ? 'sync' : 'psychology'}
                </span>
                {isLoadingAI
                  ? 'Calculando efemérides con Gemini...'
                  : 'Revelar Misión del Alma con Gemini AI'}
              </button>
            )}

            {/* Real-time Astronomical Events Calendar */}
            <div className="bg-white/5 rounded-[32px] p-5 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-serif italic text-lg font-bold text-white">
                    Calendario Astronómico en Tiempo Real
                  </h4>
                  <p className="text-xs text-gray-400">
                    Sincroniza eventos celestiales con tu agenda personal.
                  </p>
                </div>
                <button
                  onClick={() => downloadCalendarICS(CELESTIAL_EVENTS)}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 text-[#D4AF37] border border-white/15 text-xs font-semibold hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Descargar archivo .ics para Outlook / Apple Calendar"
                >
                  <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                  Exportar .ICS
                </button>
              </div>

              <div className="space-y-3">
                {CELESTIAL_EVENTS.map(evt => (
                  <div
                    key={evt.id}
                    className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#D4AF37] font-mono">{evt.date}</span>
                        <h5 className="font-serif italic font-bold text-xs text-white">
                          {evt.title}
                        </h5>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{evt.description}</p>
                    </div>
                    <button
                      onClick={() => openGoogleCalendarEvent(evt)}
                      className="shrink-0 text-xs text-purple-300 hover:text-white flex items-center gap-0.5 border border-white/15 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      title="Agregar a Google Calendar"
                    >
                      <span className="material-symbols-outlined text-[14px]">event</span>
                      Google
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Share & PDF */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  onShareReading(
                    `Carta Astral de ${fullName}`,
                    `Sol en ${natalChart.sunSign} • Luna en ${natalChart.moonSign} • Ascendente en ${natalChart.ascendantSign}. Elemento: ${natalChart.dominantElement}.`
                  )
                }
                className="bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:brightness-110 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                Compartir Carta
              </button>
              <button
                onClick={() => onExportPDF(natalChart)}
                className="bg-white/10 text-white border border-white/15 font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:bg-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                Descargar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
