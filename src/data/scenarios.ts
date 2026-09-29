import { ScenarioDefinition } from '../types/scenarios';

export const PREDETERMINED_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'black_friday_surge',
    title: 'The Black Friday Traffic Surge',
    tagline: 'High-Volume Production Inflow & Queue Overflow Prevention',
    description:
      'An e-commerce flash sale has unleashed an astronomical deluge of user stories onto your highway pipeline. Keep your team from collapsing under the weight of unbounded queue sizes. If queue congestion breaches 20 vehicles, a full service outage triggers an immediate failure!',
    difficulty: 'intermediate',
    category: 'throughput',
    durationDays: 3,
    startingFunds: 180,
    startingUnlockedBooths: 2,
    startingVehiclesCount: 4,
    spawnRateMultiplier: 1.6,
    epicSpawnChance: 0.15,
    dailyDuesMultiplier: 1.0,
    agileConceptTaught: "Little's Law, Batch Size Management & Rapid Throughput",
    winConditionSummary: 'Ship >= 130 Story Points before Day 4 with zero queue overflows.',
    lossConditionSummary: 'Queue backlog reaches 20+ vehicles (System Outage) or failing to ship 130 pts by Day 4.',
    objectives: [
      {
        id: 'obj_points',
        label: 'Deliver Shipped Story Points',
        target: 130,
        unit: 'pts',
        type: 'points_shipped'
      },
      {
        id: 'obj_queue',
        label: 'Keep Feeder Queue Under Limit',
        target: 20,
        unit: 'max cars',
        type: 'max_queue'
      }
    ],
    events: [
      {
        id: 'bf_surge_1',
        day: 1,
        timeFormatted: '01:00 PM',
        title: 'Flash Sale Flashmob Arrives!',
        message: 'A viral marketing push just launched. Expect incoming story vehicle volume to double for the next several hours!',
        type: 'warning',
        effectLabel: 'High traffic incoming',
        spawnBurstPoints: [2, 3, 3, 5]
      },
      {
        id: 'bf_surge_2',
        day: 2,
        timeFormatted: '11:30 AM',
        title: 'VIP Shopper Priority Queue',
        message: 'High-value customer orders are flooding the lanes. Clear the bottleneck or risk queue overflow!',
        type: 'hazard',
        effectLabel: 'Queue pressure elevated',
        spawnBurstPoints: [5, 8, 3]
      },
      {
        id: 'bf_surge_3',
        day: 3,
        timeFormatted: '10:00 AM',
        title: 'Cyber Monday Final Stretch',
        message: 'Final hours of the sale! Maximize ferry capacity to lock in your 130 point objective!',
        type: 'boost',
        effectLabel: 'Final delivery sprint'
      }
    ]
  },
  {
    id: 'monolith_refactoring',
    title: 'Legacy Monolith Refactoring',
    tagline: 'Deconstruct Mega-Epics into Flowing Single-Piece Stories',
    description:
      'The engineering system is choked by massive 8pt, 13pt, and 21pt legacy monolithic vehicles that stall stations and cause massive queue latency. You must utilize the Story Slicing scalpel to dismantle at least 8 monolithic epics into bite-sized stories and maintain healthy Flow Efficiency.',
    difficulty: 'advanced',
    category: 'refactoring',
    durationDays: 3,
    startingFunds: 220,
    startingUnlockedBooths: 2,
    startingVehiclesCount: 6,
    spawnRateMultiplier: 1.1,
    epicSpawnChance: 0.55, // Heavy epics!
    dailyDuesMultiplier: 1.0,
    agileConceptTaught: 'Story Slicing, Vertical User Story Decomposition & Flow Efficiency',
    winConditionSummary: 'Slice >= 8 Monolithic Epics, reach >= 70% Flow Efficiency, and ship >= 100 points by end of Day 3.',
    lossConditionSummary: 'Fewer than 8 epics sliced by Day 4 or leaving > 6 stranded tickets on final release.',
    objectives: [
      {
        id: 'obj_slice',
        label: 'Slice Monolithic Epics (>= 8pts)',
        target: 8,
        unit: 'epics',
        type: 'epics_sliced'
      },
      {
        id: 'obj_flow_eff',
        label: 'Attain Pipeline Flow Efficiency',
        target: 70,
        unit: '%',
        type: 'flow_efficiency'
      },
      {
        id: 'obj_points_refactor',
        label: 'Ship Refactored Story Points',
        target: 100,
        unit: 'pts',
        type: 'points_shipped'
      }
    ],
    events: [
      {
        id: 'mono_event_1',
        day: 1,
        timeFormatted: '11:00 AM',
        title: 'Legacy Database Migration Ticket',
        message: 'A giant 21pt monolithic database overhaul just entered the highway! Click and slice it before it stalls a booth.',
        type: 'hazard',
        effectLabel: '21pt Monolith incoming',
        spawnBurstPoints: [21]
      },
      {
        id: 'mono_event_2',
        day: 2,
        timeFormatted: '02:00 PM',
        title: 'Architectural Debt Spike',
        message: 'Twin 13pt microservice decomposition initiatives have appeared on the feeder road!',
        type: 'warning',
        effectLabel: 'Twin 13pt Initiatives',
        spawnBurstPoints: [13, 13]
      }
    ]
  },
  {
    id: 'cicd_automation',
    title: 'CI/CD Pipeline Telemetry & Automation',
    tagline: 'Modernize Toll Gates with E-ZPass RFID & Zero-Friction Gates',
    description:
      'Manual toll inspection is costing thousands of seconds in cycle latency. Executive leadership demands full modernization: unlock 3 toll lanes, deploy E-ZPass automated gate telemetry to Tier 2 on at least 2 booths, and push average cycle latency down below 5.2 seconds.',
    difficulty: 'intermediate',
    category: 'automation',
    durationDays: 3,
    startingFunds: 280,
    startingUnlockedBooths: 1,
    startingVehiclesCount: 3,
    spawnRateMultiplier: 1.25,
    epicSpawnChance: 0.18,
    dailyDuesMultiplier: 1.15,
    agileConceptTaught: 'Continuous Delivery, Automated Quality Gates & Lead Time Reduction',
    winConditionSummary: 'Unlock 3 Lanes, upgrade 2 booths to E-ZPass Tier 2+, and achieve Avg Cycle Time <= 5.2s by Day 3.',
    lossConditionSummary: 'Fewer than 2 Tier-2 E-ZPass gates installed by Day 4 or running out of funds for daily dues.',
    objectives: [
      {
        id: 'obj_lanes',
        label: 'Unlock Highway Toll Lanes',
        target: 3,
        unit: 'lanes',
        type: 'unlocked_lanes'
      },
      {
        id: 'obj_ezpass',
        label: 'Automate Booths to E-ZPass Tier 2+',
        target: 2,
        unit: 'booths',
        type: 'ezpass_tier'
      },
      {
        id: 'obj_cycle_time',
        label: 'Achieve Avg Cycle Time Under',
        target: 5.2,
        unit: 'sec',
        type: 'avg_cycle_time'
      },
      {
        id: 'obj_points_auto',
        label: 'Ship Total Story Points',
        target: 105,
        unit: 'pts',
        type: 'points_shipped'
      }
    ],
    events: [
      {
        id: 'auto_event_1',
        day: 1,
        timeFormatted: '02:00 PM',
        title: 'Municipal Telemetry Grant',
        message: 'The Department of Transportation has awarded a $100 tech modernization bonus into today\'s toll escrow!',
        type: 'boost',
        effectLabel: '+$100 Grant Accrued'
      },
      {
        id: 'auto_event_2',
        day: 2,
        timeFormatted: '01:30 PM',
        title: 'Manual Gate Inspection Audit',
        message: 'Federal auditors have arrived. Manual lanes with low automation experience 20% extra inspection delay!',
        type: 'warning',
        effectLabel: 'Manual delay increased'
      }
    ]
  },
  {
    id: 'wip_limits_crisis',
    title: "Little's Law WIP Constraint Crisis",
    tagline: 'Defeat Multitasking Gridlock with Disciplined Kanban Limits',
    description:
      'Unchecked multitasking and zero WIP limits have left the highway in a chronic state of gridlock. High WIP is driving lead time through the roof! Set lane WIP limits strictly to <= 3, conquer the queue, and deliver 2 consecutive days with zero stranded tickets left behind.',
    difficulty: 'advanced',
    category: 'wip_limits',
    durationDays: 3,
    startingFunds: 210,
    startingUnlockedBooths: 3,
    startingVehiclesCount: 8,
    spawnRateMultiplier: 1.35,
    epicSpawnChance: 0.22,
    dailyDuesMultiplier: 1.0,
    agileConceptTaught: "Little's Law (WIP = Throughput × Lead Time) & WIP Restraints",
    winConditionSummary: 'Achieve 2 consecutive days with ZERO stranded tickets left behind at 05:00 PM and Lead Time <= 6.0s.',
    lossConditionSummary: 'Any single day release leaves > 5 stranded backlog tickets, or queue exceeds 22 cars.',
    objectives: [
      {
        id: 'obj_zero_stranded',
        label: 'Consecutive Days with 0 Left Behind',
        target: 2,
        unit: 'days',
        type: 'zero_stranded_days'
      },
      {
        id: 'obj_max_queue_wip',
        label: 'Prevent Feeder Bottleneck Queue',
        target: 20,
        unit: 'max cars',
        type: 'max_queue'
      },
      {
        id: 'obj_points_wip',
        label: 'Deliver Total Story Points',
        target: 95,
        unit: 'pts',
        type: 'points_shipped'
      }
    ],
    events: [
      {
        id: 'wip_event_1',
        day: 1,
        timeFormatted: '12:00 PM',
        title: 'Midday Backlog Influx',
        message: 'Stakeholders have pushed unexpected scope into the pipeline. Maintain strict WIP limits to prevent cascading gridlock!',
        type: 'warning',
        effectLabel: 'Scope influx',
        spawnBurstPoints: [3, 3, 5]
      },
      {
        id: 'wip_event_2',
        day: 2,
        timeFormatted: '11:00 AM',
        title: 'Kanban Kaizen Breakthrough',
        message: 'Lean team discipline has unlocked smooth flow! Processing barriers operate with optimal efficiency.',
        type: 'boost',
        effectLabel: 'Flow boost active'
      }
    ]
  },
  {
    id: 'startup_runway',
    title: 'Bootstrapped Runway & Fiscal Dues',
    tagline: 'Navigate Daily Dues and Operating Taxes to Reach Series A',
    description:
      'Venture capital has dried up! You must operate with extreme fiscal discipline. Higher efficiency booths and upgrades incur real daily operating dues and taxes deducted at every 05:00 PM release. Grow your settled bank account to $650 without succumbing to cash bankruptcy.',
    difficulty: 'expert',
    category: 'economic',
    durationDays: 4,
    startingFunds: 130,
    startingUnlockedBooths: 1,
    startingVehiclesCount: 3,
    spawnRateMultiplier: 1.2,
    epicSpawnChance: 0.2,
    dailyDuesMultiplier: 1.3, // Elevated daily dues
    agileConceptTaught: 'Cost of Delay, Sustainable Pace & Economic Efficiency in Agile Systems',
    winConditionSummary: 'Amass at least $650 in settled bank funds by the end of Day 4 with at least 2 active booths.',
    lossConditionSummary: 'Bank funds fall below $0 after daily dues settlement (Bankruptcy) or failing to hit $650 by Day 5.',
    objectives: [
      {
        id: 'obj_funds_goal',
        label: 'Accumulate Settled Bank Treasury',
        target: 650,
        unit: '$',
        type: 'funds_target'
      },
      {
        id: 'obj_unlocked_runway',
        label: 'Sustain Active Unlocked Lanes',
        target: 2,
        unit: 'lanes',
        type: 'unlocked_lanes'
      },
      {
        id: 'obj_points_runway',
        label: 'Ship Total Story Points',
        target: 110,
        unit: 'pts',
        type: 'points_shipped'
      }
    ],
    events: [
      {
        id: 'runway_event_1',
        day: 2,
        timeFormatted: '10:00 AM',
        title: 'Municipal Infrastructure Tax Hike',
        message: 'The port authority has enacted an emergency maintenance levy. Keep high-efficiency tiers lean to protect your margin!',
        type: 'hazard',
        effectLabel: 'Daily taxes strictly enforced'
      },
      {
        id: 'runway_event_2',
        day: 3,
        timeFormatted: '02:00 PM',
        title: 'Enterprise Contract Disbursal',
        message: 'A Fortune 500 client shipped a high-toll enterprise feature batch! Massive escrow boost arriving.',
        type: 'boost',
        effectLabel: 'Enterprise toll cargo',
        spawnBurstPoints: [8, 5, 8]
      }
    ]
  }
];
