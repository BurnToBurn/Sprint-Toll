import { BacklogItem, StoryPoint, VehicleStory } from '../types/game';

export const BACKLOG_CATALOG: Omit<BacklogItem, 'id' | 'selected' | 'isCarryover'>[] = [
  // 1-Point Stories & Quick Bug Fixes
  {
    title: 'Fix Mobile Safari Viewport Overflow',
    points: 1,
    type: 'bug',
    businessValue: 15,
    priority: 'high',
    category: 'Frontend UX',
    description: 'Minor CSS touch action glitch causing horizontal jank on iOS mobile screens.'
  },
  {
    title: 'Rotate Stale CI/CD Production Secrets',
    points: 1,
    type: 'task',
    businessValue: 18,
    priority: 'critical',
    category: 'Security',
    description: 'Automated 90-day credential rotation for production AWS IAM service tokens.'
  },
  {
    title: 'Correct ISO-8601 Timestamp in Webhook Payload',
    points: 1,
    type: 'bug',
    businessValue: 14,
    priority: 'medium',
    category: 'Payment Gateway',
    description: 'Stripe webhook receiver expects UTC timestamps with Z suffix.'
  },
  {
    title: 'Update CDN Cache Invalidation Headers',
    points: 1,
    type: 'task',
    businessValue: 16,
    priority: 'low',
    category: 'Infrastructure',
    description: 'Set max-age and stale-while-revalidate policies on static JS bundles.'
  },

  // 2-Point Stories
  {
    title: 'Add JWT Expiry Refresh Interceptor',
    points: 2,
    type: 'story',
    businessValue: 28,
    priority: 'critical',
    category: 'Security',
    description: 'Transparently exchange expired access tokens before API requests fail with 401.'
  },
  {
    title: 'Sanitize User Search Input for SQL Characters',
    points: 2,
    type: 'bug',
    businessValue: 26,
    priority: 'high',
    category: 'Core API',
    description: 'Escape wildcard characters in toll search query parser.'
  },
  {
    title: 'Compress Harbor WebP Imagery',
    points: 2,
    type: 'task',
    businessValue: 22,
    priority: 'medium',
    category: 'Frontend UX',
    description: 'Reduce initial bundle footprint by serving lossless WebP dock illustrations.'
  },
  {
    title: 'Implement Payment Gateway Retry Jitter',
    points: 2,
    type: 'story',
    businessValue: 30,
    priority: 'high',
    category: 'Payment Gateway',
    description: 'Add randomized exponential backoff to handle transient banking timeouts.'
  },

  // 3-Point Stories
  {
    title: 'PostgreSQL Index Tuning for Toll Ledger',
    points: 3,
    type: 'story',
    businessValue: 45,
    priority: 'high',
    category: 'Infrastructure',
    description: 'Add composite indexes on booth_id and processed_at to accelerate reporting queries.'
  },
  {
    title: 'Stripe 3D-Secure 2.0 Frictionless Flow',
    points: 3,
    type: 'feature',
    businessValue: 50,
    priority: 'high',
    category: 'Payment Gateway',
    description: 'Support SCA compliant checkout authentication for high-volume corporate fleets.'
  },
  {
    title: 'Real-Time Telemetry Rollup WebSocket',
    points: 3,
    type: 'story',
    businessValue: 42,
    priority: 'medium',
    category: 'Core API',
    description: 'Stream live vehicle throughput and queue latencies to operations dashboard.'
  },
  {
    title: 'Zero-Downtime Database Migration Script',
    points: 3,
    type: 'task',
    businessValue: 46,
    priority: 'critical',
    category: 'Infrastructure',
    description: 'Dual-write shadow table schema migration for vehicle transaction logs.'
  },
  {
    title: 'Automated Dark Mode Accessibility Audit',
    points: 3,
    type: 'story',
    businessValue: 38,
    priority: 'low',
    category: 'Frontend UX',
    description: 'Enforce WCAG 2.1 AA 4.5:1 contrast ratios on booth HUD badges and status indicators.'
  },

  // 5-Point Stories
  {
    title: 'Kafka Consumer Partition Auto-Rebalance',
    points: 5,
    type: 'feature',
    businessValue: 75,
    priority: 'high',
    category: 'Infrastructure',
    description: 'Implement cooperative sticky rebalance protocol to eliminate queue processing freezes.'
  },
  {
    title: 'E-ZPass Multi-Tag Concurrent Reader Sync',
    points: 5,
    type: 'feature',
    businessValue: 80,
    priority: 'critical',
    category: 'Core API',
    description: 'Allow toll sensor gateways to multiplex high-speed transponder reads without drops.'
  },
  {
    title: 'GDPR Right-to-Erasure Pipeline',
    points: 5,
    type: 'feature',
    businessValue: 70,
    priority: 'medium',
    category: 'Compliance',
    description: 'Anonymize vehicle registration license plates and personal transit records on request.'
  },
  {
    title: 'Dynamic Surge Pricing Rate Calculation',
    points: 5,
    type: 'feature',
    businessValue: 85,
    priority: 'high',
    category: 'Payment Gateway',
    description: 'Algorithmic micro-toll pricing adjustments based on real-time highway congestion.'
  },

  // 8-Point Stories (Epics requiring decomposition or specialized lanes)
  {
    title: 'Multi-Region High Availability Failover',
    points: 8,
    type: 'epic',
    businessValue: 125,
    priority: 'critical',
    category: 'Infrastructure',
    description: 'Cross-cloud geo-redundancy ensuring zero toll lane outages during regional cloud downtime.'
  },
  {
    title: 'Automated Heavy Freight Axle Weight Profiler',
    points: 8,
    type: 'epic',
    businessValue: 135,
    priority: 'medium',
    category: 'Core API',
    description: 'In-road piezo-electric sensor integration measuring axle weight distribution in real-time.'
  },
  {
    title: 'Corporate Fleet Monthly Billing Subscriptions',
    points: 8,
    type: 'epic',
    businessValue: 130,
    priority: 'high',
    category: 'Payment Gateway',
    description: 'Unified billing portal for commercial freight carriers with volume discounts and ACH payout.'
  },

  // 13 & 21-Point Monoliths (Ideal candidates for Agile slicing)
  {
    title: 'Monolithic Legacy Clearing House Rewrite',
    points: 13,
    type: 'epic',
    businessValue: 210,
    priority: 'medium',
    category: 'Core API',
    description: 'Decompose 15-year-old COBOL toll reconciler into event-driven Go microservices.'
  },
  {
    title: 'Autonomous AI Traffic Orchestration Matrix',
    points: 21,
    type: 'epic',
    businessValue: 360,
    priority: 'low',
    category: 'Infrastructure',
    description: 'Deep neural network predictive routing for all municipal bridge & harbor approaches.'
  }
];

