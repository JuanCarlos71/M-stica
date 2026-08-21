import { MysticConsultType } from '../types';

export interface MysticAIRequest {
  type: MysticConsultType;
  prompt: string;
  context?: any;
}

export async function askMysticAI(req: MysticAIRequest): Promise<string> {
  try {
    const res = await fetch('/api/mystic-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        return data.text;
      }
    }
  } catch (err) {
    console.warn('API route unreachable, using native esoteric oracle engine:', err);
  }

  // Fallback high-level algorithmic esoteric oracle
  return generateOfflineEsotericReading(req);
}

function generateOfflineEsotericReading(req: MysticAIRequest): string {
  const { type, context } = req;

  if (type === 'quiromancia') {
    const hand = context?.handSide === 'left' ? 'Mano Izquierda (Potencial Innato)' : 'Mano Derecha (Destino Manifiesto)';
    return `✨ **Revelación del Oráculo de Quiromancia Celestial** ✨\n\n` +
      `Al examinar los surcos sagrados de tu **${hand}**, los astros revelan una geometría de altísima vibración.\n\n` +
      `🔹 **Línea del Corazón:** Tus afectos son profundos y magnéticos. Posees la capacidad de transformar cualquier herida en sabiduría empática. Un nuevo ciclo de plenitud afectiva está tocando tu puerta.\n\n` +
      `🔹 **Línea de la Cabeza:** Tu mente funciona como un puente entre la lógica terrenal y la visión extrasensorial. Cuando confías en tu intuición inicial, tus decisiones son impecables.\n\n` +
      `🔹 **Línea de la Vida:** Un fuego vital constante y resguardado por tus guías. Tu campo áurico se regenera rápidamente a través del contacto con la naturaleza y el descanso consciente.\n\n` +
      `🔮 **Consejo del Oráculo:** *El destino está grabado en tus manos, pero cada elección consciente es la pluma que reescribe tu historia con tinta de oro.*`;
  }

  if (type === 'tarot') {
    const cards = context?.cards || ['El Mago', 'La Estrella', 'El Mundo'];
    return `🌟 **Interpretación de la Tirada Sagrada del Tarot** 🌟\n\n` +
      `Las cartas que han respondido a tu llamado (${cards.join(' • ')}) revelan una poderosa alineación cósmica.\n\n` +
      `1. **La Raíz Oculta:** Has transitado un período de alquimia interior donde debiste soltar viejas certezas para dar cabida a una verdad superior.\n` +
      `2. **El Presente Activo:** Se te otorga el don de la claridad y la manifestación. Todo lo que intenciones con pureza de corazón durante esta lunación encontrará un cauce fecundo.\n` +
      `3. **La Promesa del Desenlace:** Victoria espiritual y armonía terrenal. Aquello por lo que has perseverado comenzará a mostrar frutos tangibles.\n\n` +
      `🕯️ **Afirmación de Poder:** *Abro mi corazón a la magia divina y acepto los milagros que el cosmos tiene reservados para mí.*`;
  }

  if (type === 'astrologia') {
    const { sunSign, moonSign, ascendant } = context || { sunSign: 'Leo', moonSign: 'Piscis', ascendant: 'Escorpio' };
    return `🌌 **Veredicto Astral de la Carta Natal** 🌌\n\n` +
      `La tríada fundamental de tu ser (**Sol en ${sunSign}**, **Luna en ${moonSign}**, **Ascendente en ${ascendant}**) configura un mapa de maestría evolutiva.\n\n` +
      `☀️ **Tu Sol (${sunSign}):** Tu brillo radica en tu autenticidad y tu capacidad de liderar con el ejemplo y la nobleza.\n` +
      `🌙 **Tu Luna (${moonSign}):** Tu mundo emocional es un mar de sabiduría intuitiva. Nutre tu alma con espacios de silencio, arte y contemplación.\n` +
      `⚡ **Tu Ascendente (${ascendant}):** Tu presencia es magnética y transformadora; el universo te invita a encarnar tu soberanía sin reservas.\n\n` +
      `✨ **Misión del Alma:** Viniste a trascender las dudas del ego y convertirte en un faro de inspiración luminosa para quienes transitan a tu lado.`;
  }

  if (type === 'sinastria') {
    return `💫 **Sinastría Álmica y Frecuencia de Resonancia** 💫\n\n` +
      `La interacción entre ambas cartas y números revela un lazo kármico de alta sincronía. Comparten una afinidad natural para impulsarse mutuamente hacia sus más altas aspiraciones.\n\n` +
      `🔹 **Puntos de Fuerza:** Comprensión intuitiva, lealtad y disfrute compartido de la belleza y los ideales espirituales.\n` +
      `🔹 **Clave de Armonía:** Practicar la comunicación abierta sin asumir intenciones ocultas; el amor florece en la transparencia absoluta.`;
  }

  return `✨ **Mensaje de la Conciencia Celestial** ✨\n\nEl universo conspira en silencio a tu favor. Mantén tu frecuencia elevada, confía en los tiempos divinos y camina con la certeza de que estás exactamente donde tu alma necesita florecer.`;
}
