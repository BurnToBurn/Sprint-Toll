import React, { useState, useMemo } from 'react';
import {
  VehicleStory,
  TollBooth,
  FerryDock,
  FlowMetrics,
  StoryPoint
} from '../types/game';
import {
  Layers,
  Zap,
  Ship,
  Clock,
  AlertTriangle,
  Scissors,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ChevronRight,
  ShieldAlert,
  Info,
  ClipboardList
} from 'lucide-react';
import { FlowEfficiencyViolationModal } from './FlowEfficiencyViolationModal';

interface KanbanBoardTabProps {
  vehicles: VehicleStory[];
  booths: TollBooth[];
  ferry: FerryDock;
  metrics: FlowMetrics;
  funds?: number;
  onSelectVehicle: (vehicle: VehicleStory) => void;
  onSliceStory: (vehicleId: string) => void;
  onSetLaneWipLimit: (boothId: number, limit: number) => void;
  onLaunchFerry: () => void;
  onSpawnStory?: (points?: StoryPoint) => void;
  onSelectBooth: (boothId: number) => void;
  onUpgradeEfficiency?: (boothId: number) => void;
  onUpgradeAutomation?: (boothId: number) => void;
  onOpenSprintPlanning?: () => void;
}

export const KanbanBoardTab: React.FC<KanbanBoardTabProps> = ({
  vehicles,
  booths,
  ferry,
  metrics,
  funds = 0,
  onSelectVehicle,
  onSliceStory,
  onSetLaneWipLimit,
  onLaunchFerry,
  onSpawnStory: _onSpawnStory,
  onSelectBooth,
  onUpgradeEfficiency,
  onUpgradeAutomation,
  onOpenSprintPlanning
}) => {
  const [sizeFilter, setSizeFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [selectedLaneFilter, setSelectedLaneFilter] = useState<number | 'all'>('all');
  const [selectedViolationBooth, setSelectedViolationBooth] = useState<TollBooth | null>(null);

  const unlockedBooths = useMemo(() => booths.filter((b) => b.unlocked), [booths]);

  // Categorize vehicles into Kanban columns:
  // 1. To Do: Approaching the toll plaza (on feeder road or fanning out)
  // 2. In Progress: In toll plaza queues, being processed at booths, or en route to the ferry dock
  // 3. Done: Boarded onto the ferry dock
  const { todoVehicles, inProgressVehicles, doneVehicles } = useMemo(() => {
    const todo: VehicleStory[] = [];
    const inProgress: VehicleStory[] = [];
    const done: VehicleStory[] = [...ferry.vehiclesOnBoard];

    vehicles.forEach((v) => {
      if (v.state === 'approaching' || v.state === 'staged') {
        todo.push(v);
      } else if (v.state === 'queued' || v.state === 'processing' || v.state === 'to_dock') {
        inProgress.push(v);
      } else if (v.state === 'on_ferry') {
        // Only push if not already in ferry.vehiclesOnBoard
        if (!done.some((d) => d.id === v.id)) {
          done.push(v);
        }
      }
    });

    return {
      todoVehicles: todo,
      inProgressVehicles: inProgress,
      doneVehicles: done
    };
  }, [vehicles, ferry.vehiclesOnBoard]);

  // Apply size filter
  const filterByStorySize = (items: VehicleStory[]) => {
    if (sizeFilter === 'all') return items;
    if (sizeFilter === 'small') return items.filter((v) => v.points <= 3);
    if (sizeFilter === 'medium') return items.filter((v) => v.points === 5 || v.points === 8);
    if (sizeFilter === 'large') return items.filter((v) => v.points >= 13);
    return items;
  };

  const filteredTodo = filterByStorySize(todoVehicles);
  const filteredDone = filterByStorySize(doneVehicles);

  // Group In-Progress items by booth lane
  const inProgressByLane = useMemo(() => {
    const map: Record<number, VehicleStory[]> = {};
    unlockedBooths.forEach((b) => {
      map[b.id] = [];
    });

    inProgressVehicles.forEach((v) => {
      if (map[v.laneIndex]) {
        map[v.laneIndex].push(v);
      }
    });

    // Sort each lane: processing first, then queued by position, then to_dock
    Object.keys(map).forEach((k) => {
      const laneId = Number(k);
      map[laneId].sort((a, b) => {
        const order: Record<string, number> = { processing: 0, queued: 1, to_dock: 2, approaching: 3, staged: 4, on_ferry: 5, departed: 6 };
        const stateDiff = (order[a.state] ?? 99) - (order[b.state] ?? 99);
        if (stateDiff !== 0) return stateDiff;
        return a.laneQueuePosition - b.laneQueuePosition;
      });
    });

    return map;
  }, [unlockedBooths, inProgressVehicles]);

  // Aggregate points
  const todoPoints = filteredTodo.reduce((sum, v) => sum + v.points, 0);
  const inProgressPoints = inProgressVehicles.reduce((sum, v) => sum + v.points, 0);
  const donePoints = filteredDone.reduce((sum, v) => sum + v.points, 0);

  // Total WIP across all active lanes
  const totalWipCount = inProgressVehicles.length;
  const totalWipLimit = unlockedBooths.reduce((sum, b) => sum + b.wipLimit, 0);
  const isSystemWipOverloaded = totalWipCount > totalWipLimit;

  // Ferry capacity calculations
  const isFerryFull = ferry.currentPoints >= ferry.capacity;
  const ferryFillPercent = Math.min(100, Math.round((ferry.currentPoints / ferry.capacity) * 100));

  return (
    <div className="space-y-6">
      {/* Header & Kanban Telemetry Ribbon with Corner Rivets */}
      <div className="bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 shadow-[0_8px_0_#1E222A] text-[#1E222A] space-y-5 relative">
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] text-xs font-mono font-black uppercase tracking-wider shadow-[0_2px_0_#1E222A]">
                Visual Flow Control
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">·</span>
              <span className="text-xs text-slate-600 font-mono font-black">Day #{ferry.dayNumber} Sprint</span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-black text-[#1E222A] tracking-tight mt-1.5 flex items-center gap-2 flex-wrap"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>Kanban Work-In-Progress Board</span>
              <span className="text-sm font-bold text-slate-600 font-mono bg-white px-2.5 py-0.5 rounded-xl border-2 border-[#1E222A]">
                {totalWipCount} active WIP items · {inProgressPoints} pts
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1 max-w-2xl">
              Inspect user stories moving across each lifecycle stage: Backlog Intake &rarr; Lane Processing &rarr; Ferry Vessel Delivery. Manage lane WIP limits to prevent bottlenecks.
            </p>
          </div>

          {/* Quick Filter & Spawner Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#1E222A] border-2 border-[#1E222A] p-1 rounded-2xl text-xs shadow-inner">
              <Filter className="w-3.5 h-3.5 text-slate-300 ml-2 mr-0.5" />
              {(['all', 'small', 'medium', 'large'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSizeFilter(filter)}
                  className={`px-3 py-1 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                    sizeFilter === filter
                      ? 'bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {onOpenSprintPlanning && (
              <button
                onClick={onOpenSprintPlanning}
                className="px-3.5 py-2 rounded-2xl bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
                style={{ fontFamily: 'var(--font-heading)' }}
                title="Open Sprint Planning to stage user stories"
              >
                <ClipboardList className="w-4 h-4 text-[#1E222A]" />
                <span>Plan Sprint</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Indicator Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t-2 border-[#1E222A]/15">
          <div className="bg-white border-2 border-[#1E222A] px-4 py-3 rounded-2xl shadow-[0_3px_0_#1E222A]">
            <div className="text-[11px] text-slate-500 font-black uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
              Total Backlog (To Do)
            </div>
            <div className="text-lg font-black font-mono text-[#1E222A] mt-1 flex items-baseline gap-1.5">
              <span>{filteredTodo.length} cards</span>
              <span className="text-xs font-bold text-slate-500">({todoPoints} pts)</span>
            </div>
          </div>

          <div className={`px-4 py-3 rounded-2xl border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] ${
            isSystemWipOverloaded
              ? 'bg-[#D92525]/10 text-[#D92525]'
              : 'bg-white text-[#1E222A]'
          }`}>
            <div className="text-[11px] font-black uppercase tracking-wider flex items-center justify-between text-slate-500" style={{ fontFamily: 'var(--font-heading)' }}>
              <span>System WIP</span>
              <span className="font-mono text-[10px] bg-[#1E222A] text-white px-1.5 py-0.5 rounded-md">Cap: {totalWipLimit}</span>
            </div>
            <div className="text-lg font-black font-mono mt-1 flex items-baseline gap-1.5">
              <span className={isSystemWipOverloaded ? 'text-[#D92525]' : 'text-[#E85D04]'}>
                {totalWipCount} / {totalWipLimit}
              </span>
              <span className="text-xs font-bold text-slate-500">({inProgressPoints} pts)</span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#1E222A] px-4 py-3 rounded-2xl shadow-[0_3px_0_#1E222A]">
            <div className="text-[11px] text-slate-500 font-black uppercase tracking-wider flex items-center justify-between" style={{ fontFamily: 'var(--font-heading)' }}>
              <span>Ferry Cargo (Done)</span>
              <span className="font-mono text-[10px] bg-[#FFD200] text-[#1E222A] px-1.5 py-0.5 rounded-md border border-[#1E222A]">{ferryFillPercent}%</span>
            </div>
            <div className="text-lg font-black font-mono text-[#10b981] mt-1 flex items-baseline gap-1.5">
              <span>{ferry.currentPoints} / {ferry.capacity} pts</span>
              <span className="text-xs font-bold text-slate-500">({filteredDone.length} loaded)</span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#1E222A] px-4 py-3 rounded-2xl shadow-[0_3px_0_#1E222A]">
            <div className="text-[11px] text-slate-500 font-black uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
              Throughput Velocity
            </div>
            <div className="text-lg font-black font-mono text-[#48A2D8] mt-1 flex items-baseline gap-1.5">
              <span>{metrics.throughputPerMinute} pts/min</span>
              <span className="text-xs font-bold text-slate-500">(~{metrics.averageCycleTime}s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board Grid: 3 Major Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMN 1: TO DO (BACKLOG) */}
        <div className="lg:col-span-3 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl flex flex-col shadow-[0_6px_0_#1E222A] overflow-hidden">
          {/* Column Header */}
          <div className="p-4 border-b-[3px] border-[#1E222A] bg-[#48A2D8] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FFD200] border border-[#1E222A]" />
              <h3 className="font-black text-sm text-white flex items-center gap-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                <Layers className="w-4 h-4 text-[#FFD200]" />
                <span>To Do (Backlog)</span>
              </h3>
            </div>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-xl bg-white text-[#1E222A] font-black border-2 border-[#1E222A]">
              {filteredTodo.length} ({todoPoints} pts)
            </span>
          </div>

          {/* Sub-header description */}
          <div className="px-4 py-2 bg-white/60 text-[11px] font-bold text-slate-600 border-b-2 border-[#1E222A]/15 flex items-center justify-between">
            <span>Incoming port backlog</span>
            <span className="text-slate-500 font-mono">Feeder Road</span>
          </div>

          {/* Card List */}
          <div className="p-3.5 space-y-3 max-h-[640px] overflow-y-auto custom-scrollbar">
            {filteredTodo.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500 text-xs">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="font-bold">No stories waiting in backlog.</p>
                {onOpenSprintPlanning && (
                  <button
                    onClick={onOpenSprintPlanning}
                    className="mt-3 px-4 py-1.5 text-xs font-black text-[#1E222A] bg-[#FFD200] hover:bg-[#FFE043] rounded-xl border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] transition-all cursor-pointer inline-flex items-center gap-1.5"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-[#1E222A]" />
                    <span>Plan Sprint</span>
                  </button>
                )}
              </div>
            ) : (
              filteredTodo.map((v) => (
                <KanbanCard
                  key={v.id}
                  vehicle={v}
                  onSelectVehicle={onSelectVehicle}
                  onSliceStory={onSliceStory}
                  assignedLaneName={
                    v.laneIndex >= 0 ? booths.find((b) => b.id === v.laneIndex)?.name : undefined
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PROGRESS (TOLL LANES & ACTIVE WIP) */}
        <div className="lg:col-span-6 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl flex flex-col shadow-[0_6px_0_#1E222A] overflow-hidden">
          {/* Column Header */}
          <div className="p-4 border-b-[3px] border-[#1E222A] bg-[#FFD200] text-[#1E222A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E85D04] border border-[#1E222A] animate-pulse" />
              <h3 className="font-black text-sm text-[#1E222A] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                <Zap className="w-4 h-4 text-[#E85D04]" />
                <span>In Progress (Toll Plaza Lanes)</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-xs px-2.5 py-0.5 rounded-xl font-black border-2 border-[#1E222A] ${
                isSystemWipOverloaded
                  ? 'bg-[#D92525] text-white'
                  : 'bg-white text-[#1E222A]'
              }`}>
                {totalWipCount} / {totalWipLimit} WIP ({inProgressPoints} pts)
              </span>
            </div>
          </div>

          {/* Sub-header description */}
          <div className="px-4 py-2 bg-white/60 text-[11px] font-bold text-slate-600 border-b-2 border-[#1E222A]/15 flex items-center justify-between">
            <span>Active booths &amp; queue lanes</span>
            <span className="text-[#E85D04] font-black flex items-center gap-1">
              <Info className="w-3 h-3" />
              Adjust lane WIP limits below
            </span>
          </div>

          {/* Active Bottleneck Warning Callout in In-Progress Header */}
          {metrics.bottleneckLaneIndex !== undefined && (
            (() => {
              const bBooth = unlockedBooths.find((b) => b.id === metrics.bottleneckLaneIndex);
              const bCards = bBooth ? inProgressByLane[bBooth.id] || [] : [];
              if (!bBooth || bCards.length < 2) return null;
              return (
                <div className="mx-3.5 mt-3 p-3 rounded-2xl bg-[#D92525] border-2 border-[#1E222A] flex items-center justify-between gap-2 text-xs text-white shadow-[0_3px_0_#1E222A]">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldAlert className="w-4 h-4 text-[#FFD200] shrink-0" />
                    <span className="truncate text-[11px] font-semibold">
                      <strong className="text-[#FFD200]">Flow Bottleneck:</strong> {bBooth.name} ({bCards.length} queued) violates Flow Efficiency principles!
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedViolationBooth(bBooth)}
                    className="px-2.5 py-1 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-[11px] shrink-0 cursor-pointer border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] transition-all flex items-center gap-1"
                  >
                    <span>Inspect Flow</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })()
          )}

          {/* Lane Swimlanes */}
          <div className="p-3.5 space-y-4 max-h-[640px] overflow-y-auto custom-scrollbar">
            {unlockedBooths.map((booth) => {
              const laneCards = inProgressByLane[booth.id] || [];
              const filteredLaneCards = filterByStorySize(laneCards);
              const laneWipCount = laneCards.length;
              const isBottleneck = booth.id === metrics.bottleneckLaneIndex && laneWipCount >= 2;
              const isWipExceeded = laneWipCount > booth.wipLimit;
              const lanePoints = laneCards.reduce((sum, v) => sum + v.points, 0);

              return (
                <div
                  key={booth.id}
                  className={`rounded-2xl border-2 transition-all shadow-[0_3px_0_#1E222A] ${
                    isWipExceeded || isBottleneck
                      ? 'bg-rose-50 border-[#D92525]'
                      : 'bg-white border-[#1E222A]'
                  }`}
                >
                  {/* Lane Header with WIP Stepper */}
                  <div className="p-3 border-b-2 border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectBooth(booth.id)}
                        className="font-black text-xs sm:text-sm text-[#1E222A] hover:text-[#48A2D8] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Click to view booth in simulation"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        <span>{booth.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-lg bg-[#FFD200] border border-[#1E222A] text-[#1E222A]">
                        x{booth.multiplier.toFixed(2)}
                      </span>
                      {isBottleneck && (
                        <button
                          onClick={() => setSelectedViolationBooth(booth)}
                          className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#D92525] border border-[#1E222A] text-white flex items-center gap-1 cursor-pointer"
                          title="Click to inspect Flow Efficiency violation explanation"
                        >
                          <AlertTriangle className="w-3 h-3 text-[#FFD200]" />
                          <span>Bottleneck</span>
                        </button>
                      )}
                      {isWipExceeded && (
                        <button
                          onClick={() => setSelectedViolationBooth(booth)}
                          className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#E85D04] border border-[#1E222A] text-white flex items-center gap-1 cursor-pointer"
                          title="Click to inspect Flow Efficiency violation explanation"
                        >
                          <ShieldAlert className="w-3 h-3 text-white" />
                          <span>WIP Exceeded!</span>
                        </button>
                      )}
                    </div>

                    {/* WIP Limit Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[11px] text-slate-500 font-mono font-bold">WIP:</span>
                        <span
                          className={`font-mono font-black ${
                            isWipExceeded ? 'text-[#D92525]' : 'text-[#1E222A]'
                          }`}
                        >
                          {laneWipCount} / {booth.wipLimit}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          ({lanePoints} pts)
                        </span>
                      </div>

                      <div className="flex items-center border-2 border-[#1E222A] rounded-xl bg-white overflow-hidden shadow-[0_2px_0_#1E222A]">
                        <button
                          onClick={() => onSetLaneWipLimit(booth.id, Math.max(1, booth.wipLimit - 1))}
                          className="px-2 py-0.5 text-xs text-[#1E222A] hover:bg-slate-100 font-black transition-colors cursor-pointer"
                          title="Decrease lane WIP limit"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono text-[#1E222A] font-black bg-slate-100">
                          {booth.wipLimit}
                        </span>
                        <button
                          onClick={() => onSetLaneWipLimit(booth.id, Math.min(10, booth.wipLimit + 1))}
                          className="px-2 py-0.5 text-xs text-[#1E222A] hover:bg-slate-100 font-black transition-colors cursor-pointer"
                          title="Increase lane WIP limit"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Processing Vehicle Status Bar (if any) */}
                  {booth.isProcessing && booth.currentVehicleId && (
                    <div className="px-3 py-1.5 bg-[#48A2D8]/10 border-b border-[#48A2D8]/20 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-[#48A2D8] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#48A2D8] animate-ping" />
                        <span>Processing story at toll barrier</span>
                      </div>
                      <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden border border-[#1E222A]/20">
                        <div
                          className="h-full bg-[#48A2D8] transition-all duration-100"
                          style={{ width: `${booth.processingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Lane Cards */}
                  <div className="p-2.5 space-y-2.5">
                    {filteredLaneCards.length === 0 ? (
                      <div className="py-4 text-center text-slate-400 font-bold text-xs">
                        Lane idle. Ready for incoming stories.
                      </div>
                    ) : (
                      filteredLaneCards.map((v) => (
                        <KanbanCard
                          key={v.id}
                          vehicle={v}
                          onSelectVehicle={onSelectVehicle}
                          onSliceStory={onSliceStory}
                          isProcessingAtBooth={v.id === booth.currentVehicleId && booth.isProcessing}
                          processingProgress={
                            v.id === booth.currentVehicleId ? booth.processingProgress : undefined
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: DONE (DELIVERED ON FERRY) */}
        <div className="lg:col-span-3 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl flex flex-col shadow-[0_6px_0_#1E222A] overflow-hidden">
          {/* Column Header */}
          <div className="p-4 border-b-[3px] border-[#1E222A] bg-[#10b981] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FFD200] border border-[#1E222A]" />
              <h3 className="font-black text-sm text-white flex items-center gap-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                <Ship className="w-4 h-4 text-[#FFD200]" />
                <span>Done (On Ferry)</span>
              </h3>
            </div>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-xl bg-white text-[#1E222A] font-black border-2 border-[#1E222A]">
              {filteredDone.length} ({ferry.currentPoints} pts)
            </span>
          </div>

          {/* Ferry Capacity & Cast-off HUD */}
          <div className="p-4 bg-white border-b-2 border-[#1E222A]/15 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-600">Vessel Hold:</span>
              <span className="font-black text-[#10b981]">
                {ferry.currentPoints} / {ferry.capacity} pts ({ferryFillPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden border-2 border-[#1E222A] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFerryFull ? 'bg-[#D92525]' : 'bg-[#10b981]'
                }`}
                style={{ width: `${ferryFillPercent}%` }}
              />
            </div>

            <button
              onClick={() => onLaunchFerry()}
              disabled={ferry.currentPoints === 0 || ferry.state !== 'boarding'}
              className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border-2 border-[#1E222A] ${
                ferry.currentPoints > 0 && ferry.state === 'boarding'
                  ? 'bg-[#10b981] hover:bg-[#12cb8e] text-white cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none'
                  : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Ship className="w-4 h-4" />
              <span>
                {ferry.state === 'boarding'
                  ? isFerryFull
                    ? 'Depart Ferry (Hold Full!)'
                    : 'Cast Off Ferry Early'
                  : 'Ferry In Transit...'}
              </span>
            </button>
          </div>

          {/* Card List */}
          <div className="p-3.5 space-y-3 max-h-[640px] overflow-y-auto custom-scrollbar">
            {filteredDone.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                <p className="font-bold">No user stories boarded yet for Day #{ferry.dayNumber}.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Stories processed at toll booths will board here.
                </p>
              </div>
            ) : (
              filteredDone.map((v) => (
                <KanbanCard
                  key={v.id}
                  vehicle={v}
                  onSelectVehicle={onSelectVehicle}
                  isDone
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Flow Efficiency Principle Violation Educational Modal */}
      {selectedViolationBooth && (
        <FlowEfficiencyViolationModal
          booth={selectedViolationBooth}
          laneVehicles={vehicles}
          metrics={metrics}
          funds={funds}
          onClose={() => setSelectedViolationBooth(null)}
          onSliceStory={onSliceStory}
          onUpgradeEfficiency={onUpgradeEfficiency}
          onUpgradeAutomation={onUpgradeAutomation}
          onSetWipLimit={onSetLaneWipLimit}
        />
      )}
    </div>
  );
};

// Reusable Kanban Story Card Component
interface KanbanCardProps {
  vehicle: VehicleStory;
  onSelectVehicle: (v: VehicleStory) => void;
  onSliceStory?: (id: string) => void;
  assignedLaneName?: string;
  isProcessingAtBooth?: boolean;
  processingProgress?: number;
  isDone?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  vehicle,
  onSelectVehicle,
  onSliceStory,
  assignedLaneName,
  isProcessingAtBooth,
  processingProgress,
  isDone
}) => {
  const canSlice = vehicle.points >= 3 && !isDone && onSliceStory;

  const getStatusBadge = () => {
    if (isDone) {
      return { text: 'Delivered', bg: 'bg-[#10b981] text-white border-[#1E222A]' };
    }
    if (isProcessingAtBooth) {
      return { text: 'Processing', bg: 'bg-[#48A2D8] text-white border-[#1E222A] animate-pulse' };
    }
    if (vehicle.state === 'to_dock') {
      return { text: 'To Ramp', bg: 'bg-[#48A2D8]/20 text-[#1E222A] border-[#1E222A]' };
    }
    if (vehicle.state === 'queued') {
      return { text: `Queue #${vehicle.laneQueuePosition + 1}`, bg: 'bg-[#FFD200] text-[#1E222A] border-[#1E222A]' };
    }
    return { text: 'Approaching', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
  };

  const status = getStatusBadge();

  return (
    <div
      onClick={() => onSelectVehicle(vehicle)}
      className="bg-white border-2 border-[#1E222A] hover:border-black p-3 rounded-2xl shadow-[0_3px_0_#1E222A] hover:shadow-[0_5px_0_#1E222A] hover:-translate-y-0.5 transition-all text-[#1E222A] cursor-pointer group space-y-2 relative"
    >
      {/* Top Header with Points & Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Story Points Circle */}
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-black text-white shadow-sm shrink-0 border border-[#1E222A]"
            style={{ backgroundColor: vehicle.color }}
          >
            {vehicle.points}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-black">
            {vehicle.type}
          </span>
        </div>

        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-black ${status.bg}`}
        >
          {status.text}
        </span>
      </div>

      {/* Story Title */}
      <h4 className="text-xs font-black text-[#1E222A] line-clamp-2 transition-colors">
        {vehicle.title}
      </h4>

      {/* Real-time processing progress bar */}
      {isProcessingAtBooth && processingProgress !== undefined && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#48A2D8] font-bold">
            <span>Processing...</span>
            <span>{Math.round(processingProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-[#1E222A]/30">
            <div
              className="h-full bg-[#48A2D8] transition-all duration-75"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Meta & Actions */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-mono font-bold">
        <div className="flex items-center gap-1.5">
          <span className="text-[#10b981] font-black">${vehicle.tollValue}</span>
          <span className="text-slate-300">·</span>
          <span>{vehicle.baseProcessingTime}s</span>
          {assignedLaneName && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 text-[10px] truncate max-w-[80px] font-semibold">
                {assignedLaneName}
              </span>
            </>
          )}
        </div>

        {/* Slice Story affordance */}
        {canSlice && onSliceStory && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSliceStory(vehicle.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer active:translate-y-0.5 active:shadow-none"
            title="Slice large story into smaller story cards"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Scissors className="w-3 h-3 text-[#E85D04]" />
            <span>Slice</span>
          </button>
        )}
      </div>
    </div>
  );
};
