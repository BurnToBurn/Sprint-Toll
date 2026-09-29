import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SprintSummary, RetrospectiveLesson } from '../types/game';
import {
  Ship,
  Award,
  TrendingUp,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Split,
  Layers,
  BarChart3,
  CheckSquare,
  ShieldCheck,
  Flag,
  Receipt,
  Pause
} from 'lucide-react';

interface SprintRetrospectiveModalProps {
  summary: SprintSummary | null;
  onClose: () => void;
}

export const SprintRetrospectiveModal: React.FC<SprintRetrospectiveModalProps> = ({ summary, onClose }) => {
  const [activeTab, setActiveTab] = useState<'highlights' | 'lessons' | 'kaizen'>('highlights');
  const [committedActions, setCommittedActions] = useState<Record<string, boolean>>({
    sliceLargeStories: true,
    enforceWip: true,
    upgradeBottleneck: false
  });

  useEffect(() => {
    if (summary) {
      // Fire celebration confetti if exceptional or great
      if (summary.rating === 'exceptional' || summary.rating === 'great') {
        try {
          confetti({
            particleCount: 85,
            spread: 80,
            origin: { y: 0.55 }
          });
        } catch {
          // ignore
        }
      }
    }
  }, [summary]);

  if (!summary) return null;

  const gradeColors = {
    'A+': 'bg-emerald-100 text-[#10b981] border-[#10b981]',
    'A': 'bg-sky-100 text-[#48A2D8] border-[#48A2D8]',
    'B': 'bg-indigo-100 text-indigo-600 border-indigo-400',
    'C': 'bg-amber-100 text-[#E85D04] border-[#E85D04]',
    'D': 'bg-rose-100 text-[#D92525] border-[#D92525]'
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    littles_law: <TrendingUp className="w-4 h-4 text-[#48A2D8]" />,
    batch_size: <Split className="w-4 h-4 text-[#E85D04]" />,
    bottlenecks: <AlertTriangle className="w-4 h-4 text-[#D92525]" />,
    flow_efficiency: <Zap className="w-4 h-4 text-[#10b981]" />,
    continuous_flow: <Layers className="w-4 h-4 text-purple-600" />
  };

  const totalStories = summary.deliveredVehiclesCount + summary.leftBehindCount;
  const deliveryRatio = totalStories > 0 ? Math.round((summary.deliveredVehiclesCount / totalStories) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E222A]/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl shadow-[0_12px_0_#1E222A] text-[#1E222A] overflow-hidden flex flex-col max-h-[92vh]">
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b-2 border-[#1E222A] bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#48A2D8] border-2 border-[#1E222A] flex items-center justify-center text-white shadow-[0_3px_0_#1E222A] shrink-0">
                <Ship className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black text-[#E85D04] uppercase tracking-wider">
                    Sprint #{summary.sprintNumber} Retrospective
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#FFD200] text-[#1E222A] font-mono font-black border border-[#1E222A]">
                    Day #{summary.dayNumber}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#D92525] text-white font-mono font-black border border-[#1E222A] flex items-center gap-1 shadow-sm animate-pulse">
                    <Pause className="w-3 h-3 fill-current" />
                    SIMULATION &amp; ACTIONS PAUSED
                  </span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-black text-[#1E222A] tracking-tight mt-0.5"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Daily Sprint Performance Report
                </h2>
              </div>
            </div>

            {/* Sprint Grade Badge */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] ${
                  gradeColors[summary.grade] || gradeColors['B']
                }`}
              >
                <div className="text-[10px] font-mono font-black tracking-widest uppercase opacity-75">
                  Flow Grade
                </div>
                <div className="text-3xl font-black tracking-tight font-mono leading-none mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  {summary.grade}
                </div>
              </div>
            </div>
          </div>

          {/* Departure Reason Status Bar */}
          <div className="mt-4 px-4 py-2 rounded-xl bg-[#F4F6F9] border-2 border-[#1E222A] flex items-center justify-between text-xs shadow-[0_1px_0_#1E222A]">
            <div className="flex items-center gap-2 font-semibold">
              {summary.departureReason === 'full' ? (
                <>
                  <Zap className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span className="text-[#1E222A]">
                    Triggered by <strong>Full Ferry Capacity</strong> &bull; 100% load achieved before countdown!
                  </span>
                </>
              ) : summary.departureReason === 'timer' ? (
                <>
                  <Clock className="w-4 h-4 text-[#E85D04] shrink-0" />
                  <span className="text-[#1E222A]">
                    Triggered by <strong>Daily 05:00 PM Release Deadline</strong> &bull; Departure schedule honored!
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#48A2D8] shrink-0" />
                  <span className="text-[#1E222A]">
                    Triggered by <strong>On-Demand Manual Release</strong> &bull; Shipped batch on command!
                  </span>
                </>
              )}
            </div>
            <div className="font-mono text-[#10b981] font-black shrink-0 ml-2">
              +${summary.totalBonus.toLocaleString()} Payout
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t-2 border-[#1E222A]/10 font-bold text-xs">
            <button
              onClick={() => setActiveTab('highlights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'highlights'
                  ? 'bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                  : 'text-slate-600 hover:text-[#1E222A] hover:bg-slate-100 border-2 border-transparent'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <BarChart3 className="w-4 h-4 text-[#48A2D8]" />
              <span>Performance Highlights</span>
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'lessons'
                  ? 'bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                  : 'text-slate-600 hover:text-[#1E222A] hover:bg-slate-100 border-2 border-transparent'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <BookOpen className="w-4 h-4 text-[#E85D04]" />
              <span>Agile Lessons Learned ({summary.lessonsLearned?.length || 4})</span>
            </button>
            <button
              onClick={() => setActiveTab('kaizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'kaizen'
                  ? 'bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                  : 'text-slate-600 hover:text-[#1E222A] hover:bg-slate-100 border-2 border-transparent'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <CheckSquare className="w-4 h-4 text-[#10b981]" />
              <span>Kaizen Next Steps</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PERFORMANCE HIGHLIGHTS */}
          {activeTab === 'highlights' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Top Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>Shipped Velocity</span>
                    <Award className="w-3.5 h-3.5 text-[#10b981]" />
                  </div>
                  <div className="text-2xl font-black text-[#10b981] mt-1.5">
                    {summary.deliveredPoints} <span className="text-xs font-normal text-slate-500">pts</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    {summary.deliveredVehiclesCount} stories loaded ({deliveryRatio}%)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>Avg Lead Time</span>
                    <Clock className="w-3.5 h-3.5 text-[#48A2D8]" />
                  </div>
                  <div className="text-2xl font-black text-[#48A2D8] mt-1.5">
                    {summary.averageCycleTime}s
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    Queue-to-exit latency
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>Flow Efficiency</span>
                    <Zap className="w-3.5 h-3.5 text-[#E85D04]" />
                  </div>
                  <div className="text-2xl font-black text-[#E85D04] mt-1.5">
                    {summary.flowEfficiency}%
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    Active vs queue idle
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>Stranded Cargo</span>
                    <Layers className="w-3.5 h-3.5 text-[#D92525]" />
                  </div>
                  <div className={`text-2xl font-black mt-1.5 ${summary.leftBehindCount > 0 ? 'text-[#D92525]' : 'text-[#10b981]'}`}>
                    {summary.leftBehindCount} <span className="text-xs font-normal text-slate-500">items</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    {summary.leftBehindPoints} pts missed boat
                  </div>
                </div>
              </div>

              {/* Little's Law In-Depth Simulation Equation Card */}
              <div className="p-4 rounded-2xl bg-[#FFD200]/20 border-2 border-[#FFD200] space-y-3 shadow-[0_2px_0_#1E222A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-[#E85D04] uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                    <TrendingUp className="w-4 h-4 text-[#48A2D8]" />
                    Little's Law Validation (WIP = Throughput &times; Cycle Time)
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-[#1E222A] text-[#1E222A]">
                    Lean Flow Mechanics
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  During this daily cycle, total active stories in the pipeline equaled{' '}
                  <strong className="text-[#1E222A]">{totalStories} tickets</strong>. With{' '}
                  <strong className="text-[#1E222A]">{summary.deliveredVehiclesCount} stories</strong> delivered across the
                  daily cycle, the measured lead time averaged{' '}
                  <strong className="text-[#48A2D8]">{summary.averageCycleTime} seconds</strong> per user story.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white rounded-xl border-2 border-[#1E222A] font-mono text-center text-xs shadow-[0_1px_0_#1E222A]">
                  <div>
                    <span className="text-slate-500 font-bold">Pipeline Load (WIP)</span>
                    <div className="text-base font-black text-[#1E222A] mt-0.5">{totalStories} Stories</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Shipped Output (&lambda;)</span>
                    <div className="text-base font-black text-[#10b981] mt-0.5">{summary.deliveredVehiclesCount} Stories</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Avg Lead Latency (W)</span>
                    <div className="text-base font-black text-[#48A2D8] mt-0.5">{summary.averageCycleTime}s per car</div>
                  </div>
                </div>
              </div>

              {/* Daily Fiscal Settlement Statement */}
              {summary.financialSettlement && (
                <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-3 shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between border-b border-[#1E222A]/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                      <Receipt className="w-4 h-4 text-[#48A2D8]" />
                      Daily Fiscal Settlement &amp; Dues Statement
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Day #{summary.dayNumber} Disbursal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        Gross Daily Revenue
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Highway Tolls Collected:</span>
                        <span className="font-bold text-emerald-700">+${summary.financialSettlement.grossTollRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Ferry Cargo Delivery Bonus:</span>
                        <span className="font-bold text-emerald-700">+${summary.financialSettlement.ferryDeliveryBonus.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-200 pt-1 font-black text-emerald-950 text-sm">
                        <span>Gross Revenue:</span>
                        <span>+${summary.financialSettlement.totalGrossRevenue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-rose-800">
                        Daily Dues &amp; Operating Taxes
                      </div>
                      <div className="flex justify-between text-slate-700" title="Higher efficiency booths require high-speed municipal telematics & grid power">
                        <span>Efficiency Booth Taxes:</span>
                        <span className="font-bold text-rose-700">-${summary.financialSettlement.efficiencyTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700" title="E-ZPass telemetry & squad mentorship upgrades maintenance">
                        <span>Upgrades &amp; Training Dues:</span>
                        <span className="font-bold text-rose-700">
                          -${(summary.financialSettlement.automationDues + summary.financialSettlement.trainingDues).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700" title="Vessel maintenance & open toll lane municipal licensing">
                        <span>Vessel &amp; Lane Dues:</span>
                        <span className="font-bold text-rose-700">
                          -${(summary.financialSettlement.ferryUpgradesTax + summary.financialSettlement.baseFacilityDues).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-rose-200 pt-1 font-black text-rose-950 text-sm">
                        <span>Total Dues Paid:</span>
                        <span>-${summary.financialSettlement.totalDailyDues.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFD200]/25 border-2 border-[#1E222A] font-mono">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                        Net Funding Awarded to Bank
                      </span>
                      <span className="text-[10px] text-slate-600 font-semibold">
                        Gross Earnings minus Daily Dues &amp; Efficiency Taxes
                      </span>
                    </div>
                    <span className="text-lg font-black text-emerald-800 tabular-nums">
                      +${summary.financialSettlement.netFundingAwarded.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Key Highlights Bullet List */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-2.5 shadow-[0_2px_0_#1E222A]">
                <div className="flex items-center gap-2 text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Sparkles className="w-4 h-4 text-[#FFD200]" />
                  Key Sprint Highlights
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-semibold">
                  {summary.keyHighlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F4F6F9] border-2 border-[#1E222A]">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Advisory Quote */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-1.5 shadow-[0_2px_0_#1E222A]">
                <div className="flex items-center gap-2 text-xs font-black text-[#E85D04]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <MessageSquare className="w-4 h-4" />
                  Agile Coach Observation
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed font-semibold">
                  "{summary.coachAdvice}"
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AGILE LESSONS LEARNED */}
          {activeTab === 'lessons' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-xs text-slate-600 font-bold flex items-center justify-between">
                <span>Data-driven lessons derived directly from this sprint's simulation telemetry:</span>
                <span className="font-mono text-[#48A2D8] font-black">4 Lean Principles</span>
              </div>

              <div className="space-y-3">
                {summary.lessonsLearned.map((lesson: RetrospectiveLesson) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-3 shadow-[0_2px_0_#1E222A]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {categoryIcons[lesson.category] || <BookOpen className="w-4 h-4 text-[#48A2D8]" />}
                        <h4 className="text-sm font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                          {lesson.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-[#1E222A] text-slate-600 font-bold">
                        {lesson.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Observation */}
                    <div className="text-xs text-slate-700 font-semibold">
                      <strong className="text-[#1E222A]">Observed in Simulation: </strong>
                      {lesson.observation}
                    </div>

                    {/* Metric Evidence Box */}
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-[#48A2D8] text-[11px] font-mono text-[#48A2D8] font-bold flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-[#48A2D8] shrink-0" />
                      <span>{lesson.metricEvidence}</span>
                    </div>

                    {/* Agile Concept & Action */}
                    <div className="pt-2 border-t-2 border-[#1E222A]/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[11px] font-black text-[#1E222A] mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                          Agile Principle:
                        </div>
                        <p className="text-slate-600 text-[11px] font-semibold leading-relaxed">{lesson.agileConcept}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-[#FFD200]">
                        <div className="text-[11px] font-black text-[#E85D04] mb-0.5 flex items-center gap-1" style={{ fontFamily: 'var(--font-heading)' }}>
                          <Zap className="w-3 h-3" />
                          Recommended Next Action:
                        </div>
                        <p className="text-slate-700 text-[11px] font-semibold leading-relaxed">{lesson.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: KAIZEN ACTION PLAN */}
          {activeTab === 'kaizen' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-[#10b981] space-y-2 shadow-[0_2px_0_#1E222A]">
                <div className="flex items-center gap-2 text-xs font-black text-[#10b981]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <ShieldCheck className="w-4 h-4" />
                  Continuous Improvement Commitments (Kaizen)
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  Select policy changes and engineering experiments to adopt for Day #{summary.dayNumber + 1}. In
                  high-performing agile teams, small incremental adjustments compound into massive flow acceleration.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'sliceLargeStories',
                    title: 'Aggressive Story Slicing Protocol',
                    desc: 'Slice all incoming 8pt and 21pt epics into 2-3pt tickets before toll entry to eliminate queue blocking.',
                    badge: 'Batch Size Control',
                    impact: '+30% Faster Cycle Times'
                  },
                  {
                    key: 'enforceWip',
                    title: 'Enforce Strict WIP Limit (Max 3/Lane)',
                    desc: 'Prevent vehicle accumulation in toll queues to protect lead time and maintain smooth velocity.',
                    badge: "Little's Law Protection",
                    impact: 'Zero Stranded Carryover'
                  },
                  {
                    key: 'upgradeBottleneck',
                    title: `Elevate Bottleneck Station (${summary.bottleneckLaneName?.split('·')[0] || 'Lane #1'})`,
                    desc: 'Invest upgrade funds into automation and staff training for the lowest capacity station.',
                    badge: 'Theory of Constraints',
                    impact: '+25% Peak Throughput'
                  }
                ].map((item) => {
                  const isChecked = committedActions[item.key] ?? false;
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        setCommittedActions((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key]
                        }))
                      }
                      className={`p-4 rounded-2xl border-2 border-[#1E222A] transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-[#FFD200]/25 shadow-[0_3px_0_#1E222A]'
                          : 'bg-white shadow-[0_2px_0_#1E222A] hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCommittedActions((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key]
                          }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-5 h-5 rounded-lg text-[#FFD200] border-2 border-[#1E222A] cursor-pointer accent-[#E85D04]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#10b981] font-black bg-emerald-100 px-2 py-0.5 rounded-lg border border-[#10b981]">
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Action */}
        <div className="px-6 py-4 border-t-2 border-[#1E222A] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono font-bold">
            <Flag className="w-3.5 h-3.5 text-[#48A2D8]" />
            <span>Next Cycle: Day #{summary.dayNumber + 1} Daily Sprint</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-6 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-[#1E222A] shadow-[0_4px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span>Accept Retro &amp; Start Day #{summary.dayNumber + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
