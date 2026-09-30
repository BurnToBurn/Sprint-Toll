export type StoryPoint = 1 | 2 | 3 | 5 | 8 | 13 | 21;

export interface VehicleStory {
  id: string;
  points: StoryPoint;
  title: string;
  type: 'bug' | 'task' | 'story' | 'feature' | 'epic' | 'initiative' | 'monolith';
  color: string;
  accentColor: string;
  length: number; // pixels in visualization
  width: number;
  baseProcessingTime: number; // in seconds
  speed: number;
  tollValue: number; // base points / currency
  createdAt: number;
  arrivedAtBoothAt?: number;
  completedAt?: number;
  // Position & movement
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  laneIndex: number; // -1 if on main highway before assignment
  state: 'staged' | 'approaching' | 'queued' | 'processing' | 'to_dock' | 'on_ferry' | 'departed';
  laneQueuePosition: number; // 0 = at the booth, 1 = right behind, etc.
  parkingSlotIndex?: number; // 0, 1, 2... slot index in the sprint parking lot
  feederLane?: 'north' | 'south'; // North or South one-way feeder lane
  hasChosenPlazaLane?: boolean; // True once vehicle evaluated shortest lane upon entering plaza
}

export type BacklogPriority = 'critical' | 'high' | 'medium' | 'low';

export interface BacklogItem {
  id: string;
  title: string;
  points: StoryPoint;
  type: 'bug' | 'task' | 'story' | 'feature' | 'epic' | 'initiative' | 'monolith';
  businessValue: number; // base toll value
  priority: BacklogPriority;
  category: 'Security' | 'Payment Gateway' | 'Infrastructure' | 'Core API' | 'Frontend UX' | 'Data Analytics' | 'Compliance';
  description?: string;
  selected: boolean;
  isCarryover?: boolean;
}

export interface SprintPlan {
  dayNumber: number;
  targetCapacity: number;
  committedPoints: number;
  committedCount: number;
  items: BacklogItem[];
  agileAdvice: string;
}

export type LaneSpecialization = 'all' | 'small_only' | 'standard' | 'heavy_only';

export type IncidentType = 'flat_tire' | 'breakdown' | 'scanner_glitch' | 'spill_cleanup';

export interface BoothIncident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  duration: number; // total duration in seconds
  remaining: number; // remaining seconds
  quickFixCost: number; // cost to instantly resolve
  startedAt: number;
}

export interface TollBooth {
  id: number;
  name: string;
  unlocked: boolean;
  unlockCost: number;
  // Experience & Multipliers
  level: number;
  xp: number;
  xpToNextLevel: number;
  multiplier: number; // Experience multiplier (e.g. 1.0x to 4.5x)
  // Upgrades
  efficiencyLevel: number; // Processing speed
  automationLevel: number; // E-ZPass auto-processing
  trainingLevel: number; // Faster XP gain
  // Configuration
  wipLimit: number; // Max queue length for this lane (Kanban WIP limit)
  specialization: LaneSpecialization;
  // State
  currentVehicleId: string | null;
  processingProgress: number; // 0 to 100
  processingDuration: number;
  isProcessing: boolean;
  barrierRaised: boolean;
  // Turnaround Cooldown between vehicles (scales with experience level down to almost nothing)
  cooldownTimer: number; // seconds remaining before receiving next vehicle
  cooldownDuration: number; // standard cooldown duration for this experience level
  // Random breakdowns, mechanical jams, and blocked lane events (flat tires)
  incident: BoothIncident | null;
  timeSinceLastIncident: number; // tracks cooldown between random incidents
  // Stats
  totalProcessedCount: number;
  totalPointsProcessed: number;
  totalRevenueGenerated: number;
}

export type DayPhase = 'planning' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'departure';

export interface FerryDock {
  capacity: number; // max story points capacity
  currentPoints: number;
  vehiclesOnBoard: VehicleStory[];
  state: 'boarding' | 'ready' | 'departing' | 'sailing' | 'returning';
  sailProgress: number; // 0 to 100
  sprintNumber: number; // Sprint / Day number
  dayNumber: number;
  seasonNumber?: number; // User Season number (Season 1 = Ship 20, Season 2 = Ship 21, etc.)
  shipName?: string; // Current season release vessel name
  shipTag?: string; // e.g. VEL-20
  dayPhase: DayPhase;
  dayTimeFormatted: string; // e.g. "09:00 AM", "02:30 PM", "05:00 PM (DEPARTURE)"
  sprintTimer: number; // seconds remaining in current daily cycle
  sprintDuration: number; // total duration of the daily cycle in seconds (e.g. 45s)
  autoDepartOnFull: boolean;
  autoDepartOnTimer: boolean; // default true for daily cycle sprint
  // Upgrades
  capacityLevel: number;
  speedLevel: number; // Faster sailing/return
  amenitiesLevel: number; // Multiplier on sprint completion bonus
}

