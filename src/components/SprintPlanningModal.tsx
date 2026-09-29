import React, { useMemo } from 'react';
import {
  BacklogItem,
  FerryDock,
  StoryPoint,
  TollBooth
} from '../types/game';
import {
  CheckSquare,
  Square,
  Sparkles,
  Scissors,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SprintPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  ferry: FerryDock;
  booths: TollBooth[];
  backlogItems: BacklogItem[];
  onToggleItem: (id: string) => void;
  onAutoSelect: () => void;
  onSliceItem: (id: string) => void;
  onCommitSprint: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onAddStory?: (points: StoryPoint) => void;
  onRemoveItem?: (id: string) => void;
}

const STORY_POINTS: StoryPoint[] = [1, 2, 3, 5, 8, 13, 21];

const POINT_BADGES: Record<StoryPoint, { bg: string; text: string; border: string; hover: string }> = {
  1: { bg: 'bg-[#EF4444]', text: 'text-white', border: 'border-[#B91C1C]', hover: 'hover:bg-[#DC2626]' },
  2: { bg: 'bg-[#3B82F6]', text: 'text-white', border: 'border-[#1D4ED8]', hover: 'hover:bg-[#2563EB]' },
  3: { bg: 'bg-[#10B981]', text: 'text-white', border: 'border-[#047857]', hover: 'hover:bg-[#059669]' },
  5: { bg: 'bg-[#F59E0B]', text: 'text-white', border: 'border-[#B45309]', hover: 'hover:bg-[#D97706]' },
  8: { bg: 'bg-[#8B5CF6]', text: 'text-white', border: 'border-[#6D28D9]', hover: 'hover:bg-[#7C3AED]' },
  13: { bg: 'bg-[#EC4899]', text: 'text-white', border: 'border-[#BE185D]', hover: 'hover:bg-[#DB2777]' },
  21: { bg: 'bg-[#E11D48]', text: 'text-white', border: 'border-[#9F1239]', hover: 'hover:bg-[#BE123C]' }
};

