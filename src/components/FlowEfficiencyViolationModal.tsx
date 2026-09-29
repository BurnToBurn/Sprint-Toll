import React from 'react';
import { TollBooth, VehicleStory, FlowMetrics } from '../types/game';
import {
  AlertTriangle,
  X,
  Clock,
  Layers,
  Zap,
  Scissors,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
  ShieldAlert,
  Sliders,
  DollarSign
} from 'lucide-react';

interface FlowEfficiencyViolationModalProps {
  booth: TollBooth | null;
  laneVehicles: VehicleStory[];
  metrics: FlowMetrics;
  funds: number;
  onClose: () => void;
  onSliceStory: (vehicleId: string) => void;
  onUpgradeEfficiency?: (boothId: number) => void;
  onUpgradeAutomation?: (boothId: number) => void;
  onSetWipLimit?: (boothId: number, limit: number) => void;
}

export const FlowEfficiencyViolationModal: React.FC<FlowEfficiencyViolationModalProps> = ({
  booth,
  laneVehicles,
  metrics,
  funds,
  onClose,
  onSliceStory,
  onUpgradeEfficiency,
  onUpgradeAutomation,
  onSetWipLimit
}) => {
  if (!booth) return null;

  // Filter vehicles currently waiting or processing in this lane
  const queueVehicles = laneVehicles.filter(
    (v) => v.laneIndex === booth.id && (v.state === 'queued' || v.state === 'processing')
  );

  const queuedPoints = queueVehicles.reduce((sum, v) => sum + v.points, 0);
  const queueCount = queueVehicles.length;
  const isOverWip = queueCount > booth.wipLimit;

  // Calculate processing power
  const effBonus = 1 + (booth.efficiencyLevel - 1) * 0.25;
  const autoBonus = booth.automationLevel >= 2 ? 1.3 : 1.0;
  const processingRate = effBonus * autoBonus;

  // Estimated clearance time for all queued stories
  const totalQueueWorkSeconds = queueVehicles.reduce(
    (sum, v) => sum + v.baseProcessingTime / processingRate,
    0
  );

  // Flow efficiency calculation for this congested station:
  // Active work time vs idle queue wait time
  const avgActiveTimePerStory = queueCount > 0 ? totalQueueWorkSeconds / queueCount : 6;
  const avgWaitTimePerStory = totalQueueWorkSeconds * 0.75; // average wait in line
  const laneFlowEfficiency = Math.max(
    8,
    Math.min(90, Math.round((avgActiveTimePerStory / (avgActiveTimePerStory + avgWaitTimePerStory)) * 100))
  );

  // Large stories in queue eligible for slicing
  const sliceableStories = queueVehicles.filter((v) => v.points >= 3);

  const efficiencyCost = Math.round(180 * Math.pow(1.6, booth.efficiencyLevel - 1));
  const automationCost = Math.round(260 * Math.pow(1.7, booth.automationLevel - 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E222A]/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 shadow-[0_12px_0_#1E222A] text-[#1E222A] space-y-5 overflow-hidden">
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Ambient Top Hazard Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#D92525]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-[#1E222A] rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#D92525] border-2 border-[#1E222A] flex items-center justify-center text-white shrink-0 shadow-[0_3px_0_#1E222A]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#D92525] text-white border-2 border-[#1E222A] font-mono text-[11px] font-black uppercase tracking-wider">
                Critical Flow Bottleneck
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">Lane #{booth.id + 1}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#1E222A] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Flow Efficiency Principle Violation: {booth.name}
            </h3>
            <p className="text-xs text-[#D92525] font-bold mt-0.5">
              Excessive queue accumulation is destroying flow efficiency and multiplying lead time.
            </p>
          </div>
        </div>

        {/* Queue Metrics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
            <div className="text-[11px] font-black text-slate-500 uppercase">Queue Accumulation</div>
            <div className="text-base font-black font-mono text-[#D92525] mt-0.5 flex items-baseline gap-1">
              <span>{queueCount} stories</span>
              <span className="text-xs font-bold text-slate-500">({queuedPoints} pts)</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono font-bold">
              WIP Limit: {booth.wipLimit} ({isOverWip ? 'EXCEEDED' : 'Near limit'})
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
            <div className="text-[11px] font-black text-slate-500 uppercase">Station Flow Eff.</div>
            <div className="text-base font-black font-mono text-[#E85D04] mt-0.5 flex items-baseline gap-1">
              <span>{laneFlowEfficiency}%</span>
              <TrendingDown className="w-3.5 h-3.5 text-[#D92525]" />
            </div>
            <div className="text-[10px] text-[#D92525] font-mono font-bold">
              {100 - laneFlowEfficiency}% idle wait waste
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
            <div className="text-[11px] font-black text-slate-500 uppercase">Clearance Delay</div>
            <div className="text-base font-black font-mono text-[#1E222A] mt-0.5">
              ~{Math.round(totalQueueWorkSeconds)}s
            </div>
            <div className="text-[10px] text-slate-500 font-mono font-bold">
              Rate: {processingRate.toFixed(2)}x speed
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
            <div className="text-[11px] font-black text-slate-500 uppercase">System Bottleneck</div>
            <div className="text-base font-black font-mono text-[#D92525] mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-[#FFD200]" />
              <span>Rank #1</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono font-bold">
              Highest backlog in port
            </div>
          </div>
        </div>

        {/* Flow Efficiency Educational Breakdown */}
        <div className="bg-white border-2 border-[#1E222A] rounded-2xl p-4 space-y-3 shadow-[0_3px_0_#1E222A]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-xs font-black text-[#1E222A] flex items-center gap-1.5 uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
              <Info className="w-4 h-4 text-[#48A2D8]" />
              <span>Why Queue Accumulation Violates Flow Principles</span>
            </h4>
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-[#1E222A]/20">
              Flow Efficiency = Active Work &divide; Total Lead Time
            </span>
          </div>

          {/* Visual Time Ratio Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="text-[#10b981] flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-[#1E222A]" />
                Active Processing ({laneFlowEfficiency}%)
              </span>
              <span className="text-[#D92525] flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D92525] border border-[#1E222A]" />
                Non-Value-Adding Waiting Idle ({100 - laneFlowEfficiency}%)
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden border-2 border-[#1E222A] flex">
              <div
                className="h-full bg-[#10b981] transition-all duration-300"
                style={{ width: `${laneFlowEfficiency}%` }}
                title={`Active work: ${laneFlowEfficiency}%`}
              />
              <div
                className="h-full bg-[#D92525] transition-all duration-300"
                style={{ width: `${100 - laneFlowEfficiency}%` }}
                title={`Idle waiting waste: ${100 - laneFlowEfficiency}%`}
              />
            </div>
          </div>

          {/* Core Agile Principles Explained */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-amber-50 border-2 border-[#FFD200] space-y-1 text-[#1E222A]">
              <div className="font-black text-[#E85D04] flex items-center gap-1" style={{ fontFamily: 'var(--font-heading)' }}>
                <span>1. Little's Law WIP Inflation</span>
              </div>
              <p className="text-slate-700 text-[11px] font-semibold leading-relaxed">
                <strong className="text-[#1E222A]">Lead Time = WIP &divide; Throughput</strong>. When stories queue up in this lane, WIP expands without increasing processing capacity. Every queued story directly multiplies the wait time for all trailing stories!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border-2 border-[#D92525]/40 space-y-1 text-[#1E222A]">
              <div className="font-black text-[#D92525] flex items-center gap-1" style={{ fontFamily: 'var(--font-heading)' }}>
                <span>2. Queues are Invisible Waste (Muda)</span>
              </div>
              <p className="text-slate-700 text-[11px] font-semibold leading-relaxed">
                Work sitting motionless in a queue creates <strong className="text-[#1E222A]">zero value</strong> for customers. It risks missing the daily ferry departure window, consumes port memory, and blocks upstream feeder highways.
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Remedies Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-[#1E222A] uppercase tracking-wider flex items-center gap-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
            <Zap className="w-4 h-4 text-[#E85D04]" />
            <span>Recommended Remedies to Restore Continuous Flow</span>
          </h4>

          {/* Action 1: Slice queued stories */}
          {sliceableStories.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#FFD200]/20 border-2 border-[#FFD200] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#E85D04]" />
                  <span className="text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                    Slice Large Stories in This Queue (Immediate Relief)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-black text-[#E85D04] bg-white px-2 py-0.5 rounded-lg border border-[#1E222A]">
                  {sliceableStories.length} eligible
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-semibold">
                Smaller batch sizes travel faster through toll barriers and distribute more evenly across lanes.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {sliceableStories.slice(0, 3).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onSliceStory(v.id)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#1E222A] text-[#1E222A] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-mono border border-[#1E222A]"
                      style={{ backgroundColor: v.color }}
                    >
                      {v.points}
                    </span>
                    <span className="truncate max-w-[120px]">{v.title}</span>
                    <span className="text-[10px] text-[#E85D04]">&rarr; Slice</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action 2: Upgrade or Adjust WIP Limit Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Upgrade Efficiency */}
            {onUpgradeEfficiency && (
              <button
                onClick={() => onUpgradeEfficiency(booth.id)}
                disabled={funds < efficiencyCost}
                className={`p-3 rounded-2xl border-2 border-[#1E222A] text-left flex flex-col justify-between transition-all ${
                  funds >= efficiencyCost
                    ? 'bg-white hover:bg-slate-50 shadow-[0_3px_0_#1E222A] cursor-pointer text-[#1E222A] active:translate-y-0.5 active:shadow-none'
                    : 'bg-slate-100 opacity-60 cursor-not-allowed text-slate-400'
                }`}
              >
                <div className="font-black text-[#48A2D8] flex items-center justify-between" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span>Upgrade Efficiency</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-[#1E222A]/20">Lv.{booth.efficiencyLevel + 1}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-bold mt-1">+25% service speed</div>
                <div className="font-mono font-black text-[#10b981] text-xs mt-2">
                  ${efficiencyCost}
                </div>
              </button>
            )}

            {/* Upgrade Automation */}
            {onUpgradeAutomation && (
              <button
                onClick={() => onUpgradeAutomation(booth.id)}
                disabled={funds < automationCost}
                className={`p-3 rounded-2xl border-2 border-[#1E222A] text-left flex flex-col justify-between transition-all ${
                  funds >= automationCost
                    ? 'bg-white hover:bg-slate-50 shadow-[0_3px_0_#1E222A] cursor-pointer text-[#1E222A] active:translate-y-0.5 active:shadow-none'
                    : 'bg-slate-100 opacity-60 cursor-not-allowed text-slate-400'
                }`}
              >
                <div className="font-black text-[#E85D04] flex items-center justify-between" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span>Upgrade Automation</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-[#1E222A]/20">Lv.{booth.automationLevel + 1}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-bold mt-1">Faster pass gate</div>
                <div className="font-mono font-black text-[#10b981] text-xs mt-2">
                  ${automationCost}
                </div>
              </button>
            )}

            {/* Calibrate Lane WIP Limit */}
            {onSetWipLimit && (
              <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] flex flex-col justify-between">
                <div className="font-black text-[#1E222A] flex items-center justify-between" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span>Lane WIP Limit</span>
                  <span className="font-mono text-[#E85D04] font-black">{booth.wipLimit}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-bold mt-1">Cap queue volume</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    onClick={() => onSetWipLimit(booth.id, Math.max(1, booth.wipLimit - 1))}
                    className="flex-1 py-1 rounded-xl bg-[#F4F6F9] hover:bg-slate-200 text-[#1E222A] text-xs font-black transition-colors cursor-pointer border border-[#1E222A]"
                    title="Lower WIP Limit to throttle intake"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onSetWipLimit(booth.id, Math.min(10, booth.wipLimit + 1))}
                    className="flex-1 py-1 rounded-xl bg-[#F4F6F9] hover:bg-slate-200 text-[#1E222A] text-xs font-black transition-colors cursor-pointer border border-[#1E222A]"
                    title="Increase WIP Limit"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Dismiss Button */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-[#1E222A]/15">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1E222A] hover:bg-black text-white font-black text-xs transition-all cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Acknowledge &amp; Return to Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
