import { useState } from 'react';
import { DroneHUD } from './components/DroneHUD';
import { MapViewUI } from './components/MapViewUI';
import type { Alert } from './components/AlertsPanel';

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

const initialAlerts: Alert[] = [
  { id: 1, type: 'warning', message: 'Low battery on Drone 3', time: '2m ago', details: 'Battery at 23%. Return to base recommended.' },
  { id: 2, type: 'info', message: 'Waypoint reached', time: '5m ago', details: 'Drone 5 reached waypoint 2.' },
  { id: 3, type: 'success', message: 'Mission update completed', time: '8m ago', details: 'All drones updated with new waypoints.' },
];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('FPV');
  const [selectedGroup, setSelectedGroup] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [selectedDroneId, setSelectedDroneId] = useState<string>('1-5');
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  const getGroupDrones = (groupId: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    return allDrones.filter(drone => drone.groupId === groupId);
  };

  const handleSwitchToMapView = () => {
    setViewMode('MAP');
  };

  const handleSwitchToFPVView = (droneId: string) => {
    setSelectedDroneId(droneId);
    setViewMode('FPV');
  };

  const handleToggleAlert = (alertId: number) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  const handleDismissAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    if (expandedAlert === alertId) {
      setExpandedAlert(null);
    }
  };

  const handleGoToAlert = (alert: Alert) => {
    console.log('Go to alert:', alert);
    // This would navigate to the alert location in a real implementation
  };

  const selectedDrone = allDrones.find(d => d.id === selectedDroneId) || allDrones.find(d => d.groupId === selectedGroup) || allDrones[0];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
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
            onSwitchMainView={setSelectedDroneId}
            selectedGroup={selectedGroup}
            groupDrones={getGroupDrones(selectedGroup)}
            allDrones={allDrones}
            onSwitchToMapView={handleSwitchToMapView}
            alerts={alerts}
            expandedAlert={expandedAlert}
            onToggleAlert={handleToggleAlert}
            onDismissAlert={handleDismissAlert}
            onGoToAlert={handleGoToAlert}
          />
        </>
      ) : (
        <MapViewUI 
          selectedGroup={selectedGroup}
          selectedDroneId={selectedDroneId}
          onSelectDrone={setSelectedDroneId}
          onGroupChange={setSelectedGroup}
          groupDrones={getGroupDrones(selectedGroup)}
          allDrones={allDrones}
          onSwitchToFPVView={handleSwitchToFPVView}
          alerts={alerts}
          expandedAlert={expandedAlert}
          onToggleAlert={handleToggleAlert}
          onDismissAlert={handleDismissAlert}
          onGoToAlert={handleGoToAlert}
        />
      )}
    </div>
  );
}