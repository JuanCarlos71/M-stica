import { NumerologyProfile } from '../types';

// Pythagorean letter values mapping
const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, j: 1, s: 1, á: 1, à: 1, â: 1, ä: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3, ú: 3, ù: 3, û: 3, ü: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5, é: 5, è: 5, ê: 5, ë: 5, ñ: 5,
  f: 6, o: 6, x: 6, ó: 6, ò: 6, ô: 6, ö: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9, í: 9, ì: 9, î: 9, ï: 9
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y', 'á', 'é', 'í', 'ó', 'ú', 'ü']);

export function reduceToSingleDigitOrMaster(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = num
      .toString()
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return num;
}

export function calculateLifePath(birthDateStr: string): number {
  if (!birthDateStr) return 7;
  const parts = birthDateStr.split('-').map(Number);
  if (parts.length < 3) return 7;
  const [year, month, day] = parts;
  
  const redDay = reduceToSingleDigitOrMaster(day);
  const redMonth = reduceToSingleDigitOrMaster(month);
  const redYear = reduceToSingleDigitOrMaster(
    year.toString().split('').reduce((a, b) => a + Number(b), 0)
  );

  return reduceToSingleDigitOrMaster(redDay + redMonth + redYear);
}

export function calculateNameNumbers(fullName: string) {
  if (!fullName) {
    return { expression: 11, soulUrge: 4, personality: 7 };
  }
  const clean = fullName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let expressionSum = 0;
  let soulSum = 0;
  let personalitySum = 0;

  for (const char of clean) {
    const val = PYTHAGOREAN_MAP[char];
    if (val) {
      expressionSum += val;
      if (VOWELS.has(char)) {
        soulSum += val;
      } else {
        personalitySum += val;
      }
    }
  }

  return {
    expression: reduceToSingleDigitOrMaster(expressionSum) || 11,
    soulUrge: reduceToSingleDigitOrMaster(soulSum) || 4,
    personality: reduceToSingleDigitOrMaster(personalitySum) || 7
  };
}

export function calculateLifePathNumber(birthDateStr: string): number {
  return calculateLifePath(birthDateStr);
}

export function calculateExpressionNumber(fullName: string): number {
  return calculateNameNumbers(fullName).expression;
}

export function calculateSoulUrgeNumber(fullName: string): number {
  return calculateNameNumbers(fullName).soulUrge;
}

export function calculateSynastry(lifePath1: number, lifePath2: number) {
  const diff = Math.abs(lifePath1 - lifePath2);
  let compatibilityScore = 75;
  let energyVibration = reduceToSingleDigitOrMaster(lifePath1 + lifePath2);

  if (diff === 0) compatibilityScore = 96;
  else if (diff === 2 || diff === 4) compatibilityScore = 88;
  else if (diff === 1 || diff === 3) compatibilityScore = 82;
  else if (diff === 5) compatibilityScore = 78;

  let title = 'Vínculo de Aprendizaje y Crecimiento Mutuo';
  if (compatibilityScore >= 90) title = 'Lazos de Almas Gemelas / Alta Resonancia';
  else if (compatibilityScore >= 80) title = 'Complementariedad Dinámica y Creativa';

  return {
    compatibilityScore,
    energyVibration,
    title,
    description: `La interacción entre el Sendero ${lifePath1} y el Sendero ${lifePath2} genera una frecuencia común ${energyVibration}, combinando sus dones para una evolución trascendente.`,
    advice: 'Nutran la comunicación transparente y reconozcan los espejos sagrados que cada uno representa para el otro.'
  };
}

