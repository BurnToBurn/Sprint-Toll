import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  VehicleStory,
  TollBooth,
  FerryDock,
  FlowMetrics,
  SprintSummary,
  RetrospectiveLesson,
  DailyForecast,
  DailyFinancialSettlement,
  GameSettings,
  StoryPoint,
  LaneSpecialization,
  DayPhase,
  BacklogItem,
  ParkingLotCommitmentEvaluation
} from '../types/game';
import { ScenarioDefinition, ActiveScenarioState } from '../types/scenarios';
import { PREDETERMINED_SCENARIOS } from '../data/scenarios';
import { sound } from '../utils/audio';
import { STORY_TEMPLATES } from '../utils/agileLessons';
import { getBoothCooldownDuration, generateRandomBoothIncident } from '../data/incidents';
import { generateDailyBacklog, preSelectOptimalBatch } from '../data/backlog';
import { getShipForSeason, SHIP_NAMES_LIST, ShipInfo } from '../data/shipNames';

/**
 * Calculates daily operating dues and taxes incurred by higher efficiency booths,
 * automation infrastructure, squad training, and ferry upgrades.
 */
export function calculateDailyDues(booths: TollBooth[], ferry: FerryDock) {
  let efficiencyTax = 0;
  let automationDues = 0;
  let trainingDues = 0;
  let baseFacilityDues = 0;

  booths.forEach((b) => {
    if (!b.unlocked) return;
    // Base municipal operating fee per open lane
    baseFacilityDues += 15;

    // Tax on higher efficiency booths ($20 per efficiency tier above 1 + $10 per squad level above 1)
    if (b.efficiencyLevel > 1) {
      efficiencyTax += (b.efficiencyLevel - 1) * 20;
    }
    if (b.level > 1) {
      efficiencyTax += (b.level - 1) * 10;
    }

    // Automation maintenance dues ($25 per automation tier above 1)
    if (b.automationLevel > 1) {
      automationDues += (b.automationLevel - 1) * 25;
    }

    // Squad coaching & training dues ($15 per training level above 1)
    if (b.trainingLevel > 1) {
      trainingDues += (b.trainingLevel - 1) * 15;
    }
  });

  // Vessel upgrades maintenance taxes
  const ferryCapacityTax = (ferry.capacityLevel - 1) * 25;
  const ferrySpeedTax = (ferry.speedLevel - 1) * 20;
  const ferryAmenitiesTax = (ferry.amenitiesLevel - 1) * 20;
  const ferryUpgradesTax = ferryCapacityTax + ferrySpeedTax + ferryAmenitiesTax;

  const totalDailyDues = efficiencyTax + automationDues + trainingDues + ferryUpgradesTax + baseFacilityDues;

  return {
    efficiencyTax,
    automationDues,
    trainingDues,
    ferryUpgradesTax,
    baseFacilityDues,
    totalDailyDues
  };
}

const VEHICLE_CONFIGS: Record<StoryPoint, {
  color: string;
  accentColor: string;
  length: number;
  width: number;
  baseTime: number;
  speed: number;
  baseToll: number;
}> = {
  1: { color: '#EF4444', accentColor: '#B91C1C', length: 26, width: 16, baseTime: 1.2, speed: 2.8, baseToll: 12 },
  2: { color: '#3B82F6', accentColor: '#1D4ED8', length: 34, width: 19, baseTime: 2.0, speed: 2.5, baseToll: 22 },
  3: { color: '#10B981', accentColor: '#047857', length: 44, width: 22, baseTime: 3.2, speed: 2.2, baseToll: 35 },
  5: { color: '#F59E0B', accentColor: '#B45309', length: 58, width: 24, baseTime: 5.0, speed: 1.9, baseToll: 60 },
  8: { color: '#8B5CF6', accentColor: '#6D28D9', length: 74, width: 26, baseTime: 7.5, speed: 1.6, baseToll: 100 },
  13: { color: '#EC4899', accentColor: '#BE185D', length: 94, width: 28, baseTime: 11.0, speed: 1.3, baseToll: 175 },
  21: { color: '#E11D48', accentColor: '#9F1239', length: 118, width: 30, baseTime: 16.0, speed: 1.0, baseToll: 300 }
};

const INITIAL_BOOTHS: TollBooth[] = [
  {
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
  },
  {
    id: 1,
    name: 'Lane 2 · Beta Squad',
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
  },
  {
    id: 2,
    name: 'Lane 3 · Gamma Squad',
    unlocked: false,
    unlockCost: 250,
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
  },
  {
    id: 3,
    name: 'Lane 4 · Delta Squad',
    unlocked: false,
    unlockCost: 600,
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
  },
  {
    id: 4,
    name: 'Lane 5 · E-ZPass Expedite',
    unlocked: false,
    unlockCost: 1200,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    multiplier: 1.0,
    efficiencyLevel: 1,
    automationLevel: 2,
    trainingLevel: 1,
    wipLimit: 3,
    specialization: 'small_only',
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
  },
  {
    id: 5,
    name: 'Lane 6 · Heavy Haul Logistics',
    unlocked: false,
    unlockCost: 2500,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    multiplier: 1.0,
    efficiencyLevel: 1,
    automationLevel: 1,
    trainingLevel: 1,
    wipLimit: 5,
    specialization: 'heavy_only',
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
  }
];

const INITIAL_FERRY: FerryDock = {
  capacity: 40,
  currentPoints: 0,
  vehiclesOnBoard: [],
  state: 'boarding',
  sailProgress: 0,
  sprintNumber: 1,
  dayNumber: 1,
  seasonNumber: 1,
  shipName: 'S.S. Velocity',
  shipTag: 'VEL-20',
  dayPhase: 'planning',
  dayTimeFormatted: '09:00 AM (Planning)',
  sprintTimer: 45,
  sprintDuration: 45,
  autoDepartOnFull: true,
  autoDepartOnTimer: true,
  capacityLevel: 1,
  speedLevel: 1,
  amenitiesLevel: 1
};

