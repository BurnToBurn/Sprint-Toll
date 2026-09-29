import { AgileLesson } from '../types/game';

export const AGILE_LESSONS: AgileLesson[] = [
  {
    id: 'littles-law',
    title: "1. Little's Law & Queue Time",
    concept: 'Lead Time = Work In Progress (WIP) ÷ Throughput',
    summary:
      'In any queuing system, the average time a work item spends waiting (Lead Time) equals the number of items in progress divided by the delivery rate. When you stuff 20 stories into the queue without increasing processing capacity, everyone waits dramatically longer.',
    keyTakeaway:
      'To finish work faster, do NOT push more work into the system. Instead, limit WIP or increase station efficiency.',
    realWorldScenario:
      'When managers assign 15 tickets simultaneously to a 3-person team, cycle times explode from 3 days to 4 weeks due to queue waiting and context switching.',
    interactiveTip:
      'Watch the Cycle Time metric when you lower lane WIP limits: wait times drop even though the booths process at the same speed!'
  },
  {
    id: 'batch-size',
    title: '2. The Danger of Large Batch Sizes',
    concept: 'Vehicle Size = User Story Points = Processing Duration',
    summary:
      'Notice how 13-point semi-trucks and 21-point heavy haulers monopolize the toll booth for 15+ seconds while small 1-3 pt cars pile up behind them. In project management, massive monolith epics block releases and delay feedback loops.',
    keyTakeaway:
      'Slice oversized stories into small, vertical, independently deliverable user stories to keep the pipeline flowing.',
    realWorldScenario:
      'A team spending 3 months building a giant refactor cannot release bugfixes or simple features until the monolith clears QA.',
    interactiveTip:
      'Click the "Slice Story" button on large 8, 13, or 21 point vehicles to break them into agile 2-3 pt cars and watch queue congestion vanish!'
  },
  {
    id: 'wip-limits',
    title: '3. Kanban WIP Limits: Stop Starting, Start Finishing',
    concept: 'Enforcing Queue Capacities',
    summary:
      'WIP (Work In Progress) limits cap the maximum number of items allowed in a stage. If a toll lane reaches its WIP limit, upstream traffic is forced to pause or route elsewhere, preventing runaway bottlenecks.',
    keyTakeaway:
      'A team with 5 active tasks gets all 5 finished faster than a team with 20 half-started tasks bogged down in multitasking.',
    realWorldScenario:
      'Developers juggling 4 pull requests at once make 3x more merge conflicts and context-switching errors than focusing on one PR at a time.',
    interactiveTip:
      'Configure individual lane WIP limits in the Booth Settings to protect your squads from being overwhelmed.'
  },
  {
    id: 'classes-of-service',
    title: '4. Classes of Service & Expedite Lanes',
    concept: 'Hotfix Triage vs Standard Feature Lanes',
    summary:
      'Not all work items carry equal risk or priority. A critical production bug (1-point scooter) should never get stuck behind a 21-point heavy haul database migration.',
    keyTakeaway:
      'Use dedicated expedite lanes or swimlanes for urgent hotfixes so they bypass standard feature batch queues.',
    realWorldScenario:
      'A payment outage bug shouldn’t wait in a 2-week sprint backlog behind low-priority UI redesign tickets.',
    interactiveTip:
      'Designate one toll booth as "Small / Expedite Only" so 1-point hotfixes zoom straight to the ferry without delay!'
  },
  {
    id: 'experience-compounding',
    title: '5. Team Mastery & The Experience Multiplier',
    concept: 'Cross-Functional Seniority & Domain Knowledge',
    summary:
      'In this game, toll booths gain XP with every vehicle processed, raising their multiplier. In software development, teams that stay together and master their codebase build features with higher quality, fewer defects, and compounding velocity.',
    keyTakeaway:
      'Stable teams become exponentially more effective than frequently scrambled project squads.',
    realWorldScenario:
      'Constantly moving developers between disjointed projects resets their domain context, dropping team efficiency by up to 40%.',
    interactiveTip:
      'Level up your booths to see higher revenue multipliers per story point delivered!'
  },
  {
    id: 'continuous-delivery',
    title: '6. The Ferry Release: Batch vs Continuous Flow',
    concept: 'Sprint Cadence vs Continuous Delivery',
    summary:
      'The ferry represents a deployment release. Waiting for the ferry to fill up completely is like a 4-week release candidate: high batch risk. Deploying frequently with smaller loads lowers lead time and gets value to users faster.',
    keyTakeaway:
      'Smaller, more frequent deployments reduce blast radius and deliver value continuously.',
    realWorldScenario:
      'Releasing 5 small updates a week has near-zero downtime and instant rollbacks, compared to a terrifying once-a-quarter midnight deployment.',
    interactiveTip:
      'Try launching the ferry as soon as you have 20-30 points rather than waiting for max capacity to keep your cycle times lean!'
  }
];

export const STORY_TEMPLATES: Record<number, { titles: string[]; type: 'bug' | 'task' | 'story' | 'feature' | 'epic' | 'initiative' | 'monolith' }> = {
  1: {
    type: 'bug',
    titles: [
      'Hotfix: Null pointer on checkout button',
      'Patch: CSS overflow on mobile nav',
      'Bug: Fix typo in billing receipt email',
      'Hotfix: Broken link in documentation'
    ]
  },
  2: {
    type: 'task',
    titles: [
      'Task: Add tooltip hover to avatar',
      'Task: Update privacy policy link',
      'Task: Increase password minimum length',
      'Task: Add retry button on network error'
    ]
  },
  3: {
    type: 'story',
    titles: [
      'Story: User profile timezone setting',
      'Story: Export transaction history to CSV',
      'Story: Dark mode toggle in user settings',
      'Story: Keyboard navigation shortcuts'
    ]
  },
  5: {
    type: 'feature',
    titles: [
      'Feature: Stripe checkout & coupon codes',
      'Feature: Multi-column Kanban filter bar',
      'Feature: Real-time notification toaster',
      'Feature: Role-based permissions matrix'
    ]
  },
  8: {
    type: 'epic',
    titles: [
      'Epic: OAuth2 SSO integration (Google & GitHub)',
      'Epic: Multi-tenant database partitioning',
      'Epic: Automated invoice billing engine',
      'Epic: Full audit logging and compliance export'
    ]
  },
  13: {
    type: 'initiative',
    titles: [
      'Initiative: Legacy monolithic auth migration',
      'Initiative: Distributed real-time sync engine',
      'Initiative: Micro-frontend architecture rollout',
      'Initiative: Global multi-region edge cache'
    ]
  },
  21: {
    type: 'monolith',
    titles: [
      'Monolith: Rewrite entire backend in one go',
      'Monolith: Giant database migration & zero-downtime cutover',
      'Monolith: Complete UI framework replacement without slicing'
    ]
  }
};
