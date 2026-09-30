import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  Flag,
  GraduationCap,
  HelpCircle,
  Volume2,
  VolumeX,
  Ship,
  Sparkles,
  Award,
  Clock,
  TrendingUp,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Anchor,
  Zap,
  Sliders,
  Check,
  Info,
  X,
  Wrench
} from 'lucide-react';
import { PREDETERMINED_SCENARIOS } from '../data/scenarios';
import { ScenarioDefinition, ScenarioDifficulty } from '../types/scenarios';
import { sound } from '../utils/audio';
import { RivetCorners } from './RivetCorners';
import { getShipForSeason, ShipInfo, SHIP_NAMES_LIST } from '../data/shipNames';

interface MainMenuProps {
  isOpen: boolean;
  hasActiveGame: boolean;
  dayNumber: number;
  dayTimeFormatted: string;
  funds: number;
  totalPoints: number;
  ferryPoints: number;
  ferryCapacity: number;
  seasonNumber?: number;
  onNextSeason?: () => void;
  onPrevSeason?: () => void;
  onChangeSeason?: (season: number) => void;
  activeScenarioTitle?: string;
  soundEnabled: boolean;
  continuousFlowMode: boolean;
  gameSpeed: number;
  onResumeGame: () => void;
  onStartNewGame: () => void;
  onOpenScenarios: () => void;
  onSelectScenario: (scenario: ScenarioDefinition) => void;
  onOpenAcademy: () => void;
  onOpenSprintPlanning: () => void;
  onOpenUpgrades?: () => void;
  onToggleSound: () => void;
  onToggleContinuousFlow: () => void;
  onSetGameSpeed: (speed: number) => void;
}

type MenuTab = 'main' | 'scenarios' | 'howToPlay' | 'settings';

const difficultyBadgeColors: Record<ScenarioDifficulty, { bg: string; text: string; border: string }> = {
  beginner: { bg: 'bg-[#66BD29]/20', text: 'text-[#004831]', border: 'border-[#66BD29]' },
  intermediate: { bg: 'bg-[#48A2D8]/20', text: 'text-[#1E4D6B]', border: 'border-[#48A2D8]' },
  advanced: { bg: 'bg-[#FFD200]/30', text: 'text-[#8A5000]', border: 'border-[#E85D04]' },
  expert: { bg: 'bg-[#D92525]/20', text: 'text-[#D92525]', border: 'border-[#D92525]' }
};

interface VehicleShowcaseItem {
  points: number;
  title: string;
  category: string;
  color: string;
  accent: string;
  desc: string;
  sliceable?: boolean;
}

const VEHICLE_SHOWCASE: VehicleShowcaseItem[] = [
  { points: 1, title: 'Bug Fix', category: 'Sedan', color: '#10B981', accent: '#059669', desc: 'Fast processing touch time. Rarely causes lane blockage.' },
  { points: 2, title: 'Minor Task', category: 'Coupe', color: '#06B6D4', accent: '#0891B2', desc: 'Standard story ticket. Cruises smoothly through toll booths.' },
  { points: 3, title: 'User Story', category: 'Box Truck', color: '#3B82F6', accent: '#2563EB', desc: 'Standard business story. Moderate WIP processing duration.' },
  { points: 5, title: 'Feature Service', category: 'Flatbed', color: '#F59E0B', accent: '#D97706', desc: 'Medium-heavy delivery. Monitor lane WIP limits to prevent queuing.' },
  { points: 8, title: 'Heavy Refactor', category: 'Cement Mixer', color: '#EA580C', accent: '#C2410C', desc: 'Architectural ticket. Long touch time! Click in simulation to slice.', sliceable: true },
  { points: 13, title: 'Monolith Epic', category: 'Semi Haul', color: '#DC2626', accent: '#991B1B', desc: 'High-risk bottleneck! Causes massive lead time delays unless sliced.', sliceable: true }
];

