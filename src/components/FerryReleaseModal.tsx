import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SprintSummary } from '../types/game';
import { Ship, Award, CheckCircle2, TrendingUp, Sparkles, MessageSquare, ArrowRight, Receipt, DollarSign } from 'lucide-react';

interface FerryReleaseModalProps {
  summary: SprintSummary | null;
  onClose: () => void;
}

export const FerryReleaseModal: React.FC<FerryReleaseModalProps> = ({ summary, onClose }) => {
  useEffect(() => {
    if (summary) {
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [summary]);

  if (!summary) return null;

  const ratingColors = {
    exceptional: 'text-[#10b981] bg-emerald-100 border-[#10b981]',
    great: 'text-[#48A2D8] bg-sky-100 border-[#48A2D8]',
    balanced: 'text-[#E85D04] bg-amber-100 border-[#E85D04]',
    bottlenecked: 'text-[#D92525] bg-rose-100 border-[#D92525]',
    congested: 'text-[#D92525] bg-rose-200 border-[#D92525]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E222A]/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 shadow-[0_12px_0_#1E222A] text-[#1E222A] space-y-6">
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#48A2D8] border-2 border-[#1E222A] flex items-center justify-center mx-auto text-white shadow-[0_4px_0_#1E222A]">
            <Ship className="w-8 h-8" />
          </div>
          <div className="text-xs font-black text-[#E85D04] tracking-wider uppercase font-mono">
            {summary.departureReason === 'full'
              ? `🚀 Day #${summary.dayNumber} · 100% Full Early Departure`
              : summary.departureReason === 'timer'
              ? `⏰ Day #${summary.dayNumber} · 05:00 PM Release Deadline`
              : `Day #${summary.dayNumber} · Sprint Release`}
          </div>
          <h2
            className="text-2xl sm:text-3xl font-black text-[#1E222A] tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {summary.departureReason === 'full'
              ? 'Ferry Full — Cast Off!'
              : 'Daily Sprint Release Completed!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-md mx-auto">
            {summary.departureReason === 'full'
              ? 'The ferry reached maximum capacity and departed immediately with a full payload of completed user stories.'
              : 'The daily countdown deadline arrived and the ferry cast off for production with all stories safely loaded.'}
          </p>
        </div>

        {/* Daily Delivery Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-4 rounded-2xl border-2 border-[#1E222A] font-mono text-center shadow-[0_3px_0_#1E222A]">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Shipped Today</div>
            <div className="text-xl font-black text-[#10b981] mt-1">
              {summary.deliveredPoints} <span className="text-xs font-normal">pts</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
              {summary.deliveredVehiclesCount} stories
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Left Behind</div>
            <div className={`text-xl font-black mt-1 ${summary.leftBehindCount > 0 ? 'text-[#D92525]' : 'text-[#10b981]'}`}>
              {summary.leftBehindCount} <span className="text-xs font-normal">items</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
              {summary.leftBehindPoints} pts in queue
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Avg Cycle Time</div>
            <div className="text-xl font-black text-[#48A2D8] mt-1">
              {summary.averageCycleTime}s
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
              Toll latency
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Net Funding</div>
            <div className="text-xl font-black text-[#10b981] mt-1">
              +${summary.totalBonus.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5">
              Credited to Bank
            </div>
          </div>
        </div>

        {/* Daily Financial Settlement: Taxes & Dues Itemization */}
        {summary.financialSettlement && (
          <div className="bg-white border-2 border-[#1E222A] p-4 rounded-2xl space-y-2.5 shadow-[0_2px_0_#1E222A]">
            <div className="flex items-center justify-between border-b border-[#1E222A]/15 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                <Receipt className="w-4 h-4 text-[#48A2D8]" />
                Daily Fiscal Settlement &amp; Dues
              </div>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                End-of-Day Disbursal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {/* Revenue Column */}
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Gross Day Revenue</div>
                <div className="flex justify-between text-slate-700">
                  <span>Tolls Collected:</span>
                  <span className="font-bold text-emerald-700">+${summary.financialSettlement.grossTollRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Ferry Cargo Bonus:</span>
                  <span className="font-bold text-emerald-700">+${summary.financialSettlement.ferryDeliveryBonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-emerald-200 pt-1 font-black text-emerald-900">
                  <span>Total Gross:</span>
                  <span>+${summary.financialSettlement.totalGrossRevenue.toLocaleString()}</span>
                </div>
              </div>

              {/* Dues & Taxes Column */}
              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Daily Dues &amp; Taxes</div>
                <div className="flex justify-between text-slate-700">
                  <span title="Tax on higher efficiency toll booths">Efficiency Taxes:</span>
                  <span className="font-bold text-rose-700">-${summary.financialSettlement.efficiencyTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span title="Dues on E-ZPass automation & training upgrades">Upgrade Dues:</span>
                  <span className="font-bold text-rose-700">
                    -${(summary.financialSettlement.automationDues + summary.financialSettlement.trainingDues + summary.financialSettlement.ferryUpgradesTax).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-rose-200 pt-1 font-black text-rose-900">
                  <span>Total Dues:</span>
                  <span>-${summary.financialSettlement.totalDailyDues.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFD200]/30 border-2 border-[#1E222A] text-xs font-mono font-black">
              <span className="text-[#1E222A]">Net Daily Funding Deposited to Bank:</span>
              <span className="text-base text-emerald-700">+${summary.financialSettlement.netFundingAwarded.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Agile Coach Retrospective Feedback */}
        <div className="bg-[#FFD200]/25 border-2 border-[#1E222A] p-4 rounded-2xl space-y-2 shadow-[0_2px_0_#1E222A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
              <MessageSquare className="w-4 h-4 text-[#E85D04]" />
              Daily Scrum Retrospective
            </div>
            <span
              className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg border-2 capitalize ${
                ratingColors[summary.rating]
              }`}
            >
              {summary.rating} Flow
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold italic">
            "{summary.coachAdvice}"
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-[#1E222A] shadow-[0_4px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <span>Commence Day #{summary.dayNumber + 1} Morning Standup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
