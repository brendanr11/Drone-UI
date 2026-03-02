export interface TelemetryEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  participantId: string;
  module: string;
  condition: string;
  viewMode: string;
  selectedGroup: number;
  eventName: string;
  details: string;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function eventsToCsv(events: TelemetryEvent[]): string {
  if (events.length === 0) {
    return 'id,timestamp,sessionId,participantId,module,condition,viewMode,selectedGroup,eventName,details';
  }

  const headers = Object.keys(events[0]) as Array<keyof TelemetryEvent>;
  const rows = events.map((event) =>
    headers.map((header) => escapeCsvValue(event[header])).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
