
import React, { useState, useEffect, useRef } from 'react';
import { HabboGameType, UserSettings, Theme, DiversosResult, HabboDifficulty, WordStat } from '../types';
import { generateHabboChallenges, gameUsesSpace, GameChallenge, getHabboGamesList } from '../utils/habboLogic';
import { getTranslation } from '../utils/translations';
import { THEME_CONFIG, FONT_CONFIG } from '../constants';
import { DemoAnimation } from './HabboHub';
import { playTypingSound } from '../utils/sound';

interface RandomConfig {
    filters: HabboGameType[];
    difficulty: HabboDifficulty;
}

interface Props {
    type: HabboGameType;
    settings: UserSettings;
    onBack: () => void;
    onComplete: (result: DiversosResult) => void;
    sessionScore: number;
    randomConfig?: RandomConfig;
    sessionStats?: { totalChars: number, totalTime: number };
}

const HabboGame: React.FC<Props> = ({ type, settings, onBack, onComplete, sessionScore, randomConfig, sessionStats }) => {
    // Determine configuration
    const isRandomMode = type === HabboGameType.ALEATORIO;
    
    // Config: If Random, use passed config. If Single Game, force Infinite Defaults.
    const difficulty = isRandomMode && randomConfig ? randomConfig.difficulty : HabboDifficulty.STANDARD;
    const randomFilters = isRandomMode && randomConfig ? randomConfig.filters : [];
    
    const [repitaDifficulty, setRepitaDifficulty] = useState<'normal' | 'hard'>('normal');
    const [repitaLength, setRepitaLength] = useState<'short' | 'long'>('short');

    // Strict Mode / Hint Logic
    const strictMode = isRandomMode ? true : (settings.habboConfig?.strictMode ?? true);
    const showHints = isRandomMode ? false : (settings.habboConfig?.showHints ?? false);

    // Game State
    const [gameState, setGameState] = useState<'IDLE' | 'INTERMISSION' | 'PLAYING' | 'RESULT' | 'SESSION_SUMMARY'>('IDLE');
    const [currentRound, setCurrentRound] = useState(1); 
    const [challenges, setChallenges] = useState<GameChallenge[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [input, setInput] = useState('');
    
    // Unique tracking
    const [usedGameTypes, setUsedGameTypes] = useState<HabboGameType[]>([]);

    // Timer Logic Change: Start time is null until user types
    const [startTime, setStartTime] = useState<number | null>(null);
    const [hasStarted, setHasStarted] = useState(false);
    const [forceRenderTick, setForceRenderTick] = useState(0);

    const [resultData, setResultData] = useState<DiversosResult | null>(null);
    const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');
    
    const [wordStats, setWordStats] = useState<WordStat[]>([]);
    const wordStartTime = useRef<number>(0);
    const [showWordDetails, setShowWordDetails] = useState(false);
    
    // Strict Char counting for WPM
    const [correctCharCount, setCorrectCharCount] = useState(0);

    const [nextRandomGame, setNextRandomGame] = useState<HabboGameType | null>(null);
    const [currentRandomGame, setCurrentRandomGame] = useState<HabboGameType | null>(null);

    const [errorCount, setErrorCount] = useState(0); 
    
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const tr = (k: string) => getTranslation(k, settings.language);
    const themeStyles = THEME_CONFIG[settings.theme];
    
    // Fix: Default to Inter/Sans if Apply Font is off, preventing 8Bits inheritance
    const areaFont = settings.applyFontToTyping 
        ? FONT_CONFIG[settings.font] 
        : "'Inter', sans-serif";
    
    const standardFontClass = !settings.applyFontToTyping ? 'font-sans' : '';

    // Round Limits Logic
    const getMaxRounds = () => {
        if (!isRandomMode) return Infinity;
        if (difficulty === HabboDifficulty.EASY) return 5;
        if (difficulty === HabboDifficulty.STANDARD) return 10;
        return 20; // Hard
    }
    const maxRounds = getMaxRounds();

    const getCountForGame = (gameType: HabboGameType, diff: HabboDifficulty) => {
        if (!isRandomMode) return 20; 
        if (diff === HabboDifficulty.HARD) {
             if ([HabboGameType.SOLETRANDO, HabboGameType.SOLEPLICANDO, HabboGameType.REPITA].includes(gameType)) {
                 return 10;
             }
             return 20;
        }
        if (diff === HabboDifficulty.EASY) return 5;
        return 10;
    };

    useEffect(() => {
        if (gameState === 'IDLE') {
            if (isRandomMode) {
                pickNextRandom(true); // True for initial start
            } else {
                const count = 20; 
                setChallenges(generateHabboChallenges(type, settings.language, count));
                setGameState('PLAYING');
                prepareRoundStart();
            }
        }
    }, [type]);

    const pickNextRandom = (isInitial = false) => {
        const allGames = getHabboGamesList(settings.language)
            .map(g => g.id)
            .filter(id => id !== HabboGameType.ALEATORIO);
        
        let pool = allGames;
        if (randomFilters && randomFilters.length > 0) {
            pool = pool.filter(g => !randomFilters.includes(g));
        }
        
        // Filter out games already played in this session to prevent repeats
        pool = pool.filter(g => !usedGameTypes.includes(g));

        // Logic check: If pool is empty, we must stop, even if rounds not reached.
        if (pool.length === 0) {
            // Force end of session if no more unique games available
            setGameState('SESSION_SUMMARY');
            return;
        }

        const next = pool[Math.floor(Math.random() * pool.length)];
        
        setNextRandomGame(next);
        setGameState('INTERMISSION');
    };

    const startNextRound = () => {
        if (nextRandomGame) {
            setCurrentRandomGame(nextRandomGame);
            setUsedGameTypes(prev => [...prev, nextRandomGame]); // Mark as used
            const count = getCountForGame(nextRandomGame, difficulty);
            setChallenges(generateHabboChallenges(nextRandomGame, settings.language, count));
            setNextRandomGame(null);
        }
        setGameState('PLAYING');
        prepareRoundStart();
    }

    const handleNextStep = () => {
        // If coming from a single game result screen, exit
        if (!isRandomMode) {
            onBack();
            return;
        }
        
        // Check if we reached max rounds
        if (currentRound >= maxRounds) {
            setGameState('SESSION_SUMMARY');
            return;
        }

        setResultData(null);
        setCurrentRound(prev => prev + 1);
        pickNextRandom();
    };

    const prepareRoundStart = () => {
        setCurrentIndex(0);
        setInput('');
        setErrorCount(0);
        setCorrectCharCount(0);
        setWordStats([]);
        setStartTime(null); // Reset Start Time
        setHasStarted(false); // Flag that user hasn't typed yet
        setTimeout(() => {
            const el = isCurrentRepita ? textareaRef.current : inputRef.current;
            el?.focus();
        }, 50);
    };

    const currentType = isRandomMode ? (currentRandomGame || type) : type;
    const currentChallenge = challenges[currentIndex] || { display: '', expected: '', instructionKey: '', gameType: currentType };
    const isCurrentRepita = currentChallenge.gameType === HabboGameType.REPITA;

    useEffect(() => {
        if (gameState === 'PLAYING') {
            const el = isCurrentRepita ? textareaRef.current : inputRef.current;
            el?.focus();
        }
    }, [gameState, currentIndex, isCurrentRepita]);

    useEffect(() => {
        let interval: any;
        const currentGameType = isRandomMode ? (currentRandomGame || type) : type;
        const boostEligible = checkBoostEligibility(currentGameType);

        // Timer only runs if hasStarted is true
        if (gameState === 'PLAYING' && hasStarted && startTime && boostEligible) {
            interval = setInterval(() => {
                setForceRenderTick(Date.now()); 
                const elapsed = Date.now() - startTime;
                if (elapsed >= 30000) {
                    finishRound(true);
                }
            }, 100);
        }
        return () => clearInterval(interval);
    }, [gameState, hasStarted, startTime, currentRandomGame]);

    const checkBoostEligibility = (gameType: HabboGameType) => {
        if (!isRandomMode) return false;
        if (randomFilters && randomFilters.length > 0) return false;
        return true;
    };

    const recordWordStat = () => {
        const now = Date.now();
        const duration = (now - wordStartTime.current) / 1000;
        const word = challenges[currentIndex].expected;
        // Prevent massive WPM if duration is tiny (e.g. 0.001) due to instant type
        const safeDuration = Math.max(duration, 0.1); 
        const wpm = Math.round((word.length / 5) / (safeDuration / 60));
        
        setWordStats(prev => [...prev, {
            word,
            duration,
            wpm: isFinite(wpm) ? wpm : 0
        }]);
        
        wordStartTime.current = now;
    };

    const finishRound = (forceStop: boolean = false) => {
        const endTime = Date.now();
        const start = startTime || endTime; // fallback if finish immediately
        const duration = (endTime - start) / 1000;

        const totalAttempted = currentIndex + (forceStop ? 0 : 1);
        const accuracy = totalAttempted === 0 ? 0 : Math.round(((totalAttempted - errorCount) / totalAttempted) * 100);
        
        // Strict WPM: correctCharCount ONLY has correct words.
        const safeDuration = Math.max(duration, 1);
        const wpm = Math.round((correctCharCount / 5) / (safeDuration / 60));

        let roundScore = 0;
        const currentGameType = isRandomMode ? (currentRandomGame || type) : type;
        const isBoost = checkBoostEligibility(currentGameType);

        if (isBoost) {
            let tier = 0; 
            if (duration <= 10) tier = 1;
            else if (duration <= 20) tier = 2;
            else if (duration <= 30 || (forceStop && duration > 30)) tier = 3; 

            if (tier > 0) {
                if (difficulty === HabboDifficulty.EASY) {
                    if (tier === 1) roundScore = 30;
                    else if (tier === 2) roundScore = 10;
                    else roundScore = 5;
                } else if (difficulty === HabboDifficulty.STANDARD) {
                    if (tier === 1) roundScore = 50;
                    else if (tier === 2) roundScore = 25;
                    else roundScore = 10;
                } else if (difficulty === HabboDifficulty.HARD) {
                    if (tier === 1) roundScore = 100;
                    else if (tier === 2) roundScore = 50;
                    else roundScore = 25;
                }
            }
            if (forceStop && currentIndex < challenges.length - 1) roundScore = 0;
        } else if (!isRandomMode) {
            roundScore = 0; 
        } else {
            roundScore = Math.floor(totalAttempted / 5);
        }

        if (!forceStop) recordWordStat();

        const result: DiversosResult = {
            gameType: currentGameType,
            wpm: wpm || 0,
            accuracy: accuracy,
            score: roundScore,
            timestamp: Date.now(),
            duration: Math.min(duration, 30),
            wordsCount: totalAttempted,
            boostApplied: isBoost,
            difficulty: isRandomMode ? difficulty : undefined,
            wordStats: [...wordStats, { 
                word: challenges[currentIndex]?.expected || '',
                duration: (Date.now() - wordStartTime.current) / 1000,
                wpm: 0 
            }].slice(0, totalAttempted)
        };

        const finalStats = [...wordStats];
        if (!forceStop && challenges[currentIndex]) {
             const now = Date.now();
             const lastDur = (now - wordStartTime.current) / 1000;
             const lastWord = challenges[currentIndex].expected;
             const lastWpm = Math.round((lastWord.length / 5) / (lastDur / 60));
             finalStats.push({ word: lastWord, duration: lastDur, wpm: isFinite(lastWpm) ? lastWpm : 0 });
        }
        result.wordStats = finalStats;

        onComplete(result); 
        setResultData(result);
        setGameState('RESULT'); // FORCE RESULT SCREEN
    };

    const nextWord = (wasError: boolean) => {
        if (wasError) {
             setErrorCount(p => p + 1);
             setFeedback('error');
             setTimeout(() => setFeedback('none'), 300);
        } else {
             setFeedback('success');
             setTimeout(() => setFeedback('none'), 300);
             recordWordStat();
             // Anti-cheat: Add correct chars
             if (challenges[currentIndex]) {
                 setCorrectCharCount(prev => prev + challenges[currentIndex].expected.length + 1); // +1 for space/enter implicit
             }
        }

        setInput('');
        
        if (isRandomMode && currentIndex + 1 >= challenges.length) {
            finishRound();
        } else {
            setCurrentIndex(p => p + 1);
            if (!isRandomMode && currentIndex > challenges.length - 5) {
                 const newBatch = generateHabboChallenges(type, settings.language, 10, { difficulty: repitaDifficulty, length: repitaLength });
                 setChallenges(prev => [...prev, ...newBatch]);
            }
        }
    };

    const checkStrictness = (attempt: string, expected: string) => {
        if (strictMode) {
            return attempt === expected;
        } else {
            // Loose mode: case insensitive, accent insensitive
            const normAttempt = attempt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const normExpected = expected.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return normAttempt === normExpected;
        }
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (gameState !== 'PLAYING') return;
        
        const val = e.target.value;

        // Play Sound on keypress (if value changed and length increased or just changed)
        if (val.length > input.length) {
            playTypingSound(settings.soundType);
        }

        // Start Logic: First char typed starts the timers
        if (!hasStarted && val.length > 0) {
            setHasStarted(true);
            setStartTime(Date.now());
            wordStartTime.current = Date.now();
        }

        const curr = challenges[currentIndex];
        const usesSpace = gameUsesSpace(curr.gameType);

        if (usesSpace) {
             setInput(val);
             // Space mode usually checks trimmed exact match logic on enter or similar, 
             // but current logic is incremental. For strict space mode, we check real time.
             
             // If loose mode, normalize current input AND expected for comparison
             if (checkStrictness(val.trim(), curr.expected)) {
                 nextWord(false);
                 return;
             }
        } else {
            if (val.endsWith(' ')) {
                const attempt = val.trim();
                if (checkStrictness(attempt, curr.expected)) nextWord(false);
                else nextWord(true);
                return;
            }
            setInput(val);
        }
    };

    // Session Summary Overlay (Final Screen for Competitive Mode)
    if (gameState === 'SESSION_SUMMARY') {
        return (
            <div className={`w-full max-w-lg mx-auto ${themeStyles.panel} p-10 rounded-2xl shadow-2xl animate-fade-in-up text-center border border-yellow-500/30`}>
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">{tr('test_complete')}</h2>
                <div className="text-sm opacity-60 mb-8 uppercase tracking-widest">{tr('game_aleatorio')} - {tr(difficulty)}</div>
                
                <div className="bg-black/20 rounded-xl p-6 mb-8 border border-white/5">
                    <div className="text-xs uppercase opacity-50 mb-1">{tr('total_score')}</div>
                    <div className="text-6xl font-bold text-yellow-400 drop-shadow-lg">{sessionScore}</div>
                    <div className="text-sm opacity-50 mt-2">pts</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-black/20 rounded-lg p-4">
                        <div className="text-xs uppercase opacity-50 mb-1">{tr('rounds_count')}</div>
                        <div className="text-2xl font-bold">{currentRound} / {maxRounds}</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                        <div className="text-xs uppercase opacity-50 mb-1">Boost</div>
                        <div className="text-2xl font-bold text-green-400">ON</div>
                    </div>
                </div>

                <button 
                    onClick={onBack}
                    className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                    {tr('back_to_hub')}
                </button>
            </div>
        );
    }

    // Result Overlay (Single Round Result)
    if (gameState === 'RESULT' && resultData) {
        // Show details always if single mode, or specific games in random
        const allowedGames = [HabboGameType.GERUNDIO, HabboGameType.INFINITIVO, HabboGameType.REPITA];
        const showDetails = allowedGames.includes(resultData.gameType) || !isRandomMode; // Enable for all single modes

        // Calculate Session WPM if stats available
        let displayWpm = resultData.wpm;
        let wpmLabel = "WPM";
        
        if (isRandomMode && sessionStats) {
            if (sessionStats.totalTime > 0) {
                displayWpm = Math.round((sessionStats.totalChars / 5) / (sessionStats.totalTime / 60));
                wpmLabel = "Média PPM (Sessão)";
            }
        }

        // Logic for styled difficulty badge
        let difficultyStyle = 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'; // fallback
        const diff = resultData.difficulty || HabboDifficulty.STANDARD;
        
        if (diff === HabboDifficulty.EASY) {
            difficultyStyle = 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.3)]';
        } else if (diff === HabboDifficulty.STANDARD) {
            difficultyStyle = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_10px_rgba(250,204,21,0.3)]';
        } else if (diff === HabboDifficulty.HARD) {
            difficultyStyle = 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.3)]';
        }

        return (
            <div className={`w-full max-w-lg mx-auto ${themeStyles.panel} p-8 rounded-2xl shadow-xl animate-fade-in-up text-center`}>
                <h2 className="text-3xl font-bold mb-6">{resultData.score > 0 ? tr('great_job') : (isRandomMode ? tr('time_up') : tr('test_complete'))}</h2>
                {isRandomMode && <div className="text-4xl font-bold text-blue-500 mb-2">{resultData.score} pts</div>}
                <div className="text-sm opacity-60 mb-6">{tr('accuracy')}: {resultData.accuracy}%</div>
                <div className="text-xl font-bold mb-4">{displayWpm} <span className="text-sm font-normal opacity-70">{wpmLabel}</span></div>
                
                {resultData.boostApplied && (
                    <div className={`mb-6 text-sm font-black uppercase tracking-wide px-4 py-2 rounded-lg animate-pulse ${difficultyStyle}`}>
                        Modo: {tr(diff)}
                    </div>
                )}

                {/* Word Stats Toggle */}
                {(showDetails || !isRandomMode) && resultData.wordStats && resultData.wordStats.length > 0 && (
                    <div className="mb-6">
                        <button 
                            onClick={() => setShowWordDetails(!showWordDetails)}
                            className="text-xs uppercase font-bold tracking-widest opacity-60 hover:opacity-100 mb-2"
                        >
                            {showWordDetails ? tr('hide_words') : tr('view_words')}
                        </button>
                        
                        {showWordDetails && (
                            <div className="max-h-48 overflow-y-auto custom-scrollbar bg-black/20 rounded-lg p-2 text-left space-y-2">
                                <div className="grid grid-cols-3 text-[10px] uppercase opacity-50 px-2">
                                    <span>{tr('word_col')}</span>
                                    <span>{tr('time_col')}</span>
                                    <span>{tr('wpm_col')}</span>
                                </div>
                                {resultData.wordStats.map((stat, i) => (
                                    <div key={i} className="grid grid-cols-3 text-xs px-2 py-1 border-b border-white/5 last:border-0 hover:bg-white/5 rounded">
                                        <span className="truncate pr-1" title={stat.word}>{stat.word}</span>
                                        <span className="font-mono text-yellow-300">{stat.duration.toFixed(2)}s</span>
                                        <span className="font-mono text-blue-300">{stat.wpm}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                <button 
                    onClick={handleNextStep}
                    className="w-full mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-transform hover:scale-105 active:scale-95 animate-pulse"
                >
                    {isRandomMode ? (currentRound >= maxRounds ? tr('finish') : tr('advance')) : tr('back_to_hub')}
                </button>
            </div>
        );
    }

    const feedbackClass = feedback === 'success' ? 'text-green-500 scale-105' : feedback === 'error' ? 'text-red-500 shake' : '';
    
    // Intermission - NOW WITH EXPLICIT START BUTTON
    if (gameState === 'INTERMISSION' && isRandomMode) {
        // Use nextRandomGame if available, otherwise current (fallback)
        const displayGame = nextRandomGame || currentRandomGame;
        const nextGameName = displayGame ? tr(`game_${displayGame}`) : '...';
        const nextType = displayGame || type; // Fallback type for demo

        return (
            <div className="w-full max-w-4xl mx-auto min-h-[50vh] flex flex-col items-center justify-center animate-fade-in-up">
                <div className="w-full max-w-lg text-center p-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
                    <div className="text-xs font-bold opacity-60 uppercase tracking-widest mb-4">
                        {tr('round')} {currentRound} / {maxRounds}
                    </div>
                    <div className="text-xs font-bold opacity-60 uppercase tracking-widest mb-4">{tr('next_game')}</div>
                    
                    <div className="text-5xl font-black mb-8 text-purple-400 drop-shadow-lg">{nextGameName}</div>
                    
                    <div className="mb-10 w-full bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="text-left text-xs opacity-50 mb-2 uppercase font-bold tracking-wider">Como jogar:</div>
                        <DemoAnimation type={nextType} lang={settings.language} />
                    </div>

                    {isRandomMode && (
                        <div className="mb-8 text-xs font-bold text-red-300 bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                            {tr('strict_mode_warning')}
                        </div>
                    )}
                    
                    <button 
                        onClick={startNextRound}
                        className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xl font-black rounded-xl shadow-lg hover:shadow-purple-500/30 transform transition hover:scale-[1.02] active:scale-95"
                    >
                        INICIAR RODADA
                    </button>
                </div>
            </div>
        )
    }

    const timerVal = (!startTime) ? 0 : ((Date.now() - startTime) / 1000);
    const boostActive = checkBoostEligibility(currentType);
    const timeDisplay = boostActive 
        ? Math.max(0, 30 - timerVal).toFixed(1) + 's' 
        : Math.floor(timerVal) + 's';

    const gameTitleColor = isRandomMode ? 'text-purple-400 text-2xl sm:text-3xl font-extrabold' : 'text-xs font-bold bg-black/10 px-3 py-1 rounded-full uppercase tracking-wider';

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto min-h-[50vh] animate-fade-in-up relative">
            <div className="w-full flex justify-between px-4 mb-8 items-start">
                <button onClick={onBack} className="p-2 rounded-full bg-black/10 hover:bg-black/20 z-20" title={tr('back_to_hub')}>
                    ←
                </button>
                <div className={`flex gap-8 items-center font-mono text-xl ${boostActive ? 'text-yellow-500' : ''}`}>
                    {isRandomMode && (
                        <div className="flex flex-col items-center">
                            <span className="text-xs uppercase opacity-50">{tr('round')}</span>
                            <span>{currentRound} / {maxRounds}</span>
                        </div>
                    )}
                    {isRandomMode && (
                        <div className="flex flex-col items-center">
                            <span className="text-xs uppercase opacity-50">{tr('word_count')}</span>
                            <span>{currentIndex + 1} / {challenges.length}</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase opacity-50">{tr('time')}</span>
                        <span className={`font-bold text-2xl ${boostActive && timerVal > 20 ? 'text-red-500' : ''}`}>{timeDisplay}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase opacity-50">{tr('score')}</span>
                        <span>{sessionScore}</span>
                    </div>
                </div>
                <div className="w-8"></div>
            </div>

            <div className="mb-8 text-center flex flex-col gap-2 items-center">
                <span className={gameTitleColor}>
                    {tr(`game_${currentType}`)}
                </span>
                {boostActive && (
                    <span className="text-sm font-black text-yellow-300 bg-yellow-900/30 px-4 py-1 rounded-full border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)] tracking-wide animate-pulse">
                        {tr('boost_hint_active')} ({tr(difficulty)})
                    </span>
                )}
            </div>

            <div className={`w-full ${themeStyles.panel} rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden transition-colors duration-300`}>
                {isCurrentRepita ? (
                    <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
                        <div className="text-center w-full">
                            <div className="text-xs uppercase opacity-50 tracking-widest mb-4">{tr(currentChallenge.instructionKey)}</div>
                            <div className={`text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed bg-black/5 p-6 rounded-lg border border-black/5 shadow-inner transition-colors duration-200 text-left ${feedbackClass} ${standardFontClass}`} style={{ fontFamily: areaFont }}>
                                {currentChallenge.display}
                            </div>
                        </div>
                        <div className="w-full relative p-1 rounded-lg border-2 border-white/20 focus-within:border-blue-500/50 focus-within:bg-white/5 transition-all">
                             <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={handleInput}
                                className={`w-full bg-transparent text-lg sm:text-xl outline-none placeholder-gray-500/30 transition-all resize-none h-32 p-4 ${themeStyles.text} ${standardFontClass}`}
                                style={{ fontFamily: areaFont }}
                                autoComplete="off"
                                spellCheck="false"
                                placeholder={tr('typing_area_placeholder')}
                                autoFocus
                             />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Word Queue for visual context */}
                        <div className="flex justify-center gap-6 mb-12 overflow-hidden h-8 items-center opacity-60 font-mono">
                            {challenges.map((c, i) => {
                                if (i < currentIndex) return null;
                                if (i > currentIndex + 3) return null;
                                return (
                                    <span key={i} className={`whitespace-nowrap ${i === currentIndex ? 'text-xl font-bold opacity-100 border-b-2 border-blue-500' : 'text-lg opacity-50'}`}>
                                        {c.display}
                                    </span>
                                )
                            })}
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <div className="text-center w-full">
                                <div className="text-xs uppercase opacity-50 tracking-widest mb-2">{tr(currentChallenge.instructionKey)}</div>
                                <div className={`text-4xl sm:text-6xl font-bold tracking-tight mb-2 break-words leading-tight transition-all duration-200 ${feedbackClass} ${standardFontClass}`} style={{ fontFamily: areaFont }}>
                                    {currentChallenge.display}
                                </div>
                            </div>
                            <div className="text-2xl opacity-30">⬇</div>
                            <div className="w-full relative flex justify-center p-4 rounded-xl border-2 border-dashed border-white/20 focus-within:border-solid focus-within:border-blue-500/50 focus-within:bg-white/5 transition-all">
                                {/* Hint Answer logic: Only show if showHints is true OR strict mode is off (implicit guiding) logic not requested but typically helpful. Requested logic: toggle show hints. */}
                                {(!isRandomMode && showHints) && (
                                    <div 
                                        className={`absolute top-4 left-0 w-full text-center text-3xl sm:text-4xl font-bold opacity-30 pointer-events-none select-none text-green-300 ${standardFontClass}`}
                                        style={{ fontFamily: areaFont }}
                                    >
                                        {currentChallenge.expected}
                                    </div>
                                )}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={handleInput}
                                    className={`w-full bg-transparent text-center text-3xl sm:text-4xl outline-none font-bold placeholder-gray-500/20 transition-all ${themeStyles.text} ${standardFontClass}`}
                                    style={{ fontFamily: areaFont }}
                                    autoComplete="off"
                                    spellCheck="false"
                                    autoFocus
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            {!isRandomMode && (
                <button onClick={() => {
                    // Force finish to show results
                    finishRound(true);
                }} className="mt-8 px-6 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg">
                    {tr('finish')}
                </button>
            )}
        </div>
    );
};

export default HabboGame;