export const LIFE_PATH_DETAILS: Record<number, { title: string; description: string; keywords: string[] }> = {
  1: {
    title: 'El Líder Pionero',
    description: 'Nacido para abrir senderos inexplorados, manifestar independencia y liderar con coraje e iniciativa visionaria.',
    keywords: ['Independencia', 'Originalidad', 'Iniciativa', 'Autosuficiencia']
  },
  2: {
    title: 'El Diplomático Intuitivo',
    description: 'El pacificador y conector del cosmos. Dotado de exquisita sensibilidad para armonizar relaciones y tejer puentes.',
    keywords: ['Cooperación', 'Sensibilidad', 'Equilibrio', 'Empatía']
  },
  3: {
    title: 'El Creador Expresivo',
    description: 'El brillo de la alegría y la autoexpresión artística. Inspiras al mundo a través de la palabra, el arte y el carisma.',
    keywords: ['Creatividad', 'Optimismo', 'Comunicación', 'Brillo Social']
  },
  4: {
    title: 'El Constructor Metódico',
    description: 'El arquitecto de realidades tangibles. Destinado a forjar estructuras sólidas, orden, lealtad y seguridad perdurable.',
    keywords: ['Estabilidad', 'Disciplina', 'Tenacidad', 'Orden']
  },
  5: {
    title: 'El Viajero Libre',
    description: 'El heraldo del cambio y la expansión sensorial. Tu alma busca la libertad, la adaptabilidad y el aprendizaje por vivencia directa.',
    keywords: ['Libertad', 'Aventura', 'Curiosidad', 'Magnetismo']
  },
  6: {
    title: 'El Guardián del Amor',
    description: 'El corazón protector y compasivo. Tu camino está entrelazado con el servicio amoroso, el hogar, la belleza y la armonía comunitaria.',
    keywords: ['Amor Incondicional', 'Responsabilidad', 'Sanación', 'Hogar']
  },
  7: {
    title: 'El Buscador Místico',
    description: 'El filósofo y sabio de los misterios invisibles. Destinado a explorar la profundidad espiritual, la ciencia sagrada y la verdad oculta.',
    keywords: ['Espiritualidad', 'Intuición', 'Sabiduría', 'Misticismo']
  },
  8: {
    title: 'El Soberano de la Abundancia',
    description: 'El maestro de la manifestación material y el poder ejecutivo. Viniste a equilibrar el éxito terrenal con la integridad del espíritu.',
    keywords: ['Abundancia', 'Poder', 'Maestría Material', 'Visión Global']
  },
  9: {
    title: 'El Humanitario Universal',
    description: 'El alma sabia y compasiva de vibración compasiva universal. Inspiras la elevación de la conciencia colectiva sin apegos egoicos.',
    keywords: ['Compasión', 'Filantropía', 'Trascendencia', 'Amor Universal']
  },
  11: {
    title: 'El Iluminador Cósmico (Número Maestro)',
    description: 'Canal directo de inspiración divina. Conectas frecuencias superiores para guiar a la humanidad hacia el despertar espiritual.',
    keywords: ['Intuición Psíquica', 'Visión Profética', 'Luz Espiritual', 'Inspiración']
  },
  22: {
    title: 'El Gran Maestro Constructor (Número Maestro)',
    description: 'La máxima capacidad de plasmar grandes visiones utópicas en obras monumentales que transforman la sociedad para siempre.',
    keywords: ['Manifestación Masiva', 'Poder Trascendental', 'Liderazgo Global', 'Arquitectura del Futuro']
  },
  33: {
    title: 'El Maestro del Amor Crístico (Número Maestro)',
    description: 'La más alta vibración de compasión y servicio incondicional. Dedicado a sanar el corazón de la humanidad mediante la entrega pura.',
    keywords: ['Amor Crístico', 'Sanación Universal', 'Devoción', 'Guía Espiritual']
  }
};

