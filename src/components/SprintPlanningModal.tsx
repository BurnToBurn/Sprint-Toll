import React, { useState, useMemo } from 'react';
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
  TrendingUp,
  X,
  Plus
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
}

const POINT_BADGES: Record<StoryPoint, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-[#EF4444]', text: 'text-white', border: 'border-[#B91C1C]' },
  2: { bg: 'bg-[#3B82F6]', text: 'text-white', border: 'border-[#1D4ED8]' },
  3: { bg: 'bg-[#10B981]', text: 'text-white', border: 'border-[#047857]' },
  5: { bg: 'bg-[#F59E0B]', text: 'text-white', border: 'border-[#B45309]' },
  8: { bg: 'bg-[#8B5CF6]', text: 'text-white', border: 'border-[#6D28D9]' },
  13: { bg: 'bg-[#EC4899]', text: 'text-white', border: 'border-[#BE185D]' },
  21: { bg: 'bg-[#E11D48]', text: 'text-white', border: 'border-[#9F1239]' }
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
  onAddStory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    backlogItems.forEach((item) => set.add(item.category));
    return ['all', ...Array.from(set)];
  }, [backlogItems]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return backlogItems;
    if (selectedCategory === 'carryovers') return backlogItems.filter((i) => i.isCarryover);
    return backlogItems.filter((i) => i.category === selectedCategory);
  }, [backlogItems, selectedCategory]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#1E222A] border-[3px] border-[#384050] rounded-3xl shadow-[0_12px_0_#0F1216] flex flex-col max-h-[92vh] overflow-hidden text-[#F4F6F9]">
        {/* Rivets */}
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#242933] border-b-[3px] border-[#384050] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#384050] text-[#FFD200]">
                  Sprint Planning Phase
                </span>
                <span className="text-xs text-slate-400">Day #{dayNumber}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Backlog Commitment & Parking Lot Staging
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capacity Telemetry & Agile Coach Banner */}
        <div className="p-6 bg-[#2B303C] border-b-[3px] border-[#384050] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Ferry Dock Target */}
            <div className="p-3.5 bg-[#1E222A] border-2 border-[#384050] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Ferry Capacity Target
                </span>
                <div className="text-2xl font-black font-mono text-[#48A2D8] mt-0.5">
                  {ferryCapacity} <span className="text-xs text-slate-400 font-sans font-bold">pts</span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#48A2D8]/20 border border-[#48A2D8]/40 text-[#48A2D8] text-xs font-mono font-bold">
                Daily Limit
              </div>
            </div>

            {/* Committed to Parking Lot */}
            <div className="p-3.5 bg-[#1E222A] border-2 border-[#384050] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Committed to Parking Lot
                </span>
                <div className="text-2xl font-black font-mono text-[#FFD200] mt-0.5">
                  {committedPoints} <span className="text-xs text-slate-400 font-sans font-bold">pts</span>
                  <span className="text-xs text-slate-400 font-normal ml-2">({committedItems.length} items)</span>
                </div>
              </div>
              <div
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${
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
            <div className="p-3.5 bg-[#1E222A] border-2 border-[#384050] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Toll Concurrency
                </span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">
                  {activeBoothsCount} <span className="text-xs text-slate-400 font-sans font-bold">Lanes</span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                WIP Safe
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FFD200]" />
                Sprint Commitment vs Ferry Capacity
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
            <div className="h-3 w-full bg-[#1E222A] rounded-full overflow-hidden border border-[#384050] p-0.5">
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

          {/* Agile Coach Banner */}
          <div className="flex items-start gap-3 p-3 bg-[#1E222A]/80 border border-[#384050] rounded-xl text-xs text-slate-300">
            <div className="p-1 rounded bg-[#FFD200] text-[#1E222A] font-black shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <strong className="text-white font-black">Agile Coach Insight:</strong>{' '}
              {committedPoints > ferryCapacity ? (
                <span className="text-[#EF4444] font-bold">
                  Overcommitting! Squeezing {committedPoints} points into a {ferryCapacity} point dock causes Little&apos;s Law queue congestion and leaves tickets stranded at 05:00 PM. Deselect or slice epics!
                </span>
              ) : committedPoints >= ferryCapacity * 0.8 ? (
                <span className="text-emerald-400">
                  Optimal Sprint batch! Committing ~80-95% capacity allows your toll squads to maintain crisp cycle times while ensuring the ferry departs full.
                </span>
              ) : (
                <span>
                  Under capacity ({committedPoints}/{ferryCapacity} pts). You have plenty of dock room to pull more valuable stories into the Parking Lot staging area!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Backlog Filters & Action Controls */}
        <div className="px-6 py-3 bg-[#242933] border-b border-[#384050] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-[#FFD200] text-[#1E222A] border-[#FFD200]'
                    : 'bg-[#1E222A] text-slate-300 border-[#384050] hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Backlog' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {onAddStory && (
              <button
                onClick={() => {
                  sound.playClick();
                  onAddStory(5);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs transition-all flex items-center gap-1.5 border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
                title="Add a new 5-point feature story to the backlog and sprint commitment"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 5-pt Story</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onAutoSelect();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#48A2D8] hover:bg-[#3b8ebd] text-[#1E222A] font-black text-xs transition-all flex items-center gap-1.5 border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] cursor-pointer"
              title="Automatically pre-select an optimal balanced batch fitting ferry capacity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Select Batch</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onSelectAll();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 cursor-pointer"
            >
              Select All
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClearAll();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs border border-slate-600 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Backlog Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 max-h-[380px]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-sm">
              No backlog items found for this category.
            </div>
          ) : (
            filteredItems.map((item) => {
              const badge = POINT_BADGES[item.points] || POINT_BADGES[1];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    onToggleItem(item.id);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.selected
                      ? 'bg-[#2A3342] border-[#48A2D8] shadow-[0_4px_0_#1E222A]'
                      : 'bg-[#1E222A] border-[#384050] opacity-80 hover:opacity-100 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      className="mt-0.5 sm:mt-0 text-[#FFD200] shrink-0"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-5 h-5 text-[#48A2D8]" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-400">
                          {item.id}
                        </span>

                        {item.isCarryover && (
                          <span className="px-2 py-0.5 rounded-md bg-[#EF4444] text-white font-black text-[10px] uppercase tracking-wider animate-pulse">
                            Yesterday&apos;s Carryover
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-[10px] uppercase border border-slate-700">
                          {item.category}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
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

                      <div className="font-bold text-white text-sm sm:text-base leading-tight">
                        {item.title}
                      </div>

                      {item.description && (
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {/* Story Points Badge */}
                    <div
                      className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm flex items-center gap-1.5 border-2 ${badge.bg} ${badge.text} ${badge.border} shadow-[0_2px_0_rgba(0,0,0,0.3)]`}
                    >
                      <span>{item.points}</span>
                      <span className="text-[10px] uppercase font-sans font-bold">pts</span>
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
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-[#FFD200] hover:text-[#1E222A] text-slate-300 border border-slate-600 transition-colors cursor-pointer"
                        title="Slice this larger story into smaller tickets (Agile decomposition)"
                      >
                        <Scissors className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Action CTA */}
        <div className="px-6 py-4 bg-[#242933] border-t-[3px] border-[#384050] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <div>
              <span className="font-bold text-white">
                {committedItems.length} Stories Pre-Selected
              </span>{' '}
              ({committedPoints} Story Points staged for Toll Plaza Parking Lot)
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs sm:text-sm border border-slate-600 cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                sound.playSprintCommit();
                onCommitSprint();
              }}
              disabled={committedItems.length === 0}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-[3px] border-[#1E222A] shadow-[0_4px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer ${
                committedItems.length === 0
                  ? 'bg-slate-700 text-slate-400 border-slate-800 cursor-not-allowed opacity-50'
                  : 'bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A]'
              }`}
            >
              <span>🚀 Commit Sprint & Open Roadway</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
