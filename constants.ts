
import { Achievement, Theme, GameMode, AppFont, HabboGameType, UserStats, WordLength, TextSize, HabboDifficulty } from './types';

export const LEVEL_BASE_XP = 100;

export const AVATAR_BGS = [
  { id: 'default', label: 'Purple', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'fire', label: 'Fire', bg: 'linear-gradient(to right, #f83600 0%, #f9d423 100%)' },
  { id: 'ocean', label: 'Ocean', bg: 'linear-gradient(to top, #4481eb 0%, #04befe 100%)' },
  { id: 'forest', label: 'Forest', bg: 'linear-gradient(to top, #0ba360 0%, #3cba92 100%)' },
  { id: 'darkness', label: 'Darkness', bg: 'linear-gradient(to top, #000000 0%, #434343 100%)' },
  { id: 'cyber', label: 'Cyber', bg: 'linear-gradient(45deg, #ff003c, #00ff9f)' },
  { id: 'gold', label: 'Gold', bg: 'linear-gradient(to right, #f7971e, #ffd200)' },
  { id: 'christmas', label: 'Holiday', bg: 'linear-gradient(to bottom, #16222A, #3A6073)' },
  { id: 'plain_red', label: 'Red', bg: '#ef4444' },
  { id: 'plain_blue', label: 'Blue', bg: '#3b82f6' },
  { id: 'plain_green', label: 'Green', bg: '#22c55e' },
];

export const AVATAR_ICONS = [
    '⌨️', '💻', '🖱️', '📝', // Typing
    '🐱', '🐈', '🐈‍⬛', // Cats
    '🧑', '🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿', // People (Neutral)
    '👩', '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿', // Women
    '👨', '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿'  // Men
];

export const AVATARS = AVATAR_BGS; 