export const EXPRESSION_DETAILS: Record<number, { title: string; description: string }> = {
  1: { title: 'Poder de Iniciativa', description: 'Te expresas mediante la determinación, el impulso autónomo y el liderazgo innato.' },
  2: { title: 'Dote Conciliador', description: 'Tu voz florece en la diplomacia, la escucha atenta y el refinamiento en los vínculos.' },
  3: { title: 'Magnetismo Artístico', description: 'Tu talento se manifiesta en el arte, la retórica elocuente y la alegría contagiosa.' },
  4: { title: 'Solidez y Maestría', description: 'Te destacas por la precisión, la ética intachable y la capacidad organizativa impecable.' },
  5: { title: 'Versatilidad Dinámica', description: 'Tu expresión es camaleónica, llena de audacia, oratoria cautivadora y adaptabilidad.' },
  6: { title: 'Calidez y Protección', description: 'Te expresas nutriendo, aconsejando con sabiduría y embelleciendo cualquier ambiente.' },
  7: { title: 'Profundidad Analítica', description: 'Tu mente penetra en lo oculto; te destacas en la investigación, la filosofía y la contemplación.' },
  8: { title: 'Autoridad y Estrategia', description: 'Expresión ejecutiva brillante, capaz de materializar proyectos de gran envergadura y riqueza.' },
  9: { title: 'Nobleza Universal', description: 'Tu talento es un faro humanitario que abraza causas nobles con generosidad desinteresada.' },
  11: { title: 'Número Maestro: Inspirador Místico', description: 'Iluminador de caminos para otros, dotado de un carisma etéreo y magnetismo espiritual.' },
  22: { title: 'Número Maestro: Arquitecto Universal', description: 'Capacidad de convertir los ideales más sublimes en realidades tangibles para el mundo.' },
  33: { title: 'Número Maestro: Guía de Compasión', description: 'Voz de sanación universal que reconforta y eleva las almas afligidas con amor puro.' }
};

export const SOUL_URGE_DETAILS: Record<number, { title: string; description: string }> = {
  1: { title: 'Deseo de Soberanía', description: 'En lo más íntimo anhelas ser el primero, valerte por ti mismo y triunfar por mérito propio.' },
  2: { title: 'Deseo de Unión Álmica', description: 'Tu alma busca intensamente la reciprocidad emocional, la ternura y la complicidad íntima.' },
  3: { title: 'Deseo de Alegría y Creatividad', description: 'Tu motor interno es crear sin límites, celebrar la vida y conmover los corazones ajenos.' },
  4: { title: 'Deseo de Estabilidad y Orden', description: 'Búsqueda de seguridad, raíces profundas, orden en el caos y construcción de bases eternas.' },
  5: { title: 'Deseo de Libertad Cósmica', description: 'Tu anhelo secreto es experimentar todos los horizontes posibles sin cadenas ni monotonía.' },
  6: { title: 'Deseo de Servir y Amar', description: 'Tu corazón vibra en plenitud cuando protege, cura y crea un santuario de paz familiar.' },
  7: { title: 'Deseo de Verdad Trascendente', description: 'El anhelo de desentrañar los secretos del universo y encontrar paz en el silencio místico.' },
  8: { title: 'Deseo de Trascendencia y Logro', description: 'Tu alma aspira a la excelencia, la independencia financiera y el dominio de las fuerzas materiales.' },
  9: { title: 'Deseo de Iluminar el Mundo', description: 'Anhelo de dejar el planeta en un estado más elevado, curar dolores colectivos y vivir en fraternidad.' },
  11: { title: 'Deseo de Despertar Espiritual', description: 'Sed insaciable de comunión con lo sagrado y alineación con la verdad superior de la existencia.' },
  22: { title: 'Deseo de Construir para la Humanidad', description: 'Pasión por dejar un legado imperecedero que beneficie a las futuras generaciones.' },
  33: { title: 'Deseo de Sanación Crística', description: 'Entrega voluntaria del corazón al florecimiento de la compasión y la paz en la Tierra.' }
};

