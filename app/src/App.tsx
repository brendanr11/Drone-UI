import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DroneHUD } from './components/DroneHUD';
import { MapViewUI } from './components/MapViewUI';
import type { Alert } from './components/AlertsPanel';
import { StudyControlPanel, type StudyModule } from './components/StudyControlPanel';
import { downloadTextFile, eventsToCsv, type TelemetryEvent } from './lib/telemetry';
import { droneMapPositions, initialPOIs } from './components/mapData';

// Combined drone data structure
export interface Drone {
  id: string; // Changed to string to support group-specific IDs like "1-1", "2-1", etc.
  name: string;
  altitude: number;
  battery: number;
  speed: number;
  connection: number; // 0-4 bars
  heading: number; // 0-360 degrees
  fpvView: string;
  groupId: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

// All drones organized by group
const allDrones: Drone[] = [
  // Group 1 - 8 drones
  { id: '1-1', name: 'Alpha 1', altitude: 145, battery: 89, speed: 42, connection: 4, heading: 45, groupId: 1, fpvView: 'https://images.unsplash.com/photo-1722590407833-7ed8b12d8298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBtb3VudGFpbiUyMHZpZXd8ZW58MXx8fHwxNzYzMzM4NTc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '1-2', name: 'Alpha 2', altitude: 132, battery: 67, speed: 38, connection: 3, heading: 180, groupId: 1, fpvView: 'https://images.unsplash.com/photo-1585644013005-a8028ecd0bb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBmb3Jlc3QlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYzMzM4NTc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '1-3', name: 'Alpha 3', altitude: 98, battery: 23, speed: 28, connection: 3, heading: 315, groupId: 1, fpvView: 'https://images.unsplash.com/photo-1614394535439-c9a5fd52995b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjb2FzdGxpbmUlMjBvY2VhbnxlbnwxfHx8fDE3NjMzMzg1NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '1-4', name: 'Alpha 4', altitude: 156, battery: 91, speed: 45, connection: 4, heading: 90, groupId: 1, fpvView: 'https://images.unsplash.com/photo-1758537944430-4616ea19e360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBkZXNlcnQlMjB0ZXJyYWlufGVufDF8fHx8MTc2MzMzODU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '1-5', name: 'Alpha 5', altitude: 120, battery: 77, speed: 36, connection: 3, heading: 225, groupId: 1, fpvView: 'https://images.unsplash.com/photo-1510330324285-abbdabff83af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBmYXJtbGFuZCUyMGZpZWxkc3xlbnwxfHx8fDE3NjMzMzg1NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '1-6', name: 'Alpha 6', altitude: 110, battery: 55, speed: 32, connection: 3, heading: 135, groupId: 1, fpvView: 'https://images.unsplash.com/photo-1730215584357-187f9b2ce83e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjByaXZlciUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjMzMzg1NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '1-7', name: 'Alpha 7', altitude: 140, battery: 82, speed: 40, connection: 4, heading: 270, groupId: 1, fpvView: 'https://images.unsplash.com/photo-1645976442917-c42644361fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBzbm93JTIwbW91bnRhaW5zfGVufDF8fHx8MTc2MzMzODU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '1-8', name: 'Alpha 8', altitude: 125, battery: 71, speed: 35, connection: 4, heading: 0, groupId: 1, fpvView: 'https://images.unsplash.com/photo-1650201777831-8c5c23a2b41e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjB2YWxsZXklMjB2aWV3fGVufDF8fHx8MTc2MzMzODU3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Group 2 - 4 drones
  { id: '2-1', name: 'Bravo 1', altitude: 165, battery: 94, speed: 48, connection: 4, heading: 60, groupId: 2, fpvView: 'https://images.unsplash.com/photo-1544332288-bf4cc86e0919?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBoaWxscyUyMHRlcnJhaW58ZW58MXx8fHwxNzYzMzM4NTc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '2-2', name: 'Bravo 2', altitude: 148, battery: 78, speed: 44, connection: 3, heading: 195, groupId: 2, fpvView: 'https://images.unsplash.com/photo-1669830239229-b84d3c4c5f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBsYWtlJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MzMzODU3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '2-3', name: 'Bravo 3', altitude: 112, battery: 62, speed: 39, connection: 3, heading: 330, groupId: 2, fpvView: 'https://images.unsplash.com/photo-1759322630977-3e06451664c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBwbGF0ZWF1JTIwdGVycmFpbnxlbnwxfHx8fDE3NjMzMzg1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '2-4', name: 'Bravo 4', altitude: 135, battery: 85, speed: 41, connection: 4, heading: 105, groupId: 2, fpvView: 'https://images.unsplash.com/photo-1762853785786-307e53452686?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjbGlmZiUyMGNvYXN0fGVufDF8fHx8MTc2MzMzODU3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Group 3 - 3 drones
  { id: '3-1', name: 'Charlie 1', altitude: 152, battery: 88, speed: 43, connection: 4, heading: 75, groupId: 3, fpvView: 'https://images.unsplash.com/photo-1681486648892-f6d1d3615a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjYW55b24lMjB2aWV3fGVufDF8fHx8MTc2MzMzODU3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '3-2', name: 'Charlie 2', altitude: 128, battery: 69, speed: 37, connection: 3, heading: 210, groupId: 3, fpvView: 'https://images.unsplash.com/photo-1584837443681-2e908daf1450?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBwbGFpbnMlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYzMzM4NTc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '3-3', name: 'Charlie 3', altitude: 105, battery: 51, speed: 31, connection: 3, heading: 345, groupId: 3, fpvView: 'https://images.unsplash.com/photo-1722590407833-7ed8b12d8298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBtb3VudGFpbiUyMHZpZXd8ZW58MXx8fHwxNzYzMzM4NTc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Group 4 - 3 drones
  { id: '4-1', name: 'Echo 1', altitude: 138, battery: 86, speed: 41, connection: 4, heading: 120, groupId: 4, fpvView: 'https://images.unsplash.com/photo-1669830239229-b84d3c4c5f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBsYWtlJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc2MzMzODU3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '4-2', name: 'Echo 2', altitude: 162, battery: 74, speed: 44, connection: 3, heading: 255, groupId: 4, fpvView: 'https://images.unsplash.com/photo-1650201777831-8c5c23a2b41e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjB2YWxsZXklMjB2aWV3fGVufDF8fHx8MTc2MzMzODU3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '4-3', name: 'Echo 3', altitude: 114, battery: 58, speed: 34, connection: 3, heading: 15, groupId: 4, fpvView: 'https://images.unsplash.com/photo-1758537944430-4616ea19e360?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBkZXNlcnQlMjB0ZXJyYWlufGVufDF8fHx8MTc2MzMzODU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Group 5 - 3 drones
  { id: '5-1', name: 'Foxtrot 1', altitude: 149, battery: 92, speed: 47, connection: 4, heading: 150, groupId: 5, fpvView: 'https://images.unsplash.com/photo-1730215584357-187f9b2ce83e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjByaXZlciUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjMzMzg1NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '5-2', name: 'Foxtrot 2', altitude: 133, battery: 68, speed: 39, connection: 3, heading: 285, groupId: 5, fpvView: 'https://images.unsplash.com/photo-1645976442917-c42644361fbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBzbm93JTIwbW91bnRhaW5zfGVufDF8fHx8MTc2MzMzODU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '5-3', name: 'Foxtrot 3', altitude: 108, battery: 53, speed: 30, connection: 3, heading: 60, groupId: 5, fpvView: 'https://images.unsplash.com/photo-1544332288-bf4cc86e0919?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBoaWxscyUyMHRlcnJhaW58ZW58MXx8fHwxNzYzMzM4NTc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Group 6 - 3 drones
  { id: '6-1', name: 'Golf 1', altitude: 155, battery: 90, speed: 46, connection: 4, heading: 205, groupId: 6, fpvView: 'https://images.unsplash.com/photo-1762853785786-307e53452686?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjbGlmZiUyMGNvYXN0fGVufDF8fHx8MTc2MzMzODU3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '6-2', name: 'Golf 2', altitude: 127, battery: 66, speed: 37, connection: 3, heading: 340, groupId: 6, fpvView: 'https://images.unsplash.com/photo-1681486648892-f6d1d3615a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjYW55b24lMjB2aWV3fGVufDF8fHx8MTc2MzMzODU3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '6-3', name: 'Golf 3', altitude: 141, battery: 80, speed: 42, connection: 4, heading: 100, groupId: 6, fpvView: 'https://images.unsplash.com/photo-1759322630977-3e06451664c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBwbGF0ZWF1JTIwdGVycmFpbnxlbnwxfHx8fDE3NjMzMzg1Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  
  // Group 7 - 3 drones
  { id: '7-1', name: 'Delta 1', altitude: 172, battery: 96, speed: 50, connection: 4, heading: 30, groupId: 7, fpvView: 'https://images.unsplash.com/photo-1585644013005-a8028ecd0bb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBmb3Jlc3QlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzYzMzM4NTc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '7-2', name: 'Delta 2', altitude: 158, battery: 81, speed: 46, connection: 4, heading: 165, groupId: 7, fpvView: 'https://images.unsplash.com/photo-1614394535439-c9a5fd52995b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBjb2FzdGxpbmUlMjBvY2VhbnxlbnwxfHx8fDE3NjMzMzg1NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
  { id: '7-3', name: 'Delta 3', altitude: 142, battery: 73, speed: 42, connection: 3, heading: 285, groupId: 7, fpvView: 'https://images.unsplash.com/photo-1510330324285-abbdabff83af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBmYXJtbGFuZCUyMGZpZWxkc3xlbnwxfHx8fDE3NjMzMzg1NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
];

type ViewMode = 'FPV' | 'MAP';
type GroupId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type ControlGroups = Record<GroupId, string[]>;
const groupIds = [1, 2, 3, 4, 5, 6, 7] as const;

interface MapCameraState {
  pan: { x: number; y: number };
  zoom: number;
}

interface AlertFocusRequest {
  requestId: number;
  alertId: number;
  x: number;
  y: number;
  zoom?: number;
}

interface ActiveTaskMetrics {
  taskId: string;
  module: StudyModule;
  condition: 'A' | 'B';
  startedAt: number;
  interactionCount: number;
  wrongTargetAssignments: number;
  correctTargetAssignments: number;
  controlIncorrectTapCount: number;
  controlNonTargetTapCount: number;
  controlDroneTapCount: number;
  controlBackgroundTapCount: number;
  controlRoleSwitchCount: number;
  alertResponseTimesMs: number[];
  minimapAckTimesMs: number[];
  distanceSamples: number;
  nearestDistanceKm: number | null;
  farthestDistanceKm: number | null;
  overshootCount: number;
  previousDistanceKm: number | null;
}

interface LastTaskSummary {
  module: StudyModule;
  condition: 'A' | 'B';
  outcome: 'complete' | 'fail';
  durationMs: number | null;
  interactions: number;
  controlCorrectCount: number;
  controlWrongCount: number;
  controlIncorrectTapCount: number;
  alertsHandled: number;
  minimapAcks: number;
  timestamp: number;
}

interface ControlTargetGoal {
  groupId: 1 | 2 | 3;
  label: string;
  targetId: string;
  targetName: string;
}

const controlTargetGoals: ControlTargetGoal[] = [
  { groupId: 1, label: 'Recon', targetId: '4', targetName: 'Target Alpha' },
  { groupId: 2, label: 'Relay', targetId: '6', targetName: 'Target Bravo' },
  { groupId: 3, label: 'Delivery', targetId: '7', targetName: 'Target Charlie' },
];

const alertTemplateSpecs = [
  {
    templateId: 'battery-critical',
    type: 'warning' as const,
    message: (droneLabel: string) => `Critical battery warning: ${droneLabel}`,
    details: 'This drone battery is under 25%. Acknowledge, inspect status, and retask immediately.',
  },
  {
    templateId: 'sensor-anomaly',
    type: 'info' as const,
    message: (droneLabel: string) => `Sensor anomaly detected near ${droneLabel}`,
    details: 'Check this drone telemetry feed, validate marker, then return to previous task.',
  },
  {
    templateId: 'mission-retask',
    type: 'success' as const,
    message: (droneLabel: string) => `Retask update available for ${droneLabel}`,
    details: 'Jump to this event, confirm route update for that drone, then quick-back to continue.',
  },
];

const alertDronePool = [
  { id: '1-3', name: 'Alpha 3' },
  { id: '2-2', name: 'Bravo 2' },
  { id: '3-1', name: 'Charlie 1' },
  { id: '4-2', name: 'Echo 2' },
  { id: '5-1', name: 'Foxtrot 1' },
  { id: '6-2', name: 'Golf 2' },
  { id: '7-3', name: 'Delta 3' },
];

const buildAlertBatch = (batchId: number): Alert[] => {
  const now = Date.now();
  return alertTemplateSpecs.map((template, index) => {
    const drone = alertDronePool[(batchId + index) % alertDronePool.length];
    const droneLabel = `Drone ${drone.id} (${drone.name})`;
    const mapPosition = droneMapPositions[drone.id] || { x: 50, y: 50 };
    return {
      id: batchId * 100 + index + 1,
      type: template.type,
      message: template.message(droneLabel),
      time: 'just now',
      details: `${template.details} (Scenario ${batchId})`,
      mapX: mapPosition.x,
      mapY: mapPosition.y,
      locationLabel: droneLabel,
      createdAt: now,
      batchId,
      templateId: template.templateId,
    };
  });
};

const buildInitialControlGroups = (): ControlGroups => {
  const groups = {} as ControlGroups;

  groupIds.forEach((groupId) => {
    groups[groupId] = allDrones
      .filter((drone) => drone.groupId === groupId)
      .map((drone) => drone.id);
  });

  return groups;
};

function generateClusterOffsets(count: number): Array<{ x: number; y: number }> {
  if (count === 0) return [];
  if (count === 1) return [{ x: 0, y: 0 }];
  const spacing = 3;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  return Array.from({ length: count }, (_, i) => ({
    x: (i % cols - (cols - 1) / 2) * spacing,
    y: (Math.floor(i / cols) - (rows - 1) / 2) * spacing,
  }));
}

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('FPV');
  const [selectedGroup, setSelectedGroup] = useState<GroupId>(1);
  const [selectedDroneId, setSelectedDroneId] = useState<string>('1-5');
  const [controlTaskActiveGroupId, setControlTaskActiveGroupId] = useState<1 | 2 | 3>(1);
  const [controlGroups, setControlGroups] = useState<ControlGroups>(() => buildInitialControlGroups());
  const [isGroupEditMode, setIsGroupEditMode] = useState(false);
  const [alertBatchId, setAlertBatchId] = useState(1);
  const [alerts, setAlerts] = useState<Alert[]>(() => buildAlertBatch(1));
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [returnContext, setReturnContext] = useState<{
    viewMode: ViewMode;
    droneId: string;
    alertId: number;
    jumpedAt: number;
    mapCameraBeforeJump: MapCameraState | null;
  } | null>(null);
  const [mapCamera, setMapCamera] = useState<MapCameraState>({
    pan: { x: 0, y: 0 },
    zoom: 1,
  });
  const [alertFocusRequest, setAlertFocusRequest] = useState<AlertFocusRequest | null>(null);
  const [cameraRestoreRequest, setCameraRestoreRequest] = useState<{
    requestId: number;
    pan: { x: number; y: number };
    zoom: number;
  } | null>(null);
  const [groupTargetAssignments, setGroupTargetAssignments] = useState<Partial<Record<GroupId, string>>>({});
  const [latestDistanceToTargetKm, setLatestDistanceToTargetKm] = useState<number | null>(null);
  const [minimapStatusSignalVisible, setMinimapStatusSignalVisible] = useState(false);
  const [minimapStatusAppearedAt, setMinimapStatusAppearedAt] = useState<number | null>(null);
  const [minimapStatusId, setMinimapStatusId] = useState(0);
  const [scenarioResetCount, setScenarioResetCount] = useState(0);
  const [dronePositions, setDronePositions] = useState<Record<string, { x: number; y: number }>>(() => ({ ...droneMapPositions }));
  const [moveMode, setMoveMode] = useState<'idle' | 'drone' | 'group'>('idle');
  const [movePending, setMovePending] = useState<{ x: number; y: number } | null>(null);
  const [visitedAlertIds, setVisitedAlertIds] = useState<Set<number>>(new Set());

  const [sessionId] = useState(
    () => `session-${new Date().toISOString().replace(/[:.]/g, '-')}`
  );
  const [participantId, setParticipantId] = useState('');
  const [studyModule, setStudyModule] = useState<StudyModule>('control-groups');
  const [studyCondition, setStudyCondition] = useState<'A' | 'B'>('A');
  const [taskStartAt, setTaskStartAt] = useState<number | null>(null);
  const [eventLog, setEventLog] = useState<TelemetryEvent[]>([]);
  const [lastTaskSummary, setLastTaskSummary] = useState<LastTaskSummary | null>(null);
  const activeTaskRef = useRef<ActiveTaskMetrics | null>(null);
  const alertBatchCounterRef = useRef(1);
  const minimapStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minimapStatusIdRef = useRef(0);
  const alertFocusRequestIdRef = useRef(0);
  const cameraRestoreRequestIdRef = useRef(0);
  const controlGoalsCompleteRef = useRef(false);

  const dronesById = useMemo(
    () => new Map(allDrones.map((drone) => [drone.id, drone])),
    []
  );

  const trackEvent = useCallback(
    (eventName: string, details: Record<string, unknown> = {}) => {
      const event: TelemetryEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        sessionId,
        participantId: participantId.trim() || 'unassigned',
        module: studyModule,
        condition: studyCondition,
        viewMode,
        selectedGroup,
        eventName,
        details: JSON.stringify(details),
      };

      setEventLog((prev) => [...prev, event]);
    },
    [participantId, selectedGroup, sessionId, studyCondition, studyModule, viewMode]
  );

  const bumpInteractionCount = useCallback(() => {
    if (activeTaskRef.current) {
      activeTaskRef.current.interactionCount += 1;
    }
  }, []);

  const clearMinimapStatusTimer = useCallback(() => {
    if (minimapStatusTimerRef.current) {
      clearTimeout(minimapStatusTimerRef.current);
      minimapStatusTimerRef.current = null;
    }
  }, []);

  const scheduleMinimapStatusSignal = useCallback(
    (reason: 'reset' | 'task_start' | 'manual') => {
      clearMinimapStatusTimer();
      const delayMs = reason === 'manual' ? 250 : 3500 + (scenarioResetCount % 3) * 1000;
      minimapStatusTimerRef.current = setTimeout(() => {
        minimapStatusIdRef.current += 1;
        const signalId = minimapStatusIdRef.current;
        const appearedAt = Date.now();
        setMinimapStatusId(signalId);
        setMinimapStatusAppearedAt(appearedAt);
        setMinimapStatusSignalVisible(true);
        trackEvent('minimap_status_presented', { signalId, reason });
      }, delayMs);
      trackEvent('minimap_status_scheduled', { reason, delayMs });
    },
    [clearMinimapStatusTimer, scenarioResetCount, trackEvent]
  );

  const resetModuleScenario = useCallback(
    (reason: 'manual' | 'task_start') => {
      setScenarioResetCount((prev) => prev + 1);
      setAlertFocusRequest(null);
      setCameraRestoreRequest(null);

      if (studyModule === 'control-groups') {
        const resetGroups = buildInitialControlGroups();
        setControlGroups(resetGroups);
        setIsGroupEditMode(false);
        setGroupTargetAssignments({});
        setLatestDistanceToTargetKm(null);
        setControlTaskActiveGroupId(1);
        setSelectedGroup(1);
        if (resetGroups[1].length > 0) {
          setSelectedDroneId(resetGroups[1][0]);
        }
        controlGoalsCompleteRef.current = false;
        setDronePositions({ ...droneMapPositions });
        setMoveMode('idle');
        setMovePending(null);
        trackEvent('control_groups_scenario_reset', { reason });
        if (activeTaskRef.current?.module === 'control-groups') {
          activeTaskRef.current.correctTargetAssignments = 0;
          activeTaskRef.current.wrongTargetAssignments = 0;
          activeTaskRef.current.controlIncorrectTapCount = 0;
          activeTaskRef.current.controlNonTargetTapCount = 0;
          activeTaskRef.current.controlDroneTapCount = 0;
          activeTaskRef.current.controlBackgroundTapCount = 0;
          activeTaskRef.current.controlRoleSwitchCount = 0;
        }
      }

      if (studyModule === 'alerts') {
        const nextBatchId = alertBatchCounterRef.current + 1;
        alertBatchCounterRef.current = nextBatchId;
        setAlertBatchId(nextBatchId);
        const nextAlerts = buildAlertBatch(nextBatchId);
        setAlerts(nextAlerts);
        setExpandedAlert(null);
        setReturnContext(null);
        setVisitedAlertIds(new Set());
        trackEvent('alert_batch_generated', {
          reason,
          batchId: nextBatchId,
          alertIds: nextAlerts.map((alert) => alert.id),
          severities: nextAlerts.map((alert) => alert.type),
        });
        if (activeTaskRef.current?.module === 'alerts') {
          activeTaskRef.current.alertResponseTimesMs = [];
        }
      }

      if (studyModule === 'minimap') {
        setMinimapStatusSignalVisible(false);
        setMinimapStatusAppearedAt(null);
        scheduleMinimapStatusSignal(reason);
        if (activeTaskRef.current?.module === 'minimap') {
          activeTaskRef.current.minimapAckTimesMs = [];
        }
      } else {
        clearMinimapStatusTimer();
      }

      trackEvent('module_scenario_reset', {
        module: studyModule,
        condition: studyCondition,
        reason,
      });
    },
    [clearMinimapStatusTimer, scheduleMinimapStatusSignal, studyCondition, studyModule, trackEvent]
  );

  useEffect(() => {
    return () => {
      clearMinimapStatusTimer();
    };
  }, [clearMinimapStatusTimer]);

  const getGroupDrones = useCallback(
    (groupId: GroupId) => {
      const droneIds = controlGroups[groupId] || [];
      return droneIds
        .map((droneId) => dronesById.get(droneId))
        .filter((drone): drone is Drone => Boolean(drone));
    },
    [controlGroups, dronesById]
  );

  const selectedGroupDroneIds = controlGroups[selectedGroup] || [];
  const selectedGroupDrones = getGroupDrones(selectedGroup);
  const selectedDrone =
    dronesById.get(selectedDroneId) || selectedGroupDrones[0] || allDrones[0];
  const isTaskActive = taskStartAt !== null;
  const isControlTaskActive = isTaskActive && studyModule === 'control-groups';
  const isSavedGroupFeatureEnabled = !(studyModule === 'control-groups' && studyCondition === 'B');
  const isAlertJumpEnabled = !(studyModule === 'alerts' && studyCondition === 'B');
  const mapRotationDeg =
    studyModule === 'minimap' && studyCondition === 'B' ? -selectedDrone.heading : 0;

  const handleSelectDrone = (droneId: string, source = 'select') => {
    setSelectedDroneId(droneId);
    bumpInteractionCount();
    trackEvent('drone_selected', { droneId, source });
  };

  const handleGroupChange = (groupId: GroupId) => {
    const targetGroupIds = controlGroups[groupId] || [];
    setSelectedGroup(groupId);

    if (targetGroupIds.length > 0 && !targetGroupIds.includes(selectedDroneId)) {
      setSelectedDroneId(targetGroupIds[0]);
    }

    bumpInteractionCount();
    trackEvent('group_selected', { groupId });

    if (isControlTaskActive && (groupId === 1 || groupId === 2 || groupId === 3)) {
      setControlTaskActiveGroupId(groupId);
      trackEvent('control_task_group_selected', {
        groupId,
        source: 'status_panel',
      });
      if (activeTaskRef.current?.module === 'control-groups') {
        activeTaskRef.current.controlRoleSwitchCount += 1;
      }
    }
  };

  const handleEnterGroupEditMode = (groupId: GroupId) => {
    if (!isSavedGroupFeatureEnabled) {
      bumpInteractionCount();
      trackEvent('group_edit_mode_blocked', {
        groupId,
        reason: 'condition_b_baseline',
      });
      return;
    }

    setSelectedGroup(groupId);
    setIsGroupEditMode(true);
    bumpInteractionCount();
    trackEvent('group_edit_mode_entered', { groupId, source: 'long_press' });
  };

  const handleExitGroupEditMode = () => {
    if (!isGroupEditMode) return;
    setIsGroupEditMode(false);
    bumpInteractionCount();
    trackEvent('group_edit_mode_exited', { groupId: selectedGroup });
  };

  const handleToggleDroneInSelectedGroup = (droneId: string) => {
    if (!isSavedGroupFeatureEnabled) {
      bumpInteractionCount();
      trackEvent('group_member_edit_blocked', {
        groupId: selectedGroup,
        droneId,
        reason: 'condition_b_baseline',
      });
      return;
    }

    const currentMembers = controlGroups[selectedGroup] || [];
    const isMember = currentMembers.includes(droneId);
    const nextMembers = isMember
      ? currentMembers.filter((id) => id !== droneId)
      : [...currentMembers, droneId];

    setControlGroups((prev) => ({
      ...prev,
      [selectedGroup]: nextMembers,
    }));

    if (isMember && selectedDroneId === droneId && nextMembers.length > 0) {
      setSelectedDroneId(nextMembers[0]);
    }

    bumpInteractionCount();
    trackEvent(isMember ? 'group_member_removed' : 'group_member_added', {
      groupId: selectedGroup,
      droneId,
      source: 'tap',
      groupSize: nextMembers.length,
    });
  };

  const handleAddDronesToSelectedGroup = (droneIds: string[]) => {
    if (droneIds.length === 0) return;
    if (!isSavedGroupFeatureEnabled) {
      bumpInteractionCount();
      trackEvent('group_members_added_box_blocked', {
        groupId: selectedGroup,
        attemptedCount: droneIds.length,
        reason: 'condition_b_baseline',
      });
      return;
    }

    const currentMembers = controlGroups[selectedGroup] || [];
    const uniqueDroneIds = droneIds.filter((droneId) => !currentMembers.includes(droneId));

    if (uniqueDroneIds.length === 0) {
      bumpInteractionCount();
      trackEvent('group_members_added_box', {
        groupId: selectedGroup,
        addedCount: 0,
        attemptedCount: droneIds.length,
      });
      return;
    }

    const nextMembers = [...currentMembers, ...uniqueDroneIds];
    setControlGroups((prev) => ({
      ...prev,
      [selectedGroup]: nextMembers,
    }));

    bumpInteractionCount();
    trackEvent('group_members_added_box', {
      groupId: selectedGroup,
      addedDroneIds: uniqueDroneIds,
      addedCount: uniqueDroneIds.length,
      groupSize: nextMembers.length,
    });
  };

  const selectControlTaskGroup = useCallback(
    (groupId: 1 | 2 | 3, source: 'task_overlay' | 'auto_advance') => {
      const targetGroupIds = controlGroups[groupId] || [];
      setControlTaskActiveGroupId(groupId);
      setSelectedGroup(groupId);
      if (targetGroupIds.length > 0 && !targetGroupIds.includes(selectedDroneId)) {
        setSelectedDroneId(targetGroupIds[0]);
      }

      trackEvent('control_task_group_selected', { groupId, source });
      if (source === 'task_overlay') {
        bumpInteractionCount();
        if (activeTaskRef.current?.module === 'control-groups') {
          activeTaskRef.current.controlRoleSwitchCount += 1;
        }
      }
    },
    [bumpInteractionCount, controlGroups, selectedDroneId, trackEvent]
  );

  const handleSelectControlTaskGroup = useCallback(
    (groupId: 1 | 2 | 3) => {
      selectControlTaskGroup(groupId, 'task_overlay');
    },
    [selectControlTaskGroup]
  );

  const handleAssignSelectedGroupToTarget = useCallback(
    (target: { id: string; name: string; type: 'waypoint' | 'home' | 'target' }) => {
      if (target.type !== 'target') {
        return;
      }

      const assignmentGroupId: GroupId = isControlTaskActive
        ? controlTaskActiveGroupId
        : selectedGroup;

      bumpInteractionCount();
      setGroupTargetAssignments((prev) => {
        const currentlyAssigned = prev[assignmentGroupId];
        const nextAssignments = { ...prev };
        let assignedTargetId: string | null = target.id;

        if (currentlyAssigned === target.id) {
          delete nextAssignments[assignmentGroupId];
          assignedTargetId = null;
        } else {
          nextAssignments[assignmentGroupId] = target.id;
        }

        const goal = controlTargetGoals.find((spec) => spec.groupId === assignmentGroupId);
        const isCorrect = assignedTargetId !== null && goal?.targetId === assignedTargetId;

        if (assignedTargetId === null) {
          trackEvent('group_target_unassigned', {
            groupId: assignmentGroupId,
            targetId: target.id,
            targetName: target.name,
          });
        } else {
          trackEvent('group_target_assigned', {
            groupId: assignmentGroupId,
            targetId: target.id,
            targetName: target.name,
            expectedTargetId: goal?.targetId ?? null,
            isCorrect,
          });
        }

        if (activeTaskRef.current?.module === 'control-groups') {
          if (assignedTargetId === null) {
            activeTaskRef.current.controlIncorrectTapCount += 1;
          } else if (isCorrect) {
            activeTaskRef.current.correctTargetAssignments += 1;
          } else {
            activeTaskRef.current.wrongTargetAssignments += 1;
            activeTaskRef.current.controlIncorrectTapCount += 1;
          }
        }

        const allGoalsSatisfied = controlTargetGoals.every(
          (spec) => nextAssignments[spec.groupId] === spec.targetId
        );
        if (allGoalsSatisfied && !controlGoalsCompleteRef.current) {
          controlGoalsCompleteRef.current = true;
          trackEvent('control_groups_goal_completed', {
            assignments: controlTargetGoals.map((spec) => ({
              groupId: spec.groupId,
              expectedTargetId: spec.targetId,
              assignedTargetId: nextAssignments[spec.groupId] ?? null,
            })),
          });
        }

        if (!allGoalsSatisfied) {
          controlGoalsCompleteRef.current = false;
        }

        if (
          isControlTaskActive &&
          isCorrect &&
          assignedTargetId !== null
        ) {
          const nextPendingGoal = controlTargetGoals.find(
            (spec) => nextAssignments[spec.groupId] !== spec.targetId
          );
          if (nextPendingGoal && nextPendingGoal.groupId !== controlTaskActiveGroupId) {
            selectControlTaskGroup(nextPendingGoal.groupId, 'auto_advance');
          }
        }

        return nextAssignments;
      });
    },
    [
      bumpInteractionCount,
      controlTaskActiveGroupId,
      isControlTaskActive,
      selectControlTaskGroup,
      selectedGroup,
      trackEvent,
    ]
  );

  const handleDistanceToTargetChange = useCallback((distanceToTargetKm: number | null) => {
    setLatestDistanceToTargetKm(distanceToTargetKm);
    if (!activeTaskRef.current || distanceToTargetKm === null) {
      return;
    }

    activeTaskRef.current.distanceSamples += 1;
    if (
      activeTaskRef.current.nearestDistanceKm === null ||
      distanceToTargetKm < activeTaskRef.current.nearestDistanceKm
    ) {
      activeTaskRef.current.nearestDistanceKm = distanceToTargetKm;
    }
    if (
      activeTaskRef.current.farthestDistanceKm === null ||
      distanceToTargetKm > activeTaskRef.current.farthestDistanceKm
    ) {
      activeTaskRef.current.farthestDistanceKm = distanceToTargetKm;
    }
    if (
      activeTaskRef.current.previousDistanceKm !== null &&
      distanceToTargetKm > activeTaskRef.current.previousDistanceKm + 0.4
    ) {
      activeTaskRef.current.overshootCount += 1;
      trackEvent('distance_overshoot_detected', {
        previousDistanceKm: activeTaskRef.current.previousDistanceKm,
        currentDistanceKm: distanceToTargetKm,
      });
    }
    activeTaskRef.current.previousDistanceKm = distanceToTargetKm;
  }, [trackEvent]);

  const handleMapInteraction = useCallback(
    (eventName: string, details: Record<string, unknown> = {}) => {
      bumpInteractionCount();
      trackEvent(eventName, details);

      if (activeTaskRef.current?.module !== 'control-groups') {
        return;
      }

      if (eventName === 'map_background_tapped') {
        activeTaskRef.current.controlBackgroundTapCount += 1;
        activeTaskRef.current.controlIncorrectTapCount += 1;
        return;
      }

      if (eventName === 'drone_opened_fpv_from_map') {
        activeTaskRef.current.controlDroneTapCount += 1;
        activeTaskRef.current.controlIncorrectTapCount += 1;
        return;
      }

      if (eventName === 'poi_tapped' && details.poiType !== 'target') {
        activeTaskRef.current.controlNonTargetTapCount += 1;
        activeTaskRef.current.controlIncorrectTapCount += 1;
      }
    },
    [bumpInteractionCount, trackEvent]
  );

  const handleMapCameraChange = useCallback((camera: MapCameraState) => {
    setMapCamera(camera);
  }, []);

  const handleAcknowledgeMinimapStatus = useCallback(() => {
    if (!minimapStatusSignalVisible || minimapStatusAppearedAt === null) {
      return;
    }
    const now = Date.now();
    const responseMs = now - minimapStatusAppearedAt;
    setMinimapStatusSignalVisible(false);
    setMinimapStatusAppearedAt(null);
    bumpInteractionCount();
    trackEvent('minimap_status_acknowledged', {
      signalId: minimapStatusId,
      responseMs,
    });
    if (activeTaskRef.current?.module === 'minimap') {
      activeTaskRef.current.minimapAckTimesMs.push(responseMs);
    }
  }, [
    bumpInteractionCount,
    minimapStatusAppearedAt,
    minimapStatusId,
    minimapStatusSignalVisible,
    trackEvent,
  ]);

  const handleSwitchToMapView = () => {
    setViewMode('MAP');
    bumpInteractionCount();
    trackEvent('view_changed', { to: 'MAP' });
  };

  const handleSwitchToFPVView = (droneId: string) => {
    setSelectedDroneId(droneId);
    setViewMode('FPV');
    setAlertFocusRequest(null);
    bumpInteractionCount();
    trackEvent('view_changed', { to: 'FPV', droneId });
  };

  const handleToggleAlert = (alertId: number) => {
    const isExpanded = expandedAlert === alertId;
    setExpandedAlert(isExpanded ? null : alertId);
    bumpInteractionCount();
    trackEvent(isExpanded ? 'alert_collapsed' : 'alert_expanded', { alertId });
  };

  const handleDismissAlert = (alertId: number) => {
    const matchingAlert = alerts.find((alert) => alert.id === alertId);
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    if (expandedAlert === alertId) {
      setExpandedAlert(null);
    }
    bumpInteractionCount();

    const responseMs =
      matchingAlert?.createdAt !== undefined ? Date.now() - matchingAlert.createdAt : null;
    if (activeTaskRef.current?.module === 'alerts' && responseMs !== null) {
      activeTaskRef.current.alertResponseTimesMs.push(responseMs);
    }

    trackEvent('alert_dismissed', { alertId, responseMs });
  };

  const handleGoToAlert = (alert: Alert) => {
    const responseMs =
      alert.createdAt !== undefined ? Date.now() - alert.createdAt : null;
    const focusX = alert.mapX ?? 75;
    const focusY = alert.mapY ?? 55;
    alertFocusRequestIdRef.current += 1;

    setVisitedAlertIds((prev) => new Set([...prev, alert.id]));
    setReturnContext({
      viewMode,
      droneId: selectedDroneId,
      alertId: alert.id,
      jumpedAt: Date.now(),
      mapCameraBeforeJump: viewMode === 'MAP' ? mapCamera : null,
    });
    setAlertFocusRequest({
      requestId: alertFocusRequestIdRef.current,
      alertId: alert.id,
      x: focusX,
      y: focusY,
      zoom: 1.65,
    });
    setCameraRestoreRequest(null);
    setViewMode('MAP');
    bumpInteractionCount();
    if (activeTaskRef.current?.module === 'alerts' && responseMs !== null) {
      activeTaskRef.current.alertResponseTimesMs.push(responseMs);
    }
    trackEvent('alert_jump_to_event', {
      alertId: alert.id,
      fromView: viewMode,
      responseMs,
      locationLabel: alert.locationLabel ?? null,
      focusX,
      focusY,
    });
  };

  const handleQuickBack = () => {
    if (!returnContext) return;

    if (returnContext.viewMode === 'MAP' && returnContext.mapCameraBeforeJump) {
      cameraRestoreRequestIdRef.current += 1;
      setCameraRestoreRequest({
        requestId: cameraRestoreRequestIdRef.current,
        pan: returnContext.mapCameraBeforeJump.pan,
        zoom: returnContext.mapCameraBeforeJump.zoom,
      });
    }
    setAlertFocusRequest(null);

    setSelectedDroneId(returnContext.droneId);
    setViewMode(returnContext.viewMode);
    bumpInteractionCount();
    trackEvent('alert_quick_back', {
      alertId: returnContext.alertId,
      responseMs: Date.now() - returnContext.jumpedAt,
      restoredMapCamera: returnContext.viewMode === 'MAP',
    });
    setReturnContext(null);
  };

  // Condition B: mark an alert as visited when the map is panned near its location
  useEffect(() => {
    if (studyModule !== 'alerts' || isAlertJumpEnabled || viewMode !== 'MAP') return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const centerX = 50 - (mapCamera.pan.x / (mapCamera.zoom * 3 * W)) * 100;
    const centerY = 50 - (mapCamera.pan.y / (mapCamera.zoom * 3 * H)) * 100;
    const newVisits: number[] = [];
    alerts.forEach((alert) => {
      if (visitedAlertIds.has(alert.id)) return;
      if (alert.mapX === undefined || alert.mapY === undefined) return;
      if (Math.hypot(alert.mapX - centerX, alert.mapY - centerY) < 15) {
        newVisits.push(alert.id);
      }
    });
    if (newVisits.length === 0) return;
    setVisitedAlertIds((prev) => new Set([...prev, ...newVisits]));
    newVisits.forEach((id) => trackEvent('alert_location_visited_manual', { alertId: id }));
  }, [mapCamera, alerts, isAlertJumpEnabled, studyModule, viewMode, visitedAlertIds, trackEvent]);

  const handleEnterDroneMoveMode = useCallback(() => {
    setMoveMode('drone');
    setMovePending(null);
    bumpInteractionCount();
    trackEvent('move_mode_entered', { target: 'drone', droneId: selectedDroneId });
  }, [bumpInteractionCount, selectedDroneId, trackEvent]);

  const handleEnterGroupMoveMode = useCallback(() => {
    setMoveMode('group');
    setMovePending(null);
    bumpInteractionCount();
    trackEvent('move_mode_entered', { target: 'group', groupId: selectedGroup });
  }, [bumpInteractionCount, selectedGroup, trackEvent]);

  const handleMapMovePending = useCallback((x: number, y: number) => {
    setMovePending({ x, y });
  }, []);

  const handleCancelMove = useCallback(() => {
    setMovePending(null);
    setMoveMode('idle');
    trackEvent('move_cancelled', {});
  }, [trackEvent]);

  const handleConfirmMove = useCallback(() => {
    if (!movePending) return;
    const { x, y } = movePending;

    if (moveMode === 'drone') {
      setDronePositions((prev) => ({ ...prev, [selectedDroneId]: { x, y } }));
      bumpInteractionCount();
      trackEvent('drone_moved', { droneId: selectedDroneId, toX: x, toY: y });
    } else if (moveMode === 'group') {
      const groupDroneIds = controlGroups[selectedGroup] || [];
      const offsets = generateClusterOffsets(groupDroneIds.length);
      setDronePositions((prev) => {
        const next = { ...prev };
        groupDroneIds.forEach((droneId, i) => {
          next[droneId] = {
            x: Math.max(2, Math.min(98, x + (offsets[i]?.x ?? 0))),
            y: Math.max(2, Math.min(98, y + (offsets[i]?.y ?? 0))),
          };
        });
        return next;
      });
      bumpInteractionCount();
      trackEvent('group_moved', { groupId: selectedGroup, droneCount: groupDroneIds.length, toX: x, toY: y });

      // Proximity-based auto-assignment during control groups task
      if (isControlTaskActive && (selectedGroup === 1 || selectedGroup === 2 || selectedGroup === 3)) {
        const nearestTarget = initialPOIs
          .filter((p) => p.type === 'target')
          .reduce<{ id: string; name: string; dist: number } | null>((best, target) => {
            const dist = Math.hypot(x - target.x, y - target.y);
            return dist < 12 && (best === null || dist < best.dist)
              ? { id: target.id, name: target.name, dist }
              : best;
          }, null);

        if (nearestTarget) {
          const goal = controlTargetGoals.find((g) => g.groupId === selectedGroup);
          const isCorrect = goal?.targetId === nearestTarget.id;
          setGroupTargetAssignments((prev) => {
            const next = { ...prev, [selectedGroup as GroupId]: nearestTarget.id };
            trackEvent('group_target_assigned', {
              groupId: selectedGroup,
              targetId: nearestTarget.id,
              targetName: nearestTarget.name,
              isCorrect,
              method: 'proximity_move',
            });
            if (activeTaskRef.current?.module === 'control-groups') {
              if (isCorrect) activeTaskRef.current.correctTargetAssignments += 1;
              else activeTaskRef.current.wrongTargetAssignments += 1;
            }
            // Auto-advance to next unassigned goal
            const nextGoal = controlTargetGoals.find((spec) => next[spec.groupId] !== spec.targetId);
            if (nextGoal && nextGoal.groupId !== (selectedGroup as 1 | 2 | 3)) {
              selectControlTaskGroup(nextGoal.groupId, 'auto_advance');
            }
            return next;
          });
        }
      }
    }

    setMovePending(null);
    setMoveMode('idle');
  }, [bumpInteractionCount, controlGroups, isControlTaskActive, moveMode, movePending, selectedDroneId, selectedGroup, selectControlTaskGroup, trackEvent]);

  const handleStartTask = () => {
    resetModuleScenario('task_start');
    setLastTaskSummary(null);

    if (studyModule === 'control-groups') {
      setViewMode('MAP');
      setControlTaskActiveGroupId(1);
      setSelectedGroup(1);
      const resetGroups = buildInitialControlGroups();
      if (resetGroups[1].length > 0) {
        setSelectedDroneId(resetGroups[1][0]);
      }
    }

    const startedAt = Date.now();
    const taskId = `${studyModule}-${studyCondition}-${startedAt}`;
    activeTaskRef.current = {
      taskId,
      module: studyModule,
      condition: studyCondition,
      startedAt,
      interactionCount: 0,
      wrongTargetAssignments: 0,
      correctTargetAssignments: 0,
      controlIncorrectTapCount: 0,
      controlNonTargetTapCount: 0,
      controlDroneTapCount: 0,
      controlBackgroundTapCount: 0,
      controlRoleSwitchCount: 0,
      alertResponseTimesMs: [],
      minimapAckTimesMs: [],
      distanceSamples: 0,
      nearestDistanceKm: null,
      farthestDistanceKm: null,
      overshootCount: 0,
      previousDistanceKm: null,
    };
    setTaskStartAt(startedAt);
    trackEvent('task_started', {
      module: studyModule,
      condition: studyCondition,
      taskId,
      activeAlertBatchId: alertBatchId,
    });
  };

  const finishTask = (outcome: 'complete' | 'fail') => {
    const finishedAt = Date.now();
    const activeTask = activeTaskRef.current;
    const durationMs = taskStartAt ? finishedAt - taskStartAt : null;
    const controlAssignmentSummary = controlTargetGoals.map((goal) => {
      const assignedTargetId = groupTargetAssignments[goal.groupId] ?? null;
      return {
        groupId: goal.groupId,
        label: goal.label,
        expectedTargetId: goal.targetId,
        expectedTargetName: goal.targetName,
        assignedTargetId,
        isCorrect: assignedTargetId === goal.targetId,
      };
    });
    const controlCorrectCount = controlAssignmentSummary.filter((item) => item.isCorrect).length;
    const controlWrongCount = controlAssignmentSummary.filter(
      (item) => item.assignedTargetId !== null && !item.isCorrect
    ).length;

    trackEvent(outcome === 'complete' ? 'task_completed' : 'task_failed', {
      module: studyModule,
      condition: studyCondition,
      durationMs,
      alertRemainingCount: alerts.length,
      controlCorrectCount,
      controlWrongCount,
      latestDistanceToTargetKm,
      minimapSignalVisibleAtEnd: minimapStatusSignalVisible,
    });

    if (activeTask) {
      trackEvent('task_metrics_summary', {
        taskId: activeTask.taskId,
        module: activeTask.module,
        condition: activeTask.condition,
        durationMs: finishedAt - activeTask.startedAt,
        interactionCount: activeTask.interactionCount,
        wrongTargetAssignments: activeTask.wrongTargetAssignments,
        correctTargetAssignments: activeTask.correctTargetAssignments,
        controlIncorrectTapCount: activeTask.controlIncorrectTapCount,
        controlNonTargetTapCount: activeTask.controlNonTargetTapCount,
        controlDroneTapCount: activeTask.controlDroneTapCount,
        controlBackgroundTapCount: activeTask.controlBackgroundTapCount,
        controlRoleSwitchCount: activeTask.controlRoleSwitchCount,
        alertsHandled: activeTask.alertResponseTimesMs.length,
        alertResponseTimesMs: activeTask.alertResponseTimesMs,
        alertResponseAvgMs:
          activeTask.alertResponseTimesMs.length > 0
            ? Math.round(
                activeTask.alertResponseTimesMs.reduce((sum, value) => sum + value, 0) /
                  activeTask.alertResponseTimesMs.length
              )
            : null,
        minimapAckTimesMs: activeTask.minimapAckTimesMs,
        minimapAckAvgMs:
          activeTask.minimapAckTimesMs.length > 0
            ? Math.round(
                activeTask.minimapAckTimesMs.reduce((sum, value) => sum + value, 0) /
                  activeTask.minimapAckTimesMs.length
              )
            : null,
        distanceSamples: activeTask.distanceSamples,
        nearestDistanceKm: activeTask.nearestDistanceKm,
        farthestDistanceKm: activeTask.farthestDistanceKm,
        overshootCount: activeTask.overshootCount,
        controlAssignments: controlAssignmentSummary,
      });

      setLastTaskSummary({
        module: activeTask.module,
        condition: activeTask.condition,
        outcome,
        durationMs,
        interactions: activeTask.interactionCount,
        controlCorrectCount,
        controlWrongCount,
        controlIncorrectTapCount: activeTask.controlIncorrectTapCount,
        alertsHandled: activeTask.alertResponseTimesMs.length,
        minimapAcks: activeTask.minimapAckTimesMs.length,
        timestamp: finishedAt,
      });
    }

    if (studyModule === 'minimap') {
      clearMinimapStatusTimer();
    }

    activeTaskRef.current = null;
    setTaskStartAt(null);
  };

  const handleSubmitWorkload = (scores: {
    mental: number;
    physical: number;
    temporal: number;
    performance: number;
    effort: number;
    frustration: number;
    clarity: number;
  }) => {
    bumpInteractionCount();
    trackEvent('workload_submitted', scores);
  };

  const handleExportJson = () => {
    downloadTextFile(
      `${sessionId}-${participantId || 'participant'}-events.json`,
      JSON.stringify(eventLog, null, 2),
      'application/json'
    );
  };

  const handleExportCsv = () => {
    downloadTextFile(
      `${sessionId}-${participantId || 'participant'}-events.csv`,
      eventsToCsv(eventLog),
      'text/csv;charset=utf-8'
    );
  };

  const handleModuleChange = (nextModule: StudyModule) => {
    setStudyModule(nextModule);
    setTaskStartAt(null);
    activeTaskRef.current = null;
    setIsGroupEditMode(false);
    setControlTaskActiveGroupId(1);
    setReturnContext(null);
    setAlertFocusRequest(null);
    setCameraRestoreRequest(null);
    setMinimapStatusSignalVisible(false);
    clearMinimapStatusTimer();
    trackEvent('study_module_changed', { from: studyModule, to: nextModule });
  };

  const handleConditionChange = (nextCondition: 'A' | 'B') => {
    setStudyCondition(nextCondition);
    trackEvent('study_condition_changed', { from: studyCondition, to: nextCondition });
  };

  const controlAssignmentRows = controlTargetGoals.map((goal) => {
    const assignedTargetId = groupTargetAssignments[goal.groupId] ?? null;
    const assignedTargetName =
      assignedTargetId === '4'
        ? 'Target Alpha'
        : assignedTargetId === '6'
          ? 'Target Bravo'
          : assignedTargetId === '7'
            ? 'Target Charlie'
            : null;
    return {
      groupId: goal.groupId,
      label: goal.label,
      expectedTargetName: goal.targetName,
      assignedTargetName,
      isCorrect: assignedTargetId === goal.targetId,
    };
  });

  const controlCorrectCount = controlAssignmentRows.filter((row) => row.isCorrect).length;
  const controlAssignedCount = controlAssignmentRows.filter(
    (row) => row.assignedTargetName !== null
  ).length;
  const activeControlGoal =
    controlAssignmentRows.find((row) => row.groupId === controlTaskActiveGroupId) ||
    controlAssignmentRows[0];
  const taskProgressLabel =
    studyModule === 'control-groups'
      ? `${controlCorrectCount}/3 correct target assignments (${controlAssignedCount}/3 assigned) | Active role: ${activeControlGoal?.label ?? 'Recon'} (G${controlTaskActiveGroupId})`
      : studyModule === 'alerts'
        ? `${alerts.length} active alert${alerts.length === 1 ? '' : 's'} remaining`
        : minimapStatusSignalVisible
          ? 'Red status icon is visible. Participant should acknowledge it now.'
          : 'Waiting for red-status event or already acknowledged.';

  const participantPrompt =
    studyModule === 'control-groups'
      ? 'Tap a role row (Recon/Relay/Delivery), then tap its matching target marker (Alpha/Bravo/Charlie) as quickly and accurately as possible.'
      : studyModule === 'alerts'
        ? 'Respond to each alert: acknowledge it, inspect/handle it, then return to your previous context.'
        : 'Navigate to markers while monitoring for a red-status icon and acknowledge it immediately when seen.';

  const recordingIssues: string[] = [];
  if (participantId.trim().length === 0) {
    recordingIssues.push('Participant ID is empty.');
  }
  if (eventLog.length === 0) {
    recordingIssues.push('No telemetry events logged yet.');
  }
  if (studyModule === 'control-groups' && viewMode !== 'MAP') {
    recordingIssues.push('Control task is most reliable in MAP view.');
  }
  if (studyModule === 'alerts' && !isTaskActive && alerts.length === 0) {
    recordingIssues.push('No active alerts. Reset scenario before next alert run.');
  }

  const lastTaskSummaryText = lastTaskSummary
    ? `${new Date(lastTaskSummary.timestamp).toLocaleTimeString()} | ${lastTaskSummary.module} ${lastTaskSummary.condition} | ${lastTaskSummary.outcome.toUpperCase()} | ${lastTaskSummary.durationMs === null ? '--' : `${Math.round(lastTaskSummary.durationMs / 1000)}s`} | interactions ${lastTaskSummary.interactions}${lastTaskSummary.module === 'control-groups' ? ` | incorrect taps ${lastTaskSummary.controlIncorrectTapCount}` : ''}`
    : 'No completed task this session yet.';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <StudyControlPanel
        sessionId={sessionId}
        participantId={participantId}
        module={studyModule}
        condition={studyCondition}
        alertBatchId={alertBatchId}
        eventCount={eventLog.length}
        isTaskActive={taskStartAt !== null}
        taskStartedAt={taskStartAt}
        completedTrials={eventLog.filter((e) => e.eventName === 'task_completed' || e.eventName === 'task_failed').length}
        isGroupEditMode={isGroupEditMode}
        latestDistanceToTargetKm={latestDistanceToTargetKm}
        minimapStatusVisible={minimapStatusSignalVisible}
        controlAssignmentRows={controlAssignmentRows}
        taskProgressLabel={taskProgressLabel}
        participantPrompt={participantPrompt}
        recordingIssues={recordingIssues}
        lastTaskSummaryText={lastTaskSummaryText}
        onParticipantIdChange={setParticipantId}
        onModuleChange={handleModuleChange}
        onConditionChange={handleConditionChange}
        onStartTask={handleStartTask}
        onCompleteTask={() => finishTask('complete')}
        onFailTask={() => finishTask('fail')}
        onResetScenario={() => resetModuleScenario('manual')}
        onTriggerMinimapStatus={() => scheduleMinimapStatusSignal('manual')}
        onSubmitWorkload={handleSubmitWorkload}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onExitGroupEditMode={handleExitGroupEditMode}
      />

      {viewMode === 'FPV' ? (
        <>
          {/* Background FPV view */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${selectedDrone.fpvView}')`
            }}
          />

          {/* Vignette effect */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />

          {/* HUD Overlay */}
          <DroneHUD
            selectedDroneId={selectedDroneId}
            onSwitchMainView={(droneId) => handleSelectDrone(droneId, 'hud_switch')}
            selectedGroup={selectedGroup}
            groupDrones={selectedGroupDrones}
            allDrones={allDrones}
            onSwitchToMapView={handleSwitchToMapView}
            alerts={alerts}
            expandedAlert={expandedAlert}
            onToggleAlert={handleToggleAlert}
            onDismissAlert={handleDismissAlert}
            onGoToAlert={isAlertJumpEnabled ? handleGoToAlert : undefined}
            visitedAlertIds={studyModule === 'alerts' ? visitedAlertIds : undefined}
          />
        </>
      ) : (
        <MapViewUI
          selectedGroup={selectedGroup}
          selectedDroneId={selectedDroneId}
          onSelectDrone={(droneId) => handleSelectDrone(droneId, 'map_or_panel')}
          onGroupChange={handleGroupChange}
          onEnterGroupEditMode={handleEnterGroupEditMode}
          onExitGroupEditMode={handleExitGroupEditMode}
          isGroupEditMode={isGroupEditMode}
          groupDrones={selectedGroupDrones}
          selectedGroupDroneIds={selectedGroupDroneIds}
          allDrones={allDrones}
          onSwitchToFPVView={handleSwitchToFPVView}
          onToggleDroneInSelectedGroup={handleToggleDroneInSelectedGroup}
          onAddDronesToSelectedGroup={handleAddDronesToSelectedGroup}
          onAssignSelectedGroupToTarget={handleAssignSelectedGroupToTarget}
          assignedTargetsByGroup={groupTargetAssignments}
          showControlTaskOverlay={studyModule === 'control-groups' && isTaskActive}
          activeControlTaskGroupId={controlTaskActiveGroupId}
          controlTaskRows={controlAssignmentRows}
          onSelectControlTaskGroup={handleSelectControlTaskGroup}
          onDistanceToTargetChange={handleDistanceToTargetChange}
          mapRotationDeg={mapRotationDeg}
          onMapInteraction={handleMapInteraction}
          alertFocusRequest={alertFocusRequest}
          cameraRestoreRequest={cameraRestoreRequest}
          onMapCameraChange={handleMapCameraChange}
          minimapStatusVisible={studyModule === 'minimap' && minimapStatusSignalVisible}
          onAcknowledgeMinimapStatus={handleAcknowledgeMinimapStatus}
          alerts={alerts}
          expandedAlert={expandedAlert}
          onToggleAlert={handleToggleAlert}
          onDismissAlert={handleDismissAlert}
          onGoToAlert={isAlertJumpEnabled ? handleGoToAlert : undefined}
          visitedAlertIds={studyModule === 'alerts' ? visitedAlertIds : undefined}
          dronePositions={dronePositions}
          moveMode={moveMode}
          onMapMovePending={handleMapMovePending}
          onEnterDroneMoveMode={handleEnterDroneMoveMode}
          onEnterGroupMoveMode={isSavedGroupFeatureEnabled ? handleEnterGroupMoveMode : undefined}
          onCancelMove={handleCancelMove}
          isMoveGroupEnabled={isSavedGroupFeatureEnabled}
          selectedDroneName={selectedDrone.name}
        />
      )}

      {/* Move confirmation overlay */}
      {movePending && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="pointer-events-auto rounded-lg border border-cyan-300/60 bg-slate-900/95 p-5 shadow-2xl text-center w-72">
            <div className="mb-1 text-[10px] uppercase tracking-widest text-cyan-400">Confirm Move</div>
            <div className="mt-1 text-sm text-slate-100">
              {moveMode === 'drone'
                ? `Move ${selectedDrone.name} to this location?`
                : `Move Group ${selectedGroup} (${controlGroups[selectedGroup]?.length ?? 0} drones) to this location?`}
            </div>
            {moveMode === 'group' && isControlTaskActive && (
              <div className="mt-1 text-[10px] text-slate-400">
                If near a target, the group will be auto-assigned.
              </div>
            )}
            <div className="mt-3 flex gap-2 justify-center">
              <button
                className="rounded bg-cyan-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-cyan-700"
                onClick={handleConfirmMove}
              >
                Move Here
              </button>
              <button
                className="rounded bg-slate-700 px-4 py-1.5 text-sm text-white hover:bg-slate-600"
                onClick={handleCancelMove}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'MAP' && returnContext && isAlertJumpEnabled && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[70] pointer-events-auto">
          <button
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm border border-white/20"
            onClick={handleQuickBack}
          >
            Quick Back to Previous View
          </button>
        </div>
      )}
    </div>
  );
}
