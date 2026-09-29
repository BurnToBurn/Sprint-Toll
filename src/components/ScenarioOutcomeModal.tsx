import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ActiveScenarioState, ScenarioDefinition } from '../types/scenarios';
import {
  Trophy,
  ShieldAlert,
  RotateCcw,
  Flag,
  CheckCircle2,
  XCircle,
  BookOpen
} from 'lucide-react';

interface ScenarioOutcomeModalProps {
  scenarioState: ActiveScenarioState | null;
  scenarioDef: ScenarioDefinition | null;
  onRestartScenario: () => void;
  onChooseAnotherScenario: () => void;
  onReturnToFreePlay: () => void;
  onReturnToMainMenu?: () => void;
}

export const ScenarioOutcomeModal: React.FC<ScenarioOutcomeModalProps> = ({
  scenarioState,
  scenarioDef,
  onRestartScenario,
  onChooseAnotherScenario,
  onReturnToFreePlay,
  onReturnToMainMenu
}) => {
  const isWin = scenarioState?.status === 'victory';

  useEffect(() => {
    if (isWin) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 }
        });
      } catch {
        // Fallback
      }
    }
  }, [isWin]);

  if (!scenarioState || !scenarioDef || scenarioState.status === 'active') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#F4F6F9] border-[3.5px] border-[#1E222A] rounded-3xl max-w-2xl w-full shadow-[0_12px_0_#1E222A] relative overflow-hidden">
        {/* Corner Rivets */}
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Modal Banner */}
        <div
          className={`p-6 border-b-[3px] border-[#1E222A] text-white flex items-center gap-4 ${
            isWin ? 'bg-gradient-to-r from-[#004831] via-[#66BD29] to-[#004831]' : 'bg-gradient-to-r from-[#8B0000] via-[#D92525] to-[#8B0000]'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl border-2 border-white/80 flex items-center justify-center shrink-0 shadow-[0_4px_0_rgba(0,0,0,0.3)] ${
              isWin ? 'bg-[#FFD200] text-[#1E222A]' : 'bg-white text-[#D92525]'
            }`}
          >
            {isWin ? <Trophy className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-white/20 border border-white/40">
                {isWin ? 'Mission Accomplished' : 'Pipeline Incident Failure'}
              </span>
              <span className="text-[10px] font-mono text-white/80">
                Day {scenarioState.currentDay} / {scenarioDef.durationDays}
              </span>
            </div>

            <h2
              className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mt-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isWin ? 'Scenario Victory!' : 'Scenario Defeat'}
            </h2>
            <p className="text-xs text-white/90 font-medium mt-0.5">
              {scenarioDef.title}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Failure or Success Alert Card */}
          <div
            className={`p-4 rounded-2xl border-2 flex items-start gap-3 ${
              isWin
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            {isWin ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="text-sm font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                {scenarioState.outcome?.title || (isWin ? 'Objectives Fulfilled' : 'Loss Condition Triggered')}
              </div>
              <p className="text-xs font-semibold leading-relaxed text-slate-800">
                {scenarioState.outcome?.reason}
              </p>
            </div>
          </div>

          {/* Scenario Telemetry Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
            <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
              <div className="text-[10px] uppercase font-bold text-slate-500">Delivered</div>
              <div className="text-xl font-black text-emerald-600 mt-0.5">
                {scenarioState.pointsDelivered} <span className="text-xs font-normal">pts</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
              <div className="text-[10px] uppercase font-bold text-slate-500">Epics Sliced</div>
              <div className="text-xl font-black text-[#48A2D8] mt-0.5">
                {scenarioState.epicsSlicedCount} <span className="text-xs font-normal">tickets</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
              <div className="text-[10px] uppercase font-bold text-slate-500">Peak Queue</div>
              <div className={`text-xl font-black mt-0.5 ${scenarioState.peakQueueCount >= 18 ? 'text-rose-600' : 'text-slate-800'}`}>
                {scenarioState.peakQueueCount} <span className="text-xs font-normal">cars</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
              <div className="text-[10px] uppercase font-bold text-slate-500">Zero-Left Days</div>
              <div className="text-xl font-black text-[#E85D04] mt-0.5">
                {scenarioState.consecutiveZeroStrandedDays} <span className="text-xs font-normal">days</span>
              </div>
            </div>
          </div>

          {/* Agile Retrospective Post-Mortem Card */}
          <div className="p-4 rounded-2xl bg-[#FFD200]/20 border-2 border-[#1E222A] space-y-2 shadow-[0_2px_0_#1E222A]">
            <div className="flex items-center gap-2 text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
              <BookOpen className="w-4 h-4 text-[#E85D04]" />
              Agile Engineering Takeaway
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold italic">
              "{scenarioState.outcome?.agileTakeaway || scenarioDef.agileConceptTaught}"
            </p>
          </div>

          {/* HEXperience Port Authority Stamp */}
          <div className="p-3 rounded-xl bg-white border border-[#1E222A]/15 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#66BD29]" />
              <span>Verified by <strong>HEXperience Port Engineering</strong></span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              ID: {scenarioDef.id.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-white border-t-[2.5px] border-[#1E222A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onReturnToMainMenu && (
              <button
                onClick={onReturnToMainMenu}
                className="px-4 py-2.5 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] border-2 border-[#1E222A] text-[#1E222A] font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_2px_0_#1E222A]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Main Menu
              </button>
            )}
            <button
              onClick={onReturnToFreePlay}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#1E222A] text-slate-700 font-black text-xs transition-all cursor-pointer flex items-center gap-1.5"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Return to Free Play
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onChooseAnotherScenario}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#1E222A] text-[#1E222A] font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_2px_0_#1E222A]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Flag className="w-3.5 h-3.5 text-[#48A2D8]" />
              Choose Another Scenario
            </button>

            <button
              onClick={onRestartScenario}
              className={`px-5 py-2.5 rounded-xl font-black text-xs border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer ${
                isWin
                  ? 'bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A]'
                  : 'bg-[#D92525] hover:bg-[#E83C3C] text-white'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isWin ? 'Play Again' : 'Retry Scenario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