export const PYTHAGOREAN_TABLE: { digit: number; letters: string[] }[] = [
  { digit: 1, letters: ['A', 'J', 'S'] },
  { digit: 2, letters: ['B', 'K', 'T'] },
  { digit: 3, letters: ['C', 'L', 'U'] },
  { digit: 4, letters: ['D', 'M', 'V'] },
  { digit: 5, letters: ['E', 'N', 'W'] },
  { digit: 6, letters: ['F', 'O', 'X'] },
  { digit: 7, letters: ['G', 'P', 'Y'] },
  { digit: 8, letters: ['H', 'Q', 'Z'] },
  { digit: 9, letters: ['I', 'R'] }
];

export function getLetterValues(name: string): { char: string; value: number; isVowel: boolean }[] {
  if (!name) return [];
  const clean = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const result: { char: string; value: number; isVowel: boolean }[] = [];
  
  for (let i = 0; i < name.length; i++) {
    const rawChar = name[i];
    const c = clean[i] || rawChar.toLowerCase();
    const val = PYTHAGOREAN_MAP[c] || 0;
    const isVowel = VOWELS.has(c);
    result.push({
      char: rawChar,
      value: val,
      isVowel
    });
  }
  return result;
}

export function calculatePersonalYear(birthDateStr: string, currentYear: number = new Date().getFullYear()): number {
  if (!birthDateStr) return 1;
  const parts = birthDateStr.split('-').map(Number);
  if (parts.length < 3) return 1;
  const [, month, day] = parts;

  const redDay = reduceToSingleDigitOrMaster(day);
  const redMonth = reduceToSingleDigitOrMaster(month);
  const redYear = reduceToSingleDigitOrMaster(
    currentYear.toString().split('').reduce((a, b) => a + Number(b), 0)
  );

  const sum = redDay + redMonth + redYear;
  return reduceToSingleDigitOrMaster(sum) % 9 || 9;
}

export function calculateMaturityNumber(lifePath: number, expression: number): number {
  return reduceToSingleDigitOrMaster(lifePath + expression);
}

export const PERSONALITY_DETAILS: Record<number, { title: string; description: string }> = {
  1: { title: 'Presencia Imponente & Pionera', description: 'Irradias seguridad, porte de liderazgo y una postura firme que inspira respeto instantáneo.' },
  2: { title: 'Aura Serena & Conciliadora', description: 'Proyectas calma, calidez accesible y una elegancia sutil que invita a la confidencia y el diálogo.' },
  3: { title: 'Encanto Magnético & Radiante', description: 'Tu primera impresión es vivaz, llena de alegría, estilo personal y facilidad para la risa.' },
  4: { title: 'Solidez, Confiabilidad & Dignidad', description: 'Te perciben como alguien de palabra intachable, ordenado, profesional y de gran seriedad.' },
  5: { title: 'Dinamismo Cautivador & Atractivo', description: 'Transmites frescura, ingenio agudo, estilo vanguardista y una energía juvenil irresistible.' },
  6: { title: 'Calidez Protectora & Armoniosa', description: 'Tu sola presencia reconforta; proyectas generosidad maternal/paternal y buen gusto estético.' },
  7: { title: 'Misterio Distinguido & Intelectual', description: 'Aura enigmática, refinada y observadora. Inspiras la sensación de guardar secretos y sabiduría.' },
  8: { title: 'Poder Ejecutivo & Autoridad Natural', description: 'Irradias éxito, porte distinguido, visión estratégica y una capacidad innata para mandar.' },
  9: { title: 'Nobleza Universal & Altruismo', description: 'Proyectas carisma comprensivo, amplitud de miras y un porte aristocrático con alma abierta.' },
  11: { title: 'Presencia Eléctrica & Carismática', description: 'Tu mirada y energía transmiten una intensidad espiritual que no pasa desapercibida.' },
  22: { title: 'Aura de Gran Estadista', description: 'Transmites la serenidad de quien puede construir imperios y transformar realidades a gran escala.' },
  33: { title: 'Resonancia Sanadora', description: 'Proyectas una devoción pura y una vibración de paz profunda que apacigua el entorno.' }
};

