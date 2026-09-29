import React, { useState } from 'react';
import { ActiveScenarioState, ScenarioDefinition } from '../types/scenarios';
import {
  Flag,
  Target,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

interface ScenarioObjectiveHUDProps {
  scenarioState: ActiveScenarioState | null;
  scenarioDef: ScenarioDefinition | null;
  onOpenDetails: () => void;
  onDismissNotification: () => void;
  onAbandonScenario: () => void;
  currentQueueLength: number;
  currentFunds: number;
  currentEfficiency: number;
  unlockedLanesCount: number;
  ezpassTier2Count: number;
}

export const ScenarioObjectiveHUD: React.FC<ScenarioObjectiveHUDProps> = ({
  scenarioState,
  scenarioDef,
  onOpenDetails,
  onDismissNotification,
  onAbandonScenario,
  currentQueueLength,
  currentFunds,
  currentEfficiency,
  unlockedLanesCount,
  ezpassTier2Count
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  if (!scenarioState || !scenarioDef || scenarioState.status !== 'active') {
    return null;
  }

  // Calculate live values for each objective
  const getObjectiveCurrent = (type: string) => {
    switch (type) {
      case 'points_shipped':
        return scenarioState.pointsDelivered;
      case 'epics_sliced':
        return scenarioState.epicsSlicedCount;
      case 'max_queue':
        return currentQueueLength;
      case 'flow_efficiency':
        return currentEfficiency;
      case 'unlocked_lanes':
        return unlockedLanesCount;
      case 'ezpass_tier':
        return ezpassTier2Count;
      case 'zero_stranded_days':
        return scenarioState.consecutiveZeroStrandedDays;
      case 'funds_target':
        return currentFunds;
      default:
        return 0;
    }
  };

  return (
    <div className="w-full bg-[#1E222A] text-white border-[2.5px] border-[#1E222A] rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.3)] overflow-hidden transition-all">
      {/* HUD Header Bar */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-[#2B2F38] via-[#1E222A] to-[#2B2F38] flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FFD200] border border-[#1E222A] flex items-center justify-center text-[#1E222A] font-black shrink-0">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                {scenarioDef.title}
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#66BD29] text-white">
                Active Mission
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-mono">
              Day {scenarioState.currentDay} of {scenarioDef.durationDays} · {scenarioDef.tagline}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDetails}
            className="px-2.5 py-1 text-[11px] font-black bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all cursor-pointer flex items-center gap-1"
          >
            <Target className="w-3 h-3 text-[#FFD200]" />
            Briefing
          </button>

          <button
            onClick={onAbandonScenario}
            className="px-2.5 py-1 text-[11px] font-black bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white rounded-lg border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1"
            title="Leave scenario and return to free play"
          >
            <RotateCcw className="w-3 h-3 text-rose-300" />
            Exit
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isCollapsed ? 'Expand objectives' : 'Collapse objectives'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic Mid-Scenario Event Alert */}
      {scenarioState.activeNotification && (
        <div className="p-3 bg-amber-500/20 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">{scenarioState.activeNotification.title}:</span>{' '}
              <span className="text-slate-200">{scenarioState.activeNotification.message}</span>
            </div>
          </div>
          <button
            onClick={onDismissNotification}
            className="text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Objective Progress Cards (if not collapsed) */}
      {!isCollapsed && (
        <div className="p-3 bg-[#242830] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {scenarioDef.objectives.map((obj) => {
            const current = getObjectiveCurrent(obj.type);
            const isQueueCheck = obj.type === 'max_queue';
            const isCompleted = isQueueCheck ? current < obj.target : current >= obj.target;
            const progressPercent = isQueueCheck
              ? Math.min(100, (current / obj.target) * 100)
              : Math.min(100, (current / obj.target) * 100);

            return (
              <div
                key={obj.id}
                className="p-2.5 rounded-xl bg-[#1E222A] border border-white/10 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold">{obj.label}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isQueueCheck && current >= obj.target - 3 ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      {isQueueCheck ? 'Keep Below' : 'Target'}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between font-mono font-black">
                  <span
                    className={`text-sm ${
                      isQueueCheck
                        ? current >= obj.target
                          ? 'text-rose-400'
                          : current >= obj.target - 4
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-[#FFD200]'
                    }`}
                  >
                    {current} <span className="text-[10px] font-normal text-slate-400">{obj.unit}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    / {obj.target} {obj.unit}
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isQueueCheck
                        ? current >= obj.target
                          ? 'bg-rose-500'
                          : current >= obj.target - 4
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                        : isCompleted
                        ? 'bg-emerald-400'
                        : 'bg-[#FFD200]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
