
import React, { useState, useEffect, useRef } from 'react';
import { HabboGameType, UserSettings, Language, HabboDifficulty, UserProfile } from '../types';
import { getHabboGamesList, getDemoExamples, generateHabboChallenges, GameChallenge, gameUsesSpace } from '../utils/habboLogic';
import { getTranslation } from '../utils/translations';
import { THEME_CONFIG } from '../constants';

interface Props {
    settings: UserSettings;
    onSelect: (type: HabboGameType, config?: { filters: HabboGameType[], difficulty: HabboDifficulty }) => void;
    profile: UserProfile; 
    onUpdateSettings?: (s: Partial<UserSettings>) => void;
}

export const DemoAnimation = ({ type, lang, isLight }: { type: HabboGameType, lang: Language, isLight?: boolean }) => {
    const examples = getDemoExamples(type, lang);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const i = setInterval(() => setIndex(prev => (prev + 1) % examples.length), 3000);
        return () => clearInterval(i);
    }, [type, lang]);

    const ex = examples[index];

    return (
        <div className={`flex items-center justify-center w-full rounded px-2 py-1 border transition-colors ${isLight ? 'bg-gray-200/50 border-gray-300' : 'bg-black/20 border-white/5'}`}>
            <div className="flex items-center gap-2 font-mono text-[10px] whitespace-nowrap w-full justify-center">
                <span className={`opacity-70 ${isLight ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>{ex.f}</span>
                <span className="opacity-40 text-[9px]">➜</span>
                <span className={`font-bold ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>{ex.t}</span>
            </div>
        </div>
    );
};

interface InteractiveRuleItemProps {
    game: { id: HabboGameType };
    lang: Language;
    isLight: boolean;
}

