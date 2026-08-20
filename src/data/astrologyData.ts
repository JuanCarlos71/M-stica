import { NatalChart, PlanetPosition, NatalHouse, NatalAspect, MoonPhaseInfo, CelestialEvent } from '../types';

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'Fuego', modality: 'Cardinal', ruler: 'Marte', start: [3, 21], end: [4, 19], color: '#ff6b6b' },
  { name: 'Tauro', symbol: '♉', element: 'Tierra', modality: 'Fijo', ruler: 'Venus', start: [4, 20], end: [5, 20], color: '#68d391' },
  { name: 'Géminis', symbol: '♊', element: 'Aire', modality: 'Mutable', ruler: 'Mercurio', start: [5, 21], end: [6, 20], color: '#f6e05e' },
  { name: 'Cáncer', symbol: '♋', element: 'Agua', modality: 'Cardinal', ruler: 'La Luna', start: [6, 21], end: [7, 22], color: '#90cdf4' },
  { name: 'Leo', symbol: '♌', element: 'Fuego', modality: 'Fijo', ruler: 'El Sol', start: [7, 23], end: [8, 22], color: '#f6ad55' },
  { name: 'Virgo', symbol: '♍', element: 'Tierra', modality: 'Mutable', ruler: 'Mercurio', start: [8, 23], end: [9, 22], color: '#81e6d9' },
  { name: 'Libra', symbol: '♎', element: 'Aire', modality: 'Cardinal', ruler: 'Venus', start: [9, 23], end: [10, 22], color: '#f687b3' },
  { name: 'Escorpio', symbol: '♏', element: 'Agua', modality: 'Fijo', ruler: 'Plutón / Marte', start: [10, 23], end: [11, 21], color: '#d53f8c' },
  { name: 'Sagitario', symbol: '♐', element: 'Fuego', modality: 'Mutable', ruler: 'Júpiter', start: [11, 22], end: [12, 21], color: '#b794f4' },
  { name: 'Capricornio', symbol: '♑', element: 'Tierra', modality: 'Cardinal', ruler: 'Saturno', start: [12, 22], end: [1, 19], color: '#cbd5e0' },
  { name: 'Acuario', symbol: '♒', element: 'Aire', modality: 'Fijo', ruler: 'Urano / Saturno', start: [1, 20], end: [2, 18], color: '#63b3ed' },
  { name: 'Piscis', symbol: '♓', element: 'Agua', modality: 'Mutable', ruler: 'Neptuno / Júpiter', start: [2, 19], end: [3, 20], color: '#4fd1c5' }
];

export const ZODIAC_AFFIRMATIONS: Record<string, string[]> = {
  Aries: [
    'Mi fuego interior abre caminos sagrados y supera cualquier obstáculo con valentía divina.',
    'Actúo con determinación impecable y confío plenamente en el poder de mi iniciativa.'
  ],
  Tauro: [
    'Mi energía arraiga la prosperidad y la belleza tangible en cada rincón de mi existencia.',
    'Merezco la abundancia serena que el universo me entrega en perfecta armonía.'
  ],
  Géminis: [
    'Mi mente es un templo de luz donde florecen ideas brillantes y conexiones mágicas.',
    'Comunico mi verdad con gracia, elocuencia y empatía sincera.'
  ],
  Cáncer: [
    'Honro la sabiduría de mis mareas emocionales como la fuente suprema de mi intuición.',
    'Mi hogar interior es un santuario sagrado de amor incondicional y protección.'
  ],
  Leo: [
    'Irradio la luz dorada de mi corazón y permito que mi autenticidad bendiga a los demás.',
    'Merezco reinar en mi propia vida con generosidad, nobleza y júbilo.'
  ],
  Virgo: [
    'Cada detalle de mi vida está guiado por la perfección y la sanación cósmica.',
    'Pongo mis dones al servicio sagrado del amor universal con humildad y excelencia.'
  ],
  Libra: [
    'Soy un canal de armonía, belleza y justicia que equilibra todas mis relaciones.',
    'Elijo la paz interior como mi brújula inquebrantable en cada decisión.'
  ],
  Escorpio: [
    'Abrazo mi poder de transmutación: de cada ceniza renazco más sabio, magnético y libre.',
    'Penetro los misterios del alma con valentía y pureza de intención.'
  ],
  Sagitario: [
    'Mi flecha apunta a las estrellas más altas; el cosmos guía mis pasos hacia la verdad.',
    'La sabiduría y la alegría de vivir se expanden infinitamente a mi paso.'
  ],
  Capricornio: [
    'Construyo mi destino con paciencia sagrada, integridad intachable y maestría.',
    'Corono la cima de mis anhelos mientras mantengo mi espíritu humilde y fuerte.'
  ],
  Acuario: [
    'Soy la vanguardia de una nueva era; mis visiones inspiran la libertad y la fraternidad.',
    'Acepto mi originalidad única como el regalo más preciado que tengo para dar al mundo.'
  ],
  Piscis: [
    'Navego el océano de la conciencia cósmica guiado por el amor universal y la magia divina.',
    'Mis sueños son visiones sagradas que se plasman en bendiciones reales.'
  ]
};

