import React, { useState } from 'react';
import {
  VehicleStory,
  TollBooth,
  FerryDock,
  StoryPoint,
  FlowMetrics
} from '../types/game';
import {
  AlertTriangle,
  Scissors,
  Zap,
  Lock,
  Plus,
  ArrowRight,
  Clock,
  Sun,
  Sunset,
  Ship,
  ShieldAlert,
  Flame,
  Info
} from 'lucide-react';
import { FlowEfficiencyViolationModal } from './FlowEfficiencyViolationModal';

interface TollSimulationCanvasProps {
  booths: TollBooth[];
  ferry: FerryDock;
  vehicles: VehicleStory[];
  metrics?: FlowMetrics;
  onSelectVehicle: (v: VehicleStory) => void;
  onSelectBooth: (boothId: number) => void;
  onSliceStory: (vehicleId: string) => void;
  onUnlockBooth: (boothId: number) => void;
  onSpawnStory: (points?: StoryPoint) => void;
  onLaunchFerry: () => void;
  onUpgradeEfficiency?: (boothId: number) => void;
  onUpgradeAutomation?: (boothId: number) => void;
  onSetLaneWipLimit?: (boothId: number, limit: number) => void;
  continuousFlowMode?: boolean;
  onToggleContinuousFlow?: () => void;
  funds: number;
}

const LANE_Y_POSITIONS = [50, 125, 200, 275, 350, 425];
const LANE_HEIGHT = 70;

