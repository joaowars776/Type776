
export type Language = 'en' | 'pt';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  CHINA = 'china', // Was Forest
  CYBERPUNK = 'cyberpunk',
  CONTRAST = 'contrast',
  CHRISTMAS = 'christmas',
  EYE_PROTECTION = 'eye_protection',
  EIGHT_BITS = '8bits' // Was Habbo
}

export enum AppFont {
  INTER = 'Inter',
  JETBRAINS = 'JetBrains Mono',
  PRESS_START = 'Press Start 2P',
  RUSSO = 'Russo One'
}

export enum SoundType {
  OFF = 'off',
  KEYBOARD = 'keyboard', // Original soft click
  HIGH_PITCH = 'high_pitch' // New "Agudo" sound
}

export enum GameMode {
  TIME_15 = 'time_15',
  TIME_30 = 'time_30',
  TIME_60 = 'time_60',
  SUDDEN_DEATH = 'sudden_death',
  CUSTOM = 'custom',
  ACHIEVEMENT = 'achievement'
}

// Diversos Game Types
export enum HabboGameType {
  ALEATORIO = 'aleatorio', 
  GERUNDIO = 'gerundio',
  INFINITIVO = 'infinitivo',
  REPITA = 'repita',
  SOLETRANDO = 'soletrando',
  SOLEPLICANDO = 'soleplicando',
  DUPLICANDO = 'duplicando',
  CONTRARIO = 'contrario',
  CONSOANTES = 'consoantes',
  VOGAIS = 'vogais',
  SINGULAR = 'singular',
  PLURAL = 'plural',
  SOMATORIA = 'somatoria',
  LINGUA_I = 'lingua_i',
  FINAL_INICIAL = 'final_inicial',
  INICIAL_FINAL = 'inicial_final',
  EXTENSO = 'extenso'
}

export enum HabboDifficulty {
  EASY = 'easy',
  STANDARD = 'standard',
  HARD = 'hard'
}

export enum WordLength {
  ALL = 'all',
  SHORT = 'short', // < 5
  MEDIUM = 'medium', // 5-8
  LONG = 'long' // > 8
}

export enum TextSize {
  SMALL = 'text-xl',
  MEDIUM = 'text-3xl',
  LARGE = 'text-5xl'
}

export interface UserSettings {
  language: Language;
  theme: Theme;
  font: AppFont;
  applyFontToTyping: boolean;
  soundEnabled: boolean;
  soundType: SoundType; // NEW
  focusMode: boolean;
  focusModeConfig: {
    keepTime: boolean;
    keepWPM: boolean;
  };
  textSize: TextSize;
  snowIntensity: number; // 0-10
  wordConfig: {
    length: WordLength;
    useAccents: boolean;
  };
  randomFilters: HabboGameType[];
  // New Habbo Specific Config
  habboConfig: {
      showHints: boolean;
      strictMode: boolean; // Case sensitive & Accents
      layout: 'grid' | 'compact'; // Changed list to compact
  };
}

export interface Achievement {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: UserStats, lastResult?: TestResult | DiversosResult, sessionScore?: number) => boolean;
  xpReward: number;
  recommendedMode?: GameMode | HabboGameType;
  difficulty?: 'easy' | 'medium' | 'hard'; 
}

export interface ChartPoint {
  second: number;
  wpm: number;
  raw: number;
  consistency: number;
}

export interface ErrorLog {
  word: string;
  typed: string;
}

export interface WordStat {
    word: string;
    duration: number; // seconds
    wpm: number;
}

export interface WordAnalytic {
    word: string;
    wpm: number;
    duration: number;
    timestamp: number;
    gameType: HabboGameType;
    errorCount: number; 
}

export interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  correctChars: number;
  incorrectChars: number;
  timestamp: number;
  mode: GameMode;
  duration: number;
  language: Language; 
  comparison?: string;
  chartData: ChartPoint[]; 
  missedWords: ErrorLog[]; 
  wordStats?: WordStat[]; 
}