export function getSunSign(month: number, day: number): string {
  for (const sign of ZODIAC_SIGNS) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if (sm > em) {
      // Capricorn (Dec to Jan)
      if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) {
        return sign.name;
      }
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed)) {
        return sign.name;
      }
    }
  }
  return 'Aries';
}

export function calculateAscendant(birthDate: string, birthTime: string, _birthPlace: string): string {
  if (!birthTime) return 'Leo';
  const [h, m] = birthTime.split(':').map(Number);
  const timeInMinutes = (h || 12) * 60 + (m || 0);

  // Approximate Ascendant calculation based on sidereal time mapping
  const signIndex = Math.floor((timeInMinutes / 120) + (new Date(birthDate || '1995-05-15').getMonth() * 1.5)) % 12;
  return ZODIAC_SIGNS[Math.abs(signIndex)]?.name || 'Leo';
}

export function calculateMoonSign(birthDate: string): string {
  if (!birthDate) return 'Cáncer';
  const d = new Date(birthDate);
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  // Moon spends roughly 2.3 days per sign
  const moonIndex = Math.floor((dayOfYear / 2.3) + d.getFullYear()) % 12;
  return ZODIAC_SIGNS[Math.abs(moonIndex)]?.name || 'Cáncer';
}

export function calculateFullNatalChart(
  fullName: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string
): NatalChart {
  const parts = (birthDate || '1996-07-24').split('-').map(Number);
  const month = parts[1] || 7;
  const day = parts[2] || 24;

  const sunSign = getSunSign(month, day);
  const moonSign = calculateMoonSign(birthDate);
  const ascendantSign = calculateAscendant(birthDate, birthTime, birthPlace);

  const planets: PlanetPosition[] = [
    { planet: 'Sol', symbol: '☉', sign: sunSign, degree: 14.5, house: 1, isRetrograde: false, description: 'La esencia de tu ego consciente, propósito álmico y vitalidad creadora.' },
    { planet: 'Luna', symbol: '☽', sign: moonSign, degree: 22.1, house: 4, isRetrograde: false, description: 'Tu subconsciente, patrones de nutrición afectiva e intuición maternal.' },
    { planet: 'Ascendente', symbol: 'AC', sign: ascendantSign, degree: 8.3, house: 1, isRetrograde: false, description: 'La máscara cósmica, el vehículo físico y cómo te proyectas al universo.' },
    { planet: 'Mercurio', symbol: '☿', sign: getNeighborSign(sunSign, 1), degree: 19.8, house: 2, isRetrograde: false, description: 'Procesos cognitivos, agilidad mental y estilo comunicativo.' },
    { planet: 'Venus', symbol: '♀', sign: getNeighborSign(sunSign, -1), degree: 5.4, house: 5, isRetrograde: false, description: 'El magnetismo del amor, valores sagrados, estética y capacidad de disfrute.' },
    { planet: 'Marte', symbol: '♂', sign: getNeighborSign(sunSign, 2), degree: 27.2, house: 8, isRetrograde: false, description: 'El impulso guerrero, la pasión visceral, el coraje y la fuerza de conquista.' },
    { planet: 'Júpiter', symbol: '♃', sign: getNeighborSign(sunSign, 4), degree: 11.0, house: 9, isRetrograde: false, description: 'El gran benefactor: expansión de horizontes, abundancia, fe y filosofía superior.' },
    { planet: 'Saturno', symbol: '♄', sign: getNeighborSign(sunSign, 6), degree: 16.7, house: 10, isRetrograde: true, description: 'El señor del tiempo y el karma: disciplina, maestría y madurez espiritual.' },
    { planet: 'Urano', symbol: '♅', sign: 'Tauro', degree: 23.4, house: 11, isRetrograde: false, description: 'El rayo del despertar: genialidad súbita, innovación y libertad radical.' },
    { planet: 'Neptuno', symbol: '♆', sign: 'Piscis', degree: 29.1, house: 12, isRetrograde: false, description: 'El velo místico: compasión universal, inspiración poética y conexión extrasensorial.' },
    { planet: 'Plutón', symbol: '♇', sign: 'Acuario', degree: 2.1, house: 6, isRetrograde: true, description: 'El alquimista supremo: transmutación profunda, regeneración y poder soberano.' },
    { planet: 'Quirón', symbol: '⚷', sign: 'Aries', degree: 18.0, house: 3, isRetrograde: false, description: 'El sanador herido: el dolor transmutado en tu mayor medicina para otros.' },
    { planet: 'Nodo Norte', symbol: '☊', sign: 'Aries', degree: 7.6, house: 7, isRetrograde: true, description: 'La brújula de evolución del alma: el sendero que viniste a conquistar en esta encarnación.' }
  ];

  const ascIndex = ZODIAC_SIGNS.findIndex(s => s.name === ascendantSign);
  const houses: NatalHouse[] = Array.from({ length: 12 }, (_, i) => {
    const sIndex = (ascIndex + i) % 12;
    const sign = ZODIAC_SIGNS[sIndex];
    return {
      houseNumber: i + 1,
      sign: sign.name,
      ruler: sign.ruler,
      theme: getHouseTheme(i + 1)
    };
  });

  const aspects: NatalAspect[] = [
    { planet1: 'Sol', planet2: 'Júpiter', aspectType: 'Trígono', orb: 2.1, influence: 'Armónica', meaning: 'Optimismo natural, protección cósmica y facilidad para atraer oportunidades generosas.' },
    { planet1: 'Luna', planet2: 'Neptuno', aspectType: 'Sextil', orb: 1.4, influence: 'Armónica', meaning: 'Alta sensibilidad psíquica, capacidad de canalización artística y compasión empática.' },
    { planet1: 'Mercurio', planet2: 'Plutón', aspectType: 'Trígono', orb: 3.2, influence: 'Armónica', meaning: 'Mente penetrante que desvela verdades ocultas y dotes de persuasión magnética.' },
    { planet1: 'Marte', planet2: 'Saturno', aspectType: 'Cuadratura', orb: 2.8, influence: 'Kármica', meaning: 'Lección de templar la impaciencia con perseverancia inquebrantable para lograr la maestría.' },
    { planet1: 'Venus', planet2: 'Urano', aspectType: 'Sextil', orb: 1.9, influence: 'Armónica', meaning: 'Atracción por lo vanguardista, carisma magnético y amor vivido en libertad consciente.' }
  ];

  const counts: Record<string, number> = { Fuego: 0, Tierra: 0, Aire: 0, Agua: 0 };
  planets.forEach(p => {
    const s = ZODIAC_SIGNS.find(z => z.name === p.sign);
    if (s) counts[s.element] = (counts[s.element] || 0) + 1;
  });

  const dominant = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as 'Fuego' | 'Tierra' | 'Aire' | 'Agua') || 'Fuego';

  return {
    sunSign,
    sunDegree: 14.5,
    moonSign,
    moonDegree: 22.1,
    ascendantSign,
    ascendantDegree: 8.3,
    midheavenSign: getNeighborSign(ascendantSign, 9),
    planets,
    houses,
    aspects,
    dominantElement: dominant,
    elementBalance: {
      fuego: counts.Fuego || 3,
      tierra: counts.Tierra || 2,
      aire: counts.Aire || 4,
      agua: counts.Agua || 4
    },
    interpretation: {
      soulMission: `Tu Sol en ${sunSign} te confiere la sagrada misión de iluminar con integridad y maestría tus proyectos de vida.`,
      emotionalInnerWorld: `Tu Luna en ${moonSign} revela que tu refugio de paz se encuentra en la autenticidad emocional profunda y la armonía íntima.`,
      socialMaskAndAppearance: `Con tu Ascendente en ${ascendantSign}, el mundo te percibe como una persona magnética, carismática y provista de una presencia luminosa.`,
      karmicLessons: 'Aprender a discernir entre las expectativas ajenas y el llamado auténtico de tu espíritu.',
      strengths: ['Intuición penetrante', 'Capacidad de manifestación', 'Liderazgo compasivo', 'Resiliencia alquímica'],
      shadowToIntegrate: 'La autoexigencia excesiva y el temor a mostrar tu vulnerabilidad más pura.'
    }
  };
}

