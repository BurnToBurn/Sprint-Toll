import React, { useState } from 'react';
import { PREDETERMINED_SCENARIOS } from '../data/scenarios';
import { ScenarioDefinition, ScenarioDifficulty } from '../types/scenarios';
import {
  Flag,
  Trophy,
  Clock,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Play,
  CheckCircle2,
  X
} from 'lucide-react';

interface ScenarioSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: string | null;
  onSelectScenario: (scenario: ScenarioDefinition) => void;
  onResetToFreePlay: () => void;
}

const difficultyColors: Record<ScenarioDifficulty, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'bg-[#66BD29]/15', text: 'text-[#004831]', border: 'border-[#66BD29]' },
  intermediate: { bg: 'bg-[#48A2D8]/15', text: 'text-[#1E4D6B]', border: 'border-[#48A2D8]' },
  advanced: { bg: 'bg-[#FFD200]/25', text: 'text-[#7A4B00]', border: 'border-[#E85D04]' },
  expert: { bg: 'bg-[#D92525]/15', text: 'text-[#D92525]', border: 'border-[#D92525]' }
};

export const ScenarioSelectModal: React.FC<ScenarioSelectModalProps> = ({
  isOpen,
  onClose,
  activeScenarioId,
  onSelectScenario,
  onResetToFreePlay
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  if (!isOpen) return null;

  const filteredScenarios = selectedDifficulty === 'all'
    ? PREDETERMINED_SCENARIOS
    : PREDETERMINED_SCENARIOS.filter((s) => s.difficulty === selectedDifficulty);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[0_12px_0_#1E222A] relative overflow-hidden">
        {/* Corner Rivets */}
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-white border-b-[2.5px] border-[#1E222A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD200] border-2 border-[#1E222A] flex items-center justify-center shadow-[0_3px_0_#1E222A]">
              <Flag className="w-5 h-5 text-[#1E222A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-xl sm:text-2xl font-black text-[#1E222A] tracking-tight leading-none"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Predetermined Tech Scenarios
                </h2>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-[#66BD29] text-white border border-[#004831]">
                  HEXperience Challenge Hub
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                Select a tactical production pipeline crisis with distinct win/lose conditions, Little's Law mechanics, and daily events!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#1E222A] flex items-center justify-center transition-all cursor-pointer text-[#1E222A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Active Scenario Quick Switch */}
        <div className="px-6 py-3 bg-[#E9EDF2] border-b-2 border-[#1E222A]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-600 mr-1 uppercase text-[11px] font-black" style={{ fontFamily: 'var(--font-heading)' }}>
              Difficulty:
            </span>
            {(['all', 'beginner', 'intermediate', 'advanced', 'expert'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-xl font-black capitalize transition-all border border-[#1E222A]/30 cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-[#1E222A] text-[#FFD200] border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {activeScenarioId ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300">
                Playing: {PREDETERMINED_SCENARIOS.find((s) => s.id === activeScenarioId)?.title}
              </span>
              <button
                onClick={() => {
                  onResetToFreePlay();
                  onClose();
                }}
                className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-800 border-2 border-rose-300 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Return to Free Play
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-[#1E222A]/20">
                Mode: Sandbox Free Play
              </span>
            </div>
          )}
        </div>

        {/* Scenarios Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredScenarios.map((scenario) => {
            const isActive = activeScenarioId === scenario.id;
            const diffStyle = difficultyColors[scenario.difficulty];

            return (
              <div
                key={scenario.id}
                className={`p-5 rounded-2xl border-[2.5px] transition-all relative ${
                  isActive
                    ? 'bg-[#FFD200]/15 border-[#1E222A] shadow-[0_4px_0_#1E222A] ring-2 ring-[#FFD200]'
                    : 'bg-white border-[#1E222A] hover:border-[#1E222A] shadow-[0_3px_0_#1E222A]'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-[#1E222A]/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-lg border ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}
                      >
                        {scenario.difficulty}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#48A2D8]" />
                        {scenario.durationDays} Sprints ({scenario.durationDays} Days)
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        Starting Funds: ${scenario.startingFunds} · Unlocked Lanes: {scenario.startingUnlockedBooths}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-black text-[#1E222A] tracking-tight pt-1"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {scenario.title}
                    </h3>
                    <p className="text-xs font-bold text-[#E85D04] italic">
                      {scenario.tagline}
                    </p>
                  </div>

                  {isActive ? (
                    <span className="self-start px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      In Progress
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectScenario(scenario);
                        onClose();
                      }}
                      className="self-start px-4 py-2 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-xs border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 shrink-0 cursor-pointer"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Challenge</span>
                    </button>
                  )}
                </div>

                {/* Narrative Description */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium mt-3">
                  {scenario.description}
                </p>

                {/* Win / Loss Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-black text-[11px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                      <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                      Win Condition
                    </div>
                    <p className="text-slate-800 font-semibold text-[11px]">
                      {scenario.winConditionSummary}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-300/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-900 font-black text-[11px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      Loss Condition
                    </div>
                    <p className="text-slate-800 font-semibold text-[11px]">
                      {scenario.lossConditionSummary}
                    </p>
                  </div>
                </div>

                {/* Agile Concept Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="text-slate-600 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD200]" />
                    <span>Teaches: <strong className="text-[#1E222A]">{scenario.agileConceptTaught}</strong></span>
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    {scenario.events.length} dynamic incidents configured
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t-[2.5px] border-[#1E222A] flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => {
              onResetToFreePlay();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#1E222A] text-slate-700 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Switch to Free Play (Sandbox)
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1E222A] text-white hover:bg-slate-800 font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