export function useGameEngine() {
  const [seasonNumber, setSeasonNumber] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sprint_tolls_season');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 1) return parsed;
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const currentShip: ShipInfo = useMemo(() => getShipForSeason(seasonNumber), [seasonNumber]);

  const [funds, setFunds] = useState<number>(200);
  const [pendingDailyRevenue, setPendingDailyRevenue] = useState<number>(0);
  const [totalDeliveredPoints, setTotalDeliveredPoints] = useState<number>(0);
  const [booths, setBooths] = useState<TollBooth[]>(INITIAL_BOOTHS);
  const [ferry, setFerry] = useState<FerryDock>(() => ({
    ...INITIAL_FERRY,
    seasonNumber,
    shipName: currentShip.name,
    shipTag: currentShip.shortTag
  }));
  const [vehicles, setVehicles] = useState<VehicleStory[]>([]);
  const [sprintSummary, setSprintSummary] = useState<SprintSummary | null>(null);
  const [lastSprintSummary, setLastSprintSummary] = useState<SprintSummary | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStory | null>(null);
  const [selectedBoothId, setSelectedBoothId] = useState<number | null>(null);

  // Sprint Planning Backlog State
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>(() =>
    preSelectOptimalBatch(generateDailyBacklog(1), INITIAL_FERRY.capacity)
  );
  const [isSprintPlanningOpen, setIsSprintPlanningOpen] = useState<boolean>(false);
  const lastParkingReleaseTimeRef = useRef<number>(0);

  // Main Menu State: starts on the main menu
  const [isMainMenuOpen, setIsMainMenuOpen] = useState<boolean>(true);
  const [hasStartedGame, setHasStartedGame] = useState<boolean>(false);

  // Predetermined Tech Scenarios State
  const [activeScenario, setActiveScenario] = useState<ActiveScenarioState | null>(null);
  const [activeScenarioDef, setActiveScenarioDef] = useState<ScenarioDefinition | null>(null);
  const [isScenarioSelectOpen, setIsScenarioSelectOpen] = useState<boolean>(false);
  const [isScenarioOutcomeOpen, setIsScenarioOutcomeOpen] = useState<boolean>(false);
  
  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    gameSpeed: 1,
    autoAssignLanes: true,
    showMetricsOverlay: true,
    storyPointLabels: true,
    continuousFlowMode: true
  });

  // Flow metrics telemetry
  const [metrics, setMetrics] = useState<FlowMetrics>({
    currentWIP: 0,
    wipPoints: 0,
    throughputPerMinute: 0,
    throughputPointsPerMinute: 0,
    averageCycleTime: 0,
    averageLeadTime: 0,
    flowEfficiency: 65,
    littlesLawDiscrepancy: 0,
    bottleneckLaneIndex: 0,
    completedStoriesTotal: 0,
    completedPointsTotal: 0
  });

  // Refs for loop state to avoid closure staleness
  const lastCountdownSecondRef = useRef<number>(-1);

  // Parking lot sprint commitment tracking (points & story count committed during planning)
  const [committedParkingLotStats, setCommittedParkingLotStats] = useState<{ points: number; count: number }>(() => {
    const initialBatch = preSelectOptimalBatch(generateDailyBacklog(1), INITIAL_FERRY.capacity);
    const sel = initialBatch.filter((b) => b.selected);
    return {
      points: sel.reduce((sum, item) => sum + item.points, 0),
      count: sel.length
    };
  });

  const stateRef = useRef({
    funds,
    pendingDailyRevenue,
    booths,
    ferry,
    vehicles,
    settings,
    isMainMenuOpen: true,
    isSprintPlanningOpen: false,
    hasStartedGame: false,
    committedParkingLotStats: { points: 30, count: 6 },
    sprintSummary: null as SprintSummary | null,
    activeScenario: null as ActiveScenarioState | null,
    activeScenarioDef: null as ScenarioDefinition | null,
    lastSpawnTime: Date.now(),
    lastMetricsSampleTime: Date.now(),
    processedInLastMinute: [] as { timestamp: number; points: number; cycleTime: number }[],
    totalProcessedStats: { count: 0, points: 0, totalCycleSeconds: 0 }
  });

  // Keep ref synchronized
  useEffect(() => {
    stateRef.current.funds = funds;
    stateRef.current.pendingDailyRevenue = pendingDailyRevenue;
    stateRef.current.booths = booths;
    stateRef.current.ferry = ferry;
    stateRef.current.vehicles = vehicles;
    stateRef.current.settings = settings;
    stateRef.current.sprintSummary = sprintSummary;
    stateRef.current.activeScenario = activeScenario;
    stateRef.current.activeScenarioDef = activeScenarioDef;
    stateRef.current.isMainMenuOpen = isMainMenuOpen;
    stateRef.current.isSprintPlanningOpen = isSprintPlanningOpen;
    stateRef.current.hasStartedGame = hasStartedGame;
    stateRef.current.committedParkingLotStats = committedParkingLotStats;
  }, [funds, pendingDailyRevenue, booths, ferry, vehicles, settings, sprintSummary, activeScenario, activeScenarioDef, isMainMenuOpen, isSprintPlanningOpen, hasStartedGame, committedParkingLotStats]);

  // Synchronize season changes to localStorage and ferry state
  useEffect(() => {
    try {
      localStorage.setItem('sprint_tolls_season', String(seasonNumber));
    } catch {
      // ignore
    }
    setFerry((prev) => ({
      ...prev,
      seasonNumber,
      shipName: currentShip.name,
      shipTag: currentShip.shortTag
    }));
  }, [seasonNumber, currentShip]);

  const nextSeason = useCallback(() => {
    setSeasonNumber((prev) => prev + 1);
  }, []);

  const prevSeason = useCallback(() => {
    setSeasonNumber((prev) => Math.max(1, prev - 1));
  }, []);

  const changeSeason = useCallback((num: number) => {
    setSeasonNumber(Math.max(1, Math.floor(num)));
  }, []);

  // Helper to pick story point with weighted distribution
  const pickRandomStoryPoint = useCallback((): StoryPoint => {
    const r = Math.random() * 100;
    if (r < 26) return 1; // 26% Bug (1pt)
    if (r < 52) return 2; // 26% Task (2pt)
    if (r < 76) return 3; // 24% Story (3pt)
    if (r < 90) return 5; // 14% Feature (5pt)
    if (r < 96) return 8; // 6% Epic (8pt)
    if (r < 99) return 13; // 3% Initiative (13pt)
    return 21; // 1% Monolith (21pt)
  }, []);

  // Helper to instantiate vehicle
  const createVehicle = useCallback((points: StoryPoint, customTitle?: string): VehicleStory => {
    const config = VEHICLE_CONFIGS[points];
    const template = STORY_TEMPLATES[points];
    const randomTitle = customTitle || template.titles[Math.floor(Math.random() * template.titles.length)];

    return {
      id: 'v_' + Math.random().toString(36).substring(2, 9),
      points,
      title: randomTitle,
      type: template.type,
      color: config.color,
      accentColor: config.accentColor,
      length: config.length,
      width: config.width,
      baseProcessingTime: config.baseTime,
      speed: config.speed,
      tollValue: config.baseToll,
      createdAt: Date.now(),
      x: -200 - Math.random() * 40,
      y: 237.5 - config.width / 2, // Starts on single intake feeder lane (center Y = 237.5)
      targetX: 0,
      targetY: 0,
      laneIndex: -1,
      state: 'approaching',
      laneQueuePosition: -1
    };
  }, []);

  // Assign vehicle randomly into an available (unlocked) lane
  const assignVehicleToLane = useCallback((vehicle: VehicleStory, currentBooths: TollBooth[]) => {
    const unlockedBooths = currentBooths.filter((b) => b.unlocked);
    if (unlockedBooths.length === 0) return 0;

    // Filter booths compatible with vehicle points / specialization
    const eligibleBooths = unlockedBooths.filter((b) => {
      if (b.specialization === 'small_only') return vehicle.points <= 3;
      if (b.specialization === 'heavy_only') return vehicle.points >= 5;
      return true; // 'all'
    });

    const candidateBooths = eligibleBooths.length > 0 ? eligibleBooths : unlockedBooths;

    // Spread randomly among available lanes!
    const randomIndex = Math.floor(Math.random() * candidateBooths.length);
    return candidateBooths[randomIndex].id;
  }, []);

  // Spawn vehicle on highway (all vehicles enter through one single feeder lane and spread randomly into available lanes)
  const spawnVehicle = useCallback((customPoints?: StoryPoint, specificLane?: number) => {
    if (stateRef.current.sprintSummary) return;
    const scenarioDef = stateRef.current.activeScenarioDef;
    let points: StoryPoint;
    if (customPoints) {
      points = customPoints;
    } else if (scenarioDef && Math.random() < scenarioDef.epicSpawnChance) {
      const epics: StoryPoint[] = [8, 13, 21];
      points = epics[Math.floor(Math.random() * epics.length)];
    } else {
      points = pickRandomStoryPoint();
    }

    const newVehicle = createVehicle(points);
    const assignedLane = specificLane !== undefined ? specificLane : assignVehicleToLane(newVehicle, stateRef.current.booths);
    newVehicle.laneIndex = assignedLane;
    newVehicle.y = 237.5 - newVehicle.width / 2;

    // Safety: ensure new vehicle starts safely behind any vehicle currently queued or moving on the feeder road
    const feederCars = stateRef.current.vehicles.filter((v) => v.x < -30 && v.state !== 'departed' && v.state !== 'on_ferry');
    if (feederCars.length > 0) {
      const minX = Math.min(...feederCars.map((v) => v.x));
      newVehicle.x = Math.max(-240, Math.min(-140, minX - newVehicle.length - 20));
    } else {
      newVehicle.x = -150;
    }

    setVehicles((prev) => [...prev, newVehicle]);
  }, [createVehicle, pickRandomStoryPoint, assignVehicleToLane]);

  // Slicing a large user story into smaller agile user stories!
  const sliceStory = useCallback((vehicleId: string) => {
    if (stateRef.current.sprintSummary) return;
    setVehicles((prev) => {
      const target = prev.find((v) => v.id === vehicleId);
      if (!target || target.state === 'on_ferry' || target.state === 'departed') return prev;

      // Cannot slice 1 or 2 pt stories
      if (target.points <= 2) return prev;

      sound.playSliceSound();

      // Track scenario epic sliced progress
      if (stateRef.current.activeScenario && stateRef.current.activeScenario.status === 'active') {
        if (target.points >= 8) {
          stateRef.current.activeScenario.epicsSlicedCount += 1;
          setActiveScenario((prev) =>
            prev ? { ...prev, epicsSlicedCount: prev.epicsSlicedCount + 1 } : null
          );
        }
      }

      let splitPoints: StoryPoint[] = [];
      if (target.points === 3) {
        splitPoints = [1, 2];
      } else if (target.points === 5) {
        splitPoints = [2, 3];
      } else if (target.points === 8) {
        splitPoints = [3, 5];
      } else if (target.points === 13) {
        splitPoints = [5, 5, 3];
      } else if (target.points === 21) {
        splitPoints = [8, 8, 5];
      }

      let currentX = target.x;
      const newVehicles: VehicleStory[] = splitPoints.map((pts, idx) => {
        const v = createVehicle(pts, `Sliced part ${idx + 1} of: ${target.title}`);
        v.x = currentX;
        currentX -= (v.length + 18);
        v.laneIndex = target.laneIndex;
        v.state = target.state;
        return v;
      });

      // Close inspector modal if open for this vehicle
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle(null);
      }

      return prev.filter((v) => v.id !== vehicleId).concat(newVehicles);
    });
  }, [createVehicle, selectedVehicle]);

  // Toggle selection of backlog item for sprint commitment
  const toggleBacklogItem = useCallback((id: string) => {
    setBacklogItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  }, []);

  // Auto-select an optimal balanced batch fitting the ferry dock capacity
  const autoSelectOptimalBatch = useCallback(() => {
    setBacklogItems((prev) => preSelectOptimalBatch(prev, stateRef.current.ferry.capacity));
  }, []);

  const selectAllBacklog = useCallback(() => {
    setBacklogItems((prev) => prev.map((item) => ({ ...item, selected: true })));
  }, []);

  const clearAllBacklog = useCallback(() => {
    setBacklogItems((prev) => prev.map((item) => ({ ...item, selected: false })));
  }, []);

  // Slice a larger story in the backlog during sprint planning
  const sliceBacklogItem = useCallback((id: string) => {
    setBacklogItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const target = prev[idx];
      if (target.points <= 2) return prev;

      let splitPoints: StoryPoint[] = [];
      if (target.points === 3) splitPoints = [1, 2];
      else if (target.points === 5) splitPoints = [2, 3];
      else if (target.points === 8) splitPoints = [3, 5];
      else if (target.points === 13) splitPoints = [5, 5, 3];
      else if (target.points === 21) splitPoints = [8, 8, 5];

      const newItems: BacklogItem[] = splitPoints.map((pts, i) => ({
        id: `${target.id}-p${i + 1}`,
        title: `[Part ${i + 1}] ${target.title}`,
        points: pts,
        type: pts === 1 ? 'bug' : 'story',
        businessValue: Math.round(target.businessValue * (pts / target.points)),
        priority: target.priority,
        category: target.category,
        description: `Decomposed from ${target.id}`,
        selected: target.selected,
        isCarryover: target.isCarryover
      }));

      const copy = [...prev];
      copy.splice(idx, 1, ...newItems);
      return copy;
    });
  }, []);

  // Add a user-defined story directly to the backlog & sprint plan with point-specific templates
  const addBacklogStory = useCallback((points: StoryPoint = 5, customTitle?: string) => {
    sound.playClick();
    const titlePresets: Record<StoryPoint, string[]> = {
      1: [
        'Fix CSS button alignment on mobile viewport',
        'Update npm patch security vulnerabilities',
        'Correct currency formatting on checkout invoice',
        'Fix typo in user onboarding toast message',
        'Add aria-label to toll plaza navigation buttons'
      ],
      2: [
        'Add CSV export button to toll metrics table',
        'Implement tooltip for disabled ferry depart button',
        'Log failed auth attempts to CloudWatch metrics',
        'Sanitize input on vehicle license plate query',
        'Add keyboard shortcut for lane WIP adjustment'
      ],
      3: [
        'Implement dark mode preference persistence in localStorage',
        'Add pagination controls to audit event stream',
        'Send webhook notification on ferry departure',
        'Optimize booth rendering with WebGL batching',
        'Add vehicle speed telemetry gauge to HUD'
      ],
      5: [
        'OAuth 2.0 PKCE Session Refresh & Token Revocation',
        'Redis Distributed Lock & Cache Invalidation Pipeline',
        'Stripe Webhook Dead-Letter Queue & Idempotency Filter',
        'PostgreSQL Connection Pool Auto-Scaler with PgBouncer',
        'Real-Time WebSocket Reconnect Backoff & Heartbeat',
        'Elasticsearch Multi-Cluster Shard Rebalancing',
        'Kubernetes Ingress Rate Limiter & Envoy Proxy Filter'
      ],
      8: [
        'Multi-Tenant Role-Based Access Control Matrix Engine',
        'Automated Database Failover & Replication Telemetry',
        'Full-Text Search Engine Migration to Meilisearch',
        'Distributed Saga Orchestration for Cross-Dock Billing',
        'Zero-Downtime Blue/Green Microservices Deployment Pipeline'
      ],
      13: [
        'End-to-End Payment Gateway Migration with Zero Downtime',
        'Microservices Event-Driven Bus Architecture Overhaul',
        'GDPR Automated Data Export & Subject Erasure Pipeline',
        'High-Throughput Kafka Streaming Partition Rebalancer'
      ],
      21: [
        'Legacy Monolith Core Database Decommission & Cloud Migration',
        'Core Banking Distributed Consensus & Transaction Ledger'
      ]
    };

    const titles = titlePresets[points] || titlePresets[5];
    const title = customTitle || titles[Math.floor(Math.random() * titles.length)];

    const descriptions: Record<StoryPoint, string> = {
      1: 'Quick hotfix / patch for immediate toll verification.',
      2: 'Small isolated enhancement to speed up throughput.',
      3: 'Standard user story delivering verified incremental value.',
      5: 'Core feature story ready for development and toll verification.',
      8: 'Major multi-system epic component requiring coordinated flow.',
      13: 'Large high-impact epic requiring significant toll concurrency.',
      21: 'Monolithic legacy initiative requiring massive dock capacity.'
    };

    const newItem: BacklogItem = {
      id: `BL-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 10)}`,
      title,
      points,
      type: points === 1 ? 'bug' : points >= 13 ? 'epic' : 'story',
      businessValue: Math.round(points * 12 * (1 + Math.random() * 0.2)),
      priority: points >= 8 ? 'critical' : points >= 5 ? 'high' : 'medium',
      category: 'Core API',
      description: descriptions[points] || 'Sprint story staged for toll flow.',
      selected: true,
      isCarryover: false
    };
    setBacklogItems((prev) => [newItem, ...prev]);
  }, []);

  // Remove an individual story from the backlog by ID
  const removeBacklogItem = useCallback((id: string) => {
    sound.playClick();
    setBacklogItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Remove stories by point value (e.g., remove one or all stories matching the given points)
  const removeStoriesByPoints = useCallback((points: StoryPoint, removeAll: boolean = false) => {
    sound.playClick();
    setBacklogItems((prev) => {
      if (removeAll) {
        return prev.filter((item) => item.points !== points);
      }
      // Remove the latest item matching this point value
      const targetIdx = prev.findIndex((item) => item.points === points);
      if (targetIdx === -1) return prev;
      const copy = [...prev];
      copy.splice(targetIdx, 1);
      return copy;
    });
  }, []);

  // Remove all currently selected backlog stories
  const removeSelectedBacklogItems = useCallback(() => {
    sound.playClick();
    setBacklogItems((prev) => prev.filter((item) => !item.selected));
  }, []);

  // Stage a story (like a 5-point story) directly in the parking lot to immediately flow into the toll plaza
  const stageStoryInParkingLot = useCallback((points: StoryPoint = 5, customTitle?: string) => {
    if (stateRef.current.sprintSummary) return;
    sound.playClick();
    const titles5 = [
      'OAuth 2.0 PKCE Session Refresh & Token Revocation',
      'Redis Distributed Lock & Cache Invalidation Pipeline',
      'Stripe Webhook Dead-Letter Queue & Idempotency Filter',
      'PostgreSQL Connection Pool Auto-Scaler with PgBouncer',
      'Real-Time WebSocket Reconnect Backoff & Heartbeat',
      'Elasticsearch Multi-Cluster Shard Rebalancing',
      'Kubernetes Ingress Rate Limiter & Envoy Proxy Filter'
    ];
    const title = customTitle || (points === 5 ? titles5[Math.floor(Math.random() * titles5.length)] : `User ${points}-Point Story`);

    setVehicles((prev) => {
      const stagedCars = prev.filter((v) => v.state === 'staged');
      if (stagedCars.length >= 12) {
        // Staging bays full - spawn directly on the feeder highway to flow into tolls
        spawnVehicle(points);
        return prev;
      }
      const usedSlots = new Set(stagedCars.map((v) => v.parkingSlotIndex ?? 0));
      let nextSlot = 0;
      for (let i = 0; i < 12; i++) {
        if (!usedSlots.has(i)) {
          nextSlot = i;
          break;
        }
      }
      const v = createVehicle(points, title);
      v.state = 'staged';
      v.parkingSlotIndex = nextSlot;
      // Alternate across North (top) and South (bottom) bays
      const isNorth = nextSlot % 2 === 0;
      const bayIndex = Math.floor(nextSlot / 2);
      const col = bayIndex % 3;
      const row = Math.floor(bayIndex / 3);
      v.x = -402 + col * 58;
      v.y = isNorth ? 54 + row * 46 : 292 + row * 46;
      v.laneIndex = -1;
      return [...prev, v];
    });
  }, [createVehicle, spawnVehicle]);

  // Commit sprint planning: convert pre-selected items into staged vehicles in North & South Parking Lots
  const commitSprintPlanning = useCallback(() => {
    if (stateRef.current.sprintSummary) return;
    const selected = backlogItems.filter((i) => i.selected);
    if (selected.length === 0) return;

    sound.playSprintCommit();

    // Track what was committed in the parking lot for this sprint
    const committedPts = selected.reduce((sum, item) => sum + item.points, 0);
    const committedCount = selected.length;
    setCommittedParkingLotStats({ points: committedPts, count: committedCount });
    stateRef.current.committedParkingLotStats = { points: committedPts, count: committedCount };

    // Map selected backlog items into staged vehicles across North and South bays flanking the street
    let slotIndex = 0;
    const stagedVehicles: VehicleStory[] = selected.map((item) => {
      const v = createVehicle(item.points, item.title);
      v.id = item.id;
      v.tollValue = item.businessValue;
      v.type = item.type;
      v.state = 'staged';
      v.parkingSlotIndex = slotIndex++;
      const isNorth = v.parkingSlotIndex % 2 === 0;
      const bayIndex = Math.floor(v.parkingSlotIndex / 2);
      const col = bayIndex % 3;
      const row = Math.floor(bayIndex / 3);
      v.x = -402 + col * 58;
      v.y = isNorth ? 54 + row * 46 : 292 + row * 46;
      v.laneIndex = -1;
      return v;
    });

    // Add staged vehicles to simulation
    setVehicles((prev) => {
      const nonStaged = prev.filter((v) => v.state !== 'staged');
      return [...nonStaged, ...stagedVehicles];
    });

    // Set day phase to morning to start traffic flow
    setFerry((prev) => ({
      ...prev,
      dayPhase: 'morning',
      dayTimeFormatted: '09:00 AM'
    }));

    // Reset release timer so first staged story rolls out immediately onto the highway!
    lastParkingReleaseTimeRef.current = 0;

    setIsSprintPlanningOpen(false);
  }, [backlogItems, createVehicle]);

  // Manually dispatch the next staged vehicle from the parking lot onto the highway feeder road
  const dispatchNextFromParkingLot = useCallback(() => {
    if (stateRef.current.sprintSummary) return;
    setVehicles((prev) => {
      const stagedVehicles = prev.filter((v) => v.state === 'staged');
      if (stagedVehicles.length === 0) return prev;

      stagedVehicles.sort((a, b) => (a.parkingSlotIndex ?? 0) - (b.parkingSlotIndex ?? 0));
      const target = stagedVehicles[0];
      const lane = assignVehicleToLane(target, stateRef.current.booths);

      sound.playClick();
      return prev.map((v) => {
        if (v.id === target.id) {
          return {
            ...v,
            state: 'approaching',
            laneIndex: lane,
            x: -150,
            y: 237.5 - v.width / 2
          };
        }
        return v;
      });
    });
  }, [assignVehicleToLane]);

  // Resolve a random incident / blocked lane event (flat tire, breakdown, etc.)
  const resolveBoothIncident = useCallback((boothId: number, useEmergencyFix: boolean = true) => {
    if (stateRef.current.sprintSummary) return;
    setBooths((prev) =>
      prev.map((b) => {
        if (b.id !== boothId || !b.incident) return b;
        if (useEmergencyFix) {
          const cost = b.incident.quickFixCost;
          if (stateRef.current.funds < cost) {
            sound.playHonk();
            return b;
          }
          setFunds((f) => Math.max(0, f - cost));
        }
        sound.playRepair();
        return {
          ...b,
          incident: null,
          timeSinceLastIncident: 0
        };
      })
    );
  }, []);

  const openSprintPlanning = useCallback(() => {
    sound.playClick();
    setIsSprintPlanningOpen(true);
  }, []);

  const closeSprintPlanning = useCallback(() => {
    sound.playClick();
    setIsSprintPlanningOpen(false);
  }, []);

  // Trigger victory or defeat for predetermined scenario
  const triggerScenarioOutcome = useCallback(
    (
      isWin: boolean,
      title: string,
      reason: string,
      rating: 'S' | 'A' | 'B' | 'C' | 'F' = isWin ? 'A' : 'F'
    ) => {
      const activeScen = stateRef.current.activeScenario;
      const def = stateRef.current.activeScenarioDef;
      if (!activeScen || !def) return;
      if (activeScen.status !== 'active') return;

      if (isWin) {
        sound.playLevelUp();
      } else {
        sound.playHonk();
      }

      const updatedState: ActiveScenarioState = {
        ...activeScen,
        status: isWin ? 'victory' : 'defeat',
        outcome: {
          isWin,
          title,
          reason,
          rating,
          agileTakeaway: def.agileConceptTaught,
          pointsEarned: activeScen.pointsDelivered,
          completionTimeFormatted: `Day ${stateRef.current.ferry.dayNumber} · ${stateRef.current.ferry.dayTimeFormatted}`
        }
      };
      setActiveScenario(updatedState);
      stateRef.current.activeScenario = updatedState;
      setIsScenarioOutcomeOpen(true);
    },
    []
  );

  // Deploy / Sail the Ferry
  const launchFerry = useCallback((reason: 'full' | 'timer' | 'manual' = 'manual') => {
    if (stateRef.current.sprintSummary) return;
    const currentFerry = stateRef.current.ferry;
    if (currentFerry.state !== 'boarding' && currentFerry.state !== 'ready') return;
    
    // If no vehicles on board when timer expires, roll over to the next day
    if (currentFerry.vehiclesOnBoard.length === 0) {
      setFerry((prev) => ({
        ...prev,
        dayNumber: prev.dayNumber + 1,
        sprintNumber: prev.sprintNumber + 1,
        dayPhase: 'morning',
        dayTimeFormatted: '09:00 AM',
        sprintTimer: prev.sprintDuration
      }));
      return;
    }

    sound.playFerryHorn();

    const deliveredVehicles = [...currentFerry.vehiclesOnBoard];
    const deliveredPoints = currentFerry.currentPoints;

    // Calculate delivery bonus
    const amenityBonusMultiplier = 1 + (currentFerry.amenitiesLevel - 1) * 0.35;
    const sprintBonusRevenue = Math.round(deliveredPoints * 25 * amenityBonusMultiplier);

    // Calculate stories left behind on the highway/queues
    const leftBehind = stateRef.current.vehicles.filter(
      (v) => !deliveredVehicles.some((dv) => dv.id === v.id)
    );
    const leftBehindCount = leftBehind.length;
    const leftBehindPoints = leftBehind.reduce((sum, v) => sum + v.points, 0);

    // Calculate average cycle time for this batch
    let totalCycle = 0;
    const pointsByType: Record<string, number> = {};

    deliveredVehicles.forEach((v) => {
      const cycle = v.completedAt && v.arrivedAtBoothAt ? (v.completedAt - v.arrivedAtBoothAt) / 1000 : 10;
      totalCycle += cycle;
      pointsByType[v.type] = (pointsByType[v.type] || 0) + v.points;
    });

    const avgCycle = deliveredVehicles.length > 0 ? totalCycle / deliveredVehicles.length : 0;
    const flowEff = Math.min(95, Math.max(25, Math.round(85 - avgCycle * 1.2)));

    // Identify bottleneck lane
    let maxLaneQueue = 0;
    let bottleneckBooth = stateRef.current.booths.find((b) => b.unlocked) || stateRef.current.booths[0];
    stateRef.current.booths.forEach((b) => {
      if (!b.unlocked) return;
      const q = stateRef.current.vehicles.filter(
        (v) => v.laneIndex === b.id && (v.state === 'queued' || v.state === 'approaching' || v.state === 'processing')
      ).length;
      if (q > maxLaneQueue) {
        maxLaneQueue = q;
        bottleneckBooth = b;
      }
    });

    // Agile Coach Retrospective evaluation for the daily sprint
    let rating: SprintSummary['rating'] = 'balanced';
    let advice = '';

    if (reason === 'full') {
      rating = 'exceptional';
      advice = `MV Velocity reached 100% capacity (${deliveredPoints}/${currentFerry.capacity} pts) and departed immediately! Continual flow achieved maximum batch delivery!`;
    } else if (leftBehindCount === 0 && deliveredPoints > 0) {
      rating = 'exceptional';
      advice = `Flawless Day #${currentFerry.dayNumber} delivery! All user story vehicles reached the ferry before the 05:00 PM release train with zero tickets left behind.`;
    } else if (leftBehindCount <= 2 && deliveredPoints >= 20) {
      rating = 'great';
      advice = `Strong Day #${currentFerry.dayNumber} delivery! Delivered ${deliveredPoints} pts. Only ${leftBehindCount} tickets missed departure and will roll over to tomorrow morning.`;
    } else if (leftBehindCount >= 4) {
      rating = 'bottlenecked';
      advice = `Departure deadline reached with ${leftBehindCount} stories (${leftBehindPoints} pts) stranded in toll queues! Oversized vehicles caused queue blockages. Slice big tickets early!`;
    } else {
      rating = 'balanced';
      advice = `Day #${currentFerry.dayNumber} completed with ${deliveredPoints} pts delivered and ${leftBehindCount} stories queued for tomorrow.`;
    }

    let grade: SprintSummary['grade'] = 'B';
    if (rating === 'exceptional') grade = 'A+';
    else if (rating === 'great') grade = 'A';
    else if (rating === 'balanced') grade = 'B';
    else if (rating === 'bottlenecked') grade = 'C';
    else grade = 'D';

    const largestStoryProcessed = deliveredVehicles.reduce((max, v) => Math.max(max, v.points), 0);

    // Performance Highlights
    const keyHighlights: string[] = [];
    if (reason === 'full') {
      keyHighlights.push(`🚀 100% Vessel Capacity Achieved: Delivered full ${deliveredPoints} pts cargo early`);
    } else {
      keyHighlights.push(`📦 Shipped ${deliveredPoints} Story Points across ${deliveredVehicles.length} completed work tickets`);
    }
    keyHighlights.push(`⚡ Flow Efficiency: ${flowEff}% active station processing vs queue wait time`);
    if (leftBehindCount === 0) {
      keyHighlights.push(`✨ Zero Stranded Carryover: 100% of pipeline work cleared before release`);
    } else {
      keyHighlights.push(`⏳ ${leftBehindCount} tickets (${leftBehindPoints} pts) carried over to Day #${currentFerry.dayNumber + 1}`);
    }

    // Parking Lot Commitment vs Delivery Evaluation
    const committedStats = stateRef.current.committedParkingLotStats || { points: 30, count: 6 };
    const committedPoints = Math.max(1, committedStats.points);
    const committedStoriesCount = committedStats.count;

    const overDeliveredPoints = Math.max(0, deliveredPoints - committedPoints);
    const underDeliveredPoints = Math.max(0, committedPoints - deliveredPoints);
    const completionRate = Math.round((deliveredPoints / committedPoints) * 100);

    // Over-delivery cash bonus: $35 per story point delivered over parking lot commitment
    const bonusPerOverPoint = 35;
    const overDeliveryBonus = overDeliveredPoints * bonusPerOverPoint;

    // Capacity adjustment for next sprint:
    // Scale capacity boost based on how many points were delivered over commitment
    let capacityAdjustment = 0;
    if (overDeliveredPoints >= 10) {
      capacityAdjustment = 12;
    } else if (overDeliveredPoints >= 6) {
      capacityAdjustment = 8;
    } else if (overDeliveredPoints >= 3) {
      capacityAdjustment = 5;
    } else if (overDeliveredPoints >= 1) {
      capacityAdjustment = 2;
    }

    const currentCapacity = currentFerry.capacity;
    const nextSprintCapacity = Math.min(100, currentCapacity + capacityAdjustment);

    let evaluationStatus: ParkingLotCommitmentEvaluation['evaluationStatus'] = 'exact_match';
    let evaluationNotes = '';

    if (overDeliveredPoints > 0) {
      evaluationStatus = 'over_delivered';
      evaluationNotes = `Supercharged Velocity! Delivered ${deliveredPoints} pts vs ${committedPoints} pts committed in the parking lot (+${overDeliveredPoints} pts over commitment, ${completionRate}% execution). Earned +$${overDeliveryBonus.toLocaleString()} over-delivery bonus, and calibrated next sprint capacity by +${capacityAdjustment} pts (from ${currentCapacity} → ${nextSprintCapacity} pts)!`;
    } else if (underDeliveredPoints > 0) {
      evaluationStatus = 'under_delivered';
      evaluationNotes = `Delivered ${deliveredPoints} of ${committedPoints} committed pts (${completionRate}% execution). ${underDeliveredPoints} points remained in the highway queue or parking bays. Next sprint capacity maintained at ${currentCapacity} pts to protect Little's Law lead time.`;
    } else {
      evaluationStatus = 'exact_match';
      evaluationNotes = `Precision Batch Delivery! Delivered exactly 100% of committed parking lot stories (${deliveredPoints}/${committedPoints} pts) with perfect predictability and flow consistency!`;
    }

    const commitmentEvaluation: ParkingLotCommitmentEvaluation = {
      committedPoints,
      committedStoriesCount,
      deliveredPoints,
      deliveredStoriesCount: deliveredVehicles.length,
      overDeliveredPoints,
      underDeliveredPoints,
      completionRate,
      evaluationStatus,
      bonusAwarded: overDeliveryBonus,
      capacityAdjustment,
      nextSprintCapacity,
      evaluationNotes
    };

    if (overDeliveredPoints > 0) {
      keyHighlights.push(`🎯 Parking Lot Evaluation: Shipped +${overDeliveredPoints} pts over commitment (${completionRate}% execution) -> Earned +$${overDeliveryBonus.toLocaleString()} bonus & +${capacityAdjustment} pts next sprint capacity!`);
    } else if (deliveredPoints === committedPoints) {
      keyHighlights.push(`🎯 Parking Lot Evaluation: Exact 100% commitment match (${deliveredPoints}/${committedPoints} pts delivered) -> Flawless sprint estimation accuracy!`);
    } else {
      keyHighlights.push(`🎯 Parking Lot Evaluation: Delivered ${deliveredPoints} of ${committedPoints} committed pts (${completionRate}% execution) with ${underDeliveredPoints} pts carryover`);
    }

    // Daily Fiscal Settlement: Player only receives funding at the end of each day
    // Daily dues include paying tax on higher efficiency booths and upgrades
    const grossTollRevenue = stateRef.current.pendingDailyRevenue;
    const ferryDeliveryBonus = sprintBonusRevenue;
    const totalGrossRevenue = grossTollRevenue + ferryDeliveryBonus + overDeliveryBonus;

    const dues = calculateDailyDues(stateRef.current.booths, currentFerry);
    const netFundingAwarded = Math.max(0, totalGrossRevenue - dues.totalDailyDues);

    const financialSettlement: DailyFinancialSettlement = {
      grossTollRevenue,
      ferryDeliveryBonus,
      overDeliveryBonus,
      totalGrossRevenue,
      efficiencyTax: dues.efficiencyTax,
      automationDues: dues.automationDues,
      trainingDues: dues.trainingDues,
      ferryUpgradesTax: dues.ferryUpgradesTax,
      baseFacilityDues: dues.baseFacilityDues,
      totalDailyDues: dues.totalDailyDues,
      netFundingAwarded
    };

    keyHighlights.push(`💰 End-of-Day Settlement: Net +$${netFundingAwarded.toLocaleString()} credited to bank (Gross: $${totalGrossRevenue.toLocaleString()} - Dues & Taxes: $${dues.totalDailyDues.toLocaleString()})`);

    // Lessons Learned from Simulation Metrics
    const lessonsLearned: RetrospectiveLesson[] = [
      {
        id: 'lesson-littles-law',
        category: 'littles_law',
        title: "Little's Law & Queue Latency",
        observation:
          leftBehindCount > 2
            ? `High Work-in-Progress caused cycle times to stretch to ${Math.round(avgCycle * 10) / 10}s.`
            : `Controlled WIP maintained crisp cycle times averaging ${Math.round(avgCycle * 10) / 10}s.`,
        metricEvidence: `Actual Lead Time: ${Math.round(avgCycle * 10) / 10}s · Active WIP: ${leftBehindCount + deliveredVehicles.length} items.`,
        agileConcept: "Little's Law dictates that Cycle Time = WIP ÷ Throughput. Inflating WIP without boosting capacity directly multiplies latency.",
        recommendation:
          leftBehindCount > 2
            ? "Tighten lane WIP limits and upgrade booth automation to prevent queue bloat."
            : "Continue capping WIP to protect throughput velocity and prevent context switching."
      },
      {
        id: 'lesson-batch-sizing',
        category: 'batch_size',
        title: "Batch Sizing & Story Decomposition",
        observation:
          largestStoryProcessed >= 8
            ? `Monolithic ${largestStoryProcessed}pt epics monopolized toll booths, causing follower vehicles to stall.`
            : `Stories were lean and granular (max ${largestStoryProcessed || 3} pts), yielding rapid barrier turnover.`,
        metricEvidence: `Largest ticket processed: ${largestStoryProcessed} pts · Average batch latency: ${Math.round(avgCycle * 10) / 10}s.`,
        agileConcept: "Large work items cause variability, increase queue lengths, and delay urgent high-value bug fixes.",
        recommendation: "Use the slicing tool (scissors) to divide 8pt and 21pt epics into nimble 2-3pt stories before toll arrival."
      },
      {
        id: 'lesson-constraints',
        category: 'bottlenecks',
        title: "Theory of Constraints (Bottlenecks)",
        observation: `${bottleneckBooth.name} experienced the heaviest queue load (${maxLaneQueue} vehicles).`,
        metricEvidence: `Peak lane queue: ${maxLaneQueue} items · Station level: Lvl ${bottleneckBooth.level}.`,
        agileConcept: "Goldratt's Theory of Constraints: The throughput of any pipeline is strictly governed by its slowest constraint.",
        recommendation: `Invest in Efficiency & E-ZPass Automation for ${bottleneckBooth.name.split('·')[0]} to eliminate flow restrictions.`
      },
      {
        id: 'lesson-flow',
        category: 'continuous_flow',
        title: "Single-Piece Intake & Fan-Out Balancing",
        observation: `All vehicles entered via the single intake trunk lane and dispersed across open stations.`,
        metricEvidence: `${deliveredVehicles.length} stories processed across ${stateRef.current.booths.filter((b) => b.unlocked).length} active lanes.`,
        agileConcept: "A single pull intake with dynamic distribution prevents worker starvation and balances cognitive load.",
        recommendation: "Unlock additional toll lanes to increase parallel flow concurrency as demand grows."
      }
    ];

    const summary: SprintSummary = {
      sprintNumber: currentFerry.sprintNumber,
      dayNumber: currentFerry.dayNumber,
      deliveredPoints,
      deliveredVehiclesCount: deliveredVehicles.length,
      leftBehindCount,
      leftBehindPoints,
      averageCycleTime: Math.round(avgCycle * 10) / 10,
      flowEfficiency: flowEff,
      pointsByType,
      totalBonus: netFundingAwarded,
      coachAdvice: advice,
      rating,
      grade,
      departureReason: reason,
      financialSettlement,
      commitmentEvaluation,
      bottleneckLaneName: bottleneckBooth.name,
      bottleneckQueueCount: maxLaneQueue,
      largestStoryProcessed,
      keyHighlights,
      lessonsLearned
    };

    // Player ONLY gains funding at the end of each day!
    setFunds((f) => f + netFundingAwarded);
    stateRef.current.pendingDailyRevenue = 0;
    setPendingDailyRevenue(0);

    setTotalDeliveredPoints((p) => p + deliveredPoints);
    stateRef.current.sprintSummary = summary;
    setSprintSummary(summary);
    setLastSprintSummary(summary);

    // Update ferry state to departing and calibrate capacity for upcoming sprint
    setFerry((prev) => ({
      ...prev,
      capacity: nextSprintCapacity,
      state: 'departing',
      sailProgress: 0
    }));

    // Mark vehicles as departed
    setVehicles((prev) =>
      prev.filter((v) => !deliveredVehicles.some((dv) => dv.id === v.id))
    );

    // Evaluate Predetermined Tech Scenario Progress and Win/Lose Situations
    const currentActiveScenario = stateRef.current.activeScenario;
    const currentScenarioDef = stateRef.current.activeScenarioDef;

    if (currentActiveScenario && currentActiveScenario.status === 'active' && currentScenarioDef) {
      const newDelivered = currentActiveScenario.pointsDelivered + deliveredPoints;
      const isZeroStranded = leftBehindCount === 0;
      const newZeroStrandedDays = isZeroStranded
        ? currentActiveScenario.consecutiveZeroStrandedDays + 1
        : 0;

      const updatedScenario: ActiveScenarioState = {
        ...currentActiveScenario,
        pointsDelivered: newDelivered,
        consecutiveZeroStrandedDays: newZeroStrandedDays,
        currentDay: currentFerry.dayNumber,
        daysRemaining: Math.max(0, currentScenarioDef.durationDays - currentFerry.dayNumber)
      };

      stateRef.current.activeScenario = updatedScenario;
      setActiveScenario(updatedScenario);

      // Check economic scenario bankruptcy (funds depleted below $0)
      if (currentScenarioDef.category === 'economic') {
        const remainingTreasury = stateRef.current.funds + netFundingAwarded;
        if (remainingTreasury <= 0) {
          triggerScenarioOutcome(
            false,
            'Cash Runway Exhausted (Bankruptcy)',
            'Daily municipal operating dues and efficiency taxes completely drained your bank reserves below $0. The startup ran out of runway!',
            'F'
          );
          return;
        }
      }

      // Check WIP crisis condition: left behind > 5 tickets
      if (currentScenarioDef.id === 'wip_limits_crisis' && leftBehindCount > 5) {
        triggerScenarioOutcome(
          false,
          'WIP Congestion Outage',
          `Release departed leaving ${leftBehindCount} unfinished stories stranded in toll queues! Multitasking gridlock breached tolerance limit (max 5 allowed).`,
          'F'
        );
        return;
      }

      // Check if scenario reaches target duration days
      if (currentFerry.dayNumber >= currentScenarioDef.durationDays) {
        let allObjectivesMet = true;
        let failureDetail = '';

        for (const obj of currentScenarioDef.objectives) {
          if (obj.type === 'points_shipped' && newDelivered < obj.target) {
            allObjectivesMet = false;
            failureDetail = `Shipped ${newDelivered} story points out of the required ${obj.target} points.`;
            break;
          }
          if (obj.type === 'epics_sliced' && updatedScenario.epicsSlicedCount < obj.target) {
            allObjectivesMet = false;
            failureDetail = `Sliced ${updatedScenario.epicsSlicedCount} monolithic epics out of ${obj.target} required.`;
            break;
          }
          if (obj.type === 'flow_efficiency' && flowEff < obj.target) {
            allObjectivesMet = false;
            failureDetail = `Pipeline flow efficiency reached ${flowEff}%, failing the ${obj.target}% target.`;
            break;
          }
          if (obj.type === 'unlocked_lanes') {
            const unlockedCount = stateRef.current.booths.filter((b) => b.unlocked).length;
            if (unlockedCount < obj.target) {
              allObjectivesMet = false;
              failureDetail = `Only ${unlockedCount} toll lanes unlocked out of ${obj.target} required.`;
              break;
            }
          }
          if (obj.type === 'ezpass_tier') {
            const ezpassT2Count = stateRef.current.booths.filter((b) => b.unlocked && b.automationLevel >= 2).length;
            if (ezpassT2Count < obj.target) {
              allObjectivesMet = false;
              failureDetail = `Only ${ezpassT2Count} booths upgraded to E-ZPass Tier 2+ out of ${obj.target} required.`;
              break;
            }
          }
          if (obj.type === 'avg_cycle_time' && avgCycle > obj.target) {
            allObjectivesMet = false;
            failureDetail = `Average cycle latency was ${Math.round(avgCycle * 10) / 10}s, slower than the ${obj.target}s limit.`;
            break;
          }
          if (obj.type === 'zero_stranded_days' && newZeroStrandedDays < obj.target) {
            allObjectivesMet = false;
            failureDetail = `Achieved ${newZeroStrandedDays} consecutive zero-stranded departure days out of ${obj.target} required.`;
            break;
          }
          if (obj.type === 'funds_target') {
            const finalFunds = stateRef.current.funds + netFundingAwarded;
            if (finalFunds < obj.target) {
              allObjectivesMet = false;
              failureDetail = `Bank treasury reached $${finalFunds}, failing the $${obj.target} fundraising target.`;
              break;
            }
          }
        }

        if (allObjectivesMet) {
          triggerScenarioOutcome(
            true,
            'Victory! Mission Accomplished',
            `Outstanding execution! Delivered ${newDelivered} story points across ${currentScenarioDef.durationDays} days while maintaining technical discipline and satisfying all constraints.`,
            'S'
          );
        } else {
          triggerScenarioOutcome(
            false,
            'Scenario Deadline Reached (Objective Incomplete)',
            failureDetail || 'One or more technical objectives were not met before the scenario deadline.',
            'C'
          );
        }
      }
    }
  }, [triggerScenarioOutcome]);

  // Main simulation tick loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTick = performance.now();

    const tick = (now: number) => {
      const deltaSec = Math.min((now - lastTick) / 1000, 0.1) * stateRef.current.settings.gameSpeed;
      lastTick = now;

      // When sprint retro, main menu, or parking lot staging is present on the screen, pause simulation actions and motion
      if (
        stateRef.current.settings.gameSpeed > 0 &&
        !stateRef.current.sprintSummary &&
        !stateRef.current.isMainMenuOpen &&
        !stateRef.current.isSprintPlanningOpen
      ) {
        updateSimulation(deltaSec);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Simulation physics & logic step
  const updateSimulation = (dt: number) => {
    const { booths: currBooths, ferry: currFerry, vehicles: currVehicles, settings: currSettings } = stateRef.current;
    const now = Date.now();

    // 1. Automatic Vehicle Spawner & Continual Flow of Traffic
    const isContinualFlow = currSettings.continuousFlowMode;
    const scenarioSpawnMult = stateRef.current.activeScenarioDef?.spawnRateMultiplier || 1.0;
    const baseSpawnInterval = isContinualFlow ? 1100 : 3200;
    const spawnInterval = Math.round(baseSpawnInterval / scenarioSpawnMult); // ms between spawns
    const maxAllowedVehicles = isContinualFlow ? 44 : 28;

    // 1b. Staged Parking Lot Vehicles: automatically roll out sprint stories from North & South bays to the tolls
    const stagedVehicles = currVehicles.filter((v) => v.state === 'staged');

    // Only spawn automatic random background traffic when NO staged sprint stories remain!
    if (stagedVehicles.length === 0 && currFerry.dayPhase !== 'planning' && now - stateRef.current.lastSpawnTime > spawnInterval) {
      stateRef.current.lastSpawnTime = now;
      if (currVehicles.length < maxAllowedVehicles) {
        spawnVehicle();
      }
    }

    if (stagedVehicles.length > 0 && currFerry.dayPhase !== 'planning') {
      const timeSinceLastParkingRelease = now - lastParkingReleaseTimeRef.current;
      // Fast, smooth rollout so stories from sprint planning immediately flow over to the tolls!
      const releaseInterval = isContinualFlow ? 550 : 850;
      const entryBlocked = currVehicles.some(
        (v) => v.x > -165 && v.x < -100 && v.state !== 'staged' && v.state !== 'departed' && v.state !== 'on_ferry'
      );

      if (timeSinceLastParkingRelease > releaseInterval && !entryBlocked) {
        lastParkingReleaseTimeRef.current = now;
        stagedVehicles.sort((a, b) => (a.parkingSlotIndex ?? 0) - (b.parkingSlotIndex ?? 0));
        const nextVehicle = stagedVehicles[0];

        const assignedLane = assignVehicleToLane(nextVehicle, currBooths);
        sound.playClick();
        setVehicles((prev) =>
          prev.map((v) => {
            if (v.id === nextVehicle.id) {
              return {
                ...v,
                state: 'approaching',
                laneIndex: assignedLane,
                x: -150,
                y: 237.5 - v.width / 2
              };
            }
            return v;
          })
        );
      }
    }

    // Predetermined Scenario Real-Time Tracking & Outage Guard
    const liveScenario = stateRef.current.activeScenario;
    const liveScenarioDef = stateRef.current.activeScenarioDef;

    if (liveScenario && liveScenario.status === 'active' && liveScenarioDef) {
      // Active Feeder & Lane Queue Tracking
      const activeQueueCount = currVehicles.filter(
        (v) => v.state === 'approaching' || v.state === 'queued' || v.state === 'processing'
      ).length;

      if (activeQueueCount > liveScenario.peakQueueCount) {
        liveScenario.peakQueueCount = activeQueueCount;
        setActiveScenario((prev) => (prev ? { ...prev, peakQueueCount: activeQueueCount } : null));
      }

      // Queue Limit Outage Check (e.g., Black Friday surge or WIP crisis limit)
      const queueObj = liveScenarioDef.objectives.find((o) => o.type === 'max_queue');
      if (queueObj && activeQueueCount >= queueObj.target) {
        triggerScenarioOutcome(
          false,
          'Critical Highway Queue Overflow (System Outage)',
          `Highway queue surged to ${activeQueueCount} vehicles, breaching the maximum allowed buffer of ${queueObj.target} vehicles. Upstream service outages triggered due to uncontained WIP gridlock!`,
          'F'
        );
        return;
      }

      // Dynamic Mid-Scenario Event Alerts & Vehicle Bursts
      liveScenarioDef.events.forEach((evt) => {
        if (
          currFerry.dayNumber === evt.day &&
          currFerry.dayTimeFormatted.startsWith(evt.timeFormatted.split(':')[0]) &&
          !liveScenario.triggeredEventIds.includes(evt.id)
        ) {
          liveScenario.triggeredEventIds.push(evt.id);
          liveScenario.activeNotification = evt;
          setActiveScenario({ ...liveScenario });
          sound.playAlert();

          // Spawn burst vehicles if configured
          if (evt.spawnBurstPoints && evt.spawnBurstPoints.length > 0) {
            evt.spawnBurstPoints.forEach((pts, idx) => {
              setTimeout(() => {
                spawnVehicle(pts);
              }, (idx + 1) * 350);
            });
          }
        }
      });
    }

    // Continual Flow Starvation Prevention: If an unlocked booth has 0 incoming vehicles, feed it immediately!
    if (currFerry.dayPhase !== 'planning' && isContinualFlow && currVehicles.length < maxAllowedVehicles && now - stateRef.current.lastSpawnTime > 350) {
      const activeBooths = currBooths.filter((b) => b.unlocked);
      for (const b of activeBooths) {
        const laneLoad = currVehicles.filter(
          (v) => v.laneIndex === b.id && (v.state === 'approaching' || v.state === 'queued' || v.state === 'processing')
        ).length;
        if (laneLoad === 0) {
          stateRef.current.lastSpawnTime = now;
          spawnVehicle(undefined, b.id);
          break;
        }
      }
    }

    // 2. Ferry Departure Conditions: Leaves when FULL OR when TIMER RUNS OUT
    if (currFerry.state === 'boarding') {
      // Condition A: Ferry is FULL (capacity reached or exceeded)!
      if (currFerry.currentPoints >= currFerry.capacity && currFerry.vehiclesOnBoard.length > 0) {
        lastCountdownSecondRef.current = -1;
        launchFerry('full');
        return;
      }

      // Condition B: Timer countdown towards 05:00 PM release deadline
      if (currFerry.dayPhase === 'planning') {
        // Paused during morning sprint planning phase
      } else if (currFerry.sprintTimer > 0) {
        // Daily sprint countdown timer runs 30% slower (0.7x elapsed rate)
        const newTimer = Math.max(0, currFerry.sprintTimer - dt * 0.7);

        // Calculate work day progress & formatted work hour (09:00 AM to 05:00 PM)
        const dayProgress = Math.max(0, Math.min(1, 1 - newTimer / currFerry.sprintDuration));
        const totalWorkMinutes = Math.floor(dayProgress * 480);
        const hour = 9 + Math.floor(totalWorkMinutes / 60);
        const minute = totalWorkMinutes % 60;
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const dayTimeFormatted = `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;

        let dayPhase: DayPhase = 'morning';
        if (newTimer <= 4 || dayProgress >= 0.95) dayPhase = 'departure';
        else if (dayProgress >= 0.75) dayPhase = 'sunset';
        else if (dayProgress >= 0.5) dayPhase = 'afternoon';
        else if (dayProgress >= 0.25) dayPhase = 'midday';

        // Countdown audio ticks for the final 5 seconds before ferry departure
        const wholeSeconds = Math.ceil(newTimer);
        if (wholeSeconds <= 5 && wholeSeconds > 0 && wholeSeconds !== lastCountdownSecondRef.current) {
          lastCountdownSecondRef.current = wholeSeconds;
          sound.playCountdownTick(wholeSeconds);
        }

        if (newTimer === 0) {
          lastCountdownSecondRef.current = -1;
          launchFerry('timer');
        } else {
          setFerry((prev) => ({
            ...prev,
            sprintTimer: newTimer,
            dayPhase,
            dayTimeFormatted
          }));
        }
      } else {
        // Timer ran out!
        lastCountdownSecondRef.current = -1;
        launchFerry('timer');
      }
    }

    // 3. Ferry Sailing Animation
    if (currFerry.state === 'departing' || currFerry.state === 'sailing') {
      const sailSpeed = 18 * (1 + (currFerry.speedLevel - 1) * 0.3) * dt;
      const newProgress = currFerry.sailProgress + sailSpeed;

      if (newProgress >= 100) {
        // Transition to returning
        setFerry((prev) => ({
          ...prev,
          state: 'returning',
          sailProgress: 100
        }));
      } else {
        setFerry((prev) => ({
          ...prev,
          state: 'sailing',
          sailProgress: newProgress
        }));
      }
    } else if (currFerry.state === 'returning') {
      const returnSpeed = 22 * (1 + (currFerry.speedLevel - 1) * 0.3) * dt;
      const newProgress = currFerry.sailProgress - returnSpeed;

      if (newProgress <= 0) {
        // Returned empty and ready for next daily sprint
        const nextDay = currFerry.dayNumber + 1;
        const carryovers = currVehicles.filter(
          (v) => v.state !== 'departed' && v.state !== 'on_ferry'
        );
        const nextBacklog = preSelectOptimalBatch(
          generateDailyBacklog(nextDay, carryovers),
          currFerry.capacity
        );
        setBacklogItems(nextBacklog);
        setIsSprintPlanningOpen(true);

        setFerry((prev) => ({
          ...prev,
          state: 'boarding',
          sailProgress: 0,
          currentPoints: 0,
          vehiclesOnBoard: [],
          sprintNumber: prev.sprintNumber + 1,
          dayNumber: nextDay,
          dayPhase: 'planning',
          dayTimeFormatted: '09:00 AM (Planning)',
          sprintTimer: prev.sprintDuration
        }));
      } else {
        setFerry((prev) => ({
          ...prev,
          sailProgress: newProgress
        }));
      }
    }

    // 4. Update Vehicles movement and Booth Processing
    const updatedBooths = [...currBooths];
    let earnedThisTick = 0;

    // Group vehicles by lane to assign queue positions
    const laneQueues: Record<number, VehicleStory[]> = {};
    currBooths.forEach((b) => {
      laneQueues[b.id] = [];
    });

    const updatedVehicles = currVehicles.map((vehicle) => {
      const v = { ...vehicle };

      // Lane assignment for approaching vehicles (do not assign to staged parking lot cars until dispatched)
      if (v.laneIndex === -1 && currSettings.autoAssignLanes && v.state !== 'staged') {
        v.laneIndex = assignVehicleToLane(v, currBooths);
      }

      if (v.laneIndex >= 0 && (v.state === 'approaching' || v.state === 'queued' || v.state === 'processing')) {
        laneQueues[v.laneIndex]?.push(v);
      }

      return v;
    });

    // Sort lane queues by distance along road (X coordinate)
    Object.keys(laneQueues).forEach((laneKey) => {
      const laneId = Number(laneKey);
      const queue = laneQueues[laneId];
      queue.sort((a, b) => b.x - a.x); // closest to booth first

      queue.forEach((v, index) => {
        v.laneQueuePosition = index;
      });
    });

    // Process each toll booth
    const BOOTH_BARRIER_X = 245;

    updatedBooths.forEach((booth) => {
      if (!booth.unlocked) return;

      // Handle booth turnaround cooldown between vehicles
      if (booth.cooldownTimer > 0) {
        booth.cooldownTimer = Math.max(0, booth.cooldownTimer - dt);
      }

      // Handle random booth incidents / breakdowns (flat tires, gate jams, etc.)
      if (booth.incident) {
        booth.incident.remaining = Math.max(0, booth.incident.remaining - dt);
        if (booth.incident.remaining <= 0) {
          booth.incident = null;
          booth.timeSinceLastIncident = 0;
          sound.playRepair();
        }
      } else {
        booth.timeSinceLastIncident = (booth.timeSinceLastIncident || 0) + dt;
        const totalActiveIncidents = updatedBooths.filter((b) => b.incident !== null).length;
        if (
          booth.timeSinceLastIncident > 24 &&
          totalActiveIncidents < 2 &&
          currFerry.state === 'boarding' &&
          currFerry.dayPhase !== 'planning'
        ) {
          if (Math.random() < dt * 0.015) {
            booth.incident = generateRandomBoothIncident(booth);
            booth.timeSinceLastIncident = 0;
            sound.playIncident();
          }
        }
      }

      const laneVehicles = laneQueues[booth.id] || [];
      const frontVehicle = laneVehicles[0];

      // Lower barrier if clearing car has passed
      if (
        booth.barrierRaised &&
        !updatedVehicles.some((v) => v.laneIndex === booth.id && v.state === 'to_dock' && v.x < BOOTH_BARRIER_X + 45)
      ) {
        booth.barrierRaised = false;
      }

      // Check if a vehicle is currently clearing the booth gate
      const hasClearingCar = updatedVehicles.some(
        (v) => v.laneIndex === booth.id && v.state === 'to_dock' && v.x < BOOTH_BARRIER_X + 45
      );

      // If booth is idle, cooldown complete, no active incident, and front vehicle has reached the barrier stop line
      if (
        !booth.isProcessing &&
        booth.currentVehicleId === null &&
        booth.cooldownTimer <= 0 &&
        booth.incident === null &&
        frontVehicle &&
        !hasClearingCar
      ) {
        const stopLine = BOOTH_BARRIER_X - frontVehicle.length;
        if (frontVehicle.x >= stopLine - 10 && frontVehicle.x <= BOOTH_BARRIER_X) {
          booth.isProcessing = true;
          booth.currentVehicleId = frontVehicle.id;
          booth.processingProgress = 0;
          booth.barrierRaised = false;

          // Calculate processing time with upgrades
          const effBonus = 1 + (booth.efficiencyLevel - 1) * 0.25;
          const autoBonus = booth.automationLevel >= 2 ? 1.3 : 1.0;
          const duration = frontVehicle.baseProcessingTime / (effBonus * autoBonus);
          booth.processingDuration = duration;

          frontVehicle.state = 'processing';
          frontVehicle.x = stopLine;
          frontVehicle.arrivedAtBoothAt = Date.now();
        }
      }

      // If booth is currently processing
      if (booth.isProcessing && booth.processingDuration > 0 && !booth.incident) {
        const progressIncrement = (dt / booth.processingDuration) * 100;
        booth.processingProgress = Math.min(100, booth.processingProgress + progressIncrement);

        if (booth.processingProgress >= 100) {
          // Finished processing vehicle!
          booth.barrierRaised = true;
          sound.playBarrierRaise();

          const processedVehicle = updatedVehicles.find((v) => v.id === booth.currentVehicleId);
          if (processedVehicle) {
            processedVehicle.state = 'to_dock';
            processedVehicle.completedAt = Date.now();

            // Calculate XP & Level Up
            const trainingBonus = 1 + (booth.trainingLevel - 1) * 0.3;
            const xpGained = Math.round(processedVehicle.points * 12 * trainingBonus);
            booth.xp += xpGained;

            // Check level up threshold
            if (booth.xp >= booth.xpToNextLevel) {
              booth.level += 1;
              booth.xp -= booth.xpToNextLevel;
              booth.xpToNextLevel = Math.round(booth.xpToNextLevel * 1.4);
              // Multiplier increases with experience!
              booth.multiplier = Math.round((1.0 + (booth.level - 1) * 0.25) * 100) / 100;
              sound.playLevelUp();
            }

            // Calculate toll revenue
            const tollRevenue = Math.round(processedVehicle.tollValue * booth.multiplier);
            earnedThisTick += tollRevenue;
            booth.totalRevenueGenerated += tollRevenue;
            booth.totalProcessedCount += 1;
            booth.totalPointsProcessed += processedVehicle.points;

            sound.playTollChime(booth.multiplier);

            // Record telemetry for metrics
            const cycleTimeSec = (processedVehicle.completedAt - (processedVehicle.arrivedAtBoothAt || processedVehicle.createdAt)) / 1000;
            stateRef.current.processedInLastMinute.push({
              timestamp: Date.now(),
              points: processedVehicle.points,
              cycleTime: cycleTimeSec
            });

            stateRef.current.totalProcessedStats.count += 1;
            stateRef.current.totalProcessedStats.points += processedVehicle.points;
            stateRef.current.totalProcessedStats.totalCycleSeconds += cycleTimeSec;
          }

          // Reset booth after processing and initiate turnaround cooldown based on experience level
          booth.isProcessing = false;
          booth.currentVehicleId = null;
          booth.processingProgress = 0;
          const cd = getBoothCooldownDuration(booth.level);
          booth.cooldownDuration = cd;
          booth.cooldownTimer = cd;
        }
      }
    });

    if (earnedThisTick > 0) {
      // Player only gains funding at the end of each day: accumulate in pendingDailyRevenue escrow
      stateRef.current.pendingDailyRevenue += earnedThisTick;
      setPendingDailyRevenue((prev) => prev + earnedThisTick);
    }

    // 5. Update vehicle positions on road and onto ferry dock
    const finalVehicles: VehicleStory[] = [];
    const newBoardedVehicles: VehicleStory[] = [];

    const LANE_Y_POSITIONS = [50, 125, 200, 275, 350, 425];

    // Sort descending by X so vehicles further ahead establish spacing first
    updatedVehicles.sort((a, b) => b.x - a.x);

    updatedVehicles.forEach((v) => {
      // Target Y when settled in assigned booth lane
      const assignedLane = v.laneIndex >= 0 && v.laneIndex < LANE_Y_POSITIONS.length ? v.laneIndex : 2;
      const targetLaneY = LANE_Y_POSITIONS[assignedLane] + (70 - v.width) / 2;
      const FEEDER_Y = 237.5 - v.width / 2;

      // Processing state: firmly anchored at barrier stop line
      if (v.state === 'processing') {
        v.x = BOOTH_BARRIER_X - v.length;
        v.y = targetLaneY;
      }

      // Approaching and Queued states
      if (v.state === 'approaching' || v.state === 'queued') {
        let stopX = BOOTH_BARRIER_X - v.length; // Stop front bumper at barrier

        // 1. Maintain safe following distance behind car ahead in the same lane
        const carsAheadInLane = updatedVehicles.filter(
          (other) =>
            other.id !== v.id &&
            other.state !== 'staged' &&
            other.laneIndex === v.laneIndex &&
            other.x > v.x &&
            other.state !== 'departed' &&
            other.state !== 'on_ferry'
        );

        if (carsAheadInLane.length > 0) {
          const closestInLane = carsAheadInLane.reduce(
            (closest, other) => (other.x < closest.x ? other : closest),
            carsAheadInLane[0]
          );
          const laneStopX = closestInLane.x - v.length - 14;
          stopX = Math.min(stopX, laneStopX);
        }

        // 2. Feeder and fan-out merge spacing: single file until paths diverge in Y
        if (v.x < -10) {
          const feederAhead = updatedVehicles.filter(
            (other) =>
              other.id !== v.id &&
              other.state !== 'staged' &&
              other.x > v.x &&
              other.x < 25 &&
              other.state !== 'departed' &&
              other.state !== 'on_ferry' &&
              Math.abs((other.y ?? FEEDER_Y) - (v.y ?? FEEDER_Y)) < 34
          );

          if (feederAhead.length > 0) {
            const closestFeeder = feederAhead.reduce(
              (closest, other) => (other.x < closest.x ? other : closest),
              feederAhead[0]
            );
            const feederStopX = closestFeeder.x - v.length - 14;
            stopX = Math.min(stopX, feederStopX);
          }
        }

        // 3. Smooth, anti-jitter deceleration towards stopX
        const dist = stopX - v.x;
        if (dist <= 0) {
          v.x = stopX;
          v.state = 'queued';
        } else {
          const speedRatio = Math.min(1, Math.max(0.18, dist / 28));
          const moveStep = v.speed * dt * 45 * speedRatio;

          if (moveStep >= dist) {
            v.x = stopX;
            v.state = 'queued';
          } else {
            v.x += moveStep;
            if (dist < 4) {
              v.state = 'queued';
            } else if (v.state === 'queued' && dist > 14) {
              v.state = 'approaching';
            }
          }
        }

        // Trajectory: Feeder lane (x < -80) -> Fan out S-curve (-80..50) -> Settled in lane (50+)
        if (v.x < -80) {
          v.y = FEEDER_Y;
        } else if (v.x < 50) {
          const t = Math.max(0, Math.min(1, (v.x - (-80)) / 130));
          const smoothT = t * t * (3 - 2 * t);
          v.y = FEEDER_Y + (targetLaneY - FEEDER_Y) * smoothT;
        } else {
          v.y = targetLaneY;
        }
      }

      // To Dock state (exiting booth to ferry dock ramp)
      if (v.state === 'to_dock') {
        v.y = targetLaneY;

        if (currFerry.state === 'boarding') {
          // Check car ahead in the same exit lane to prevent overtaking
          const aheadInLane = updatedVehicles.filter(
            (other) =>
              other.id !== v.id &&
              other.state === 'to_dock' &&
              other.laneIndex === v.laneIndex &&
              other.x > v.x
          );

          let maxDockX = 480;
          if (aheadInLane.length > 0) {
            const closest = aheadInLane.reduce(
              (min, other) => (other.x < min.x ? other : min),
              aheadInLane[0]
            );
            maxDockX = closest.x - v.length - 12;
          }

          const dist = maxDockX - v.x;
          if (dist > 0) {
            const speedScale = Math.min(1, Math.max(0.2, dist / 25));
            v.x = Math.min(maxDockX, v.x + (v.speed + 1.2) * dt * 50 * speedScale);
          }

          // Reach Ferry Dock ramp (around X = 465)
          if (v.x >= 465) {
            v.state = 'on_ferry';
            newBoardedVehicles.push(v);
          }
        } else {
          // Ferry is away/sailing: queue neatly at dock entrance without stacking
          const carsAtDock = updatedVehicles.filter(
            (other) =>
              other.id !== v.id &&
              other.state === 'to_dock' &&
              other.x > v.x
          );

          let dockStopX = 450 - v.length;
          if (carsAtDock.length > 0) {
            const closestAtDock = carsAtDock.reduce(
              (min, other) => (other.x < min.x ? other : min),
              carsAtDock[0]
            );
            dockStopX = Math.min(dockStopX, closestAtDock.x - v.length - 12);
          }

          const dist = dockStopX - v.x;
          if (dist <= 0) {
            v.x = dockStopX;
          } else {
            const speedScale = Math.min(1, Math.max(0.18, dist / 25));
            v.x = Math.min(dockStopX, v.x + (v.speed + 1.2) * dt * 50 * speedScale);
          }
        }
      }

      // Only keep vehicles that haven't boarded or sailed away
      if (v.state !== 'on_ferry' && v.state !== 'departed') {
        finalVehicles.push(v);
      }
    });

    // 6. Board vehicles onto Ferry
    if (newBoardedVehicles.length > 0 && currFerry.state === 'boarding') {
      const addedPoints = newBoardedVehicles.reduce((sum, v) => sum + v.points, 0);
      const newTotalPoints = currFerry.currentPoints + addedPoints;

      setFerry((prev) => {
        const updated = {
          ...prev,
          currentPoints: newTotalPoints,
          vehiclesOnBoard: [...prev.vehiclesOnBoard, ...newBoardedVehicles]
        };

        // Auto depart if ferry is full (capacity reached or exceeded)
        if (newTotalPoints >= prev.capacity) {
          setTimeout(() => launchFerry('full'), 150);
        }

        return updated;
      });
    }

    setBooths(updatedBooths);
    setVehicles(finalVehicles);

    // 7. Update Flow Metrics & Little's Law telemetry every second
    if (now - stateRef.current.lastMetricsSampleTime > 1000) {
      stateRef.current.lastMetricsSampleTime = now;

      // Clean records older than 60 seconds
      stateRef.current.processedInLastMinute = stateRef.current.processedInLastMinute.filter(
        (item) => now - item.timestamp < 60000
      );

      const recentItems = stateRef.current.processedInLastMinute;
      const throughputPerMin = recentItems.length;
      const throughputPtsPerMin = recentItems.reduce((acc, item) => acc + item.points, 0);

      const avgCycle =
        recentItems.length > 0
          ? recentItems.reduce((acc, item) => acc + item.cycleTime, 0) / recentItems.length
          : 6.0;

      // Work In Progress (WIP)
      const activeWipVehicles = finalVehicles.filter(
        (v) => v.state === 'queued' || v.state === 'processing' || v.state === 'approaching'
      );
      const currentWIP = activeWipVehicles.length;
      const wipPoints = activeWipVehicles.reduce((sum, v) => sum + v.points, 0);

      // Find bottleneck lane (lane with highest queued points among vehicles that reached the toll gate)
      let maxQueuePoints = 0;
      let bottleneckIndex = -1;
      currBooths.forEach((b) => {
        if (!b.unlocked) return;
        const gateVehicles = activeWipVehicles.filter(
          (v) =>
            v.laneIndex === b.id &&
            (v.state === 'processing' ||
              (v.state === 'queued' && v.x >= 80) ||
              (v.state === 'approaching' && v.x >= 110))
        );
        const lanePoints = gateVehicles.reduce((sum, v) => sum + v.points, 0);
        if (lanePoints > maxQueuePoints) {
          maxQueuePoints = lanePoints;
          bottleneckIndex = b.id;
        }
      });

      // Little's Law theoretical Lead Time = WIP / (Throughput / 60)
      const throughputPerSec = Math.max(0.05, throughputPerMin / 60);
      const theoreticalCycle = currentWIP / throughputPerSec;

      setMetrics({
        currentWIP,
        wipPoints,
        throughputPerMinute: throughputPerMin,
        throughputPointsPerMinute: throughputPtsPerMin,
        averageCycleTime: Math.round(avgCycle * 10) / 10,
        averageLeadTime: Math.round(theoreticalCycle * 10) / 10,
        flowEfficiency: Math.min(95, Math.max(15, Math.round(85 - currentWIP * 3.5))),
        littlesLawDiscrepancy: Math.round(Math.abs(avgCycle - theoreticalCycle) * 10) / 10,
        bottleneckLaneIndex: bottleneckIndex,
        completedStoriesTotal: stateRef.current.totalProcessedStats.count,
        completedPointsTotal: stateRef.current.totalProcessedStats.points
      });
    }
  };

  // Upgrades: Unlock Booth
  const unlockBooth = useCallback((boothId: number) => {
    if (stateRef.current.sprintSummary) return;
    const booth = booths.find((b) => b.id === boothId);
    if (!booth || booth.unlocked || funds < booth.unlockCost) return;

    sound.playLevelUp();
    setFunds((f) => f - booth.unlockCost);
    setBooths((prev) =>
      prev.map((b) => (b.id === boothId ? { ...b, unlocked: true } : b))
    );
  }, [booths, funds]);

  // Upgrades: Upgrade Booth Efficiency (Speed)
  const upgradeBoothEfficiency = useCallback((boothId: number) => {
    if (stateRef.current.sprintSummary) return;
    const booth = booths.find((b) => b.id === boothId);
    if (!booth) return;
    const cost = Math.round(75 * Math.pow(1.5, booth.efficiencyLevel));
    if (funds < cost) return;

    sound.playClick();
    setFunds((f) => f - cost);
    setBooths((prev) =>
      prev.map((b) =>
        b.id === boothId ? { ...b, efficiencyLevel: b.efficiencyLevel + 1 } : b
      )
    );
  }, [booths, funds]);

  // Upgrades: Upgrade Booth Automation (E-ZPass)
  const upgradeBoothAutomation = useCallback((boothId: number) => {
    if (stateRef.current.sprintSummary) return;
    const booth = booths.find((b) => b.id === boothId);
    if (!booth) return;
    const cost = Math.round(150 * Math.pow(1.7, booth.automationLevel));
    if (funds < cost) return;

    sound.playClick();
    setFunds((f) => f - cost);
    setBooths((prev) =>
      prev.map((b) =>
        b.id === boothId ? { ...b, automationLevel: b.automationLevel + 1 } : b
      )
    );
  }, [booths, funds]);

  // Upgrades: Upgrade Booth Training (XP Booster)
  const upgradeBoothTraining = useCallback((boothId: number) => {
    if (stateRef.current.sprintSummary) return;
    const booth = booths.find((b) => b.id === boothId);
    if (!booth) return;
    const cost = Math.round(100 * Math.pow(1.6, booth.trainingLevel));
    if (funds < cost) return;

    sound.playClick();
    setFunds((f) => f - cost);
    setBooths((prev) =>
      prev.map((b) =>
        b.id === boothId ? { ...b, trainingLevel: b.trainingLevel + 1 } : b
      )
    );
  }, [booths, funds]);

  // Upgrades: Upgrade Ferry Capacity
  const upgradeFerryCapacity = useCallback(() => {
    if (stateRef.current.sprintSummary) return;
    const cost = Math.round(120 * Math.pow(1.6, ferry.capacityLevel));
    if (funds < cost) return;

    sound.playClick();
    setFunds((f) => f - cost);
    setFerry((prev) => ({
      ...prev,
      capacityLevel: prev.capacityLevel + 1,
      capacity: prev.capacity + 25
    }));
  }, [ferry.capacityLevel, funds]);

  // Upgrades: Upgrade Ferry Speed
  const upgradeFerrySpeed = useCallback(() => {
    if (stateRef.current.sprintSummary) return;
    const cost = Math.round(150 * Math.pow(1.7, ferry.speedLevel));
    if (funds < cost) return;

    sound.playClick();
    setFunds((f) => f - cost);
    setFerry((prev) => ({
      ...prev,
      speedLevel: prev.speedLevel + 1
    }));
  }, [ferry.speedLevel, funds]);

  // Upgrades: Upgrade Ferry Amenities (Sprint Completion Bonus)
  const upgradeFerryAmenities = useCallback(() => {
    if (stateRef.current.sprintSummary) return;
    const cost = Math.round(200 * Math.pow(1.8, ferry.amenitiesLevel));
    if (funds < cost) return;

    sound.playClick();
    setFunds((f) => f - cost);
    setFerry((prev) => ({
      ...prev,
      amenitiesLevel: prev.amenitiesLevel + 1
    }));
  }, [ferry.amenitiesLevel, funds]);

  // Configure lane WIP Limit (Kanban limit)
  const setLaneWipLimit = useCallback((boothId: number, newLimit: number) => {
    if (stateRef.current.sprintSummary) return;
    sound.playClick();
    setBooths((prev) =>
      prev.map((b) => (b.id === boothId ? { ...b, wipLimit: Math.max(1, Math.min(8, newLimit)) } : b))
    );
  }, []);

  // Configure lane specialization (Expedite / Heavy / All)
  const setLaneSpecialization = useCallback((boothId: number, spec: LaneSpecialization) => {
    if (stateRef.current.sprintSummary) return;
    sound.playClick();
    setBooths((prev) =>
      prev.map((b) => (b.id === boothId ? { ...b, specialization: spec } : b))
    );
  }, []);

  // Toggle Auto-depart setting
  const toggleAutoDepart = useCallback((type: 'onFull' | 'onTimer') => {
    if (stateRef.current.sprintSummary) return;
    sound.playClick();
    setFerry((prev) => ({
      ...prev,
      autoDepartOnFull: type === 'onFull' ? !prev.autoDepartOnFull : prev.autoDepartOnFull,
      autoDepartOnTimer: type === 'onTimer' ? !prev.autoDepartOnTimer : prev.autoDepartOnTimer
    }));
  }, []);

  // Settings: toggle sound
  const toggleSound = useCallback(() => {
    const newMuted = sound.toggleMute();
    setSettings((s) => ({ ...s, soundEnabled: !newMuted }));
  }, []);

  // Settings: change game speed
  const setGameSpeed = useCallback((speed: number) => {
    if (stateRef.current.sprintSummary) return;
    sound.playClick();
    setSettings((s) => ({ ...s, gameSpeed: speed }));
  }, []);

  // Add funds directly (e.g. from quiz or bonus)
  const addFunds = useCallback((amount: number) => {
    if (stateRef.current.sprintSummary) return;
    setFunds((f) => f + amount);
  }, []);

  // Set daily cycle duration (e.g. 30s, 45s, 60s, 90s)
  const setDailyDuration = useCallback((seconds: number) => {
    if (stateRef.current.sprintSummary) return;
    sound.playClick();
    setFerry((prev) => ({
      ...prev,
      sprintDuration: seconds,
      sprintTimer: Math.min(prev.sprintTimer, seconds)
    }));
  }, []);

  // Toggle Continuous Flow of Traffic Mode
  const toggleContinuousFlowMode = useCallback(() => {
    if (stateRef.current.sprintSummary) return;
    sound.playClick();
    setSettings((s) => ({
      ...s,
      continuousFlowMode: !s.continuousFlowMode
    }));
  }, []);

  // Dismiss or set sprint retrospective report with stateRef synchronization
  const updateSprintSummary = useCallback((summary: SprintSummary | null) => {
    stateRef.current.sprintSummary = summary;
    if (!summary) {
      stateRef.current.lastSpawnTime = Date.now();
      lastParkingReleaseTimeRef.current = Date.now();
    }
    setSprintSummary(summary);
  }, []);

  // Open the most recent sprint retrospective report
  const openLastRetrospective = useCallback(() => {
    if (lastSprintSummary) {
      sound.playClick();
      updateSprintSummary(lastSprintSummary);
    }
  }, [lastSprintSummary, updateSprintSummary]);

  // Daily Forecast: Predicts incoming story volume for next sprint based on current throughput
  const dailyForecast: DailyForecast = useMemo(() => {
    const activeBooths = booths.filter((b) => b.unlocked);
    const activeLanesCount = Math.max(1, activeBooths.length);
    const sprintMinutes = (ferry.sprintDuration || 45) / 60;

    // Measured or baseline throughput rate (stories/min)
    const baseThroughput = Math.max(metrics.throughputPerMinute, activeLanesCount * 5.5);

    // Natural day-over-day backlog expansion & continual flow mode multiplier
    const dayGrowth = 1 + (ferry.dayNumber * 0.07);
    const flowFactor = settings.continuousFlowMode ? 1.25 : 1.0;

    // Projected incoming story volume for the next sprint
    const predictedStories = Math.max(8, Math.round(baseThroughput * sprintMinutes * dayGrowth * flowFactor));

    // Typical points sizing based on recent completed distribution
    const avgStoryPoints =
      metrics.completedStoriesTotal > 0
        ? Math.max(1.8, Math.min(4.2, metrics.completedPointsTotal / metrics.completedStoriesTotal))
        : 2.6;
    const predictedStoryPoints = Math.round(predictedStories * avgStoryPoints);

    // Active highway vehicles not yet boarded on ferry (carryover backlog)
    const activeHighwayVehicles = vehicles.filter(
      (v) => v.state === 'approaching' || v.state === 'queued' || v.state === 'processing'
    );
    const carryoverStories = activeHighwayVehicles.length;
    const carryoverPoints = activeHighwayVehicles.reduce((acc, v) => acc + v.points, 0);

    const totalProjectedStories = predictedStories + carryoverStories;
    const totalProjectedPoints = predictedStoryPoints + carryoverPoints;

    // Little's Law target WIP planning (Optimal Lead Time target ~4.8s)
    const targetCycleTime = 4.8;
    const throughputPerSec = Math.max(0.1, baseThroughput / 60);
    const optimalSystemWIP = Math.max(2, Math.round(throughputPerSec * targetCycleTime));

    // Recommended WIP limit per active lane (typically 2 to 4)
    const recommendedLaneWipLimit = Math.max(1, Math.min(6, Math.round(optimalSystemWIP / activeLanesCount) || 3));

    const currentAvgLaneWipLimit =
      Math.round((activeBooths.reduce((sum, b) => sum + b.wipLimit, 0) / activeLanesCount) * 10) / 10;

    let predictedDemandLevel: DailyForecast['predictedDemandLevel'] = 'moderate';
    if (predictedStories >= 22) predictedDemandLevel = 'surge';
    else if (predictedStories >= 15) predictedDemandLevel = 'high';
    else if (predictedStories <= 9) predictedDemandLevel = 'lean';

    const capacitySurplusOrDeficit = ferry.capacity - totalProjectedPoints;

    let congestionRisk: DailyForecast['congestionRisk'] = 'low';
    if (currentAvgLaneWipLimit > recommendedLaneWipLimit + 1.5 || carryoverStories > 5) {
      congestionRisk = 'high';
    } else if (currentAvgLaneWipLimit > recommendedLaneWipLimit || carryoverStories > 2) {
      congestionRisk = 'moderate';
    }

    let coachAdvice = '';
    if (congestionRisk === 'high') {
      coachAdvice = `Your active WIP limits (${currentAvgLaneWipLimit}/lane) are above Little's Law recommendation (${recommendedLaneWipLimit}/lane). Under tomorrow's ~${predictedStories} incoming stories, queues will stretch lead times. Lower WIP limits to protect velocity.`;
    } else if (capacitySurplusOrDeficit < 0) {
      coachAdvice = `Next sprint's projected volume (${totalProjectedPoints} pts) will exceed Ferry capacity (${ferry.capacity} pts) by ${Math.abs(capacitySurplusOrDeficit)} pts. Plan for early release or upgrade Ferry capacity.`;
    } else {
      coachAdvice = `Throughput velocity is well-calibrated. Maintaining a WIP limit of ${recommendedLaneWipLimit} cars/lane preserves smooth flow without station starvation.`;
    }

    return {
      targetDayNumber: ferry.dayNumber + 1,
      targetSprintNumber: ferry.sprintNumber + 1,
      predictedStories,
      predictedStoryPoints,
      predictedDemandLevel,
      carryoverStories,
      carryoverPoints,
      totalProjectedStories,
      totalProjectedPoints,
      currentThroughputRate: metrics.throughputPerMinute,
      currentThroughputPointsRate: metrics.throughputPointsPerMinute,
      optimalSystemWIP,
      recommendedLaneWipLimit,
      currentAvgLaneWipLimit,
      activeLanesCount,
      ferryCapacity: ferry.capacity,
      capacitySurplusOrDeficit,
      congestionRisk,
      coachAdvice
    };
  }, [booths, ferry, metrics, settings.continuousFlowMode, vehicles]);

  // Apply recommended WIP limit across all unlocked booths
  const applyRecommendedWipLimit = useCallback((customLimit?: number) => {
    if (stateRef.current.sprintSummary) return;
    sound.playClick();
    const targetLimit = customLimit ?? dailyForecast.recommendedLaneWipLimit;
    setBooths((prev) =>
      prev.map((b) => (b.unlocked ? { ...b, wipLimit: targetLimit } : b))
    );
  }, [dailyForecast.recommendedLaneWipLimit]);

  // Start a predetermined tech scenario
  const startScenario = useCallback((def: ScenarioDefinition) => {
    if (stateRef.current.sprintSummary) return;
    sound.playLevelUp();
    setActiveScenarioDef(def);
    const newScenarioState: ActiveScenarioState = {
      scenarioId: def.id,
      status: 'active',
      startDay: 1,
      currentDay: 1,
      daysRemaining: def.durationDays,
      targetDays: def.durationDays,
      pointsDelivered: 0,
      epicsSlicedCount: 0,
      peakQueueCount: 0,
      consecutiveZeroStrandedDays: 0,
      triggeredEventIds: [],
      activeNotification: null
    };
    setActiveScenario(newScenarioState);
    stateRef.current.activeScenario = newScenarioState;
    stateRef.current.activeScenarioDef = def;

    // Reset environment to scenario starting conditions
    setFunds(def.startingFunds);
    stateRef.current.funds = def.startingFunds;
    setPendingDailyRevenue(0);
    stateRef.current.pendingDailyRevenue = 0;
    setTotalDeliveredPoints(0);

    // Reset booths to scenario conditions
    const resetBooths = INITIAL_BOOTHS.map((b, idx) => ({
      ...b,
      unlocked: idx < def.startingUnlockedBooths,
      level: 1,
      xp: 0,
      multiplier: 1.0,
      efficiencyLevel: 1,
      automationLevel: 1,
      trainingLevel: 1,
      wipLimit: 3,
      currentVehicleId: null,
      processingProgress: 0,
      isProcessing: false,
      barrierRaised: false
    }));
    setBooths(resetBooths);
    stateRef.current.booths = resetBooths;

    // Reset ferry to Day 1 planning phase
    const resetFerry: FerryDock = {
      ...INITIAL_FERRY,
      seasonNumber,
      shipName: currentShip.name,
      shipTag: currentShip.shortTag,
      dayNumber: 1,
      sprintNumber: 1,
      dayPhase: 'planning',
      dayTimeFormatted: '09:00 AM (Planning)',
      sprintTimer: 45,
      currentPoints: 0,
      vehiclesOnBoard: [],
      state: 'boarding'
    };
    setFerry(resetFerry);
    stateRef.current.ferry = resetFerry;

    // Spawn initial scenario vehicles if specified
    const initialCarCount = def.startingVehiclesCount || 4;
    const initialCars: VehicleStory[] = [];
    for (let i = 0; i < initialCarCount; i++) {
      let pts: StoryPoint = 3;
      if (def.category === 'refactoring') {
        pts = i % 2 === 0 ? 8 : (i % 3 === 0 ? 13 : 5);
      } else {
        pts = (([1, 2, 3, 5] as StoryPoint[])[i % 4]);
      }
      const v = createVehicle(pts);
      v.laneIndex = assignVehicleToLane(v, resetBooths);
      v.y = 237.5 - v.width / 2;
      v.x = -20 - i * 35;
      initialCars.push(v);
    }
    setVehicles(initialCars);
    stateRef.current.vehicles = initialCars;

    // Build scenario backlog items
    let scenarioBacklog = generateDailyBacklog(1);
    if (def.category === 'refactoring') {
      const epicItems: BacklogItem[] = [
        {
          id: 'SCEN-EPIC-1',
          title: 'Legacy Monolith Billing & Accounting Database Migration',
          points: 13,
          type: 'epic',
          businessValue: 180,
          priority: 'critical',
          category: 'Infrastructure',
          description: 'Monolithic billing module with tight coupling to legacy stored procedures.',
          selected: true,
          isCarryover: false
        },
        {
          id: 'SCEN-EPIC-2',
          title: 'Legacy Monolithic User Auth & Permissions Engine Overhaul',
          points: 8,
          type: 'epic',
          businessValue: 110,
          priority: 'high',
          category: 'Core API',
          description: 'Massive auth service requiring vertical decomposition into microservices.',
          selected: true,
          isCarryover: false
        },
        {
          id: 'SCEN-EPIC-3',
          title: 'Legacy Payment Gateway Webhook Monolith Rewrite',
          points: 8,
          type: 'epic',
          businessValue: 95,
          priority: 'high',
          category: 'Payment Gateway',
          description: 'Deconstruct payment callback monolith into idempotency handlers.',
          selected: true,
          isCarryover: false
        }
      ];
      scenarioBacklog = [...epicItems, ...scenarioBacklog];
    }
    const freshScenarioBatch = preSelectOptimalBatch(scenarioBacklog, resetFerry.capacity);
    setBacklogItems(freshScenarioBatch);
    const selScen = freshScenarioBatch.filter((b) => b.selected);
    const initialScenCommitted = {
      points: selScen.reduce((sum, i) => sum + i.points, 0),
      count: selScen.length
    };
    setCommittedParkingLotStats(initialScenCommitted);
    stateRef.current.committedParkingLotStats = initialScenCommitted;

    setIsScenarioSelectOpen(false);
    setIsScenarioOutcomeOpen(false);
    setIsMainMenuOpen(false);
    setHasStartedGame(true);
    // Present the parking lot screen first before starting the challenge
    setIsSprintPlanningOpen(true);
  }, [createVehicle, assignVehicleToLane, seasonNumber, currentShip.name, currentShip.shortTag]);

  // Restart the currently active scenario
  const restartScenario = useCallback(() => {
    if (stateRef.current.activeScenarioDef) {
      startScenario(stateRef.current.activeScenarioDef);
    }
  }, [startScenario]);

  // Reset to sandbox Free Play mode
  const resetToFreePlay = useCallback(() => {
    sound.playClick();
    setActiveScenario(null);
    setActiveScenarioDef(null);
    stateRef.current.activeScenario = null;
    stateRef.current.activeScenarioDef = null;
    setIsScenarioOutcomeOpen(false);
  }, []);

  // Dismiss active mid-scenario notification
  const dismissScenarioNotification = useCallback(() => {
    setActiveScenario((prev) =>
      prev ? { ...prev, activeNotification: null } : null
    );
  }, []);

  const openScenarioSelect = useCallback(() => {
    sound.playClick();
    setIsScenarioSelectOpen(true);
  }, []);

  const closeScenarioSelect = useCallback(() => {
    setIsScenarioSelectOpen(false);
  }, []);

  const closeScenarioOutcome = useCallback(() => {
    setIsScenarioOutcomeOpen(false);
  }, []);

  // Main Menu Actions
  const openMainMenu = useCallback(() => {
    sound.playClick();
    setIsMainMenuOpen(true);
  }, []);

  const closeMainMenu = useCallback(() => {
    sound.playClick();
    setHasStartedGame(true);
    setIsMainMenuOpen(false);
  }, []);

  const resumeGame = useCallback(() => {
    sound.playClick();
    setHasStartedGame(true);
    setIsMainMenuOpen(false);
  }, []);

  const startNewFreePlayGame = useCallback(() => {
    sound.playFerryHorn();
    setActiveScenario(null);
    setActiveScenarioDef(null);
    stateRef.current.activeScenario = null;
    stateRef.current.activeScenarioDef = null;
    setIsScenarioOutcomeOpen(false);
    setIsScenarioSelectOpen(false);

    setFunds(200);
    stateRef.current.funds = 200;
    setPendingDailyRevenue(0);
    stateRef.current.pendingDailyRevenue = 0;
    setTotalDeliveredPoints(0);

    const resetBooths = INITIAL_BOOTHS.map((b, idx) => ({
      ...b,
      unlocked: idx < 2,
      level: 1,
      xp: 0,
      multiplier: 1.0,
      efficiencyLevel: 1,
      automationLevel: 1,
      trainingLevel: 1,
      wipLimit: 4,
      specialization: 'all' as LaneSpecialization,
      currentVehicleId: null,
      processingProgress: 0,
      isProcessing: false,
      barrierRaised: false,
      incident: null
    }));
    setBooths(resetBooths);
    stateRef.current.booths = resetBooths;

    const resetFerry: FerryDock = {
      ...INITIAL_FERRY,
      seasonNumber,
      shipName: currentShip.name,
      shipTag: currentShip.shortTag,
      dayNumber: 1,
      sprintNumber: 1,
      dayPhase: 'planning',
      dayTimeFormatted: '09:00 AM (Planning)',
      sprintTimer: 45,
      currentPoints: 0,
      vehiclesOnBoard: [],
      state: 'boarding'
    };
    setFerry(resetFerry);
    stateRef.current.ferry = resetFerry;

    setVehicles([]);
    stateRef.current.vehicles = [];
    setSprintSummary(null);
    stateRef.current.sprintSummary = null;
    setLastSprintSummary(null);
    setSelectedVehicle(null);
    setSelectedBoothId(null);

    const freshBacklog = preSelectOptimalBatch(generateDailyBacklog(1), INITIAL_FERRY.capacity);
    setBacklogItems(freshBacklog);
    const sel = freshBacklog.filter((b) => b.selected);
    const initialCommitted = {
      points: sel.reduce((sum, i) => sum + i.points, 0),
      count: sel.length
    };
    setCommittedParkingLotStats(initialCommitted);
    stateRef.current.committedParkingLotStats = initialCommitted;

    setHasStartedGame(true);
    setIsMainMenuOpen(false);
    // Present the parking lot screen first before starting the shift
    setIsSprintPlanningOpen(true);
  }, [seasonNumber, currentShip.name, currentShip.shortTag]);

  const dailyDues = useMemo(() => calculateDailyDues(booths, ferry), [booths, ferry]);

  return {
    funds,
    pendingDailyRevenue,
    dailyDues,
    totalDeliveredPoints,
    booths,
    ferry,
    vehicles,
    metrics,
    settings,
    sprintSummary,
    lastSprintSummary,
    dailyForecast,
    selectedVehicle,
    selectedBoothId,
    // Sprint Planning & Backlog
    backlogItems,
    isSprintPlanningOpen,
    setIsSprintPlanningOpen,
    openSprintPlanning,
    closeSprintPlanning,
    toggleBacklogItem,
    autoSelectOptimalBatch,
    selectAllBacklog,
    clearAllBacklog,
    sliceBacklogItem,
    addBacklogStory,
    removeBacklogItem,
    removeStoriesByPoints,
    removeSelectedBacklogItems,
    stageStoryInParkingLot,
    commitSprintPlanning,
    dispatchNextFromParkingLot,
    resolveBoothIncident,
    // Scenario Engine
    activeScenario,
    activeScenarioDef,
    isScenarioSelectOpen,
    isScenarioOutcomeOpen,
    startScenario,
    restartScenario,
    resetToFreePlay,
    dismissScenarioNotification,
    openScenarioSelect,
    closeScenarioSelect,
    closeScenarioOutcome,
    // Main Menu
    isMainMenuOpen,
    setIsMainMenuOpen,
    hasStartedGame,
    openMainMenu,
    closeMainMenu,
    resumeGame,
    startNewFreePlayGame,
    // User Season & Fleet Ships
    seasonNumber,
    setSeasonNumber,
    currentShip,
    nextSeason,
    prevSeason,
    changeSeason,
    // Actions
    addFunds,
    setDailyDuration,
    toggleContinuousFlowMode,
    spawnVehicle,
    sliceStory,
    launchFerry,
    unlockBooth,
    upgradeBoothEfficiency,
    upgradeBoothAutomation,
    upgradeBoothTraining,
    upgradeFerryCapacity,
    upgradeFerrySpeed,
    upgradeFerryAmenities,
    setLaneWipLimit,
    applyRecommendedWipLimit,
    setLaneSpecialization,
    toggleAutoDepart,
    toggleSound,
    setGameSpeed,
    setSelectedVehicle,
    setSelectedBoothId,
    setSprintSummary: updateSprintSummary,
    openLastRetrospective
  };
}