export const MATURITY_DETAILS: Record<number, { title: string; description: string }> = {
  1: { title: 'Cosecha de Independencia', description: 'En tu madurez te consolidas como una autoridad indiscutible en tu campo, con total autonomía.' },
  2: { title: 'Cosecha de Armonía y Vínculos', description: 'Tus años dorados florecen en relaciones enriquecedoras, paz interior y diplomacia consumada.' },
  3: { title: 'Cosecha de Expresión Creativa', description: 'Florecimiento artístico o comunicativo tardío; una vida llena de júbilo, viajes y vitalidad.' },
  4: { title: 'Cosecha de Legado Firme', description: 'Consolidación de patrimonio, estabilidad familiar sólida y respeto por las obras construidas.' },
  5: { title: 'Cosecha de Sabiduría Aventurera', description: 'Una madurez libre de ataduras, enriquecida por viajes, experiencias transformadoras y vitalidad.' },
  6: { title: 'Cosecha de Hogar y Amor Pleno', description: 'Rodeado de afecto, gratitud comunitaria y un santuario de paz doméstica inquebrantable.' },
  7: { title: 'Cosecha de Maestría Espiritual', description: 'Consagración como sabio, maestro o consultor; conexión directa con las verdades ocultas.' },
  8: { title: 'Cosecha de Abundancia y Poder', description: 'Plenitud material, reconocimiento público de tus logros e influencia filantrópica.' },
  9: { title: 'Cosecha de Iluminación Trascendente', description: 'Desapego victorioso, entrega a causas universales y una profunda sensación de misión cumplida.' },
  11: { title: 'Cosecha de Iluminación Divina', description: 'Reconocimiento como faro espiritual e inspirador de nuevas generaciones conscientes.' },
  22: { title: 'Cosecha de Obra Trascendental', description: 'Tus proyectos y creaciones dejan una huella imborrable para la posteridad.' },
  33: { title: 'Cosecha de Santuario del Amor', description: 'Máxima comunión con la compasión universal y guía espiritual para el colectivo.' }
};