function getNeighborSign(baseSign: string, offset: number): string {
  const idx = ZODIAC_SIGNS.findIndex(s => s.name === baseSign);
  if (idx === -1) return 'Leo';
  const newIdx = (idx + offset + 12) % 12;
  return ZODIAC_SIGNS[newIdx].name;
}

function getHouseTheme(house: number): string {
  const themes = [
    'Identidad, Autoexpresión, Cuerpo Físico',
    'Recursos, Valores, Abundancia Material',
    'Comunicación, Entorno Cercano, Intelecto',
    'Hogar, Raíces Familiares, Intimidad',
    'Creatividad, Romance, Autoexpresión Gozosa',
    'Salud, Rutinas Sagradas, Servicio',
    'Vínculos Sagrados, Matrimonio, Asociaciones',
    'Transmutación, Recursos Compartidos, Misterio',
    'Filosofía Superior, Viajes del Alma, Sabiduría',
    'Vocación, Legado Público, Maestría Social',
    'Comunidad, Ideales Futuros, Fraternidad',
    'Subconsciente, Trascendencia, Retiro Místico'
  ];
  return themes[house - 1] || 'Evolución Álmica';
}

export function getCurrentMoonPhase(): MoonPhaseInfo {
  const now = new Date();
  // Known reference new moon: 2026-08-12
  const refNewMoon = new Date('2026-08-12T00:00:00Z').getTime();
  const diffDays = (now.getTime() - refNewMoon) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.53058770576;
  const phaseDays = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;

  let phaseName = 'Luna Llena';
  let illumination = 96;
  let spiritualMeaning = 'Cúspide de manifestación, culminación de intenciones y máxima amplificación psíquica.';
  let ritualAdvice = 'Carga tus cristales a la luz lunar, realiza baños de hierbas y expresa gratitud profunda.';

  if (phaseDays < 3.7) {
    phaseName = 'Luna Nueva';
    illumination = 2;
    spiritualMeaning = 'Siembra sagrada en la oscuridad fértil. Nuevos comienzos y fijación de intenciones puras.';
    ritualAdvice = 'Escribe tus deseos más íntimos y enciende una vela blanca en meditación silente.';
  } else if (phaseDays < 11) {
    phaseName = 'Cuarto Creciente';
    illumination = 54;
    spiritualMeaning = 'Impulso vital y acción decidida. La semilla rompe la tierra con fuerza luminosa.';
    ritualAdvice = 'Toma decisiones firmes y vence la procrastinación con pequeños actos de valentía.';
  } else if (phaseDays < 18.5) {
    phaseName = 'Luna Llena';
    illumination = 98;
    spiritualMeaning = 'La reina del cielo en su máximo esplendor. Revelaciones proféticas y desborde creativo.';
    ritualAdvice = 'Celebra tus logros, canaliza la energía con danzas sagradas y purifica tu altar.';
  } else {
    phaseName = 'Cuarto Menguante';
    illumination = 42;
    spiritualMeaning = 'Purificación y desapego. Soltar las hojas secas para preparar el próximo renacer.';
    ritualAdvice = 'Limpia tu espacio con sahumerio, perdona viejos agravios y descansa el cuerpo físico.';
  }

  return {
    phaseName,
    illumination,
    moonSign: 'Escorpio',
    spiritualMeaning,
    ritualAdvice,
    nextPeak: 'Próxima Luna Nueva: 11 de Septiembre, 2026'
  };
}

