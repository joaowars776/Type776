
import React, { useState, useEffect, useRef } from 'react';
import { GameMode, TestResult, UserSettings, WordLength, ChartPoint, ErrorLog, TextSize, Theme, WordStat, UserStats, AppFont } from '../types';
import { generateWords } from '../utils/words';
import { getTranslation } from '../utils/translations';
import { THEME_CONFIG, FONT_CONFIG, ACHIEVEMENTS_LIST } from '../constants';
import { getXpProgress } from '../utils/gamification';
import { playTypingSound } from '../utils/sound';

interface Props {
  settings: UserSettings;
  mode: GameMode;
  onComplete: (result: TestResult) => void;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
  stats: UserStats; 
  onModeChange?: (mode: GameMode) => void;
  achievements?: string[]; 
  onMissionStart?: (achId: string) => void; 
  activeMissionId?: string | null;
  onMissionCancel?: () => void;
  isInputModalOpen?: boolean;
}

const TypingTest: React.FC<Props> = ({ 
    settings, mode, onComplete, onUpdateSettings, stats, 
    onModeChange, achievements = [], onMissionStart, activeMissionId, 
    onMissionCancel, isInputModalOpen 
}) => {
  const [words, setWords] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currWordIndex, setCurrWordIndex] = useState(0);
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isGameFinished, setIsGameFinished] = useState(false); 
  
  const [correctCharCount, setCorrectCharCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  const [translateY, setTranslateY] = useState(0);
  
  // Track incorrect words indices for visual feedback
  const [wrongIndices, setWrongIndices] = useState<Set<number>>(new Set());

  const statsRef = useRef({ correct: 0, errors: 0 });
  const isFinishedRef = useRef(false); 
  const intervalRef = useRef<any>(null); 
  
  const [keyPressTimes, setKeyPressTimes] = useState<number[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [missedWords, setMissedWords] = useState<ErrorLog[]>([]);

  const [wordStats, setWordStats] = useState<WordStat[]>([]);
  const wordStartTime = useRef<number>(0);

  // Custom Mode Logic
  const [isCustomSetup, setIsCustomSetup] = useState(false);
  const [internalCustomText, setInternalCustomText] = useState('');

  // Achievement Mode State
  const [missionDifficulty, setMissionDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all');
  const [missionSort, setMissionSort] = useState<'xp_desc' | 'xp_asc' | 'default'>('default');

  const inputRef = useRef<HTMLInputElement>(null);
  const innerContainerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const t = (k: string) => getTranslation(k, settings.language);
  
  const areaFont = settings.applyFontToTyping 
    ? FONT_CONFIG[settings.font] 
    : (settings.theme === Theme.EIGHT_BITS ? FONT_CONFIG[AppFont.INTER] : undefined);
    
  const themeConfig = THEME_CONFIG[settings.theme];
  const isLight = settings.theme === Theme.LIGHT;

  const generateAndSetWords = () => {
    if (mode === GameMode.CUSTOM) {
        if (internalCustomText.trim().length > 0) {
            setWords(internalCustomText.trim().split(/[\s\n]+/).filter(w => w.length > 0));
        } else {
            setWords([]);
        }
    } else {
      const wordLen = settings.wordConfig?.length || WordLength.ALL;
      const useAccents = settings.wordConfig?.useAccents ?? true;
      setWords(generateWords(100, settings.language, wordLen, useAccents));
    }
  };

  const resetGame = () => {
    if (mode === GameMode.ACHIEVEMENT) return; 
    
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (mode === GameMode.CUSTOM && internalCustomText.length === 0) {
        setIsCustomSetup(true);
        return;
    }

    setIsGameFinished(false);
    isFinishedRef.current = false; 
    generateAndSetWords();
    setUserInput('');
    setCurrWordIndex(0);
    setStartTime(null);
    setTimer(0);
    setIsActive(false);
    setCorrectCharCount(0);
    setErrorCount(0);
    statsRef.current = { correct: 0, errors: 0 };
    setKeyPressTimes([]);
    setChartData([]);
    setMissedWords([]);
    setWordStats([]);
    setWrongIndices(new Set()); // Clear wrong words
    wordRefs.current = [];
    setTranslateY(0);
    wordStartTime.current = 0;
    
    if (!isInputModalOpen && !isCustomSetup) {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
      if (mode === GameMode.CUSTOM) {
          setIsCustomSetup(true);
          setInternalCustomText(''); 
          setWords([]);
      } else {
          setIsCustomSetup(false);
          resetGame();
      }
  }, [mode]);

  useEffect(() => {
    if (mode !== GameMode.CUSTOM) {
        resetGame();
    }
  }, [settings.language, settings.wordConfig, settings.textSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isInputModalOpen || isCustomSetup) return; 
        if (e.shiftKey && e.key === 'Enter') {
            e.preventDefault();
            resetGame();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, settings, isInputModalOpen, isCustomSetup]); 

  const handleStartCustom = () => {
      if (internalCustomText.trim().length > 0) {
          setIsCustomSetup(false);
          resetGame(); 
      }
  };

  const handleTimeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onModeChange) return;
      if (isActive) return; // Prevent changing while playing to avoid confusion

      if (mode === GameMode.TIME_15) onModeChange(GameMode.TIME_30);
      else if (mode === GameMode.TIME_30) onModeChange(GameMode.TIME_60);
      else onModeChange(GameMode.TIME_15); // Loop back or from other modes
  };

  useEffect(() => {
    if (isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        if (isFinishedRef.current) {
            clearInterval(intervalRef.current);
            return;
        }

        setTimer((prev) => prev + 1);
        const now = Date.now();
        const start = startTime || now;
        const elapsedMinutes = Math.max((now - start) / 60000, 0.0001);
        const duration = Math.floor(elapsedMinutes * 60);

        const correct = statsRef.current.correct;
        const errors = statsRef.current.errors;
        
        const currentWpm = Math.round((correct / 5) / elapsedMinutes);
        const currentRaw = Math.round(((correct + errors) / 5) / elapsedMinutes);
        
        setChartData(prev => [...prev, {
            second: duration,
            wpm: isFinite(currentWpm) ? currentWpm : 0,
            raw: isFinite(currentRaw) ? currentRaw : 0,
            consistency: 0 
        }]);

      }, 1000);
    }
    
    if (mode.startsWith('time_')) {
      const limit = parseInt(mode.split('_')[1]);
      if (timer >= limit && isActive) {
        finishTest();
      }
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timer, mode, startTime]); 

  const finishTest = () => {
    if (isFinishedRef.current) return; 
    isFinishedRef.current = true;
    setIsGameFinished(true); 
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsActive(false);
    
    const finalEndTime = Date.now();
    const exactDurationMs = startTime ? finalEndTime - startTime : 0;
    
    let durationSeconds = 0;
    if (mode.startsWith('time_')) {
        durationSeconds = parseInt(mode.split('_')[1]);
    } else {
        durationSeconds = Math.max(1, exactDurationMs / 1000);
    }
    
    const elapsedMinutes = Math.max(durationSeconds / 60, 0.0001);

    const wpm = Math.round((correctCharCount / 5) / elapsedMinutes);
    const rawWpm = Math.round(((correctCharCount + errorCount) / 5) / elapsedMinutes);
    
    const totalTyped = correctCharCount + errorCount;
    const accuracy = totalTyped === 0 ? 0 : Math.round((correctCharCount / totalTyped) * 100);

    let consistency = 0;
    if (keyPressTimes.length > 1) {
        const diffs = keyPressTimes.map((t, i) => i === 0 ? 0 : t - keyPressTimes[i-1]).slice(1);
        const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        const variance = diffs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / diffs.length;
        const sd = Math.sqrt(variance);
        const cv = sd / mean;
        consistency = Math.max(0, Math.round(100 - (cv * 100)));
    }

    let comparison = '';
    if (stats.averageWpm > 0) {
        comparison = wpm > stats.averageWpm ? 'better_than_avg' : wpm < stats.averageWpm ? 'worse_than_avg' : '';
    }

    const result: TestResult = {
      wpm: isFinite(wpm) ? wpm : 0,
      rawWpm: isFinite(rawWpm) ? rawWpm : 0,
      accuracy,
      consistency,
      correctChars: correctCharCount,
      incorrectChars: errorCount,
      timestamp: Date.now(),
      mode,
      duration: durationSeconds,
      language: settings.language,
      comparison,
      chartData: chartData.map(c => ({...c, consistency})), 
      missedWords,
      wordStats 
    };
    onComplete(result);
  };

  const spawnDust = (x: number, y: number) => {
    if (settings.theme !== Theme.CYBERPUNK) return;
    const el = document.createElement('div');
    el.className = 'particle-dust';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
  };

  const recordWordStat = (word: string, isCorrect: boolean) => {
      if (!isCorrect) return; 
      
      const now = Date.now();
      const duration = (now - wordStartTime.current) / 1000;
      const wpm = Math.round((word.length / 5) / (duration / 60));
      
      setWordStats(prev => [...prev, {
          word,
          duration,
          wpm: isFinite(wpm) ? wpm : 0
      }]);
      
      wordStartTime.current = now;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isInputModalOpen || isCustomSetup || isGameFinished) return; 

    const val = e.target.value;
    const now = Date.now();

    // Trigger Sound
    if (val.length > userInput.length) {
        playTypingSound(settings.soundType);
    }

    if (!isActive && val.length > 0) {
      setIsActive(true);
      setStartTime(now);
      wordStartTime.current = now;
    } else if (isActive && val.length > userInput.length) {
        setKeyPressTimes(prev => [...prev, now]);
        if (settings.theme === Theme.CYBERPUNK) {
            const activeSpan = wordRefs.current[currWordIndex];
            if (activeSpan) {
                const rect = activeSpan.getBoundingClientRect();
                spawnDust(rect.left + (val.length * 14), rect.top + 20); 
            }
        }
    }

    if (val.endsWith(' ')) {
      const trimmed = val.trim();
      const currentWord = words[currWordIndex];
      const isWordCorrect = trimmed === currentWord;

      let charsToAdd = 0;
      let errorsToAdd = 0;

      if (isWordCorrect) {
          charsToAdd = currentWord.length + 1; 
          recordWordStat(currentWord, true);
      } else {
          errorsToAdd = Math.max(trimmed.length, currentWord.length); 
          wordStartTime.current = Date.now();
          // Track missed word index
          setWrongIndices(prev => new Set(prev).add(currWordIndex));
      }

      setCorrectCharCount(prev => prev + charsToAdd);
      setErrorCount(prev => prev + errorsToAdd);
      
      statsRef.current.correct += charsToAdd;
      statsRef.current.errors += errorsToAdd;

      if (!isWordCorrect) {
          setMissedWords(prev => [...prev, { word: currentWord, typed: trimmed }]);
      }

      setCurrWordIndex(prev => prev + 1);
      setUserInput('');

      if (mode === GameMode.SUDDEN_DEATH && !isWordCorrect) {
        finishTest();
        return;
      }

      if (words.length - currWordIndex < 50) {
         if (mode !== GameMode.CUSTOM) {
             const wordLen = settings.wordConfig?.length || WordLength.ALL;
             const useAccents = settings.wordConfig?.useAccents ?? true;
             const newBatch = generateWords(50, settings.language, wordLen, useAccents);
             setWords(prev => [...prev, ...newBatch]);
         } else if (currWordIndex >= words.length - 1) {
             finishTest();
         }
      }
      return;
    }

    setUserInput(val);
    
    if (mode === GameMode.SUDDEN_DEATH) {
      const currentWordTarget = words[currWordIndex];
      const index = val.length - 1;
      if (index >= 0) {
          if (index >= currentWordTarget.length || val[index] !== currentWordTarget[index]) {
            finishTest();
          }
      }
    }
  };

  useEffect(() => {
      const activeWord = wordRefs.current[currWordIndex];
      if (activeWord && innerContainerRef.current) {
          const offsetTop = activeWord.offsetTop;
          setTranslateY(-offsetTop);
      }
  }, [currWordIndex, settings.textSize]);

  const timeLimit = mode.startsWith('time_') ? parseInt(mode.split('_')[1]) : 0;
  const timeLeft = timeLimit > 0 ? timeLimit - timer : timer;
  const textSizeClass = settings.textSize;

  const showHud = !settings.focusMode || (settings.focusMode && (settings.focusModeConfig?.keepTime || settings.focusModeConfig?.keepWPM));
  const xpProgress = getXpProgress(stats.totalXp, stats.level);
  
  const elapsedMinutesReal = Math.max(timer / 60, 0.0001);
  const currentWpmDisplay = Math.round((correctCharCount / 5) / elapsedMinutesReal);

  // ... (Achievement Mode UI Logic omitted for brevity as it is unchanged) ...
  if (mode === GameMode.ACHIEVEMENT) {
      // Re-include full Achievement logic from previous file to ensure no breaking changes
      const lockedAchievements = ACHIEVEMENTS_LIST.filter(a => !achievements.includes(a.id));
      const typingAchievements = lockedAchievements.filter(a => !a.id.startsWith('div_') && !a.id.startsWith('score_'));
      let filteredMissions = typingAchievements;
      if (missionDifficulty !== 'all') filteredMissions = filteredMissions.filter(a => a.difficulty === missionDifficulty);
      if (missionSort === 'xp_desc') filteredMissions.sort((a, b) => b.xpReward - a.xpReward);
      else if (missionSort === 'xp_asc') filteredMissions.sort((a, b) => a.xpReward - b.xpReward);

      return (
          <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in-up">
              <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">🏆 {t('mode_achievement_title')}</h2>
                  <p className="opacity-60">{t('mode_achievement_desc')}</p>
              </div>
              <div className={`flex flex-wrap gap-4 justify-between items-center p-4 rounded-xl border ${isLight ? 'bg-white/80 border-gray-300 shadow-md' : 'bg-black/20 border-gray-500/10'}`}>
                  <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setMissionDifficulty('all')} className={`px-3 py-1 rounded text-sm border ${missionDifficulty === 'all' ? 'bg-blue-500 text-white border-blue-600' : 'border-transparent bg-black/10'}`}>Todos</button>
                      <button onClick={() => setMissionDifficulty('easy')} className={`px-3 py-1 rounded text-sm border ${missionDifficulty === 'easy' ? 'bg-green-500 text-white border-green-600' : 'border-transparent bg-black/10'}`}>{t('filter_diff_easy')}</button>
                      <button onClick={() => setMissionDifficulty('medium')} className={`px-3 py-1 rounded text-sm border ${missionDifficulty === 'medium' ? 'bg-yellow-500 text-white border-yellow-600' : 'border-transparent bg-black/10'}`}>{t('filter_diff_medium')}</button>
                      <button onClick={() => setMissionDifficulty('hard')} className={`px-3 py-1 rounded text-sm border ${missionDifficulty === 'hard' ? 'bg-red-500 text-white border-red-600' : 'border-transparent bg-black/10'}`}>{t('filter_diff_hard')}</button>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setMissionSort('xp_desc')} className={`px-3 py-1 rounded text-sm border ${missionSort === 'xp_desc' ? 'bg-purple-500 text-white border-purple-600' : 'border-transparent bg-black/10'}`}>Maior XP</button>
                      <button onClick={() => setMissionSort('xp_asc')} className={`px-3 py-1 rounded text-sm border ${missionSort === 'xp_asc' ? 'bg-purple-500 text-white border-purple-600' : 'border-transparent bg-black/10'}`}>Menor XP</button>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {filteredMissions.map(ach => {
                      const isActive = activeMissionId === ach.id;
                      let title = t(ach.titleKey);
                      let desc = t(ach.descriptionKey);
                      if (ach.id.startsWith('level_')) {
                          const levelNum = ach.id.split('_')[1];
                          title = title.replace('{n}', levelNum);
                          desc = desc.replace('{n}', levelNum);
                      }
                      return (
                          <div key={ach.id} className={`${themeConfig.panel} p-4 rounded-xl border border-gray-500/10 flex flex-col justify-between relative overflow-hidden group`}>
                              {isActive && <div className="absolute top-0 right-0 p-1 bg-green-500/20 rounded-bl text-[10px] text-green-400 font-bold uppercase">Ativa</div>}
                              <div className="flex justify-between items-start mb-2">
                                  <div className="text-3xl bg-black/20 p-2 rounded-lg">{ach.icon}</div>
                                  <div className="text-xs font-bold px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">+{ach.xpReward} XP</div>
                              </div>
                              <div className="mb-4">
                                  <h3 className="font-bold text-sm mb-1">{title}</h3>
                                  <p className="text-xs opacity-60 leading-tight">{desc}</p>
                              </div>
                              {isActive ? (
                                  <button onClick={() => onMissionCancel && onMissionCancel()} className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-bold mt-2 transition-colors shadow-lg">Cancelar Missão</button>
                              ) : (
                                  <button onClick={() => onMissionStart && onMissionStart(ach.id)} className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 rounded text-sm font-bold mt-2 transition-colors border border-blue-500/30">{t('start_mission')}</button>
                              )}
                          </div>
                      );
                  })}
                  {filteredMissions.length === 0 && <div className="col-span-full text-center py-12 opacity-40">{t('no_missions')}</div>}
              </div>
          </div>
      );
  }

  return (
    <div className={`w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start ${themeConfig.customClass || ''}`} 
         onClick={() => !isInputModalOpen && !isCustomSetup && inputRef.current?.focus()}>
      
      {/* LEFT COLUMN: Typing Area & HUD */}
      <div className="flex-1 w-full max-w-4xl relative">
          
          <div className="flex flex-col gap-6">
              {showHud && (
                <div className="flex justify-between items-end text-xl font-mono font-bold opacity-80 border-b border-gray-500/20 pb-2 mr-4">
                    <div 
                        onClick={handleTimeClick}
                        className={`text-3xl transition-all cursor-pointer select-none px-2 rounded hover:bg-white/5 border border-transparent hover:border-white/10 ${settings.theme === Theme.CYBERPUNK ? 'text-[#ff003c]' : 'text-blue-500'}`}
                        title="Change Mode"
                    >
                        {(!settings.focusMode || settings.focusModeConfig?.keepTime) ? `${timeLeft}s` : ''}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-6">
                            <div>{(!settings.focusMode || settings.focusModeConfig?.keepWPM) ? `${currentWpmDisplay} ${t('wpm')}` : ''}</div>
                        </div>
                        {!settings.focusMode && (
                            <div className="flex items-center gap-2 text-xs opacity-70">
                                <span className="font-bold text-blue-400">LVL {stats.level}</span>
                                <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${xpProgress}%` }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              )}

              {/* Typing Area */}
              <div 
                className={`relative h-64 overflow-hidden bg-transparent ${settings.applyFontToTyping ? '' : 'font-mono'} ${textSizeClass} leading-relaxed outline-none transition-all duration-300 ${isFocused && !isCustomSetup ? 'opacity-100 scale-100' : (isCustomSetup ? 'opacity-100' : 'opacity-50 blur-[1px]')} z-10`}
                style={{ perspective: '1000px', fontFamily: areaFont }}
              >
                {isCustomSetup ? (
                    <div className="absolute inset-0 z-50 flex flex-col gap-4">
                        <textarea
                            className="w-full h-full bg-black/20 p-4 rounded-xl border border-gray-500/20 outline-none resize-none focus:border-blue-500 transition-colors"
                            placeholder={t('custom_text_placeholder')}
                            value={internalCustomText}
                            onChange={(e) => setInternalCustomText(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()} 
                            autoFocus
                        />
                        <button 
                            onClick={handleStartCustom}
                            disabled={internalCustomText.trim().length < 5}
                            className="absolute bottom-4 right-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {t('start_test')}
                        </button>
                    </div>
                ) : (
                    <>
                        {isFocused && settings.theme === Theme.CYBERPUNK && (
                            <div className="absolute left-0 top-0 h-full w-1 bg-[#00ff9f] rounded-full animate-pulse shadow-[0_0_10px_#00ff9f]" />
                        )}
                        
                        <div 
                            ref={innerContainerRef}
                            className="flex flex-wrap gap-x-3 gap-y-4 px-2 transition-transform duration-300 ease-out will-change-transform"
                            style={{ transform: `translateY(${translateY}px)` }}
                        >
                        {words.map((word, wIdx) => {
                            const isActive = wIdx === currWordIndex;
                            const isWrong = wrongIndices.has(wIdx);

                            return (
                            <span 
                                key={wIdx} 
                                ref={(el) => { wordRefs.current[wIdx] = el; }}
                                className={`relative px-1 rounded transition-colors duration-200 ${isActive ? 'bg-gray-500/10' : ''}`}
                            >
                                {word.split('').map((char, cIdx) => {
                                let colorClass = 'opacity-40'; 
                                if (isActive) {
                                    if (cIdx < userInput.length) {
                                    const typedChar = userInput[cIdx];
                                    colorClass = typedChar === char ? 'text-green-500 opacity-100' : 'text-red-500 opacity-100';
                                    } else if (cIdx === userInput.length) {
                                    colorClass = `opacity-80 border-b-2 animate-pulse ${settings.theme === Theme.CYBERPUNK ? 'border-[#ff003c] shadow-[0_0_5px_#ff003c]' : 'border-blue-500'}`; 
                                    }
                                } else if (wIdx < currWordIndex) {
                                    // Visual Feedback for Error
                                    if (isWrong) {
                                        colorClass = 'text-red-500 opacity-60 decoration-red-500 line-through decoration-2';
                                    } else {
                                        colorClass = 'opacity-20';
                                    }
                                }

                                return <span key={cIdx} className={colorClass}>{char}</span>;
                                })}
                                {isActive && userInput.length > word.length && (
                                    <span className="text-red-700 opacity-80">{userInput.slice(word.length)}</span>
                                )}
                            </span>
                            );
                        })}
                        <div className="w-full h-40"></div>
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default"
                            value={userInput}
                            onChange={handleInput}
                            onFocus={() => !isInputModalOpen && !isCustomSetup && setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            autoFocus={!isInputModalOpen && !isCustomSetup}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            disabled={isInputModalOpen || isCustomSetup || isGameFinished} 
                        />
                    </>
                )}
              </div>

              {/* Reload Button */}
              {!isCustomSetup && (
                  <div className="flex justify-center mt-4 relative z-20">
                      <button 
                          onClick={(e) => { e.stopPropagation(); if(mode === GameMode.CUSTOM) setIsCustomSetup(true); else resetGame(); }}
                          className={`group flex items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-105 ${themeConfig.selectorClass}`}
                          title={t('reload_words')}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 opacity-60 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                      </button>
                  </div>
              )}
              
              {!isCustomSetup && <div className="text-center text-sm opacity-40 mt-1">{t('restart_hint')}</div>}

              {/* XP System Guide */}
              {!settings.focusMode && !isCustomSetup && (
                  <div className={`mt-6 w-full p-6 rounded-lg border border-gray-500/10 backdrop-blur-sm text-xs opacity-70 hover:opacity-100 transition-opacity ${isLight ? 'bg-white/70 shadow-lg' : 'bg-black/5'}`}>
                      <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                          🌟 {t('xp_system')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <h4 className="font-bold mb-2 text-green-500">{t('xp_rules_title')}</h4>
                              <ul className="list-disc pl-4 space-y-2 opacity-80" style={{ fontFamily: areaFont || 'inherit' }}>
                                  <li>{t('mode_15s')}: <span className="font-mono text-blue-400">20XP</span></li>
                                  <li>{t('mode_30s')}: <span className="font-mono text-blue-400">50XP</span></li>
                                  <li>{t('mode_60s')}: <span className="font-mono text-blue-400">100XP</span></li>
                              </ul>
                          </div>
                          <div>
                              <h4 className="font-bold mb-2 text-yellow-500">{t('xp_speed_bonus')}</h4>
                              <div className="grid grid-cols-1 gap-2" style={{ fontFamily: areaFont || 'inherit' }}>
                                  <div className="flex justify-between border-b border-gray-500/20 pb-1">
                                      <span>{t('bonus_wpm_50')}</span>
                                      <span className="font-bold text-green-500">{t('plus_xp').replace('{n}', '20')}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-500/20 pb-1">
                                      <span>{t('bonus_wpm_100')}</span>
                                      <span className="font-bold text-blue-500">{t('plus_xp').replace('{n}', '50')}</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className={`w-full md:w-64 flex flex-col gap-4 z-20 transition-opacity duration-500 ${isActive && settings.focusMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
          <button
              onClick={(e) => { e.stopPropagation(); onUpdateSettings({ focusMode: !settings.focusMode }); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all shadow-md ${themeConfig.selectorClass} ${settings.focusMode ? 'text-red-400 bg-red-500/10 border border-red-500/30' : 'text-blue-500 bg-blue-500/10 border border-blue-500/30'}`}
          >
              <span>{settings.focusMode ? '🚫' : '👁️'}</span>
              {settings.focusMode ? 'Sair do Foco' : t('focus_mode')}
          </button>

          {!settings.focusMode && mode !== GameMode.CUSTOM && (
              <div className={`flex flex-col gap-3 p-4 rounded-xl border backdrop-blur-sm transition-all ${isLight ? 'bg-white/60 border-gray-200' : 'bg-black/20 border-white/5'}`}>
                  <div className="text-[10px] font-bold uppercase opacity-50 tracking-wider mb-1">Configuração</div>
                  
                  {settings.language !== 'en' && (
                      <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateSettings({ wordConfig: { ...settings.wordConfig, useAccents: !settings.wordConfig.useAccents }}); }}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex justify-between items-center transition-colors ${themeConfig.selectorClass} ${settings.wordConfig?.useAccents ? 'text-green-500' : 'opacity-70'}`}
                      >
                          <span>Acentos</span>
                          <span>{settings.wordConfig?.useAccents ? 'ON' : 'OFF'}</span>
                      </button>
                  )}

                  <button 
                       onClick={(e) => { 
                           e.stopPropagation(); 
                           const order = [WordLength.ALL, WordLength.SHORT, WordLength.MEDIUM, WordLength.LONG];
                           const currentLen = settings.wordConfig?.length || WordLength.ALL;
                           const next = order[(order.indexOf(currentLen) + 1) % order.length];
                           onUpdateSettings({ wordConfig: { ...settings.wordConfig, length: next }});
                       }}
                       className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex ${settings.font === AppFont.PRESS_START ? 'flex-col items-start gap-1' : 'justify-between items-center'} transition-colors ${themeConfig.selectorClass}`}
                  >
                      <span>Extensão</span>
                      <span className="capitalize text-blue-400">{t(`word_len_${settings.wordConfig?.length || WordLength.ALL}`).split(' ')[0]}</span>
                  </button>

                  <button 
                       onClick={(e) => { 
                           e.stopPropagation(); 
                           const order = [TextSize.SMALL, TextSize.MEDIUM, TextSize.LARGE];
                           const next = order[(order.indexOf(settings.textSize) + 1) % order.length];
                           onUpdateSettings({ textSize: next });
                       }}
                       className={`w-full py-2 px-3 rounded-lg text-xs font-medium flex justify-between items-center transition-colors ${themeConfig.selectorClass}`}
                  >
                       <span>Tamanho</span>
                       <span className="capitalize text-purple-400">{settings.textSize === TextSize.SMALL ? 'Peq' : settings.textSize === TextSize.MEDIUM ? 'Méd' : 'Grd'}</span>
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default TypingTest;
