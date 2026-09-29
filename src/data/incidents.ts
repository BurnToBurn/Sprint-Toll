import { BoothIncident, IncidentType, TollBooth } from '../types/game';

interface IncidentTemplate {
  type: IncidentType;
  title: string;
  description: string;
  duration: number; // in seconds
  quickFixCost: number; // in dollars
}

const INCIDENT_TEMPLATES: IncidentTemplate[] = [
  {
    type: 'flat_tire',
    title: 'Flat Tire Blockade',
    description: 'A courier van suffered a blown tire right before the barrier. Lane is physically blocked!',
    duration: 12,
    quickFixCost: 20
  },
  {
    type: 'breakdown',
    title: 'Barrier Gate Mechanical Jam',
    description: 'Electric actuator gear jammed; barrier arm cannot lift automatically.',
    duration: 15,
    quickFixCost: 25
  },
  {
    type: 'scanner_glitch',
    title: 'E-ZPass Scanner Crash',
    description: 'Optical transponder RFID receiver desynced and requires a full diagnostics reboot.',
    duration: 10,
    quickFixCost: 18
  },
  {
    type: 'spill_cleanup',
    title: 'Hydraulic Fluid Spill',
    description: 'Tractor trailer leaked slick fluid on roadway. Safety hazard requires crew absorbent.',
    duration: 14,
    quickFixCost: 22
  }
];

/**
 * Calculates turnaround cooldown timer duration between vehicles based on booth experience level.
 * Higher the experience level, the lower the time down to almost nothing.
 */
export function getBoothCooldownDuration(level: number): number {
  if (level >= 8) return 0.1;
  if (level === 7) return 0.2;
  if (level === 6) return 0.35;
  if (level === 5) return 0.6;
  if (level === 4) return 1.0;
  if (level === 3) return 1.6;
  if (level === 2) return 2.4;
  return 3.5; // Level 1 default
}

/**
 * Generates a random realistic incident for a toll booth.
 */
export function generateRandomBoothIncident(booth: TollBooth): BoothIncident {
  const template = INCIDENT_TEMPLATES[Math.floor(Math.random() * INCIDENT_TEMPLATES.length)];
  return {
    id: `inc-${booth.id}-${Date.now()}`,
    type: template.type,
    title: template.title,
    description: template.description,
    duration: template.duration,
    remaining: template.duration,
    quickFixCost: template.quickFixCost,
    startedAt: Date.now()
  };
}