export interface DiversosResult {
  gameType: HabboGameType;
  wpm: number;
  accuracy: number;
  score: number;
  timestamp: number;
  duration: number;
  wordsCount: number;
  boostApplied?: boolean; 
  difficulty?: HabboDifficulty;
  wordStats?: WordStat[];
}

export interface UserStats {
  totalTests: number;
  totalTimePlayed: number; 
  diversosTimePlayed: number; 
  diversosGamesPlayed: Record<HabboGameType, number>; 
  
  modesPlayed: Record<string, number>; 
  usedThemes: Theme[]; 
  usedFonts: AppFont[]; 
  suddenDeathBestStreak: number; 

  habboScoreEasy: number;
  habboScoreStandard: number;
  habboScoreHard: number;

  highestWpm: number;
  bestWpmPerMode: Record<string, number>; // NEW: Stores best WPM per specific mode
  averageWpm: number;
  averageAccuracy: number;
  averageConsistency: number;
  totalXp: number;
  level: number;
  hasChangedAvatar?: boolean; 
}

export interface UserProfile {
  username: string;
  avatar: string; 
  avatarImage?: string; 
  isGuest: boolean;
  settings: UserSettings;
  stats: UserStats;
  history: TestResult[];
  diversosHistory: DiversosResult[];
  wordHistory: Record<string, WordAnalytic[]>; 
  achievements: string[];
  isSetupCompleted: boolean;
}

export const INITIAL_PROFILE: UserProfile = {
  username: '',
  avatar: 'linear-gradient(45deg, #ff003c, #00ff9f)', 
  avatarImage: '👤',
  isGuest: false,
  settings: {
    language: 'pt',
    theme: Theme.DARK, 
    font: AppFont.INTER,
    applyFontToTyping: false, 
    soundEnabled: true,
    soundType: SoundType.OFF, // Default OFF
    focusMode: false,
    focusModeConfig: {
        keepTime: false,
        keepWPM: false
    },
    textSize: TextSize.MEDIUM, 
    snowIntensity: 5,
    wordConfig: {
      length: WordLength.ALL, 
      useAccents: true 
    },
    randomFilters: [],
    habboConfig: {
        showHints: false,
        strictMode: true,
        layout: 'grid'
    }
  },
  stats: {
    totalTests: 0,
    totalTimePlayed: 0,
    diversosTimePlayed: 0,
    diversosGamesPlayed: {
        [HabboGameType.ALEATORIO]: 0,
        [HabboGameType.GERUNDIO]: 0,
        [HabboGameType.INFINITIVO]: 0,
        [HabboGameType.REPITA]: 0,
        [HabboGameType.SOLETRANDO]: 0,
        [HabboGameType.SOLEPLICANDO]: 0,
        [HabboGameType.DUPLICANDO]: 0,
        [HabboGameType.CONTRARIO]: 0,
        [HabboGameType.CONSOANTES]: 0,
        [HabboGameType.VOGAIS]: 0,
        [HabboGameType.SINGULAR]: 0,
        [HabboGameType.PLURAL]: 0,
        [HabboGameType.SOMATORIA]: 0,
        [HabboGameType.LINGUA_I]: 0,
        [HabboGameType.FINAL_INICIAL]: 0,
        [HabboGameType.INICIAL_FINAL]: 0,
        [HabboGameType.EXTENSO]: 0,
    },
    modesPlayed: {},
    usedThemes: [Theme.CYBERPUNK],
    usedFonts: [AppFont.INTER],
    suddenDeathBestStreak: 0,
    habboScoreEasy: 0,
    habboScoreStandard: 0,
    habboScoreHard: 0,
    highestWpm: 0,
    bestWpmPerMode: {}, // Initialize empty
    averageWpm: 0,
    averageAccuracy: 0,
    averageConsistency: 0,
    totalXp: 0,
    level: 1,
    hasChangedAvatar: false,
  },
  history: [],
  diversosHistory: [],
  wordHistory: {}, 
  achievements: [],
  isSetupCompleted: false,
};