export const PERSONAL_YEAR_DETAILS: Record<number, { title: string; theme: string; description: string; advice: string }> = {
  1: {
    title: 'Año Personal 1: Semilla & Nuevos Comienzos',
    theme: 'Siembra de Intenciones, Autonomía, Reinicio',
    description: 'Inicias un ciclo cósmico de 9 años. Momento de tomar decisiones audaces, lanzar nuevos proyectos y confiar en tu liderazgo.',
    advice: 'No temas empezar desde cero; lo que siembres este año definirá la próxima década.'
  },
  2: {
    title: 'Año Personal 2: Paciencia & Alianzas',
    theme: 'Gestación, Cooperación, Diplomacia',
    description: 'Año de ritmo pausado donde las semillas sembradas crecen bajo tierra. Se enfatizan las relaciones, la empatía y el trabajo en equipo.',
    advice: 'Cultiva la paciencia, evita decisiones apresuradas y fortalece tus lazos afectivos.'
  },
  3: {
    title: 'Año Personal 3: Florecimiento & Expresión',
    theme: 'Creatividad, Vida Social, Alegría',
    description: 'El primer brote de la semilla sale a la luz. Tu carisma, magnetismo y capacidad artística están en su punto más alto.',
    advice: 'Exprésate sin miedo, viaja, comunica y disfruta los frutos de tu entusiasmo.'
  },
  4: {
    title: 'Año Personal 4: Trabajo Firme & Cimientos',
    theme: 'Estructura, Disciplina, Esfuerzo Práctico',
    description: 'Año de afianzar raíces y ordenar la estructura de tu vida: salud, finanzas y compromisos tangibles.',
    advice: 'Enfócate en la constancia y el orden. La dedicación de este año te dará seguridad duradera.'
  },
  5: {
    title: 'Año Personal 5: Transformación & Libertad',
    theme: 'Cambios Inesperados, Aventura, Expansión',
    description: 'El punto medio del ciclo trae giros de guion, nuevas oportunidades y vientos de liberación de viejos esquemas.',
    advice: 'Sé flexible ante los cambios y aprovecha los nuevos horizontes para reinventarte.'
  },
  6: {
    title: 'Año Personal 6: Hogar, Familia & Responsabilidad',
    theme: 'Compromiso Afectivo, Sanación, Belleza',
    description: 'La energía se concentra en el hogar, el bienestar de la pareja y seres queridos, y la armonía comunitaria.',
    advice: 'Nutre tu santuario íntimo, resuelve rencillas con compasión y crea belleza a tu alrededor.'
  },
  7: {
    title: 'Año Personal 7: Introspección & Sabiduría',
    theme: 'Estudio Espiritual, Silencio, Maduración',
    description: 'Año sagrado de reflexión interior, descanso consciente y estudio de verdades profundas. Menos acción externa, mayor iluminación interna.',
    advice: 'Dedica tiempo a la meditación, la naturaleza y el autoconocimiento; no fuerces resultados externos.'
  },
  8: {
    title: 'Año Personal 8: Cosecha & Empoderamiento',
    theme: 'Manifestación Material, Éxito, Liderazgo',
    description: 'El año del karma y la retribución. Lo sembrado con rectitud se manifiesta en recompensas económicas, ascenso y poder personal.',
    advice: 'Maneja tus recursos con sabiduría y ética impecable; reclama tu lugar de abundancia.'
  },
  9: {
    title: 'Año Personal 9: Cierre de Ciclo & Trascendencia',
    theme: 'Liberación, Perdón, Limpieza Kármica',
    description: 'El último año del ciclo de 9 años. Tiempo de soltar personas, trabajos o hábitos caducos para dejar espacio al nuevo inicio.',
    advice: 'Perdona de corazón, haz limpieza profunda y agradece todo lo vivido en este ciclo.'
  }
};

