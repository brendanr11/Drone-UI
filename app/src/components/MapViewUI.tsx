import { useEffect, useMemo, useState } from 'react';
import { MapView } from './MapView';
import { droneMapPositions, initialPOIs, type POI } from './mapData';
import { StatusPanel } from './StatusPanel';
import { Compass } from './Compass';
import { DroneGroupInfoPanel } from './DroneGroupInfoPanel';
import { AlertsPanel, Alert } from './AlertsPanel';
import { ControlTaskOverlay } from './ControlTaskOverlay';
import type { Drone } from '../App';

interface MapViewUIProps {
  selectedGroup: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  selectedDroneId: string;
  onSelectDrone: (droneId: string) => void;
  onGroupChange: (groupId: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  onEnterGroupEditMode: (groupId: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  onExitGroupEditMode: () => void;
  isGroupEditMode: boolean;
  groupDrones: Drone[];
  selectedGroupDroneIds: string[];
  allDrones: Drone[];
  onSwitchToFPVView: (droneId: string) => void;
  onToggleDroneInSelectedGroup: (droneId: string) => void;
  onAddDronesToSelectedGroup: (droneIds: string[]) => void;
  alerts: Alert[];
  expandedAlert: number | null;
  onToggleAlert: (alertId: number) => void;
  onDismissAlert: (alertId: number) => void;
  onGoToAlert?: (alert: Alert) => void;
  onAssignSelectedGroupToTarget?: (target: POI) => void;
  assignedTargetsByGroup?: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string>>;
  showControlTaskOverlay?: boolean;
  activeControlTaskGroupId?: 1 | 2 | 3;
  controlTaskRows?: Array<{
    groupId: 1 | 2 | 3;
    label: string;
    expectedTargetName: string;
    assignedTargetName: string | null;
    isCorrect: boolean;
  }>;
  onSelectControlTaskGroup?: (groupId: 1 | 2 | 3) => void;
  onDistanceToTargetChange?: (distanceToTargetKm: number | null) => void;
  mapRotationDeg?: number;
  onMapInteraction?: (eventName: string, details?: Record<string, unknown>) => void;
  minimapStatusVisible?: boolean;
  onAcknowledgeMinimapStatus?: () => void;
  alertFocusRequest?: {
    requestId: number;
    alertId: number;
    x: number;
    y: number;
    zoom?: number;
  } | null;
  cameraRestoreRequest?: {
    requestId: number;
    pan: { x: number; y: number };
    zoom: number;
  } | null;
  onMapCameraChange?: (camera: { pan: { x: number; y: number }; zoom: number }) => void;
  dronePositions?: Record<string, { x: number; y: number }>;
  moveMode?: 'idle' | 'drone' | 'group';
  onMapMovePending?: (mapX: number, mapY: number) => void;
  onEnterDroneMoveMode?: () => void;
  onEnterGroupMoveMode?: () => void;
  onCancelMove?: () => void;
  isMoveGroupEnabled?: boolean;
  visitedAlertIds?: Set<number>;
  selectedDroneName?: string;
}

export function MapViewUI({
  selectedGroup,
  selectedDroneId,
  onSelectDrone,
  onGroupChange,
  onEnterGroupEditMode,
  onExitGroupEditMode,
  isGroupEditMode,
  groupDrones,
  selectedGroupDroneIds,
  allDrones,
  onSwitchToFPVView,
  onToggleDroneInSelectedGroup,
  onAddDronesToSelectedGroup,
  alerts,
  expandedAlert,
  onToggleAlert,
  onDismissAlert,
  onGoToAlert,
  onAssignSelectedGroupToTarget,
  assignedTargetsByGroup,
  showControlTaskOverlay = false,
  activeControlTaskGroupId = 1,
  controlTaskRows = [],
  onSelectControlTaskGroup,
  onDistanceToTargetChange,
  mapRotationDeg = 0,
  onMapInteraction,
  minimapStatusVisible = false,
  onAcknowledgeMinimapStatus,
  alertFocusRequest = null,
  cameraRestoreRequest = null,
  onMapCameraChange,
  dronePositions = {},
  moveMode = 'idle',
  onMapMovePending,
  onEnterDroneMoveMode,
  onEnterGroupMoveMode,
  onCancelMove,
  isMoveGroupEnabled = false,
  visitedAlertIds,
  selectedDroneName,
}: MapViewUIProps) {
  const [pois, setPois] = useState<POI[]>(initialPOIs);
  const assignedGroupsByTarget = useMemo(() => {
    const result: Record<string, number[]> = {};
    if (!assignedTargetsByGroup) {
      return result;
    }

    Object.entries(assignedTargetsByGroup).forEach(([groupId, targetId]) => {
      if (!targetId) return;
      if (!result[targetId]) {
        result[targetId] = [];
      }
      result[targetId].push(Number(groupId));
    });

    Object.keys(result).forEach((targetId) => {
      result[targetId].sort((a, b) => a - b);
    });

    return result;
  }, [assignedTargetsByGroup]);

  const targetPois = useMemo(
    () => pois.filter((poi) => poi.type === 'target'),
    [pois]
  );

  const distanceToTargetKm = useMemo(() => {
    if (groupDrones.length === 0 || targetPois.length === 0) {
      return null;
    }

    const groupPositions = groupDrones
      .map((drone) => droneMapPositions[drone.id])
      .filter((position): position is { x: number; y: number } => Boolean(position));

    if (groupPositions.length === 0) {
      return null;
    }

    const centroid = groupPositions.reduce(
      (acc, position) => ({
        x: acc.x + position.x,
        y: acc.y + position.y,
      }),
      { x: 0, y: 0 }
    );

    centroid.x /= groupPositions.length;
    centroid.y /= groupPositions.length;

    const nearestTargetDistancePercent = targetPois.reduce((nearest, target) => {
      const dx = target.x - centroid.x;
      const dy = target.y - centroid.y;
      const distance = Math.hypot(dx, dy);
      return Math.min(nearest, distance);
    }, Number.POSITIVE_INFINITY);

    // Approximate map scale so the value is interpretable during usability tests.
    const kmPerPercent = 0.12;
    return Number((nearestTargetDistancePercent * kmPerPercent).toFixed(1));
  }, [groupDrones, targetPois]);

  useEffect(() => {
    onDistanceToTargetChange?.(distanceToTargetKm);
  }, [distanceToTargetKm, onDistanceToTargetChange]);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      <MapView
        selectedGroup={selectedGroup}
        selectedDroneId={selectedDroneId}
        onSelectDrone={onSelectDrone}
        groupDrones={groupDrones}
        allDrones={allDrones}
        selectedGroupDroneIds={selectedGroupDroneIds}
        isGroupEditMode={isGroupEditMode}
        onToggleDroneInSelectedGroup={onToggleDroneInSelectedGroup}
        onAddDronesToSelectedGroup={onAddDronesToSelectedGroup}
        onSwitchToFPVView={onSwitchToFPVView}
        onPoisChange={setPois}
        onAssignSelectedGroupToTarget={onAssignSelectedGroupToTarget}
        assignedGroupsByTarget={assignedGroupsByTarget}
        onMapInteraction={onMapInteraction}
        mapRotationDeg={mapRotationDeg}
        alertFocusRequest={alertFocusRequest}
        cameraRestoreRequest={cameraRestoreRequest}
        onCameraChange={onMapCameraChange}
        dronePositions={dronePositions}
        moveMode={moveMode}
        onMapMovePending={onMapMovePending}
      />
      
      <div className="absolute top-4 left-4 z-10">
        <Compass animate={false} initialHeading={0} />
      </div>

      {showControlTaskOverlay && controlTaskRows.length > 0 && onSelectControlTaskGroup && (
        <ControlTaskOverlay
          isVisible
          activeGroupId={activeControlTaskGroupId}
          rows={controlTaskRows}
          onSelectGroup={onSelectControlTaskGroup}
        />
      )}

      {/* Move mode instruction banner */}
      {moveMode !== 'idle' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="rounded border border-cyan-300/70 bg-slate-900/90 px-4 py-2 text-xs text-cyan-200 text-center shadow-lg">
            {moveMode === 'drone'
              ? `Tap anywhere on the map to move ${selectedDroneName ?? 'the selected drone'}`
              : `Tap anywhere on the map to move Group ${selectedGroup} (${groupDrones.length} drones)`}
          </div>
        </div>
      )}

      {minimapStatusVisible && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <button
            className="rounded border border-red-200 bg-red-600/95 px-4 py-2 text-xs font-semibold text-white shadow-lg animate-pulse"
            onClick={onAcknowledgeMinimapStatus}
          >
            RED STATUS ICON: TAP TO ACKNOWLEDGE
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10">
        <DroneGroupInfoPanel 
          selectedGroup={selectedGroup}
          drones={groupDrones}
          distanceToTargetKm={distanceToTargetKm}
          targetCount={targetPois.length}
        />
      </div>
      
      <div className="absolute bottom-4 left-4 z-10">
        {/* Move buttons — shown above StatusPanel */}
        {(onEnterDroneMoveMode || (isMoveGroupEnabled && onEnterGroupMoveMode)) && (
          <div className="mb-1.5 flex gap-1.5">
            {onEnterDroneMoveMode && (
              <button
                className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  moveMode === 'drone'
                    ? 'border-cyan-300/80 bg-cyan-500/35 text-cyan-100'
                    : 'border-slate-400/60 bg-black/60 text-slate-100 hover:border-cyan-300/50 hover:text-cyan-200'
                }`}
                onClick={onEnterDroneMoveMode}
                disabled={moveMode !== 'idle' && moveMode !== 'drone'}
                title="Move selected drone to a new location"
              >
                Move Drone
              </button>
            )}
            {isMoveGroupEnabled && onEnterGroupMoveMode && (
              <button
                className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  moveMode === 'group'
                    ? 'border-emerald-300/80 bg-emerald-500/35 text-emerald-100'
                    : 'border-slate-400/60 bg-black/60 text-slate-100 hover:border-emerald-300/50 hover:text-emerald-200'
                }`}
                onClick={onEnterGroupMoveMode}
                disabled={moveMode !== 'idle' && moveMode !== 'group'}
                title={`Move all drones in Group ${selectedGroup} together`}
              >
                Move Group {selectedGroup}
              </button>
            )}
            {moveMode !== 'idle' && onCancelMove && (
              <button
                className="rounded border border-red-400/60 bg-black/60 px-2.5 py-1 text-xs font-medium text-red-300 transition-colors hover:border-red-300/80 hover:text-red-200"
                onClick={onCancelMove}
                title="Cancel move"
              >
                Cancel
              </button>
            )}
          </div>
        )}
        <StatusPanel
          selectedGroup={selectedGroup}
          onGroupChange={onGroupChange}
          onEnterGroupEditMode={onEnterGroupEditMode}
          onExitGroupEditMode={onExitGroupEditMode}
          isGroupEditMode={isGroupEditMode}
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
          visitedAlertIds={visitedAlertIds}
        />
      </div>
    </div>
  );
}
