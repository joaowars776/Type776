
import React, { useState } from 'react';
import { Theme, UserProfile, INITIAL_PROFILE, AppFont, SoundType } from '../types';
import { getTranslation } from '../utils/translations';
import { THEME_CONFIG, FONT_CONFIG } from '../constants';
import SnowEffect from './SnowEffect';
import { playTypingSound } from '../utils/sound';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [showInfo, setShowInfo] = useState(false); // State for the popup
  const [previousFont, setPreviousFont] = useState<AppFont>(INITIAL_PROFILE.settings.font);

  const t = (k: string) => getTranslation(k, profile.settings.language);

  const handleFinish = () => {
    if (!profile.username.trim()) return;
    onComplete({ ...profile, isSetupCompleted: true });
  };

  const handleGuest = () => {
      onComplete({ ...profile, username: 'Guest', isGuest: true, isSetupCompleted: true });
  }

  const handleSoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSound = e.target.value as SoundType;
      setProfile({...profile, settings: {...profile.settings, soundType: newSound}});
      playTypingSound(newSound);
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newFont = e.target.value as AppFont;
      setProfile({...profile, settings: {...profile.settings, font: newFont}});
      // Update memory of "preferred font" when manually changed
      setPreviousFont(newFont);
  };

  const handleThemeChange = (newTheme: Theme) => {
      let nextFont = profile.settings.font;
      
      // Logic to auto-switch font for 8bits
      if (newTheme === Theme.EIGHT_BITS) {
          // If we are NOT currently on Press Start, save the current font
          if (profile.settings.font !== AppFont.PRESS_START) {
              setPreviousFont(profile.settings.font); 
          }
          // Force Press Start for 8bits
          nextFont = AppFont.PRESS_START;
      } else if ((profile.settings.theme as Theme) === Theme.EIGHT_BITS) {
          // Revert if moving away from 8bits
          // But if the previous font WAS Press Start (user manually chose it before), keep it.
          nextFont = previousFont;
      }

      setProfile({
          ...profile, 
          settings: { 
              ...profile.settings, 
              theme: newTheme,
              font: nextFont
          }
      });
  };

  const currentTheme = THEME_CONFIG[profile.settings.theme];
  const isLight = profile.settings.theme === Theme.LIGHT;
  const isRetro = profile.settings.font === AppFont.PRESS_START;

  const fontStyle = { fontFamily: FONT_CONFIG[profile.settings.font] };

  // Adjust sizes for Retro font to keep UI clean
  const titleSize = isRetro ? 'text-lg leading-relaxed' : 'text-3xl';
  const labelSize = isRetro ? 'text-[8px]' : 'text-xs';
  const inputSize = isRetro ? 'text-xs p-2' : 'text-lg p-3';
  const buttonSize = isRetro ? 'text-xs py-3' : 'py-4';

  return (
    <div 
        className={`fixed inset-0 z-50 flex items-center justify-center ${currentTheme.bg} ${currentTheme.text} transition-colors duration-500 overflow-y-auto`}
        style={fontStyle}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {profile.settings.theme === Theme.CHRISTMAS && <SnowEffect intensity={profile.settings.snowIntensity} />}

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4 z-10 items-start">
        
        {/* LEFT COLUMN: Setup Card */}
        <div className={`p-8 rounded-3xl shadow-2xl ${currentTheme.panel} border border-blue-500/30 flex flex-col gap-5 relative overflow-visible group h-fit transition-all duration-300`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-3xl"></div>
            
            <div className="text-left">
                <div className={`${labelSize} font-bold text-blue-500 uppercase tracking-widest mb-1`}>{t('onboarding_recommended')}</div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className={`${titleSize} font-black`}>{t('setup_title')}</h1>
                    <button 
                        onClick={() => setShowInfo(!showInfo)}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm transition-all ${showInfo ? 'bg-yellow-500 text-white border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-gray-400/30 text-gray-400 hover:text-yellow-400 hover:border-yellow-400 hover:bg-yellow-400/10'}`}
                        title={t('about_type776')}
                    >
                        💡
                    </button>
                </div>
                <p className={`${isRetro ? 'text-[10px]' : 'text-sm'} opacity-60`}>{t('onboarding_recommended_desc')}</p>
            </div>

            <div className="space-y-1">
                <label className={`${labelSize} font-bold opacity-70 uppercase tracking-wider`}>{t('choose_lang')}</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setProfile({...profile, settings: {...profile.settings, language: 'pt'}})}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all font-bold ${isRetro ? 'text-[10px]' : 'text-sm'} ${profile.settings.language === 'pt' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-gray-500/20 hover:bg-black/5 opacity-60'}`}
                    >
                        Português
                    </button>
                    <button
                        onClick={() => setProfile({...profile, settings: {...profile.settings, language: 'en'}})}
                        className={`flex-1 py-2 px-4 rounded-lg border transition-all font-bold ${isRetro ? 'text-[10px]' : 'text-sm'} ${profile.settings.language === 'en' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-gray-500/20 hover:bg-black/5 opacity-60'}`}
                    >
                        English
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                <label className={`${labelSize} font-bold opacity-70 uppercase tracking-wider`}>{t('enter_name')}</label>
                <input 
                    type="text" 
                    value={profile.username}
                    onChange={(e) => {
                        if (e.target.value.length <= 12) {
                            setProfile({...profile, username: e.target.value})
                        }
                    }}
                    maxLength={12}
                    placeholder={t('nickname_placeholder')}
                    className={`w-full rounded-xl bg-black/10 border border-gray-500/20 focus:border-blue-500 outline-none font-bold transition-all ${inputSize}`}
                />
            </div>

            {/* Snow Intensity */}
            {profile.settings.theme === Theme.CHRISTMAS && (
                <div className="space-y-1 animate-fade-in-up">
                    <div className="flex justify-between items-center">
                        <label className={`${labelSize} font-bold opacity-70 uppercase tracking-wider text-blue-300`}>❄️ {t('snow_intensity')}</label>
                        <span className={`${labelSize} font-mono`}>{profile.settings.snowIntensity}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        step="1"
                        value={profile.settings.snowIntensity}
                        onChange={(e) => setProfile({...profile, settings: {...profile.settings, snowIntensity: parseInt(e.target.value)}})}
                        className="w-full h-2 bg-gray-500/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            )}

            <div className="space-y-1">
                <label className={`${labelSize} font-bold opacity-70 uppercase tracking-wider`}>{t('choose_theme')}</label>
                <div className="grid grid-cols-4 gap-2">
                {(Object.keys(Theme) as Array<keyof typeof Theme>).map((key) => {
                    const themeVal = Theme[key];
                    const isSelected = profile.settings.theme === themeVal;
                    const themeConfig = THEME_CONFIG[themeVal];
                    
                    return (
                        <button
                            key={themeVal}
                            onClick={() => handleThemeChange(themeVal)}
                            className={`h-10 rounded border transition-all flex items-center justify-center ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-transparent opacity-50 hover:opacity-100 bg-black/10'}`}
                            style={{ backgroundColor: isSelected ? undefined : themeConfig.previewColor }}
                            title={t(`theme_${themeVal}`)}
                        >
                            {isSelected && <span className="text-[10px]">✓</span>}
                        </button>
                    )
                })}
                </div>
            </div>

            <div className="space-y-1">
                <label className={`${labelSize} font-bold opacity-70 uppercase tracking-wider`}>{t('sound_effects')}</label>
                <select
                    value={profile.settings.soundType}
                    onChange={handleSoundChange}
                    className={`w-full p-2 rounded-lg border border-gray-500/20 outline-none font-bold focus:border-blue-500 transition-colors ${isRetro ? 'text-xs' : 'text-sm'} ${isLight ? 'bg-white/80 text-black' : 'bg-black/50 text-white'}`}
                >
                    <option value={SoundType.OFF}>{t('sound_off')}</option>
                    <option value={SoundType.KEYBOARD}>{t('sound_keyboard')}</option>
                    <option value={SoundType.HIGH_PITCH}>{t('sound_high_pitch')}</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className={`${labelSize} font-bold opacity-70 uppercase tracking-wider`}>{t('font_family')}</label>
                <div className="flex gap-2 items-center">
                    <select
                        value={profile.settings.font}
                        onChange={handleFontChange}
                        className={`flex-1 p-2 rounded-lg border border-gray-500/20 outline-none font-bold focus:border-blue-500 transition-colors ${isRetro ? 'text-xs' : 'text-sm'} ${isLight ? 'bg-white/80 text-black' : 'bg-black/50 text-white'}`}
                    >
                        {Object.values(AppFont).map(f => (
                            <option key={f} value={f} className="text-black bg-white">{f}</option>
                        ))}
                    </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer opacity-80 hover:opacity-100 mt-1">
                    <input
                        type="checkbox"
                        checked={profile.settings.applyFontToTyping}
                        onChange={(e) => setProfile({...profile, settings: {...profile.settings, applyFontToTyping: e.target.checked}})}
                        className="rounded accent-blue-500"
                    />
                    <div className="flex items-center gap-2">
                        <span className={`${labelSize} font-bold`}>{t('apply_font_typing')}</span>
                        <span className="text-[8px] text-red-400 font-bold uppercase tracking-tighter">({t('not_recommended')})</span>
                    </div>
                </label>
            </div>

            <button 
                onClick={handleFinish}
                disabled={!profile.username.trim()}
                className={`mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 ${buttonSize}`}
            >
                {t('start_journey')} 🚀
            </button>
        </div>

        {/* RIGHT COLUMN: Info & Guest Card */}
        <div className="flex flex-col gap-6">
            
            {/* INFO BLOCK (Toggled, pushes Guest Card down) */}
            {showInfo && (
                <div className={`w-full p-6 rounded-3xl shadow-2xl relative animate-fade-in-up border 
                    ${currentTheme.panel} border-gray-500/10
                `}>
                    {/* Arrow/Triangle pointing left (Desktop only) */}
                    <div className={`hidden md:block absolute top-10 -left-2 w-4 h-4 transform rotate-45 border-l border-b ${currentTheme.arrowClass}`}>
                    </div>

                    <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity p-1 z-10">✕</button>

                    {/* Styled Content for About */}
                    <div className="space-y-4 text-sm leading-relaxed mt-2">
                        {profile.settings.language === 'pt' ? (
                            <>
                                <div>
                                    <h3 className={`font-black text-xl mb-1 ${currentTheme.accent}`}>🎮 TYPE776</h3>
                                    <p className="text-xs opacity-80">
                                        Um projeto feito com <span className="font-bold text-purple-400">🤖 IA</span> para fãs de Habbo que jogam <span className="font-bold">DIVERSOS</span>.
                                    </p>
                                </div>

                                <ul className="space-y-2 opacity-90">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[10px] mt-1">🟢</span>
                                        <span>Funciona <strong className="text-green-500">100% OFFLINE</strong> após a instalação</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[10px] mt-1">🟢</span>
                                        <span>Jogue sozinho, <strong className="text-red-400">sem Habbo</strong> ou outros jogadores</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[10px] mt-1">🟢</span>
                                        <span>Ideal para <strong className="text-blue-400">diversão casual</strong> e treino de digitação</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[10px] mt-1">🟢</span>
                                        <span className="font-bold text-yellow-400">Totalmente GRATUITO</span>
                                    </li>
                                </ul>

                                <div className={`pt-4 border-t text-xs border-gray-500/10 opacity-70`}>
                                    <div className="flex items-center gap-2">
                                        <span>🛠</span>
                                        <span>Criado por 
                                            <a 
                                                href="https://youtube.com/@joaowars776" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="ml-1 text-base font-black tracking-wide bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] hover:scale-110 inline-block transition-transform"
                                            >
                                                joaowars776
                                            </a>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>⚙</span>
                                        <span>Desenvolvido com <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="font-mono opacity-80 hover:underline hover:text-blue-400 transition-colors">aistudio.google.com</a></span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm">✨</span>
                                        <span><span className="font-bold text-indigo-400">Gemini 3 Pro Preview</span> (versão gratuita)</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h3 className={`font-black text-xl mb-1 ${currentTheme.accent}`}>🎮 TYPE776</h3>
                                    <p className="text-xs opacity-80">
                                        An <span className="font-bold text-purple-400">🤖 AI-made</span> project for Habbo fans who play <span className="font-bold">DIVERSOS</span>.
                                    </p>
                                </div>
                                <ul className="space-y-2 opacity-90">
                                     <li className="flex items-start gap-2"><span>🟢</span> Works <strong className="text-green-500">100% OFFLINE</strong> after install</li>
                                     <li className="flex items-start gap-2"><span>🟢</span> Play solo, <strong className="text-red-400">no Habbo</strong> needed</li>
                                     <li className="flex items-start gap-2"><span>🟢</span> Ideal for <strong className="text-blue-400">casual fun</strong> & training</li>
                                     <li className="flex items-start gap-2"><span>🟢</span> Totally <strong className="text-yellow-400">FREE</strong></li>
                                </ul>
                                 <div className="pt-4 border-t text-xs border-gray-500/10 opacity-70">
                                    <div className="flex items-center gap-2">
                                        <span>🛠</span> Created by 
                                        <a 
                                            href="https://youtube.com/@joaowars776" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="ml-1 text-base font-black tracking-wide bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] hover:scale-110 inline-block transition-transform"
                                        >
                                            joaowars776
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2"><span>⚙</span> Developed with <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="font-mono opacity-80 hover:underline hover:text-blue-400 transition-colors">aistudio.google.com</a></div>
                                    <div className="flex items-center gap-2 mt-1"><span className="text-sm">✨</span> <span><span className="font-bold text-indigo-400">Gemini 3 Pro Preview</span> (Free Tier)</span></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Guest Card */}
            <div className={`flex flex-col justify-center gap-6 p-8 opacity-90 rounded-3xl h-fit transition-transform duration-300 ${isLight ? 'bg-white/40 border border-gray-200 shadow-xl' : 'bg-black/20 border border-white/5'}`}>
                <div className="text-center md:text-left">
                    <div className={`font-bold mb-2 ${isRetro ? 'text-lg' : 'text-2xl'} ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{t('onboarding_just_testing')}</div>
                    <p className={`${isRetro ? 'text-[10px]' : 'text-sm'} leading-relaxed mb-6 ${isLight ? 'text-gray-800 opacity-80' : 'opacity-60'}`}>
                        {t('onboarding_guest_desc')}
                    </p>
                    
                    <div className={`border p-4 rounded-xl mb-6 text-left ${isLight ? 'bg-yellow-500/20 border-yellow-600/30' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                        <h3 className={`font-bold text-sm mb-2 uppercase tracking-wide ${isLight ? 'text-yellow-700' : 'text-yellow-500'}`}>⚠️ {t('onboarding_guest_mode')}</h3>
                        <ul className={`text-xs space-y-2 list-disc pl-4 ${isLight ? 'text-yellow-900/80' : 'text-yellow-200/80'}`}>
                            <li>{t('onboarding_guest_warn_1')}</li>
                            <li>{t('onboarding_guest_warn_2')}</li>
                            <li>{t('onboarding_guest_warn_3')}</li>
                        </ul>
                    </div>

                    <button 
                        onClick={handleGuest}
                        className={`w-full py-3 font-bold rounded-xl transition-all ${isLight ? 'bg-black/10 hover:bg-black/20 text-black border border-black/10' : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white'}`}
                    >
                        {t('continue_guest')}
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;
