export interface POI {
  id: string;
  name: string;
  x: number; // percentage
  y: number; // percentage
  type: 'waypoint' | 'home' | 'target';
  lat?: number;
  lng?: number;
}

export const initialPOIs: POI[] = [
  { id: '1', name: 'Home Base', x: 20, y: 30, type: 'home', lat: 37.7749, lng: -122.4194 },
  { id: '2', name: 'Waypoint 1', x: 40, y: 45, type: 'waypoint', lat: 37.7849, lng: -122.4094 },
  { id: '3', name: 'Waypoint 2', x: 60, y: 35, type: 'waypoint', lat: 37.7949, lng: -122.3994 },
  { id: '4', name: 'Target Alpha', x: 75, y: 55, type: 'target', lat: 37.8049, lng: -122.3894 },
  { id: '5', name: 'Waypoint 3', x: 50, y: 70, type: 'waypoint', lat: 37.8149, lng: -122.3794 },
  { id: '6', name: 'Target Bravo', x: 30, y: 78, type: 'target', lat: 37.8249, lng: -122.3694 },
  { id: '7', name: 'Target Charlie', x: 84, y: 28, type: 'target', lat: 37.8129, lng: -122.4014 },
];

// Simulated drone positions on the map - keyed by drone ID.
export const droneMapPositions: Record<string, { x: number; y: number }> = {
  // Group 1
  '1-1': { x: 35, y: 40 },
  '1-2': { x: 48, y: 52 },
  '1-3': { x: 62, y: 38 },
  '1-4': { x: 55, y: 65 },
  '1-5': { x: 42, y: 48 },
  '1-6': { x: 68, y: 44 },
  '1-7': { x: 50, y: 58 },
  '1-8': { x: 58, y: 50 },
  // Group 2
  '2-1': { x: 32, y: 42 },
  '2-2': { x: 52, y: 48 },
  '2-3': { x: 65, y: 40 },
  '2-4': { x: 45, y: 60 },
  // Group 3
  '3-1': { x: 38, y: 45 },
  '3-2': { x: 58, y: 52 },
  '3-3': { x: 72, y: 46 },
  // Group 4
  '4-1': { x: 28, y: 36 },
  '4-2': { x: 56, y: 44 },
  '4-3': { x: 66, y: 58 },
  // Group 5
  '5-1': { x: 40, y: 54 },
  '5-2': { x: 52, y: 62 },
  '5-3': { x: 74, y: 50 },
  // Group 6
  '6-1': { x: 30, y: 48 },
  '6-2': { x: 62, y: 56 },
  '6-3': { x: 70, y: 42 },
  // Group 7
  '7-1': { x: 25, y: 35 },
  '7-2': { x: 55, y: 42 },
  '7-3': { x: 70, y: 52 },
};
