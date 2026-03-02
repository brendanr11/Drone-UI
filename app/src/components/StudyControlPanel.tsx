import { useState } from 'react';

export type StudyModule = 'control-groups' | 'alerts' | 'minimap';

interface WorkloadScores {
  mental: number;
  physical: number;
  temporal: number;
  performance: number;
  effort: number;
  frustration: number;
  clarity: number;
}

interface StudyControlPanelProps {
  sessionId: string;
  participantId: string;
  module: StudyModule;
  condition: 'A' | 'B';
  alertBatchId: number;
  eventCount: number;
  isTaskActive: boolean;
  isGroupEditMode: boolean;
  latestDistanceToTargetKm: number | null;
  minimapStatusVisible: boolean;
  controlAssignmentRows: Array<{
    groupId: number;
    label: string;
    expectedTargetName: string;
    assignedTargetName: string | null;
    isCorrect: boolean;
  }>;
  taskProgressLabel: string;
  participantPrompt: string;
  recordingIssues: string[];
  lastTaskSummaryText: string;
  onParticipantIdChange: (value: string) => void;
  onModuleChange: (value: StudyModule) => void;
  onConditionChange: (value: 'A' | 'B') => void;
  onStartTask: () => void;
  onCompleteTask: () => void;
  onFailTask: () => void;
  onResetScenario: () => void;
  onTriggerMinimapStatus: () => void;
  onSubmitWorkload: (scores: WorkloadScores) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onExitGroupEditMode: () => void;
}

const defaultScores: WorkloadScores = {
  mental: 50,
  physical: 10,
  temporal: 50,
  performance: 50,
  effort: 50,
  frustration: 30,
  clarity: 5,
};

