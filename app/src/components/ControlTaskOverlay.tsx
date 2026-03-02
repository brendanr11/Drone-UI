interface ControlTaskRow {
  groupId: 1 | 2 | 3;
  label: string;
  expectedTargetName: string;
  assignedTargetName: string | null;
  isCorrect: boolean;
}

interface ControlTaskOverlayProps {
  isVisible: boolean;
  activeGroupId: 1 | 2 | 3;
  rows: ControlTaskRow[];
  onSelectGroup: (groupId: 1 | 2 | 3) => void;
}

export function ControlTaskOverlay({
  isVisible,
  activeGroupId,
  rows,
  onSelectGroup,
}: ControlTaskOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[420px] max-w-[90vw] rounded border border-cyan-300/50 bg-black/75 p-3 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.16em] text-cyan-200">Control Task</div>
      <div className="mt-1 text-xs text-slate-100">
        Select a role, then tap a target marker on the map.
      </div>

      <div className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <button
            key={row.groupId}
            className={`w-full rounded border px-2 py-1 text-left transition-colors ${
              activeGroupId === row.groupId
                ? 'border-cyan-300/80 bg-cyan-500/20'
                : 'border-slate-600/80 bg-slate-900/60 hover:border-cyan-300/50'
            }`}
            onClick={() => onSelectGroup(row.groupId)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-slate-100">
                G{row.groupId} {row.label}
              </div>
              <div
                className={`text-[10px] ${
                  row.assignedTargetName === null
                    ? 'text-slate-400'
                    : row.isCorrect
                      ? 'text-emerald-300'
                      : 'text-rose-300'
                }`}
              >
                {row.assignedTargetName ?? 'Unassigned'} / {row.expectedTargetName}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
