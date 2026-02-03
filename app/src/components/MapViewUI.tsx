import { useState } from 'react';
import { MapView } from './MapView';
import { StatusPanel } from './StatusPanel';
import { Compass } from './Compass';
import { DroneGroupInfoPanel } from './DroneGroupInfoPanel';
import { AlertsPanel, Alert } from './AlertsPanel';
import type { Drone } from '../App';

interface MapViewUIProps {
  selectedGroup: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  selectedDroneId: string;
  onSelectDrone: (droneId: string) => void;
  onGroupChange: (groupId: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  groupDrones: Drone[];
  allDrones: Drone[];
  onSwitchToFPVView: (droneId: string) => void;
  alerts: Alert[];
  expandedAlert: number | null;
  onToggleAlert: (alertId: number) => void;
  onDismissAlert: (alertId: number) => void;
  onGoToAlert?: (alert: Alert) => void;
}

export function MapViewUI({
  selectedGroup,
  selectedDroneId,
  onSelectDrone,
  onGroupChange,
  groupDrones,
  allDrones,
  onSwitchToFPVView,
  alerts,
  expandedAlert,
  onToggleAlert,
  onDismissAlert,
  onGoToAlert
}: MapViewUIProps) {
  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      <MapView 
        selectedGroup={selectedGroup}
        selectedDroneId={selectedDroneId}
        onSelectDrone={onSelectDrone}
        groupDrones={groupDrones}
        allDrones={allDrones}
        onSwitchToFPVView={onSwitchToFPVView}
      />
      
      <div className="absolute top-4 left-4 z-10">
        <Compass animate={false} initialHeading={0} />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <DroneGroupInfoPanel 
          selectedGroup={selectedGroup}
          drones={groupDrones}
        />
      </div>
      
      <div className="absolute bottom-4 left-4 z-10">
        <StatusPanel 
          selectedGroup={selectedGroup}
          onGroupChange={onGroupChange}
          selectedDroneId={selectedDroneId}
          onSelectDrone={onSelectDrone}
          groupDrones={groupDrones}
          onSwitchToFPVView={onSwitchToFPVView}
        />
      </div>
      
      <div className="absolute bottom-4 right-4 z-10">
        <AlertsPanel 
          alerts={alerts}
          expandedAlert={expandedAlert}
          onToggleAlert={onToggleAlert}
          onDismissAlert={onDismissAlert}
          onGoToAlert={onGoToAlert}
        />
      </div>
    </div>
  );
}