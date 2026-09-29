import React, { useState } from 'react';
import { TollBooth, FerryDock, LaneSpecialization } from '../types/game';
import {
  Zap,
  TrendingUp,
  Sliders,
  Ship,
  Sparkles,
  Lock,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Receipt,
  X
} from 'lucide-react';

interface UpgradePanelProps {
  booths: TollBooth[];
  ferry: FerryDock;
  funds: number;
  pendingDailyRevenue?: number;
  dailyDues?: {
    efficiencyTax: number;
    automationDues: number;
    trainingDues: number;
    ferryUpgradesTax: number;
    baseFacilityDues: number;
    totalDailyDues: number;
  };
  selectedBoothId: number | null;
  onSelectBooth: (id: number | null) => void;
  onUnlockBooth: (id: number) => void;
  onUpgradeEfficiency: (id: number) => void;
  onUpgradeAutomation: (id: number) => void;
  onUpgradeTraining: (id: number) => void;
  onUpgradeFerryCapacity: () => void;
  onUpgradeFerrySpeed: () => void;
  onUpgradeFerryAmenities: () => void;
  onSetWipLimit: (id: number, limit: number) => void;
  onSetSpecialization: (id: number, spec: LaneSpecialization) => void;
  onToggleAutoDepart: (type: 'onFull' | 'onTimer') => void;
  onSetDailyDuration?: (seconds: number) => void;
  continuousFlowMode?: boolean;
  onToggleContinuousFlow?: () => void;
  onResolveIncident?: (id: number, emergency?: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const UpgradePanel: React.FC<UpgradePanelProps> = ({
  booths = [],
  ferry,
  funds = 0,
  pendingDailyRevenue = 0,
  dailyDues,
  selectedBoothId,
  onSelectBooth,
  onUnlockBooth,
  onUpgradeEfficiency,
  onUpgradeAutomation,
  onUpgradeTraining,
  onUpgradeFerryCapacity,
  onUpgradeFerrySpeed,
  onUpgradeFerryAmenities,
  onSetWipLimit,
  onSetSpecialization,
  onToggleAutoDepart,
  onSetDailyDuration,
  continuousFlowMode = true,
  onToggleContinuousFlow,
  onResolveIncident,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'booths' | 'ferry'>('booths');

  React.useEffect(() => {
    if (isOpen === false) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (isOpen !== undefined && !isOpen) {
    return null;
  }

  // Fallback booth in case booths array is empty or booth is not found
  const fallbackBooth: TollBooth = booths[0] || {
    id: 0,
    name: 'Lane 1 · Alpha Squad',
    unlocked: true,
    unlockCost: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    multiplier: 1.0,
    efficiencyLevel: 1,
    automationLevel: 1,
    trainingLevel: 1,
    wipLimit: 4,
    specialization: 'all',
    currentVehicleId: null,
    processingProgress: 0,
    processingDuration: 0,
    isProcessing: false,
    barrierRaised: false,
    cooldownTimer: 0,
    cooldownDuration: 3.5,
    incident: null,
    timeSinceLastIncident: 0,
    totalProcessedCount: 0,
    totalPointsProcessed: 0,
    totalRevenueGenerated: 0
  };

  // Currently focused booth
  const focusedBooth = booths.find((b) => b.id === (selectedBoothId ?? 0)) || booths[0] || fallbackBooth;

  // Upgrade costs with safe fallback levels
  const effLevel = focusedBooth.efficiencyLevel ?? 1;
  const autoLevel = focusedBooth.automationLevel ?? 1;
  const trainLevel = focusedBooth.trainingLevel ?? 1;
  const efficiencyCost = Math.round(75 * Math.pow(1.5, effLevel));
  const automationCost = Math.round(150 * Math.pow(1.7, autoLevel));
  const trainingCost = Math.round(100 * Math.pow(1.6, trainLevel));

  const capLevel = ferry?.capacityLevel ?? 1;
  const spdLevel = ferry?.speedLevel ?? 1;
  const amenLevel = ferry?.amenitiesLevel ?? 1;
  const ferryCapacityCost = Math.round(120 * Math.pow(1.6, capLevel));
  const ferrySpeedCost = Math.round(150 * Math.pow(1.7, spdLevel));
  const ferryAmenitiesCost = Math.round(200 * Math.pow(1.8, amenLevel));

  const panelContent = (
    <div className="bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 sm:p-8 text-[#1E222A] space-y-6 shadow-[0_8px_0_#1E222A] relative w-full">
      {/* Decorative Corner Rivets */}
      <div className="rivet top-3 left-3" />
      <div className="rivet top-3 right-3" />
      <div className="rivet bottom-3 left-3" />
      <div className="rivet bottom-3 right-3" />

      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-[2.5px] border-[#1E222A]/20">
        <div>
          <h2
            className="text-xl sm:text-2xl font-black text-[#1E222A] tracking-tight flex items-center gap-2.5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFD200] border-2 border-[#1E222A]" />
            Harbor Works &amp; Infrastructure Upgrades
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
            Level up booth experience multipliers, automate toll barriers, and scale ferry sprint capacity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#1E222A] rounded-2xl border-2 border-[#1E222A] shadow-inner">
            <button
              onClick={() => setActiveTab('booths')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'booths'
                  ? 'bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Sliders className="w-4 h-4 text-[#E85D04]" />
              Toll Booths &amp; Squads
            </button>
            <button
              onClick={() => setActiveTab('ferry')}
              className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ferry'
                  ? 'bg-[#48A2D8] text-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Ship className="w-4 h-4 text-[#48A2D8]" />
              Ferry &amp; Cadence
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-[#1E222A] hover:bg-[#2B2F38] text-white border-2 border-[#1E222A] transition-colors cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
              title="Close Upgrades (Esc)"
            >
              <X className="w-5 h-5 text-[#FFD200]" />
            </button>
          )}
        </div>
      </div>

      {/* Fiscal Policy & Daily Dues Notice Banner */}
      <div className="bg-white border-2 border-[#1E222A] p-3.5 rounded-2xl shadow-[0_2px_0_#1E222A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFD200] border-2 border-[#1E222A] flex items-center justify-center shrink-0 shadow-[0_2px_0_#1E222A]">
            <Receipt className="w-4 h-4 text-[#1E222A]" />
          </div>
          <div>
            <div className="font-black text-[#1E222A] text-xs" style={{ fontFamily: 'var(--font-heading)' }}>
              End-of-Day Settlement Policy &amp; Efficiency Taxes
            </div>
            <div className="text-[11px] text-slate-600 font-semibold">
              Player funding is disbursed only at the end of each day (05:00 PM release). Daily due includes paying operational taxes on higher efficiency booths &amp; upgrades.
            </div>
          </div>
        </div>

        {dailyDues && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center font-mono">
            <div className="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px]" title="Daily taxes on efficiency tiers, upgrades, and open lanes">
              Daily Dues: <span className="font-black text-rose-900">-${dailyDues.totalDailyDues}/day</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]" title="Accumulating today, settles at day release">
              Accruing: <span className="font-black text-emerald-900">+${pendingDailyRevenue}</span>
            </div>
          </div>
        )}
      </div>

      {/* BOOTHS TAB CONTENT */}
      {activeTab === 'booths' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lane Selector Sidebar (1 col) */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Select Lane to Configure
            </label>
            <div className="space-y-2">
              {booths.map((b) => {
                const isSelected = focusedBooth.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelectBooth(b.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border-[2.5px] transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFD200] border-[#1E222A] text-[#1E222A] shadow-[0_4px_0_#1E222A]'
                        : b.unlocked
                        ? 'bg-white border-[#1E222A] text-[#1E222A] hover:bg-slate-50 shadow-[0_2px_0_#1E222A]'
                        : 'bg-slate-200 border-[#1E222A]/40 text-slate-500 hover:bg-slate-300/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full border border-[#1E222A] shrink-0 ${
                          b.unlocked
                            ? b.isProcessing
                              ? 'bg-[#48A2D8] animate-pulse'
                              : 'bg-[#10b981]'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-black leading-none" style={{ fontFamily: 'var(--font-heading)' }}>{b.name}</div>
                        <div className="text-[11px] text-slate-600 mt-1 font-mono font-bold">
                          {b.unlocked ? `Lv.${b.level} · x${b.multiplier.toFixed(2)} Multiplier` : 'Locked Lane'}
                        </div>
                      </div>
                    </div>

                    {!b.unlocked && (
                      <span className="text-[11px] font-mono font-black text-[#D92525] bg-[#D92525]/10 px-2 py-0.5 rounded-lg border border-[#D92525]/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        ${b.unlockCost}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focused Booth Configuration & Upgrades (2 cols) */}
          <div className="lg:col-span-2 space-y-6 bg-white border-[2.5px] border-[#1E222A] p-6 rounded-2xl shadow-[0_4px_0_#1E222A]">
            {/* Booth Header with Experience Progress */}
            {focusedBooth.unlocked ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
                  <div>
                    <h3 className="text-lg font-black text-[#1E222A] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      {focusedBooth.name}
                      <span className="text-xs font-mono font-black text-[#1E222A] bg-[#FFD200] px-2.5 py-0.5 rounded-xl border-2 border-[#1E222A]">
                        x{(focusedBooth.multiplier ?? 1.0).toFixed(2)} Multiplier
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 font-semibold mt-1">
                      Earns +{Math.round(((focusedBooth.multiplier ?? 1.0) - 1) * 100)}% revenue &amp; points bonus with team experience.
                    </p>
                  </div>

                  {/* XP Bar */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-slate-700">
                      Level {focusedBooth.level ?? 1} · {focusedBooth.xp ?? 0} / {focusedBooth.xpToNextLevel || 100} XP
                    </div>
                    <div className="w-48 h-3 bg-slate-200 border-2 border-[#1E222A] rounded-full mt-1.5 overflow-hidden p-0.5">
                      <div
                        className="h-full bg-[#FFD200] rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (((focusedBooth.xp ?? 0) / (focusedBooth.xpToNextLevel || 100)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cooldown & Incident Alert Status Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 rounded-xl border border-slate-300 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E85D04]" />
                    <span className="font-bold text-[#1E222A]">
                      Turnaround Cooldown:
                    </span>
                    <span className="font-mono font-black text-[#1E222A] bg-[#FFD200] px-2 py-0.5 rounded-lg border border-[#1E222A]">
                      {(focusedBooth.cooldownDuration ?? 3.5).toFixed(1)}s
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                      (Reduces with level: Lvl 1 = 3.5s → Lvl 8+ = 0.1s)
                    </span>
                  </div>

                  {focusedBooth.incident && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-600 animate-pulse">
                        ⚠️ {focusedBooth.incident.title} ({Math.ceil(focusedBooth.incident.remaining)}s)
                      </span>
                      {onResolveIncident && (
                        <button
                          onClick={() => onResolveIncident(focusedBooth.id, true)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-xs cursor-pointer shadow-sm"
                        >
                          Clear (${focusedBooth.incident.quickFixCost})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 3 Core Upgrades */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Upgrade 1: Processing Speed / Efficiency */}
                  <div className="bg-[#F4F6F9] border-2 border-[#1E222A] p-4 rounded-2xl flex flex-col justify-between shadow-[0_3px_0_#1E222A]">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span className="font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>Efficiency</span>
                        <Zap className="w-4 h-4 text-[#E85D04]" />
                      </div>
                      <div className="text-xl font-black text-[#1E222A] font-mono mt-1">
                        Tier {focusedBooth.efficiencyLevel}
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                        +{focusedBooth.efficiencyLevel * 25}% vehicle processing speed.
                      </p>
                      <div className="mt-2 text-[10px] font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                        Daily Due: +$20/tier tax
                      </div>
                    </div>

                    <button
                      onClick={() => onUpgradeEfficiency(focusedBooth.id)}
                      disabled={funds < efficiencyCost}
                      className={`mt-4 w-full py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        funds >= efficiencyCost
                          ? 'bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none'
                          : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Upgrade (${efficiencyCost})
                    </button>
                  </div>

                  {/* Upgrade 2: Automation / E-ZPass */}
                  <div className="bg-[#F4F6F9] border-2 border-[#1E222A] p-4 rounded-2xl flex flex-col justify-between shadow-[0_3px_0_#1E222A]">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span className="font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>E-ZPass Gate</span>
                        <Sparkles className="w-4 h-4 text-[#48A2D8]" />
                      </div>
                      <div className="text-xl font-black text-[#48A2D8] font-mono mt-1">
                        Tier {focusedBooth.automationLevel}
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                        Automated RFID scanner cuts gate delay and speeds departures.
                      </p>
                      <div className="mt-2 text-[10px] font-mono font-bold text-sky-900 bg-sky-100/80 px-2 py-0.5 rounded border border-sky-300">
                        Daily Due: +$25/tier maintenance
                      </div>
                    </div>

                    <button
                      onClick={() => onUpgradeAutomation(focusedBooth.id)}
                      disabled={funds < automationCost}
                      className={`mt-4 w-full py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        funds >= automationCost
                          ? 'bg-[#48A2D8] hover:bg-[#5CB5EB] text-white shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none'
                          : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Upgrade (${automationCost})
                    </button>
                  </div>

                  {/* Upgrade 3: Mentorship / Training */}
                  <div className="bg-[#F4F6F9] border-2 border-[#1E222A] p-4 rounded-2xl flex flex-col justify-between shadow-[0_3px_0_#1E222A]">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                        <span className="font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>Mentorship</span>
                        <TrendingUp className="w-4 h-4 text-[#E85D04]" />
                      </div>
                      <div className="text-xl font-black text-[#E85D04] font-mono mt-1">
                        Tier {focusedBooth.trainingLevel}
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-snug">
                        +{focusedBooth.trainingLevel * 30}% XP gain to level up multiplier faster.
                      </p>
                      <div className="mt-2 text-[10px] font-mono font-bold text-rose-900 bg-rose-100/80 px-2 py-0.5 rounded border border-rose-300">
                        Daily Due: +$15/tier coaching
                      </div>
                    </div>

                    <button
                      onClick={() => onUpgradeTraining(focusedBooth.id)}
                      disabled={funds < trainingCost}
                      className={`mt-4 w-full py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        funds >= trainingCost
                          ? 'bg-[#E85D04] hover:bg-[#F47019] text-white shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none'
                          : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Upgrade (${trainingCost})
                    </button>
                  </div>
                </div>

                {/* Agile Kanban Flow Controls (WIP Limit & Specialization) */}
                <div className="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kanban WIP Limit Slider */}
                  <div className="space-y-2 p-3.5 bg-[#F4F6F9] border-2 border-[#1E222A] rounded-2xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>Lane WIP Limit</span>
                      <span className="font-mono font-black text-[#1E222A] bg-[#FFD200] px-2 py-0.5 rounded-lg border border-[#1E222A]">
                        {focusedBooth.wipLimit} vehicles
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={focusedBooth.wipLimit}
                      onChange={(e) => onSetWipLimit(focusedBooth.id, Number(e.target.value))}
                      className="w-full accent-[#E85D04] cursor-pointer h-2 bg-slate-300 rounded-lg"
                    />
                    <div className="text-[10px] font-bold text-slate-500 flex justify-between">
                      <span>Lean (1)</span>
                      <span>Balanced (4)</span>
                      <span>High WIP (8)</span>
                    </div>
                  </div>

                  {/* Class of Service / Specialization */}
                  <div className="space-y-2 p-3.5 bg-[#F4F6F9] border-2 border-[#1E222A] rounded-2xl">
                    <label className="text-xs font-black text-[#1E222A] block" style={{ fontFamily: 'var(--font-heading)' }}>
                      Class of Service Specialization
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => onSetSpecialization(focusedBooth.id, 'all')}
                        className={`py-1.5 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all cursor-pointer ${
                          focusedBooth.specialization === 'all'
                            ? 'bg-[#1E222A] text-white shadow-[0_2px_0_#1E222A]'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        All Stories
                      </button>
                      <button
                        onClick={() => onSetSpecialization(focusedBooth.id, 'small_only')}
                        className={`py-1.5 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all cursor-pointer ${
                          focusedBooth.specialization === 'small_only'
                            ? 'bg-[#48A2D8] text-white shadow-[0_2px_0_#1E222A]'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ⚡ Fast (1-3)
                      </button>
                      <button
                        onClick={() => onSetSpecialization(focusedBooth.id, 'heavy_only')}
                        className={`py-1.5 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all cursor-pointer ${
                          focusedBooth.specialization === 'heavy_only'
                            ? 'bg-[#E85D04] text-white shadow-[0_2px_0_#1E222A]'
                            : 'bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        🚛 Epic (5+)
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Locked Lane View */
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#D92525]/10 border-2 border-[#D92525] flex items-center justify-center mx-auto text-[#D92525] shadow-[0_4px_0_#D92525]">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                    Unlock {focusedBooth.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-sm mx-auto mt-1">
                    Opening another toll lane increases your port throughput, directly reducing queue lead times and backlog congestion!
                  </p>
                </div>
                <button
                  onClick={() => onUnlockBooth(focusedBooth.id)}
                  disabled={funds < focusedBooth.unlockCost}
                  className={`px-6 py-2.5 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all ${
                    funds >= focusedBooth.unlockCost
                      ? 'bg-[#D92525] hover:bg-[#E83C3C] text-white cursor-pointer shadow-[0_4px_0_#1E222A] active:translate-y-0.5 active:shadow-none'
                      : 'bg-slate-300 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Unlock Lane for ${focusedBooth.unlockCost}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FERRY & SPRINT CADENCE TAB CONTENT */}
      {activeTab === 'ferry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Ferry Upgrade 1: Capacity */}
            <div className="bg-white border-[2.5px] border-[#1E222A] p-5 rounded-2xl flex flex-col justify-between shadow-[0_4px_0_#1E222A]">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>Vessel Capacity</span>
                  <Ship className="w-5 h-5 text-[#48A2D8]" />
                </div>
                <div className="text-2xl font-black text-[#48A2D8] font-mono mt-1">
                  {ferry?.capacity ?? 40} <span className="text-xs font-bold text-slate-500">pts</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Allows larger sprint releases (+25 story points per tier).
                </p>
                <div className="mt-2 text-[10px] font-mono font-bold text-sky-900 bg-sky-100/80 px-2 py-0.5 rounded border border-sky-300">
                  Daily Due: +$25/tier vessel maintenance
                </div>
              </div>

              <button
                onClick={onUpgradeFerryCapacity}
                disabled={funds < ferryCapacityCost}
                className={`mt-4 w-full py-2.5 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  funds >= ferryCapacityCost
                    ? 'bg-[#48A2D8] hover:bg-[#5CB5EB] text-white shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none'
                    : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Upgrade Capacity (${ferryCapacityCost})
              </button>
            </div>

            {/* Ferry Upgrade 2: Speed Turbines */}
            <div className="bg-white border-[2.5px] border-[#1E222A] p-5 rounded-2xl flex flex-col justify-between shadow-[0_4px_0_#1E222A]">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>Speed Turbines</span>
                  <Zap className="w-5 h-5 text-[#E85D04]" />
                </div>
                <div className="text-2xl font-black text-[#E85D04] font-mono mt-1">
                  Tier {ferry?.speedLevel ?? 1}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  +{((ferry?.speedLevel ?? 1) * 30)}% faster ferry voyage &amp; turnaround back to dock.
                </p>
                <div className="mt-2 text-[10px] font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                  Daily Due: +$20/tier turbine maintenance
                </div>
              </div>

              <button
                onClick={onUpgradeFerrySpeed}
                disabled={funds < ferrySpeedCost}
                className={`mt-4 w-full py-2.5 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  funds >= ferrySpeedCost
                    ? 'bg-[#E85D04] hover:bg-[#F47019] text-white shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none'
                    : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Upgrade Turbines (${ferrySpeedCost})
              </button>
            </div>

            {/* Ferry Upgrade 3: Sprint Delivery Bonus */}
            <div className="bg-white border-[2.5px] border-[#1E222A] p-5 rounded-2xl flex flex-col justify-between shadow-[0_4px_0_#1E222A]">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>Release Bonus</span>
                  <Sparkles className="w-5 h-5 text-[#FFD200]" />
                </div>
                <div className="text-2xl font-black text-[#1E222A] font-mono mt-1">
                  +{(((ferry?.amenitiesLevel ?? 1) - 1) * 35)}% Bonus
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Higher stakeholder satisfaction payout on every sprint release!
                </p>
                <div className="mt-2 text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                  Daily Due: +$20/tier hospitality licensing
                </div>
              </div>

              <button
                onClick={onUpgradeFerryAmenities}
                disabled={funds < ferryAmenitiesCost}
                className={`mt-4 w-full py-2.5 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  funds >= ferryAmenitiesCost
                    ? 'bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none'
                    : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Upgrade Amenities (${ferryAmenitiesCost})
              </button>
            </div>
          </div>

          {/* Daily Sprint Cycle Cadence Controls */}
          <div className="bg-white border-[2.5px] border-[#1E222A] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_0_#1E222A]">
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-[#1E222A] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Clock className="w-4 h-4 text-[#E85D04]" />
                Daily Sprint Cycle &amp; Departure Cadence
              </h4>
              <p className="text-xs text-slate-600 font-semibold">
                Adjust how long each work day lasts before the daily release train departs at 05:00 PM.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-600 font-mono font-bold mr-1">Shift Length:</span>
              {[
                { label: '30s Fast', sec: 30 },
                { label: '45s Standard', sec: 45 },
                { label: '60s Relaxed', sec: 60 },
                { label: '90s Marathon', sec: 90 }
              ].map((opt) => (
                <button
                  key={opt.sec}
                  onClick={() => onSetDailyDuration && onSetDailyDuration(opt.sec)}
                  className={`px-3 py-1.5 text-xs font-mono font-black rounded-xl border-2 border-[#1E222A] transition-all cursor-pointer ${
                    (ferry?.sprintDuration ?? 45) === opt.sec
                      ? 'bg-[#FFD200] text-[#1E222A] shadow-[0_2px_0_#1E222A]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sprint Automation & Departure Rules */}
          <div className="bg-white border-[2.5px] border-[#1E222A] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_0_#1E222A]">
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-[#1E222A] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Ship className="w-4 h-4 text-[#48A2D8]" />
                Ferry Departure Triggers
              </h4>
              <p className="text-xs text-slate-600 font-semibold">
                The ferry casts off immediately when full (capacity reached) OR when the daily shift timer expires at 05:00 PM.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleAutoDepart('onFull')}
                className={`px-3.5 py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#1E222A] ${
                  ferry?.autoDepartOnFull
                    ? 'bg-[#48A2D8] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <CheckCircle2 className={`w-4 h-4 ${ferry?.autoDepartOnFull ? 'text-[#FFD200]' : 'text-slate-400'}`} />
                Depart when Full ({ferry?.capacity ?? 40} pts)
              </button>

              <button
                onClick={() => onToggleAutoDepart('onTimer')}
                className={`px-3.5 py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#1E222A] ${
                  ferry?.autoDepartOnTimer
                    ? 'bg-[#FFD200] text-[#1E222A]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <CheckCircle2 className={`w-4 h-4 ${ferry?.autoDepartOnTimer ? 'text-[#1E222A]' : 'text-slate-400'}`} />
                Depart on Timer ({Math.ceil(ferry?.sprintTimer ?? 45)}s)
              </button>
            </div>
          </div>

          {/* Continual Flow of Traffic Controller */}
          <div className="bg-white border-[2.5px] border-[#1E222A] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_4px_0_#1E222A]">
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-[#1E222A] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <Zap className="w-4 h-4 text-[#E85D04]" />
                Continual Flow of Traffic
              </h4>
              <p className="text-xs text-slate-600 font-semibold">
                In Continual Flow mode, user stories stream steadily from the backlog to prevent starved toll booths and test maximum pipeline throughput.
              </p>
            </div>

            {onToggleContinuousFlow && (
              <button
                onClick={onToggleContinuousFlow}
                className={`px-5 py-2.5 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center gap-2 cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none ${
                  continuousFlowMode
                    ? 'bg-[#FFD200] text-[#1E222A]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <Zap className={`w-4 h-4 ${continuousFlowMode ? 'text-[#E85D04] fill-[#E85D04]' : 'text-slate-400'}`} />
                <span>{continuousFlowMode ? 'Continual Flow: ACTIVE' : 'Continual Flow: PAUSED'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isOpen !== undefined) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        <div className="relative w-full max-w-5xl my-auto max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
          {panelContent}
        </div>
      </div>
    );
  }

  return panelContent;
};