export const CELESTIAL_EVENTS: CelestialEvent[] = [
  {
    id: 'evt-1',
    title: 'Luna Llena en Escorpio (Superluna)',
    description: 'La marea cósmica más intensa del ciclo. Momento cumbre de transmutación y revelación de secretos del subconsciente.',
    date: '2026-08-28',
    type: 'lunar',
    influence: 'Profundidad emocional, magnetismo sexual y liberación de patrones kármicos.',
    zodiacSign: 'Escorpio'
  },
  {
    id: 'evt-2',
    title: 'Ingreso del Sol en Virgo',
    description: 'Comienzo de la temporada de orden sagrado, alquimia de la rutina y cuidado consciente del templo corporal.',
    date: '2026-08-23',
    type: 'planetary',
    influence: 'Claridad analítica, discernimiento y devoción al servicio.',
    zodiacSign: 'Virgo'
  },
  {
    id: 'evt-3',
    title: 'Lluvia de Estrellas Perseidas',
    description: 'Lágrimas de San Lorenzo cruzando la atmósfera terrestre con destellos celestiales.',
    date: '2026-08-12',
    type: 'aspect',
    influence: 'Petición de deseos cuánticos, apertura de canales intuitivos.'
  },
  {
    id: 'evt-4',
    title: 'Trígono de Agua: Luna-Neptuno-Saturno',
    description: 'Alineación mística que permite manifestar los sueños espirituales en estructuras sólidas terrenales.',
    date: '2026-09-04',
    type: 'aspect',
    influence: 'Inspiración poética, paz mental duradera y sanación transgeneracional.'
  }
];
