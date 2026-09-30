import React, { useRef, useState } from 'react';
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
  Info,
  ClipboardList
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
  onSpawnStory?: (points?: StoryPoint) => void;
  onLaunchFerry: () => void;
  onUpgradeEfficiency?: (boothId: number) => void;
  onUpgradeAutomation?: (boothId: number) => void;
  onSetLaneWipLimit?: (boothId: number, limit: number) => void;
  gameSpeed: number;
  onSetGameSpeed: (speed: number) => void;
  continuousFlowMode?: boolean;
  onToggleContinuousFlow?: () => void;
  funds: number;
  onResolveIncident?: (boothId: number, emergency?: boolean) => void;
  onDispatchFromParkingLot?: () => void;
  onOpenSprintPlanning?: () => void;
  onOpenUpgrades?: () => void;
  onStageStoryInParkingLot?: (points?: StoryPoint) => void;
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
  onLaunchFerry: _onLaunchFerry,
  onUpgradeEfficiency,
  onUpgradeAutomation,
  onSetLaneWipLimit,
  gameSpeed,
  onSetGameSpeed,
  continuousFlowMode = true,
  onToggleContinuousFlow,
  funds,
  onResolveIncident,
  onDispatchFromParkingLot,
  onOpenSprintPlanning,
  onOpenUpgrades: _onOpenUpgrades,
  onStageStoryInParkingLot
}) => {
  const [hoveredVehicle, setHoveredVehicle] = useState<VehicleStory | null>(null);
  const [selectedViolationBooth, setSelectedViolationBooth] = useState<TollBooth | null>(null);
  const previousGameSpeedRef = useRef<number | null>(null);

  const openFlowInspection = (booth: TollBooth) => {
    if (previousGameSpeedRef.current === null) {
      previousGameSpeedRef.current = gameSpeed;
      onSetGameSpeed(0);
    }
    setSelectedViolationBooth(booth);
  };

  const closeFlowInspection = () => {
    setSelectedViolationBooth(null);
    if (previousGameSpeedRef.current !== null) {
      onSetGameSpeed(previousGameSpeedRef.current);
      previousGameSpeedRef.current = null;
    }
  };

  React.useEffect(() => () => {
    if (previousGameSpeedRef.current !== null) {
      onSetGameSpeed(previousGameSpeedRef.current);
    }
  }, [onSetGameSpeed]);

  // Calculate ferry position when sailing
  let ferryX = 470;
  if (ferry.state === 'departing' || ferry.state === 'sailing') {
    ferryX = 470 + (ferry.sailProgress / 100) * 450;
  } else if (ferry.state === 'returning') {
    ferryX = 470 + (ferry.sailProgress / 100) * 450;
  }

  // Daily cycle timing & departure rule calculations
  const secondsLeft = Math.ceil(ferry.sprintTimer);
  const formattedCountdown = `00:${String(secondsLeft).padStart(2, '0')}`;
  const isFull = ferry.currentPoints >= ferry.capacity;
  const isUrgent = (ferry.sprintTimer <= 10 || isFull) && ferry.state === 'boarding';

  // Identify staged vehicles in the Parking Lot and active incidents
  const stagedVehicles = React.useMemo(() => vehicles.filter((v) => v.state === 'staged'), [vehicles]);
  const stagedPoints = React.useMemo(() => stagedVehicles.reduce((sum, v) => sum + v.points, 0), [stagedVehicles]);
  const activeIncidents = React.useMemo(() => booths.filter((b) => b.unlocked && b.incident !== null), [booths]);

  // Identify significant bottleneck booth (only triggers after cars reach the toll gate)
  const primaryBottleneck = React.useMemo<{ booth: TollBooth; queue: VehicleStory[]; points: number } | null>(() => {
    let worst: { booth: TollBooth; queue: VehicleStory[]; points: number } | null = null;
    booths.forEach((b) => {
      if (!b.unlocked) return;

      // Has at least one vehicle reached the toll gate in this lane?
      const hasReachedTollGate =
        b.isProcessing ||
        b.currentVehicleId !== null ||
        vehicles.some(
          (v) =>
            v.laneIndex === b.id &&
            (v.state === 'processing' || (v.state === 'queued' && v.x >= 170) || v.x >= 180)
        );

      if (!hasReachedTollGate) return;

      // Queue of vehicles that have reached the toll gate area
      const q = vehicles.filter(
        (v) =>
          v.laneIndex === b.id &&
          (v.state === 'processing' ||
            (v.state === 'queued' && v.x >= 80) ||
            (v.state === 'approaching' && v.x >= 110))
      );
      const pts = q.reduce((sum, v) => sum + v.points, 0);

      const isBottleneck =
        (q.length >= b.wipLimit && q.length >= 2) ||
        q.length >= 3 ||
        pts >= 12;

      if (isBottleneck && (!worst || pts > worst.points)) {
        worst = { booth: b, queue: q, points: pts };
      }
    });
    return worst;
  }, [booths, vehicles]);

  return (
    <div className="relative w-full h-[800px] sm:h-[840px] lg:h-[880px] min-h-[720px] bg-[#2B2F38] border-[3px] border-[#1E222A] rounded-3xl overflow-hidden shadow-[0_8px_0_#1E222A] flex flex-col select-none">
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
              {ferry.dayPhase === 'planning' && <Clock className="w-4 h-4 text-[#FFD200]" />}
              {ferry.dayPhase === 'morning' && <Sun className="w-4 h-4 text-[#FFD200]" />}
              {ferry.dayPhase === 'midday' && <Sun className="w-4 h-4 text-yellow-300" />}
              {ferry.dayPhase === 'afternoon' && <Sun className="w-4 h-4 text-[#E85D04]" />}
              {ferry.dayPhase === 'sunset' && <Sunset className="w-4 h-4 text-[#E85D04]" />}
              {ferry.dayPhase === 'departure' && <Ship className="w-4 h-4 text-[#FFD200] animate-bounce" />}
              {ferry.dayTimeFormatted}
            </span>
          </div>
        </div>

        {/* Departure Criteria & Countdown Clock */}
        <div className="flex items-center gap-3 font-mono">
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

      {/* Active Incidents Alert Banner */}
      {activeIncidents.length > 0 && (
        <div className="bg-[#E85D04] border-b-[2.5px] border-[#1E222A] px-4 py-2 flex items-center justify-between text-xs text-white z-10 shrink-0 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-lg bg-[#1E222A] text-[#FFD200] border border-black/30 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="truncate">
              <strong className="text-[#FFD200]">ROADWAY OBSTRUCTION:</strong>{' '}
              {activeIncidents.map((b) => `${b.name.split('·')[0]} (${b.incident?.title}, ${Math.ceil(b.incident?.remaining || 0)}s)`).join(' · ')}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {activeIncidents.map((b) => (
              <button
                key={b.id}
                onClick={() => onResolveIncident && onResolveIncident(b.id, true)}
                className="px-2.5 py-1 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-xs border border-[#1E222A] shadow cursor-pointer transition-all active:translate-y-0.5"
              >
                Clear {b.name.split('·')[0]} (${b.incident?.quickFixCost})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sprint Planning Phase Callout */}
      {ferry.dayPhase === 'planning' && (
        <div className="bg-[#1E222A] border-b-[2.5px] border-[#384050] px-4 py-2 flex items-center justify-between text-xs text-[#F4F6F9] z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-[#FFD200] text-[#1E222A] font-black text-[10px] uppercase font-mono">
              Planning Phase
            </span>
            <span>
              Roadway will open once sprint commitments are finalized. Staged in parking lot: <strong>{stagedVehicles.length} stories ({stagedPoints} pts)</strong>.
            </span>
          </div>
          {onOpenSprintPlanning && (
            <button
              onClick={onOpenSprintPlanning}
              className="px-3 py-1 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-xs flex items-center gap-1.5 border border-[#1E222A] shadow cursor-pointer transition-all"
            >
              <span>🅿️ Parking Lot Staging</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

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
            onClick={() => openFlowInspection(primaryBottleneck.booth)}
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
          viewBox="-415 0 1285 500"
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

            {/* Toll Island Chevron Warning Pattern */}
            <pattern id="islandChevron" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="4" height="8" fill="#FFD200" />
              <rect x="4" width="4" height="8" fill="#1E222A" />
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
          {/* Extended Highway & Toll Plaza Surface */}
          <rect x="-420" y="20" width="850" height="470" fill="url(#roadGrad)" />

          {/* Ocean Water Zone */}
          <rect x="430" y="20" width="460" height="470" fill="url(#waterGrad)" opacity="0.9" />

          {/* Animated Wave Ripples in Water */}
          <g opacity="0.35">
            <path
              d="M 450 60 Q 490 50, 530 60 T 610 60 T 690 60 T 770 60 T 850 60"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="2"
              strokeDasharray="8 12"
            />
            <path
              d="M 470 180 Q 510 170, 550 180 T 630 180 T 710 180 T 790 180 T 870 180"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="1.5"
              strokeDasharray="6 14"
            />
            <path
              d="M 440 320 Q 480 310, 520 320 T 600 320 T 680 320 T 760 320 T 840 320"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="2"
              strokeDasharray="10 15"
            />
            <path
              d="M 460 440 Q 500 430, 540 440 T 620 440 T 700 440 T 780 440 T 860 440"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="1.5"
              strokeDasharray="6 12"
            />
          </g>

          {/* Coastal Pier / Quayside */}
          <rect x="415" y="20" width="40" height="470" fill="url(#pierWood)" />
          <line x1="455" y1="20" x2="455" y2="490" stroke="#1c1917" strokeWidth="3" />

          {/* Pier Bollards */}
          {[60, 140, 220, 300, 380, 460].map((by) => (
            <circle key={by} cx="445" cy={by} r="5" fill="#78716c" stroke="#292524" strokeWidth="2" />
          ))}

          {/* 2. HIGHWAY LANES, DUAL-SIDE SPRINT PARKING LOT & TOLL ISLANDS */}
          {/* NORTH STAGING BAY (Top side of street, y = 22..192) */}
          <g>
            {/* Asphalt Foundation for North Bay */}
            <rect
              x="-412"
              y="22"
              width="194"
              height="170"
              rx="8"
              fill="#181c24"
              stroke="#384050"
              strokeWidth="2"
            />
            {/* Overhead Signboard */}
            <rect x="-406" y="26" width="182" height="20" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text
              x="-328"
              y="39"
              fill="#fef08a"
              fontSize="7"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              letterSpacing="0.5"
            >
              🅿️ NORTH STAGING BAY
            </text>

            {/* 6 Marked Parking Stalls for North Bay (3 cols x 2 rows, N1..N6) */}
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const col = idx % 3;
              const row = Math.floor(idx / 3);
              const stallX = -402 + col * 58;
              const stallY = 54 + row * 46;
              return (
                <g key={'stall-north-' + idx}>
                  <rect
                    x={stallX}
                    y={stallY}
                    width="48"
                    height="36"
                    rx="4"
                    fill="#11141a"
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text
                    x={stallX + 5}
                    y={stallY + 11}
                    fill="#f59e0b"
                    fontSize="6.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    N{idx + 1}
                  </text>
                </g>
              );
            })}

            {/* Tarmac connector slipway from North lot down into the North one-way lane */}
            <path
              d="M -218 135 C -170 135, -170 202, -120 202 L -120 237.5 L -218 237.5 Z"
              fill="#0b1324"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* North merge feeder dashed curve guide into North one-way lane */}
            <path
              d="M -218 135 C -170 145, -165 219.75, -120 219.75"
              fill="none"
              stroke="#fef08a"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              opacity="0.95"
            />
          </g>

          {/* SOUTH STAGING BAY (Bottom side of street, y = 278..448) */}
          <g>
            {/* Asphalt Foundation for South Bay */}
            <rect
              x="-412"
              y="278"
              width="194"
              height="170"
              rx="8"
              fill="#181c24"
              stroke="#384050"
              strokeWidth="2"
            />
            {/* Overhead Signboard */}
            <rect x="-406" y="424" width="182" height="20" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <text
              x="-328"
              y="437"
              fill="#bae6fd"
              fontSize="7"
              fontWeight="black"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              letterSpacing="0.5"
            >
              🅿️ SOUTH STAGING BAY
            </text>

            {/* 6 Marked Parking Stalls for South Bay (3 cols x 2 rows, S1..S6) */}
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const col = idx % 3;
              const row = Math.floor(idx / 3);
              const stallX = -402 + col * 58;
              const stallY = 292 + row * 46;
              return (
                <g key={'stall-south-' + idx}>
                  <rect
                    x={stallX}
                    y={stallY}
                    width="48"
                    height="36"
                    rx="4"
                    fill="#11141a"
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="3 2"
                  />
                  <text
                    x={stallX + 5}
                    y={stallY + 11}
                    fill="#38bdf8"
                    fontSize="6.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    S{idx + 1}
                  </text>
                </g>
              );
            })}

            {/* Tarmac connector slipway from South lot up into the South one-way lane */}
            <path
              d="M -218 375 C -170 375, -170 273, -120 273 L -120 237.5 L -218 237.5 Z"
              fill="#0b1324"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* South merge feeder dashed curve guide into South one-way lane */}
            <path
              d="M -218 375 C -170 360, -165 255.25, -120 255.25"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              opacity="0.95"
            />
          </g>

          {/* MAIN HIGHWAY ROADWAY EXTENDING TO TOLL GATES & PIER */}
          <g id="main-road-system">
            {/* Solid Paved Roadway Surface extending from intake through fan-out and all 6 toll gates to the dock */}
            <path
              d="M -412 202 L -80 202 C -20 202, 0 46, 50 46 L 415 46 L 415 499 L 50 499 C 0 499, -20 273, -80 273 L -412 273 Z"
              fill="#0d121c"
              stroke="#1e293b"
              strokeWidth="1.5"
            />

            {/* Heavy Concrete Road Curbs with high-visibility reflective markers along both edges */}
            {/* North Road Curb */}
            <path
              d="M -412 199 L -80 199 C -20 199, 0 43, 50 43 L 415 43"
              fill="none"
              stroke="#334155"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M -412 199 L -80 199 C -20 199, 0 43, 50 43 L 415 43"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="16 16"
            />
            <path
              d="M -412 202 L -80 202 C -20 202, 0 46, 50 46 L 415 46"
              fill="none"
              stroke="#f8fafc"
              strokeWidth="2.5"
            />

            {/* South Road Curb */}
            <path
              d="M -412 276 L -80 276 C -20 276, 0 502, 50 502 L 415 502"
              fill="none"
              stroke="#334155"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M -412 276 L -80 276 C -20 276, 0 502, 50 502 L 415 502"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="16 16"
            />
            <path
              d="M -412 273 L -80 273 C -20 273, 0 499, 50 499 L 415 499"
              fill="none"
              stroke="#f8fafc"
              strokeWidth="2.5"
            />

            {/* White Dashed Divider Line separating North and South One-Way Lanes (x = -412 to -80) */}
            <line x1="-412" y1="237.5" x2="-80" y2="237.5" stroke="#f8fafc" strokeWidth="2" strokeDasharray="14 10" />

            {/* North One-Way Lane Markings (from North Staging Bay) */}
            <g opacity="0.85">
              <path d="M -170 216 L -164 219.5 L -170 223" fill="none" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M -130 216 L -124 219.5 L -130 223" fill="none" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M -90 216 L -84 219.5 L -90 223" fill="none" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="-310" y="222" fill="#fef08a" fontSize="6.5" fontWeight="black" fontFamily="var(--font-mono)" letterSpacing="0.8">
              NORTH ONE-WAY LANE (FROM NORTH LOT) →
            </text>

            {/* South One-Way Lane Markings (from South Staging Bay) */}
            <g opacity="0.85">
              <path d="M -170 252 L -164 255.5 L -170 259" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M -130 252 L -124 255.5 L -130 259" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M -90 252 L -84 255.5 L -90 259" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="-310" y="258" fill="#38bdf8" fontSize="6.5" fontWeight="black" fontFamily="var(--font-mono)" letterSpacing="0.8">
              SOUTH ONE-WAY LANE (FROM SOUTH LOT) →
            </text>

            {/* Feeder Overhead Road Sign / Marker */}
            <g transform="translate(-175, 168)">
              <rect width="130" height="22" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
              <text x="65" y="14" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-mono)">
                ONE-WAY EAST · AUTO-ROUTING →
              </text>
            </g>

            {/* Fan-Out Plaza Apron Road Markings (x = -80 to 50) */}
            <text x="-15" y="224" fill="#475569" fontSize="7.5" fontWeight="black" fontFamily="var(--font-mono)" letterSpacing="1.5" textAnchor="middle">
              FERRY APPROACH · DIVERGING TO SHORTEST TOLL LANE
            </text>

            {/* Concrete Lane Dividers separating all 6 lanes from fan-out (x=50) to toll gates (x=230) */}
            {[122.5, 197.5, 272.5, 347.5, 422.5].map((sepY) => (
              <g key={'lane-sep-' + sepY}>
                <line x1="50" y1={sepY} x2="230" y2={sepY} stroke="#334155" strokeWidth="4" />
                <line x1="50" y1={sepY} x2="230" y2={sepY} stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="14 10" />
                {/* Continuation after toll gates to dock (x=266 to 415) */}
                <line x1="266" y1={sepY} x2="415" y2={sepY} stroke="#334155" strokeWidth="3" />
                <line x1="266" y1={sepY} x2="415" y2={sepY} stroke="#64748b" strokeWidth="1" strokeDasharray="8 8" />
              </g>
            ))}
          </g>

          {/* Fan-Out Plaza Transition Zone (x=-80 to 50) Curved Guide Tracks from North and South Lanes */}
          {booths.map((booth, idx) => {
            const destY = LANE_Y_POSITIONS[idx] + LANE_HEIGHT / 2;
            const startY = idx <= 2 ? 219.75 : 255.25;
            return (
              <g key={'fan-guide-' + booth.id}>
                <path
                  d={`M -80 ${startY} C -20 ${startY}, 0 ${destY}, 50 ${destY}`}
                  fill="none"
                  stroke={booth.unlocked ? '#38bdf8' : '#475569'}
                  strokeWidth={booth.unlocked ? 1.5 : 1}
                  strokeDasharray={booth.unlocked ? '6 6' : '3 6'}
                  opacity={booth.unlocked ? 0.65 : 0.2}
                />
                {/* Availability Indicator at entrance of each lane (x=40) */}
                {booth.unlocked ? (
                  <path
                    d={`M 38 ${destY - 6} L 46 ${destY} L 38 ${destY + 6}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                ) : (
                  <g opacity="0.6">
                    <line x1="38" y1={destY - 5} x2="46" y2={destY + 5} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                    <line x1="46" y1={destY - 5} x2="38" y2={destY + 5} stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}

          {booths.map((booth, idx) => {
            const laneY = LANE_Y_POSITIONS[idx];
            const isUnlocked = booth.unlocked;

            // Has at least one vehicle reached the toll gate in this lane?
            const hasCarsReachedGate =
              booth.isProcessing ||
              booth.currentVehicleId !== null ||
              vehicles.some(
                (v) =>
                  v.laneIndex === booth.id &&
                  (v.state === 'processing' || (v.state === 'queued' && v.x >= 170) || v.x >= 180)
              );

            // Queue of vehicles that have reached the toll gate area
            const laneQueue = vehicles.filter(
              (v) =>
                v.laneIndex === booth.id &&
                (v.state === 'processing' ||
                  (v.state === 'queued' && v.x >= 80) ||
                  (v.state === 'approaching' && v.x >= 110))
            );
            const lanePoints = laneQueue.reduce((acc, v) => acc + v.points, 0);
            const isAtWipLimit = isUnlocked && hasCarsReachedGate && laneQueue.length >= booth.wipLimit;
            const hasHeavyVehicle = isUnlocked && hasCarsReachedGate && laneQueue.some((v) => v.points >= 8);

            // Severe bottleneck condition: ONLY shows up after cars have reached the toll gate
            const isSevereBottleneck =
              isUnlocked &&
              hasCarsReachedGate &&
              ((laneQueue.length >= booth.wipLimit && laneQueue.length >= 2) ||
                laneQueue.length >= 3 ||
                lanePoints >= 12);

            return (
              <g key={booth.id} className="transition-opacity duration-300">
                {/* Lane asphalt surface leading directly to the toll gates (x=50 to 230) */}
                <rect
                  x="50"
                  y={laneY}
                  width="180"
                  height={LANE_HEIGHT}
                  fill="#0e131d"
                  stroke="#1e293b"
                  strokeWidth="0.5"
                />

                {/* Painted Lane Centerline reaching the toll gate */}
                <line
                  x1="50"
                  y1={laneY + LANE_HEIGHT / 2}
                  x2="208"
                  y2={laneY + LANE_HEIGHT / 2}
                  stroke={isUnlocked ? '#64748b' : '#334155'}
                  strokeWidth="1.5"
                  strokeDasharray="8 8"
                />

                {/* Painted Road Asphalt Stencils (Lane Number & Directional Arrow) */}
                {isUnlocked && (
                  <g opacity="0.75">
                    <text
                      x="62"
                      y={laneY + LANE_HEIGHT / 2 + 3}
                      fill="#475569"
                      fontSize="8.5"
                      fontWeight="bold"
                      fontFamily="var(--font-mono)"
                    >
                      L{idx + 1}
                    </text>
                    {/* Directional Guide Arrow on asphalt pointing to gate */}
                    <path
                      d={`M 95 ${laneY + LANE_HEIGHT / 2} L 110 ${laneY + LANE_HEIGHT / 2} M 104 ${laneY + LANE_HEIGHT / 2 - 3} L 110 ${laneY + LANE_HEIGHT / 2} L 104 ${laneY + LANE_HEIGHT / 2 + 3}`}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}

                {/* Road Stop Line Bar right before the toll gate island base (x=226) */}
                <line
                  x1="226"
                  y1={laneY + 4}
                  x2="226"
                  y2={laneY + LANE_HEIGHT - 4}
                  stroke="#ffffff"
                  strokeWidth="3.5"
                />
                <text
                  x="211"
                  y={laneY + 42}
                  fill="#94a3b8"
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.6"
                >
                  STOP
                </text>

                {/* Concrete Approach Nose Chevron Hazard Stripes (x=222 to 230) */}
                <polygon
                  points={`222,${laneY + 12} 230,${laneY - 4} 230,${laneY + 28}`}
                  fill="url(#islandChevron)"
                  stroke="#1e222a"
                  strokeWidth="0.5"
                />
                <polygon
                  points={`222,${laneY + LANE_HEIGHT - 12} 230,${laneY + LANE_HEIGHT - 28} 230,${laneY + LANE_HEIGHT + 4}`}
                  fill="url(#islandChevron)"
                  stroke="#1e222a"
                  strokeWidth="0.5"
                />

                {/* Post-gate Road Surface connecting toll gate to the dock (x=266 to 415) */}
                <rect
                  x="266"
                  y={laneY}
                  width="149"
                  height={LANE_HEIGHT}
                  fill="#0b0f17"
                  stroke="#1e293b"
                  strokeWidth="0.5"
                />
                <line
                  x1="266"
                  y1={laneY + LANE_HEIGHT / 2}
                  x2="415"
                  y2={laneY + LANE_HEIGHT / 2}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="6 6"
                />
                {isUnlocked && (
                  <path
                    d={`M 330 ${laneY + LANE_HEIGHT / 2} L 346 ${laneY + LANE_HEIGHT / 2} M 340 ${laneY + LANE_HEIGHT / 2 - 3} L 346 ${laneY + LANE_HEIGHT / 2} L 340 ${laneY + LANE_HEIGHT / 2 + 3}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.65"
                  />
                )}

                {/* Locked lane overlay (from x=50 to pier x=415) */}
                {!isUnlocked && (
                  <g>
                    <rect
                      x="50"
                      y={laneY - 2}
                      width="365"
                      height={LANE_HEIGHT + 4}
                      fill="#090d16"
                      opacity="0.85"
                    />
                    <line x1="50" y1={laneY + 35} x2="230" y2={laneY + 35} stroke="#3b0764" strokeWidth="2" strokeDasharray="6 6" />

                    {/* Unlock Button / Gate */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => onUnlockBooth(booth.id)}
                    >
                      <rect
                        x="120"
                        y={laneY + 8}
                        width="160"
                        height={52}
                        rx="8"
                        fill="#1e1b4b"
                        stroke={funds >= booth.unlockCost ? '#6366f1' : '#3730a3'}
                        strokeWidth="1.5"
                        className="group-hover:fill-indigo-900/60 transition-colors"
                      />
                      <Lock x="130" y={laneY + 22} width="18" height="18" className="text-indigo-400" />
                      <text x="155" y={laneY + 28} fill="#e0e7ff" fontSize="10.5" fontWeight="bold">
                        Unlock {booth.name.split('·')[0]}
                      </text>
                      <text x="155" y={laneY + 44} fill={funds >= booth.unlockCost ? '#a5b4fc' : '#f43f5e'} fontSize="10.5" fontFamily="var(--font-mono)">
                        ${booth.unlockCost} {funds < booth.unlockCost ? '(Need Funds)' : '→ Open Lane'}
                      </text>
                    </g>
                  </g>
                )}

                {/* Unlocked Lane Elements */}
                {isUnlocked && (
                  <g>
                    {/* Active Incident Blockage Overlay */}
                    {booth.incident && (
                      <g>
                        <rect
                          x="110"
                          y={laneY}
                          width="120"
                          height={LANE_HEIGHT}
                          fill="url(#hazardStripes)"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                        />
                        {/* Interactive Clickable Incident Resolution Card */}
                        <g
                          className="cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveIncident && onResolveIncident(booth.id, true);
                          }}
                        >
                          <rect
                            x="15"
                            y={laneY + 12}
                            width="215"
                            height="26"
                            rx="6"
                            fill="#450a0a"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                          />
                          <text
                            x="24"
                            y={laneY + 28}
                            fill="#fecdd3"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="var(--font-mono)"
                          >
                            ⚠️ {booth.incident.title.toUpperCase()} ({Math.ceil(booth.incident.remaining)}s)
                          </text>
                          <rect
                            x="155"
                            y={laneY + 15}
                            width="70"
                            height="20"
                            rx="4"
                            fill="#ef4444"
                            stroke="#ffffff"
                            strokeWidth="0.8"
                            className="group-hover:fill-red-600 transition-colors"
                          />
                          <text
                            x="190"
                            y={laneY + 28}
                            fill="#ffffff"
                            fontSize="7.5"
                            fontWeight="black"
                            textAnchor="middle"
                          >
                            🔧 FIX (${booth.incident.quickFixCost})
                          </text>
                        </g>
                      </g>
                    )}

                    {/* Severe Bottleneck Flashing Road Hazard Overlay */}
                    {isSevereBottleneck && !booth.incident && (
                      <g className="animate-pulse">
                        <rect
                          x="25"
                          y={laneY + 4}
                          width="201"
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
                          onClick={() => openFlowInspection(booth)}
                        >
                          <rect
                            x="35"
                            y={laneY + 12}
                            width="186"
                            height="19"
                            rx="4"
                            fill="#450a0a"
                            stroke="#f87171"
                            strokeWidth="1"
                            className="group-hover:fill-rose-900 transition-colors"
                          />
                          <text
                            x="128"
                            y={laneY + 25}
                            fill="#fecdd3"
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="var(--font-mono)"
                            textAnchor="middle"
                          >
                            🚨 FLOW BOTTLENECK ({laneQueue.length}/{booth.wipLimit}) · PRINCIPLES
                          </text>
                        </g>
                      </g>
                    )}

                    {/* Standard WIP Limit reached indicator (if not in severe bottleneck) */}
                    {isAtWipLimit && !isSevereBottleneck && (
                      <g className="animate-pulse">
                        <rect
                          x="45"
                          y={laneY + 8}
                          width="180"
                          height={54}
                          rx="6"
                          fill="#ef4444"
                          opacity="0.12"
                        />
                        <text x="55" y={laneY + 24} fill="#fca5a5" fontSize="8.5" fontWeight="bold" fontFamily="var(--font-mono)">
                          ▲ WIP LIMIT REACHED ({laneQueue.length}/{booth.wipLimit})
                        </text>
                      </g>
                    )}

                    {/* Heavy vehicle bottleneck warning */}
                    {hasHeavyVehicle && !isSevereBottleneck && (
                      <g>
                        <rect
                          x="120"
                          y={laneY + 4}
                          width="100"
                          height="16"
                          rx="4"
                          fill="#7c2d12"
                          stroke="#ea580c"
                          strokeWidth="1"
                        />
                        <text x="126" y={laneY + 15} fill="#fdba74" fontSize="8.5" fontWeight="bold">
                          🐢 BOTTLENECK
                        </text>
                      </g>
                    )}

                    {/* Toll Island Structure (Physical booth) */}
                    <g
                      className={`cursor-pointer group ${isSevereBottleneck ? 'animate-pulse' : ''}`}
                      onClick={() => {
                        if (isSevereBottleneck) {
                          openFlowInspection(booth);
                        } else {
                          onSelectBooth(booth.id);
                        }
                      }}
                    >
                      {/* Concrete Island Base */}
                      <rect
                        x="230"
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
                        x="234"
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
                        x="237"
                        y={laneY + 12}
                        width="22"
                        height="15"
                        rx="2"
                        fill={isSevereBottleneck ? '#f87171' : '#38bdf8'}
                        opacity="0.35"
                      />

                      {/* Beacon Light - Flashing Strobe when Incident or Bottlenecked */}
                      {booth.incident ? (
                        <g>
                          <circle
                            cx="248"
                            cy={laneY + 4}
                            r="8"
                            fill="#f59e0b"
                            opacity="0.8"
                            className="animate-ping"
                          />
                          <circle
                            cx="248"
                            cy={laneY + 4}
                            r="4.5"
                            fill="#f59e0b"
                            filter="url(#glow)"
                          />
                        </g>
                      ) : isSevereBottleneck ? (
                        <g>
                          <circle
                            cx="248"
                            cy={laneY + 4}
                            r="8"
                            fill="#ef4444"
                            opacity="0.8"
                            className="animate-ping"
                          />
                          <circle
                            cx="248"
                            cy={laneY + 4}
                            r="4.5"
                            fill="#ef4444"
                            filter="url(#glow)"
                          />
                        </g>
                      ) : (
                        <circle
                          cx="248"
                          cy={laneY + 4}
                          r="4"
                          fill={booth.isProcessing ? '#38bdf8' : booth.cooldownTimer > 0 ? '#f59e0b' : '#10b981'}
                          filter="url(#glow)"
                        />
                      )}

                      {/* Turnaround Cooldown Badge between vehicles */}
                      {booth.cooldownTimer > 0 && (
                        <g>
                          <rect
                            x="165"
                            y={laneY - 4}
                            width="70"
                            height="13"
                            rx="3"
                            fill="#78350f"
                            stroke="#f59e0b"
                            strokeWidth="1"
                          />
                          <text
                            x="200"
                            y={laneY + 5}
                            fill="#fef08a"
                            fontSize="7"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="var(--font-mono)"
                          >
                            ⏱️ COOLDOWN: {booth.cooldownTimer.toFixed(1)}s
                          </text>
                        </g>
                      )}

                      {/* Electronic Overhead Signboard */}
                      <rect
                        x="165"
                        y={laneY + 2}
                        width="70"
                        height="20"
                        rx="3"
                        fill={isSevereBottleneck ? '#450a0a' : '#020617'}
                        stroke={isSevereBottleneck ? '#ef4444' : '#1e293b'}
                        strokeWidth={isSevereBottleneck ? '1.5' : '1'}
                      />
                      <text
                        x="170"
                        y={laneY + 11}
                        fill={isSevereBottleneck ? '#fca5a5' : '#94a3b8'}
                        fontSize="7.5"
                        fontWeight="bold"
                      >
                        {isSevereBottleneck ? '⚠️ BOTTLENECK' : `Lv.${booth.level}`}
                      </text>
                      <text
                        x="200"
                        y={laneY + 11}
                        fill={isSevereBottleneck ? '#f87171' : '#f59e0b'}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="var(--font-mono)"
                      >
                        {isSevereBottleneck ? `${laneQueue.length}Q` : `x${booth.multiplier.toFixed(2)}`}
                      </text>
                      {/* XP / Queue Load Progress Bar */}
                      <rect x="170" y={laneY + 14} width="60" height="3" rx="1.5" fill="#1e293b" />
                      <rect
                        x="170"
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
                        <text x="170" y={laneY - 2} fill="#38bdf8" fontSize="8" fontWeight="bold">
                          ⚡ Expedite Lane
                        </text>
                      )}
                      {booth.specialization === 'heavy_only' && (
                        <text x="170" y={laneY - 2} fill="#c084fc" fontSize="8" fontWeight="bold">
                          🚛 Heavy Haul
                        </text>
                      )}

                      {/* Animated Barrier Arm */}
                      <g
                        transform={
                          booth.barrierRaised
                            ? `rotate(-80, 266, ${laneY + 45})`
                            : `rotate(0, 266, ${laneY + 45})`
                        }
                        className="transition-transform duration-300 ease-out"
                      >
                        <rect
                          x="266"
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
                          <rect x="220" y={laneY + 60} width="60" height="5" rx="2.5" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                          <rect
                            x="220"
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
          <g>
            {/* Visual Dock Entrance Asphalt Ramp connecting road lanes into ferry berth */}
            <path
              d="M 405 180 L 450 180 L 450 320 L 405 320 Z"
              fill="#18202c"
              stroke="#334155"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <line x1="365" y1="250" x2="445" y2="250" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
            <polygon points="440,246 450,250 440,254" fill="#f59e0b" />
            <text x="375" y="242" fill="#cbd5e1" fontSize="8" fontWeight="bold" letterSpacing="0.8" fontFamily="var(--font-mono)">
              FERRY BERTH RAMP →
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
            <text x="237" y="225" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="bold">
              {ferry.shipTag || 'VEL-20'}
            </text>

            {/* Ferry Name & Sprint Number */}
            <text x="50" y="30" fill="#bae6fd" fontSize="11" fontWeight="bold" letterSpacing="1">
              {(ferry.shipName || 'S.S. VELOCITY').toUpperCase()} · SPRINT #{ferry.sprintNumber}
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

          {/* 5. MOVING STORY POINT VEHICLES & STAGED PARKING LOT CARS */}
          {vehicles.map((v) => {
            const targetLaneIndex = v.laneIndex >= 0 && v.laneIndex < LANE_Y_POSITIONS.length ? v.laneIndex : 2;
            const laneY = LANE_Y_POSITIONS[targetLaneIndex];
            const targetCarY = laneY + (LANE_HEIGHT - v.width) / 2;
            const isNorth = v.feederLane === 'north' || (v.parkingSlotIndex !== undefined && v.parkingSlotIndex % 2 === 0);
            const feederCarY = (isNorth ? 219.75 : 255.25) - v.width / 2;

            // Calculate actual visual coordinates
            let carX = v.x;
            let carY = targetCarY;
            let angle = 0;

            if (v.state === 'staged') {
              const slot = v.parkingSlotIndex ?? 0;
              const slotIsNorth = slot % 2 === 0;
              const bayIndex = Math.floor(slot / 2);
              const col = bayIndex % 3;
              const row = Math.floor(bayIndex / 3);
              carX = -402 + col * 58 + (48 - v.length) / 2;
              carY = (slotIsNorth ? 54 + row * 46 : 292 + row * 46) + (36 - v.width) / 2;
              angle = 0;
            } else if (v.y !== undefined && !isNaN(v.y)) {
              carY = v.y;
            } else if (v.x < -80) {
              carY = feederCarY;
            } else if (v.x < 50) {
              const t = Math.max(0, Math.min(1, (v.x - (-80)) / 130));
              const smoothT = t * t * (3 - 2 * t);
              carY = feederCarY + (targetCarY - feederCarY) * smoothT;
            }

            // Calculate subtle steering bank angle while fanning out into assigned lane
            if (v.state !== 'staged' && v.x >= -80 && v.x <= 50) {
              const t = (v.x - (-80)) / 130;
              const derivative = 6 * t * (1 - t);
              const dy = targetCarY - feederCarY;
              angle = Math.atan2((dy * derivative) / 130, 1) * (180 / Math.PI);
              angle = Math.max(-25, Math.min(25, angle));
            }

            const isHovered = hoveredVehicle?.id === v.id;
            const canSlice = v.points >= 3;

            return (
              <g
                key={v.id}
                transform={`translate(${carX}, ${carY}) rotate(${angle}, ${v.length / 2}, ${v.width / 2})`}
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
                  r="7.5"
                  fill="#0f172a"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <text
                  x={v.length / 2 - 2}
                  y={v.width / 2 + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8.5"
                  fontWeight="black"
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
        {/* Left Side: Sprint Planning & Staged Backlog Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Staged Parking Lot Counter & Sprint Planning */}
          {stagedVehicles.length > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-[#FFD200]/20 border border-[#FFD200]/40 text-[#FFD200] font-mono font-black text-xs">
              🅿️ LOT: {stagedVehicles.length} ({stagedPoints} pts)
            </span>
          )}

          {onOpenSprintPlanning && (
            <button
              onClick={onOpenSprintPlanning}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] border-2 border-[#1E222A] transition-all flex items-center gap-1.5 font-mono font-black text-xs cursor-pointer shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
              title="Open Parking Lot Staging to stage backlog items into the Parking Lot bays"
            >
              <ClipboardList className="w-4 h-4 text-[#1E222A]" />
              <span>🅿️ Parking Lot Staging</span>
            </button>
          )}

          {stagedVehicles.length > 0 && onDispatchFromParkingLot && (
            <button
              onClick={onDispatchFromParkingLot}
              className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white border-2 border-[#1E222A] rounded-xl transition-all flex items-center gap-1 font-mono font-black text-xs shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
              title="Release next staged vehicle from the parking lot onto the toll feeder road"
            >
              <span>⚡ Release Next</span>
            </button>
          )}

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

        {/* Quick Instructions */}
        <div className="flex items-center gap-4">
          <div className="text-slate-300 text-[11px] font-semibold hidden md:flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD200] border border-[#1E222A]" />
            <span>Click any vehicle to inspect or slice epics</span>
          </div>
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
          onClose={closeFlowInspection}
          onSliceStory={onSliceStory}
          onUpgradeEfficiency={onUpgradeEfficiency}
          onUpgradeAutomation={onUpgradeAutomation}
          onSetWipLimit={onSetLaneWipLimit}
        />
      )}
    </div>
  );
};
