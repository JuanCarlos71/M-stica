export type TabType = 'inicio' | 'quiromancia' | 'tarot' | 'astrologia';

export interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  isGoogleAuth?: boolean;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace: string;
  avatarUrl: string;
  zodiacSign: string;
  ascendant: string;
  moonSign: string;
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  biometricEnabled: boolean;
  batterySaver: boolean;
  theme: 'dark' | 'auto';
  notificationsEnabled: boolean;
}

export interface SavedReading {
  id: string;
  date: string;
  type: 'quiromancia' | 'tarot' | 'astrologia' | 'numerologia';
  title: string;
  summary: string;
  details: any;
  handSide?: 'left' | 'right';
  cards?: string[];
  zodiac?: string;
}

export interface NumerologyProfile {
  lifePath: {
    number: number;
    title: string;
    description: string;
    keywords: string[];
  };
  expression: {
    number: number;
    title: string;
    description: string;
    isMaster: boolean;
  };
  soulUrge: {
    number: number;
    title: string;
    description: string;
  };
  personality: {
    number: number;
    title: string;
    description: string;
  };
  dayEnergy: {
    number: number;
    title: string;
    theme: string;
    description: string;
    advice: string;
  };
}

export interface PalmLineDetail {
  id: string;
  name: string;
  traditionalName: string;
  description: string;
  score: number; // 0 - 100
  depth: 'Profunda y Clara' | 'Fina y Espiritual' | 'Bifurcada' | 'Ondulada y Creativa';
  reading: string;
  chakra: string;
  color: string;
}

export interface PalmAnalysis {
  handSide: 'left' | 'right'; // left = karma/potential, right = destiny/manifestation
  element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
  elementDescription: string;
  vitalityScore: number;
  intuitionScore: number;
  emotionalScore: number;
  fortuneScore: number;
  lines: PalmLineDetail[];
  mounts: {
    venus: string;
    luna: string;
    jupiter: string;
    mercurio: string;
    sol: string;
  };
  generalReading: string;
  spiritualGuidance: string;
  timestamp: string;
}

export interface TarotCard {
  id: string;
  number: number;
  name: string;
  arcana: 'Mayor' | 'Menor';
  suit?: 'Copas' | 'Oros' | 'Espadas' | 'Bastos';
  image: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  symbol: string;
  element: string;
  astrologicalRuler: string;
  spiritualAffirmation: string;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  positionName: string;
  positionMeaning: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  cardCount: number;
  description: string;
  positions: { name: string; meaning: string }[];
}

export interface PlanetPosition {
  planet: string;
  symbol: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  description: string;
}

export interface NatalHouse {
  houseNumber: number;
  sign: string;
  ruler: string;
  theme: string;
}

export interface NatalAspect {
  planet1: string;
  planet2: string;
  aspectType: 'Conjunción' | 'Trígono' | 'Sextil' | 'Cuadratura' | 'Oposición';
  orb: number;
  influence: 'Armónica' | 'Dinámica' | 'Kármica';
  meaning: string;
}

export interface NatalChart {
  sunSign: string;
  sunDegree: number;
  moonSign: string;
  moonDegree: number;
  ascendantSign: string;
  ascendantDegree: number;
  midheavenSign: string;
  planets: PlanetPosition[];
  houses: NatalHouse[];
  aspects: NatalAspect[];
  dominantElement: 'Fuego' | 'Tierra' | 'Aire' | 'Agua';
  elementBalance: {
    fuego: number;
    tierra: number;
    aire: number;
    agua: number;
  };
  interpretation: {
    soulMission: string;
    emotionalInnerWorld: string;
    socialMaskAndAppearance: string;
    karmicLessons: string;
    strengths: string[];
    shadowToIntegrate: string;
  };
}

export interface CelestialEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'lunar' | 'planetary' | 'aspect' | 'eclipse';
  influence: string;
  zodiacSign?: string;
}

export interface MoonPhaseInfo {
  phaseName: string;
  illumination: number; // 0 - 100
  moonSign: string;
  spiritualMeaning: string;
  ritualAdvice: string;
  nextPeak: string;
}