const InteractiveRuleItem: React.FC<InteractiveRuleItemProps> = ({ game, lang, isLight }) => {
    const [input, setInput] = useState('');
    const [challenge, setChallenge] = useState<GameChallenge | null>(null);
    const [status, setStatus] = useState<'idle' | 'correct' | 'error'>('idle');

    useEffect(() => {
        const list = generateHabboChallenges(game.id, lang, 1);
        if (list.length > 0) setChallenge(list[0]);
    }, [game.id, lang]);

    const t = (k: string) => getTranslation(k, lang);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!challenge) return;
        const val = e.target.value;
        const usesSpace = gameUsesSpace(game.id);
        
        setInput(val);

        const checkMatch = (value: string, expected: string) => value.toLowerCase() === expected.toLowerCase();

        if (checkMatch(val, challenge.expected)) {
             setStatus('correct');
             setTimeout(() => {
                 setInput('');
                 setStatus('idle');
                 const list = generateHabboChallenges(game.id, lang, 1);
                 if (list.length > 0) setChallenge(list[0]);
             }, 1000); 
             return;
        }

        if (usesSpace) {
             const expectedLower = challenge.expected.toLowerCase();
             const valLower = val.toLowerCase();
             if (!expectedLower.startsWith(valLower)) {
                 setStatus('error');
                 setTimeout(() => setStatus('idle'), 500);
                 setInput('');
             }
             return;
        }
        
        if (!usesSpace && val.endsWith(' ')) {
             const trimmed = val.trim().toLowerCase();
             if (checkMatch(trimmed, challenge.expected)) {
                 setStatus('correct');
                 setTimeout(() => {
                     setInput('');
                     setStatus('idle');
                     const list = generateHabboChallenges(game.id, lang, 1);
                     if (list.length > 0) setChallenge(list[0]);
                 }, 1000);
             } else {
                 setStatus('error');
                 setTimeout(() => setStatus('idle'), 500);
                 setInput('');
             }
             return;
        }
    }

    if (!challenge) return null;

    return (
        <div className={`p-4 rounded-lg flex flex-col gap-2 ${isLight ? 'bg-gray-100' : 'bg-black/10'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-bold text-sm">{t(`game_${game.id}`)}</div>
                    <div className="opacity-70 text-xs mb-2">{t(`game_${game.id}_desc`)}</div>
                </div>
            </div>
            <DemoAnimation type={game.id} lang={lang} isLight={isLight} />
            
            <div className={`p-2 rounded text-center text-sm font-mono flex items-center justify-between mt-2 ${isLight ? 'bg-white' : 'bg-black/20'}`}>
                <span>{challenge.display}</span>
                <span className="opacity-30">➜</span>
                <span className="opacity-50">{challenge.expected}</span>
            </div>

            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs opacity-50 whitespace-nowrap">{t('try_it')}</span>
                <input 
                    type="text" 
                    value={input}
                    onChange={handleInput}
                    className={`w-full rounded px-2 py-1 text-sm outline-none transition-colors duration-200 
                        ${isLight ? 'bg-white border border-gray-300' : 'bg-white/10'} 
                        ${status === 'correct' ? 'bg-green-600 text-white border-green-600' : status === 'error' ? 'text-red-500 border-red-500' : ''}
                    `}
                    placeholder="..."
                />
            </div>
        </div>
    )
}

const HabboHub: React.FC<Props> = ({ settings, onSelect, profile, onUpdateSettings }) => {
    const [showRules, setShowRules] = useState(false);
    const [showHabboSettings, setShowHabboSettings] = useState(false);
    const habboSettingsRef = useRef<HTMLDivElement>(null);
    
    // Random Config State
    const [randomFilters, setRandomFilters] = useState<HabboGameType[]>(settings.randomFilters || []);
    const [difficulty, setDifficulty] = useState<HabboDifficulty>(HabboDifficulty.STANDARD);
    const [showRandomConfig, setShowRandomConfig] = useState(false);

    const t = (k: string) => getTranslation(k, settings.language);
    const themeStyles = THEME_CONFIG[settings.theme];
    const isLight = settings.theme === 'light';
    const games = getHabboGamesList(settings.language);

    const toggleFilter = (id: HabboGameType) => {
        if (randomFilters.includes(id)) {
            setRandomFilters(prev => prev.filter(x => x !== id));
        } else {
            setRandomFilters(prev => [...prev, id]);
        }
    };

    const handleRandomStart = () => {
        onSelect(HabboGameType.ALEATORIO, {
            filters: randomFilters,
            difficulty: difficulty
        });
    };

    // Close settings on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (habboSettingsRef.current && !habboSettingsRef.current.contains(event.target as Node)) {
                setShowHabboSettings(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [habboSettingsRef]);

    // Update global preferences
    const toggleStrictMode = () => {
        if (onUpdateSettings) {
            onUpdateSettings({ 
                habboConfig: { ...settings.habboConfig, strictMode: !settings.habboConfig?.strictMode }
            });
        }
    }

    const toggleHints = () => {
        if (onUpdateSettings) {
            onUpdateSettings({ 
                habboConfig: { ...settings.habboConfig, showHints: !settings.habboConfig?.showHints }
            });
        }
    }

    const toggleLayout = () => {
        if (onUpdateSettings) {
            const nextLayout = settings.habboConfig?.layout === 'compact' ? 'grid' : 'compact';
            onUpdateSettings({ 
                habboConfig: { ...settings.habboConfig, layout: nextLayout }
            });
        }
    }

    const strictMode = settings.habboConfig?.strictMode ?? true;
    const showHints = settings.habboConfig?.showHints ?? false;
    const layout = settings.habboConfig?.layout || 'grid';

    // Boost Config Styles
    const getBoostColor = () => {
        if (randomFilters.length > 0) return 'text-gray-400 opacity-50 bg-gray-500/10 border-gray-500/20'; // Disabled
        switch(difficulty) {
            case HabboDifficulty.EASY: return 'text-green-500 border-green-500/50 bg-green-500/10 shadow-[0_0_10px_rgba(74,222,128,0.3)]';
            case HabboDifficulty.STANDARD: return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_10px_rgba(250,204,21,0.3)]';
            case HabboDifficulty.HARD: return 'text-red-500 border-red-500/50 bg-red-500/10 shadow-[0_0_10px_rgba(248,113,113,0.3)]';
            default: return 'text-yellow-500';
        }
    };

    const getBoostLabel = () => {
        if (randomFilters.length > 0) return t('boost_hint_inactive');
        const text = t('boost_hint_active');
        const prefix = difficulty === HabboDifficulty.EASY ? '⚡' : difficulty === HabboDifficulty.STANDARD ? '⚡⚡' : '⚡⚡⚡';
        return `${prefix} ${text}`;
    };

    const getPointsByTier = (tier: 1 | 2 | 3) => {
        const d = difficulty;
        if (d === HabboDifficulty.EASY) return tier === 1 ? 30 : tier === 2 ? 10 : 5;
        if (d === HabboDifficulty.STANDARD) return tier === 1 ? 50 : tier === 2 ? 25 : 10;
        return tier === 1 ? 100 : tier === 2 ? 50 : 25; // HARD
    }

    const RulesModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowRules(false)}>
            <div className={`${themeStyles.panel} p-8 rounded-xl w-full max-w-4xl shadow-2xl relative overflow-y-auto max-h-[90vh]`} onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100">✕</button>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">📚 {t('rules_title')}</h2>
                <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-200 flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>O tempo só começa a contar quando você começar a digitar.</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-lg font-bold text-yellow-500 mb-2">{t('boost_system')}</h3>
                            <p className="opacity-80 text-sm mb-4 leading-relaxed">{t('boost_desc')}</p>
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                <div className="bg-black/10 p-3 rounded">
                                    <div className="font-bold text-green-500 mb-1">{t('easy')} ({t('words_5')})</div>
                                    <div className="text-xs grid grid-cols-3 gap-2 opacity-80">
                                        <span>30-20s: <b>30pts</b></span>
                                        <span>20-10s: <b>10pts</b></span>
                                        <span>&lt;10s: <b>5pts</b></span>
                                    </div>
                                </div>
                                <div className="bg-black/10 p-3 rounded">
                                    <div className="font-bold text-yellow-500 mb-1">{t('standard')} ({t('words_10')})</div>
                                    <div className="text-xs grid grid-cols-3 gap-2 opacity-80">
                                        <span>30-20s: <b>50pts</b></span>
                                        <span>20-10s: <b>25pts</b></span>
                                        <span>&lt;10s: <b>10pts</b></span>
                                    </div>
                                </div>
                                <div className="bg-black/10 p-3 rounded">
                                    <div className="font-bold text-red-500 mb-1">{t('hard')} ({t('words_20')})</div>
                                    <div className="text-xs grid grid-cols-3 gap-2 opacity-80">
                                        <span>30-20s: <b>100pts</b></span>
                                        <span>20-10s: <b>50pts</b></span>
                                        <span>&lt;10s: <b>25pts</b></span>
                                    </div>
                                    <div className="text-[10px] mt-1 opacity-50 italic">{t('hard_mode_note')}</div>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-blue-500">{t('game_rules')}</h3>
                        <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                            {games.filter(g => g.id !== HabboGameType.ALEATORIO).map(g => (
                                <InteractiveRuleItem key={g.id} game={g} lang={settings.language} isLight={isLight} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const bannerClasses = isLight 
        ? "bg-white border-2 border-gray-300 text-gray-800 shadow-xl" 
        : `${themeStyles.panel} border-0`;

    return (
        <div className="relative w-full overflow-hidden flex transition-all duration-500">
            
            {/* Main Hub Content */}
            <div className={`flex flex-col w-full max-w-6xl mx-auto animate-fade-in-up transition-transform duration-500 translate-x-0`}>
                
                {/* Header Toolbar */}
                <div className="flex justify-between items-center w-full mb-6">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                        Habbo Arcade
                    </h2>
                    <div className="flex gap-2 items-center">
                        <button onClick={toggleLayout} className="px-3 py-1.5 text-xs bg-black/10 hover:bg-black/20 rounded-lg transition-colors font-bold uppercase tracking-wider flex items-center gap-2">
                            <span>{layout === 'grid' ? '⊞' : '≣'}</span>
                            <span className="hidden sm:inline">{layout === 'grid' ? t('layout_grid') : t('layout_compact')}</span>
                        </button>
                        <button onClick={() => setShowRules(true)} className="px-3 py-1.5 text-xs bg-black/10 hover:bg-black/20 rounded-lg transition-colors">📚 {t('rules')}</button>
                        <div className="relative" ref={habboSettingsRef}>
                            <button onClick={() => setShowHabboSettings(!showHabboSettings)} className="px-3 py-1.5 text-xs bg-black/10 hover:bg-black/20 rounded-lg transition-colors">⚙️</button>
                            {showHabboSettings && (
                                <div className={`absolute right-0 top-10 w-80 sm:w-96 ${themeStyles.panel} border border-white/10 rounded-xl p-4 shadow-2xl z-50 animate-fade-in-up ${isLight ? 'bg-white text-gray-800 border-gray-200' : ''}`}>
                                    <div className="mb-4 pb-2 border-b border-gray-500/10 text-xs font-bold uppercase opacity-60 tracking-wider">
                                        {t('habbo_config')}
                                    </div>
                                    <div className="space-y-4">
                                        {/* Show Hints Toggle with Info Block */}
                                        <button onClick={toggleHints} className={`w-full text-left p-3 rounded-lg transition-all border ${showHints ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black/5 border-transparent hover:bg-black/10'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold text-sm ${showHints ? 'text-blue-500' : ''}`}>{t('show_hints')}</span>
                                                {showHints && <span className="text-blue-500">✓</span>}
                                            </div>
                                            <p className="text-[10px] opacity-70 leading-relaxed">{t('show_hints_desc')}</p>
                                        </button>

                                        {/* Strict Mode Toggle with Info Block */}
                                        <button onClick={toggleStrictMode} className={`w-full text-left p-3 rounded-lg transition-all border ${strictMode ? 'bg-red-500/10 border-red-500/30' : 'bg-black/5 border-transparent hover:bg-black/10'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold text-sm ${strictMode ? 'text-red-500' : ''}`}>{t('strict_mode')}</span>
                                                {strictMode && <span className="text-red-500">✓</span>}
                                            </div>
                                            <p className="text-[10px] opacity-70 leading-relaxed">{t('strict_mode_desc')}</p>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Random Mode Banner - NO ANIMATION, CLICK TOGGLES SETTINGS */}
                <div 
                    onClick={() => setShowRandomConfig(!showRandomConfig)}
                    className={`w-full mb-8 rounded-2xl overflow-hidden relative group cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${bannerClasses}`}
                >
                     {!isLight && <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50 opacity-50 pointer-events-none"></div>}
                     <div className="relative z-10 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex-1 text-center md:text-left">
                            <h3 className={`text-3xl font-black mb-0 transition-colors flex items-center gap-3 justify-center md:justify-start ${isLight ? 'text-gray-800 group-hover:text-purple-600' : 'text-white group-hover:text-purple-400'}`}>
                                🎲 {t('game_aleatorio').toUpperCase()}
                            </h3>
                            <p className="text-xs opacity-70 font-medium tracking-wide mt-1">{t('game_aleatorio_desc')}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                className={`p-3 rounded-lg transition-colors z-20 ${showRandomConfig ? 'bg-purple-500/30 text-purple-500' : 'bg-black/10 text-gray-400 hover:text-gray-600'}`} 
                            >
                                 ⚙️
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleRandomStart(); }} 
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95 text-lg z-20"
                            >
                                {t('go')}
                            </button>
                        </div>
                    </div>

                    {showRandomConfig && (
                        <div className={`p-6 border-t ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-black/20'} animate-fade-in-up cursor-default`} onClick={(e) => e.stopPropagation()}>
                            <div className="mb-6">
                                <h4 className="text-sm font-bold uppercase opacity-80 mb-3 flex justify-between items-center">
                                    {t('game_config')}
                                    {randomFilters.length > 0 && <span className="text-red-500 text-[10px] font-black border border-red-500/50 px-2 py-0.5 rounded bg-red-500/10">⚠️ {t('random_boost_warning')}</span>}
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {games.filter(g => g.id !== HabboGameType.ALEATORIO).map(g => {
                                        const isIncluded = !randomFilters.includes(g.id);
                                        return (
                                            <button 
                                                key={g.id} 
                                                onClick={() => toggleFilter(g.id)} 
                                                className={`text-xs px-3 py-3 rounded-lg border-2 transition-all flex items-center justify-between font-bold cursor-pointer ${isIncluded 
                                                    ? 'bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500/20' 
                                                    : 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20 opacity-70'}`}
                                            >
                                                <span className="truncate">{t(`game_${g.id}`)}</span>
                                                <span>{isIncluded ? 'ON' : 'OFF'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className={`flex flex-col md:flex-row gap-8 text-xs pt-6 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                                <div className="flex-1">
                                    <label className="block opacity-80 mb-3 font-black uppercase text-sm">{t('difficulty')}</label>
                                    <div className="flex gap-3">
                                        <button onClick={() => setDifficulty(HabboDifficulty.EASY)} className={`flex-1 flex flex-col items-center py-3 rounded border-2 font-bold transition-all ${difficulty === HabboDifficulty.EASY ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 opacity-50 hover:opacity-100'}`}>
                                            {t('easy')}
                                            <span className="text-[9px] font-normal opacity-70 mt-1">5 {t('rounds_count')}</span>
                                        </button>
                                        <button onClick={() => setDifficulty(HabboDifficulty.STANDARD)} className={`flex-1 flex flex-col items-center py-3 rounded border-2 font-bold transition-all ${difficulty === HabboDifficulty.STANDARD ? 'bg-yellow-600 border-yellow-600 text-white' : 'border-gray-300 opacity-50 hover:opacity-100'}`}>
                                            {t('standard')}
                                            <span className="text-[9px] font-normal opacity-70 mt-1">10 {t('rounds_count')}</span>
                                        </button>
                                        <button onClick={() => setDifficulty(HabboDifficulty.HARD)} className={`flex-1 flex flex-col items-center py-3 rounded border-2 font-bold transition-all ${difficulty === HabboDifficulty.HARD ? 'bg-red-600 border-red-600 text-white' : 'border-gray-300 opacity-50 hover:opacity-100'}`}>
                                            {t('hard')}
                                            <span className="text-[9px] font-normal opacity-70 mt-1">20 {t('rounds_count')}</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between">
                                    {/* Boost Info Only - Countdown Removed */}
                                    <div className={`text-sm font-bold p-4 rounded-xl border-2 text-center transition-all h-full flex items-center justify-center ${getBoostColor()}`}>
                                        {getBoostLabel()}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Boost Table Visualization */}
                            <div className={`mt-6 p-4 rounded-xl border-2 ${isLight ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                                <div className={`text-xs uppercase font-black mb-2 flex items-center gap-2 ${isLight ? 'text-yellow-700' : 'text-yellow-500'}`}>
                                    ⚡ {t('points_boost')} <span className="opacity-50 font-normal normal-case">({t(difficulty)})</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                                    <div className={`p-2 rounded border ${isLight ? 'bg-white border-gray-200' : 'bg-black/20 border-white/5'}`}>
                                        <div className="font-bold mb-1 text-green-500">0s-10s</div>
                                        <div className={`font-black text-lg ${isLight ? 'text-gray-800' : 'text-white'}`}>+{getPointsByTier(1)}</div>
                                    </div>
                                    <div className={`p-2 rounded border ${isLight ? 'bg-white border-gray-200' : 'bg-black/20 border-white/5'}`}>
                                        <div className="font-bold mb-1 text-yellow-500">10s-20s</div>
                                        <div className={`font-black text-lg ${isLight ? 'text-gray-800' : 'text-white'}`}>+{getPointsByTier(2)}</div>
                                    </div>
                                    <div className={`p-2 rounded border ${isLight ? 'bg-white border-gray-200' : 'bg-black/20 border-white/5'}`}>
                                        <div className="font-bold mb-1 text-red-500">20s-30s</div>
                                        <div className={`font-black text-lg ${isLight ? 'text-gray-800' : 'text-white'}`}>+{getPointsByTier(3)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Game Grid or Compact based on Layout Preference */}
                <div className={`w-full ${layout === 'compact' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3' : 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'}`}>
                    {games.filter(g => g.id !== HabboGameType.ALEATORIO).map((game) => (
                        <button
                            key={game.id}
                            onClick={() => onSelect(game.id)} 
                            className={`
                                relative overflow-hidden rounded-xl text-left transition-all duration-300 group
                                ${isLight ? 'bg-white border-2 border-gray-100 hover:border-blue-300 shadow-md hover:shadow-xl text-gray-800' : 'border border-white/5 hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-xl'}
                                ${layout === 'compact' ? 'p-3 flex flex-col h-auto' : 'p-4 flex flex-col h-auto min-h-[120px]'}
                            `}
                            style={!isLight ? {
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 100%)'
                            } : undefined}
                        >
                            {/* Layout: Compact View */}
                            {layout === 'compact' ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <h3 className={`text-sm font-black leading-tight transition-colors truncate w-full ${isLight ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-200 group-hover:text-blue-400'}`}>
                                        {t(`game_${game.id}`)}
                                    </h3>
                                    <div className="w-full opacity-80 group-hover:opacity-100 transition-opacity">
                                        <DemoAnimation type={game.id} lang={settings.language} isLight={isLight} />
                                    </div>
                                </div>
                            ) : (
                                /* Layout: Grid View (Standard) */
                                <>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shadow-inner flex-shrink-0 ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-black/30 text-blue-300'}`}>
                                            {game.id.charAt(0).toUpperCase()}
                                        </div>
                                        <h3 className={`text-lg font-black leading-tight transition-colors truncate ${isLight ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-200 group-hover:text-blue-400'}`}>
                                            {t(`game_${game.id}`)}
                                        </h3>
                                    </div>
                                    
                                    <p className="text-xs opacity-60 leading-tight line-clamp-2 mb-1">
                                        {t(`game_${game.id}_desc`)}
                                    </p>

                                    <div className="w-full mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <DemoAnimation type={game.id} lang={settings.language} isLight={isLight} />
                                    </div>
                                </>
                            )}

                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </button>
                    ))}
                </div>
            </div>
            
            {showRules && <RulesModal />}
        </div>
    );
};

export default HabboHub;
