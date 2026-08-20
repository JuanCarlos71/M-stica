import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, PalmAnalysis, SavedReading } from '../types';
import { analyzePalmData } from '../data/palmistryData';
import { askMysticAI } from '../services/mysticAI';
import { mysticAudio } from '../services/audioAmbience';
import confetti from 'canvas-confetti';

interface QuiromanciaViewProps {
  user: UserProfile;
  onSaveReading: (reading: SavedReading) => void;
  onShareReading: (title: string, summary: string) => void;
  onExportPDF: (palm: PalmAnalysis) => void;
}

export const QuiromanciaView: React.FC<QuiromanciaViewProps> = ({
  user,
  onSaveReading,
  onShareReading,
  onExportPDF
}) => {
  const [handSide, setHandSide] = useState<'left' | 'right'>('right');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Alineando biomarcadores...');
  const [torchOn, setTorchOn] = useState(false);
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PalmAnalysis | null>(null);
  const [aiDeepReading, setAiDeepReading] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedLineInfo, setSelectedLineInfo] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setUseLiveCamera(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable, using mystical viewport:', err);
      setUseLiveCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setUseLiveCamera(false);
  };

  const handleToggleCamera = () => {
    if (useLiveCamera) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setCapturedImage(event.target?.result as string);
        triggerScanAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerScanAnalysis = () => {
    setIsScanning(true);
    setScanProgress(0);
    mysticAudio.playChime();

    const phases = [
      'Detectando palma y longitud digital...',
      'Mapeando Línea del Corazón (Emociones)...',
      'Mapeando Línea de la Cabeza (Intelecto)...',
      'Mapeando Línea de la Vida (Prana & Longevidad)...',
      'Calculando montes planetarios...',
      'Decodificando blueprint kármico ancestral...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScanProgress(Math.min(step * 18, 100));
      setScanStatusText(phases[Math.min(step, phases.length - 1)]);

      if (step >= 6) {
        clearInterval(interval);
        const result = analyzePalmData(handSide);
        setAnalysisResult(result);
        setIsScanning(false);
        mysticAudio.playChime();

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f2ca50', '#dcb8ff', '#ffe088']
        });

        // Save to journal
        onSaveReading({
          id: `palm-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'quiromancia',
          title: `Lectura de ${handSide === 'left' ? 'Mano Izquierda' : 'Mano Derecha'}`,
          summary: result.generalReading.slice(0, 140) + '...',
          details: result,
          handSide
        });
      }
    }, 450);
  };

  const requestAiOracleReading = async () => {
    if (!analysisResult) return;
    setIsLoadingAI(true);
    const reading = await askMysticAI({
      type: 'quiromancia',
      prompt: `Lectura profunda de la ${handSide === 'left' ? 'mano izquierda (dones innatos)' : 'mano derecha (destino manifiesto)'}. Elemento: ${analysisResult.element}. Vitalidad: ${analysisResult.vitalityScore}%. Consultante: ${user.fullName || 'Iniciado'}.`,
      context: { handSide, result: analysisResult }
    });
    setAiDeepReading(reading);
    setIsLoadingAI(false);
  };

  return (
    <div className="flex flex-col w-full min-h-full pb-24 relative bg-[#050208] text-gray-200">
      {/* Hand Side Selector & Sub-header */}
      <div className="px-5 pt-2 pb-3 flex items-center justify-between z-20">
        <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
          <button
            id="palm-left-hand-tab"
            onClick={() => {
              setHandSide('left');
              mysticAudio.playChime();
            }}
            className={`px-4 py-1.5 rounded-full text-[11px] font-sans uppercase tracking-wider font-semibold transition-all ${
              handSide === 'left'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mano Izquierda (Innato)
          </button>
          <button
            id="palm-right-hand-tab"
            onClick={() => {
              setHandSide('right');
              mysticAudio.playChime();
            }}
            className={`px-4 py-1.5 rounded-full text-[11px] font-sans uppercase tracking-wider font-semibold transition-all ${
              handSide === 'right'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mano Derecha (Manifiesto)
          </button>
        </div>

        <span className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] font-semibold">
          {handSide === 'left' ? 'Karma & Potencial' : 'Presente & Futuro'}
        </span>
      </div>

      {/* Viewfinder Container */}
      <div className="px-4 relative">
        <div className="relative w-full h-[500px] max-h-[560px] rounded-[36px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] bg-[#050208] border border-white/15">
          {/* Live Camera Feed OR Default Mystical Feed */}
          <div className="absolute inset-0 z-0">
            {useLiveCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured Hand"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="bg-cover bg-center w-full h-full opacity-60"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_jW1o3Jh7e-odEIiATsqk3dKGHj0iMZPoi5PCdVC-MEyHwXTKNCssoEn9DEySggUpFAb2v5eA_ChwQQ-esOYnTzq0ZMbaKyrPMkqq8q7ZhZtEq4XafqYNuhu_Gbti2-OLjppSKmjiEPr-u4LroeNZxiUDLCNnM43wNe8oxR-T32ReSUQLLOuI-_oG5OOnRA3a4eUGhsxth4E4yo6YAq9kBIECnNOI4ct9cv6KRSJu5_niYvdoMQ')"
                }}
              ></div>
            )}
            {/* Radial gradient for depth and focus */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,2,8,0.85)_100%)] pointer-events-none"></div>
          </div>

          {/* Scanning Particles Grid Overlay */}
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-screen bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          {/* Top Instructions Banner */}
          <div className="absolute top-0 inset-x-0 z-20 pt-6 px-4 flex justify-center pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.6)] border border-white/15">
              <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></div>
              <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-gray-200 font-semibold">
                {isScanning ? scanStatusText : 'ALINEA TU PALMA EN EL MARCO'}
              </span>
            </div>
          </div>

          {/* Center Palm Guide & SVG Lines */}
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6 pointer-events-none">
            <div className="relative w-full max-w-[250px] aspect-[2/3]">
              {/* Corner Targeting Brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37] opacity-80"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37] opacity-80"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37] opacity-80"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37] opacity-80"></div>

              {/* Hand Outline SVG */}
              <svg
                className="w-full h-full drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                fill="none"
                viewBox="0 0 240 360"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Silhouette */}
                <path
                  className="opacity-40 animate-pulse"
                  d="M70,360 C70,300 50,260 40,210 C30,160 10,140 20,110 C25,95 40,90 50,110 C55,120 60,140 60,160 C60,160 65,110 70,80 C75,50 95,45 105,70 C110,85 115,110 115,140 C115,140 120,90 125,60 C130,30 150,25 160,50 C165,65 170,90 170,120 C170,120 175,80 180,60 C185,40 205,35 210,60 C220,110 230,150 230,210 C230,270 190,320 190,360"
                  stroke="#D4AF37"
                  strokeDasharray="6 6"
                  strokeWidth="2"
                ></path>

                {/* Glowing Major Lines */}
                {/* Life Line (Gold) */}
                <path
                  className="opacity-90"
                  d="M105,170 C105,170 115,220 80,300"
                  stroke="#D4AF37"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                ></path>
                <path
                  className="opacity-40 blur-sm animate-pulse"
                  d="M105,170 C105,170 115,220 80,300"
                  stroke="#D4AF37"
                  strokeLinecap="round"
                  strokeWidth="8"
                ></path>

                {/* Head Line (Violet) */}
                <path
                  className="opacity-90"
                  d="M105,170 C105,170 145,190 190,210"
                  stroke="#c084fc"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                ></path>
                <path
                  className="opacity-40 blur-sm animate-pulse"
                  d="M105,170 C105,170 145,190 190,210"
                  stroke="#c084fc"
                  strokeLinecap="round"
                  strokeWidth="8"
                  style={{ animationDelay: '0.5s' }}
                ></path>

                {/* Heart Line (Violet/Pink) */}
                <path
                  className="opacity-90"
                  d="M115,140 C115,140 165,150 210,130"
                  stroke="#f472b6"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                ></path>
                <path
                  className="opacity-40 blur-sm animate-pulse"
                  d="M115,140 C115,140 165,150 210,130"
                  stroke="#f472b6"
                  strokeLinecap="round"
                  strokeWidth="8"
                  style={{ animationDelay: '1s' }}
                ></path>

                {/* Fate Line (Silver) */}
                <path
                  className="opacity-70"
                  d="M135,300 L140,160"
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="2"
                ></path>
              </svg>

              {/* Scanning Laser Line (Active when scanning) */}
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_20px_#D4AF37] opacity-90 animate-scan"
                style={{ top: '30%' }}
              ></div>
            </div>
          </div>

          {/* Torch simulation effect */}
          {torchOn && (
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay pointer-events-none animate-pulse"></div>
          )}

          {/* Scanning Progress Overlay */}
          {isScanning && (
            <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-[#D4AF37] animate-spin mb-4 shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
              <p className="font-serif italic text-lg font-bold text-[#D4AF37] mb-2">{scanStatusText}</p>
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full bg-gradient-to-r from-[#4c1d95] to-[#D4AF37] transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 mt-2 font-mono tracking-widest">{scanProgress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls (Flash, Glowing Shutter Fingerprint Orb, Camera Switch) */}
      <div className="w-full pt-5 px-8 flex justify-between items-center bg-[#050208]">
        {/* Flash / Torch Toggle */}
        <button
          id="flash-toggle-btn"
          onClick={() => {
            setTorchOn(!torchOn);
            mysticAudio.playChime();
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
            torchOn
              ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_#D4AF37]'
              : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
          title="Linterna / Foco de alta precisión"
        >
          <span className="material-symbols-outlined text-[26px]">
            {torchOn ? 'flash_on' : 'flash_off'}
          </span>
        </button>

        {/* Shutter Button (Glowing Fingerprint Orb) */}
        <div
          id="palm-scan-shutter-btn"
          onClick={triggerScanAnalysis}
          className="relative group cursor-pointer"
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/30 blur-xl group-hover:bg-[#D4AF37]/50 transition-all animate-pulse"></div>
          {/* Expanding Ring */}
          <div
            className="absolute -inset-2 rounded-full bg-[#D4AF37]/20 animate-ping"
            style={{ animationDuration: '2.5s' }}
          ></div>
          {/* Core Button */}
          <button className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#fae19c] to-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.6)] flex items-center justify-center transition-transform duration-200 active:scale-90 z-10 cursor-pointer">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b38e1b] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4)]"></div>
            <span
              className="material-symbols-outlined relative z-20 text-black text-[42px] drop-shadow-md"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              fingerprint
            </span>
          </button>
        </div>

        {/* Switch Camera / Upload Photo Actions */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            id="camera-switch-btn"
            onClick={handleToggleCamera}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
              useLiveCamera
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(192,132,252,0.6)]'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title="Activar cámara web / celular en vivo"
          >
            <span className="material-symbols-outlined text-[26px]">
              {useLiveCamera ? 'videocam' : 'cameraswitch'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-[#D4AF37] hover:brightness-125 flex items-center gap-1.5 uppercase tracking-wider font-semibold cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          Subir foto de tu mano desde la galería
        </button>
      </div>

      {/* Palm Analysis Results Modal */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#0f0c1d] border border-white/15 rounded-[32px] p-6 max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto my-auto relative">
            <button
              onClick={() => setAnalysisResult(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-900 to-purple-800 border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <span className="text-xl">✋</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Dictamen de Quiromancia Sagrada
                </span>
                <h3 className="font-serif italic text-2xl font-bold text-white">
                  {analysisResult.handSide === 'left' ? 'Mano Izquierda' : 'Mano Derecha'}
                </h3>
              </div>
            </div>

            {/* Element Badge */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-semibold">
                  Morfología & Elemento
                </span>
                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold border border-[#D4AF37]/40 uppercase tracking-wider">
                  Mano de {analysisResult.element}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed italic">
                {analysisResult.elementDescription}
              </p>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-lg font-bold text-[#D4AF37] font-serif italic">
                  {analysisResult.vitalityScore}%
                </div>
                <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Vitalidad</div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-lg font-bold text-purple-300 font-serif italic">
                  {analysisResult.intuitionScore}%
                </div>
                <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Intuición</div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-lg font-bold text-pink-300 font-serif italic">
                  {analysisResult.emotionalScore}%
                </div>
                <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Emoción</div>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center">
                <div className="text-lg font-bold text-emerald-300 font-serif italic">
                  {analysisResult.fortuneScore}%
                </div>
                <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Fortuna</div>
              </div>
            </div>

            {/* Major Lines Breakdown */}
            <h4 className="font-serif italic text-lg font-bold text-white mb-3">
              Líneas Sagradas de la Palma
            </h4>
            <div className="space-y-3 mb-5">
              {analysisResult.lines.map(line => (
                <div
                  key={line.id}
                  onClick={() => setSelectedLineInfo(selectedLineInfo === line.id ? null : line.id)}
                  className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: line.color }}
                      ></span>
                      <span className="font-serif italic font-bold text-sm text-white">{line.name}</span>
                    </div>
                    <span className="text-[11px] text-[#D4AF37] font-mono">{line.depth}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{line.reading}</p>
                  <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">spa</span>
                    {line.chakra}
                  </div>
                </div>
              ))}
            </div>

            {/* Mounts Planetary Highlights */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-5">
              <h5 className="font-serif italic font-bold text-sm text-[#D4AF37] mb-2">
                Montes Planetarios Dominantes
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                <div>
                  <strong className="text-[#D4AF37]">Monte de Venus:</strong> {analysisResult.mounts.venus}
                </div>
                <div>
                  <strong className="text-purple-300">Monte de la Luna:</strong> {analysisResult.mounts.luna}
                </div>
                <div>
                  <strong className="text-amber-200">Monte de Júpiter:</strong> {analysisResult.mounts.jupiter}
                </div>
                <div>
                  <strong className="text-slate-300">Monte de Mercurio:</strong> {analysisResult.mounts.mercurio}
                </div>
              </div>
            </div>

            {/* General Synthesis */}
            <div className="bg-gradient-to-b from-[#4c1d95]/20 to-transparent border border-purple-500/30 rounded-2xl p-4 mb-5">
              <h5 className="font-serif italic font-bold text-sm text-[#D4AF37] mb-1">
                Consejo Esotérico del Oráculo
              </h5>
              <p className="text-xs text-gray-200 leading-relaxed italic">
                "{analysisResult.spiritualGuidance}"
              </p>
            </div>

            {/* AI Deep Reading Option */}
            {aiDeepReading ? (
              <div className="bg-white/5 border border-purple-500/40 rounded-2xl p-4 mb-5 animate-fadeIn">
                <div className="flex items-center gap-2 mb-2 text-purple-300">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  <span className="font-serif italic font-bold text-sm">
                    Revelación Profunda de Gemini Oracle
                  </span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                  {aiDeepReading}
                </p>
              </div>
            ) : (
              <button
                onClick={requestAiOracleReading}
                disabled={isLoadingAI}
                className="w-full mb-5 bg-white/5 border border-purple-400/40 text-purple-300 font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isLoadingAI ? 'sync' : 'psychology'}
                </span>
                {isLoadingAI ? 'Consultando al Oráculo IA...' : 'Pedir Revelación Detallada a Gemini'}
              </button>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  onShareReading(
                    `Lectura de Quiromancia — ${analysisResult.handSide === 'left' ? 'Mano Izquierda' : 'Mano Derecha'}`,
                    `Mano de ${analysisResult.element}. Vitalidad: ${analysisResult.vitalityScore}%, Intuición: ${analysisResult.intuitionScore}%. ${analysisResult.spiritualGuidance}`
                  )
                }
                className="bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                Compartir
              </button>
              <button
                onClick={() => onExportPDF(analysisResult)}
                className="bg-white/10 text-white border border-white/15 font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
