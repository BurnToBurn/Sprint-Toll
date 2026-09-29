import React from 'react';
import { FlowMetrics, TollBooth, DailyForecast } from '../types/game';
import { Activity, Clock, Layers, Zap, AlertTriangle, ShieldCheck, TrendingUp, ClipboardList, Columns3 } from 'lucide-react';

interface FlowMetricsPanelProps {
  metrics: FlowMetrics;
  booths: TollBooth[];
  onSelectBooth: (boothId: number) => void;
  onOpenRetrospective?: () => void;
  hasLastRetrospective?: boolean;
  onOpenForecast?: () => void;
  forecast?: DailyForecast;
  onSwitchToKanban?: () => void;
}

export const FlowMetricsPanel: React.FC<FlowMetricsPanelProps> = ({
  metrics,
  booths,
  onSelectBooth,
  onOpenRetrospective,
  hasLastRetrospective,
  onOpenForecast,
  forecast,
  onSwitchToKanban
}) => {
  const unlockedBooths = booths.filter((b) => b.unlocked);
  const bottleneckBooth = booths.find((b) => b.id === metrics.bottleneckLaneIndex);

  // Status indicators for flow health
  const isHealthyFlow = metrics.flowEfficiency >= 60;
  const isCongested = metrics.currentWIP >= 15;

  return (
    <div className="bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 text-[#1E222A] space-y-6 shadow-[0_8px_0_#1E222A] relative">
      <div className="rivet top-3 left-3" />
      <div className="rivet top-3 right-3" />
      <div className="rivet bottom-3 left-3" />
      <div className="rivet bottom-3 right-3" />

      {/* Header section with clean unboxed metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#1E222A]/15">
        <div>
          <h2
            className="text-xl sm:text-2xl font-black text-[#1E222A] tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Kanban Flow Telemetry &amp; Little's Law Engine
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-mono font-bold flex-wrap">
            <span className="bg-white px-2 py-0.5 rounded-lg border border-[#1E222A]">Active Lanes: {unlockedBooths.length}</span>
            <span aria-hidden="true">·</span>
            <span className="bg-white px-2 py-0.5 rounded-lg border border-[#1E222A]">Total Delivered: {metrics.completedPointsTotal} pts</span>
            <span aria-hidden="true">·</span>
            <span className={`px-2 py-0.5 rounded-lg border border-[#1E222A] font-black ${isHealthyFlow ? 'bg-[#10b981] text-white' : 'bg-[#FFD200] text-[#1E222A]'}`}>
              Flow Health: {isHealthyFlow ? 'Nominal Flow' : 'Congestion Warning'}
            </span>
          </div>
        </div>

        {/* Status Callout & Retro button */}
        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToKanban && (
            <button
              onClick={onSwitchToKanban}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] border-2 border-[#1E222A] text-[#1E222A] text-xs font-black cursor-pointer shadow-[0_3px_0_#1E222A] transition-all active:translate-y-0.5 active:shadow-none"
              title="Open the Kanban Work-In-Progress Board"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Columns3 className="w-4 h-4 text-[#1E222A]" />
              <span>Kanban Board</span>
            </button>
          )}

          {forecast && onOpenForecast && (
            <button
              onClick={onOpenForecast}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#48A2D8] hover:bg-[#5CB5EB] border-2 border-[#1E222A] text-white text-xs font-black cursor-pointer shadow-[0_3px_0_#1E222A] transition-all active:translate-y-0.5 active:shadow-none"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <TrendingUp className="w-4 h-4 text-[#FFD200]" />
              <span>Daily Forecast (~{forecast.predictedStories})</span>
            </button>
          )}

          {hasLastRetrospective && onOpenRetrospective && (
            <button
              onClick={onOpenRetrospective}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-[#1E222A] text-[#1E222A] text-xs font-black cursor-pointer shadow-[0_3px_0_#1E222A] transition-all active:translate-y-0.5 active:shadow-none"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <ClipboardList className="w-4 h-4 text-[#E85D04]" />
              <span>Sprint Retrospective</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
            <Activity className={`w-4 h-4 ${isHealthyFlow ? 'text-[#10b981]' : 'text-[#E85D04]'}`} />
            <span className="text-slate-600 font-bold">
              Efficiency:{' '}
              <strong className="text-[#1E222A] font-mono font-black">{metrics.flowEfficiency}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Little's Law Educational Hero Card */}
      <div className="bg-[#FFD200] border-[2.5px] border-[#1E222A] rounded-2xl p-5 shadow-[0_4px_0_#1E222A] text-[#1E222A]">
        <div className="flex items-center gap-2 text-xs font-black text-[#1E222A] uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          <TrendingUp className="w-4 h-4 text-[#E85D04]" />
          The Fundamental Law of Project Management
        </div>

        <div className="mt-3 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-base sm:text-lg font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
              Little's Law: Lead Time = WIP ÷ Throughput
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
              Queue wait times are mathematically dictated by how much work is stuffed into the system (WIP)
              relative to your delivery capacity (Throughput). If you want faster releases, either lower WIP or increase station throughput.
            </p>
          </div>

          {/* Interactive Formula Breakdown */}
          <div className="bg-white border-2 border-[#1E222A] p-4 rounded-2xl font-mono text-center shrink-0 shadow-[0_3px_0_#1E222A]">
            <div className="text-xs font-black text-slate-500 mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>Live Calculation</div>
            <div className="text-sm font-black text-[#1E222A] flex items-center justify-center gap-2">
              <span className="text-[#E85D04] bg-amber-50 px-1.5 py-0.5 rounded border border-[#E85D04]/30">{metrics.currentWIP} WIP</span>
              <span className="text-slate-400 font-bold">÷</span>
              <span className="text-[#48A2D8] bg-sky-50 px-1.5 py-0.5 rounded border border-[#48A2D8]/30">{Math.max(1, metrics.throughputPerMinute)} /min</span>
              <span className="text-slate-400 font-bold">=</span>
              <span className="text-[#10b981] bg-emerald-50 px-1.5 py-0.5 rounded border border-[#10b981]/30">{metrics.averageCycleTime}s Cycle</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-1.5">
              Theoretical vs Actual discrepancy: {metrics.littlesLawDiscrepancy}s
            </div>
          </div>
        </div>
      </div>

      {/* Core Flow Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: WIP */}
        <div className="bg-white border-2 border-[#1E222A] rounded-2xl p-4 shadow-[0_3px_0_#1E222A]">
          <div className="flex items-center justify-between text-xs font-black text-slate-600" style={{ fontFamily: 'var(--font-heading)' }}>
            <span>Work In Progress (WIP)</span>
            <Layers className="w-4 h-4 text-[#E85D04]" />
          </div>
          <div className="text-2xl font-black text-[#1E222A] font-mono tabular-nums mt-1">
            {metrics.currentWIP} <span className="text-xs font-bold text-slate-500">items</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            {metrics.wipPoints} total story points active
          </div>
        </div>

        {/* Metric 2: Throughput */}
        <div className="bg-white border-2 border-[#1E222A] rounded-2xl p-4 shadow-[0_3px_0_#1E222A]">
          <div className="flex items-center justify-between text-xs font-black text-slate-600" style={{ fontFamily: 'var(--font-heading)' }}>
            <span>Throughput Rate</span>
            <Zap className="w-4 h-4 text-[#48A2D8]" />
          </div>
          <div className="text-2xl font-black text-[#48A2D8] font-mono tabular-nums mt-1">
            {metrics.throughputPointsPerMinute} <span className="text-xs font-bold text-slate-500">pts/min</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            {metrics.throughputPerMinute} completed stories/min
          </div>
        </div>

        {/* Metric 3: Cycle Time */}
        <div className="bg-white border-2 border-[#1E222A] rounded-2xl p-4 shadow-[0_3px_0_#1E222A]">
          <div className="flex items-center justify-between text-xs font-black text-slate-600" style={{ fontFamily: 'var(--font-heading)' }}>
            <span>Avg Cycle Time</span>
            <Clock className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-2xl font-black text-[#10b981] font-mono tabular-nums mt-1">
            {metrics.averageCycleTime}s
          </div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            Queue arrival to toll exit
          </div>
        </div>

        {/* Metric 4: Flow Efficiency */}
        <div className="bg-white border-2 border-[#1E222A] rounded-2xl p-4 shadow-[0_3px_0_#1E222A]">
          <div className="flex items-center justify-between text-xs font-black text-slate-600" style={{ fontFamily: 'var(--font-heading)' }}>
            <span>Flow Efficiency</span>
            <ShieldCheck className="w-4 h-4 text-[#E85D04]" />
          </div>
          <div className="text-2xl font-black text-[#E85D04] font-mono tabular-nums mt-1">
            {metrics.flowEfficiency}%
          </div>
          <div className="text-[11px] text-slate-500 font-bold mt-1">
            Active processing vs waiting
          </div>
        </div>
      </div>

      {/* Theory of Constraints & Bottleneck Alert */}
      <div className="bg-white border-2 border-[#1E222A] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_3px_0_#1E222A]">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E85D04]/10 border-2 border-[#E85D04] text-[#E85D04] mt-0.5 shadow-[0_2px_0_#E85D04]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
              Theory of Constraints: Bottleneck Identification
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
              The slowest station governs total system throughput. Currently,{' '}
              <strong className="text-[#E85D04]">
                {bottleneckBooth ? bottleneckBooth.name : 'All Lanes Balanced'}
              </strong>{' '}
              has the heaviest queue load.
            </p>
          </div>
        </div>

        {bottleneckBooth && bottleneckBooth.unlocked && (
          <button
            onClick={() => onSelectBooth(bottleneckBooth.id)}
            className="px-4 py-2 bg-[#E85D04] hover:bg-[#F47019] text-white text-xs font-black rounded-xl border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] transition-all whitespace-nowrap cursor-pointer active:translate-y-0.5 active:shadow-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Upgrade {bottleneckBooth.name.split('·')[0]}
          </button>
        )}
      </div>

      {/* Lane Heatmap / Breakdown Table */}
      <div>
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Workstation Squad Performance Breakdown
        </h3>
        <div className="border-2 border-[#1E222A] rounded-2xl overflow-hidden shadow-[0_3px_0_#1E222A] bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#2B2F38] text-white font-mono border-b-2 border-[#1E222A]">
              <tr>
                <th className="py-3 px-4 font-black">Lane / Squad</th>
                <th className="py-3 px-3 font-black">Level &amp; XP</th>
                <th className="py-3 px-3 font-black">Multiplier</th>
                <th className="py-3 px-3 font-black">WIP Limit</th>
                <th className="py-3 px-3 font-black">Class of Service</th>
                <th className="py-3 px-3 font-black">Total Delivered</th>
                <th className="py-3 px-4 text-right font-black">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 font-mono">
              {booths.map((b) => (
                <tr
                  key={b.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    !b.unlocked ? 'opacity-50' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-sans font-black text-[#1E222A] flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border border-[#1E222A] ${
                        b.unlocked ? (b.isProcessing ? 'bg-[#48A2D8] animate-pulse' : 'bg-[#10b981]') : 'bg-slate-400'
                      }`}
                    />
                    {b.name}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-bold">
                    {b.unlocked ? (
                      <span>
                        Lv.{b.level} ({b.xp}/{b.xpToNextLevel} XP)
                      </span>
                    ) : (
                      'Locked'
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {b.unlocked ? (
                      <span className="font-black text-[#E85D04]">
                        x{b.multiplier.toFixed(2)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-bold">
                    {b.unlocked ? `${b.wipLimit} vehicles max` : '-'}
                  </td>
                  <td className="py-3 px-3 font-sans font-bold">
                    {b.unlocked ? (
                      b.specialization === 'small_only' ? (
                        <span className="text-[#48A2D8]">⚡ Expedite (1-3 pt)</span>
                      ) : b.specialization === 'heavy_only' ? (
                        <span className="text-[#E85D04]">🚛 Heavy (5-21 pt)</span>
                      ) : (
                        <span className="text-slate-600">Standard (All)</span>
                      )
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-bold">
                    {b.unlocked ? `${b.totalPointsProcessed} pts ($${b.totalRevenueGenerated})` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {b.unlocked ? (
                      <button
                        onClick={() => onSelectBooth(b.id)}
                        className="text-xs text-[#48A2D8] hover:text-[#2582b8] font-sans font-black cursor-pointer"
                      >
                        Configure &rarr;
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs font-bold">Unlock required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
