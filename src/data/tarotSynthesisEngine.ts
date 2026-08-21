import { DrawnCard } from '../types';

export function generateLocalTarotSynthesis(
  spreadName: string,
  drawnCards: DrawnCard[],
  userName: string,
  userSign: string
): string {
  if (!drawnCards || drawnCards.length === 0) {
    return 'No hay cartas extraídas en la mesa sagrada.';
  }

  const primaryCard = drawnCards[0];
  const lastCard = drawnCards[drawnCards.length - 1];

  const synthesisSections = drawnCards.map((d, index) => {
    const orientation = d.isReversed ? 'Invertida' : 'Al Derecho';
    const mainMeaning = d.isReversed ? d.card.reversedMeaning : d.card.uprightMeaning;
    const keywords = d.card.keywords.slice(0, 3).join(', ');

    return `✦ **${index + 1}. ${d.positionName} — ${d.card.name} (${orientation})**\n` +
      `*Energía de la posición:* ${d.positionMeaning}\n` +
      `*Vibración clave:* ${keywords} (Elemento: ${d.card.element}, Regente: ${d.card.astrologicalRuler || 'Cosmos'})\n` +
      `*Interpretación:* ${mainMeaning}`;
  }).join('\n\n');

  // Elemental balance analysis
  const elementsCount: Record<string, number> = {};
  drawnCards.forEach(d => {
    const el = d.card.element.split('/')[0].trim();
    elementsCount[el] = (elementsCount[el] || 0) + 1;
  });

  const dominantElement = Object.entries(elementsCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Éter';

  const elementalGuidance: Record<string, string> = {
    Fuego: 'Predomina el Fuego: tiempo de acción valiente, pasión y liderazgo consciente.',
    Agua: 'Predomina el Agua: atiende a tus emociones profundas, intuición y procesos de sanación afectiva.',
    Aire: 'Predomina el Aire: claridad mental, comunicación estratégica y necesidad de tomar decisiones objetivas.',
    Tierra: 'Predomina la Tierra: consolidación material, paciencia, orden y trabajo en cimientos duraderos.'
  };

  const adviceByDominant = elementalGuidance[dominantElement] || 'Equilibrio elemental propicio para la manifestación.';

  return `🏛️ **Síntesis Magistral de la Tirada: ${spreadName}**\n\n` +
    `*Consultante:* **${userName || 'Iniciado'}** (Signo Solar: ${userSign})\n` +
    `*Arquetipo Dominante:* **${primaryCard.card.name}** abriendo el sendero hacia **${lastCard.card.name}**.\n\n` +
    `---\n\n` +
    `${synthesisSections}\n\n` +
    `---\n\n` +
    `🔮 **Clima Elemental & Consejo Alquímico:**\n` +
    `${adviceByDominant}\n\n` +
    `🕯️ **Afirmación Sagrada del Oráculo:**\n` +
    `*"${primaryCard.card.spiritualAffirmation || 'Confío en la sabiduría infinita del cosmos y actúo con pureza de corazón.'}"*`;
}