export const MainMenu: React.FC<MainMenuProps> = ({
  isOpen,
  hasActiveGame,
  dayNumber,
  dayTimeFormatted,
  funds,
  totalPoints,
  ferryPoints,
  ferryCapacity,
  seasonNumber = 1,
  onNextSeason,
  onPrevSeason,
  onChangeSeason,
  activeScenarioTitle,
  soundEnabled,
  continuousFlowMode,
  gameSpeed,
  onResumeGame,
  onStartNewGame,
  onOpenScenarios: _onOpenScenarios,
  onSelectScenario,
  onOpenAcademy,
  onOpenSprintPlanning,
  onOpenUpgrades,
  onToggleSound,
  onToggleContinuousFlow,
  onSetGameSpeed
}) => {
  const [activeMenuTab, setActiveMenuTab] = useState<MenuTab>('main');
  const [selectedVehicleTip, setSelectedVehicleTip] = useState<VehicleShowcaseItem | null>(null);
  const [confirmRestartOpen, setConfirmRestartOpen] = useState<boolean>(false);

  const currentShip: ShipInfo = useMemo(() => getShipForSeason(seasonNumber), [seasonNumber]);

  // Keyboard shortcut listener: Space/Enter to Start/Resume, Esc to return to main
  useEffect(() => {
    if (!isOpen) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        if (confirmRestartOpen) {
          setConfirmRestartOpen(false);
        } else if (activeMenuTab !== 'main') {
          setActiveMenuTab('main');
        } else if (hasActiveGame) {
          onResumeGame();
        }
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (activeMenuTab === 'main') {
          if (confirmRestartOpen) {
            onStartNewGame();
            setConfirmRestartOpen(false);
          } else if (hasActiveGame) {
            onResumeGame();
          } else {
            onStartNewGame();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen, activeMenuTab, hasActiveGame, confirmRestartOpen, onResumeGame, onStartNewGame]);

  if (!isOpen) return null;

  const handleStartOrResume = () => {
    sound.playClick();
    if (hasActiveGame) {
      onResumeGame();
    } else {
      onStartNewGame();
    }
  };

  const handleVehicleClick = (item: VehicleShowcaseItem) => {
    if (item.sliceable) {
      sound.playSliceSound();
    } else {
      sound.playHonk();
    }
    setSelectedVehicleTip(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B2F38] text-[#F4F6F9] overflow-y-auto font-sans select-none animate-fadeIn">
      {/* Background Decorative Nautical & Industrial Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #FFD200 1.5px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
        {/* Subtle Diagonal Hazard Stripes Watermark */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 opacity-15"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #FFD200, #FFD200 20px, #1E222A 20px, #1E222A 40px)'
          }}
        />
      </div>

      <div className="relative w-full max-w-5xl my-auto px-4 sm:px-6 py-6 sm:py-8 z-10 flex flex-col space-y-6">
        {/* Hero Section: Game Logo Lockup & Animated Port Harbor Scene */}
        <div className="relative p-6 sm:p-8 bg-[#F4F6F9] border-[3.5px] border-[#1E222A] rounded-3xl shadow-[0_12px_0_#1E222A] text-[#1E222A] overflow-hidden">
          <RivetCorners />

          {/* Top Title Banner */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center lg:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD200] border-2 border-[#1E222A] text-xs font-black uppercase tracking-wider shadow-[0_2px_0_#1E222A]">
                <Ship className="w-4 h-4 text-[#1E222A]" />
                <span>Huntington Harbor Terminal &bull; Continuous Delivery Port</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-black text-[#1E222A] tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                SPRINT <span className="text-[#E85D04]">TOLLS</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-extrabold max-w-xl">
                The Agile Flow & Toll Operations Simulator. Direct story-point vehicles, calibrate lane WIP limits, slice monolithic epics, and ferry your releases into production before the 5:00 PM deadline!
              </p>
            </div>

            {/* Harbor Ferry & Pier Illustration Card */}
            <div className="w-full lg:w-72 bg-[#2B2F38] border-[3px] border-[#1E222A] rounded-2xl p-4 text-[#F4F6F9] shadow-[0_6px_0_#1E222A] relative flex flex-col justify-between shrink-0">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#FFD200]">
                  <Anchor className="w-4 h-4" />
                  <span>BERTH #1 &bull; {currentShip.name.toUpperCase()}</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" title="Berth Ready for Boarding" />
              </div>

              {/* Ferry Visual Graphic */}
              <div className="h-24 relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#1E222A] to-[#1E4D6B] border border-black/40">
                {/* Ocean Waves */}
                <div className="absolute bottom-0 inset-x-0 h-7 bg-[#48A2D8]/40 border-t-2 border-[#48A2D8] flex items-center justify-around">
                  <div className="w-6 h-2 rounded-full bg-white/30 animate-pulse" />
                  <div className="w-8 h-2 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '300ms' }} />
                  <div className="w-5 h-2 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '600ms' }} />
                </div>

                {/* Floating Ferry Vessel */}
                <div className="relative flex flex-col items-center animate-bounce" style={{ animationDuration: '3s' }}>
                  {/* Smokestack Steam Puff */}
                  <div className="w-2 h-2 rounded-full bg-white/40 mb-0.5 animate-ping" />
                  {/* Wheelhouse */}
                  <div className="w-10 h-6 bg-[#F4F6F9] border-2 border-[#1E222A] rounded-t-md flex items-center justify-around px-1">
                    <div className="w-1.5 h-2 bg-[#48A2D8] rounded-sm" />
                    <div className="w-1.5 h-2 bg-[#48A2D8] rounded-sm" />
                  </div>
                  {/* Vessel Hull */}
                  <div className="w-28 h-7 bg-[#FFD200] border-2 border-[#1E222A] rounded-b-xl flex items-center justify-center shadow-md relative">
                    <span className="text-[9px] font-mono font-black text-[#1E222A] tracking-wider">
                      {currentShip.shortTag}
                    </span>
                    <span className="absolute right-1 text-[10px]">🚢</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
                <span className="text-slate-400">Season {seasonNumber}:</span>
                <div className="flex items-center gap-1.5">
                  {onPrevSeason && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onPrevSeason();
                      }}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[#FFD200] rounded font-black text-[10px] cursor-pointer"
                      title="Previous Season Ship"
                    >
                      &larr;
                    </button>
                  )}
                  <span className="text-[#FFD200] font-black text-right truncate max-w-[130px]" title={`${currentShip.fullName} • ${currentShip.motto}`}>
                    {currentShip.name} (#{currentShip.hullNumber})
                  </span>
                  {onNextSeason && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onNextSeason();
                      }}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[#FFD200] rounded font-black text-[10px] cursor-pointer"
                      title="Next Season Ship"
                    >
                      &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Little's Law Operational Banner */}
          <div className="mt-6 p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#48A2D8] border-2 border-[#1E222A] flex items-center justify-center text-white shadow-[0_2px_0_#1E222A]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black uppercase text-slate-500 tracking-wider">
                    Guiding Physics
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD200] border border-[#1E222A] text-[#1E222A] font-black">
                    Little's Law
                  </span>
                </div>
                <div className="text-sm font-black text-[#1E222A] mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  Lead Time = Work in Progress (WIP) &divide; Throughput Rate
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 font-semibold max-w-sm text-center sm:text-right">
              Lower Work-In-Progress limits keep vehicles moving swiftly through toll lanes, driving down cycle times and eliminating gridlock!
            </div>
          </div>

          {/* Interactive Agile Story Vehicle Showcase Strip */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="uppercase tracking-wider font-black text-[11px]" style={{ fontFamily: 'var(--font-heading)' }}>
                Incoming Story Vehicles (Fibonacci Sizing):
              </span>
              <span className="text-[11px] text-slate-500 italic">
                Click any vehicle to inspect mechanics
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {VEHICLE_SHOWCASE.map((item) => (
                <button
                  key={item.points}
                  onClick={() => handleVehicleClick(item)}
                  className={`p-2.5 rounded-2xl border-2 border-[#1E222A] transition-all cursor-pointer flex flex-col items-center justify-between text-center shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-[0_1px_0_#1E222A] ${
                    selectedVehicleTip?.points === item.points
                      ? 'bg-[#FFD200] ring-2 ring-[#1E222A]'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className="w-6 h-6 rounded-lg text-white font-mono font-black text-xs flex items-center justify-center border border-[#1E222A] shadow-sm"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.points}
                    </span>
                    {item.sliceable && (
                      <span className="text-[10px] font-mono px-1 rounded bg-[#E85D04] text-white font-bold flex items-center gap-0.5" title="Sliceable in simulation">
                        <Scissors className="w-2.5 h-2.5" />
                        <span>Slice</span>
                      </span>
                    )}
                  </div>

                  <div className="font-black text-xs text-[#1E222A] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                    {item.title}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold mt-0.5">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>

            {/* Vehicle Interactive Tip Callout */}
            {selectedVehicleTip && (
              <div className="mt-3 p-3 bg-amber-50 border-2 border-[#E85D04] rounded-2xl text-xs text-slate-800 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-lg text-white font-mono font-black text-xs flex items-center justify-center border border-[#1E222A]"
                    style={{ backgroundColor: selectedVehicleTip.color }}
                  >
                    {selectedVehicleTip.points}
                  </span>
                  <div>
                    <strong>{selectedVehicleTip.title} ({selectedVehicleTip.points} Story Points):</strong> {selectedVehicleTip.desc}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVehicleTip(null)}
                  className="text-slate-400 hover:text-black p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs for Menu Modes */}
        <div className="flex items-center gap-2 bg-[#1E222A] p-1.5 rounded-2xl border-[3px] border-[#1E222A] shadow-inner overflow-x-auto">
          <button
            onClick={() => {
              sound.playClick();
              setActiveMenuTab(activeMenuTab === 'howToPlay' ? 'main' : 'howToPlay');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMenuTab === 'howToPlay'
                ? 'bg-[#FFD200] text-[#1E222A] shadow-[0_3px_0_#1E222A]'
                : 'text-slate-300 hover:text-white'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <HelpCircle className="w-4 h-4" />
            <span>How to Play</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveMenuTab(activeMenuTab === 'settings' ? 'main' : 'settings');
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMenuTab === 'settings'
                ? 'bg-[#FFD200] text-[#1E222A] shadow-[0_3px_0_#1E222A]'
                : 'text-slate-300 hover:text-white'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <Sliders className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Tab 1: Main Launch Operations Hub */}
        {activeMenuTab === 'main' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Active Shift Resume Card (if session already running) */}
            {hasActiveGame && (
              <div className="p-5 sm:p-6 bg-[#004831] border-[3px] border-[#66BD29] rounded-3xl shadow-[0_8px_0_#1E222A] text-white relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#66BD29] text-[#003624] font-mono font-black text-xs uppercase">
                        Shift In Progress
                      </span>
                      <span className="text-xs font-mono text-emerald-200">
                        Day {dayNumber} &bull; {dayTimeFormatted}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      Resume Active Port Operations
                    </h3>
                    <p className="text-xs text-emerald-200/90 font-medium">
                      Active mode: <strong>{activeScenarioTitle || 'Sandbox Free Play'}</strong> &bull; All booth levels, staged stories, and bank balances are preserved.
                    </p>
                  </div>

                  {/* Shift Mini Telemetry */}
                  <div className="flex items-center gap-3 bg-[#003624] px-4 py-2.5 rounded-2xl border border-[#66BD29]/40 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-emerald-300 uppercase">Settled Bank</div>
                      <div className="text-base font-black text-[#FFD200]">${funds.toLocaleString()}</div>
                    </div>
                    <div className="w-px h-8 bg-emerald-800" />
                    <div>
                      <div className="text-[10px] text-emerald-300 uppercase">Delivered</div>
                      <div className="text-base font-black text-white">{totalPoints} pts</div>
                    </div>
                    <div className="w-px h-8 bg-emerald-800" />
                    <div>
                      <div className="text-[10px] text-emerald-300 uppercase">Ferry Berth</div>
                      <div className="text-base font-black text-[#48A2D8]">{ferryPoints}/{ferryCapacity}</div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons for Active Shift */}
                <div className="mt-5 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={onResumeGame}
                    className="px-6 py-3.5 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black rounded-2xl border-[3px] border-[#1E222A] shadow-[0_5px_0_#1E222A] active:translate-y-1 active:shadow-[0_1px_0_#1E222A] transition-all cursor-pointer flex items-center gap-2.5 text-base"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>RESUME SHIFT (DAY {dayNumber})</span>
                  </button>

                  <button
                    onClick={() => setConfirmRestartOpen(true)}
                    className="px-4 py-2.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 border-2 border-rose-600 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_2px_0_#1E222A]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Abandon Shift & Restart</span>
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Dialog for Restart */}
            {confirmRestartOpen && (
              <div className="p-4 sm:p-5 bg-rose-50 border-[3px] border-[#D92525] rounded-3xl shadow-[0_6px_0_#1E222A] text-[#1E222A] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#D92525] text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#D92525] leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                      Restart Harbor Operations?
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">
                      This will reset bank funds to $200, restart at Day 1 morning, and clear in-progress vehicles.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      sound.playFerryHorn();
                      onStartNewGame();
                      setConfirmRestartOpen(false);
                    }}
                    className="px-4 py-2 bg-[#D92525] hover:bg-red-700 text-white font-black rounded-xl border-2 border-[#1E222A] text-xs transition-all cursor-pointer shadow-[0_2px_0_#1E222A]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    Yes, Start Fresh Shift
                  </button>
                  <button
                    onClick={() => setConfirmRestartOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl border-2 border-[#1E222A] text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Launch Modes Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Free Play Sandbox */}
              <div className="p-6 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl shadow-[0_8px_0_#1E222A] text-[#1E222A] flex flex-col justify-between relative overflow-hidden group hover:border-[#FFD200] transition-colors">
                <RivetCorners />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#FFD200] border-2 border-[#1E222A] text-[11px] font-black uppercase font-mono shadow-[0_2px_0_#1E222A]">
                      Free Play Mode
                    </span>
                    <Ship className="w-5 h-5 text-slate-500 group-hover:rotate-12 transition-transform" />
                  </div>

                  <h3 className="text-2xl font-black text-[#1E222A] tracking-tight leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                    Standard Harbor Shift
                  </h3>

                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Full operational freedom. Manage 6 customizable toll lanes, calibrate Kanban WIP limits, stage user stories in the sprint parking lots, and release daily ferry deployments to collect toll revenues.
                  </p>

                  <ul className="text-xs text-slate-700 font-bold space-y-1.5 pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>$200 starting settled bank treasury</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dynamic highway inflow & backlog curations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Upgrade toll booths to E-ZPass and automate</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-[#1E222A]/15">
                  <button
                    onClick={handleStartOrResume}
                    className="w-full py-3.5 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black rounded-2xl border-[3px] border-[#1E222A] shadow-[0_5px_0_#1E222A] active:translate-y-1 active:shadow-[0_1px_0_#1E222A] transition-all cursor-pointer flex items-center justify-center gap-2 text-base"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{hasActiveGame ? 'RESUME HARBOR SHIFT' : 'START SHIFT (FREE PLAY)'}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Scenario Challenges Preview */}
              <div className="p-6 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl shadow-[0_8px_0_#1E222A] text-[#1E222A] flex flex-col justify-between relative overflow-hidden group hover:border-[#66BD29] transition-colors">
                <RivetCorners />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#004831] border-2 border-[#66BD29] text-[11px] font-black uppercase font-mono text-white shadow-[0_2px_0_#1E222A]">
                      5 Tech Operations
                    </span>
                    <Flag className="w-5 h-5 text-[#66BD29] group-hover:scale-110 transition-transform" />
                  </div>

                  <h3 className="text-2xl font-black text-[#1E222A] tracking-tight leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                    Tactical Challenges
                  </h3>

                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    Test your agile leadership under high-pressure scenarios with distinct win/lose conditions, Little's Law constraints, scheduled crisis events, and performance post-mortems.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {PREDETERMINED_SCENARIOS.slice(0, 3).map((sc) => (
                      <div key={sc.id} className="p-2 rounded-xl bg-white border border-[#1E222A]/20 flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#1E222A] truncate mr-2">
                          {sc.title}
                        </span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${difficultyBadgeColors[sc.difficulty].bg} ${difficultyBadgeColors[sc.difficulty].text} ${difficultyBadgeColors[sc.difficulty].border}`}>
                          {sc.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-[#1E222A]/15">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveMenuTab('scenarios');
                    }}
                    className="w-full py-3.5 bg-[#66BD29] hover:bg-[#77D236] text-[#003624] font-black rounded-2xl border-[3px] border-[#1E222A] shadow-[0_5px_0_#1E222A] active:translate-y-1 active:shadow-[0_1px_0_#1E222A] transition-all cursor-pointer flex items-center justify-center gap-2 text-base"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <Flag className="w-5 h-5" />
                    <span>VIEW ALL SCENARIOS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Secondary Support Dock: Agile Academy */}
            <div>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenAcademy();
                }}
                className="w-full p-4 rounded-2xl bg-[#1E222A] border-[2.5px] border-[#1E222A] hover:border-[#FFD200] text-white flex items-center gap-3.5 shadow-[0_4px_0_#1E222A] active:translate-y-0.5 cursor-pointer text-left transition-all group"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#FFD200]" style={{ fontFamily: 'var(--font-heading)' }}>
                    Agile Academy &amp; Quizzes
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    Learn Little's Law, WIP discipline, and earn bonus treasury!
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Scenario Challenges Full Roster */}
        {activeMenuTab === 'scenarios' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between bg-[#1E222A] p-4 rounded-2xl border-2 border-[#1E222A]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#66BD29] text-[#004831] flex items-center justify-center font-black">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                    Predetermined Tech Scenarios
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">
                    Select a scenario mission to begin immediately with customized starting conditions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveMenuTab('main')}
                className="text-xs font-mono font-bold text-[#FFD200] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>&larr; Back to Launch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREDETERMINED_SCENARIOS.map((scenario) => {
                const diffStyle = difficultyBadgeColors[scenario.difficulty];
                return (
                  <div
                    key={scenario.id}
                    className="p-5 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-2xl text-[#1E222A] shadow-[0_6px_0_#1E222A] flex flex-col justify-between relative"
                  >
                    <RivetCorners />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full border-2 font-black ${diffStyle.bg} ${diffStyle.text} ${diffStyle.border}`}>
                          {scenario.difficulty} &bull; {scenario.durationDays} Days
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Start: ${scenario.startingFunds}
                        </span>
                      </div>

                      <h4 className="text-xl font-black text-[#1E222A] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        {scenario.title}
                      </h4>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {scenario.description}
                      </p>

                      <div className="p-3 rounded-xl bg-white border border-[#1E222A]/20 space-y-1.5 text-xs">
                        <div className="text-emerald-800 font-black flex items-start gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>Win: {scenario.winConditionSummary}</span>
                        </div>
                        <div className="text-rose-800 font-bold flex items-start gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <span>Loss: {scenario.lossConditionSummary}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1E222A]/15 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        {scenario.agileConceptTaught}
                      </span>
                      <button
                        onClick={() => {
                          sound.playLevelUp();
                          onSelectScenario(scenario);
                        }}
                        className="px-4 py-2 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black rounded-xl border-2 border-[#1E222A] text-xs transition-all cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 flex items-center gap-1.5"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Challenge</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: How to Play Operational Field Guide */}
        {activeMenuTab === 'howToPlay' && (
          <div className="p-6 sm:p-7 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl shadow-[0_8px_0_#1E222A] text-[#1E222A] relative space-y-6 animate-fadeIn">
            <RivetCorners />

            <div className="flex items-center justify-between border-b-2 border-[#1E222A]/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFD200] border-2 border-[#1E222A] flex items-center justify-center font-black shadow-[0_2px_0_#1E222A]">
                  <HelpCircle className="w-5 h-5 text-[#1E222A]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1E222A] leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                    Harbor Operational Field Guide
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    Master the flow mechanics of Sprint Tolls in 5 core concepts.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveMenuTab('main')}
                className="text-xs font-mono font-bold text-[#48A2D8] hover:underline cursor-pointer"
              >
                &larr; Back to Menu
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span className="w-6 h-6 rounded-lg bg-[#FFD200] text-[#1E222A] flex items-center justify-center font-mono text-xs border border-[#1E222A]">1</span>
                  <span>Story Point Vehicles & Highway Traffic</span>
                </div>
                <p>
                  Incoming user stories arrive as vehicles sized with Fibonacci points (1, 2, 3, 5, 8, 13). Smaller stories process in seconds; big epics take longer and can bottleneck lanes if left unattended.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span className="w-6 h-6 rounded-lg bg-[#48A2D8] text-white flex items-center justify-center font-mono text-xs border border-[#1E222A]">2</span>
                  <span>Toll Lanes & WIP (Work-in-Progress) Limits</span>
                </div>
                <p>
                  Each toll booth represents an engineering lane with a configurable WIP Limit. Setting strict WIP limits enforces Little's Law (Lead Time = WIP &divide; Throughput) and accelerates overall team cycle time.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span className="w-6 h-6 rounded-lg bg-[#E85D04] text-white flex items-center justify-center font-mono text-xs border border-[#1E222A]">3</span>
                  <span>Slice Epic Stories to Unclog Queues</span>
                </div>
                <p>
                  Large 8 and 13-point vehicles slow down processing lanes. Click on any 5, 8, or 13-point story vehicle in the simulation or backlog to slice it into smaller bite-sized stories (e.g., an 8pt becomes 5+3 or 3+3+2)!
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] space-y-2">
                <div className="flex items-center gap-2 font-black text-sm text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span className="w-6 h-6 rounded-lg bg-[#66BD29] text-[#003624] flex items-center justify-center font-mono text-xs border border-[#1E222A]">4</span>
                  <span>Daily Ferry Releases & Toll Revenue</span>
                </div>
                <p>
                  The ferry accepts stories until filled to capacity or until the 05:00 PM sprint deadline. When the ferry departs, all collected daily toll revenues are disbursed to your bank, minus daily maintenance dues.
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] space-y-2 md:col-span-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-black text-sm text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                    <span className="w-6 h-6 rounded-lg bg-[#D92525] text-white flex items-center justify-center font-mono text-xs border border-[#1E222A]">5</span>
                    <span>Flow Efficiency &amp; Harbor Works Upgrades</span>
                  </div>
                  {onOpenUpgrades && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenUpgrades();
                      }}
                      className="px-3 py-1 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] border border-[#1E222A] text-[#1E222A] font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-[0_2px_0_#1E222A]"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Configure Upgrades</span>
                    </button>
                  )}
                </div>
                <p>
                  Maintain Flow Efficiency above 40% (Touch Time vs Wait Time) to prevent municipal efficiency surcharges. Reinvest banked earnings in Harbor Works to unlock additional lanes, upgrade booth automation to E-ZPass, and expand ferry capacity!
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStartOrResume}
                className="px-6 py-3 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black rounded-2xl border-[3px] border-[#1E222A] shadow-[0_4px_0_#1E222A] active:translate-y-1 transition-all cursor-pointer flex items-center gap-2 text-sm"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Ready to Play &bull; Enter Simulation</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Harbor Settings & Preferences */}
        {activeMenuTab === 'settings' && (
          <div className="p-6 sm:p-7 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl shadow-[0_8px_0_#1E222A] text-[#1E222A] relative space-y-6 animate-fadeIn">
            <RivetCorners />

            <div className="flex items-center justify-between border-b-2 border-[#1E222A]/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1E222A] text-[#FFD200] border-2 border-[#1E222A] flex items-center justify-center font-black shadow-[0_2px_0_#1E222A]">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1E222A] leading-none" style={{ fontFamily: 'var(--font-heading)' }}>
                    Harbor Settings & Audio Preferences
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    Customize audio feedback, traffic injection mode, and simulation speed.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveMenuTab('main')}
                className="text-xs font-mono font-bold text-[#48A2D8] hover:underline cursor-pointer"
              >
                &larr; Back to Menu
              </button>
            </div>

            <div className="space-y-4 max-w-2xl">
              {/* Sound Setting */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] flex items-center justify-between gap-4">
                <div>
                  <div className="font-black text-sm text-[#1E222A] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span>Web Audio Sound FX</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Synthesizer audio for toll chimes, ferry horns, vehicle honks, and countdown urgency.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onToggleSound();
                    sound.playClick();
                  }}
                  className={`px-4 py-2 rounded-xl font-mono font-bold text-xs border-2 border-[#1E222A] cursor-pointer transition-all ${
                    soundEnabled
                      ? 'bg-[#66BD29] text-[#003624] shadow-[0_2px_0_#1E222A]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {soundEnabled ? 'ENABLED' : 'MUTED'}
                </button>
              </div>

              {/* Continuous Flow vs Batch Traffic Mode */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] flex items-center justify-between gap-4">
                <div>
                  <div className="font-black text-sm text-[#1E222A] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Zap className="w-4 h-4 text-[#FFD200]" />
                    <span>Continuous Flow Traffic Mode</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {continuousFlowMode
                      ? 'Constant inflow of highway traffic simulating live production queues.'
                      : 'Discrete sprint batch mode: only vehicles committed during sprint planning will roll out.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleContinuousFlow();
                  }}
                  className={`px-4 py-2 rounded-xl font-mono font-bold text-xs border-2 border-[#1E222A] cursor-pointer transition-all ${
                    continuousFlowMode
                      ? 'bg-[#FFD200] text-[#1E222A] shadow-[0_2px_0_#1E222A]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {continuousFlowMode ? 'CONTINUOUS' : 'BATCH ONLY'}
                </button>
              </div>

              {/* Simulation Speed Preset */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] flex items-center justify-between gap-4">
                <div>
                  <div className="font-black text-sm text-[#1E222A] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Clock className="w-4 h-4 text-[#48A2D8]" />
                    <span>Simulation Speed Default</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Select standard operational speed when entering simulation.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs font-black">
                  {[1, 2, 3].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        sound.playClick();
                        onSetGameSpeed(spd);
                      }}
                      className={`px-3 py-1.5 rounded-xl border-2 border-[#1E222A] cursor-pointer transition-all ${
                        gameSpeed === spd
                          ? 'bg-[#48A2D8] text-white shadow-[0_2px_0_#1E222A]'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Active User Season & Release Fleet Vessel (Hull #20 - #99) */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-[#48A2D8]" />
                    <span className="font-black text-sm text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                      Active User Season &amp; Release Fleet Vessel
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[#FFD200] border-2 border-[#1E222A] text-xs font-mono font-black text-[#1E222A]">
                      Season #{seasonNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-[#48A2D8] border-2 border-[#1E222A] text-xs font-mono font-black text-white">
                      Hull #{currentShip.hullNumber}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-[#1E222A]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-black text-base text-[#1E222A] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                      <span>{currentShip.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FFD200] border border-[#1E222A] font-black text-[#1E222A]">
                        {currentShip.shortTag}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-bold">{currentShip.classType}</div>
                    <div className="text-xs text-[#004831] font-semibold italic">&ldquo;{currentShip.motto}&rdquo;</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onPrevSeason && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onPrevSeason();
                        }}
                        className="px-3 py-2 rounded-xl border-2 border-[#1E222A] bg-slate-100 hover:bg-slate-200 font-black text-xs cursor-pointer shadow-[0_2px_0_#1E222A] active:translate-y-0.5"
                      >
                        &larr; Prev Season
                      </button>
                    )}
                    {onNextSeason && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onNextSeason();
                        }}
                        className="px-3 py-2 rounded-xl border-2 border-[#1E222A] bg-[#FFD200] hover:bg-[#FFE043] font-black text-xs text-[#1E222A] cursor-pointer shadow-[0_2px_0_#1E222A] active:translate-y-0.5"
                      >
                        Next Season &rarr;
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Continuous delivery release sprints operate with a distinctive vessel chosen for each user season across the Huntington continuous delivery fleet (80 ships, Hull #20 through #99).
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveMenuTab('main')}
                className="px-5 py-2.5 bg-[#1E222A] hover:bg-[#2B2F38] text-white font-black rounded-xl border-2 border-[#1E222A] text-xs transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Bottom Credits & Huntington Brand Compliance Ribbon */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono pt-2 border-t border-slate-700/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#66BD29]" />
            <span>Official HEXperience Agile Simulation Suite &bull; Huntington Bank</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Press [Space] or [Enter] to Start</span>
            <span>&bull;</span>
            <span>&copy; {new Date().getFullYear()} HEXperience</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