export const TollSimulationCanvas: React.FC<TollSimulationCanvasProps> = ({
  booths,
  ferry,
  vehicles,
  metrics,
  onSelectVehicle,
  onSelectBooth,
  onSliceStory,
  onUnlockBooth,
  onSpawnStory,
  onLaunchFerry,
  onUpgradeEfficiency,
  onUpgradeAutomation,
  onSetLaneWipLimit,
  continuousFlowMode = true,
  onToggleContinuousFlow,
  funds
}) => {
  const [hoveredVehicle, setHoveredVehicle] = useState<VehicleStory | null>(null);
  const [selectedViolationBooth, setSelectedViolationBooth] = useState<TollBooth | null>(null);

  // Calculate ferry position when sailing
  let ferryX = 640;
  if (ferry.state === 'departing' || ferry.state === 'sailing') {
    ferryX = 640 + (ferry.sailProgress / 100) * 450;
  } else if (ferry.state === 'returning') {
    ferryX = 640 + (ferry.sailProgress / 100) * 450;
  }

  // Daily cycle timing & departure rule calculations
  const secondsLeft = Math.ceil(ferry.sprintTimer);
  const formattedCountdown = `00:${String(secondsLeft).padStart(2, '0')}`;
  const dayProgressPercent = Math.min(100, Math.max(0, (1 - ferry.sprintTimer / ferry.sprintDuration) * 100));
  const isFull = ferry.currentPoints >= ferry.capacity;
  const isUrgent = (ferry.sprintTimer <= 10 || isFull) && ferry.state === 'boarding';

  // Identify significant bottleneck booth
  const primaryBottleneck = React.useMemo<{ booth: TollBooth; queue: VehicleStory[]; points: number } | null>(() => {
    let worst: { booth: TollBooth; queue: VehicleStory[]; points: number } | null = null;
    booths.forEach((b) => {
      if (!b.unlocked) return;
      const q = vehicles.filter(
        (v) => v.laneIndex === b.id && (v.state === 'queued' || v.state === 'approaching' || v.state === 'processing')
      );
      const pts = q.reduce((sum, v) => sum + v.points, 0);

      const isBottleneck =
        (q.length >= b.wipLimit && q.length >= 2) ||
        q.length >= 3 ||
        pts >= 12 ||
        (metrics && metrics.bottleneckLaneIndex === b.id && q.length >= 2);

      if (isBottleneck && (!worst || pts > worst.points)) {
        worst = { booth: b, queue: q, points: pts };
      }
    });
    return worst;
  }, [booths, vehicles, metrics]);

  return (
    <div className="relative w-full h-[570px] bg-[#2B2F38] border-[3px] border-[#1E222A] rounded-3xl overflow-hidden shadow-[0_8px_0_#1E222A] flex flex-col select-none">
      {/* Decorative Corner Rivets */}
      <div className="rivet top-2.5 left-2.5" />
      <div className="rivet top-2.5 right-2.5" />
      <div className="rivet bottom-2.5 left-2.5" />
      <div className="rivet bottom-2.5 right-2.5" />

      {/* Daily Sprint Cycle & Ferry Departure Countdown HUD Banner */}
      <div
        className={`px-5 py-2.5 border-b-[3px] border-[#1E222A] transition-colors flex items-center justify-between gap-4 z-10 shrink-0 ${
          isUrgent
            ? 'bg-[#D92525] text-white'
            : 'bg-[#1E222A] text-[#F4F6F9]'
        }`}
      >
        {/* Day & Shift Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-[#FFD200] text-[#1E222A] font-black font-mono text-xs border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]">
              DAY #{ferry.dayNumber}
            </span>
            <span className="font-mono text-xs font-black text-white flex items-center gap-1.5">
              {ferry.dayPhase === 'morning' && <Sun className="w-4 h-4 text-[#FFD200]" />}
              {ferry.dayPhase === 'midday' && <Sun className="w-4 h-4 text-yellow-300" />}
              {ferry.dayPhase === 'afternoon' && <Sun className="w-4 h-4 text-[#E85D04]" />}
              {ferry.dayPhase === 'sunset' && <Sunset className="w-4 h-4 text-[#E85D04]" />}
              {ferry.dayPhase === 'departure' && <Ship className="w-4 h-4 text-[#FFD200] animate-bounce" />}
              {ferry.dayTimeFormatted}
            </span>
          </div>

          {/* Work Shift Timeline Bar */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-300 font-mono font-bold">
            <span>09:00 AM</span>
            <div className="w-28 sm:w-40 h-3 bg-[#1E222A] rounded-full overflow-hidden border-2 border-[#1E222A] p-0.5 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isUrgent ? 'bg-[#FFD200]' : 'bg-gradient-to-r from-[#48A2D8] via-[#FFD200] to-[#E85D04]'
                }`}
                style={{ width: `${dayProgressPercent}%` }}
              />
            </div>
            <span>05:00 PM Release</span>
          </div>
        </div>

        {/* Departure Criteria & Countdown Clock */}
        <div className="flex items-center gap-3 font-mono">
          {/* Quick Continual Flow Toggle Button in HUD */}
          {onToggleContinuousFlow && (
            <button
              onClick={onToggleContinuousFlow}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#1E222A] text-xs font-black transition-all cursor-pointer shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none ${
                continuousFlowMode
                  ? 'bg-[#FFD200] text-[#1E222A]'
                  : 'bg-[#2B2F38] text-slate-300 hover:text-white'
              }`}
              title="Continual Flow: Stream user stories constantly to eliminate idle booths"
            >
              <span className={`w-2 h-2 rounded-full ${continuousFlowMode ? 'bg-[#E85D04] animate-ping' : 'bg-slate-500'}`} />
              <span>{continuousFlowMode ? '⚡ FLOW: CONTINUAL' : '⏸ FLOW: BATCH'}</span>
            </button>
          )}

          {ferry.state === 'boarding' ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-[#1E222A] text-xs font-black transition-all shadow-[0_3px_0_#1E222A] ${
                isFull
                  ? 'bg-[#10b981] text-white animate-pulse'
                  : isUrgent
                  ? 'bg-[#E85D04] text-white animate-pulse'
                  : 'bg-[#F4F6F9] text-[#1E222A]'
              }`}
              title="Ferry departs automatically when FULL or when timer runs out at 05:00 PM"
            >
              <Clock className={`w-4 h-4 ${isUrgent ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isFull
                  ? 'FULL CAPACITY REACHED · DEPARTING:'
                  : isUrgent
                  ? 'DEADLINE IMMINENT · DEPARTS IN:'
                  : 'CASTS OFF IN:'}
              </span>
              <span className="text-sm font-black tabular-nums tracking-wider">
                {isFull ? 'DEPARTING 🚢' : formattedCountdown}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#48A2D8] border-2 border-[#1E222A] text-white text-xs font-black shadow-[0_2px_0_#1E222A]">
              <Ship className="w-4 h-4 animate-pulse text-[#FFD200]" />
              <span>
                {ferry.state === 'sailing' || ferry.state === 'departing'
                  ? 'DELIVERING TO PROD'
                  : 'RETURNING TO HARBOR'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Significant Bottleneck Alert Callout Banner */}
      {primaryBottleneck && (
        <div className="bg-[#D92525] border-b-[2.5px] border-[#1E222A] px-4 py-2 flex items-center justify-between text-xs text-white z-10 shrink-0 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded-lg bg-[#1E222A] text-[#FFD200] border border-black/30 shrink-0">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
            </div>
            <div className="truncate">
              <span className="font-mono font-black uppercase tracking-wider text-[10px] bg-[#FFD200] text-[#1E222A] px-2 py-0.5 rounded-md mr-2 border border-[#1E222A]">
                FLOW BOTTLENECK
              </span>
              <strong className="text-white">{primaryBottleneck.booth.name}</strong> has{' '}
              <span className="font-mono font-black text-[#FFD200]">
                {primaryBottleneck.queue.length} stories ({primaryBottleneck.points} pts)
              </span>{' '}
              queued! Queue accumulation destroys Flow Efficiency with non-value-add idle wait time.
            </div>
          </div>
          <button
            onClick={() => setSelectedViolationBooth(primaryBottleneck.booth)}
            className="px-3 py-1 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ml-3 border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
            title="Click to view Flow Efficiency violation explanation and remedies"
          >
            <span>Inspect Flow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Simulation World SVG Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <svg
          viewBox="0 0 1100 500"
          className="w-full h-full preserve-3d"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Road Asphalt Texture / Gradient */}
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2B2F38" />
              <stop offset="50%" stopColor="#242830" />
              <stop offset="100%" stopColor="#1E222A" />
            </linearGradient>

            {/* Ocean Water Gradient */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3890C4" />
              <stop offset="50%" stopColor="#48A2D8" />
              <stop offset="100%" stopColor="#2B7DAF" />
            </linearGradient>

            {/* Barrier Pattern */}
            <pattern id="barrierStripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="12" fill="#FFD200" />
              <rect x="6" width="6" height="12" fill="#1E222A" />
            </pattern>

            {/* Pier Dock Wood Texture */}
            <pattern id="pierWood" width="20" height="8" patternUnits="userSpaceOnUse">
              <rect width="20" height="8" fill="#451a03" />
              <line x1="0" y1="0" x2="20" y2="0" stroke="#78350f" strokeWidth="1" />
            </pattern>

            {/* Bottleneck Pulsing Hazard Glow Filter */}
            <filter id="bottleneckGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.9" />
            </filter>
            <pattern id="hazardStripes" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="16" fill="#ef4444" opacity="0.25" />
              <rect x="8" width="8" height="16" fill="#000000" opacity="0.1" />
            </pattern>

            {/* Drop Shadow Filter */}
            <filter id="carShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.45" />
            </filter>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. BACKGROUND LAYERS */}
          {/* Highway & Toll Plaza Surface */}
          <rect x="0" y="20" width="600" height="470" fill="url(#roadGrad)" />

          {/* Ocean Water Zone */}
          <rect x="600" y="20" width="500" height="470" fill="url(#waterGrad)" opacity="0.9" />

          {/* Animated Wave Ripples in Water */}
          <g opacity="0.35">
            <path
              d="M 620 60 Q 660 50, 700 60 T 780 60 T 860 60 T 940 60 T 1020 60"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="2"
              strokeDasharray="8 12"
            />
            <path
              d="M 640 180 Q 680 170, 720 180 T 800 180 T 880 180 T 960 180 T 1040 180"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="1.5"
              strokeDasharray="6 14"
            />
            <path
              d="M 610 320 Q 650 310, 690 320 T 770 320 T 850 320 T 930 320 T 1010 320"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="2"
              strokeDasharray="10 15"
            />
            <path
              d="M 630 440 Q 670 430, 710 440 T 790 440 T 870 440 T 950 440 T 1030 440"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="1.5"
              strokeDasharray="6 12"
            />
          </g>

          {/* Coastal Pier / Quayside */}
          <rect x="585" y="20" width="40" height="470" fill="url(#pierWood)" />
          <line x1="625" y1="20" x2="625" y2="490" stroke="#1c1917" strokeWidth="3" />

          {/* Pier Bollards */}
          {[60, 140, 220, 300, 380, 460].map((by) => (
            <circle key={by} cx="615" cy={by} r="5" fill="#78716c" stroke="#292524" strokeWidth="2" />
          ))}

          {/* 2. HIGHWAY LANES & TOLL ISLANDS */}
          {/* Curbs / Verges framing the Single Feeder Entrance (x=0 to 45) and fanning out (45 to 195) */}
          <path
            d="M 0 20 L 45 20 L 45 202 C 100 202, 135 20, 195 20 Z"
            fill="#0b1324"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <path
            d="M 0 490 L 45 490 L 45 273 C 100 273, 135 490, 195 490 Z"
            fill="#0b1324"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Single Intake Highway Trunk Lane (x=0 to 45, y=202..273, center 237.5) */}
          <line x1="0" y1="202" x2="45" y2="202" stroke="#e2e8f0" strokeWidth="2.5" />
          <line x1="0" y1="273" x2="45" y2="273" stroke="#e2e8f0" strokeWidth="2.5" />
          <line x1="0" y1="237.5" x2="45" y2="237.5" stroke="#eab308" strokeWidth="2" strokeDasharray="8 6" />

          {/* Single Feeder Overhead Road Sign / Marker */}
          <g transform="translate(6, 172)">
            <rect width="78" height="22" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
            <text x="39" y="14" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-mono)">
              SINGLE INTAKE
            </text>
          </g>

          {/* Fan-Out Plaza Transition Zone (x=45 to 195) Curved Guide Tracks */}
          {booths.map((booth, idx) => {
            const destY = LANE_Y_POSITIONS[idx] + LANE_HEIGHT / 2;
            return (
              <g key={'fan-guide-' + booth.id}>
                <path
                  d={`M 45 237.5 C 105 237.5, 125 ${destY}, 195 ${destY}`}
                  fill="none"
                  stroke={booth.unlocked ? '#38bdf8' : '#475569'}
                  strokeWidth={booth.unlocked ? 1.5 : 1}
                  strokeDasharray={booth.unlocked ? '6 6' : '3 6'}
                  opacity={booth.unlocked ? 0.65 : 0.2}
                />
                {/* Availability Indicator at entrance of each lane (x=182) */}
                {booth.unlocked ? (
                  <path
                    d={`M 180 ${destY - 6} L 188 ${destY} L 180 ${destY + 6}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                ) : (
                  <g opacity="0.6">
                    <line x1="180" y1={destY - 5} x2="188" y2={destY + 5} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                    <line x1="188" y1={destY - 5} x2="180" y2={destY + 5} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}

          {booths.map((booth, idx) => {
            const laneY = LANE_Y_POSITIONS[idx];
            const isUnlocked = booth.unlocked;

            // Lane queue count
            const laneQueue = vehicles.filter(
              (v) => v.laneIndex === booth.id && (v.state === 'queued' || v.state === 'approaching' || v.state === 'processing')
            );
            const lanePoints = laneQueue.reduce((acc, v) => acc + v.points, 0);
            const isAtWipLimit = laneQueue.length >= booth.wipLimit;
            const hasHeavyVehicle = laneQueue.some((v) => v.points >= 8);

            // Severe bottleneck condition: queue accumulation exceeding limits or causing severe delays
            const isSevereBottleneck =
              isUnlocked &&
              ((laneQueue.length >= booth.wipLimit && laneQueue.length >= 2) ||
                laneQueue.length >= 3 ||
                lanePoints >= 12 ||
                (metrics && metrics.bottleneckLaneIndex === booth.id && laneQueue.length >= 2));

            return (
              <g key={booth.id} className="transition-opacity duration-300">
                {/* Lane road surface and divider lines (from fan-out boundary x=195 to toll booth x=300) */}
                <line
                  x1="195"
                  y1={laneY + LANE_HEIGHT / 2}
                  x2="300"
                  y2={laneY + LANE_HEIGHT / 2}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="10 10"
                />

                {/* Locked lane overlay (from x=195 to x=585) */}
                {!isUnlocked && (
                  <g>
                    <rect
                      x="195"
                      y={laneY - 2}
                      width="390"
                      height={LANE_HEIGHT + 4}
                      fill="#090d16"
                      opacity="0.85"
                    />
                    <line x1="195" y1={laneY + 35} x2="300" y2={laneY + 35} stroke="#3b0764" strokeWidth="2" strokeDasharray="6 6" />

                    {/* Unlock Button / Gate */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => onUnlockBooth(booth.id)}
                    >
                      <rect
                        x="205"
                        y={laneY + 8}
                        width="160"
                        height={52}
                        rx="8"
                        fill="#1e1b4b"
                        stroke={funds >= booth.unlockCost ? '#6366f1' : '#3730a3'}
                        strokeWidth="1.5"
                        className="group-hover:fill-indigo-900/60 transition-colors"
                      />
                      <Lock x="215" y={laneY + 22} width="18" height="18" className="text-indigo-400" />
                      <text x="240" y={laneY + 28} fill="#e0e7ff" fontSize="10.5" fontWeight="bold">
                        Unlock {booth.name.split('·')[0]}
                      </text>
                      <text x="240" y={laneY + 44} fill={funds >= booth.unlockCost ? '#a5b4fc' : '#f43f5e'} fontSize="10.5" fontFamily="var(--font-mono)">
                        ${booth.unlockCost} {funds < booth.unlockCost ? '(Need Funds)' : '→ Open Lane'}
                      </text>
                    </g>
                  </g>
                )}

                {/* Unlocked Lane Elements */}
                {isUnlocked && (
                  <g>
                    {/* Severe Bottleneck Flashing Road Hazard Overlay */}
                    {isSevereBottleneck && (
                      <g className="animate-pulse">
                        <rect
                          x="35"
                          y={laneY + 4}
                          width="265"
                          height={LANE_HEIGHT - 8}
                          rx="6"
                          fill="url(#hazardStripes)"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          strokeDasharray="6 3"
                        />
                        {/* Interactive Clickable Road Hazard Badge */}
                        <g
                          className="cursor-pointer group"
                          onClick={() => setSelectedViolationBooth(booth)}
                        >
                          <rect
                            x="45"
                            y={laneY + 12}
                            width="240"
                            height="19"
                            rx="4"
                            fill="#450a0a"
                            stroke="#f87171"
                            strokeWidth="1"
                            className="group-hover:fill-rose-900 transition-colors"
                          />
                          <text
                            x="52"
                            y={laneY + 25}
                            fill="#fecdd3"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="var(--font-mono)"
                          >
                            🚨 FLOW BOTTLENECK ({laneQueue.length}/{booth.wipLimit}) · CLICK FOR PRINCIPLES
                          </text>
                        </g>
                      </g>
                    )}

                    {/* Standard WIP Limit reached indicator (if not in severe bottleneck) */}
                    {isAtWipLimit && !isSevereBottleneck && (
                      <g className="animate-pulse">
                        <rect
                          x="30"
                          y={laneY + 8}
                          width="240"
                          height="54"
                          rx="6"
                          fill="#ef4444"
                          opacity="0.12"
                        />
                        <text x="40" y={laneY + 24} fill="#fca5a5" fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)">
                          ▲ WIP LIMIT REACHED ({laneQueue.length}/{booth.wipLimit})
                        </text>
                      </g>
                    )}

                    {/* Heavy vehicle bottleneck warning */}
                    {hasHeavyVehicle && !isSevereBottleneck && (
                      <g>
                        <rect
                          x="190"
                          y={laneY + 4}
                          width="100"
                          height="16"
                          rx="4"
                          fill="#7c2d12"
                          stroke="#ea580c"
                          strokeWidth="1"
                        />
                        <text x="196" y={laneY + 15} fill="#fdba74" fontSize="8.5" fontWeight="bold">
                          🐢 BOTTLENECK
                        </text>
                      </g>
                    )}

                    {/* Toll Island Structure (Physical booth) */}
                    <g
                      className={`cursor-pointer group ${isSevereBottleneck ? 'animate-pulse' : ''}`}
                      onClick={() => {
                        if (isSevereBottleneck) {
                          setSelectedViolationBooth(booth);
                        } else {
                          onSelectBooth(booth.id);
                        }
                      }}
                    >
                      {/* Concrete Island Base */}
                      <rect
                        x="300"
                        y={laneY - 4}
                        width="36"
                        height={LANE_HEIGHT + 8}
                        rx="4"
                        fill="#334155"
                        stroke={isSevereBottleneck ? '#ef4444' : '#475569'}
                        strokeWidth={isSevereBottleneck ? '2.5' : '1.5'}
                        filter={isSevereBottleneck ? 'url(#bottleneckGlow)' : undefined}
                      />

                      {/* Toll Booth Cabin */}
                      <rect
                        x="304"
                        y={laneY + 8}
                        width="28"
                        height="40"
                        rx="3"
                        fill={isSevereBottleneck ? '#450a0a' : '#0f172a'}
                        stroke={isSevereBottleneck ? '#ef4444' : booth.isProcessing ? '#38bdf8' : '#64748b'}
                        strokeWidth={isSevereBottleneck ? '2' : '1.5'}
                      />

                      {/* Cabin Window */}
                      <rect
                        x="307"
                        y={laneY + 12}
                        width="22"
                        height="15"
                        rx="2"
                        fill={isSevereBottleneck ? '#f87171' : '#38bdf8'}
                        opacity="0.35"
                      />

                      {/* Beacon Light - Flashing Strobe when Bottlenecked */}
                      {isSevereBottleneck ? (
                        <g>
                          <circle
                            cx="318"
                            cy={laneY + 4}
                            r="8"
                            fill="#ef4444"
                            opacity="0.8"
                            className="animate-ping"
                          />
                          <circle
                            cx="318"
                            cy={laneY + 4}
                            r="4.5"
                            fill="#ef4444"
                            filter="url(#glow)"
                          />
                        </g>
                      ) : (
                        <circle
                          cx="318"
                          cy={laneY + 4}
                          r="4"
                          fill={booth.isProcessing ? '#38bdf8' : '#10b981'}
                          filter="url(#glow)"
                        />
                      )}

                      {/* Electronic Overhead Signboard */}
                      <rect
                        x="235"
                        y={laneY + 2}
                        width="70"
                        height="20"
                        rx="3"
                        fill={isSevereBottleneck ? '#450a0a' : '#020617'}
                        stroke={isSevereBottleneck ? '#ef4444' : '#1e293b'}
                        strokeWidth={isSevereBottleneck ? '1.5' : '1'}
                      />
                      <text
                        x="240"
                        y={laneY + 11}
                        fill={isSevereBottleneck ? '#fca5a5' : '#94a3b8'}
                        fontSize="7.5"
                        fontWeight="bold"
                      >
                        {isSevereBottleneck ? '⚠️ BOTTLENECK' : `Lv.${booth.level}`}
                      </text>
                      <text
                        x="270"
                        y={laneY + 11}
                        fill={isSevereBottleneck ? '#f87171' : '#f59e0b'}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="var(--font-mono)"
                      >
                        {isSevereBottleneck ? `${laneQueue.length}Q` : `x${booth.multiplier.toFixed(2)}`}
                      </text>
                      {/* XP / Queue Load Progress Bar */}
                      <rect x="240" y={laneY + 14} width="60" height="3" rx="1.5" fill="#1e293b" />
                      <rect
                        x="240"
                        y={laneY + 14}
                        width={
                          isSevereBottleneck
                            ? Math.min(60, (laneQueue.length / booth.wipLimit) * 60)
                            : Math.min(60, (booth.xp / booth.xpToNextLevel) * 60)
                        }
                        height="3"
                        rx="1.5"
                        fill={isSevereBottleneck ? '#ef4444' : '#f59e0b'}
                      />

                      {/* Specialization Icon Badge */}
                      {booth.specialization === 'small_only' && (
                        <text x="240" y={laneY - 2} fill="#38bdf8" fontSize="8" fontWeight="bold">
                          ⚡ Expedite Lane
                        </text>
                      )}
                      {booth.specialization === 'heavy_only' && (
                        <text x="240" y={laneY - 2} fill="#c084fc" fontSize="8" fontWeight="bold">
                          🚛 Heavy Haul
                        </text>
                      )}

                      {/* Animated Barrier Arm */}
                      <g
                        transform={
                          booth.barrierRaised
                            ? `rotate(-80, 336, ${laneY + 45})`
                            : `rotate(0, 336, ${laneY + 45})`
                        }
                        className="transition-transform duration-300 ease-out"
                      >
                        <rect
                          x="336"
                          y={laneY + 42}
                          width="26"
                          height="5"
                          fill="url(#barrierStripes)"
                          stroke="#1e293b"
                          strokeWidth="0.5"
                          rx="1"
                        />
                      </g>

                      {/* Processing progress above vehicle at booth */}
                      {booth.isProcessing && (
                        <g>
                          <rect x="290" y={laneY + 60} width="60" height="5" rx="2.5" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                          <rect
                            x="290"
                            y={laneY + 60}
                            width={(booth.processingProgress / 100) * 60}
                            height="5"
                            rx="2.5"
                            fill="#10b981"
                          />
                        </g>
                      )}
                    </g>
                  </g>
                )}
              </g>
            );
          })}

          {/* 3. DOCK MERGE ARROWS & RAMP */}
          <g opacity="0.6">
            <line x1="370" y1="260" x2="570" y2="260" stroke="#475569" strokeWidth="2" strokeDasharray="8 8" />
            <polygon points="565,255 580,260 565,265" fill="#94a3b8" />
            <text x="430" y="245" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="1">
              TO SPRINT FERRY DOCK →
            </text>
          </g>

          {/* 4. THE SPRINT FERRY VESSEL */}
          <g
            transform={`translate(${ferryX}, 60)`}
            className="transition-transform duration-200"
          >
            {/* Water Wake Effect when sailing */}
            {(ferry.state === 'sailing' || ferry.state === 'departing') && (
              <g opacity="0.6">
                <path d="M -30 40 L -120 10 L -140 25 Z" fill="#e0f2fe" opacity="0.4" />
                <path d="M -30 340 L -120 370 L -140 355 Z" fill="#e0f2fe" opacity="0.4" />
                <circle cx="-40" cy="190" r="15" fill="#f0f9ff" opacity="0.3" />
                <circle cx="-80" cy="190" r="25" fill="#f0f9ff" opacity="0.2" />
              </g>
            )}

            {/* Ferry Hull Base */}
            <path
              d="M 0 30 Q 30 10, 220 10 L 300 60 Q 340 190, 300 320 L 220 370 Q 30 370, 0 350 Z"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2.5"
              filter="url(#carShadow)"
            />

            {/* Ferry Car Deck Area */}
            <rect
              x="20"
              y="40"
              width="240"
              height="300"
              rx="12"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Deck Parking Lane Markings */}
            <line x1="100" y1="50" x2="100" y2="330" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />
            <line x1="180" y1="50" x2="180" y2="330" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Ferry Superstructure / Bridge */}
            <rect x="210" y="140" width="55" height="100" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="220" y="150" width="35" height="20" rx="3" fill="#0284c7" />
            <circle cx="237" cy="190" r="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <text x="218" y="225" fill="#0f172a" fontSize="7.5" fontWeight="bold">
              BRIDGE
            </text>

            {/* Ferry Name & Sprint Number */}
            <text x="50" y="30" fill="#bae6fd" fontSize="11" fontWeight="bold" letterSpacing="1">
              MV VELOCITY · SPRINT #{ferry.sprintNumber}
            </text>

            {/* Capacity Progress Bar on Deck */}
            <g transform="translate(30, 60)">
              <rect width="160" height="18" rx="4" fill="#090d16" stroke="#475569" strokeWidth="1" />
              <rect
                width={Math.min(160, (ferry.currentPoints / ferry.capacity) * 160)}
                height="18"
                rx="4"
                fill={ferry.currentPoints >= ferry.capacity ? '#10b981' : '#38bdf8'}
              />
              <text x="80" y="13" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="var(--font-mono)">
                Capacity: {ferry.currentPoints} / {ferry.capacity} pts
              </text>
            </g>

            {/* Mini representations of loaded vehicles parked on deck */}
            <g transform="translate(30, 95)">
              {ferry.vehiclesOnBoard.slice(0, 18).map((v, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                return (
                  <rect
                    key={v.id + i}
                    x={col * 55 + 5}
                    y={row * 36 + 4}
                    width={40}
                    height={24}
                    rx="4"
                    fill={v.color}
                    stroke="#ffffff"
                    strokeWidth="1"
                    opacity="0.9"
                  />
                );
              })}
            </g>

            {/* Daily Countdown & Departure Rule Badge on Ferry Deck */}
            <g transform="translate(30, 245)">
              <rect
                width="160"
                height="24"
                rx="4"
                fill={isFull ? '#064e3b' : ferry.sprintTimer <= 10 ? '#450a0a' : '#090d16'}
                stroke={isFull ? '#10b981' : ferry.sprintTimer <= 10 ? '#ef4444' : '#0284c7'}
                strokeWidth="1.5"
              />
              <text
                x="80"
                y="16"
                textAnchor="middle"
                fill={isFull ? '#6ee7b7' : ferry.sprintTimer <= 10 ? '#fca5a5' : '#7dd3fc'}
                fontSize="8.5"
                fontWeight="bold"
                fontFamily="var(--font-mono)"
              >
                {ferry.state === 'boarding'
                  ? isFull
                    ? '🚨 FULL! CASTING OFF 🚢'
                    : `⏰ FULL OR IN ${Math.ceil(ferry.sprintTimer)}s`
                  : ferry.state === 'sailing' || ferry.state === 'departing'
                  ? '🚢 SAILING TO PROD'
                  : '⚓ DOCKING FOR NEXT DAY'}
              </text>
            </g>

            {/* Boarding Gangway Ramp (Visible when docked) */}
            {ferry.state === 'boarding' && (
              <g transform="translate(-40, 160)">
                <rect width="45" height="60" rx="3" fill="#52525b" stroke="#71717a" strokeWidth="1.5" />
                <line x1="0" y1="175" x2="45" y2="175" stroke="#eab308" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="0" y1="205" x2="45" y2="205" stroke="#eab308" strokeWidth="2" strokeDasharray="4 4" />
              </g>
            )}
          </g>

          {/* 5. MOVING STORY POINT VEHICLES */}
          {vehicles.map((v) => {
            const targetLaneIndex = v.laneIndex >= 0 && v.laneIndex < LANE_Y_POSITIONS.length ? v.laneIndex : 2;
            const laneY = LANE_Y_POSITIONS[targetLaneIndex];
            const targetCarY = laneY + (LANE_HEIGHT - v.width) / 2;
            const FEEDER_CAR_Y = 237.5 - v.width / 2;

            // Calculate actual visual Y from simulated v.y or smooth trajectory
            let carY = targetCarY;
            let angle = 0;

            if (v.y !== undefined && !isNaN(v.y)) {
              carY = v.y;
            } else if (v.x < 40) {
              carY = FEEDER_CAR_Y;
            } else if (v.x < 185) {
              const t = Math.max(0, Math.min(1, (v.x - 40) / 145));
              const smoothT = t * t * (3 - 2 * t);
              carY = FEEDER_CAR_Y + (targetCarY - FEEDER_CAR_Y) * smoothT;
            }

            // Calculate subtle steering bank angle while fanning out into assigned lane
            if (v.x >= 40 && v.x <= 185) {
              const t = (v.x - 40) / 145;
              const derivative = 6 * t * (1 - t);
              const dy = targetCarY - FEEDER_CAR_Y;
              angle = Math.atan2((dy * derivative) / 145, 1) * (180 / Math.PI);
              angle = Math.max(-25, Math.min(25, angle));
            }

            const isHovered = hoveredVehicle?.id === v.id;
            const canSlice = v.points >= 3;

            return (
              <g
                key={v.id}
                transform={`translate(${v.x}, ${carY}) rotate(${angle}, ${v.length / 2}, ${v.width / 2})`}
                className="cursor-pointer"
                filter="url(#carShadow)"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVehicle(v);
                }}
                onMouseEnter={() => setHoveredVehicle(v)}
                onMouseLeave={() => setHoveredVehicle(null)}
              >
                {/* Vehicle Main Body */}
                <rect
                  x="0"
                  y="0"
                  width={v.length}
                  height={v.width}
                  rx={v.points >= 8 ? 3 : 5}
                  fill={v.color}
                  stroke={isHovered ? '#ffffff' : v.accentColor}
                  strokeWidth={isHovered ? 2 : 1}
                />

                {/* Windshield & Cab */}
                <rect
                  x={v.length - 12}
                  y="2"
                  width="7"
                  height={v.width - 4}
                  rx="2"
                  fill="#0f172a"
                  opacity="0.8"
                />

                {/* Headlights */}
                <circle cx={v.length - 2} cy="3" r="1.5" fill="#fef08a" />
                <circle cx={v.length - 2} cy={v.width - 3} r="1.5" fill="#fef08a" />

                {/* Rear Brake Lights */}
                <circle cx="2" cy="3" r="1.5" fill="#ef4444" />
                <circle cx="2" cy={v.width - 3} r="1.5" fill="#ef4444" />

                {/* Wheels */}
                <rect x="5" y="-1.5" width="6" height="2" fill="#090d16" rx="1" />
                <rect x="5" y={v.width - 0.5} width="6" height="2" fill="#090d16" rx="1" />
                <rect x={v.length - 11} y="-1.5" width="6" height="2" fill="#090d16" rx="1" />
                <rect x={v.length - 11} y={v.width - 0.5} width="6" height="2" fill="#090d16" rx="1" />

                {/* Semi-trailer wheels for 13pt & 21pt */}
                {v.points >= 13 && (
                  <>
                    <rect x="20" y="-1.5" width="6" height="2" fill="#090d16" rx="1" />
                    <rect x="20" y={v.width - 0.5} width="6" height="2" fill="#090d16" rx="1" />
                    <rect x="40" y="-1.5" width="6" height="2" fill="#090d16" rx="1" />
                    <rect x="40" y={v.width - 0.5} width="6" height="2" fill="#090d16" rx="1" />
                  </>
                )}

                {/* Story Point Badge Number on Roof */}
                <circle
                  cx={v.length / 2 - 2}
                  cy={v.width / 2}
                  r="7"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
                <text
                  x={v.length / 2 - 2}
                  y={v.width / 2 + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                >
                  {v.points}
                </text>

                {/* Slice Story affordance button on hover for large stories */}
                {isHovered && canSlice && (
                  <g
                    transform={`translate(${v.length / 2 - 10}, -18)`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSliceStory(v.id);
                    }}
                  >
                    <rect width="22" height="15" rx="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                    <Scissors x="4" y="2" width="11" height="11" className="text-slate-950" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hovered Tooltip Overlay */}
        {hoveredVehicle && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 px-3 py-2 rounded-lg shadow-xl text-xs backdrop-blur-sm max-w-xs"
            style={{
              left: Math.min(window.innerWidth - 300, Math.max(20, hoveredVehicle.x * 0.9)),
              top: Math.max(10, (hoveredVehicle.y ?? (LANE_Y_POSITIONS[hoveredVehicle.laneIndex] ?? 200)) * 0.9 - 40)
            }}
          >
            <div className="flex items-center gap-2 font-bold">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hoveredVehicle.color }}
              />
              <span className="text-white">{hoveredVehicle.points} Story Points</span>
              <span className="text-slate-400 font-normal">({hoveredVehicle.type.toUpperCase()})</span>
            </div>
            <p className="text-slate-300 mt-0.5 line-clamp-1">{hoveredVehicle.title}</p>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
              <span>Base time: {hoveredVehicle.baseProcessingTime}s</span>
              <span>Toll: ${hoveredVehicle.tollValue}</span>
            </div>
            {hoveredVehicle.points >= 8 && (
              <p className="text-amber-400 text-[10px] mt-1 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Large batch! May cause queue bottlenecks. Click to slice!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Interactive Bottom Control Ribbon on Canvas */}
      <div className="px-5 py-3 bg-[#1E222A] border-t-[3px] border-[#1E222A] flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Spawn Controls: Test Little's Law and Batch Sizing with Chunky Toy Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-300 text-[11px] font-black uppercase tracking-wider hidden sm:inline" style={{ fontFamily: 'var(--font-heading)' }}>
            Inject Backlog:
          </span>
          <button
            onClick={() => onSpawnStory(1)}
            className="px-3 py-1.5 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] border-2 border-[#1E222A] rounded-xl transition-all flex items-center gap-1 font-mono font-black shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Inject 1-point hotfix bug (nimble)"
          >
            +1 pt Bug
          </button>
          <button
            onClick={() => onSpawnStory(3)}
            className="px-3 py-1.5 bg-[#48A2D8] hover:bg-[#5CB5EB] text-white border-2 border-[#1E222A] rounded-xl transition-all flex items-center gap-1 font-mono font-black shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Inject standard 3-point feature story"
          >
            +3 pt Story
          </button>
          <button
            onClick={() => onSpawnStory(8)}
            className="px-3 py-1.5 bg-[#E85D04] hover:bg-[#F47019] text-white border-2 border-[#1E222A] rounded-xl transition-all flex items-center gap-1 font-mono font-black shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Inject 8-point epic (heavy truck)"
          >
            +8 pt Epic
          </button>
          <button
            onClick={() => onSpawnStory(21)}
            className="px-3 py-1.5 bg-[#D92525] hover:bg-[#E83C3C] text-white border-2 border-[#1E222A] rounded-xl transition-all flex items-center gap-1 font-mono font-black shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Inject 21-point monolithic redesign (watch lanes bottleneck!)"
          >
            +21 pt Monolith 🐢
          </button>

          {onToggleContinuousFlow && (
            <button
              onClick={onToggleContinuousFlow}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-mono font-black cursor-pointer border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none ${
                continuousFlowMode
                  ? 'bg-[#FFD200] text-[#1E222A]'
                  : 'bg-[#2B2F38] text-slate-300 hover:text-white'
              }`}
              title="Toggle Continual Flow Mode: Continuous stream of user stories entering the highway"
            >
              <Zap className={`w-3.5 h-3.5 ${continuousFlowMode ? 'text-[#E85D04] fill-[#E85D04]' : 'text-slate-400'}`} />
              <span>{continuousFlowMode ? 'FLOW: CONTINUAL' : 'FLOW: BATCH'}</span>
            </button>
          )}
        </div>

        {/* Quick Instructions & Ferry Trigger */}
        <div className="flex items-center gap-4">
          <div className="text-slate-300 text-[11px] font-semibold hidden md:flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD200] border border-[#1E222A]" />
            <span>Click any vehicle to inspect or slice epics</span>
          </div>

          <button
            onClick={onLaunchFerry}
            disabled={ferry.currentPoints === 0 || ferry.state !== 'boarding'}
            className={`px-4 py-1.5 font-black rounded-xl transition-all flex items-center gap-2 border-2 border-[#1E222A] text-xs ${
              ferry.currentPoints > 0 && ferry.state === 'boarding'
                ? 'bg-[#D92525] hover:bg-[#E83C3C] text-white shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer'
                : 'bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Deploy Ferry
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Flow Efficiency Principle Violation Educational Modal */}
      {selectedViolationBooth && (
        <FlowEfficiencyViolationModal
          booth={selectedViolationBooth}
          laneVehicles={vehicles}
          metrics={metrics || {
            currentWIP: vehicles.length,
            wipPoints: vehicles.reduce((s, v) => s + v.points, 0),
            throughputPerMinute: 12,
            throughputPointsPerMinute: 24,
            averageCycleTime: 6.5,
            averageLeadTime: 18.0,
            flowEfficiency: 35,
            littlesLawDiscrepancy: 1.2,
            bottleneckLaneIndex: selectedViolationBooth.id,
            completedStoriesTotal: 0,
            completedPointsTotal: 0
          }}
          funds={funds}
          onClose={() => setSelectedViolationBooth(null)}
          onSliceStory={onSliceStory}
          onUpgradeEfficiency={onUpgradeEfficiency}
          onUpgradeAutomation={onUpgradeAutomation}
          onSetWipLimit={onSetLaneWipLimit}
        />
      )}
    </div>
  );
};