export const SprintPlanningModal: React.FC<SprintPlanningModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  ferry,
  booths,
  backlogItems,
  onToggleItem,
  onAutoSelect,
  onSliceItem,
  onCommitSprint,
  onSelectAll,
  onClearAll,
  onAddStory,
  onRemoveItem
}) => {
  const committedItems = useMemo(() => backlogItems.filter((i) => i.selected), [backlogItems]);
  const committedPoints = useMemo(
    () => committedItems.reduce((sum, i) => sum + i.points, 0),
    [committedItems]
  );
  const ferryCapacity = ferry.capacity;
  const capacityPercent = Math.round((committedPoints / ferryCapacity) * 100);

  const activeBoothsCount = booths.filter((b) => b.unlocked).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#1E222A] border-[3px] border-[#384050] rounded-3xl shadow-[0_12px_0_#0F1216] flex flex-col max-h-[94vh] overflow-hidden text-[#F4F6F9]">
        {/* Rivets */}
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Modal Header */}
        <div className="px-4 py-2 bg-[#242933] border-b-[2.5px] border-[#384050] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#384050] text-[#FFD200]">
                  Parking Lot Staging
                </span>
                <span className="text-[10px] text-slate-400">Day #{dayNumber}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Parking Lot Staging
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Capacity Telemetry & Progress Bar (No Coaching Tip) */}
        <div className="p-2.5 sm:p-3 bg-[#2B303C] border-b-[2.5px] border-[#384050] space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Ferry Dock Target */}
            <div className="p-2 bg-[#1E222A] border-2 border-[#384050] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Ferry Capacity Target
                </span>
                <div className="text-lg font-black font-mono text-[#48A2D8]">
                  {ferryCapacity} <span className="text-[9px] text-slate-400 font-sans font-bold">pts</span>
                </div>
              </div>
              <div className="px-2 py-0.5 rounded-md bg-[#48A2D8]/20 border border-[#48A2D8]/40 text-[#48A2D8] text-[9px] font-mono font-bold">
                Daily Limit
              </div>
            </div>

            {/* Committed to Parking Lot */}
            <div className="p-2 bg-[#1E222A] border-2 border-[#384050] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Committed to Parking Lot
                </span>
                <div className="text-lg font-black font-mono text-[#FFD200]">
                  {committedPoints} <span className="text-[9px] text-slate-400 font-sans font-bold">pts</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1.5">({committedItems.length} items)</span>
                </div>
              </div>
              <div
                className={`px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold ${
                  committedPoints > ferryCapacity
                    ? 'bg-[#D92525]/20 border-[#D92525] text-[#EF4444]'
                    : committedPoints >= ferryCapacity * 0.8
                    ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                    : 'bg-[#FFD200]/20 border-[#FFD200] text-[#FFD200]'
                }`}
              >
                {capacityPercent}% Load
              </div>
            </div>

            {/* Toll Concurrency */}
            <div className="p-2 bg-[#1E222A] border-2 border-[#384050] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Active Toll Concurrency
                </span>
                <div className="text-lg font-black font-mono text-white">
                  {activeBoothsCount} <span className="text-[9px] text-slate-400 font-sans font-bold">Lanes</span>
                </div>
              </div>
              <div className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[9px] font-mono font-bold">
                WIP Safe
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold mb-1">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[#FFD200]" />
                Parking Lot Commitment vs Ferry Capacity
              </span>
              <span
                className={`font-mono font-black ${
                  committedPoints > ferryCapacity
                    ? 'text-[#EF4444]'
                    : committedPoints >= ferryCapacity * 0.8
                    ? 'text-[#10B981]'
                    : 'text-[#FFD200]'
                }`}
              >
                {committedPoints} / {ferryCapacity} pts ({capacityPercent}%)
              </span>
            </div>
            <div className="h-2 w-full bg-[#1E222A] rounded-full overflow-hidden border border-[#384050] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  committedPoints > ferryCapacity
                    ? 'bg-gradient-to-r from-amber-500 to-red-500'
                    : committedPoints >= ferryCapacity * 0.8
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-400'
                }`}
                style={{ width: `${Math.min(100, capacityPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Options to Add Stories of Different Point Values */}
        <div className="px-3 py-2 bg-[#242933] border-b border-[#384050] flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-black text-[#FFD200] uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Plus className="w-3 h-3 text-[#FFD200]" /> Add Story:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {STORY_POINTS.map((pts) => {
                const badge = POINT_BADGES[pts];
                return (
                  <button
                    key={`add-${pts}`}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onAddStory?.(pts);
                    }}
                    className={`px-2 py-0.5 rounded-md font-mono font-black text-[10px] transition-all flex items-center gap-0.5 border cursor-pointer ${badge.bg} ${badge.text} ${badge.border} ${badge.hover} shadow-sm active:scale-95`}
                    title={`Add a new ${pts}-point story to the parking lot staging`}
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{pts} pt</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onAutoSelect();
              }}
              className="px-2 py-0.5 rounded-md bg-[#48A2D8] hover:bg-[#3b8ebd] text-[#1E222A] font-black text-[10px] transition-all flex items-center gap-1 border border-[#1E222A] shadow-sm cursor-pointer"
              title="Automatically pre-select an optimal balanced batch fitting ferry capacity"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Auto Batch</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onSelectAll();
              }}
              className="px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] border border-slate-600 cursor-pointer"
            >
              All
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClearAll();
              }}
              className="px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-[10px] border border-slate-600 cursor-pointer"
            >
              None
            </button>
          </div>
        </div>

        {/* Backlog Items List (Cleaned of Backlog Types & Coaching Tips) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 max-h-[480px]">
          {backlogItems.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-mono text-xs space-y-2">
              <div>Parking Lot staging is empty.</div>
              <div className="text-[11px] text-slate-400">
                Use the <span className="text-[#FFD200] font-bold">+ Add Story</span> options above to create stories of different point values!
              </div>
            </div>
          ) : (
            backlogItems.map((item) => {
              const badge = POINT_BADGES[item.points] || POINT_BADGES[1];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    onToggleItem(item.id);
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    item.selected
                      ? 'bg-[#2A3342] border-[#48A2D8] shadow-[0_2px_0_#1E222A]'
                      : 'bg-[#1E222A] border-[#384050] opacity-80 hover:opacity-100 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-2 min-w-0">
                    <button
                      type="button"
                      className="mt-0.5 sm:mt-0 text-[#FFD200] shrink-0 cursor-pointer"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-4 h-4 text-[#48A2D8]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono font-black text-[10px] text-slate-400">
                          {item.id}
                        </span>

                        {item.isCarryover && (
                          <span className="px-1.5 py-0.2 rounded bg-[#EF4444] text-white font-black text-[8.5px] uppercase tracking-wider animate-pulse">
                            Carryover
                          </span>
                        )}

                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[8.5px] uppercase ${
                            item.priority === 'critical'
                              ? 'bg-red-900/60 text-red-300 border border-red-700'
                              : item.priority === 'high'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>

                      <div className="font-bold text-white text-xs sm:text-sm leading-tight">
                        {item.title}
                      </div>

                      {item.description && (
                        <div className="text-[10px] text-slate-400 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Story Points Badge */}
                    <div
                      className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs flex items-center gap-1 border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <span>{item.points}</span>
                      <span className="text-[8.5px] uppercase font-sans font-bold">pts</span>
                    </div>

                    {/* Toll Value */}
                    <div className="font-mono font-bold text-xs text-emerald-400">
                      +${item.businessValue}
                    </div>

                    {/* Slice Monolith Button */}
                    {item.points >= 3 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playSliceSound();
                          onSliceItem(item.id);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-[#FFD200] hover:text-[#1E222A] text-slate-300 border border-slate-600 transition-colors cursor-pointer"
                        title="Slice this larger story into smaller tickets (Agile decomposition)"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Remove Individual Story Button */}
                    {onRemoveItem && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          onRemoveItem(item.id);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 border border-slate-600 transition-colors cursor-pointer"
                        title="Remove this story from parking lot staging"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Action CTA */}
        <div className="px-4 py-2 bg-[#242933] border-t-[2.5px] border-[#384050] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <div>
              <span className="font-bold text-white">
                {committedItems.length} Stories Pre-Selected
              </span>{' '}
              ({committedPoints} Story Points staged for Parking Lot)
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs border border-slate-600 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                sound.playSprintCommit();
                onCommitSprint();
              }}
              disabled={committedItems.length === 0}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border-[2.5px] border-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer ${
                committedItems.length === 0
                  ? 'bg-slate-700 text-slate-400 border-slate-800 cursor-not-allowed opacity-50'
                  : 'bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A]'
              }`}
            >
              <span>🚀 Stage Parking Lot & Open Roadway</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
