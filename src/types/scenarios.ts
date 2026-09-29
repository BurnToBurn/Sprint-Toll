import { StoryPoint } from './game';

export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ScenarioCategory = 'throughput' | 'refactoring' | 'automation' | 'wip_limits' | 'economic';

export interface ScenarioObjective {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  isCompleted: boolean;
  type: 'points_shipped' | 'epics_sliced' | 'max_queue' | 'flow_efficiency' | 'ezpass_tier' | 'unlocked_lanes' | 'zero_stranded_days' | 'funds_target' | 'avg_cycle_time';
}

export interface ScenarioEvent {
  id: string;
  day: number;
  timeFormatted: string; // e.g. "12:00 PM"
  title: string;
  message: string;
  type: 'info' | 'warning' | 'hazard' | 'boost';
  effectLabel?: string;
  spawnBurstPoints?: StoryPoint[];
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: ScenarioDifficulty;
  category: ScenarioCategory;
  durationDays: number;
  startingFunds: number;
  startingUnlockedBooths: number;
  startingVehiclesCount?: number;
  spawnRateMultiplier: number;
  epicSpawnChance: number; // 0 to 1
  dailyDuesMultiplier: number;
  agileConceptTaught: string;
  winConditionSummary: string;
  lossConditionSummary: string;
  objectives: Omit<ScenarioObjective, 'current' | 'isCompleted'>[];
  events: ScenarioEvent[];
}

export interface ActiveScenarioState {
  scenarioId: string;
  status: 'active' | 'victory' | 'defeat';
  startDay: number;
  currentDay: number;
  daysRemaining: number;
  targetDays: number;
  // Live Tracked Stats
  pointsDelivered: number;
  epicsSlicedCount: number;
  peakQueueCount: number;
  consecutiveZeroStrandedDays: number;
  triggeredEventIds: string[];
  activeNotification: ScenarioEvent | null;
  // Result
  outcome?: {
    isWin: boolean;
    title: string;
    reason: string;
    rating: 'S' | 'A' | 'B' | 'C' | 'F';
    agileTakeaway: string;
    pointsEarned: number;
    completionTimeFormatted: string;
  };
}
