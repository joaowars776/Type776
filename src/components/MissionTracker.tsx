
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAchievementGuide } from '../utils/achievementGuides';
import { getTranslation } from '../utils/translations';
import { ACHIEVEMENTS_LIST } from '../constants';

interface Props {
  activeMissionIds: string[];
  completedMissionIds: string[];
  onCancel: (id: string) => void;
  onReturnToMissions: (id: string) => void;
  language?: 'en' | 'pt';
}

const MissionTracker: React.FC<Props> = ({ 
  activeMissionIds, 
  completedMissionIds, 
  onCancel, 
  onReturnToMissions, 
  language = 'pt' 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  
  // Update selected mission when active missions change
  useEffect(() => {
    if (activeMissionIds.length > 0) {
      if (!selectedMissionId || !activeMissionIds.includes(selectedMissionId)) {
        // Prefer showing a completed mission if available
        const completed = activeMissionIds.find(id => completedMissionIds.includes(id));
        setSelectedMissionId(completed || activeMissionIds[0]);
      }
    } else {
      setSelectedMissionId(null);
    }
  }, [activeMissionIds, completedMissionIds]);

  if (activeMissionIds.length === 0) return null;

  const isEn = language === 'en';
  const t = (k: string) => getTranslation(k, language);

  const getMissionIcon = (id: string) => {
    const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
    return ach?.icon || '🎯';
  };

  const currentMissionId = selectedMissionId || activeMissionIds[0];
  const guide = getAchievementGuide(currentMissionId, language);
  const isCompleted = completedMissionIds.includes(currentMissionId);

  if (isMinimized) {
    return (
      <div className="fixed top-24 right-6 z-40 flex flex-col gap-3 items-end">
        {activeMissionIds.map((id, index) => {
          const missionGuide = getAchievementGuide(id, language);
          const missionCompleted = completedMissionIds.includes(id);
          
          return (
            <motion.div 
              key={id}
              drag
              dragMomentum={false}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-move"
            >
              <button 
                onClick={() => {
                  setSelectedMissionId(id);
                  setIsMinimized(false);
                }}
                className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center border-2 transition-all hover:scale-110 group relative ${
                  missionCompleted 
                    ? 'bg-green-600 border-green-400/50' 
                    : id === currentMissionId 
                      ? 'bg-blue-600 border-blue-400/50' 
                      : 'bg-slate-800 border-slate-600/50'
                }`}
                title={missionGuide?.title}
              >
                <span className={`text-2xl ${missionCompleted ? 'animate-bounce' : 'animate-pulse'}`}>
                  {getMissionIcon(id)}
                </span>
                
                {missionCompleted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border border-white flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </div>
                )}
                
                {!missionCompleted && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute right-full mr-3 px-2 py-1 bg-black/90 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-blue-500/30">
                  {missionGuide?.title}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <motion.div 
        drag
        dragMomentum={false}
        className="fixed top-24 right-6 z-40 w-80 cursor-move"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
      <div className={`backdrop-blur-md border text-white rounded-xl shadow-2xl overflow-hidden ring-1 ${
        isCompleted ? 'bg-green-950/90 border-green-500/50 ring-green-500/20' : 'bg-black/80 border-blue-500/30 ring-blue-500/20'
      }`}>
        
        {/* Header */}
        <div className={`${isCompleted ? 'bg-green-600/20' : 'bg-blue-600/20'} p-3 border-b ${isCompleted ? 'border-green-500/20' : 'border-blue-500/20'} flex justify-between items-center`}>
            <div className="flex items-center gap-2">
                <span className={`text-lg ${isCompleted ? 'animate-bounce' : 'animate-pulse'}`}>{getMissionIcon(currentMissionId)}</span>
                <span className={`font-bold text-xs tracking-wide uppercase ${isCompleted ? 'text-green-100' : 'text-blue-100'}`}>
                  {isCompleted ? t('mission_complete_title') : t('active_mission_title')}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title={t('minimize')}
                >
                    <Minus size={14} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onCancel(currentMissionId); }}
                    className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
                    title={t('cancel_mission')}
                >
                    <X size={14} />
                </button>
            </div>
        </div>

        {/* Mission Selector (if multiple) */}
        {activeMissionIds.length > 1 && (
          <div className="flex items-center justify-between px-3 py-1 bg-white/5 border-b border-white/5">
            <button 
              onClick={() => {
                const idx = activeMissionIds.indexOf(currentMissionId);
                const prevIdx = (idx - 1 + activeMissionIds.length) % activeMissionIds.length;
                setSelectedMissionId(activeMissionIds[prevIdx]);
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex gap-1">
              {activeMissionIds.map(id => (
                <div 
                  key={id} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    id === currentMissionId ? 'bg-blue-400 w-3' : 'bg-white/20'
                  }`} 
                />
              ))}
            </div>
            <button 
              onClick={() => {
                const idx = activeMissionIds.indexOf(currentMissionId);
                const nextIdx = (idx + 1) % activeMissionIds.length;
                setSelectedMissionId(activeMissionIds[nextIdx]);
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
            <motion.div
                key={currentMissionId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
            >
                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-base mb-4 leading-tight text-white border-b border-white/10 pb-2">
                      {guide?.title}
                    </h3>
                    
                    {isCompleted ? (
                      <div className="text-center py-4">
                        <div className="text-4xl mb-4">✨</div>
                        <p className="text-sm opacity-80 mb-6">
                          {t('mission_unlocked_desc')}
                        </p>
                        <button 
                            onClick={() => onReturnToMissions(currentMissionId)}
                            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-transform hover:scale-105 shadow-lg"
                        >
                            {t('claim_new_mission')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">{t('path_label')}</span>
                            <div className="space-y-3 relative pl-2">
                                <div className="absolute left-[13px] top-1 bottom-1 w-0.5 bg-gray-700/30"></div>
                                {guide?.steps.map((step, idx) => (
                                    <div key={idx} className="relative pl-6 text-sm text-gray-300">
                                        <div className="absolute left-0 top-0.5 w-4 h-4 bg-black rounded-full border border-gray-500 flex items-center justify-center text-[9px] font-mono z-10 text-gray-400">
                                            {idx + 1}
                                        </div>
                                        <div className="leading-snug">{step}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {guide?.tips && guide.tips.length > 0 && (
                            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                                <div className="flex items-center gap-2 mb-1 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                                    <span>💡</span> {t('tip_label')}
                                </div>
                                <ul className="list-disc pl-4 space-y-1">
                                    {guide.tips.map((tip, i) => (
                                        <li key={i} className="text-xs text-yellow-100/80 leading-relaxed">{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="mt-6 pt-2 border-t border-white/5">
                            <button 
                                onClick={() => onCancel(currentMissionId)}
                                className="text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 px-4 py-2 rounded transition-colors w-full"
                            >
                                {t('cancel_mission')}
                            </button>
                        </div>
                      </>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MissionTracker;
