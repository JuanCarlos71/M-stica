import { PalmAnalysis, PalmLineDetail } from '../types';

export function analyzePalmData(handSide: 'left' | 'right', seed = 42): PalmAnalysis {
  const isLeft = handSide === 'left';

  const lines: PalmLineDetail[] = [
    {
      id: 'heart-line',
      name: 'Línea del Corazón',
      traditionalName: 'Línea Mensalis / Sendero del Amor',
      description: isLeft
        ? 'Revela tu capacidad innata para amar incondicionalmente y los pactos álmicos heredados.'
        : 'Muestra cómo expresas tus afectos actualmente, tus elecciones románticas y tu madurez emocional.',
      score: 92,
      depth: 'Profunda y Clara',
      reading: isLeft
        ? 'Trazo largo y curvado hacia el monte de Júpiter: denota un corazón noble, leal y generoso, con capacidad para perdonar y transformar el dolor en compasión pura.'
        : 'Línea nítida y sin interrupciones mayores: augura estabilidad afectiva, relaciones basadas en el respeto mutuo y una gran empatía hacia tu pareja y comunidad.',
      chakra: 'Chakra Anahata (Corazón)',
      color: '#dcb8ff'
    },
    {
      id: 'head-line',
      name: 'Línea de la Cabeza',
      traditionalName: 'Línea Cephalica / Sendero de la Mente',
      description: isLeft
        ? 'Tus dones intelectuales latentes, intuición innata y estructura de pensamiento subconsciente.'
        : 'Tu agilidad mental práctica, capacidad de toma de decisiones y concentración en tus metas.',
      score: 88,
      depth: 'Ondulada y Creativa',
      reading: isLeft
        ? 'Inclinación sutil hacia el monte de la Luna: profunda inclinación natural hacia el arte, la filosofía oculta y la percepción extrasensorial.'
        : 'Bifurcación luminosa al final (tenedor del escritor): talento sobresaliente para combinar el razonamiento lógico con la chispa visionaria y la diplomacia.',
      chakra: 'Chakra Ajna (Tercer Ojo)',
      color: '#f2ca50'
    },
    {
      id: 'life-line',
      name: 'Línea de la Vida',
      traditionalName: 'Línea Vitalis / Sendero del Fuego Vital',
      description: isLeft
        ? 'La constitución física de nacimiento y la reserva primordial de energía vital (Prana/Chi).'
        : 'La vitalidad que manifiestas hoy, tu estilo de vida, resiliencia y longevidad activa.',
      score: 95,
      depth: 'Profunda y Clara',
      reading: isLeft
        ? 'Arco amplio que abraza con generosidad el monte de Venus: robustez biológica natural, amor apasionado por la existencia y resistencia ante adversidades.'
        : 'Trazo continuo y luminoso con ramificaciones ascendentes: etapas de expansión continua, renovación celular y rejuvenecimiento espiritual.',
      chakra: 'Chakra Muladhara (Raíz)',
      color: '#ffe088'
    },
    {
      id: 'fate-line',
      name: 'Línea del Destino / Saturnina',
      traditionalName: 'Línea Saturnina / Sendero del Propósito',
      description: isLeft
        ? 'El blueprint kármico y la vocación original con la que encarnó tu alma.'
        : 'El éxito profesional materializado, la autonomía económica y la realización de tu misión.',
      score: 84,
      depth: 'Fina y Espiritual',
      reading: isLeft
        ? 'Origen en la base de la palma conectando con la Luna: tu destino está impulsado por la vocación de servicio y el apoyo de personas sinceras.'
        : 'Asciende con fuerza hacia el monte de Saturno: conquista de logros por perseverancia propia, liderazgo respetado y consolidación de un legado honorable.',
      chakra: 'Chakra Manipura (Plexo Solar)',
      color: '#cfcece'
    }
  ];

  return {
    handSide,
    element: isLeft ? 'Agua' : 'Fuego',
    elementDescription: isLeft
      ? 'Mano de Agua (Psíquica e Intuitiva): Palma rectangular con dedos esbeltos. Gran sensibilidad emocional, percepción extrasensorial y dotes artísticos.'
      : 'Mano de Fuego (Luminosa y Enérgica): Palma larga con dedos dinámicos. Pasión arrolladora, liderazgo carismático y capacidad de acción imparable.',
    vitalityScore: isLeft ? 90 : 94,
    intuitionScore: isLeft ? 96 : 89,
    emotionalScore: isLeft ? 93 : 91,
    fortuneScore: isLeft ? 86 : 95,
    lines,
    mounts: {
      venus: 'Prominente y cálido: Pasión desbordante, sensualidad refinada y magnetismo para atraer el amor.',
      luna: 'Bien desarrollado: Gran imaginación, conexión con los sueños lúcidos y afinidad con los ciclos lunares.',
      jupiter: 'Elevado y firme: Ambición noble, dotes de guía espiritual y confianza en el triunfo personal.',
      mercurio: 'Ágil y marcado: Facilidad para la oratoria persuasiva, comercio y comprensión rápida de conceptos.',
      sol: 'Luminoso: Búsqueda de la belleza, distinción personal y reconocimiento público merecido.'
    },
    generalReading: isLeft
      ? 'Tu mano izquierda custodia un templo de dones ancestrales extraordinarios. Posees una intuición psíquica que percibe lo que otros callan, con un destino sellado para la sanación, el arte y la elevación de conciencia.'
      : 'Tu mano derecha demuestra cómo has tomado las riendas de tu realidad. Has transmutado desafíos pasados en maestría y tus líneas indican un período inminente de gran cosecha material y realización de tu vocación más elevada.',
    spiritualGuidance: isLeft
      ? 'Honra tus sueños nocturnos y confía en el primer susurro de tu intuición antes de racionalizarlo.'
      : 'Es el momento perfecto para lanzar ese proyecto o afianzar ese pacto de amor; las líneas de la fortuna convergen a tu favor.',
    timestamp: new Date().toISOString()
  };
}
