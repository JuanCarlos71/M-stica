import React, { useState, useMemo } from 'react';
import { UserProfile, SavedReading } from '../types';
import {
  PYTHAGOREAN_TABLE,
  LIFE_PATH_DETAILS,
  EXPRESSION_DETAILS,
  SOUL_URGE_DETAILS,
  PERSONALITY_DETAILS,
  MATURITY_DETAILS,
  PERSONAL_YEAR_DETAILS,
  getLetterValues,
  calculateLifePath,
  calculateNameNumbers,
  calculatePersonalYear,
  calculateMaturityNumber,
  calculateDailyEnergy,
  calculateNumerologySynastry,
  reduceToSingleDigitOrMaster
} from '../data/numerologyData';
import { mysticAudio } from '../services/audioAmbience';

interface NumerologiaViewProps {
  user: UserProfile;
  onSaveReading: (reading: Omit<SavedReading, 'id' | 'date'>) => void;
  onShare: (title: string, text: string) => void;
  onOpenProfile: () => void;
}

type SubTab = 'blueprint' | 'tabla' | 'ciclos' | 'calculadora' | 'sinastria' | 'oraculo';

export const NumerologiaView: React.FC<NumerologiaViewProps> = ({
  user,
  onSaveReading,
  onShare,
  onOpenProfile
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('blueprint');
  const [selectedNumberDetail, setSelectedNumberDetail] = useState<{
    title: string;
    num: number;
    category: string;
    description: string;
    keywords?: string[];
    advice?: string;
  } | null>(null);

  // Custom calculator state
  const [calcName, setCalcName] = useState('');
  const [calcBirthDate, setCalcBirthDate] = useState('');
  const [calcResult, setCalcResult] = useState<{
    lifePath: number;
    expression: number;
    soulUrge: number;
    personality: number;
    maturity: number;
  } | null>(null);

  // Synastry state
  const [synName1, setSynName1] = useState(user.fullName);
  const [synDate1, setSynDate1] = useState(user.birthDate);
  const [synName2, setSynName2] = useState('');
  const [synDate2, setSynDate2] = useState('');
  const [synastryResult, setSynastryResult] = useState<ReturnType<typeof calculateNumerologySynastry> | null>(null);

  // Oracle channeling state
  const [oracleQuestion, setOracleQuestion] = useState('');
  const [isChanneling, setIsChanneling] = useState(false);
  const [channeledMessage, setChanneledMessage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculated Core Numbers for current user
  const userLifePath = useMemo(() => calculateLifePath(user.birthDate), [user.birthDate]);
  const userNameNums = useMemo(() => calculateNameNumbers(user.fullName), [user.fullName]);
  const userPersonalYear = useMemo(() => calculatePersonalYear(user.birthDate), [user.birthDate]);
  const userMaturity = useMemo(
    () => calculateMaturityNumber(userLifePath, userNameNums.expression),
    [userLifePath, userNameNums.expression]
  );
  const userLetterBreakdown = useMemo(() => getLetterValues(user.fullName), [user.fullName]);
  const dailyEnergy = useMemo(() => calculateDailyEnergy(), []);

  // Life Path step breakdown
  const lifePathBreakdown = useMemo(() => {
    if (!user.birthDate) return { day: 0, month: 0, year: 0, sum: 0 };
    const parts = user.birthDate.split('-').map(Number);
    if (parts.length < 3) return { day: 0, month: 0, year: 0, sum: 0 };
    const [y, m, d] = parts;
    const redD = reduceToSingleDigitOrMaster(d);
    const redM = reduceToSingleDigitOrMaster(m);
    const redY = reduceToSingleDigitOrMaster(y.toString().split('').reduce((a, b) => a + Number(b), 0));
    return {
      day: redD,
      month: redM,
      year: redY,
      sum: redD + redM + redY
    };
  }, [user.birthDate]);

  // Handle Free Calculator
  const handleCalculateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcName && !calcBirthDate) return;
    mysticAudio.playBell();
    const lp = calcBirthDate ? calculateLifePath(calcBirthDate) : 7;
    const nm = calcName ? calculateNameNumbers(calcName) : { expression: 1, soulUrge: 1, personality: 1 };
    const mat = calculateMaturityNumber(lp, nm.expression);
    setCalcResult({
      lifePath: lp,
      expression: nm.expression,
      soulUrge: nm.soulUrge,
      personality: nm.personality,
      maturity: mat
    });
  };

  // Handle Synastry calculate
  const handleCalculateSynastry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!synDate1 || !synDate2) return;
    mysticAudio.playChime();
    const res = calculateNumerologySynastry(
      synName1 || 'Persona 1',
      synDate1,
      synName2 || 'Persona 2',
      synDate2
    );
    setSynastryResult(res);
  };

  // Handle Oracle Channeling
  const handleChannelOracle = () => {
    setIsChanneling(true);
    setChanneledMessage(null);
    mysticAudio.playChime();

    setTimeout(() => {
      setIsChanneling(false);
      const lpInfo = LIFE_PATH_DETAILS[userLifePath] || LIFE_PATH_DETAILS[7];
      const pyInfo = PERSONAL_YEAR_DETAILS[userPersonalYear] || PERSONAL_YEAR_DETAILS[1];
      const message = `Bajo la sagrada ley de los números de Pitágoras, tu esencia encarna el Sendero ${userLifePath} (${lpInfo.title}) con la vibración de Expresión ${userNameNums.expression}. En este ciclo estás transitando tu ${pyInfo.title}.\n\n` +
        (oracleQuestion ? `Respecto a tu consulta: "${oracleQuestion}"\n` : '') +
        `Los números indican que tu fuerza maestra reside en ${lpInfo.keywords.join(', ')}. En tu Año Personal ${userPersonalYear}, el universo te exige alinear tu propósito con ${pyInfo.theme}. ${pyInfo.advice}`;
      
      setChanneledMessage(message);
    }, 1800);
  };

  // Save current blueprint as reading
  const handleSaveCurrentBlueprint = () => {
    mysticAudio.playBell();
    const lpInfo = LIFE_PATH_DETAILS[userLifePath] || LIFE_PATH_DETAILS[7];
    onSaveReading({
      type: 'numerologia',
      title: `Matriz Pitagórica: Sendero ${userLifePath} & Expresión ${userNameNums.expression}`,
      summary: `Sendero de Vida ${userLifePath} (${lpInfo.title}), Expresión ${userNameNums.expression}, Deseo del Alma ${userNameNums.soulUrge}, Año Personal ${userPersonalYear}.`,
      details: {
        lifePath: userLifePath,
        expression: userNameNums.expression,
        soulUrge: userNameNums.soulUrge,
        personality: userNameNums.personality,
        maturity: userMaturity,
        personalYear: userPersonalYear
      }
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen pb-32 pt-4 px-4 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-[32px] bg-gradient-to-b from-[#1a0b2e]/90 via-[#0d0714]/90 to-[#050208] border border-[#D4AF37]/30 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden mb-6">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#D4AF37] text-[18px]">
                pin
              </span>
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.25em]">
                Geometría Sagrada de Pitágoras
              </span>
            </div>
            <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-white mb-1">
              Numerología Pitagórica
            </h1>
            <p className="text-xs text-gray-300">
              {user.fullName} • Nacimiento: {user.birthDate || 'No definida'}
            </p>
          </div>

          <button
            onClick={onOpenProfile}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#D4AF37] text-xs flex items-center gap-1 transition-all"
            title="Editar fecha y nombre"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span className="hidden sm:inline">Editar</span>
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-4 mt-4 border-t border-white/10">
          {[
            { id: 'blueprint', label: 'Mi Matriz', icon: 'grid_view' },
            { id: 'tabla', label: 'Tabla Pitágoras', icon: 'table_chart' },
            { id: 'ciclos', label: 'Año Personal', icon: 'timelapse' },
            { id: 'calculadora', label: 'Calculador Libre', icon: 'calculate' },
            { id: 'sinastria', label: 'Sinastría', icon: 'favorite' },
            { id: 'oraculo', label: 'Oráculo', icon: 'psychology' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                mysticAudio.playChime();
                setActiveSubTab(tab.id as SubTab);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: BLUEPRINT (LOS 5 NÚMEROS SAGRADOS) */}
      {activeSubTab === 'blueprint' && (
        <div className="space-y-5 animate-fade-in">
          {/* Main Life Path Hero Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#2a134a]/80 via-[#130924]/90 to-[#07030e] border border-[#D4AF37]/40 p-6 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider mb-2">
                  <span className="material-symbols-outlined text-xs">stars</span>
                  Sendero de Vida Principal
                </div>
                <h2 className="font-serif italic text-2xl font-bold text-white mb-1">
                  {LIFE_PATH_DETAILS[userLifePath]?.title || 'El Líder Cósmico'}
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  {LIFE_PATH_DETAILS[userLifePath]?.description || ''}
                </p>

                {/* Calculation breakdown pill */}
                <div className="inline-flex flex-wrap items-center gap-1 text-[10px] text-gray-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                  <span className="text-[#D4AF37] font-bold">Fórmula:</span>
                  <span>Día({lifePathBreakdown.day})</span> + 
                  <span>Mes({lifePathBreakdown.month})</span> + 
                  <span>Año({lifePathBreakdown.year})</span> = 
                  <span className="text-white font-bold">{lifePathBreakdown.sum}</span> → 
                  <span className="text-[#D4AF37] font-bold text-xs">{userLifePath}</span>
                </div>
              </div>

              {/* Big Glowing Number */}
              <div
                onClick={() => {
                  mysticAudio.playBell();
                  setSelectedNumberDetail({
                    title: `Sendero de Vida: ${userLifePath} — ${LIFE_PATH_DETAILS[userLifePath]?.title}`,
                    num: userLifePath,
                    category: 'Sendero de Vida (Life Path Number)',
                    description: LIFE_PATH_DETAILS[userLifePath]?.description || '',
                    keywords: LIFE_PATH_DETAILS[userLifePath]?.keywords
                  });
                }}
                className="w-24 h-28 rounded-2xl bg-gradient-to-b from-[#D4AF37]/20 to-black/60 border-2 border-[#D4AF37] flex flex-col items-center justify-center cursor-pointer shadow-[0_0_24px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform shrink-0 group"
              >
                <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold">
                  Sendero
                </span>
                <span className="font-serif italic text-5xl font-bold text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.8)]">
                  {userLifePath}
                </span>
                <span className="text-[9px] text-gray-400 group-hover:text-white transition-colors mt-0.5">
                  Ver Dones ✦
                </span>
              </div>
            </div>

            {/* Keywords */}
            {LIFE_PATH_DETAILS[userLifePath]?.keywords && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/10">
                {LIFE_PATH_DETAILS[userLifePath].keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 font-medium"
                  >
                    ✦ {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 4 Pillars Grid (Expression, Soul Urge, Personality, Maturity) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Expression / Destiny Number */}
            <div
              onClick={() => {
                mysticAudio.playBell();
                setSelectedNumberDetail({
                  title: `Número de Expresión: ${userNameNums.expression}`,
                  num: userNameNums.expression,
                  category: 'Expresión & Destino (Suma de todas las letras)',
                  description: EXPRESSION_DETAILS[userNameNums.expression]?.description || ''
                });
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
                  Expresión / Destino
                </span>
                <span className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-serif text-base font-bold text-[#D4AF37]">
                  {userNameNums.expression}
                </span>
              </div>
              <h3 className="font-serif italic text-sm font-bold text-white mb-1">
                {EXPRESSION_DETAILS[userNameNums.expression]?.title || 'Poder Expresivo'}
              </h3>
              <p className="text-[11px] text-gray-400 line-clamp-2">
                {EXPRESSION_DETAILS[userNameNums.expression]?.description || 'Talentos innatos y vocación cósmica.'}
              </p>
            </div>

            {/* 2. Soul Urge / Deseo del Alma */}
            <div
              onClick={() => {
                mysticAudio.playBell();
                setSelectedNumberDetail({
                  title: `Deseo del Alma: ${userNameNums.soulUrge}`,
                  num: userNameNums.soulUrge,
                  category: 'Motivación Secreta (Suma de todas las vocales)',
                  description: SOUL_URGE_DETAILS[userNameNums.soulUrge]?.description || ''
                });
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  Deseo del Alma
                </span>
                <span className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-serif text-base font-bold text-purple-300">
                  {userNameNums.soulUrge}
                </span>
              </div>
              <h3 className="font-serif italic text-sm font-bold text-white mb-1">
                {SOUL_URGE_DETAILS[userNameNums.soulUrge]?.title || 'Anhelo Íntimo'}
              </h3>
              <p className="text-[11px] text-gray-400 line-clamp-2">
                {SOUL_URGE_DETAILS[userNameNums.soulUrge]?.description || 'Lo que tu corazón anhela en silencio.'}
              </p>
            </div>

            {/* 3. Personality / Impresión Exterior */}
            <div
              onClick={() => {
                mysticAudio.playBell();
                setSelectedNumberDetail({
                  title: `Número de Personalidad: ${userNameNums.personality}`,
                  num: userNameNums.personality,
                  category: 'Aura Externa (Suma de consonantes)',
                  description: PERSONALITY_DETAILS[userNameNums.personality]?.description || ''
                });
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Personalidad Externa
                </span>
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-serif text-base font-bold text-emerald-300">
                  {userNameNums.personality}
                </span>
              </div>
              <h3 className="font-serif italic text-sm font-bold text-white mb-1">
                {PERSONALITY_DETAILS[userNameNums.personality]?.title || 'Aura Distintiva'}
              </h3>
              <p className="text-[11px] text-gray-400 line-clamp-2">
                {PERSONALITY_DETAILS[userNameNums.personality]?.description || 'Cómo te perciben al instante.'}
              </p>
            </div>

            {/* 4. Maturity / Número de Madurez */}
            <div
              onClick={() => {
                mysticAudio.playBell();
                setSelectedNumberDetail({
                  title: `Número de Madurez: ${userMaturity}`,
                  num: userMaturity,
                  category: 'Fuerza de la Madurez (Sendero + Expresión)',
                  description: MATURITY_DETAILS[userMaturity]?.description || ''
                });
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Madurez & Legado
                </span>
                <span className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif text-base font-bold text-amber-300">
                  {userMaturity}
                </span>
              </div>
              <h3 className="font-serif italic text-sm font-bold text-white mb-1">
                {MATURITY_DETAILS[userMaturity]?.title || 'Cosecha de Sabiduría'}
              </h3>
              <p className="text-[11px] text-gray-400 line-clamp-2">
                {MATURITY_DETAILS[userMaturity]?.description || 'La vibración que despierta a partir de los 35 años.'}
              </p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSaveCurrentBlueprint}
              className="flex-1 py-3 px-4 rounded-xl bg-[#D4AF37] hover:brightness-110 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">bookmark</span>
              {saveSuccess ? '¡Guardado en tu Perfil!' : 'Guardar Matriz en mi Cuenta'}
            </button>
            <button
              onClick={() => {
                mysticAudio.playChime();
                onShare(
                  'Mi Matriz de Numerología Pitagórica',
                  `Mi Sendero de Vida es el ${userLifePath} (${LIFE_PATH_DETAILS[userLifePath]?.title}) y mi Expresión es ${userNameNums.expression}. Descubre tu código en Celestial Alchemy.`
                );
              }}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs flex items-center justify-center cursor-pointer transition-colors"
              title="Compartir"
            >
              <span className="material-symbols-outlined text-base">share</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TABLA PITAGÓRICA & DESGLOSE DE LETRAS */}
      {activeSubTab === 'tabla' && (
        <div className="space-y-5 animate-fade-in">
          {/* Pythagorean Table Card */}
          <div className="rounded-3xl bg-black/60 border border-white/10 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif italic text-lg font-bold text-white">
                  Tabla Alfanumérica de Pitágoras
                </h3>
                <p className="text-xs text-gray-400">
                  Correspondencia sagrada entre letras (A-Z) y los dígitos del 1 al 9.
                </p>
              </div>
              <span className="material-symbols-outlined text-[#D4AF37] text-2xl">
                table_chart
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {PYTHAGOREAN_TABLE.map(item => (
                <div
                  key={item.digit}
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center flex flex-col items-center justify-center"
                >
                  <span className="font-serif italic text-lg font-bold text-[#D4AF37]">
                    {item.digit}
                  </span>
                  <div className="text-[11px] font-mono text-gray-300 font-semibold tracking-wider mt-1">
                    {item.letters.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Letter by Letter Breakdown for the User */}
          <div className="rounded-3xl bg-gradient-to-b from-[#180d2b] to-[#0a0512] border border-[#D4AF37]/30 p-5 shadow-lg">
            <h3 className="font-serif italic text-base font-bold text-white mb-1">
              Desglose Alquímico de tu Nombre
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Cada letra vibra en una frecuencia. Las vocales construyen el Deseo del Alma y las consonantes la Personalidad.
            </p>

            {/* Letters Stream */}
            <div className="flex flex-wrap gap-2 mb-4 max-h-60 overflow-y-auto pr-1">
              {userLetterBreakdown.map((item, idx) => {
                if (item.char === ' ') {
                  return <div key={idx} className="w-3"></div>;
                }
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center w-10 h-14 rounded-xl border transition-all ${
                      item.isVowel
                        ? 'bg-purple-950/60 border-purple-400/50 text-purple-200'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    }`}
                  >
                    <span className="text-sm font-bold uppercase">{item.char}</span>
                    <span className="text-xs font-mono font-bold text-[#D4AF37] mt-0.5">
                      {item.value}
                    </span>
                    <span className="text-[8px] uppercase tracking-tighter opacity-60">
                      {item.isVowel ? 'Vocal' : 'Cons.'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Sum stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
              <div className="bg-purple-950/40 border border-purple-500/20 rounded-xl p-3">
                <span className="text-purple-300 font-bold block text-[11px] mb-0.5">
                  Suma Vocales (Deseo del Alma)
                </span>
                <span className="font-serif text-xl font-bold text-white">
                  = {userNameNums.soulUrge}
                </span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3">
                <span className="text-emerald-300 font-bold block text-[11px] mb-0.5">
                  Suma Consonantes (Personalidad)
                </span>
                <span className="font-serif text-xl font-bold text-white">
                  = {userNameNums.personality}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AÑO PERSONAL & CICLOS DE 9 AÑOS */}
      {activeSubTab === 'ciclos' && (
        <div className="space-y-5 animate-fade-in">
          {/* Current Personal Year Card */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#2d184d] to-[#0c0517] border border-[#D4AF37]/40 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                Ciclo Anual Cósmico
              </span>
              <span className="text-xs text-gray-400">Año {new Date().getFullYear()}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif italic text-2xl font-bold text-white mb-1">
                  {PERSONAL_YEAR_DETAILS[userPersonalYear]?.title || 'Año Personal Cósmico'}
                </h2>
                <span className="text-xs font-semibold text-[#D4AF37] block mb-2">
                  ✦ {PERSONAL_YEAR_DETAILS[userPersonalYear]?.theme}
                </span>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  {PERSONAL_YEAR_DETAILS[userPersonalYear]?.description}
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-gray-200">
                  <strong className="text-[#D4AF37]">Consejo Sagrado: </strong>
                  {PERSONAL_YEAR_DETAILS[userPersonalYear]?.advice}
                </div>
              </div>

              <div className="w-20 h-24 rounded-2xl bg-black/60 border border-[#D4AF37] flex flex-col items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <span className="text-[9px] uppercase text-[#D4AF37] font-bold">Año</span>
                <span className="font-serif italic text-4xl font-bold text-[#D4AF37]">
                  {userPersonalYear}
                </span>
              </div>
            </div>
          </div>

          {/* 9-Year Cycle Timeline */}
          <div className="rounded-3xl bg-black/60 border border-white/10 p-5 shadow-lg">
            <h3 className="font-serif italic text-base font-bold text-white mb-3">
              La Rueda de los 9 Años
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                const isCurrent = num === userPersonalYear;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      mysticAudio.playBell();
                      setSelectedNumberDetail({
                        title: PERSONAL_YEAR_DETAILS[num]?.title || `Año ${num}`,
                        num: num,
                        category: `Año Personal ${num}`,
                        description: PERSONAL_YEAR_DETAILS[num]?.description || '',
                        advice: PERSONAL_YEAR_DETAILS[num]?.advice
                      });
                    }}
                    className={`rounded-xl p-2.5 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.6)] scale-105'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span className="font-serif text-lg font-bold">{num}</span>
                    <span className="text-[9px] truncate w-full uppercase">
                      {num === 1 ? 'Inicio' : num === 9 ? 'Cierre' : `Fase ${num}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Energy Widget */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block mb-0.5">
                Vibración del Día de Hoy
              </span>
              <h4 className="font-serif italic text-sm font-bold text-white">
                {dailyEnergy.number} — {dailyEnergy.title}
              </h4>
              <p className="text-[11px] text-gray-400 line-clamp-1">
                {dailyEnergy.theme}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-black/60 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
              <span className="font-serif text-xl font-bold text-[#D4AF37]">
                {dailyEnergy.number}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CALCULADOR PITAGÓRICO LIBRE */}
      {activeSubTab === 'calculadora' && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-3xl bg-black/60 border border-white/10 p-5 shadow-lg">
            <h3 className="font-serif italic text-lg font-bold text-white mb-1">
              Calculador Pitagórico Universal
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Calcula el código numérico sagrado de cualquier persona, empresa, marca, proyecto o fecha especial.
            </p>

            <form onSubmit={handleCalculateCustom} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
                  Nombre Completo o Razón Social
                </label>
                <input
                  type="text"
                  value={calcName}
                  onChange={e => setCalcName(e.target.value)}
                  placeholder="Ej: Gabriel García Márquez"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
                  Fecha de Nacimiento o Fundación
                </label>
                <input
                  type="date"
                  value={calcBirthDate}
                  onChange={e => setCalcBirthDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-base">calculate</span>
                Decodificar Frecuencia Pitagórica
              </button>
            </form>
          </div>

          {/* Calculator Results */}
          {calcResult && (
            <div className="rounded-3xl bg-gradient-to-b from-[#1f0f38] to-[#0b0514] border border-[#D4AF37]/40 p-5 shadow-xl animate-fade-in space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-serif italic text-base font-bold text-white">
                  Resultado para: <span className="text-[#D4AF37]">{calcName || 'Fecha Consultada'}</span>
                </h4>
                <span className="text-[10px] text-gray-400">Pitágoras 1-9</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <span className="text-[9px] uppercase text-gray-400 block">Sendero</span>
                  <span className="font-serif text-2xl font-bold text-[#D4AF37]">
                    {calcResult.lifePath}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <span className="text-[9px] uppercase text-gray-400 block">Expresión</span>
                  <span className="font-serif text-2xl font-bold text-white">
                    {calcResult.expression}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <span className="text-[9px] uppercase text-gray-400 block">Deseo Alma</span>
                  <span className="font-serif text-2xl font-bold text-purple-300">
                    {calcResult.soulUrge}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <span className="text-[9px] uppercase text-gray-400 block">Madurez</span>
                  <span className="font-serif text-2xl font-bold text-emerald-300">
                    {calcResult.maturity}
                  </span>
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-black/40 rounded-2xl p-3 text-xs text-gray-300 leading-relaxed border border-white/5">
                <strong className="text-[#D4AF37] block mb-1">
                  Arquetipo del Sendero {calcResult.lifePath}:
                </strong>
                {LIFE_PATH_DETAILS[calcResult.lifePath]?.description || 'Energía armónica y transformadora.'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: SINASTRÍA PITAGÓRICA */}
      {activeSubTab === 'sinastria' && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-3xl bg-black/60 border border-white/10 p-5 shadow-lg">
            <h3 className="font-serif italic text-lg font-bold text-white mb-1">
              Sinastría y Resonancia Numérica
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Calcula la afinidad kármica y vibracional entre dos senderos de vida.
            </p>

            <form onSubmit={handleCalculateSynastry} className="space-y-4">
              {/* Person 1 */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Persona 1 (Tú)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={synName1}
                    onChange={e => setSynName1(e.target.value)}
                    placeholder="Tu nombre"
                    className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="date"
                    value={synDate1}
                    onChange={e => setSynDate1(e.target.value)}
                    className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Person 2 */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                  Persona 2 (Pareja, Socio, Amigo)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={synName2}
                    onChange={e => setSynName2(e.target.value)}
                    placeholder="Nombre de la otra persona"
                    required
                    className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="date"
                    value={synDate2}
                    onChange={e => setSynDate2(e.target.value)}
                    required
                    className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-purple-500 hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-base">favorite</span>
                Calcular Compatibilidad Numérica
              </button>
            </form>
          </div>

          {/* Synastry Result Card */}
          {synastryResult && (
            <div className="rounded-3xl bg-gradient-to-br from-[#24113e] to-[#0c0617] border border-[#D4AF37]/40 p-5 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block">
                    Resonancia Vibracional
                  </span>
                  <h4 className="font-serif italic text-lg font-bold text-white">
                    {synastryResult.connectionType}
                  </h4>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-black/60 border border-[#D4AF37] flex flex-col items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  <span className="font-serif text-2xl font-bold text-[#D4AF37]">
                    {synastryResult.score}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                {synastryResult.synergyDescription}
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-gray-200">
                <strong className="text-[#D4AF37]">Consejo del Vínculo: </strong>
                {synastryResult.sacredAdvice}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 6: ORÁCULO DE NUMEROLOGÍA */}
      {activeSubTab === 'oraculo' && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-3xl bg-gradient-to-b from-[#1e0e38] to-[#090412] border border-[#D4AF37]/40 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#D4AF37] text-xl">
                psychology
              </span>
              <h3 className="font-serif italic text-lg font-bold text-white">
                Consulta al Oráculo de Pitágoras
              </h3>
            </div>
            <p className="text-xs text-gray-300 mb-4">
              Realiza una pregunta a las leyes matemáticas del universo y recibe una revelación sincronizada con tu sendero ({userLifePath}) y tu año personal ({userPersonalYear}).
            </p>

            <textarea
              value={oracleQuestion}
              onChange={e => setOracleQuestion(e.target.value)}
              placeholder="¿Qué debo tener en cuenta para mi próximo proyecto o decisión importante?"
              rows={3}
              className="w-full bg-black/50 border border-white/15 rounded-2xl p-3.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none mb-3 resize-none"
            />

            <button
              onClick={handleChannelOracle}
              disabled={isChanneling}
              className="w-full py-3.5 rounded-xl bg-[#D4AF37] hover:brightness-110 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              {isChanneling ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                  Canalizando Frecuencias...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  Canalizar Mensaje del Oráculo
                </>
              )}
            </button>
          </div>

          {/* Oracle Response */}
          {channeledMessage && (
            <div className="rounded-3xl bg-black/70 border border-[#D4AF37]/50 p-5 shadow-2xl animate-fade-in space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                  ✦ Revelación Sagrada
                </span>
                <span className="text-xs text-gray-400">Pitágoras Místico</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line italic">
                "{channeledMessage}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL FOR ANY CLICKED NUMBER */}
      {selectedNumberDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1f0f38] via-[#0f071c] to-[#050208] border border-[#D4AF37] p-6 shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            <button
              onClick={() => setSelectedNumberDetail(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#D4AF37]/20 to-transparent border border-[#D4AF37] flex items-center justify-center mx-auto mb-2 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                <span className="font-serif italic text-3xl font-bold text-[#D4AF37]">
                  {selectedNumberDetail.num}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block mb-1">
                {selectedNumberDetail.category}
              </span>
              <h3 className="font-serif italic text-xl font-bold text-white">
                {selectedNumberDetail.title}
              </h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-4 text-center">
              {selectedNumberDetail.description}
            </p>

            {selectedNumberDetail.keywords && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {selectedNumberDetail.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300"
                  >
                    ✦ {kw}
                  </span>
                ))}
              </div>
            )}

            {selectedNumberDetail.advice && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-gray-200 mb-4">
                <strong className="text-[#D4AF37]">Guía: </strong>
                {selectedNumberDetail.advice}
              </div>
            )}

            <button
              onClick={() => setSelectedNumberDetail(null)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