// Added demo property to help with settings UI visualization
export const THEME_CONFIG: Record<Theme, { 
    bg: string; 
    text: string; 
    subText: string; 
    accent: string; 
    panel: string; 
    customClass?: string; 
    selectorClass?: string; 
    previewColor?: string;
    // For sidebar styles specifically
    sidebarBg?: string;
    sidebarText?: string;
    arrowClass: string; // NEW: Specific style for popover arrows
    demo: { bg: string, text: string, accent: string } 
}> = {
  [Theme.LIGHT]: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    subText: 'text-gray-500',
    accent: 'text-blue-600',
    panel: 'bg-white/60 backdrop-blur-md border border-gray-300/50 shadow-md text-gray-900',
    selectorClass: 'bg-gray-200/80 hover:bg-gray-300 text-gray-800',
    previewColor: '#f9fafb',
    sidebarBg: 'bg-white/95 backdrop-blur-xl border-l border-gray-200',
    sidebarText: 'text-gray-900',
    arrowClass: 'bg-transparent border-gray-300/50',
    demo: { bg: '#f9fafb', text: '#111827', accent: '#2563eb' }
  },
  [Theme.DARK]: {
    bg: 'bg-slate-900',
    text: 'text-slate-100',
    subText: 'text-slate-500',
    accent: 'text-indigo-400',
    panel: 'bg-slate-800/40 backdrop-blur-md border border-slate-700/50',
    selectorClass: 'bg-black/20 hover:bg-black/40',
    previewColor: '#0f172a',
    sidebarBg: 'bg-slate-900/90 backdrop-blur-xl border-l border-slate-700',
    sidebarText: 'text-slate-100',
    arrowClass: 'bg-transparent border-slate-700/50',
    demo: { bg: '#0f172a', text: '#f1f5f9', accent: '#818cf8' }
  },
  [Theme.CHINA]: {
    bg: 'theme-china-bg', // Uses CSS class
    text: 'text-[#f1c40f]', // Gold
    subText: 'text-[#c0392b]',
    accent: 'text-[#e74c3c]',
    panel: 'bg-[#400e0e]/40 backdrop-blur-md border border-[#f1c40f]/20 shadow-xl shadow-red-900/20',
    selectorClass: 'bg-black/40 hover:bg-black/60 text-[#f1c40f] border border-[#f1c40f]/20',
    previewColor: '#2a0a0a',
    sidebarBg: 'bg-[#2a0a0a]/95 backdrop-blur-xl border-l border-[#f1c40f]/20',
    sidebarText: 'text-[#f1c40f]',
    arrowClass: 'bg-transparent border-[#f1c40f]/20',
    demo: { bg: '#2a0a0a', text: '#f1f5f9', accent: '#e74c3c' }
  },
  [Theme.CYBERPUNK]: {
    bg: 'theme-cyberpunk-bg',
    text: 'text-[#00ff9f]',
    subText: 'text-[#ff003c]',
    accent: 'text-[#fcee0a]',
    panel: 'bg-[#000000]/70 backdrop-blur-md border border-[#00ff9f]/50 shadow-[0_0_15px_rgba(0,255,159,0.2)]',
    customClass: 'theme-cyberpunk-text',
    selectorClass: 'bg-[#00ff9f]/10 hover:bg-[#00ff9f]/20 border border-[#00ff9f]/30 text-[#00ff9f]',
    previewColor: '#00ff9f',
    sidebarBg: 'bg-[#050505]/95 backdrop-blur-xl border-l border-[#00ff9f]/50 shadow-[0_0_20px_rgba(0,255,159,0.1)]',
    sidebarText: 'text-[#00ff9f]',
    arrowClass: 'bg-transparent border-[#00ff9f]/50',
    demo: { bg: '#050505', text: '#00ff9f', accent: '#ff003c' }
  },
  [Theme.CONTRAST]: {
    bg: 'bg-black',
    text: 'text-white',
    subText: 'text-white',
    accent: 'text-yellow-400',
    panel: 'bg-black/50 backdrop-blur-md border-2 border-white/50',
    selectorClass: 'border border-white hover:bg-white hover:text-black',
    previewColor: '#000000',
    sidebarBg: 'bg-black border-l-2 border-white',
    sidebarText: 'text-white',
    arrowClass: 'bg-transparent border-white/50',
    demo: { bg: '#000000', text: '#ffffff', accent: '#ffff00' }
  },
  [Theme.CHRISTMAS]: {
    bg: 'theme-christmas-bg',
    text: 'text-[#e2e8f0]',
    subText: 'text-[#94a3b8]',
    accent: 'text-[#38bdf8]',
    panel: 'bg-[#1e293b]/40 backdrop-blur-md border border-[#38bdf8]/20 shadow-blue-500/10',
    customClass: 'theme-christmas-bg',
    selectorClass: 'bg-white/10 hover:bg-white/20',
    previewColor: '#1e3c72',
    sidebarBg: 'bg-[#0f172a]/90 backdrop-blur-xl border-l border-[#38bdf8]/30',
    sidebarText: 'text-[#e2e8f0]',
    arrowClass: 'bg-transparent border-[#38bdf8]/20',
    demo: { bg: '#1e3c72', text: '#e2e8f0', accent: '#38bdf8' }
  },
  [Theme.EYE_PROTECTION]: {
      bg: 'bg-[#121212]',
      text: 'text-[#b0b0b0]',
      subText: 'text-[#757575]',
      accent: 'text-[#bb86fc]',
      panel: 'bg-[#1e1e1e]/50 backdrop-blur-md border border-[#333333]',
      selectorClass: 'bg-white/5 hover:bg-white/10',
      previewColor: '#121212',
      sidebarBg: 'bg-[#121212]/95 backdrop-blur-xl border-l border-[#333333]',
      sidebarText: 'text-[#b0b0b0]',
      arrowClass: 'bg-transparent border-[#333333]',
      demo: { bg: '#121212', text: '#b0b0b0', accent: '#bb86fc' }
  },
  [Theme.EIGHT_BITS]: {
      bg: 'theme-habbo-bg',
      text: 'text-[#FFD700]', // Gold text
      subText: 'text-[#FFA500]',
      accent: 'text-[#FF4500]',
      // Very transparent (20%), no blur, subtle border
      panel: 'bg-[#2C2C2C]/20 border border-[#8B4513]/30', 
      selectorClass: 'bg-[#8B4513]/30 hover:bg-[#8B4513]/50',
      previewColor: '#8B4513',
      sidebarBg: 'bg-[#1a1a2e]/95 backdrop-blur-xl border-l border-[#8B4513]',
      sidebarText: 'text-[#FFD700]',
      arrowClass: 'bg-transparent border-[#8B4513]/30',
      demo: { bg: '#1a1a2e', text: '#FFD700', accent: '#FF4500' }
  }
};

export const FONT_CONFIG: Record<AppFont, string> = {
  [AppFont.INTER]: "'Inter', sans-serif",
  [AppFont.JETBRAINS]: "'JetBrains Mono', monospace",
  [AppFont.PRESS_START]: "'Press Start 2P', cursive",
  [AppFont.RUSSO]: "'Russo One', sans-serif"
};

