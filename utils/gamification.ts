
import { UserStats, TestResult, Achievement, UserProfile, DiversosResult, GameMode } from '../types';
import { ACHIEVEMENTS_LIST } from '../constants';

// Level Calculation:
// Level 1 -> 2: 100 XP
// Level 10 -> 11: 1000 XP
// Requirement for next level = CurrentLevel * 100.
// Total XP to reach Level L = Sum of (i * 100) for i=1 to L-1
// Total XP = 100 * (L * (L-1)) / 2
// 2 * TotalXP / 100 = L^2 - L
// L^2 - L - (TotalXP / 50) = 0
// L = (1 + sqrt(1 + 4 * (TotalXP / 50))) / 2
export const calculateLevel = (totalXp: number): number => {
  if (totalXp < 100) return 1;
  const delta = 1 + 4 * (totalXp / 50);
  const l = (1 + Math.sqrt(delta)) / 2;
  return Math.floor(l);
};

export const getXpProgress = (totalXp: number, level: number): number => {
  // Total XP required to REACH current level
  const xpForCurrentLevel = 50 * level * (level - 1);
  
  // Total XP required to REACH next level
  const nextLevel = level + 1;
  const xpForNextLevel = 50 * nextLevel * (nextLevel - 1);
  
  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel; // Should be level * 100

  return Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));
};

export const calculateXpGain = (result: TestResult): number => {
  let xp = 0;

  // 1. Base XP per Mode
  if (result.mode === GameMode.TIME_15) xp += 20;
  else if (result.mode === GameMode.TIME_30) xp += 50;
  else if (result.mode === GameMode.TIME_60) xp += 100;
  else if (result.mode === GameMode.CUSTOM) xp += 20; // Base for Custom remains, but bonuses are restricted
  else if (result.mode === GameMode.SUDDEN_DEATH) xp += 30; // Base for SD
  
  // 2. Speed Bonus (Tiered only, linear removed)
  // SECURITY: Prevent WPM bonuses in Custom Mode to avoid abuse with short words
  if (result.mode !== GameMode.CUSTOM && result.wordStats) {
      result.wordStats.forEach(stat => {
          if (stat.wpm >= 160) xp += 300;
          else if (stat.wpm >= 130) xp += 100;
          else if (stat.wpm >= 100) xp += 50;
          else if (stat.wpm >= 50) xp += 20;
      });
  }

  return xp;
};

export const checkNewAchievements = (profile: UserProfile, lastResult: TestResult | DiversosResult, sessionScore?: number): string[] => {
  const unlockedIds: string[] = [];
  
  ACHIEVEMENTS_LIST.forEach(ach => {
    if (!profile.achievements.includes(ach.id)) {
      if (ach.condition(profile.stats, lastResult, sessionScore)) {
        unlockedIds.push(ach.id);
      }
    }
  });

  return unlockedIds;
};
