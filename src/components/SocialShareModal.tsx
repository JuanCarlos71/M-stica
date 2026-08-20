import React, { useState, useRef } from 'react';
import { mysticAudio } from '../services/audioAmbience';
import confetti from 'canvas-confetti';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  content
}) => {
  const [copied, setCopied] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'story' | 'square'>('story');
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(
      `✨ ${title}\n\n"${content}"\n\n🔮 Revelado en Celestial Alchemy • Quiromancia, Tarot & Astrología`
    );
    setCopied(true);
    mysticAudio.playChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Celestial Alchemy — ${title}`,
          text: `✨ ${title}\n\n"${content}"\n\n🔮 Revelado en Celestial Alchemy`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      handleCopyText();
    }
  };

  const handleDownloadImage = () => {
    // Generate high quality canvas representation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = aspectRatio === 'story' ? 1080 : 1080;
    const height = aspectRatio === 'story' ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;

    // Dark Mystic Background
    ctx.fillStyle = '#0c0e12';
    ctx.fillRect(0, 0, width, height);

    // Golden Radial Glow
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      width / 1.5
    );
    gradient.addColorStop(0, 'rgba(242, 202, 80, 0.15)');
    gradient.addColorStop(1, 'rgba(12, 14, 18, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Gold Ornamental Border
    ctx.strokeStyle = '#f2ca50';
    ctx.lineWidth = 6;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // Inner Subtle Border
    ctx.strokeStyle = '#4d4635';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, width - 160, height - 160);

    // Brand Header
    ctx.fillStyle = '#f2ca50';
    ctx.font = 'bold 44px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText('CELESTIAL ALCHEMY', width / 2, height > 1200 ? 260 : 180);

    ctx.fillStyle = '#cfcece';
    ctx.font = '24px "Manrope", sans-serif';
    ctx.fillText('✦ ORÁCULO DE LOS MISTERIOS SAGRADOS ✦', width / 2, height > 1200 ? 320 : 230);

    // Reading Title
    ctx.fillStyle = '#dcb8ff';
    ctx.font = 'bold 54px "Playfair Display", serif';
    ctx.fillText(title, width / 2, height > 1200 ? 560 : 400);

    // Content text with automatic wrapping
    ctx.fillStyle = '#e1e2e7';
    ctx.font = '36px "Manrope", sans-serif';
    const words = content.split(' ');
    let line = '';
    let y = height > 1200 ? 720 : 520;
    const maxWidth = width - 260;
    const lineHeight = 58;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, width / 2, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, width / 2, y);

    // Watermark / Signature
    ctx.fillStyle = '#99907c';
    ctx.font = '26px "Manrope", sans-serif';
    ctx.fillText('✨ Revelado en tu perfil sagrado • Celestial Alchemy', width / 2, height - 160);

    // Download PNG
    const link = document.createElement('a');
    link.download = `Celestial_Alchemy_${title.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f2ca50', '#dcb8ff']
    });
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

        <h3 className="font-serif italic text-2xl font-bold text-white text-center mb-1">
          Compartir Revelación
        </h3>
        <p className="text-xs text-gray-400 text-center mb-5">
          Genera una tarjeta estética para Instagram Stories o estados.
        </p>

        {/* Aspect Ratio Selector */}
        <div className="flex justify-center gap-2 mb-5">
          <button
            onClick={() => setAspectRatio('story')}
            className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              aspectRatio === 'story'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            📱 Historia (9:16)
          </button>
          <button
            onClick={() => setAspectRatio('square')}
            className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              aspectRatio === 'square'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            🖼️ Cuadrado (1:1)
          </button>
        </div>

        {/* Live Card Preview */}
        <div
          ref={cardRef}
          className={`w-full mx-auto bg-gradient-to-b from-[#18112e] via-[#0f0c1d] to-[#080512] border border-[#D4AF37]/50 rounded-3xl p-5 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)] mb-5 ${
            aspectRatio === 'story' ? 'aspect-[9/16] max-h-[380px]' : 'aspect-square max-h-[320px]'
          }`}
        >
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-serif italic text-xs font-bold text-[#D4AF37] tracking-wider">
              CELESTIAL ALCHEMY
            </span>
            <span className="text-xs text-purple-300">✧ ✦ ✧</span>
          </div>

          <div className="my-auto px-2">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 mx-auto flex items-center justify-center border border-[#D4AF37]/30 mb-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <span className="material-symbols-outlined text-[#D4AF37] text-xl">auto_awesome</span>
            </div>
            <h4 className="font-serif italic text-base font-bold text-white mb-2 leading-snug">
              {title}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed italic line-clamp-4">
              "{content}"
            </p>
          </div>

          <div className="w-full pt-2 border-t border-white/10 flex justify-between items-center text-[9px] text-gray-400 uppercase tracking-wider">
            <span>✨ Revelación Personal</span>
            <span>#CelestialAlchemy</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleDownloadImage}
            className="bg-[#D4AF37] text-black font-bold uppercase tracking-wider py-3 rounded-2xl text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Guardar Imagen
          </button>
          <button
            onClick={handleNativeShare}
            className="bg-white/10 text-white border border-white/15 font-bold uppercase tracking-wider py-3 rounded-2xl text-[10px] hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">share</span>
            Compartir
          </button>
        </div>

        <button
          onClick={handleCopyText}
          className="w-full text-xs text-purple-300 hover:text-purple-200 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Texto copiado al portapapeles' : 'Copiar texto para WhatsApp / Telegram'}
        </button>
      </div>
    </div>
  );
};