export function StudyControlPanel({
  sessionId,
  participantId,
  module,
  condition,
  alertBatchId,
  eventCount,
  isTaskActive,
  isGroupEditMode,
  latestDistanceToTargetKm,
  minimapStatusVisible,
  controlAssignmentRows,
  taskProgressLabel,
  participantPrompt,
  recordingIssues,
  lastTaskSummaryText,
  onParticipantIdChange,
  onModuleChange,
  onConditionChange,
  onStartTask,
  onCompleteTask,
  onFailTask,
  onResetScenario,
  onTriggerMinimapStatus,
  onSubmitWorkload,
  onExportJson,
  onExportCsv,
  onExitGroupEditMode,
}: StudyControlPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [panelMode, setPanelMode] = useState<'facilitator' | 'participant'>('facilitator');
  const [scores, setScores] = useState<WorkloadScores>(defaultScores);
  const moduleChecklist =
    module === 'control-groups'
      ? 'Assign Recon/Relay/Delivery to Target Alpha/Bravo/Charlie.'
      : module === 'alerts'
        ? 'Acknowledge, jump/check, handle, and return for each alert.'
        : 'Navigate markers and acknowledge red status when it appears.';
  const conditionSummary =
    module === 'control-groups'
      ? condition === 'A'
        ? 'A: Saved control groups + multi-select enabled'
        : 'B: Baseline without saved control groups'
      : module === 'alerts'
        ? condition === 'A'
          ? 'A: Stacked alerts + jump + quick-back'
          : 'B: Simple alerts list (no jump/quick-back)'
        : condition === 'A'
          ? 'A: Fixed-north minimap'
          : 'B: Rotating minimap';
  const recordingHealthy = recordingIssues.length === 0;

  const updateScore = (key: keyof WorkloadScores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const scoreInputClassName = 'w-full px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-500/70 text-[11px]';

  return (
    <div className="absolute top-0 right-0 z-[90] pointer-events-none">
      {isCollapsed ? (
        <button
          className="pointer-events-auto h-10 w-10 rounded-none rounded-bl-lg border border-cyan-300/60 bg-black/80 text-[10px] font-semibold text-cyan-200 tracking-wide shadow-[0_0_16px_rgba(34,211,238,0.25)]"
          onClick={() => setIsCollapsed(false)}
          title="Open study controls"
          aria-label="Open study controls"
        >
          OPS
        </button>
      ) : (
        <div className="pointer-events-auto mt-2 mr-2 w-[318px] max-h-[calc(100vh-1rem)] overflow-y-auto rounded-md border border-cyan-300/35 bg-gradient-to-b from-slate-950/95 via-black/90 to-slate-900/95 text-[11px] text-slate-100 shadow-[0_0_28px_rgba(56,189,248,0.16)]">
          <div className="flex items-center justify-between border-b border-cyan-300/20 px-3 py-2">
            <div>
              <div className="text-[10px] tracking-[0.18em] text-cyan-300/80">STUDY OPS</div>
              <div className="text-[10px] text-slate-300">{isTaskActive ? 'Task Running' : 'Idle'}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className={`h-6 rounded border px-2 text-[10px] ${panelMode === 'participant' ? 'border-cyan-300/70 bg-cyan-500/25 text-cyan-100' : 'border-slate-500/70 bg-slate-800/80 text-slate-200'}`}
                onClick={() => setPanelMode('participant')}
              >
                Participant
              </button>
              <button
                className={`h-6 rounded border px-2 text-[10px] ${panelMode === 'facilitator' ? 'border-cyan-300/70 bg-cyan-500/25 text-cyan-100' : 'border-slate-500/70 bg-slate-800/80 text-slate-200'}`}
                onClick={() => setPanelMode('facilitator')}
              >
                Facilitator
              </button>
              <button
                className="h-6 w-6 rounded border border-slate-500/70 bg-slate-800/80 text-slate-200 hover:border-cyan-300/60 hover:text-cyan-200"
                onClick={() => setIsCollapsed(true)}
                title="Collapse study controls"
                aria-label="Collapse study controls"
              >
                x
              </button>
            </div>
          </div>

          {panelMode === 'participant' ? (
            <div className="space-y-2.5 p-3">
              <div className="rounded border border-cyan-400/40 bg-cyan-500/10 p-2">
                <div className="text-[10px] uppercase tracking-wide text-cyan-200">Current Task</div>
                <div className="mt-1 text-xs text-slate-100">{moduleChecklist}</div>
                <div className="mt-1 text-[10px] text-slate-300">{conditionSummary}</div>
              </div>
              <div className="rounded border border-slate-700/70 bg-slate-900/45 p-2">
                <div className="text-[10px] uppercase tracking-wide text-slate-300">Participant Prompt</div>
                <div className="mt-1 text-xs text-slate-100">{participantPrompt}</div>
              </div>
              <div className="rounded border border-slate-700/70 bg-slate-900/45 p-2">
                <div className="text-[10px] uppercase tracking-wide text-slate-300">Live Progress</div>
                <div className="mt-1 text-[10px] text-slate-200">{taskProgressLabel}</div>
                <div className="text-[10px] text-slate-300">{isTaskActive ? 'Task is running' : 'Waiting for facilitator to start task'}</div>
              </div>
              <button
                className="w-full rounded border border-slate-500/70 bg-slate-800/75 px-2 py-1 text-slate-100 hover:border-cyan-300/50 hover:text-cyan-200"
                onClick={() => setPanelMode('facilitator')}
              >
                Switch to Facilitator Controls
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 p-3">
              <div className="rounded border border-slate-700/70 bg-slate-900/50 px-2 py-1.5">
                <div className="text-[10px] text-slate-400">Session</div>
                <div className="break-all font-mono text-[10px] text-slate-200">{sessionId}</div>
                <div className="mt-1 text-[10px] text-slate-300">Events Logged: {eventCount}</div>
                <div className="text-[10px] text-slate-300">Alert Batch: {alertBatchId}</div>
              </div>

              <label className="block">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-300">Participant ID</div>
                <input
                  className="w-full rounded border border-slate-500/70 bg-slate-900/90 px-2 py-1 text-[11px]"
                  placeholder="P-01"
                  value={participantId}
                  onChange={(e) => onParticipantIdChange(e.target.value)}
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label>
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-300">Module</div>
                  <select
                    className="w-full rounded border border-slate-500/70 bg-slate-900/90 px-2 py-1 text-[11px] disabled:opacity-60"
                    value={module}
                    onChange={(e) => onModuleChange(e.target.value as StudyModule)}
                    disabled={isTaskActive}
                  >
                    <option value="control-groups">Control Groups</option>
                    <option value="alerts">Alerts</option>
                    <option value="minimap">Minimap</option>
                  </select>
                </label>

                <label>
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-300">Condition</div>
                  <select
                    className="w-full rounded border border-slate-500/70 bg-slate-900/90 px-2 py-1 text-[11px] disabled:opacity-60"
                    value={condition}
                    onChange={(e) => onConditionChange(e.target.value as 'A' | 'B')}
                    disabled={isTaskActive}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </label>
              </div>

              <div className="rounded border border-slate-700/70 bg-slate-900/45 p-2 text-[10px] text-slate-200">
                <div className="mb-1 uppercase tracking-wide text-slate-300">Task Checklist</div>
                <div>{moduleChecklist}</div>
                <div className="mt-1 text-slate-400">{conditionSummary}</div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  className="rounded border border-cyan-300/45 bg-cyan-500/25 px-2 py-1 font-medium text-cyan-100 hover:bg-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={onStartTask}
                  disabled={isTaskActive}
                >
                  Start
                </button>
                <button
                  className="rounded border border-emerald-300/45 bg-emerald-500/25 px-2 py-1 font-medium text-emerald-100 hover:bg-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={onCompleteTask}
                  disabled={!isTaskActive}
                >
                  Complete
                </button>
                <button
                  className="rounded border border-rose-300/45 bg-rose-500/25 px-2 py-1 font-medium text-rose-100 hover:bg-rose-500/35 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={onFailTask}
                  disabled={!isTaskActive}
                >
                  Fail
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  className="rounded border border-cyan-300/45 bg-cyan-500/20 px-2 py-1 font-medium text-cyan-100 hover:bg-cyan-500/35"
                  onClick={onResetScenario}
                >
                  Reset Scenario
                </button>
                <button
                  className="rounded border border-red-300/45 bg-red-500/20 px-2 py-1 font-medium text-red-100 hover:bg-red-500/35 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={onTriggerMinimapStatus}
                  disabled={module !== 'minimap'}
                >
                  Trigger Red Status
                </button>
              </div>

              {isGroupEditMode && (
                <button
                  className="w-full rounded border border-amber-300/40 bg-amber-500/25 px-2 py-1 font-medium text-amber-100 hover:bg-amber-500/35"
                  onClick={onExitGroupEditMode}
                >
                  Exit Group Edit Mode
                </button>
              )}

              <div className="rounded border border-slate-700/70 bg-slate-900/45 p-2">
                <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-300">Live Task Signals</div>
                <div className="space-y-1 text-[10px] text-slate-200">
                  <div>{taskProgressLabel}</div>
                  <div>Distance to nearest target: {latestDistanceToTargetKm === null ? '--' : `${latestDistanceToTargetKm} km`}</div>
                  <div>Minimap red status visible: {minimapStatusVisible ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className={`rounded border p-2 ${recordingHealthy ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-amber-400/50 bg-amber-500/10'}`}>
                <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-200">Data Capture Health</div>
                <div className="text-[10px] text-slate-200">{recordingHealthy ? 'Ready: required setup checks look good.' : 'Action needed before next run:'}</div>
                {!recordingHealthy && (
                  <div className="mt-1 space-y-1 text-[10px] text-amber-100">
                    {recordingIssues.map((issue) => (
                      <div key={issue}>- {issue}</div>
                    ))}
                  </div>
                )}
                <div className="mt-1 text-[10px] text-slate-300">{lastTaskSummaryText}</div>
              </div>

              {module === 'control-groups' && (
                <div className="rounded border border-slate-700/70 bg-slate-900/45 p-2">
                  <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-300">Control Group Targets</div>
                  <div className="space-y-1 text-[10px]">
                    {controlAssignmentRows.map((row) => (
                      <div key={row.groupId} className="flex items-center justify-between gap-2">
                        <span className="text-slate-200">G{row.groupId} {row.label}</span>
                        <span className={row.assignedTargetName === null ? 'text-slate-400' : row.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                          {row.assignedTargetName ?? 'Unassigned'} / {row.expectedTargetName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded border border-slate-700/70 bg-slate-900/45 p-2">
                <div className="mb-1.5 text-[10px] uppercase tracking-wide text-slate-300">NASA-TLX + Clarity</div>

                <div className="grid grid-cols-2 gap-1.5">
                  <label>
                    <div className="text-[10px] text-slate-300">Mental</div>
                    <input type="number" min={0} max={100} className={scoreInputClassName} value={scores.mental} onChange={(e) => updateScore('mental', Number(e.target.value))} />
                  </label>
                  <label>
                    <div className="text-[10px] text-slate-300">Physical</div>
                    <input type="number" min={0} max={100} className={scoreInputClassName} value={scores.physical} onChange={(e) => updateScore('physical', Number(e.target.value))} />
                  </label>
                  <label>
                    <div className="text-[10px] text-slate-300">Temporal</div>
                    <input type="number" min={0} max={100} className={scoreInputClassName} value={scores.temporal} onChange={(e) => updateScore('temporal', Number(e.target.value))} />
                  </label>
                  <label>
                    <div className="text-[10px] text-slate-300">Performance</div>
                    <input type="number" min={0} max={100} className={scoreInputClassName} value={scores.performance} onChange={(e) => updateScore('performance', Number(e.target.value))} />
                  </label>
                  <label>
                    <div className="text-[10px] text-slate-300">Effort</div>
                    <input type="number" min={0} max={100} className={scoreInputClassName} value={scores.effort} onChange={(e) => updateScore('effort', Number(e.target.value))} />
                  </label>
                  <label>
                    <div className="text-[10px] text-slate-300">Frustration</div>
                    <input type="number" min={0} max={100} className={scoreInputClassName} value={scores.frustration} onChange={(e) => updateScore('frustration', Number(e.target.value))} />
                  </label>
                </div>

                <label className="mt-1.5 block">
                  <div className="text-[10px] text-slate-300">Clarity (0-10)</div>
                  <input type="number" min={0} max={10} className={scoreInputClassName} value={scores.clarity} onChange={(e) => updateScore('clarity', Number(e.target.value))} />
                </label>

                <button
                  className="mt-1.5 w-full rounded border border-indigo-300/45 bg-indigo-500/25 px-2 py-1 font-medium text-indigo-100 hover:bg-indigo-500/35"
                  onClick={() => onSubmitWorkload(scores)}
                >
                  Save TLX + Clarity
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  className="rounded border border-slate-500/70 bg-slate-800/75 px-2 py-1 text-slate-100 hover:border-cyan-300/50 hover:text-cyan-200"
                  onClick={onExportJson}
                >
                  Export JSON
                </button>
                <button
                  className="rounded border border-slate-500/70 bg-slate-800/75 px-2 py-1 text-slate-100 hover:border-cyan-300/50 hover:text-cyan-200"
                  onClick={onExportCsv}
                >
                  Export CSV
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
