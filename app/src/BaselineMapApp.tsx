import { useCallback, useMemo, useState } from 'react';
import { MapView } from './components/MapView';
import { StudyControlPanel, type StudyModule } from './components/StudyControlPanel';
import { downloadTextFile, eventsToCsv, type TelemetryEvent } from './lib/telemetry';

export default function BaselineMapApp() {
  const [cameraText, setCameraText] = useState('Pan 0,0 | Zoom 1.00');
  const [sessionId] = useState(
    () => `baseline-session-${new Date().toISOString().replace(/[:.]/g, '-')}`
  );
  const [participantId, setParticipantId] = useState('');
  const [module, setModule] = useState<StudyModule>('control-groups');
  const [condition, setCondition] = useState<'A' | 'B'>('B');
  const [taskStartAt, setTaskStartAt] = useState<number | null>(null);
  const [eventLog, setEventLog] = useState<TelemetryEvent[]>([]);
  const [lastTaskSummary, setLastTaskSummary] = useState<string>(
    'No completed baseline task this session yet.'
  );

  const isTaskActive = taskStartAt !== null;

  const trackEvent = useCallback(
    (eventName: string, details: Record<string, unknown> = {}) => {
      const event: TelemetryEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        sessionId,
        participantId: participantId.trim() || 'unassigned',
        module,
        condition,
        viewMode: 'MAP',
        selectedGroup: 1,
        eventName,
        details: JSON.stringify(details),
      };
      setEventLog((prev) => [...prev, event]);
    },
    [condition, module, participantId, sessionId]
  );

  const handleStartTask = () => {
    const startedAt = Date.now();
    setTaskStartAt(startedAt);
    trackEvent('task_started', { appVariant: 'baseline-map-only', startedAt });
  };

  const finishTask = (outcome: 'complete' | 'fail') => {
    const finishedAt = Date.now();
    const durationMs = taskStartAt ? finishedAt - taskStartAt : null;
    trackEvent(outcome === 'complete' ? 'task_completed' : 'task_failed', {
      appVariant: 'baseline-map-only',
      durationMs,
      interactionCount: eventLog.length,
    });
    setTaskStartAt(null);
    setLastTaskSummary(
      `${new Date(finishedAt).toLocaleTimeString()} | ${module} ${condition} | ${outcome.toUpperCase()} | ${durationMs === null ? '--' : `${Math.round(durationMs / 1000)}s`}`
    );
  };

  const recordingIssues = useMemo(() => {
    const issues: string[] = [];
    if (participantId.trim().length === 0) {
      issues.push('Participant ID is empty.');
    }
    if (eventLog.length === 0) {
      issues.push('No telemetry events logged yet.');
    }
    return issues;
  }, [eventLog.length, participantId]);

  const participantPrompt =
    module === 'control-groups'
      ? 'Baseline run: use map interactions only (no saved group controls) while completing facilitator instructions.'
      : module === 'alerts'
        ? 'Baseline run: use map-only workflow and follow facilitator alert instructions.'
        : 'Baseline run: navigate map markers and acknowledge timing prompts from facilitator.';

  const taskProgressLabel = isTaskActive
    ? `Task running | Logged events: ${eventLog.length}`
    : `Idle | Logged events: ${eventLog.length}`;

  return (
    <div className="relative h-screen w-full bg-slate-100">
      <StudyControlPanel
        sessionId={sessionId}
        participantId={participantId}
        module={module}
        condition={condition}
        alertBatchId={0}
        eventCount={eventLog.length}
        isTaskActive={isTaskActive}
        taskStartedAt={taskStartAt}
        completedTrials={eventLog.filter((e) => e.eventName === 'task_completed' || e.eventName === 'task_failed').length}
        isGroupEditMode={false}
        latestDistanceToTargetKm={null}
        minimapStatusVisible={false}
        controlAssignmentRows={[
          {
            groupId: 1,
            label: 'Recon',
            expectedTargetName: 'Target Alpha',
            assignedTargetName: null,
            isCorrect: false,
          },
          {
            groupId: 2,
            label: 'Relay',
            expectedTargetName: 'Target Bravo',
            assignedTargetName: null,
            isCorrect: false,
          },
          {
            groupId: 3,
            label: 'Delivery',
            expectedTargetName: 'Target Charlie',
            assignedTargetName: null,
            isCorrect: false,
          },
        ]}
        taskProgressLabel={taskProgressLabel}
        participantPrompt={participantPrompt}
        recordingIssues={recordingIssues}
        lastTaskSummaryText={lastTaskSummary}
        onParticipantIdChange={setParticipantId}
        onModuleChange={(nextModule) => {
          setModule(nextModule);
          trackEvent('study_module_changed', { to: nextModule });
        }}
        onConditionChange={(nextCondition) => {
          setCondition(nextCondition);
          trackEvent('study_condition_changed', { to: nextCondition });
        }}
        onStartTask={handleStartTask}
        onCompleteTask={() => finishTask('complete')}
        onFailTask={() => finishTask('fail')}
        onResetScenario={() => {
          trackEvent('module_scenario_reset', { appVariant: 'baseline-map-only' });
          setLastTaskSummary('Scenario reset for baseline map-only run.');
        }}
        onTriggerMinimapStatus={() => {
          trackEvent('minimap_status_triggered_manual', { appVariant: 'baseline-map-only' });
        }}
        onSubmitWorkload={(scores) => {
          trackEvent('workload_submitted', scores as unknown as Record<string, unknown>);
        }}
        onExportJson={() =>
          downloadTextFile(
            `${sessionId}-${participantId || 'participant'}-events.json`,
            JSON.stringify(eventLog, null, 2),
            'application/json'
          )
        }
        onExportCsv={() =>
          downloadTextFile(
            `${sessionId}-${participantId || 'participant'}-events.csv`,
            eventsToCsv(eventLog),
            'text/csv;charset=utf-8'
          )
        }
        onExitGroupEditMode={() => {}}
      />

      <MapView
        selectedGroup={1}
        selectedDroneId=""
        onSelectDrone={() => {}}
        groupDrones={[]}
        selectedGroupDroneIds={[]}
        allDrones={[]}
        isGroupEditMode={false}
        onToggleDroneInSelectedGroup={() => {}}
        onAddDronesToSelectedGroup={() => {}}
        onSwitchToFPVView={() => {}}
        minimalMode
        onMapInteraction={(eventName, details = {}) => {
          trackEvent(eventName, details);
        }}
        onCameraChange={(camera) => {
          setCameraText(
            `Pan ${Math.round(camera.pan.x)},${Math.round(camera.pan.y)} | Zoom ${camera.zoom.toFixed(2)}`
          );
        }}
      />

      <div className="pointer-events-none absolute left-3 top-3 z-40 rounded border border-slate-300 bg-white/85 px-3 py-2 text-xs text-slate-700 shadow-sm">
        Baseline Map-Only View
      </div>

      <div className="pointer-events-none absolute left-3 bottom-3 z-40 rounded border border-slate-300 bg-white/85 px-3 py-2 text-xs text-slate-700 shadow-sm">
        {cameraText}
      </div>
    </div>
  );
}
