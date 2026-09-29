import React, { useState } from 'react';
import { DailyForecast, TollBooth } from '../types/game';
import {
  TrendingUp,
  X,
  Sliders,
  Ship,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';

interface DailyForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: DailyForecast;
  booths: TollBooth[];
  onApplyRecommendedWip: (limit?: number) => void;
  onSetLaneWip: (boothId: number, limit: number) => void;
}

export const DailyForecastModal: React.FC<DailyForecastModalProps> = ({
  isOpen,
  onClose,
  forecast,
  booths,
  onApplyRecommendedWip,
  onSetLaneWip
}) => {
  const [appliedNotification, setAppliedNotification] = useState(false);

  if (!isOpen) return null;

  const unlockedBooths = booths.filter((b) => b.unlocked);

  const demandColors = {
    lean: 'bg-emerald-100 text-[#10b981] border-[#10b981]',
    moderate: 'bg-sky-100 text-[#48A2D8] border-[#48A2D8]',
    high: 'bg-amber-100 text-[#E85D04] border-[#E85D04]',
    surge: 'bg-rose-100 text-[#D92525] border-[#D92525]'
  };

  const riskColors = {
    low: 'text-[#10b981] bg-emerald-100 border-[#10b981]',
    moderate: 'text-[#E85D04] bg-amber-100 border-[#E85D04]',
    high: 'text-[#D92525] bg-rose-100 border-[#D92525]'
  };

  const handleApply = (limit?: number) => {
    onApplyRecommendedWip(limit);
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2400);
  };

  const capacityPct = Math.min(100, Math.round((forecast.totalProjectedPoints / forecast.ferryCapacity) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E222A]/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl my-auto bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl shadow-[0_12px_0_#1E222A] text-[#1E222A] overflow-hidden flex flex-col max-h-[92vh]">
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b-2 border-[#1E222A] bg-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-[#1E222A] rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close Forecast"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD200] border-2 border-[#1E222A] flex items-center justify-center text-[#1E222A] shadow-[0_3px_0_#1E222A] shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-[#E85D04] uppercase tracking-wider">
                  Daily Forecast &amp; Capacity Planning
                </span>
                <span
                  className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-lg border-2 ${
                    demandColors[forecast.predictedDemandLevel]
                  }`}
                >
                  {forecast.predictedDemandLevel} Influx
                </span>
              </div>
              <h2
                className="text-xl sm:text-2xl font-black text-[#1E222A] tracking-tight mt-0.5"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Day #{forecast.targetDayNumber} Sprint Projection
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Forecast Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Predicted Stories</span>
                <Sparkles className="w-3.5 h-3.5 text-[#FFD200]" />
              </div>
              <div className="text-2xl font-black text-[#E85D04] mt-1">
                ~{forecast.predictedStories}
              </div>
              <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                &asymp; {forecast.predictedStoryPoints} story pts
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Velocity</span>
                <Zap className="w-3.5 h-3.5 text-[#48A2D8]" />
              </div>
              <div className="text-2xl font-black text-[#48A2D8] mt-1">
                {forecast.currentThroughputRate} <span className="text-xs text-slate-500 font-normal">/min</span>
              </div>
              <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                {forecast.currentThroughputPointsRate} pts/min speed
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Optimal WIP</span>
                <Sliders className="w-3.5 h-3.5 text-[#10b981]" />
              </div>
              <div className="text-2xl font-black text-[#10b981] mt-1">
                {forecast.recommendedLaneWipLimit} <span className="text-xs text-slate-500 font-normal">/lane</span>
              </div>
              <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                Little's Law target
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Carryover</span>
                <Layers className="w-3.5 h-3.5 text-[#D92525]" />
              </div>
              <div className="text-2xl font-black text-[#D92525] mt-1">
                {forecast.carryoverStories} <span className="text-xs text-slate-500 font-normal">items</span>
              </div>
              <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                {forecast.carryoverPoints} pts in queue
              </div>
            </div>
          </div>

          {/* Little's Law WIP Limit Planning Section */}
          <div className="p-5 rounded-2xl bg-white border-2 border-[#1E222A] space-y-4 shadow-[0_3px_0_#1E222A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#10b981]" />
                <h3 className="text-sm sm:text-base font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Little's Law WIP Capacity Planning
                </h3>
              </div>
              <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-lg border-2 ${riskColors[forecast.congestionRisk]}`}>
                Congestion Risk: {forecast.congestionRisk.toUpperCase()}
              </span>
            </div>

            {/* Little's Law Formula Card */}
            <div className="p-3.5 rounded-xl bg-[#FFD200]/25 border-2 border-[#1E222A] text-xs space-y-1.5 text-[#1E222A]">
              <div className="flex items-center justify-between text-[11px] font-mono font-black">
                <span className="text-[#E85D04]">L = &lambda; &times; W</span>
                <span className="text-slate-600">(Work In Progress = Throughput Rate &times; Lead Time)</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-semibold">
                At your current throughput rate of{' '}
                <strong className="text-[#1E222A]">{forecast.currentThroughputRate} stories/min</strong>, keeping total
                highway WIP around <strong className="text-[#10b981]">{forecast.optimalSystemWIP} stories</strong> maintains
                a brisk, predictable lead time (~4.8 seconds per story).
              </p>
            </div>

            {/* Current vs Recommended Lane WIP comparison */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono font-bold">
                <span>Active Toll Lanes ({unlockedBooths.length})</span>
                <span>
                  Current Avg WIP:{' '}
                  <strong className="text-[#1E222A]">{forecast.currentAvgLaneWipLimit}</strong> / Recommended:{' '}
                  <strong className="text-[#10b981]">{forecast.recommendedLaneWipLimit}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {unlockedBooths.map((booth) => {
                  const isOptimal = booth.wipLimit === forecast.recommendedLaneWipLimit;
                  const isHigh = booth.wipLimit > forecast.recommendedLaneWipLimit;

                  return (
                    <div
                      key={booth.id}
                      className={`p-3 rounded-xl border-2 border-[#1E222A] transition-all ${
                        isOptimal
                          ? 'bg-emerald-50 shadow-[0_2px_0_#1E222A]'
                          : isHigh
                          ? 'bg-amber-50 shadow-[0_2px_0_#1E222A]'
                          : 'bg-[#F4F6F9]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                          {booth.name.split('·')[0]}
                        </span>
                        <span className="font-mono text-xs font-black text-[#E85D04]">
                          {booth.wipLimit} car limit
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={1}
                          max={6}
                          value={booth.wipLimit}
                          onChange={(e) => onSetLaneWip(booth.id, Number(e.target.value))}
                          className="w-full accent-[#E85D04] cursor-pointer"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-600 w-14 text-right shrink-0">
                          {booth.wipLimit < forecast.recommendedLaneWipLimit
                            ? 'Lean'
                            : booth.wipLimit === forecast.recommendedLaneWipLimit
                            ? 'Optimal'
                            : 'High WIP'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Action: Apply Recommended WIP to All Lanes */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#48A2D8] shrink-0" />
                  <span>Capping WIP prevents queues from overflowing onto the highway feeder.</span>
                </div>

                <button
                  onClick={() => handleApply(forecast.recommendedLaneWipLimit)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] cursor-pointer active:translate-y-0.5 active:shadow-none shrink-0"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {appliedNotification ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Applied to All Lanes!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Set All Lanes to {forecast.recommendedLaneWipLimit} WIP Limit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Ferry Capacity vs Projected Demand Card */}
          <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-3 shadow-[0_2px_0_#1E222A]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                <Ship className="w-4 h-4 text-[#48A2D8]" />
                <span>Next Sprint Vessel Capacity Load</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-600">
                {forecast.totalProjectedPoints} pts demand / {forecast.ferryCapacity} pts capacity
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border-2 border-[#1E222A] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  forecast.capacitySurplusOrDeficit < 0
                    ? 'bg-[#D92525]'
                    : capacityPct >= 80
                    ? 'bg-[#E85D04]'
                    : 'bg-[#48A2D8]'
                }`}
                style={{ width: `${Math.min(100, (forecast.totalProjectedPoints / forecast.ferryCapacity) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
              <span>
                {forecast.capacitySurplusOrDeficit < 0 ? (
                  <span className="text-[#D92525] font-black">
                    &bull; Capacity Deficit: {Math.abs(forecast.capacitySurplusOrDeficit)} pts will exceed vessel capacity!
                  </span>
                ) : (
                  <span className="text-[#10b981] font-black">
                    &check; Capacity Surplus: {forecast.capacitySurplusOrDeficit} pts headroom available.
                  </span>
                )}
              </span>
              <span className="font-mono text-[#1E222A] font-black">{capacityPct}% Loaded</span>
            </div>
          </div>

          {/* Agile Coach Recommendation */}
          <div className="p-4 rounded-2xl bg-[#FFD200]/25 border-2 border-[#1E222A] space-y-1.5 shadow-[0_2px_0_#1E222A]">
            <div className="flex items-center gap-2 text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
              <Sparkles className="w-4 h-4 text-[#E85D04]" />
              <span>Agile Coach Daily Forecast Insight</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic font-semibold">
              "{forecast.coachAdvice}"
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t-2 border-[#1E222A] bg-white flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono font-bold hidden sm:inline">
            Plan limits before Day #{forecast.targetDayNumber} starts
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black rounded-xl transition-all border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Done Planning
          </button>
        </div>
      </div>
    </div>
  );
};
