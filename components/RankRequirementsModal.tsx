import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Card from './ui/Card';
import { RANK_THRESHOLDS } from '../constants';
import type { ThemeMode } from '../types';

interface RankRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
}

/** Ranks from highest (Top 3) to lowest (Iron) */
const RANKS_DESC = [...RANK_THRESHOLDS].reverse();

export const RankRequirementsModal: React.FC<RankRequirementsModalProps> = ({ isOpen, onClose, themeMode }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl animate-in zoom-in duration-200 flex flex-col"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-xl font-display font-bold text-white">Rank Requirements</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RANKS_DESC.map((rankThreshold, index) => {
            const level = rankThreshold.level ?? (RANK_THRESHOLDS.length - index);
            const maxDisplay = rankThreshold.max === Infinity ? '2000+' : rankThreshold.max;
            const minDisplay = rankThreshold.min === 0 ? '0' : rankThreshold.min;

            // Se for Top 3 (L10), mostrar apenas '2000+ pts'
            const isTop3 = level === 10 && rankThreshold.name.toLowerCase().includes('top');

            return (
              <div
                key={`${rankThreshold.name}-${level}`}
                className={`p-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-white/5 hover:bg-white/10'
                    : 'bg-black/5 hover:bg-black/10'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-white text-xs flex-shrink-0"
                  style={{
                    backgroundColor: `${rankThreshold.color}20`,
                    borderColor: rankThreshold.color,
                    color: rankThreshold.color
                  }}
                >
                  {level}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-sm truncate">
                    {rankThreshold.name} {level === 10 ? '(L10)' : ''}
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    {isTop3 ? '2000+ pts' : `${minDisplay} – ${maxDisplay} pts`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex-shrink-0">
          <p className="text-[10px] text-zinc-400 text-center leading-tight">
            Points from match results. Winstreaks add bonus. Top 3 = top 3 players by MMR only.
          </p>
        </div>
      </Card>
    </div>
  );

  return createPortal(modal, document.body);
};

export default RankRequirementsModal;
