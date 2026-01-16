
import React, { useState } from 'react';
import { UserProfile, HabboGameType, DiversosResult } from '../types';
import { THEME_CONFIG } from '../constants';
import { getTranslation } from '../utils/translations';

interface Props {
    profile: UserProfile;
    onClose: () => void;
}

const HabboReports: React.FC<Props> = ({ profile, onClose }) => {
    const t = (k: string) => getTranslation(k, profile.settings.language);
    const themeStyles = THEME_CONFIG[profile.settings.theme];
    const isLight = profile.settings.theme === 'light';
    
    const [activeTab, setActiveTab] = useState<'HISTORY' | 'TRENDS'>('HISTORY');
    const [filterGame, setFilterGame] = useState<HabboGameType | 'ALL'>('ALL');

    // --- DATA PROCESSING ---
    // Safely access history, defaulting to empty array if undefined
    const historyData = profile.diversosHistory || [];
    const history = [...historyData].reverse(); // Newest first

    // Trends Logic: Compare last attempt of each game vs previous attempt
    const calculateTrends = () => {
        const gameMap: Record<string, DiversosResult[]> = {};
        
        // Group by game type
        historyData.forEach(r => {
            if (!gameMap[r.gameType]) gameMap[r.gameType] = [];
            gameMap[r.gameType].push(r);
        });

        const trends = [];
        for (const [gType, results] of Object.entries(gameMap)) {
            // Need at least 2 to compare. results are chronological (old -> new)
            if (results.length < 2) continue;
            
            const current = results[results.length - 1];
            const previous = results[results.length - 2];
            
            trends.push({
                gameType: gType as HabboGameType,
                current,
                previous,
                diffWpm: current.wpm - previous.wpm,
                diffAcc: current.accuracy - previous.accuracy
            });
        }
        return trends.reverse(); // Show most recently updated first if sort logic applied, or just list
    };

    const trendsData = calculateTrends();

    return (
        <div className={`w-full h-full flex flex-col ${themeStyles.bg} ${themeStyles.text}`}>
            <div className={`w-full h-full flex flex-col overflow-hidden relative border-l ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                
                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-center ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10 bg-black/20'}`}>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            📊 {t('habbo')} Relatórios
                        </h2>
                        <p className="text-xs opacity-60 mt-1">Acompanhe seu desempenho no modo Habbo</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 transition-colors opacity-60 hover:opacity-100">✕</button>
                </div>

                {/* Tabs & Filters */}
                <div className={`p-4 border-b flex flex-wrap gap-4 items-center justify-between ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                    <div className="flex bg-black/10 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('HISTORY')}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-blue-600 text-white shadow' : 'opacity-60 hover:opacity-100'}`}
                        >
                            📜 Histórico de Partidas
                        </button>
                        <button 
                            onClick={() => setActiveTab('TRENDS')}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'TRENDS' ? 'bg-purple-600 text-white shadow' : 'opacity-60 hover:opacity-100'}`}
                        >
                            📈 Análise de Evolução
                        </button>
                    </div>

                    {activeTab === 'HISTORY' && (
                        <select 
                            value={filterGame} 
                            onChange={(e) => setFilterGame(e.target.value as any)}
                            className={`px-3 py-2 rounded-lg text-xs outline-none border ${isLight ? 'bg-white border-gray-300' : 'bg-black/20 border-white/10'}`}
                        >
                            <option value="ALL">Todos os Jogos</option>
                            {Object.values(HabboGameType).map(g => (
                                <option key={g} value={g}>{t(`game_${g}`)}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Content Area */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${isLight ? 'bg-white' : ''}`}>
                    
                    {/* --- EMPTY STATE CHECK --- */}
                    {historyData.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 gap-4">
                            <div className="text-6xl">📉</div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-2">Sem dados ainda</h3>
                                <p className="text-sm max-w-xs mx-auto">Jogue algumas partidas no modo Habbo para gerar relatórios detalhados sobre seu desempenho.</p>
                            </div>
                        </div>
                    )}

                    {/* --- HISTORY TAB --- */}
                    {activeTab === 'HISTORY' && historyData.length > 0 && (
                        <div className="space-y-3">
                            {history.filter(h => filterGame === 'ALL' || h.gameType === filterGame).length === 0 ? (
                                <div className="text-center py-20 opacity-40">Nenhuma partida encontrada para este filtro.</div>
                            ) : (
                                history
                                    .filter(h => filterGame === 'ALL' || h.gameType === filterGame)
                                    .map((item, idx) => (
                                    <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-black/30 text-blue-300'}`}>
                                                {item.gameType.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{t(`game_${item.gameType}`)}</div>
                                                <div className="text-[10px] opacity-50">{new Date(item.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-6 text-right">
                                            <div>
                                                <div className="font-mono font-bold text-blue-400">{item.wpm}</div>
                                                <div className="text-[9px] uppercase opacity-50">WPM</div>
                                            </div>
                                            <div>
                                                <div className={`font-mono font-bold ${item.accuracy === 100 ? 'text-green-400' : 'text-yellow-400'}`}>{item.accuracy}%</div>
                                                <div className="text-[9px] uppercase opacity-50">Acc</div>
                                            </div>
                                            <div>
                                                <div className="font-mono font-bold">{item.score}</div>
                                                <div className="text-[9px] uppercase opacity-50">Pts</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* --- TRENDS TAB --- */}
                    {activeTab === 'TRENDS' && historyData.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trendsData.length === 0 ? (
                                <div className="col-span-full text-center py-20 opacity-40">Jogue pelo menos 2 partidas do mesmo modo para ver tendências de evolução.</div>
                            ) : (
                                trendsData.map((trend, idx) => (
                                    <div key={idx} className={`p-5 rounded-xl border relative overflow-hidden ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg">{t(`game_${trend.gameType}`)}</h3>
                                            <span className="text-[10px] opacity-50 bg-black/20 px-2 py-1 rounded">Comparação Recente</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* WPM Trend */}
                                            <div className="bg-black/10 p-3 rounded-lg">
                                                <div className="text-[10px] uppercase opacity-50 mb-1">Velocidade (WPM)</div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-2xl font-mono font-bold">{trend.current.wpm}</span>
                                                    {trend.diffWpm !== 0 && (
                                                        <span className={`text-xs font-bold mb-1 flex items-center ${trend.diffWpm > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {trend.diffWpm > 0 ? '▲' : '▼'} {Math.abs(trend.diffWpm)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] opacity-40 mt-1">Anterior: {trend.previous.wpm}</div>
                                            </div>

                                            {/* Accuracy Trend */}
                                            <div className="bg-black/10 p-3 rounded-lg">
                                                <div className="text-[10px] uppercase opacity-50 mb-1">Precisão</div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-2xl font-mono font-bold">{trend.current.accuracy}%</span>
                                                    {trend.diffAcc !== 0 && (
                                                        <span className={`text-xs font-bold mb-1 flex items-center ${trend.diffAcc > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {trend.diffAcc > 0 ? '▲' : '▼'} {Math.abs(trend.diffAcc)}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] opacity-40 mt-1">Anterior: {trend.previous.accuracy}%</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default HabboReports;
