export interface ShipInfo {
  hullNumber: number; // 20 to 99
  name: string; // e.g. "S.S. Velocity"
  fullName: string; // e.g. "S.S. Velocity (Hull #20)"
  shortTag: string; // e.g. "VEL-20"
  classType: string; // e.g. "Continuous Flow Cruiser"
  motto: string;
}

export const SHIP_NAMES_LIST: ShipInfo[] = [
  { hullNumber: 20, name: "S.S. Velocity", fullName: "S.S. Velocity (Hull #20)", shortTag: "VEL-20", classType: "Continuous Flow Cruiser", motto: "Speed with Sustainable Cadence" },
  { hullNumber: 21, name: "M.V. Little's Law", fullName: "M.V. Little's Law (Hull #21)", shortTag: "LIT-21", classType: "Physics of Flow Vessel", motto: "Lead Time Governed by WIP" },
  { hullNumber: 22, name: "S.S. Continuous Flow", fullName: "S.S. Continuous Flow (Hull #22)", shortTag: "FLO-22", classType: "Non-Stop Release Carrier", motto: "Never Stop the Release Current" },
  { hullNumber: 23, name: "U.S.S. Kaizen", fullName: "U.S.S. Kaizen (Hull #23)", shortTag: "KAI-23", classType: "Process Evolution Flagship", motto: "Continuous Relentless Improvement" },
  { hullNumber: 24, name: "M.V. Kanban Wave", fullName: "M.V. Kanban Wave (Hull #24)", shortTag: "KAN-24", classType: "Visual Pull Ferry", motto: "Visualize Work, Limit In-Flight" },
  { hullNumber: 25, name: "S.S. Story Slice", fullName: "S.S. Story Slice (Hull #25)", shortTag: "SLI-25", classType: "Precision Slicing Cutter", motto: "Thin Vertical Slices to Production" },
  { hullNumber: 26, name: "M.V. Sprint Pioneer", fullName: "M.V. Sprint Pioneer (Hull #26)", shortTag: "PIO-26", classType: "Exploration Ferry", motto: "Charting Unknown Velocity Waters" },
  { hullNumber: 27, name: "S.S. Cadence Horizon", fullName: "S.S. Cadence Horizon (Hull #27)", shortTag: "CAD-27", classType: "Predictable Rhythmic Freighter", motto: "Predictable Heartbeat of Delivery" },
  { hullNumber: 28, name: "M.V. Throughput King", fullName: "M.V. Throughput King (Hull #28)", shortTag: "THR-28", classType: "High-Volume Release Barge", motto: "Maximizing Completed Stories" },
  { hullNumber: 29, name: "S.S. Backlog Voyager", fullName: "S.S. Backlog Voyager (Hull #29)", shortTag: "BAC-29", classType: "Priority Deep-Sea Navigator", motto: "Sailing Prioritized Seas" },
  { hullNumber: 30, name: "M.V. Daily Standup", fullName: "M.V. Daily Standup (Hull #30)", shortTag: "STA-30", classType: "Rapid Alignment Skiff", motto: "Align, Unblock, Deliver" },
  { hullNumber: 31, name: "S.S. Lead Time", fullName: "S.S. Lead Time (Hull #31)", shortTag: "LEA-31", classType: "End-to-End Speedster", motto: "From Inception to Live Harbor" },
  { hullNumber: 32, name: "M.V. Cycle Navigator", fullName: "M.V. Cycle Navigator (Hull #32)", shortTag: "CYC-32", classType: "Active Touch Ferry", motto: "Touch Time Over Queue Time" },
  { hullNumber: 33, name: "S.S. Retrospective", fullName: "S.S. Retrospective (Hull #33)", shortTag: "RET-33", classType: "Inspection & Adaptation Vessel", motto: "Inspect, Adapt, Triumph" },
  { hullNumber: 34, name: "M.V. Epic Slicer", fullName: "M.V. Epic Slicer (Hull #34)", shortTag: "EPI-34", classType: "Decomposition Icebreaker", motto: "Monoliths Into Manageable Crafts" },
  { hullNumber: 35, name: "S.S. Zero Bottleneck", fullName: "S.S. Zero Bottleneck (Hull #35)", shortTag: "BOT-35", classType: "Open-Channel Dredger", motto: "Smooth Flow Without Congestion" },
  { hullNumber: 36, name: "M.V. Agile Horizon", fullName: "M.V. Agile Horizon (Hull #36)", shortTag: "AGI-36", classType: "Adaptive Response Yacht", motto: "Responding to Changing Winds" },
  { hullNumber: 37, name: "S.S. Continuous Release", fullName: "S.S. Continuous Release (Hull #37)", shortTag: "REL-37", classType: "Automated Deployment Vessel", motto: "Production at the Touch of a Helm" },
  { hullNumber: 38, name: "M.V. Burn-up Clipper", fullName: "M.V. Burn-up Clipper (Hull #38)", shortTag: "BUR-38", classType: "Scope Tracking Clipper", motto: "Tracking Value Across the Waves" },
  { hullNumber: 39, name: "S.S. Swarm Cruiser", fullName: "S.S. Swarm Cruiser (Hull #39)", shortTag: "SWA-39", classType: "Collab Support Vessel", motto: "United Effort on Blocked Lanes" },
  { hullNumber: 40, name: "M.V. Definition of Done", fullName: "M.V. Definition of Done (Hull #40)", shortTag: "DON-40", classType: "Quality Guarantee Flagship", motto: "Tested, Verified, Shipped" },
  { hullNumber: 41, name: "S.S. Sprint Challenger", fullName: "S.S. Sprint Challenger (Hull #41)", shortTag: "CHA-41", classType: "High-Pressure Delivery Craft", motto: "Rising to Meet Any Daily Scope" },
  { hullNumber: 42, name: "M.V. Trunk Deliverer", fullName: "M.V. Trunk Deliverer (Hull #42)", shortTag: "TRU-42", classType: "Mainline Cargo Vessel", motto: "Mainline Merges Directly Ahead" },
  { hullNumber: 43, name: "S.S. Pipeline Carrier", fullName: "S.S. Pipeline Carrier (Hull #43)", shortTag: "PIP-43", classType: "Automated Harbor Conduits", motto: "Fast Automated Progression" },
  { hullNumber: 44, name: "M.V. Work In Progress", fullName: "M.V. Work In Progress (Hull #44)", shortTag: "WIP-44", classType: "Strict WIP Disciplinarian", motto: "Stop Starting, Start Finishing" },
  { hullNumber: 45, name: "S.S. Agile Odyssey", fullName: "S.S. Agile Odyssey (Hull #45)", shortTag: "ODY-45", classType: "Long-Range Value Vessel", motto: "Continuous Customer Delight" },
  { hullNumber: 46, name: "M.V. Feedback Loop", fullName: "M.V. Feedback Loop (Hull #46)", shortTag: "FEE-46", classType: "Rapid Telemetry Boat", motto: "Quick Cycles, Smart Pivots" },
  { hullNumber: 47, name: "S.S. Sprint Harbor", fullName: "S.S. Sprint Harbor (Hull #47)", shortTag: "SPR-47", classType: "Port Haven Ferry", motto: "Safe Haven for Deployed Stories" },
  { hullNumber: 48, name: "M.V. Kanban Sovereign", fullName: "M.V. Kanban Sovereign (Hull #48)", shortTag: "SOV-48", classType: "Self-Organizing Flagship", motto: "Empowered Lanes, Self-Organizing" },
  { hullNumber: 49, name: "S.S. Continuous Integration", fullName: "S.S. Continuous Integration (Hull #49)", shortTag: "INT-49", classType: "Sync Pipeline Vessel", motto: "Every Commit Floats Forward" },
  { hullNumber: 50, name: "M.V. Pair Programming", fullName: "M.V. Pair Programming (Hull #50)", shortTag: "PAI-50", classType: "Dual-Helm Speedboat", motto: "Two at the Helm, Clear Course" },
  { hullNumber: 51, name: "S.S. Feature Flag", fullName: "S.S. Feature Flag (Hull #51)", shortTag: "FLA-51", classType: "Stealth Toggle Vessel", motto: "Safely Decoupled Deployments" },
  { hullNumber: 52, name: "M.V. Fast Feedback", fullName: "M.V. Fast Feedback (Hull #52)", shortTag: "FAS-52", classType: "Sonar Signal Carrier", motto: "Immediate Signals from the Sea" },
  { hullNumber: 53, name: "S.S. Value Stream", fullName: "S.S. Value Stream (Hull #53)", shortTag: "VAL-53", classType: "Lean Optimization Vessel", motto: "Removing Waste, Amplifying Flow" },
  { hullNumber: 54, name: "M.V. Iteration Vanguard", fullName: "M.V. Iteration Vanguard (Hull #54)", shortTag: "ITE-54", classType: "Frontier Deployment Cruiser", motto: "Step by Step to Delivery" },
  { hullNumber: 55, name: "S.S. Production Release", fullName: "S.S. Production Release (Hull #55)", shortTag: "PRO-55", classType: "Live Environment Flagship", motto: "Live in the Real World" },
  { hullNumber: 56, name: "M.V. Huntington Express", fullName: "M.V. Huntington Express (Hull #56)", shortTag: "HUN-56", classType: "Financial Flow Liner", motto: "Solid Financial Engineering" },
  { hullNumber: 57, name: "S.S. Cross-Functional", fullName: "S.S. Cross-Functional (Hull #57)", shortTag: "CRO-57", classType: "Multi-Disciplinary Cutter", motto: "Autonomous Crew, Full Authority" },
  { hullNumber: 58, name: "M.V. Story Estimator", fullName: "M.V. Story Estimator (Hull #58)", shortTag: "EST-58", classType: "Relative Sizing Vessel", motto: "Fibonacci Points in Harmony" },
  { hullNumber: 59, name: "S.S. Cumulative Flow", fullName: "S.S. Cumulative Flow (Hull #59)", shortTag: "CUM-59", classType: "Flow Visualizer Ship", motto: "Smooth Bands Across the Chart" },
  { hullNumber: 60, name: "M.V. Release Train", fullName: "M.V. Release Train (Hull #60)", shortTag: "TRA-60", classType: "Synchronized Convoy", motto: "Departing on Fixed Schedule" },
  { hullNumber: 61, name: "S.S. Spike Explorer", fullName: "S.S. Spike Explorer (Hull #61)", shortTag: "SPI-61", classType: "Research Submersible", motto: "Probing Technical Unknowns" },
  { hullNumber: 62, name: "M.V. Takt Time", fullName: "M.V. Takt Time (Hull #62)", shortTag: "TAK-62", classType: "Metronome Rhythm Ship", motto: "Paced to Match Customer Demand" },
  { hullNumber: 63, name: "S.S. Minimum Viable", fullName: "S.S. Minimum Viable (Hull #63)", shortTag: "MIN-63", classType: "Lean Prototyper", motto: "Essential Value First" },
  { hullNumber: 64, name: "M.V. Pull System", fullName: "M.V. Pull System (Hull #64)", shortTag: "PUL-64", classType: "Demand-Driven Ferry", motto: "Downstream Pull Over Upstream Push" },
  { hullNumber: 65, name: "S.S. Kanban Constellation", fullName: "S.S. Kanban Constellation (Hull #65)", shortTag: "CON-65", classType: "Celestial Navigation Carrier", motto: "Guiding Light of Visual Work" },
  { hullNumber: 66, name: "M.V. Test Driven", fullName: "M.V. Test Driven (Hull #66)", shortTag: "TES-66", classType: "Verified Armor Vessel", motto: "Guaranteed Voyage Integrity" },
  { hullNumber: 67, name: "S.S. Continuous Delivery", fullName: "S.S. Continuous Delivery (Hull #67)", shortTag: "DEL-67", classType: "Continuous Value Hauler", motto: "Reliable Releases on Demand" },
  { hullNumber: 68, name: "M.V. Sprint Navigator", fullName: "M.V. Sprint Navigator (Hull #68)", shortTag: "NAV-68", classType: "Compass Delivery Cruiser", motto: "True North on the Backlog Compass" },
  { hullNumber: 69, name: "S.S. Agile Discovery", fullName: "S.S. Agile Discovery (Hull #69)", shortTag: "DIS-69", classType: "User Empathy Explorer", motto: "Uncovering True User Needs" },
  { hullNumber: 70, name: "M.V. Velocity Ranger", fullName: "M.V. Velocity Ranger (Hull #70)", shortTag: "RAN-70", classType: "Speed Patrol Cruiser", motto: "Stable Pace Across Any Storm" },
  { hullNumber: 71, name: "S.S. Flow Master", fullName: "S.S. Flow Master (Hull #71)", shortTag: "MAS-71", classType: "Tollway Clearance Vessel", motto: "Eliminating Roadway Queues" },
  { hullNumber: 72, name: "M.V. Sprint Albatross", fullName: "M.V. Sprint Albatross (Hull #72)", shortTag: "ALB-72", classType: "Long-Gliding Carrier", motto: "Gliding on Gentle Trade Winds" },
  { hullNumber: 73, name: "S.S. Ocean Retrospective", fullName: "S.S. Ocean Retrospective (Hull #73)", shortTag: "OCE-73", classType: "Wisdom Flagship", motto: "Wisdom From Every Voyage" },
  { hullNumber: 74, name: "M.V. Throughput Tide", fullName: "M.V. Throughput Tide (Hull #74)", shortTag: "TID-74", classType: "Tidal Surge Freighter", motto: "Unstoppable Flow of Value" },
  { hullNumber: 75, name: "S.S. Harbor Sentinel", fullName: "S.S. Harbor Sentinel (Hull #75)", shortTag: "SEN-75", classType: "Port Defender Flagship", motto: "Guarding the 5:00 PM Release" },
  { hullNumber: 76, name: "M.V. Story Maiden", fullName: "M.V. Story Maiden (Hull #76)", shortTag: "MAI-76", classType: "Agile Sloop", motto: "Lightweight Craft for Rapid Delivery" },
  { hullNumber: 77, name: "S.S. Release Corsair", fullName: "S.S. Release Corsair (Hull #77)", shortTag: "COR-77", classType: "Swift Delivery Frigate", motto: "Dashing Through the Harbor Fog" },
  { hullNumber: 78, name: "M.V. Lean Titan", fullName: "M.V. Lean Titan (Hull #78)", shortTag: "LEA-78", classType: "Heavy-Duty Flow Barge", motto: "Eliminating Queues at Scale" },
  { hullNumber: 79, name: "S.S. Continuous Mariner", fullName: "S.S. Continuous Mariner (Hull #79)", shortTag: "MAR-79", classType: "Endless Delivery Vessel", motto: "Endless Horizon of Shipments" },
  { hullNumber: 80, name: "M.V. Agile Monarch", fullName: "M.V. Agile Monarch (Hull #80)", shortTag: "MON-80", classType: "Royal Flow Sovereign", motto: "Ruler of Balanced WIP Limits" },
  { hullNumber: 81, name: "S.S. Kanban Breeze", fullName: "S.S. Kanban Breeze (Hull #81)", shortTag: "BRE-81", classType: "Smooth Air Passenger Ferry", motto: "Gentle Push, Steady Forward Motion" },
  { hullNumber: 82, name: "M.V. Scrum Horizon", fullName: "M.V. Scrum Horizon (Hull #82)", shortTag: "SCR-82", classType: "Sunrise Delivery Cutter", motto: "Daily Alignment on Open Water" },
  { hullNumber: 83, name: "S.S. Story Galleon", fullName: "S.S. Story Galleon (Hull #83)", shortTag: "GAL-83", classType: "Story Point Flagship", motto: "Treasure Trove of Delivered Value" },
  { hullNumber: 84, name: "M.V. Little's Sovereign", fullName: "M.V. Little's Sovereign (Hull #84)", shortTag: "SOV-84", classType: "Queueing Theory Flagship", motto: "The Mathematics of Agile Flow" },
  { hullNumber: 85, name: "S.S. Velocity Star", fullName: "S.S. Velocity Star (Hull #85)", shortTag: "STA-85", classType: "Speed Record Liner", motto: "Shining Bright on the Burndown" },
  { hullNumber: 86, name: "M.V. Epic Breaker", fullName: "M.V. Epic Breaker (Hull #86)", shortTag: "BRE-86", classType: "Feature Splitter Barge", motto: "Splitting Giants into Speedboats" },
  { hullNumber: 87, name: "S.S. Sprint Leviathan", fullName: "S.S. Sprint Leviathan (Hull #87)", shortTag: "LEV-87", classType: "Grand Fleet Flagship", motto: "Mighty Flagship of the Fleet" },
  { hullNumber: 88, name: "M.V. Flow Osprey", fullName: "M.V. Flow Osprey (Hull #88)", shortTag: "OSP-88", classType: "Swift Catch Cruiser", motto: "Precision Flight to Production" },
  { hullNumber: 89, name: "S.S. Continuous Pride", fullName: "S.S. Continuous Pride (Hull #89)", shortTag: "PRI-89", classType: "Pride of Huntington Harbor", motto: "Flawless Quality in Every Deployment" },
  { hullNumber: 90, name: "M.V. Backlog Admiral", fullName: "M.V. Backlog Admiral (Hull #90)", shortTag: "ADM-90", classType: "Strategic Fleet Command", motto: "Prioritizing the High Seas" },
  { hullNumber: 91, name: "S.S. WIP Defender", fullName: "S.S. WIP Defender (Hull #91)", shortTag: "DEF-91", classType: "Constraint Protection Cutter", motto: "Holding the Line on Congestion" },
  { hullNumber: 92, name: "M.V. Production Voyager", fullName: "M.V. Production Voyager (Hull #92)", shortTag: "VOY-92", classType: "Live Harbor Transport", motto: "Every Sprint Reaches the Shore" },
  { hullNumber: 93, name: "S.S. Lean Endeavour", fullName: "S.S. Lean Endeavour (Hull #93)", shortTag: "END-93", classType: "Waste Elimination Vessel", motto: "Maximizing Value with Minimal Waste" },
  { hullNumber: 94, name: "M.V. Agile Seeker", fullName: "M.V. Agile Seeker (Hull #94)", shortTag: "SEE-94", classType: "Course-Correction Cutter", motto: "Always Improving the Course" },
  { hullNumber: 95, name: "S.S. Harbor Venture", fullName: "S.S. Harbor Venture (Hull #95)", shortTag: "VEN-95", classType: "Municipal Delivery Cruiser", motto: "Bold Exploration of Flow Physics" },
  { hullNumber: 96, name: "M.V. Throughput Falcon", fullName: "M.V. Throughput Falcon (Hull #96)", shortTag: "FAL-96", classType: "Rapid Transit Ferry", motto: "Swift Delivery into Production" },
  { hullNumber: 97, name: "S.S. Continuous Vanguard", fullName: "S.S. Continuous Vanguard (Hull #97)", shortTag: "VAN-97", classType: "Release Vanguard Vessel", motto: "At the Forefront of Deployment" },
  { hullNumber: 98, name: "M.V. Velocity Empress", fullName: "M.V. Velocity Empress (Hull #98)", shortTag: "EMP-98", classType: "High-Cadence Flagship", motto: "Regal Mastery of Agile Delivery" },
  { hullNumber: 99, name: "S.S. Sprint Apex", fullName: "S.S. Sprint Apex (Hull #99)", shortTag: "APX-99", classType: "Ultimate Flow Vessel", motto: "Peak Flow, Zero Waste, Total Delivery" }
];

/**
 * Returns the designated ship for a user season.
 * Season 1 = Ship 20, Season 2 = Ship 21 ... Season 80 = Ship 99 (loops continuously).
 */
export function getShipForSeason(seasonNumber: number): ShipInfo {
  const safeSeason = Math.max(1, Math.floor(seasonNumber || 1));
  const index = (safeSeason - 1) % SHIP_NAMES_LIST.length;
  return SHIP_NAMES_LIST[index];
}

/**
 * Get ship by explicit hull number (20-99).
 */
export function getShipByHullNumber(hullNumber: number): ShipInfo {
  const found = SHIP_NAMES_LIST.find((s) => s.hullNumber === hullNumber);
  return found || SHIP_NAMES_LIST[0];
}