export function calculateDailyEnergy(dayOffset = 0) {
  const today = new Date();
  today.setDate(today.getDate() + dayOffset);
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const total = day + month + year.toString().split('').reduce((a, b) => a + Number(b), 0);
  const number = reduceToSingleDigitOrMaster(total) % 9 || 9;

  const VIBES: Record<number, { title: string; theme: string; description: string; advice: string }> = {
    1: {
      title: 'Energía de Inicio',
      theme: 'Poder Creativo, Nuevos Comienzos, Valentía',
      description: 'Hoy las corrientes cósmicas favorecen el primer paso en nuevos proyectos. La atmósfera vibra con vigor y determinación.',
      advice: 'Siembra intenciones claras y no temas tomar la iniciativa en tus anhelos.'
    },
    2: {
      title: 'Energía de Alianza',
      theme: 'Paciencia, Cooperación, Sensibilidad Intuitiva',
      description: 'Día propicio para la diplomacia, los acuerdos mutuos y la escucha receptiva. Las sincronías fluyen a través del vínculo.',
      advice: 'Prioriza la concordia y confía en los mensajes sutiles que percibe tu corazón.'
    },
    3: {
      title: 'Energía de Expansión',
      theme: 'Creatividad, Gozo, Expresión Social',
      description: 'El universo abre un canal de inspiración luminosa. Excelente jornada para comunicar ideas, crear arte y celebrar la vida.',
      advice: 'Comparte tu optimismo y deja que tu autenticidad inspire a quienes te rodean.'
    },
    4: {
      title: 'Energía de Cimientos',
      theme: 'Organización, Estabilidad, Enfoque Práctico',
      description: 'Momento de ordenar prioridades, asentar bases firmes y materializar tareas pendientes con paciencia y disciplina.',
      advice: 'Construye paso a paso; la constancia de hoy será el triunfo sólido de mañana.'
    },
    5: {
      title: 'Energía de Alquimia y Cambio',
      theme: 'Libertad, Movimiento, Adaptabilidad',
      description: 'Vientos frescos de transformación recorren tu sendero. Las rutinas se abren para dar paso a sorpresas enriquecedoras.',
      advice: 'Sé flexible ante los imprevistos y abraza la aventura con mente abierta.'
    },
    6: {
      title: 'Energía de Síntesis y Armonía',
      theme: 'Amor, Responsabilidad, Hogar, Sanación',
      description: 'Hoy la vibración te invita a buscar el equilibrio. Es un excelente momento para resolver conflictos pendientes y encontrar la armonía en tus relaciones más cercanas. Escucha tu intuición.',
      advice: 'Dedica tiempo al bienestar de tus seres queridos y embellece tu espacio sagrado.'
    },
    7: {
      title: 'Energía de Introspección Mística',
      theme: 'Sabiduría, Meditación, Análisis Espiritual',
      description: 'Las puertas del templo interior se abren de par en par. La quietud y el estudio revelarán respuestas que el ruido exterior ocultaba.',
      advice: 'Regálate momentos de silencio sagrado y atiende a tus visiones intuitivas.'
    },
    8: {
      title: 'Energía de Manifestación',
      theme: 'Abundancia, Poder Personal, Claridad Ejecutiva',
      description: 'El flujo de la prosperidad y el magnetismo material se activan. Oportunidad ideal para decisiones financieras y proyectos audaces.',
      advice: 'Reconoce tu valía y actúa con la convicción de quien sabe que el éxito es natural.'
    },
    9: {
      title: 'Energía de Culminación',
      theme: 'Cierre de Ciclos, Compasión, Liberación',
      description: 'La rueda completa su giro. Momento de soltar lo que ya cumplió su propósito kármico y perdonar con gratitud.',
      advice: 'Limpia viejos apegos para dejar espacio limpio al nuevo amanecer que se aproxima.'
    }
  };

  const currentVibe = VIBES[number] || VIBES[6];
  return {
    number,
    ...currentVibe
  };
}

export function calculateNumerologySynastry(
  person1Name: string,
  person1Date: string,
  person2Name: string,
  person2Date: string
) {
  const p1Life = calculateLifePath(person1Date);
  const p2Life = calculateLifePath(person2Date);
  const p1Exp = calculateNameNumbers(person1Name).expression;
  const p2Exp = calculateNameNumbers(person2Name).expression;

  const diff = Math.abs(p1Life - p2Life);
  let resonanceScore = 75;

  if (diff === 0) resonanceScore = 96;
  else if (diff === 2 || diff === 4) resonanceScore = 88;
  else if (diff === 1 || diff === 3) resonanceScore = 82;
  else if (diff === 5) resonanceScore = 78;

  let connectionType = 'Vínculo de Aprendizaje y Crecimiento Mutuo';
  if (resonanceScore >= 90) connectionType = 'Lazos de Almas Gemelas / Alta Afinidad Espiritual';
  else if (resonanceScore >= 80) connectionType = 'Complementariedad Dinámica y Creativa';

  return {
    score: resonanceScore,
    connectionType,
    p1Life,
    p2Life,
    p1Exp,
    p2Exp,
    synergyDescription: `La interacción entre el Sendero ${p1Life} y el Sendero ${p2Life} crea un campo de fuerza donde ${
      p1Life === p2Life
        ? 'ambos comparten la misma frecuencia fundamental, logrando una comprensión telepática innata.'
        : 'las diferencias se convierten en el combustible alquímico para la evolución de ambas almas.'
    }`,
    sacredAdvice: 'Nutran la comunicación transparente y reconozcan los espejos sagrados que cada uno representa para el otro.'
  };
}
