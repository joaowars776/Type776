
import React from 'react';
import { getAchievementGuide } from '../utils/achievementGuides';

interface Props {
  activeMissionId: string | null;
  onCancel: () => void;
  isCompleted: boolean;
  onReturnToMissions: () => void;
}

const MissionTracker: React.FC<Props> = ({ activeMissionId, onCancel, isCompleted, onReturnToMissions }) => {
  if (!activeMissionId) return null;

  const guide = getAchievementGuide(activeMissionId);
  if (!guide) return null;

  if (isCompleted) {
      return (
        <div className="fixed top-24 right-6 z-40 w-80 animate-fade-in-up">
            <div className="bg-black/90 backdrop-blur-md border border-green-500/50 text-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-green-500/20">
                <div className="bg-green-600/20 p-4 border-b border-green-500/20 text-center">
                    <div className="text-2xl mb-1">🎉</div>
                    <h3 className="font-bold text-green-400 uppercase tracking-widest">Missão Concluída!</h3>
                </div>
                <div className="p-6 text-center">
                    <p className="text-sm opacity-80 mb-4">Você completou: <br/><span className="font-bold text-white">{guide.title}</span></p>
                    <button 
                        onClick={onReturnToMissions}
                        className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-transform hover:scale-105"
                    >
                        Nova Missão
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed top-24 right-6 z-40 w-80 animate-fade-in-up">
      <div className="bg-black/80 backdrop-blur-md border border-blue-500/30 text-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-blue-500/20">
        
        {/* Header */}
        <div className="bg-blue-600/20 p-3 border-b border-blue-500/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="animate-pulse text-blue-400 text-xs">●</span>
                <span className="font-bold text-xs tracking-wide uppercase text-blue-100">Missão Ativa</span>
            </div>
        </div>

        {/* Content */}
        <div className="p-4">
            <h3 className="font-bold text-base mb-4 leading-tight text-white border-b border-white/10 pb-2">{guide.title}</h3>
            
            <div className="mb-4">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 block">Caminho</span>
                <div className="space-y-3 relative pl-2">
                    {/* Visual Connector Line */}
                    <div className="absolute left-[13px] top-1 bottom-1 w-0.5 bg-gray-700/30"></div>

                    {guide.steps.map((step, idx) => (
                        <div key={idx} className="relative pl-6 text-sm text-gray-300">
                            <div className="absolute left-0 top-0.5 w-4 h-4 bg-black rounded-full border border-gray-500 flex items-center justify-center text-[9px] font-mono z-10 text-gray-400">
                                {idx + 1}
                            </div>
                            <div className="leading-snug">
                                {step}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {guide.tips && guide.tips.length > 0 && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                    <div className="flex items-center gap-2 mb-1 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                        <span>💡</span> Dica
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                        {guide.tips.map((tip, i) => (
                            <li key={i} className="text-xs text-yellow-100/80 leading-relaxed">
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t border-white/5 flex justify-center">
            <button 
                onClick={onCancel}
                className="text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 px-4 py-2 rounded transition-colors w-full"
            >
                Cancelar Missão
            </button>
        </div>
      </div>
    </div>
  );
};

export default MissionTracker;