export const GAME_MODES = [
  { id: GameMode.TIME_15, labelKey: 'mode_15s', icon: '⚡' },
  { id: GameMode.TIME_30, labelKey: 'mode_30s', icon: '⏱️' },
  { id: GameMode.TIME_60, labelKey: 'mode_60s', icon: '🕰️' },
  { id: GameMode.SUDDEN_DEATH, labelKey: 'mode_sudden_death', icon: '💀' },
  { id: GameMode.CUSTOM, labelKey: 'mode_custom', icon: '✏️' },
];

// Calculate XP based on difficulty
const getXpForWpm = (speed: number) => {
    if (speed < 60) return 20;
    if (speed < 100) return 50;
    if (speed < 140) return 200;
    if (speed < 180) return 500;
    return 1000;
}

const createSpeedAchievements = () => {
    const speeds = [50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200];
    const langs = ['en', 'pt'];
    const list: Achievement[] = [];

    speeds.forEach(speed => {
        // Language Specific Only (Removed Duplicate Generic)
        langs.forEach(lang => {
             list.push({
                id: `speed_${speed}_${lang}`,
                titleKey: `ach_speed_${speed}_${lang}`,
                descriptionKey: `ach_speed_${speed}_${lang}_desc`,
                icon: lang === 'pt' ? '🇧🇷' : '🇺🇸',
                unlocked: false,
                condition: (stats, last) => {
                    if (!last || !('mode' in last)) return false; 
                    // Anti-cheat: Custom Mode cannot unlock speed achievements
                    if (last.mode === GameMode.CUSTOM) return false;
                    return last.wpm >= speed && last.language === lang;
                },
                xpReward: getXpForWpm(speed) + 50, // Bonus for specificity
                difficulty: speed < 80 ? 'easy' : speed < 140 ? 'medium' : 'hard',
                recommendedMode: GameMode.TIME_60
            });
        });
    });
    return list;
}

const createLevelAchievements = () => {
    const levels = [5, 10, 20, 30, 50, 100, 200, 500];
    return levels.map(level => ({
        id: `level_${level}`,
        titleKey: `ach_level_title`, 
        descriptionKey: `ach_level_desc`,
        icon: '🆙',
        unlocked: false,
        condition: (stats) => stats.level >= level,
        xpReward: level * 20,
        difficulty: level < 20 ? 'medium' : 'hard',
        recommendedMode: GameMode.TIME_60 // Grind mode
    } as Achievement));
};

const createRepetitionAchievements = () => {
    const list: Achievement[] = [];
    const modes = [
        { id: GameMode.TIME_15, key: 'mode_15', xp10: 100, xp100: 500 },
        { id: GameMode.TIME_30, key: 'mode_30', xp10: 100, xp100: 500 },
        { id: GameMode.TIME_60, key: 'mode_60', xp10: 100, xp100: 500 },
        { id: GameMode.SUDDEN_DEATH, key: 'mode_sd', xp10: 50, xp100: 300 }, // Less XP as requested
    ];

    modes.forEach(m => {
        list.push({
            id: `${m.key}_10`,
            titleKey: `ach_${m.key}_10`,
            descriptionKey: `ach_${m.key}_10_desc`,
            icon: '🔄',
            unlocked: false,
            condition: (stats) => (stats.modesPlayed?.[m.id] || 0) >= 10,
            xpReward: m.xp10,
            difficulty: 'medium',
            recommendedMode: m.id
        });
        list.push({
            id: `${m.key}_100`,
            titleKey: `ach_${m.key}_100`,
            descriptionKey: `ach_${m.key}_100_desc`,
            icon: '🔁',
            unlocked: false,
            condition: (stats) => (stats.modesPlayed?.[m.id] || 0) >= 100,
            xpReward: m.xp100,
            difficulty: 'hard',
            recommendedMode: m.id
        });
    });
    return list;
};

