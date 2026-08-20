import React, { useState, useEffect } from 'react';
import { UserProfile, SavedReading, NatalChart, PalmAnalysis } from '../types';
import { exportFullMysticReportPDF } from '../services/pdfExporter';
import { mysticAudio } from '../services/audioAmbience';
import { signInWithGoogle, logoutUser, isInIframe, type FirebaseUser } from '../lib/firebase';
import { getSunSign, calculateAscendant, calculateMoonSign, ZODIAC_SIGNS } from '../data/astrologyData';
import { calculateLifePathNumber, calculateExpressionNumber, calculateSoulUrgeNumber } from '../data/numerologyData';
import confetti from 'canvas-confetti';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  savedReadings: SavedReading[];
  onDeleteReading: (id: string) => void;
  currentChart?: NatalChart | null;
  currentPalm?: PalmAnalysis | null;
  onResetToGuest?: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  firebaseUser,
  onUpdateUser,
  savedReadings,
  onDeleteReading,
  currentChart,
  currentPalm,
  onResetToGuest
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'datos' | 'historial' | 'seguridad'>('perfil');
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const runningInIframe = isInIframe();

  // Form states for user real data
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    birthDate: user.birthDate || '1996-07-24',
    birthTime: user.birthTime || '14:30',
    birthPlace: user.birthPlace || 'Santiago, Chile'
  });

  // Keep form data synced when user changes
  useEffect(() => {
    setFormData({
      fullName: user.fullName || '',
      birthDate: user.birthDate || '1996-07-24',
      birthTime: user.birthTime || '14:30',
      birthPlace: user.birthPlace || 'Santiago, Chile'
    });
  }, [user]);

  if (!isOpen) return null;

  // Calculate live preview values based on form inputs
  const calculatedSunSign = (() => {
    if (!formData.birthDate) return user.zodiacSign;
    const parts = formData.birthDate.split('-').map(Number);
    if (parts.length < 3) return user.zodiacSign;
    return getSunSign(parts[1], parts[2]);
  })();

  const calculatedAscendant = calculateAscendant(formData.birthDate, formData.birthTime, formData.birthPlace);
  const calculatedMoon = calculateMoonSign(formData.birthDate);
  const calculatedLifePath = calculateLifePathNumber(formData.birthDate);
  const calculatedExpression = calculateExpressionNumber(formData.fullName);
  const calculatedSoulUrge = calculateSoulUrgeNumber(formData.fullName);

  const handleGoogleSignIn = async (useRedirect: boolean = false) => {
    setAuthErrorMessage(null);
    setIsLoggingIn(true);
    try {
      const fbUser = await signInWithGoogle(useRedirect);
      if (fbUser) {
        onUpdateUser({
          id: fbUser.uid,
          fullName: fbUser.displayName || user.fullName,
          email: fbUser.email || undefined,
          avatarUrl: fbUser.photoURL || user.avatarUrl,
          isGoogleAuth: true
        });
        mysticAudio.playChime();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#9333EA', '#38BDF8']
        });
      }
    } catch (error: any) {
      console.warn('Google Sign In Catch:', error);
      const code = error?.code || error?.message || '';
      if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) {
        setAuthErrorMessage('La ventana emergente se cerró. En celulares puedes usar el botón de "Acceso Directo" o abrir en pestaña completa.');
      } else if (code.includes('unauthorized-domain')) {
        setAuthErrorMessage('Dominio no autorizado en Firebase Console. Puedes usar tus Datos Reales directamente sin iniciar sesión.');
      } else if (code.includes('TIMEOUT') || runningInIframe) {
        setAuthErrorMessage('El navegador bloqueó la ventana emergente dentro del simulador. Toca "Abrir en Pestaña Completa" para conectar con Google.');
      } else {
        setAuthErrorMessage('No se pudo completar la autenticación emergente. Usa "Acceso Directo Móvil" o abre en pestaña completa.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOpenInNewTab = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch {
      // ignore
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutUser();
      if (onResetToGuest) {
        onResetToGuest();
      } else {
        onUpdateUser({
          id: 'guest-' + Date.now(),
          isGoogleAuth: false,
          email: undefined
        });
      }
      mysticAudio.playChime();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveRealData = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      fullName: formData.fullName.trim(),
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      birthPlace: formData.birthPlace.trim(),
      zodiacSign: calculatedSunSign,
      ascendant: calculatedAscendant,
      moonSign: calculatedMoon,
      lifePathNumber: calculatedLifePath,
      expressionNumber: calculatedExpression,
      soulUrgeNumber: calculatedSoulUrge
    });

    setSaveSuccessMsg(true);
    mysticAudio.playChime();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#68d391', '#ffffff']
    });

    setTimeout(() => {
      setSaveSuccessMsg(false);
    }, 3000);
  };

  const handleToggleBiometrics = () => {
    setIsBiometricAuthenticating(true);
    mysticAudio.playChime();

    setTimeout(() => {
      setIsBiometricAuthenticating(false);
      const nextState = !user.biometricEnabled;
      onUpdateUser({ biometricEnabled: nextState });

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f2ca50', '#dcb8ff']
      });
    }, 1200);
  };

  const handleCloudBackup = () => {
    const backupData = {
      user,
      savedReadings,
      version: '2.0.0',
      timestamp: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Celestial_Alchemy_Backup_${(user.fullName || 'Usuario').replace(/\s+/g, '_')}.json`;
    link.click();
    setCloudSyncStatus('Copia de respaldo exportada con éxito.');
    setTimeout(() => setCloudSyncStatus(null), 3000);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.user) {
            onUpdateUser(data.user);
            setCloudSyncStatus('Perfil y datos restaurados exitosamente.');
            setTimeout(() => setCloudSyncStatus(null), 3000);
          }
        } catch {
          alert('Error al restaurar archivo: formato inválido');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0f0c1d] border border-white/15 rounded-[32px] p-6 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto my-auto relative text-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        {/* Google Authentication Status Card */}
        <div className="mb-5 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-[#0f0c1d] p-3.5 rounded-2xl border border-white/15">
          {firebaseUser ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={firebaseUser.photoURL || user.avatarUrl}
                  alt={firebaseUser.displayName || 'Google'}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-[#D4AF37] object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white truncate">
                      {firebaseUser.displayName || user.fullName}
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Google
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{firebaseUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleGoogleSignOut}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-white/10 hover:border-rose-500/40 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                title="Cerrar sesión o cambiar de usuario"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] block">
                    Cuenta & Sincronización
                  </span>
                  <span className="text-[11px] text-gray-300 block">
                    Inicia sesión con Google para sincronizar tus lecturas.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleGoogleSignIn(false)}
                    disabled={isLoggingIn}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl text-[11px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    {isLoggingIn ? 'Conectando...' : 'Iniciar con Google'}
                  </button>

                  <button
                    onClick={() => handleGoogleSignIn(true)}
                    disabled={isLoggingIn}
                    className="px-2.5 py-2.5 bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Iniciar con redirección para navegadores móviles"
                  >
                    <span className="material-symbols-outlined text-sm">smartphone</span>
                    Móvil
                  </button>
                </div>
              </div>

              {/* Informative alert or Iframe advice */}
              {authErrorMessage ? (
                <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-2.5 text-rose-200 text-[11px] flex flex-col gap-2">
                  <div className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-rose-400 text-sm shrink-0">info</span>
                    <span>{authErrorMessage}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-rose-500/20">
                    <button
                      onClick={handleOpenInNewTab}
                      className="px-2.5 py-1 bg-white text-gray-900 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                      Abrir en Pestaña Completa
                    </button>
                    <button
                      onClick={() => setActiveTab('datos')}
                      className="px-2.5 py-1 bg-rose-500/20 text-rose-200 border border-rose-500/40 rounded-lg text-[10px] font-semibold cursor-pointer"
                    >
                      Editar Mis Datos
                    </button>
                  </div>
                </div>
              ) : runningInIframe ? (
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2 flex items-center justify-between gap-2 text-[10px] text-indigo-200">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-indigo-300">visibility</span>
                    En simulador preview, abre en pestaña completa para popup de Google
                  </span>
                  <button
                    onClick={handleOpenInNewTab}
                    className="px-2 py-1 bg-indigo-500/30 hover:bg-indigo-500/50 text-white rounded-lg font-bold uppercase tracking-wider shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                    Abrir
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* User Card Header Summary */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative group">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[#0f0c1d] rounded-full"></span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-serif italic text-xl font-bold text-white truncate">
              {user.fullName || 'Iniciado Celestial'}
            </h3>
            <p className="text-xs text-[#D4AF37] font-sans">
              Sol en {user.zodiacSign} • Ascendente {user.ascendant}
            </p>
            <p className="text-[11px] text-gray-400">
              Sendero de Vida {user.lifePathNumber} • Expresión {user.expressionNumber}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 bg-white/5 p-1 rounded-2xl border border-white/10 mb-5 text-center">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'perfil'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('datos')}
            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'datos'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mis Datos
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'historial'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Historial ({savedReadings.length})
          </button>
          <button
            onClick={() => setActiveTab('seguridad')}
            className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'seguridad'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Seguridad
          </button>
        </div>

        {/* TAB 1: PERFIL */}
        {activeTab === 'perfil' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Quick Link to Edit Real Data */}
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="font-serif italic font-bold text-sm text-[#D4AF37] block">
                  ¿Deseas cambiar tu nombre o fecha?
                </span>
                <span className="text-[11px] text-gray-300">
                  Configura tu fecha, hora y ciudad de nacimiento real.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('datos')}
                className="px-3 py-1.5 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-wider rounded-xl hover:brightness-110 transition-all shrink-0 cursor-pointer shadow-md"
              >
                Editar Datos
              </button>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-2">
                Seleccionar Avatar
              </label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => onUpdateUser({ avatarUrl: url })}
                    className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      user.avatarUrl === url
                        ? 'border-[#D4AF37] scale-110 shadow-[0_0_10px_#D4AF37]'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={url}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Battery Saver Mode Toggle */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-serif italic font-bold text-sm text-white block">
                  Modo Ahorro de Batería
                </span>
                <span className="text-[11px] text-gray-400">
                  Optimiza animaciones para menor consumo de energía.
                </span>
              </div>
              <button
                onClick={() => onUpdateUser({ batterySaver: !user.batterySaver })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  user.batterySaver ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    user.batterySaver ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Daily Push Notification Alerts Toggle */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-serif italic font-bold text-sm text-white block">
                  Notificaciones Cósmicas
                </span>
                <span className="text-[11px] text-gray-400">
                  Afirmaciones diarias y alertas de tránsitos celestiales.
                </span>
              </div>
              <button
                onClick={() => {
                  onUpdateUser({ notificationsEnabled: !user.notificationsEnabled });
                  if (!user.notificationsEnabled && 'Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  user.notificationsEnabled ? 'bg-[#D4AF37]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    user.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Export Complete Mystic PDF */}
            <button
              onClick={() => exportFullMysticReportPDF(user, currentChart, currentPalm)}
              className="w-full bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Generar & Exportar Reporte Místico PDF
            </button>
          </div>
        )}

        {/* TAB 2: MIS DATOS REALES (Formulario de Ingreso de Datos) */}
        {activeTab === 'datos' && (
          <form onSubmit={handleSaveRealData} className="space-y-4 animate-fadeIn">
            <div className="bg-purple-950/30 border border-purple-500/20 p-3 rounded-2xl text-xs text-purple-200">
              <span className="font-bold flex items-center gap-1 text-purple-300 mb-1">
                <span className="material-symbols-outlined text-sm">tune</span>
                Personalización Astrológica & Numerológica
              </span>
              Ingresa tus datos reales para recalcular de forma exacta tu Carta Natal, Ascendente y Número de Sendero de Vida.
            </div>

            {/* Nombre Completo */}
            <div>
              <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                Nombre Completo Real
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ej. Juan González"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Utilizado para calcular tu Número de Expresión ({calculatedExpression}) y Deseo del Alma ({calculatedSoulUrge}).
              </p>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]"
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Determina tu Signo Solar ({calculatedSunSign}) y Sendero de Vida ({calculatedLifePath}).
              </p>
            </div>

            {/* Hora y Lugar de Nacimiento en 2 columnas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                  Hora de Nacimiento
                </label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                  Ciudad / País
                </label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={e => setFormData({ ...formData, birthPlace: e.target.value })}
                  placeholder="Ej. Santiago, Chile"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                  required
                />
              </div>
            </div>

            {/* Live Calculations Preview */}
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] block">
                Cálculo Cósmico en Tiempo Real
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-[10px] block">Signo Solar</span>
                  <span className="font-serif italic font-bold text-white text-sm">
                    {calculatedSunSign}
                  </span>
                </div>
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-[10px] block">Ascendente</span>
                  <span className="font-serif italic font-bold text-[#D4AF37] text-sm">
                    {calculatedAscendant}
                  </span>
                </div>
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-[10px] block">Signo Lunar</span>
                  <span className="font-serif italic font-bold text-purple-300 text-sm">
                    {calculatedMoon}
                  </span>
                </div>
                <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                  <span className="text-gray-400 text-[10px] block">Sendero de Vida</span>
                  <span className="font-serif italic font-bold text-emerald-400 text-sm">
                    Número {calculatedLifePath}
                  </span>
                </div>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-2xl text-center font-bold animate-fadeIn">
                ✓ Tus datos astrológicos han sido guardados exitosamente.
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#D4AF37] text-black font-bold uppercase tracking-[0.2em] py-3.5 rounded-2xl text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Guardar Mis Datos Reales
            </button>
          </form>
        )}

        {/* TAB 3: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="space-y-3 animate-fadeIn">
            {savedReadings.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs italic">
                Aún no tienes lecturas guardadas. Realiza una tirada de Tarot o escaneo de manos para comenzar tu diario sagrado.
              </div>
            ) : (
              savedReadings.map(item => (
                <div
                  key={item.id}
                  className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider">
                        {item.type}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{item.date}</span>
                    </div>
                    <h5 className="font-serif italic font-bold text-xs text-white truncate">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.summary}</p>
                  </div>
                  <button
                    onClick={() => onDeleteReading(item.id)}
                    className="text-gray-400 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                    title="Eliminar registro"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: SEGURIDAD & NUBE */}
        {activeTab === 'seguridad' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Biometric Lock Toggle */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D4AF37] text-2xl">
                    fingerprint
                  </span>
                  <div>
                    <span className="font-serif italic font-bold text-sm text-white block">
                      Autenticación Biométrica
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Protege tus lecturas esotéricas con huella dactilar.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleBiometrics}
                disabled={isBiometricAuthenticating}
                className={`w-full py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  user.biometricEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {user.biometricEnabled ? 'lock_open' : 'lock'}
                </span>
                {isBiometricAuthenticating
                  ? 'Verificando sensor biométrico...'
                  : user.biometricEnabled
                  ? 'Bloqueo Biométrico Activo (Desactivar)'
                  : 'Activar Bloqueo Biométrico'}
              </button>
            </div>

            {/* Cloud Storage & Sync */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
              <div>
                <span className="font-serif italic font-bold text-sm text-purple-300 block">
                  Copia de Seguridad en la Nube
                </span>
                <span className="text-[11px] text-gray-400">
                  Exporta o restaura tus cartas natales y lecturas de tarot encriptadas.
                </span>
              </div>

              {cloudSyncStatus && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-xl text-center font-semibold">
                  {cloudSyncStatus}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCloudBackup}
                  className="bg-white/5 text-[#D4AF37] border border-white/15 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  Exportar
                </button>

                <label className="bg-white/5 text-purple-300 border border-white/15 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex items-center justify-center gap-1 cursor-pointer text-center">
                  <span className="material-symbols-outlined text-sm">cloud_download</span>
                  Restaurar
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