export interface FlowMetrics {
  currentWIP: number; // total vehicles in system
  wipPoints: number;
  throughputPerMinute: number; // stories completed per min
  throughputPointsPerMinute: number;
  averageCycleTime: number; // seconds from queue entry to toll exit
  averageLeadTime: number; // seconds from spawn to ferry departure
  flowEfficiency: number; // active processing time / total lead time %
  littlesLawDiscrepancy: number;
  bottleneckLaneIndex: number; // lane with longest queue
  completedStoriesTotal: number;
  completedPointsTotal: number;
}

export interface RetrospectiveLesson {
  id: string;
  category: 'littles_law' | 'batch_size' | 'wip_limits' | 'flow_efficiency' | 'bottlenecks' | 'continuous_flow';
  title: string;
  observation: string;
  metricEvidence: string;
  agileConcept: string;
  recommendation: string;
}

export interface DailyFinancialSettlement {
  grossTollRevenue: number;
  ferryDeliveryBonus: number;
  overDeliveryBonus?: number; // Extra money awarded for delivering points over parking lot commitment
  totalGrossRevenue: number;
  // Itemized daily dues & taxes
  efficiencyTax: number; // Tax on higher efficiency toll booths
  automationDues: number; // Maintenance dues on automated E-ZPass systems
  trainingDues: number; // Professional development & squad training dues
  ferryUpgradesTax: number; // Vessel infrastructure maintenance dues
  baseFacilityDues: number; // Base municipal operating fee per open lane
  totalDailyDues: number; // Combined deductions for daily dues & taxes
  netFundingAwarded: number; // Net funds credited to player's bank account
}

export interface ParkingLotCommitmentEvaluation {
  committedPoints: number; // Story points committed in the parking lot staging
  committedStoriesCount: number; // Number of user stories committed
  deliveredPoints: number; // Story points successfully loaded & shipped on ferry
  deliveredStoriesCount: number; // Number of user stories shipped
  overDeliveredPoints: number; // Points delivered beyond initial commitment (0 if under)
  underDeliveredPoints: number; // Points shortfall (0 if over)
  completionRate: number; // Percentage delivered vs committed (e.g. 120%)
  evaluationStatus: 'over_delivered' | 'exact_match' | 'under_delivered';
  bonusAwarded: number; // Bonus money earned for delivering more points than committed
  capacityAdjustment: number; // Adjustment to sprint capacity for next time based on over-delivery
  nextSprintCapacity: number; // Calibrated capacity for the upcoming sprint
  evaluationNotes: string; // Agile analysis of commitment vs delivery
}

export interface SprintSummary {
  sprintNumber: number;
  dayNumber: number;
  deliveredPoints: number;
  deliveredVehiclesCount: number;
  leftBehindCount: number; // Stories stuck in queue that missed today's ferry
  leftBehindPoints: number;
  averageCycleTime: number;
  flowEfficiency: number;
  pointsByType: Record<string, number>;
  totalBonus: number;
  coachAdvice: string;
  rating: 'exceptional' | 'great' | 'balanced' | 'bottlenecked' | 'congested';
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  departureReason?: 'full' | 'timer' | 'manual';
  // Financial settlement at day end
  financialSettlement?: DailyFinancialSettlement;
  // Commitment vs Delivered evaluation
  commitmentEvaluation?: ParkingLotCommitmentEvaluation;
  // Enriched simulation metrics for retrospective report
  bottleneckLaneName?: string;
  bottleneckQueueCount?: number;
  peakWIP?: number;
  throughputPerMinute?: number;
  largestStoryProcessed?: number;
  keyHighlights: string[];
  lessonsLearned: RetrospectiveLesson[];
}

export interface DailyForecast {
  targetDayNumber: number;
  targetSprintNumber: number;
  predictedStories: number;
  predictedStoryPoints: number;
  predictedDemandLevel: 'lean' | 'moderate' | 'high' | 'surge';
  carryoverStories: number;
  carryoverPoints: number;
  totalProjectedStories: number;
  totalProjectedPoints: number;
  currentThroughputRate: number; // stories/min
  currentThroughputPointsRate: number; // pts/min
  optimalSystemWIP: number;
  recommendedLaneWipLimit: number;
  currentAvgLaneWipLimit: number;
  activeLanesCount: number;
  ferryCapacity: number;
  capacitySurplusOrDeficit: number; // positive = surplus, negative = deficit
  congestionRisk: 'low' | 'moderate' | 'high';
  coachAdvice: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  gameSpeed: number; // 0, 1, 2, 3
  autoAssignLanes: boolean;
  showMetricsOverlay: boolean;
  storyPointLabels: boolean;
  continuousFlowMode: boolean; // Continuous flow of traffic mode
}

export interface AgileLesson {
  id: string;
  title: string;
  concept: string;
  summary: string;
  keyTakeaway: string;
  realWorldScenario: string;
  interactiveTip: string;
}