const createSuddenDeathAchievements = () => {
    const streaks = [
        { count: 50, xp: 200, icon: '🗡️' },
        { count: 100, xp: 500, icon: '⚔️' },
        { count: 200, xp: 1000, icon: '🏹' },
        { count: 500, xp: 2500, icon: '🛡️' },
        { count: 1000, xp: 5000, icon: '👑' },
    ];

    return streaks.map(s => ({
        id: `sd_streak_${s.count}`,
        titleKey: `ach_sd_streak_${s.count}`,
        descriptionKey: `ach_sd_streak_${s.count}_desc`,
        icon: s.icon,
        unlocked: false,
        condition: (stats, last) => {
            // Check best streak in stats OR if just achieved in last result
            const inStats = (stats.suddenDeathBestStreak || 0) >= s.count;
            let inLast = false;
            if (last && 'mode' in last && last.mode === GameMode.SUDDEN_DEATH) {
                 inLast = (last.correctChars / 5) >= s.count;
            }
            return !!(inStats || inLast);
        },
        xpReward: s.xp,
        difficulty: s.count < 100 ? 'medium' : 'hard',
        recommendedMode: GameMode.SUDDEN_DEATH
    } as Achievement));
};

const createDiversosAchievements = () => {
    const list: Achievement[] = [];
    Object.values(HabboGameType).forEach(type => {
        // Played Once
        list.push({
            id: `div_${type}_1`,
            titleKey: `ach_${type}_1`,
            descriptionKey: `ach_play_desc`,
            icon: '🎮',
            unlocked: false,
            condition: (stats) => (stats.diversosGamesPlayed[type] || 0) >= 1,
            xpReward: 10,
            difficulty: 'easy',
            recommendedMode: type
        });
        // Played 10
        list.push({
            id: `div_${type}_10`,
            titleKey: `ach_${type}_10`,
            descriptionKey: `ach_play_10_desc`,
            icon: '🥉',
            unlocked: false,
            condition: (stats) => (stats.diversosGamesPlayed[type] || 0) >= 10,
            xpReward: 100,
            difficulty: 'medium',
            recommendedMode: type
        });
         // Played 100
         list.push({
            id: `div_${type}_100`,
            titleKey: `ach_${type}_100`,
            descriptionKey: `ach_play_100_desc`,
            icon: '🥇',
            unlocked: false,
            condition: (stats) => (stats.diversosGamesPlayed[type] || 0) >= 100,
            xpReward: 500,
            difficulty: 'hard',
            recommendedMode: type
        });
    });

    // Difficulty Cumulative Score Achievements
    const thresholds = [100, 1000, 10000];
    const tiers = [
        { key: 'easy', prop: 'habboScoreEasy' },
        { key: 'standard', prop: 'habboScoreStandard' },
        { key: 'hard', prop: 'habboScoreHard' }
    ];

    tiers.forEach(tier => {
        thresholds.forEach(score => {
             list.push({
                id: `score_${tier.key}_${score}`,
                titleKey: `ach_score_${tier.key}_${score}`,
                descriptionKey: `ach_score_${tier.key}_desc`,
                icon: '🏅',
                unlocked: false,
                condition: (stats) => (stats[tier.prop as keyof UserStats] as number) >= score,
                xpReward: Math.floor(score / 10),
                difficulty: score < 1000 ? 'medium' : 'hard',
                recommendedMode: HabboGameType.ALEATORIO
            });
        });
    });

    return list;
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
    {
        id: 'first_steps',
        titleKey: 'ach_first_steps',
        descriptionKey: 'ach_first_steps_desc',
        icon: '👶',
        unlocked: false,
        condition: (stats) => stats.totalTests >= 1,
        xpReward: 50,
        difficulty: 'easy'
    },
    {
        id: 'perfectionist',
        titleKey: 'ach_perfect',
        descriptionKey: 'ach_perfect_desc',
        icon: '✨',
        unlocked: false,
        condition: (stats, last) => {
            if (!last || !('mode' in last)) return false; 
            // Anti-cheat: Custom Mode cannot unlock perfectionist
            if (last.mode === GameMode.CUSTOM) return false;
            return last.accuracy === 100 && last.duration >= 30;
        },
        xpReward: 300,
        difficulty: 'hard',
        recommendedMode: GameMode.TIME_30
    },
    {
        id: 'marathon',
        titleKey: 'ach_marathon',
        descriptionKey: 'ach_marathon_desc',
        icon: '🏃',
        unlocked: false,
        condition: (stats) => stats.totalTimePlayed >= 3600,
        xpReward: 500,
        difficulty: 'hard'
    },
    {
        id: 'dedication_100',
        titleKey: 'ach_dedication_100',
        descriptionKey: 'ach_dedication_100_desc',
        icon: '💯',
        unlocked: false,
        condition: (stats) => stats.totalTests >= 100,
        xpReward: 500,
        difficulty: 'hard'
    },
    {
        id: 'new_look',
        titleKey: 'ach_new_look',
        descriptionKey: 'ach_new_look_desc',
        icon: '🎨',
        unlocked: false,
        condition: (stats) => !!stats.hasChangedAvatar,
        xpReward: 50,
        difficulty: 'easy'
    },
    {
        id: 'ach_size_small',
        titleKey: 'ach_size_small',
        descriptionKey: 'ach_size_small_desc',
        icon: '🔍',
        unlocked: false,
        condition: (stats, last) => {
            if (!last) return false;
            if ((last as any).mode === GameMode.CUSTOM) return false;
            const meta = (last as any).meta;
            return meta?.textSize === TextSize.SMALL;
        },
        xpReward: 100,
        difficulty: 'medium'
    },
    {
        id: 'ach_size_medium',
        titleKey: 'ach_size_medium',
        descriptionKey: 'ach_size_medium_desc',
        icon: '👀',
        unlocked: false,
        condition: (stats, last) => {
             if (!last) return false;
             if ((last as any).mode === GameMode.CUSTOM) return false;
             const meta = (last as any).meta;
             return meta?.textSize === TextSize.MEDIUM;
        },
        xpReward: 50,
        difficulty: 'easy'
    },
    {
        id: 'ach_size_large',
        titleKey: 'ach_size_large',
        descriptionKey: 'ach_size_large_desc',
        icon: '👓',
        unlocked: false,
        condition: (stats, last) => {
             if (!last) return false;
             if ((last as any).mode === GameMode.CUSTOM) return false;
             const meta = (last as any).meta;
             return meta?.textSize === TextSize.LARGE;
        },
        xpReward: 50,
        difficulty: 'easy'
    },
    {
        id: 'ach_focus_user',
        titleKey: 'ach_focus_user',
        descriptionKey: 'ach_focus_user_desc',
        icon: '🧘',
        unlocked: false,
        condition: (stats, last) => {
             if (!last) return false;
             if ((last as any).mode === GameMode.CUSTOM) return false;
             const meta = (last as any).meta;
             return meta?.focusMode === true;
        },
        xpReward: 100,
        difficulty: 'medium'
    },
    {
        id: 'ach_history_viewer',
        titleKey: 'ach_history_viewer',
        descriptionKey: 'ach_history_viewer_desc',
        icon: '📜',
        unlocked: false,
        condition: (stats, last) => {
             if (last && (last as any).mode === 'history_view') return true;
             return false;
        },
        xpReward: 20,
        difficulty: 'easy'
    },
    {
        id: 'ach_curious_mind',
        titleKey: 'ach_curious_mind',
        descriptionKey: 'ach_curious_mind_desc',
        icon: '🤔',
        unlocked: false,
        condition: (stats, last) => {
             if (last && (last as any).mode === 'achievements_view') return true;
             return false;
        },
        xpReward: 20,
        difficulty: 'easy'
    },
    {
        id: 'custom_play',
        titleKey: 'ach_custom_play',
        descriptionKey: 'ach_custom_play_desc',
        icon: '🛠️',
        unlocked: false,
        condition: (stats, last) => {
             if (!last || !('mode' in last)) return false;
             return last.mode === GameMode.CUSTOM;
        },
        xpReward: 50,
        difficulty: 'easy',
        recommendedMode: GameMode.CUSTOM
    },
    {
        id: 'theme_master',
        titleKey: 'ach_theme_master',
        descriptionKey: 'ach_theme_master_desc',
        icon: '🎭',
        unlocked: false,
        condition: (stats) => (stats.usedThemes || []).length >= 5,
        xpReward: 300,
        difficulty: 'medium'
    },
    {
        id: 'font_master',
        titleKey: 'ach_font_master',
        descriptionKey: 'ach_font_master_desc',
        icon: '🔤',
        unlocked: false,
        condition: (stats) => (stats.usedFonts || []).length >= 4,
        xpReward: 300,
        difficulty: 'medium'
    },
    {
        id: 'ach_ach_mode_play',
        titleKey: 'ach_ach_mode_play',
        descriptionKey: 'ach_ach_mode_play_desc',
        icon: '🎯',
        unlocked: false,
        condition: (stats, last) => {
             if (!last || !('mode' in last)) return false;
             return last.mode === GameMode.ACHIEVEMENT;
        },
        xpReward: 50,
        difficulty: 'easy',
        recommendedMode: GameMode.ACHIEVEMENT
    },
    ...createSpeedAchievements(),
    ...createLevelAchievements(),
    ...createRepetitionAchievements(),
    ...createSuddenDeathAchievements(),
    ...createDiversosAchievements(),
];
