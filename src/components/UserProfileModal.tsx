import React, { useState } from 'react';
import { UserProfile, SavedReading, NatalChart, PalmAnalysis } from '../types';
import { exportFullMysticReportPDF } from '../services/pdfExporter';
import { mysticAudio } from '../services/audioAmbience';
import confetti from 'canvas-confetti';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  savedReadings: SavedReading[];
  onDeleteReading: (id: string) => void;
  currentChart?: NatalChart | null;
  currentPalm?: PalmAnalysis | null;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  savedReadings,
  onDeleteReading,
  currentChart,
  currentPalm
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'historial' | 'seguridad'>('perfil');
  const [isBiometricAuthenticating, setIsBiometricAuthenticating] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

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
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Celestial_Alchemy_Backup_${user.fullName.replace(/\s+/g, '_')}.json`;
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
        } catch (err) {
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

        {/* User Card Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-[#0f0c1d] rounded-full"></span>
          </div>
          <div>
            <h3 className="font-serif italic text-xl font-bold text-white">
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

        {/* Sub-tabs */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-5">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'perfil'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('historial')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'historial'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Historial ({savedReadings.length})
          </button>
          <button
            onClick={() => setActiveTab('seguridad')}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'seguridad'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Seguridad
          </button>
        </div>

        {/* Tab 1: Perfil */}
        {activeTab === 'perfil' && (
          <div className="space-y-4">
            {/* Avatar Selector */}
            <div>
              <label className="block text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-2">
                Seleccionar Avatar
              </label>
              <div className="flex gap-2">
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

        {/* Tab 2: Historial */}
        {activeTab === 'historial' && (
          <div className="space-y-3">
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

        {/* Tab 3: Seguridad & Nube */}
        {activeTab === 'seguridad' && (
          <div className="space-y-4">
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
                  {isBiometricAuthenticating ? 'sync' : 'verified_user'}
                </span>
                {isBiometricAuthenticating
                  ? 'Escaneando huella digital...'
                  : user.biometricEnabled
                  ? 'Bloqueo con Huella Activado'
                  : 'Vincular Huella Digital'}
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
