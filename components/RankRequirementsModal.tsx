import React from 'react';
import { X, Crown } from 'lucide-react';
import Card from './ui/Card';
import { RANK_THRESHOLDS } from '../constants';
import type { ThemeMode } from '../types';

interface RankRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
}

export const RankRequirementsModal: React.FC<RankRequirementsModalProps> = ({ isOpen, onClose, themeMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-display font-bold text-white">Rank Requirements</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/50">
                <Crown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Challenger Top 1,000</h4>
                <p className="text-xs text-zinc-400">Top 1,000 players globally</p>
              </div>
            </div>
          </div>

          {RANK_THRESHOLDS.map((rankThreshold, index) => {
            const level = rankThreshold.level ?? index + 1;
            const isLast = index === RANK_THRESHOLDS.length - 1;
            const maxDisplay = isLast ? '2000+' : (rankThreshold.max === Infinity ? '∞' : rankThreshold.max);
            const minDisplay = rankThreshold.min === 0 ? '0' : rankThreshold.min;

            return (
              <div
                key={index}
                className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-black/5 border-black/10 hover:bg-black/10'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-white text-sm"
                    style={{
                      backgroundColor: `${rankThreshold.color}20`,
                      borderColor: rankThreshold.color,
                      color: rankThreshold.color
                    }}
                  >
                    {level}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">
                      {rankThreshold.name} {level === 10 ? '(Level 10)' : ''}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {minDisplay} - {maxDisplay} points
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-zinc-400 text-center">
            Points are gained/lost based on match results. Winstreaks provide bonus points. Top 3 rank is for the top 3 players by MMR only.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RankRequirementsModal;
