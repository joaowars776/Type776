
import React, { useState, useEffect, useRef } from 'react';
import { loadProfile, saveProfile, resetProfile, exportData, importData } from './utils/storage';
import { calculateLevel, calculateXpGain, checkNewAchievements } from './utils/gamification';
import { UserProfile, INITIAL_PROFILE, GameMode, TestResult, Theme, AppFont, HabboGameType, DiversosResult, HabboDifficulty, UserSettings, SoundType } from './types';
import { getTranslation } from './utils/translations';
import { THEME_CONFIG, GAME_MODES, FONT_CONFIG, ACHIEVEMENTS_LIST } from './constants';
import Onboarding from './components/Onboarding';
import TypingTest from './components/TypingTest';
import Profile from './components/Profile';
import HabboHub from './components/HabboHub';
import HabboGame from './components/HabboGame';
import MissionTracker from './components/MissionTracker';
import SnowEffect from './components/SnowEffect';
import { playTypingSound } from './utils/sound';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function App() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'game' | 'profile' | 'habbo'>('game');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  const [previousFont, setPreviousFont] = useState<AppFont>(AppFont.INTER);

  const [gameMode, setGameMode] = useState<GameMode>(GameMode.TIME_15);
  const [timeModeOpen, setTimeModeOpen] = useState(false); 

  const [habboGameType, setHabboGameType] = useState<HabboGameType | null>(null);
  const [gameResetKey, setGameResetKey] = useState(0); 
  
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [missionCompleted, setMissionCompleted] = useState(false);

  const [habboRandomConfig, setHabboRandomConfig] = useState<{
      filters: HabboGameType[];
      difficulty: HabboDifficulty;
  } | undefined>(undefined);

  const [sessionScore, setSessionScore] = useState(0); 
  const [sessionStats, setSessionStats] = useState({ totalChars: 0, totalTime: 0 });
  
  const [showResult, setShowResult] = useState<TestResult | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<string>('');
  const [showAchievementList, setShowAchievementList] = useState(false);
  
  // NEW: State for Error Details Modal
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [errorPage, setErrorPage] = useState(0); // Pagination for errors
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const loaded = loadProfile();
    setProfile(loaded);
    setPreviousFont(loaded.settings.font); 
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && profile.isSetupCompleted) {
      saveProfile(profile);
    }
  }, [profile, loading]);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (settingsRef.current && !settingsRef.current.contains(event.target as Node) && isSettingsOpen) {
              setIsSettingsOpen(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSettingsOpen]);

  const handleThemeChange = (newTheme: Theme) => {
      setProfile(prev => {
          let nextFont = prev.settings.font;
          let nextHabboConfig = { ...prev.settings.habboConfig };
          if (newTheme === Theme.EIGHT_BITS) {
              nextHabboConfig.layout = 'compact';
          }

          if (newTheme === Theme.EIGHT_BITS && prev.settings.theme !== Theme.EIGHT_BITS) {
              setPreviousFont(prev.settings.font); 
              nextFont = AppFont.PRESS_START; 
          }
          else if (prev.settings.theme === Theme.EIGHT_BITS && newTheme !== Theme.EIGHT_BITS) {
              nextFont = previousFont;
          }
          return {
              ...prev,
              settings: {
                  ...prev.settings,
                  theme: newTheme,
                  font: nextFont,
                  habboConfig: nextHabboConfig
              }
          };
      });
  };

  const handleUpdateAvatar = (avatar: string, image?: string) => {
      // 1. Calculate new stats state locally
      const updatedStats = { ...profile.stats, hasChangedAvatar: true };
      
      // 2. Create the full context profile for achievement checking
      const contextProfile = { 
          ...profile, 
          avatar, 
          avatarImage: image, 
          stats: updatedStats 
      };

      // 3. Check for achievements using the FRESH context
      const newUnlocked = checkNewAchievements(contextProfile, { mode: 'avatar_change' } as any);
      
      let xpGain = 0;
      let missionJustFinished = false;

      newUnlocked.forEach(id => {
          const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
          if (ach) xpGain += ach.xpReward;
          if (id === activeMissionId) {
              missionJustFinished = true;
          }
      });

      if (newUnlocked.length > 0) {
          if (missionJustFinished) {
              setMissionCompleted(true);
          }
          setNewAchievements(prev => [...prev, ...newUnlocked]);
          if (currentView === 'game') setShowResult(null); 
      }

      // 4. Update state once with everything
      setProfile(p => ({
          ...p,
          avatar,
          avatarImage: image,
          stats: {
              ...updatedStats,
              totalXp: p.stats.totalXp + xpGain,
              level: calculateLevel(p.stats.totalXp + xpGain)
          },
          achievements: [...p.achievements, ...newUnlocked]
      }));
  };

  const handleTestComplete = (result: TestResult) => {
    const xpGained = calculateXpGain(result);
    const newTotalXp = profile.stats.totalXp + xpGained;
    const newLevel = calculateLevel(newTotalXp);
    
    const newAvgConsistency = profile.stats.averageConsistency === 0 
        ? result.consistency 
        : Math.round(((profile.stats.averageConsistency * profile.stats.totalTests) + result.consistency) / (profile.stats.totalTests + 1));

    const modesPlayed = { ...profile.stats.modesPlayed };
    modesPlayed[result.mode] = (modesPlayed[result.mode] || 0) + 1;

    const usedThemes = profile.stats.usedThemes || [];
    if (!usedThemes.includes(profile.settings.theme)) usedThemes.push(profile.settings.theme);

    const usedFonts = profile.stats.usedFonts || [];
    if (!usedFonts.includes(profile.settings.font)) usedFonts.push(profile.settings.font);

    let streak = profile.stats.suddenDeathBestStreak || 0;
    if (result.mode === GameMode.SUDDEN_DEATH) {
        streak = Math.max(streak, Math.floor(result.correctChars / 5)); 
    }

    // UPDATE: Track individual mode records
    const updatedBestWpmPerMode = { ...profile.stats.bestWpmPerMode };
    if ([GameMode.TIME_15, GameMode.TIME_30, GameMode.TIME_60, GameMode.SUDDEN_DEATH].includes(result.mode)) {
        const currentBest = updatedBestWpmPerMode[result.mode] || 0;
        if (result.wpm > currentBest) {
            updatedBestWpmPerMode[result.mode] = result.wpm;
        }
    }

    // UPDATE: Prevent Custom Mode from polluting Global Highest WPM
    let newHighestWpm = profile.stats.highestWpm;
    if (result.mode !== GameMode.CUSTOM) {
        newHighestWpm = Math.max(profile.stats.highestWpm, result.wpm);
    }

    const newStats = {
      ...profile.stats,
      totalTests: profile.stats.totalTests + 1,
      totalTimePlayed: profile.stats.totalTimePlayed + result.duration,
      highestWpm: newHighestWpm,
      bestWpmPerMode: updatedBestWpmPerMode, // Save breakdown
      totalXp: newTotalXp,
      level: newLevel,
      averageWpm: Math.round(((profile.stats.averageWpm * profile.stats.totalTests) + result.wpm) / (profile.stats.totalTests + 1)),
      averageAccuracy: Math.round(((profile.stats.averageAccuracy * profile.stats.totalTests) + result.accuracy) / (profile.stats.totalTests + 1)),
      averageConsistency: newAvgConsistency,
      modesPlayed,
      usedThemes,
      usedFonts,
      suddenDeathBestStreak: streak
    };

    const resultWithMeta = {
        ...result,
        meta: {
            textSize: profile.settings.textSize,
            focusMode: profile.settings.focusMode
        }
    };

    const newUnlocked = checkNewAchievements({...profile, stats: newStats}, resultWithMeta);
    
    let achievementXp = 0;
    let missionJustFinished = false;

    newUnlocked.forEach(id => {
        const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
        if (ach) achievementXp += ach.xpReward;
        
        if (id === activeMissionId) {
             missionJustFinished = true;
        }
    });

    const finalTotalXp = newStats.totalXp + achievementXp;
    const finalLevel = calculateLevel(finalTotalXp);
    newStats.totalXp = finalTotalXp;
    newStats.level = finalLevel;

    const updatedAchievements = [...profile.achievements, ...newUnlocked];
    
    setNewAchievements(newUnlocked);
    if(newUnlocked.length > 0) setShowAchievementList(false); 

    setProfile(prev => ({
        ...prev,
        stats: newStats,
        history: [...prev.history, result],
        achievements: updatedAchievements
    }));

    if (missionJustFinished) {
        setMissionCompleted(true);
    } else {
        setShowResult(result);
    }
  };

  const handleDiversosComplete = (result: DiversosResult) => {
      const newSessionScore = sessionScore + result.score;
      setSessionScore(newSessionScore);
      
      let newScoreEasy = profile.stats.habboScoreEasy || 0;
      let newScoreStandard = profile.stats.habboScoreStandard || 0;
      let newScoreHard = profile.stats.habboScoreHard || 0;

      if (result.difficulty === HabboDifficulty.EASY) newScoreEasy += result.score;
      if (result.difficulty === HabboDifficulty.STANDARD) newScoreStandard += result.score;
      if (result.difficulty === HabboDifficulty.HARD) newScoreHard += result.score;

      const gamesPlayed = { ...profile.stats.diversosGamesPlayed };
      gamesPlayed[result.gameType] = (gamesPlayed[result.gameType] || 0) + 1;

      const newStats = {
          ...profile.stats,
          diversosTimePlayed: (profile.stats.diversosTimePlayed || 0) + result.duration,
          diversosGamesPlayed: gamesPlayed,
          habboScoreEasy: newScoreEasy,
          habboScoreStandard: newScoreStandard,
          habboScoreHard: newScoreHard
      };

      setProfile(prev => ({ ...prev, stats: newStats }));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const data = await importData(file);
              setProfile(data);
              setImportStatus('success');
              setTimeout(() => setImportStatus(''), 3000);
          } catch (err) {
              setImportStatus('error');
              setTimeout(() => setImportStatus(''), 3000);
          }
      }
  };

  const handleRestart = () => {
      setShowResult(null);
      setNewAchievements([]);
      setShowErrorDetails(false); // Close error modal
      setErrorPage(0); // Reset page
      setGameResetKey(prev => prev + 1); 
  };

  const startMission = (achId: string) => {
      setActiveMissionId(achId);
      setMissionCompleted(false);
  };

  const cancelMission = () => {
      setActiveMissionId(null);
      setMissionCompleted(false);
  };

  const returnToMissionSelect = () => {
      setActiveMissionId(null);
      setMissionCompleted(false);
      setGameMode(GameMode.ACHIEVEMENT);
      setGameResetKey(prev => prev + 1);
  };

  const startHabboMode = () => {
      setCurrentView('habbo');
      setHabboGameType(null);
      setSessionScore(0);
      setSessionStats({ totalChars: 0, totalTime: 0 });
  };

  const t = (k: string) => getTranslation(k, profile.settings.language);
  const themeStyles = THEME_CONFIG[profile.settings.theme];
  const fontStyle = { fontFamily: FONT_CONFIG[profile.settings.font] || 'sans-serif' };

  if (loading) return null;

  if (!profile.isSetupCompleted) {
    return <Onboarding onComplete={setProfile} />;
  }

  // --- HELPER FOR ERROR RENDERING ---
  const renderErrorDiff = (correct: string, typed: string) => {
      const maxLength = Math.max(correct.length, typed.length);
      const chars = [];
      for(let i=0; i<maxLength; i++) {
          const cChar = correct[i];
          const tChar = typed[i];
          
          let className = "text-white/30"; // Correct (dimmed for focus)
          if (!tChar && cChar) {
              // Missing
              className = "text-white/20";
          } else if (tChar && !cChar) {
              // Extra
              className = "text-red-500 font-bold bg-red-500/10";
          } else if (tChar !== cChar) {
              // Wrong
              className = "text-red-400 font-bold";
          } else {
              // Match
              className = "text-white/40";
          }
          
          chars.push(<span key={i} className={className}>{tChar || '_'}</span>);
      }
      return (
          <div className="flex flex-col text-sm bg-black/20 p-2 rounded border border-white/5">
              <span className="text-green-400 font-mono tracking-wider text-xs mb-1 select-none">{correct}</span>
              <div className="font-mono tracking-wider break-all leading-none">{chars}</div>
          </div>
      );
  };

  // Pagination Logic for Errors
  const ERRORS_PER_PAGE = 10;
  const missedWordsCount = showResult?.missedWords?.length || 0;
  const totalErrorPages = Math.ceil(missedWordsCount / ERRORS_PER_PAGE);
  const displayedErrors = showResult?.missedWords?.slice(errorPage * ERRORS_PER_PAGE, (errorPage + 1) * ERRORS_PER_PAGE) || [];

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${themeStyles.bg} ${themeStyles.text} ${profile.settings.font !== AppFont.INTER ? '' : 'font-sans'} selection:bg-blue-500/30 overflow-x-hidden`} style={fontStyle}>
        
        {profile.settings.theme === Theme.CHRISTMAS && <SnowEffect intensity={profile.settings.snowIntensity} />}
        
        <MissionTracker activeMissionId={activeMissionId} onCancel={cancelMission} isCompleted={missionCompleted} onReturnToMissions={returnToMissionSelect} />

        {/* Enhanced Result Modal */}
        {showResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in-up" onClick={handleRestart}>
                
                {/* --- ERROR DETAILS MODAL OVERLAY --- */}
                {showErrorDetails && (
                    <div 
                        className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" 
                        onClick={(e) => { e.stopPropagation(); setShowErrorDetails(false); setErrorPage(0); }}
                    >
                        <div className={`${themeStyles.panel} w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl border border-red-500/20 animate-scale-in`} onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-red-500/10 rounded-t-2xl">
                                <h3 className="font-bold text-red-300 flex items-center gap-2">
                                    ❌ {t('missed_words')} 
                                    <span className="bg-red-500/20 px-2 py-0.5 rounded text-xs text-white">{missedWordsCount}</span>
                                </h3>
                                <button onClick={() => { setShowErrorDetails(false); setErrorPage(0); }} className="text-xl opacity-50 hover:opacity-100 hover:text-white">✕</button>
                            </div>
                            
                            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {displayedErrors.map((err, idx) => (
                                        <div key={idx}>
                                            {renderErrorDiff(err.word, err.typed)}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pagination Footer */}
                            <div className="p-3 border-t border-white/10 bg-black/20 rounded-b-2xl flex justify-between items-center">
                                {totalErrorPages > 1 ? (
                                    <div className="flex gap-2 w-full justify-center">
                                        <button 
                                            onClick={() => setErrorPage(p => Math.max(0, p - 1))}
                                            disabled={errorPage === 0}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-bold disabled:opacity-30 transition-colors"
                                        >
                                            ← Anterior
                                        </button>
                                        <span className="flex items-center text-xs opacity-60 font-mono">
                                            {errorPage + 1} / {totalErrorPages}
                                        </span>
                                        <button 
                                            onClick={() => setErrorPage(p => Math.min(totalErrorPages - 1, p + 1))}
                                            disabled={errorPage === totalErrorPages - 1}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs font-bold disabled:opacity-30 transition-colors"
                                        >
                                            Próximo →
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full text-center">
                                        <button onClick={() => { setShowErrorDetails(false); setErrorPage(0); }} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-colors">
                                            {t('close')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className={`${themeStyles.panel} p-8 rounded-3xl w-full max-w-4xl shadow-2xl relative border border-gray-500/20`} onClick={e => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="text-sm font-bold uppercase opacity-50 tracking-widest mb-1">{t('test_complete')}</div>
                        <div className="text-7xl font-black text-blue-500 drop-shadow-lg">{showResult.wpm} <span className="text-2xl font-bold opacity-50 text-white">WPM</span></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Stats Grid */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="text-xs uppercase opacity-50 font-bold mb-1">{t('acc')}</div>
                                    <div className={`text-3xl font-bold ${showResult.accuracy === 100 ? 'text-green-400' : 'text-yellow-400'}`}>{showResult.accuracy}%</div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="text-xs uppercase opacity-50 font-bold mb-1">{t('consistency')}</div>
                                    <div className="text-3xl font-bold text-purple-400">{showResult.consistency}%</div>
                                </div>
                                {/* INTERACTIVE ERROR CARD */}
                                <div 
                                    onClick={() => showResult.incorrectChars > 0 && setShowErrorDetails(true)}
                                    className={`bg-black/20 p-4 rounded-xl border border-white/5 relative group transition-all ${showResult.incorrectChars > 0 ? 'cursor-pointer hover:bg-red-500/10 hover:border-red-500/30' : ''}`}
                                >
                                    <div className="text-xs uppercase opacity-50 font-bold mb-1 group-hover:text-red-300">Erros</div>
                                    <div className={`text-3xl font-bold ${showResult.incorrectChars > 0 ? 'text-red-400' : 'text-white'}`}>{showResult.missedWords.length}</div>
                                    {showResult.incorrectChars > 0 && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded uppercase font-bold transition-opacity">
                                            Ver
                                        </div>
                                    )}
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="text-xs uppercase opacity-50 font-bold mb-1">{t('time')}</div>
                                    <div className="text-3xl font-bold text-white">{Math.round(showResult.duration)}s</div>
                                </div>
                            </div>

                            {/* Achievements Section - CONDITIONAL */}
                            {newAchievements.length > 0 && (
                                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30 animate-pulse">
                                    <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-3 text-center">🏆 Conquistas Desbloqueadas</h3>
                                    <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto custom-scrollbar">
                                        {newAchievements.map(id => {
                                            const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
                                            if (!ach) return null;
                                            
                                            // FIX: Parse level placeholder correctly
                                            let title = t(ach.titleKey);
                                            if (ach.id.startsWith('level_')) {
                                                const levelNum = ach.id.split('_')[1];
                                                title = title.replace('{n}', levelNum);
                                            }

                                            return (
                                                <div key={id} className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-yellow-500/20" title={t(ach.descriptionKey)}>
                                                    <span className="text-xl">{ach.icon}</span>
                                                    <span className="text-xs font-bold text-yellow-200">{title}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chart Area */}
                        <div className="flex flex-col gap-4">
                            <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5 min-h-[200px]">
                                <div className="text-xs uppercase opacity-50 font-bold mb-2 ml-2">Gráfico de Desempenho</div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={showResult.chartData || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="second" hide />
                                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }} 
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Line type="monotone" dataKey="wpm" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 4, fill: '#3b82f6'}} animationDuration={1000} />
                                        <Line type="monotone" dataKey="raw" stroke="#666" strokeWidth={1} dot={false} strokeDasharray="3 3" animationDuration={1000} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div className="flex gap-3 mt-auto">
                                <button onClick={handleRestart} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                    {t('restart')}
                                </button>
                                <button onClick={() => { setShowResult(null); setCurrentView('profile'); }} className="flex-1 py-4 bg-white/5 hover:bg-white/10 font-bold rounded-xl border border-white/10 transition-colors">
                                    {t('profile')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <header className={`w-full max-w-7xl mx-auto p-6 flex justify-between items-center relative z-30 transition-all duration-300 ${isSettingsOpen ? 'mr-96' : ''}`}>
             <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setCurrentView('game')}>
                 <div className="text-3xl animate-bounce-slow">⌨️</div>
                 <h1 className="text-2xl font-black tracking-tighter group-hover:text-blue-500 transition-colors">Type<span className="text-blue-500">776</span></h1>
             </div>

             <nav className="hidden md:flex gap-1 bg-black/5 p-1 rounded-full border border-white/5 backdrop-blur-sm">
                 <button onClick={() => setCurrentView('game')} className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${currentView === 'game' ? 'bg-blue-600 text-white shadow-lg' : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}>{t('typing')}</button>
                 <button onClick={startHabboMode} className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${currentView === 'habbo' ? 'bg-purple-600 text-white shadow-lg' : 'opacity-60 hover:opacity-100 hover:bg-black/5'}`}>{t('habbo')}</button>
             </nav>

             <div className="flex items-center gap-4">
                 <button onClick={() => setCurrentView('profile')} className="flex items-center gap-3 group">
                     <div className="text-right hidden sm:block">
                         <div className="text-xs font-bold opacity-50 uppercase tracking-wider">{t('level')} {profile.stats.level}</div>
                         <div className="font-bold text-sm group-hover:text-blue-400 transition-colors">{profile.username}</div>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg group-hover:scale-105 transition-transform">
                         <div className="w-full h-full rounded-full flex items-center justify-center text-lg bg-black" style={{ background: profile.avatar }}>{profile.avatarImage || '👤'}</div>
                     </div>
                 </button>
                 
                 <div className="relative" ref={settingsRef}>
                     <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSettingsOpen ? 'bg-blue-600 text-white rotate-90' : 'bg-black/5 hover:bg-black/10'}`}>⚙️</button>
                     
                     {isSettingsOpen && (
                         <div className={`fixed top-4 right-4 h-fit max-h-[calc(100vh-2rem)] w-80 p-6 shadow-2xl z-50 animate-slide-in-right rounded-3xl border-l ${themeStyles.panel} border-white/10 flex flex-col`}>
                             {/* Settings Content (Preserved) */}
                             <div className="flex justify-between items-center mb-4 border-b border-gray-500/20 pb-3">
                                 <h3 className="font-bold text-lg uppercase opacity-70 flex items-center gap-2">⚙️ {t('settings')}</h3>
                                 <button onClick={() => setIsSettingsOpen(false)} className="opacity-50 hover:opacity-100 hover:bg-white/10 p-2 rounded-full transition-colors">✕</button>
                             </div>
                             
                             <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                 <div>
                                     <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block tracking-wider">{t('language')}</label>
                                     <div className="flex bg-black/20 rounded p-1">
                                         <button onClick={() => setProfile({...profile, settings: {...profile.settings, language: 'pt'}})} className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${profile.settings.language === 'pt' ? 'bg-blue-600 text-white shadow' : 'opacity-50 hover:opacity-100'}`}>PT</button>
                                         <button onClick={() => setProfile({...profile, settings: {...profile.settings, language: 'en'}})} className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${profile.settings.language === 'en' ? 'bg-blue-600 text-white shadow' : 'opacity-50 hover:opacity-100'}`}>EN</button>
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block tracking-wider">{t('theme')}</label>
                                     <div className="grid grid-cols-2 gap-2">
                                         {(Object.values(Theme) as Theme[]).map(th => (
                                             <button key={th} onClick={() => handleThemeChange(th)} className={`w-full p-2 rounded border transition-all text-left flex flex-col gap-2 ${profile.settings.theme === th ? 'border-blue-500 bg-blue-500/10' : 'border-transparent bg-black/10 hover:bg-black/20'}`}>
                                                 <div className="w-full h-3 flex rounded overflow-hidden border border-white/10">
                                                     <div className="flex-1" style={{ backgroundColor: THEME_CONFIG[th].demo.bg }} />
                                                     <div className="w-3" style={{ backgroundColor: THEME_CONFIG[th].demo.text }} />
                                                     <div className="w-3" style={{ backgroundColor: THEME_CONFIG[th].demo.accent }} />
                                                 </div>
                                                 <span className="text-[10px] font-bold truncate">{t(`theme_${th}`)}</span>
                                             </button>
                                         ))}
                                     </div>
                                 </div>

                                 {profile.settings.theme === Theme.CHRISTMAS && (
                                     <div className="animate-fade-in-up">
                                         <div className="flex justify-between items-center mb-1">
                                             <label className="text-[10px] font-bold uppercase opacity-50 tracking-wider text-blue-300">❄️ {t('snow_intensity')}</label>
                                             <span className="text-[10px] font-mono opacity-70">{profile.settings.snowIntensity}</span>
                                         </div>
                                         <input 
                                             type="range" 
                                             min="0" 
                                             max="10" 
                                             step="1"
                                             value={profile.settings.snowIntensity}
                                             onChange={(e) => setProfile({...profile, settings: {...profile.settings, snowIntensity: parseInt(e.target.value)}})}
                                             className="w-full h-2 bg-black/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                         />
                                     </div>
                                 )}

                                 <div>
                                     <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block tracking-wider">{t('sound_effects')}</label>
                                     <select 
                                        value={profile.settings.soundType}
                                        onChange={(e) => {
                                            const newSound = e.target.value as SoundType;
                                            setProfile({...profile, settings: {...profile.settings, soundType: newSound}});
                                            playTypingSound(newSound);
                                        }}
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 transition-colors mb-2"
                                     >
                                         <option value={SoundType.OFF}>{t('sound_off')}</option>
                                         <option value={SoundType.KEYBOARD}>{t('sound_keyboard')}</option>
                                         <option value={SoundType.HIGH_PITCH}>{t('sound_high_pitch')}</option>
                                     </select>
                                 </div>

                                 <div>
                                     <label className="text-[10px] font-bold uppercase opacity-50 mb-1 block tracking-wider">{t('font_family')}</label>
                                     <select 
                                        value={profile.settings.font}
                                        onChange={(e) => setProfile({...profile, settings: {...profile.settings, font: e.target.value as AppFont}})}
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-blue-500 transition-colors"
                                     >
                                         {Object.values(AppFont).map(f => (
                                             <option key={f} value={f}>{f}</option>
                                         ))}
                                     </select>
                                     <label className="flex items-center gap-3 mt-2 cursor-pointer group">
                                         <input type="checkbox" checked={profile.settings.applyFontToTyping} onChange={(e) => setProfile({...profile, settings: {...profile.settings, applyFontToTyping: e.target.checked}})} className="rounded bg-black/20 border-white/10 cursor-pointer accent-blue-500" />
                                         <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">{t('apply_font_typing')}</span>
                                     </label>
                                 </div>

                                 <div className="pt-4 border-t border-gray-500/20">
                                     {!showResetConfirm ? (
                                         <>
                                             <button onClick={() => setShowResetConfirm(true)} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition-colors mb-2 border border-red-500/20">{t('logout')}</button>
                                             <div className="flex gap-2">
                                                 <button onClick={() => exportData(profile)} className="flex-1 py-1.5 bg-black/20 hover:bg-black/30 rounded text-[10px] font-bold transition-colors opacity-70 hover:opacity-100 flex items-center justify-center gap-1">📤 {t('export_data')}</button>
                                                 <label className="flex-1 py-1.5 bg-black/20 hover:bg-black/30 rounded text-[10px] font-bold transition-colors opacity-70 hover:opacity-100 text-center cursor-pointer flex items-center justify-center gap-1">
                                                     📥 {t('import_data')}
                                                     <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                                                 </label>
                                             </div>
                                             {importStatus === 'success' && <div className="text-xs text-green-500 text-center mt-1">{t('import_success')}</div>}
                                             {importStatus === 'error' && <div className="text-xs text-red-500 text-center mt-1">{t('import_error')}</div>}
                                         </>
                                     ) : (
                                         <div className="flex flex-col gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 animate-fade-in-up">
                                             <div className="text-center text-xs font-bold text-red-400 mb-1">⚠️ Tem certeza?</div>
                                             <button onClick={() => exportData(profile)} className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center justify-center gap-2 mb-1">💾 Salvar Backup Primeiro</button>
                                             <div className="flex gap-2">
                                                 <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-1.5 bg-gray-500/20 hover:bg-gray-500/30 text-white rounded text-xs font-bold">Cancelar</button>
                                                 <button onClick={() => resetProfile()} className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold">Confirmar Reset</button>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                     )}
                 </div>
             </div>
        </header>

        <main className={`w-full max-w-7xl mx-auto p-4 md:p-6 pb-20 transition-all duration-300 ease-out ${isSettingsOpen ? 'mr-96' : ''}`}>
            {currentView === 'profile' && <Profile profile={profile} onUpdateName={(n) => setProfile({...profile, username: n, isGuest: false})} onUpdateAvatar={handleUpdateAvatar} />}
            {currentView === 'habbo' && (!habboGameType ? <HabboHub settings={profile.settings} onSelect={(t, config) => { setHabboGameType(t); if (t === HabboGameType.ALEATORIO && config) setHabboRandomConfig(config); }} profile={profile} onUpdateSettings={(s) => setProfile({...profile, settings: {...profile.settings, ...s}})} /> : <HabboGame key={gameResetKey} type={habboGameType} settings={profile.settings} onBack={() => setHabboGameType(null)} onComplete={handleDiversosComplete} sessionScore={sessionScore} randomConfig={habboRandomConfig} sessionStats={sessionStats} />)}
            {currentView === 'game' && (
                <div className="flex flex-col gap-8 animate-fade-in-up">
                    {!profile.settings.focusMode && (
                        <div className="flex justify-center flex-wrap gap-2 items-center">
                            <div className="relative">
                                <button onClick={() => setTimeModeOpen(!timeModeOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${[GameMode.TIME_15, GameMode.TIME_30, GameMode.TIME_60].includes(gameMode) ? 'bg-blue-600 text-white shadow-lg' : 'bg-black/5 hover:bg-black/10 opacity-60 hover:opacity-100'}`}><span>⏱️</span><span className="hidden sm:inline">{[GameMode.TIME_15, GameMode.TIME_30, GameMode.TIME_60].includes(gameMode) ? t(`mode_${gameMode.split('_')[1]}s`) : t('time')}</span><span className="text-[10px] ml-1">▼</span></button>
                                {timeModeOpen && <div className={`absolute top-full left-0 mt-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-20 flex flex-col overflow-hidden min-w-[120px]`}>{[GameMode.TIME_15, GameMode.TIME_30, GameMode.TIME_60].map(m => (<button key={m} onClick={() => { setGameMode(m); setTimeModeOpen(false); }} className={`px-4 py-2 text-left text-xs font-bold hover:bg-white/10 transition-colors ${gameMode === m ? 'text-blue-400' : 'text-white'}`}>{t(`mode_${m.split('_')[1]}s`)}</button>))}</div>}
                            </div>
                            <button onClick={() => setGameMode(GameMode.CUSTOM)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${gameMode === GameMode.CUSTOM ? 'bg-purple-600 text-white shadow-lg' : 'bg-black/5 hover:bg-black/10 opacity-60 hover:opacity-100'}`}><span>✏️</span><span className="hidden sm:inline">{t('mode_custom')}</span></button>
                            <button onClick={() => setGameMode(GameMode.SUDDEN_DEATH)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all animate-pulse text-red-500 ${gameMode === GameMode.SUDDEN_DEATH ? 'bg-red-500/20 shadow-lg ring-1 ring-red-500' : 'bg-black/5 hover:bg-black/10 hover:opacity-100'}`}><span>💀</span><span className="hidden sm:inline">{t('mode_sudden_death')}</span></button>
                            <button onClick={() => setGameMode(GameMode.ACHIEVEMENT)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${gameMode === GameMode.ACHIEVEMENT ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-pulse text-white shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'text-yellow-400 bg-black/5 hover:bg-black/10 hover:opacity-100'}`}><span>🏆</span><span className="hidden sm:inline">{t('mode_achievement')}</span></button>
                        </div>
                    )}
                    <TypingTest key={`${gameMode}-${gameResetKey}`} settings={profile.settings} mode={gameMode} onComplete={handleTestComplete} onUpdateSettings={(s) => setProfile(prev => ({...prev, settings: {...prev.settings, ...s}}))} stats={profile.stats} onModeChange={setGameMode} achievements={profile.achievements} onMissionStart={startMission} activeMissionId={activeMissionId} onMissionCancel={cancelMission} isInputModalOpen={false} />
                </div>
            )}
        </main>
        
        <footer className={`w-full text-center p-6 opacity-60 text-xs transition-all duration-300 ${isSettingsOpen ? 'mr-96' : ''}`}>
            Projeto gratuito criado por <a href="https://github.com/joaowars776/Type776" target="_blank" rel="noopener noreferrer" className="text-base font-black tracking-wide bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] hover:scale-110 inline-block transition-transform ml-1">joaowars776</a> usando IA.
        </footer>
    </div>
  );
}

export default App;