/**
 * Generates the Backlog for the upcoming Day / Sprint.
 * Carries over any unfinished stories from the previous day first.
 */
export function generateDailyBacklog(
  dayNumber: number,
  carryoverVehicles: VehicleStory[] = []
): BacklogItem[] {
  const items: BacklogItem[] = [];
  let nextId = 100 + (dayNumber - 1) * 20;

  // 1. Add carryover stories from yesterday (marked with high priority & carryover flag)
  carryoverVehicles.forEach((v) => {
    items.push({
      id: `BL-${nextId++}`,
      title: `[Carryover] ${v.title}`,
      points: v.points,
      type: v.type,
      businessValue: Math.round(v.tollValue * 1.15), // carryover urgency bonus
      priority: 'critical',
      category: 'Core API',
      description: `Carried over from Day #${dayNumber - 1}. Missed yesterday's ferry departure deadline!`,
      selected: true,
      isCarryover: true
    });
  });

  // 2. Select fresh catalog items based on day progression
  const catalogPool = [...BACKLOG_CATALOG];
  // Deterministic shuffle using dayNumber as seed
  for (let i = catalogPool.length - 1; i > 0; i--) {
    const j = (i * 7 + dayNumber * 13) % (i + 1);
    [catalogPool[i], catalogPool[j]] = [catalogPool[j], catalogPool[i]];
  }

  // Pick 10-14 candidate backlog items
  const countNeeded = Math.max(10, 14 - items.length);
  for (let i = 0; i < countNeeded && i < catalogPool.length; i++) {
    const raw = catalogPool[i];
    items.push({
      ...raw,
      id: `BL-${nextId++}`,
      selected: false,
      isCarryover: false
    });
  }

  return items;
}

/**
 * Pre-selects an optimal batch of backlog items to match the ferry dock capacity.
 * Follows Agile best practices: prioritize carryovers, critical bugs, high business value,
 * and caps total commitment to 85%-95% of capacity to prevent Little's Law congestion.
 */
export function preSelectOptimalBatch(
  items: BacklogItem[],
  targetCapacity: number
): BacklogItem[] {
  let currentPoints = 0;
  // Target 88% capacity to leave healthy slack
  const safeCapacity = Math.floor(targetCapacity * 0.9);

  // Score items by priority and point granularity (smaller points = higher flow safety)
  const priorityScore: Record<string, number> = {
    critical: 400,
    high: 300,
    medium: 200,
    low: 100
  };

  // Sort items: carryovers first, then by priority / point density
  const sorted = [...items].sort((a, b) => {
    if (a.isCarryover && !b.isCarryover) return -1;
    if (!a.isCarryover && b.isCarryover) return 1;

    const scoreA = (priorityScore[a.priority] || 100) + (a.businessValue / a.points) * 10;
    const scoreB = (priorityScore[b.priority] || 100) + (b.businessValue / b.points) * 10;
    return scoreB - scoreA;
  });

  const selectedIds = new Set<string>();

  // 1. Always select carryovers
  sorted.forEach((item) => {
    if (item.isCarryover) {
      selectedIds.add(item.id);
      currentPoints += item.points;
    }
  });

  // 2. Select additional items that fit nicely without overflowing
  sorted.forEach((item) => {
    if (selectedIds.has(item.id)) return;
    if (currentPoints + item.points <= targetCapacity) {
      // Don't commit monolithic 13+ pt stories by default unless high capacity
      if (item.points >= 13 && currentPoints + item.points > safeCapacity) {
        return;
      }
      selectedIds.add(item.id);
      currentPoints += item.points;
    }
  });

  return items.map((item) => ({
    ...item,
    selected: selectedIds.has(item.id)
  }));
}
