
import React, { useState, useEffect } from 'react';
import { UserProfile, TestResult, DiversosResult, GameMode } from '../types';
import { getTranslation } from '../utils/translations';
import { getXpProgress, checkNewAchievements } from '../utils/gamification'; 
import { ACHIEVEMENTS_LIST, THEME_CONFIG, AVATAR_BGS, AVATAR_ICONS } from '../constants';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  profile: UserProfile;
  onUpdateName: (name: string) => void;
  onUpdateAvatar: (avatar: string, image?: string) => void;
}

const Profile: React.FC<Props> = ({ profile, onUpdateName, onUpdateAvatar }) => {
  const [achieveTab, setAchieveTab] = useState<'unlocked' | 'locked'>('locked'); 
  const [historyTab, setHistoryTab] = useState<'typing' | 'diversos'>('typing');
  const [achPage, setAchPage] = useState(0);
  const [histPage, setHistPage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [showLevelGuide, setShowLevelGuide] = useState(false);
  
  // CHANGED: Instead of modal, this toggles the dropdown
  const [showWpmDetails, setShowWpmDetails] = useState(false); 
  
  const [newName, setNewName] = useState(profile.username);
  const [viewHistoryItem, setViewHistoryItem] = useState<TestResult | DiversosResult | null>(null);
  const [errorPage, setErrorPage] = useState(0); // For pagination inside history detail
  const [showHistoryErrors, setShowHistoryErrors] = useState(false);

  // Guest Registration State
  const [guestNameInput, setGuestNameInput] = useState('');

  useEffect(() => {
    if (profile.achievements.length > 0) {
        setAchieveTab('unlocked');
    }
  }, []);

  const t = (k: string) => getTranslation(k, profile.settings.language);
  const themeStyles = THEME_CONFIG[profile.settings.theme];
  const progress = getXpProgress(profile.stats.totalXp, profile.stats.level);

  // --- HELPER FOR ERROR RENDERING (Duplicated from App.tsx to avoid large file refactors) ---
  const renderErrorDiff = (correct: string, typed: string) => {
      const maxLength = Math.max(correct.length, typed.length);
      const chars = [];
      for(let i=0; i<maxLength; i++) {
          const cChar = correct[i];
          const tChar = typed[i];
          
          let className = "text-white/30"; // Correct
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

  // --- GUEST BLOCKING LOGIC ---
  if (profile.isGuest) {
      return (
          <div className="w-full max-w-md mx-auto mt-20 animate-fade-in-up">
              <div className={`${themeStyles.panel} p-8 rounded-3xl shadow-2xl text-center border border-yellow-500/20`}>
                  <div className="text-6xl mb-4">🔒</div>
                  <h2 className="text-2xl font-bold mb-2">Perfil de Convidado</h2>
                  <p className="opacity-70 mb-6 text-sm">
                      Você está jogando como convidado. Para acessar suas estatísticas, histórico e salvar seu progresso, escolha um apelido agora.
                  </p>
                  
                  <div className="space-y-4">
                      <input 
                          type="text" 
                          placeholder="Digite seu Nickname..."
                          className="w-full p-4 rounded-xl bg-black/20 border border-gray-500/20 text-center text-lg font-bold outline-none focus:border-blue-500 transition-all"
                          value={guestNameInput}
                          onChange={(e) => {
                              if (e.target.value.length <= 12) setGuestNameInput(e.target.value);
                          }}
                          maxLength={12}
                      />
                      <button 
                          onClick={() => {
                              if (guestNameInput.trim().length > 0) {
                                  onUpdateName(guestNameInput);
                              }
                          }}
                          disabled={!guestNameInput.trim()}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Criar Perfil e Salvar
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- NORMAL PROFILE LOGIC ---

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          if (newName.length > 12) return;
          onUpdateName(newName);
          setIsEditing(false);
      } else if (e.key === 'Escape') {
          setIsEditing(false);
          setNewName(profile.username);
      }
  };

  // Pagination Logic
  const HIST_PER_PAGE = 5;
  const ACH_PER_PAGE = 8;
  
  // Choose History Source
  const historySource = historyTab === 'typing' ? [...profile.history].reverse() : [...(profile.diversosHistory || [])].reverse();
  const paginatedHistory = historySource.slice(histPage * HIST_PER_PAGE, (histPage + 1) * HIST_PER_PAGE);
  const totalHistPages = Math.ceil(historySource.length / HIST_PER_PAGE);

  const filteredAchievements = ACHIEVEMENTS_LIST.filter(a => achieveTab === 'unlocked' ? profile.achievements.includes(a.id) : !profile.achievements.includes(a.id));
  const paginatedAchievements = filteredAchievements.slice(achPage * ACH_PER_PAGE, (achPage + 1) * ACH_PER_PAGE);
  const totalAchPages = Math.ceil(filteredAchievements.length / ACH_PER_PAGE);

  const LevelGuideModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowLevelGuide(false)}>
          <div className={`${themeStyles.panel} p-8 rounded-2xl w-full max-w-md shadow-2xl relative animate-fade-in-up border border-gray-500/20`} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowLevelGuide(false)} className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100">✕</button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">📊 {t('level_guide_title')}</h3>
              
              <div className="space-y-4 text-sm opacity-80">
                  <p>{t('level_desc')}</p>
                  
                  <div className="bg-black/20 p-4 rounded-lg border border-gray-500/10">
                      <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-blue-400">{t('level_formula')}</span>
                      </div>
                      <div className="font-mono text-center text-lg bg-black/20 p-2 rounded">
                          {t('req_xp')} = {t('curr_lvl')} × 100
                      </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 border-l-4 border-blue-500 rounded text-xs">
                      <span>💡 {t('calc_example')}</span>
                  </div>
              </div>
          </div>
      </div>
  );

  const HistoryDetail = ({ result, onClose }: { result: TestResult | DiversosResult, onClose: () => void }) => {
      const isHabbo = 'gameType' in result;
      const asTest = result as TestResult;
      const asDiv = result as DiversosResult;

      // Pagination for errors in history view
      const ERRORS_PER_PAGE = 10;
      const missedWords = asTest.missedWords || [];
      const missedCount = missedWords.length;
      const totalErrorPages = Math.ceil(missedCount / ERRORS_PER_PAGE);
      const displayedErrors = missedWords.slice(errorPage * ERRORS_PER_PAGE, (errorPage + 1) * ERRORS_PER_PAGE);

      return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div 
                className={`${themeStyles.panel} p-6 rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in-up relative border border-gray-500/20 max-h-[90vh] overflow-y-auto custom-scrollbar`}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-xl opacity-50 hover:opacity-100">✕</button>
                <h3 className="text-xl font-bold mb-4">{t('test_complete')} - {new Date(result.timestamp).toLocaleDateString()}</h3>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-black/20 p-3 rounded-lg text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold text-blue-500">{result.wpm}</div>
                        <div className="text-[10px] uppercase opacity-70 tracking-widest">{t('wpm')}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg text-center backdrop-blur-sm">
                        <div className="text-3xl font-bold text-green-500">{result.accuracy}%</div>
                        <div className="text-[10px] uppercase opacity-70 tracking-widest">{t('acc')}</div>
                    </div>
                    {!isHabbo && (
                        <>
                        <div className="bg-black/20 p-3 rounded-lg text-center backdrop-blur-sm">
                            <div className="text-3xl font-bold">{asTest.consistency || 0}%</div>
                            <div className="text-[10px] uppercase opacity-70 tracking-widest">{t('consistency')}</div>
                        </div>
                        <div 
                            className={`bg-black/20 p-3 rounded-lg text-center backdrop-blur-sm transition-colors ${missedCount > 0 ? 'cursor-pointer hover:bg-red-500/10 hover:border hover:border-red-500/30' : ''}`}
                            onClick={() => missedCount > 0 && setShowHistoryErrors(!showHistoryErrors)}
                        >
                            <div className={`text-3xl font-bold ${missedCount > 0 ? 'text-red-400' : ''}`}>{missedCount}</div>
                            <div className="text-[10px] uppercase opacity-70 tracking-widest">Errors</div>
                        </div>
                        </>
                    )}
                    {isHabbo && (
                         <>
                        <div className="bg-black/20 p-3 rounded-lg text-center backdrop-blur-sm">
                            <div className="text-3xl font-bold">{asDiv.score}</div>
                            <div className="text-[10px] uppercase opacity-70 tracking-widest">{t('score')}</div>
                        </div>
                        <div className="bg-black/20 p-3 rounded-lg text-center backdrop-blur-sm">
                            <div className="text-3xl font-bold">{asDiv.wordsCount}</div>
                            <div className="text-[10px] uppercase opacity-70 tracking-widest">{t('word_count')}</div>
                        </div>
                        </>
                    )}
                </div>

                {/* MISSED WORDS SECTION IN HISTORY - CLICK TO VIEW */}
                {!isHabbo && missedCount > 0 && showHistoryErrors && (
                    <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 animate-fade-in-up">
                        <h4 className="font-bold text-red-300 mb-3 flex items-center gap-2">
                            ❌ {t('missed_words')} <span className="text-xs bg-red-500/20 px-2 rounded">{missedCount}</span>
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            {displayedErrors.map((err, idx) => (
                                <div key={idx}>
                                    {renderErrorDiff(err.word, err.typed)}
                                </div>
                            ))}
                        </div>

                        {/* Pagination for History Errors */}
                        {totalErrorPages > 1 && (
                            <div className="flex gap-2 justify-center border-t border-red-500/10 pt-3">
                                <button 
                                    onClick={() => setErrorPage(p => Math.max(0, p - 1))}
                                    disabled={errorPage === 0}
                                    className="px-3 py-1 bg-black/20 hover:bg-black/40 rounded text-xs disabled:opacity-30"
                                >
                                    ←
                                </button>
                                <span className="text-xs opacity-60 font-mono flex items-center">
                                    {errorPage + 1} / {totalErrorPages}
                                </span>
                                <button 
                                    onClick={() => setErrorPage(p => Math.min(totalErrorPages - 1, p + 1))}
                                    disabled={errorPage === totalErrorPages - 1}
                                    className="px-3 py-1 bg-black/20 hover:bg-black/40 rounded text-xs disabled:opacity-30"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {isHabbo && asDiv.boostApplied && (
                     <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                         <h4 className="font-bold text-yellow-400 mb-2">⚡ Boost Stats</h4>
                         <p className="text-sm opacity-80">
                             Total Time: <span className="font-mono">{asDiv.duration.toFixed(2)}s</span>
                         </p>
                     </div>
                )}

                {!isHabbo && asTest.chartData && (
                    <div className="h-48 mb-6 bg-black/10 rounded-lg p-2 border border-gray-500/10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={asTest.chartData || []}>
                                <XAxis dataKey="second" hide />
                                <YAxis hide domain={['dataMin', 'dataMax']} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} />
                                <Line type="monotone" dataKey="wpm" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 4}} />
                                <Line type="monotone" dataKey="raw" stroke="#666" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
      );
  };

  const bests = profile.stats.bestWpmPerMode || {};
  const statsToDisplay = [
      { label: '15s', key: GameMode.TIME_15 },
      { label: '30s', key: GameMode.TIME_30 },
      { label: '60s', key: GameMode.TIME_60 },
      { label: 'Morte Súbita', key: GameMode.SUDDEN_DEATH },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up pb-10 relative">
      {viewHistoryItem && <HistoryDetail result={viewHistoryItem} onClose={() => { setViewHistoryItem(null); setErrorPage(0); setShowHistoryErrors(false); }} />}
      {showLevelGuide && <LevelGuideModal />}

      {/* Left Column: User Card - REMOVED transition-all */}
      <div className={`lg:col-span-1 p-8 rounded-3xl shadow-2xl ${themeStyles.panel} flex flex-col items-center text-center gap-6 h-fit relative border border-gray-500/10 backdrop-blur-md z-40 overflow-visible`}>
         
         {/* Avatar Editor */}
         {isAvatarOpen && (
             <div className="absolute top-0 right-[-17rem] bg-black/90 backdrop-blur-xl p-4 rounded-xl w-64 flex flex-col gap-4 animate-fade-in-up z-50 shadow-2xl border border-gray-500/20">
                 {/* Triangle pointer */}
                 <div className="absolute top-12 left-[-8px] w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-gray-500/20 border-b-[8px] border-b-transparent"></div>
                 <div className="absolute top-12 left-[-7px] w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-black/90 border-b-[8px] border-b-transparent"></div>

                 <div className="flex justify-between items-center border-b border-white/10 pb-2">
                     <span className="text-xs font-bold uppercase tracking-wider opacity-70 text-white">{t('avatar_select')}</span>
                     <button onClick={() => setIsAvatarOpen(false)} className="text-xs opacity-50 hover:opacity-100 text-white">✕</button>
                 </div>

                 <div className="text-[10px] opacity-50 text-left uppercase font-bold tracking-wider text-white">{t('background')}</div>
                 <div className="flex flex-wrap gap-2 justify-center">
                    {AVATAR_BGS.map(a => (
                        <button 
                            key={a.id} 
                            onClick={() => onUpdateAvatar(a.bg, profile.avatarImage)} 
                            className={`w-6 h-6 rounded-full border-2 ${profile.avatar === a.bg ? 'border-white scale-110' : 'border-transparent opacity-70'} hover:scale-110 transition-all`} 
                            style={{ background: a.bg }}
                            title={a.label}
                        />
                    ))}
                 </div>
                 
                 <div className="text-[10px] opacity-50 text-left uppercase font-bold tracking-wider text-white">{t('icon')}</div>
                 <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto custom-scrollbar">
                    {AVATAR_ICONS.map(icon => (
                         <button 
                            key={icon} 
                            onClick={() => onUpdateAvatar(profile.avatar, icon)} 
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg bg-white/5 hover:bg-white/20 transition-colors ${profile.avatarImage === icon ? 'bg-white/20 ring-1 ring-white' : ''}`}
                        >
                            {icon}
                        </button>
                    ))}
                 </div>
             </div>
         )}

         {/* Avatar Display */}
         <div className={`relative group transition-transform duration-300 ${isAvatarOpen ? '-translate-x-4' : ''}`}>
             <div 
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                className="w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold text-white mb-2 shadow-2xl overflow-hidden border-4 border-white/10 select-none transition-transform group-hover:scale-105 cursor-pointer" 
                style={{ background: profile.avatar }}
             >
                 {profile.avatarImage || '👤'}
             </div>
             <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold backdrop-blur-sm pointer-events-none">
                 {t('edit')}
             </div>
         </div>
         
         {/* Name Editor */}
         <div className="w-full">
            {!isEditing ? (
                <div className="flex items-center justify-center gap-2">
                    <h2 className="text-3xl font-bold truncate max-w-[200px]" title={profile.username}>
                        {profile.username}
                    </h2>
                    <button onClick={() => setIsEditing(true)} className="text-sm opacity-30 hover:opacity-100 transition-opacity">✏️</button>
                </div>
            ) : (
                <div className="flex gap-2 items-center justify-center">
                    <input 
                        value={newName} 
                        onChange={(e) => {
                            if(e.target.value.length <= 12) setNewName(e.target.value)
                        }} 
                        onKeyDown={handleNameKeyDown}
                        maxLength={12}
                        className="bg-black/20 rounded px-3 py-1 w-full text-center outline-none border border-blue-500/50 text-lg" 
                        autoFocus
                    />
                    <button onClick={() => { onUpdateName(newName); setIsEditing(false); }} className="text-green-500 hover:scale-110">✓</button>
                </div>
            )}
         </div>

         {/* Level Progress */}
         <div className="w-full bg-black/20 p-4 rounded-xl border border-gray-500/10">
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs uppercase opacity-50 font-bold tracking-wider">{t('level')}</span>
                    <span className="text-2xl font-bold leading-none">{profile.stats.level}</span>
                    <button onClick={() => setShowLevelGuide(true)} className="text-xs bg-blue-500/20 text-blue-400 rounded-full w-5 h-5 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">ℹ</button>
                </div>
                <div className="text-xs font-mono opacity-60">{Math.floor(profile.stats.totalXp)} XP</div>
            </div>
            <div className="w-full h-2 bg-gray-700/30 rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }} />
            </div>
         </div>

         {/* General Stats Grid */}
         <div className="grid grid-cols-2 gap-3 w-full text-center items-start">
            {/* UPDATED: Expandable Best WPM Card (No Modal) */}
            <div 
                className={`bg-black/10 rounded-xl border border-gray-500/5 hover:border-blue-500/30 transition-all group overflow-hidden cursor-pointer ${showWpmDetails ? 'row-span-2' : ''}`}
                onClick={() => setShowWpmDetails(!showWpmDetails)}
            >
                <div className="p-3">
                    <div className="text-2xl font-bold text-blue-400 group-hover:scale-110 transition-transform">{profile.stats.highestWpm}</div>
                    <div className="text-[10px] uppercase opacity-50 font-bold tracking-wider flex justify-center items-center gap-1">
                        {t('highest_wpm')} <span className={`text-[8px] opacity-50 transition-transform ${showWpmDetails ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                </div>
                
                {/* Expanded Details */}
                <div className={`px-3 pb-3 transition-all duration-300 ease-out overflow-hidden ${showWpmDetails ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="border-t border-white/10 pt-2 space-y-1">
                        {statsToDisplay.map(s => (
                            <div key={s.key} className="flex justify-between items-center text-[10px]">
                                <span className="opacity-70">{s.label}</span>
                                <span className="font-bold text-blue-300">{bests[s.key] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {/* REMOVED h-full to fix layout shift issue */}
             <div className="bg-black/10 p-3 rounded-xl border border-gray-500/5 hover:border-gray-500/20 transition-colors flex flex-col justify-center">
                <div className="text-2xl font-bold text-green-400">{profile.stats.totalTests}</div>
                <div className="text-[10px] uppercase opacity-50 font-bold tracking-wider">{t('total_tests')}</div>
            </div>
            
            <div className="bg-black/10 p-3 rounded-xl col-span-2 border border-gray-500/5 hover:border-gray-500/20 transition-colors flex justify-around">
                <div>
                    <div className="font-bold">{formatTime(profile.stats.totalTimePlayed)}</div>
                    <div className="text-[10px] uppercase opacity-50">{t('typing')}</div>
                </div>
                <div className="w-px bg-white/10"></div>
                <div>
                    <div className="font-bold">{formatTime(profile.stats.diversosTimePlayed || 0)}</div>
                    <div className="text-[10px] uppercase opacity-50">{t('habbo')}</div>
                </div>
            </div>
         </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        
        {/* Achievements */}
        <div className={`p-8 rounded-3xl shadow-xl ${themeStyles.panel} relative border border-gray-500/10`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                    🏆 {t('achievements')}
                    <span className="text-sm font-normal opacity-50 bg-black/20 px-2 py-1 rounded-full">{profile.achievements.length} / {ACHIEVEMENTS_LIST.length}</span>
                </h3>
                <div className="flex gap-1 bg-black/20 p-1 rounded-full">
                    <button 
                        onClick={() => { 
                            setAchieveTab('unlocked'); 
                            setAchPage(0); 
                        }} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${achieveTab === 'unlocked' ? 'bg-green-600 text-white shadow-lg' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                    >
                        {t('unlocked')}
                    </button>
                    <button 
                        onClick={() => { 
                            setAchieveTab('locked'); 
                            setAchPage(0);
                            onUpdateAvatar(profile.avatar, profile.avatarImage); 
                        }} 
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${achieveTab === 'locked' ? 'bg-red-600 text-white shadow-lg' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}
                    >
                        {t('locked')}
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 min-h-[300px] content-start">
                {paginatedAchievements.map(ach => {
                    const isUnlocked = profile.achievements.includes(ach.id);
                    let title = t(ach.titleKey);
                    if (ach.id.startsWith('level_')) {
                        const levelNum = ach.id.split('_')[1];
                        title = title.replace('{n}', levelNum);
                    }

                    // Base Card Style
                    let cardStyle = 'bg-black/10'; // Default Neutral
                    
                    // Unlocked gets a green border
                    if (isUnlocked) {
                        cardStyle += ' border border-green-500/50 shadow-md shadow-green-500/5';
                    } else {
                        cardStyle += ' border border-gray-500/10 opacity-60 grayscale';
                    }

                    // XP Badge Style based on value (Vibrant Colors)
                    let xpStyle = '';
                    if (ach.xpReward <= 150) xpStyle = 'bg-blue-500 text-white'; // Vibrant Blue
                    else if (ach.xpReward <= 250) xpStyle = 'bg-green-500 text-black'; // Vibrant Green
                    else if (ach.xpReward <= 450) xpStyle = 'bg-indigo-500 text-white'; // Vibrant Indigo
                    else if (ach.xpReward <= 1000) xpStyle = 'bg-purple-600 text-white'; // Vibrant Purple
                    else xpStyle = 'bg-gradient-to-r from-red-500 to-yellow-500 text-white animate-pulse shadow-lg'; // Gold/Red Gradient (>1000)

                    // Dim XP badge if locked
                    if (!isUnlocked) {
                        xpStyle = 'bg-white/10 opacity-50 text-white';
                    }

                    return (
                        <div key={ach.id} className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${cardStyle}`}>
                            <div className={`text-3xl p-3 rounded-full bg-black/20`}>{ach.icon}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-sm mb-1">{title}</div>
                                    <div className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shadow-sm ${xpStyle}`}>+{ach.xpReward} XP</div>
                                </div>
                                <div className="text-xs opacity-70 leading-relaxed">
                                    {ach.id.startsWith('level_') 
                                        ? t(ach.descriptionKey).replace('{n}', ach.id.split('_')[1])
                                        : t(ach.descriptionKey)
                                    }
                                </div>
                            </div>
                        </div>
                    );
                })}
                {paginatedAchievements.length === 0 && (
                    <div className="col-span-2 text-center opacity-40 py-10 italic">
                        {achieveTab === 'unlocked' ? "No achievements unlocked yet. Keep playing!" : "You've unlocked everything on this page!"}
                    </div>
                )}
            </div>
                {totalAchPages > 1 && (
                <div className="flex justify-center gap-2 mt-2">
                        {Array.from({length: totalAchPages}).map((_, i) => (
                            <button key={i} onClick={() => setAchPage(i)} className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-colors ${achPage === i ? 'bg-blue-500 text-white font-bold' : 'bg-black/20 hover:bg-black/40'}`}>{i + 1}</button>
                        ))}
                </div>
            )}
        </div>

        {/* History List */}
        <div className={`p-8 rounded-3xl shadow-xl ${themeStyles.panel} relative border border-gray-500/10`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">📜 {t('history')}</h3>
                <div className="flex gap-2 text-xs bg-black/20 p-1 rounded-lg">
                    <button onClick={() => { setHistoryTab('typing'); setHistPage(0); }} className={`px-3 py-1.5 rounded-md transition-all ${historyTab === 'typing' ? 'bg-blue-500 text-white shadow' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}>{t('tab_typing')}</button>
                    <button onClick={() => { setHistoryTab('diversos'); setHistPage(0); }} className={`px-3 py-1.5 rounded-md transition-all ${historyTab === 'diversos' ? 'bg-purple-500 text-white shadow' : 'opacity-60 hover:opacity-100 hover:bg-white/5'}`}>{t('tab_diversos')}</button>
                </div>
            </div>
            
            <div className="space-y-3 mb-4 min-h-[300px]">
                {paginatedHistory.length === 0 && (
                    <div className="text-center opacity-40 py-10 italic">No history found.</div>
                )}
                {paginatedHistory.map((h, i) => {
                    const isDiv = 'gameType' in h;
                    const d = h as DiversosResult;
                    const r = h as TestResult;
                    return (
                        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-black/5 border border-white/5 hover:border-white/10 hover:bg-black/10 transition-all group">
                            {isDiv ? (
                                <div className="flex items-center w-full justify-between">
                                    <div className="flex gap-4 items-center flex-1">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">🎮</div>
                                        <div>
                                            <div className="font-bold text-sm">{t(`game_${d.gameType}`)}</div>
                                            <div className="text-[10px] opacity-50">{new Date(d.timestamp).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                         <div className="text-right">
                                             <div className="font-bold text-purple-400">{d.score} pts</div>
                                             <div className="text-[10px] opacity-50">{d.accuracy}% Acc</div>
                                         </div>
                                         <button onClick={() => {
                                             setViewHistoryItem(d);
                                             onUpdateAvatar(profile.avatar, profile.avatarImage); 
                                         }} className="text-xs bg-white/5 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">{t('view_details')}</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center w-full justify-between">
                                    <div className="flex gap-4 items-center flex-1">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">⌨️</div>
                                        <div>
                                            <div className="font-bold text-sm">{r.mode === 'custom' ? 'Custom' : `${r.duration}s Test`}</div>
                                            <div className="text-[10px] opacity-50">{new Date(r.timestamp).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                             <div className="font-bold text-blue-400 text-lg">{r.wpm} <span className="text-[10px] opacity-50">WPM</span></div>
                                             <div className="text-[10px] opacity-50">{r.accuracy}% Acc</div>
                                         </div>
                                        <button onClick={() => {
                                            setViewHistoryItem(r);
                                            onUpdateAvatar(profile.avatar, profile.avatarImage); 
                                        }} className="text-xs bg-white/5 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">{t('view_details')}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
            {totalHistPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                        {Array.from({length: totalHistPages}).map((_, i) => (
                            <button key={i} onClick={() => setHistPage(i)} className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-colors ${histPage === i ? 'bg-blue-500 text-white font-bold' : 'bg-black/20 hover:bg-black/40'}`}>{i + 1}</button>
                        ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
