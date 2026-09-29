import React from 'react';
import {
  Play,
  Pause,
  FastForward,
  Volume2,
  VolumeX,
  GraduationCap,
  Ship,
  BarChart3,
  PlusCircle,
  Clock,
  ClipboardList,
  TrendingUp,
  Columns3,
  Hexagon,
  Flag,
  Wrench,
  Home
} from 'lucide-react';
import { GameSettings, FerryDock, DailyForecast } from '../types/game';

interface HeaderBarProps {
  onOpenMainMenu?: () => void;
  funds: number;
  pendingDailyRevenue?: number;
  dailyDuesAmount?: number;
  totalPoints: number;
  ferryPoints: number;
  ferryCapacity: number;
  dayNumber: number;
  dayTimeFormatted: string;
  sprintTimer: number;
  ferryState: FerryDock['state'];
  settings: GameSettings;
  activeTab: 'simulation' | 'academy';
  forecast: DailyForecast;
  onOpenForecast: () => void;
  onOpenScenarios?: () => void;
  onOpenSprintPlanning?: () => void;
  onOpenUpgrades?: () => void;
  hasAffordableUpgrades?: boolean;
  activeScenarioTitle?: string;
  activeScenarioDay?: number;
  activeScenarioTotalDays?: number;
  onTabChange: (tab: 'simulation' | 'academy') => void;
  onToggleSound: () => void;
  onSetSpeed: (speed: number) => void;
  onQuickSpawn?: () => void;
  onSpawn5Pt?: () => void;
  onLaunchFerry: () => void;
  onToggleContinuousFlow?: () => void;
  onOpenRetrospective?: () => void;
  hasLastRetrospective?: boolean;
  ferryReady: boolean;
  isRetroOpen?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenMainMenu,
  funds,
  pendingDailyRevenue = 0,
  dailyDuesAmount = 0,
  totalPoints,
  ferryPoints,
  ferryCapacity,
  dayNumber,
  dayTimeFormatted,
  sprintTimer,
  ferryState,
  settings,
  activeTab,
  forecast,
  onOpenForecast,
  onOpenScenarios,
  onOpenSprintPlanning,
  onOpenUpgrades,
  hasAffordableUpgrades = false,
  activeScenarioTitle,
  activeScenarioDay,
  activeScenarioTotalDays,
  onTabChange,
  onToggleSound,
  onSetSpeed,
  onQuickSpawn: _onQuickSpawn,
  onSpawn5Pt: _onSpawn5Pt,
  onLaunchFerry,
  onToggleContinuousFlow,
  onOpenRetrospective,
  hasLastRetrospective,
  ferryReady,
  isRetroOpen = false
}) => {
  const secondsLeft = Math.ceil(sprintTimer);
  const formattedCountdown = `00:${String(secondsLeft).padStart(2, '0')}`;
  const isFull = ferryPoints >= ferryCapacity;
  const isUrgent = (sprintTimer <= 10 || isFull) && ferryState === 'boarding';

  return (
    <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3.5 bg-[#2B2F38] border-b-[3px] border-[#1E222A] text-[#F4F6F9] shrink-0 select-none gap-3 sm:gap-4 shadow-[0_4px_0_#1E222A]">
      {/* Zone 1: Brand Wordmark with Playful Safety Yellow Construction Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMainMenu || (() => onTabChange('simulation'))}
          className="px-3.5 py-1.5 bg-[#FFD200] hover:bg-[#FFE043] border-[3px] border-[#1E222A] rounded-2xl shadow-[0_4px_0_#1E222A] active:translate-y-1 active:shadow-[0_1px_0_#1E222A] transition-all flex items-center gap-2 cursor-pointer group text-left"
          title="Open Main Menu (Pause Shift)"
        >
          <div className="w-6 h-6 rounded-lg bg-[#1E222A] flex items-center justify-center text-[#FFD200] group-hover:rotate-12 transition-transform">
            <Ship className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-base sm:text-lg font-black tracking-wide text-[#1E222A] leading-none"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              SPRINT TOLLS
            </span>
            <span className="text-[9px] font-bold text-[#1E222A]/80 tracking-wider uppercase font-mono">
              Port Simulator
            </span>
          </div>
        </button>

        {/* Development Company Pill (HEXperience in Huntington Bank colors) */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#004831] border-2 border-[#66BD29] rounded-xl shadow-[0_2px_0_#1E222A] select-none"
          title="Engineered by HEXperience · Huntington Bank Colorway"
        >
          <Hexagon className="w-3.5 h-3.5 text-[#66BD29] fill-[#66BD29]/20" />
          <span className="text-[11px] font-mono font-black text-white tracking-tight">
            HEX<span className="text-[#66BD29]">perience</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation controls as Chunky Segmented 3D Port Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#1E222A] p-1.5 rounded-2xl border-[3px] border-[#1E222A] shadow-inner overflow-x-auto">
        {onOpenMainMenu && (
          <button
            onClick={onOpenMainMenu}
            className="px-3 py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] bg-[#1E222A] hover:bg-[#2B2F38] text-[#FFD200] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
            style={{ fontFamily: 'var(--font-heading)' }}
            title="Open Main Menu & Settings (Pause Shift)"
          >
            <Home className="w-4 h-4 text-[#FFD200]" />
            <span>Main Menu</span>
          </button>
        )}
        <button
          onClick={() => onTabChange('simulation')}
          className={`px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'simulation'
              ? 'bg-[#48A2D8] text-white border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A]'
              : 'text-slate-300 hover:text-white hover:bg-[#2B2F38]'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <Ship className="w-4 h-4 text-[#FFD200]" />
          Toll &amp; Ferry Bay
        </button>

        <button
          onClick={() => onTabChange('academy')}
          className={`px-3 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'academy'
              ? 'bg-[#E85D04] text-white border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A]'
              : 'text-slate-300 hover:text-white hover:bg-[#2B2F38]'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <GraduationCap className="w-4 h-4 text-[#FFD200]" />
          Agile Academy
        </button>

        {hasLastRetrospective && onOpenRetrospective && (
          <button
            onClick={onOpenRetrospective}
            className="px-3 py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] bg-[#D92525] text-white hover:bg-[#E83C3C] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
            style={{ fontFamily: 'var(--font-heading)' }}
            title="Review the latest Sprint Retrospective Report"
          >
            <ClipboardList className="w-4 h-4 text-[#FFD200]" />
            <span>Sprint Retro</span>
          </button>
        )}

        {/* Daily Forecast Navigation Button */}
        <button
          onClick={onOpenForecast}
          className="px-3 py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] bg-[#48A2D8]/30 hover:bg-[#48A2D8]/50 text-white transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-[0_2px_0_#1E222A] group"
          style={{ fontFamily: 'var(--font-heading)' }}
          title={`Daily Forecast for Day #${forecast.targetDayNumber}: ~${forecast.predictedStories} stories. Click to plan WIP limits.`}
        >
          <TrendingUp className="w-4 h-4 text-[#FFD200] group-hover:scale-110 transition-transform" />
          <span>Forecast</span>
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-lg bg-[#1E222A] text-[#FFD200] border border-black/30 font-extrabold">
            ~{forecast.predictedStories}
          </span>
        </button>

        {/* Parking Lot Staging Button */}
        {onOpenSprintPlanning && (
          <button
            onClick={onOpenSprintPlanning}
            className={`px-3 py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none ${
              dayTimeFormatted.includes('Planning')
                ? 'bg-[#FFD200] text-[#1E222A] ring-2 ring-[#48A2D8] animate-pulse'
                : 'bg-[#1E222A] hover:bg-[#2B2F38] text-slate-200 border-[#384050]'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
            title="Open Parking Lot Staging to curate the Backlog and commit to the Parking Lot bays"
          >
            <ClipboardList className="w-4 h-4 text-[#FFD200]" />
            <span>Parking Lot Staging</span>
          </button>
        )}

        {/* Harbor Works & Upgrades Menu Icon Button */}
        {onOpenUpgrades && (
          <button
            onClick={onOpenUpgrades}
            className="px-3 py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none group relative"
            style={{ fontFamily: 'var(--font-heading)' }}
            title="Open Harbor Works & Upgrades: Upgrade toll booths, efficiency, automation, and ferry vessel"
          >
            <Wrench className="w-4 h-4 text-[#1E222A] group-hover:rotate-45 transition-transform" />
            <span>Upgrades</span>
            {hasAffordableUpgrades && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#E85D04] ring-2 ring-[#1E222A] animate-pulse" />
            )}
          </button>
        )}

        {/* Predetermined Tech Scenarios Button */}
        {onOpenScenarios && (
          <button
            onClick={onOpenScenarios}
            className={`px-3 py-2 text-xs font-black rounded-xl border-2 border-[#1E222A] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none ${
              activeScenarioTitle
                ? 'bg-[#66BD29] text-white hover:bg-[#77D236] ring-2 ring-[#FFD200]'
                : 'bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A]'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
            title={activeScenarioTitle ? `Active Scenario: ${activeScenarioTitle}` : 'Predetermined Tech Scenarios & Win/Lose Challenges'}
          >
            <Flag className={`w-4 h-4 ${activeScenarioTitle ? 'text-[#FFD200] animate-bounce' : 'text-[#1E222A]'}`} />
            <span>Scenarios</span>
            {activeScenarioTitle && activeScenarioDay && activeScenarioTotalDays ? (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-[#004831] text-white border border-[#66BD29]">
                Day {activeScenarioDay}/{activeScenarioTotalDays}
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#1E222A] text-[#FFD200] font-mono">
                5 Tech
              </span>
            )}
          </button>
        )}
      </nav>

      {/* Zone 3: Resources & Primary Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Daily Cycle Countdown in Header */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl border-[2.5px] border-[#1E222A] font-mono text-xs font-bold shadow-[0_3px_0_#1E222A] ${
            isRetroOpen
              ? 'bg-[#E85D04] text-white animate-pulse'
              : isUrgent
              ? 'bg-[#D92525] text-white animate-pulse'
              : 'bg-[#F4F6F9] text-[#1E222A]'
          }`}
          title={isRetroOpen ? 'All simulation actions paused while Sprint Retrospective is active' : 'Ferry leaves when FULL or when timer runs out at 05:00 PM'}
        >
          {isRetroOpen ? (
            <>
              <span className="font-extrabold text-[#FFD200]">Day {dayNumber} Retro</span>
              <span className="text-white/60">·</span>
              <Pause className="w-4 h-4 text-[#FFD200]" />
              <span className="tabular-nums font-black tracking-wide">ACTIONS PAUSED</span>
            </>
          ) : (
            <>
              <span className="font-extrabold text-[#48A2D8]">Day {dayNumber}</span>
              <span className="text-slate-400">·</span>
              <span>{dayTimeFormatted}</span>
              <span className="text-slate-400">·</span>
              <Clock className={`w-4 h-4 ${isUrgent ? 'text-white animate-spin' : 'text-[#E85D04]'}`} />
              <span className="tabular-nums font-black">
                {ferryState === 'boarding'
                  ? isFull
                    ? 'FULL! CASTING OFF'
                    : formattedCountdown
                  : 'In Transit'}
              </span>
            </>
          )}
        </div>

        {/* Funds & Pending Accruals Counter with High-Visibility Safety Yellow */}
        <div className="flex items-center gap-2 text-xs">
          <div
            className="flex items-center gap-2 bg-[#FFD200] text-[#1E222A] border-[2.5px] border-[#1E222A] px-3.5 py-1.5 rounded-2xl shadow-[0_3px_0_#1E222A] font-black"
            title="Current Settled Bank Funds. Toll earnings accrue during the day and are disbursed at 05:00 PM release after daily dues & efficiency taxes."
          >
            <div className="flex flex-col leading-none">
              <span className="text-[10px] uppercase tracking-wider text-[#1E222A]/70" style={{ fontFamily: 'var(--font-heading)' }}>
                Bank
              </span>
              <span className="font-mono font-black text-sm tabular-nums mt-0.5">
                ${funds.toLocaleString()}
              </span>
            </div>

            {/* Pending Daily Accruals & Dues */}
            <div className="hidden sm:flex flex-col pl-2 border-l-2 border-[#1E222A]/20 text-[10px] font-mono leading-none">
              <span className="text-emerald-900 font-bold" title="Tolls collected today. Credited at end of day.">
                +${pendingDailyRevenue.toLocaleString()}
              </span>
              <span className="text-rose-900 font-bold text-[9px] mt-0.5" title="Daily dues & efficiency taxes deducted at end of day.">
                -${dailyDuesAmount.toLocaleString()} dues
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-[#F4F6F9] text-[#1E222A] border-[2.5px] border-[#1E222A] px-3.5 py-2 rounded-2xl shadow-[0_3px_0_#1E222A] font-black">
            <span className="text-[11px] uppercase tracking-wider text-slate-500" style={{ fontFamily: 'var(--font-heading)' }}>
              Delivered
            </span>
            <span className="font-mono font-black text-sm text-[#48A2D8] tabular-nums">
              {totalPoints} pts
            </span>
          </div>
        </div>

        {/* Speed Controls - Chunky Toy Buttons */}
        <div className={`flex items-center bg-[#1E222A] border-[2px] border-[#1E222A] rounded-2xl p-1 gap-1 shadow-inner ${isRetroOpen ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => onSetSpeed(settings.gameSpeed === 0 ? 1 : 0)}
            disabled={isRetroOpen}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              settings.gameSpeed === 0 || isRetroOpen ? 'bg-[#FFD200] text-[#1E222A]' : 'text-slate-300 hover:text-white'
            }`}
            title={isRetroOpen ? 'Paused during Sprint Retrospective' : settings.gameSpeed === 0 ? 'Resume' : 'Pause'}
          >
            {settings.gameSpeed === 0 || isRetroOpen ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={() => onSetSpeed(1)}
            disabled={isRetroOpen}
            className={`px-2 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
              settings.gameSpeed === 1 && !isRetroOpen ? 'bg-[#48A2D8] text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
            title="1x Normal Speed"
          >
            1x
          </button>
          <button
            onClick={() => onSetSpeed(2)}
            disabled={isRetroOpen}
            className={`px-2 py-1 text-xs font-black rounded-xl transition-all cursor-pointer ${
              settings.gameSpeed === 2 && !isRetroOpen ? 'bg-[#48A2D8] text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
            title="2x Fast Speed"
          >
            2x
          </button>
          <button
            onClick={() => onSetSpeed(3)}
            disabled={isRetroOpen}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              settings.gameSpeed === 3 && !isRetroOpen ? 'bg-[#E85D04] text-white' : 'text-slate-300 hover:text-white'
            }`}
            title="3x Warp Speed"
          >
            <FastForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 text-slate-300 hover:text-white bg-[#1E222A] hover:bg-[#2B2F38] border-[2px] border-[#1E222A] rounded-2xl transition-all cursor-pointer shadow-sm"
          title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-[#FFD200]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Deploy Release Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLaunchFerry}
            disabled={!ferryReady || isRetroOpen}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-2xl border-[2.5px] border-[#1E222A] transition-all whitespace-nowrap cursor-pointer ${
              ferryReady && !isRetroOpen
                ? 'bg-[#D92525] hover:bg-[#E83C3C] text-white shadow-[0_4px_0_#1E222A] active:translate-y-1 active:shadow-[0_1px_0_#1E222A]'
                : 'bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed shadow-[0_2px_0_#1E222A]'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
            title={isRetroOpen ? 'Actions paused during retrospective' : 'Deploy current sprint release on ferry'}
          >
            <Ship className="w-4 h-4 text-[#FFD200]" />
            Deploy ({ferryPoints}/{ferryCapacity} pts)
          </button>
        </div>
      </div>
    </header>
  );
};
