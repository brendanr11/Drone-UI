import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Drone } from "@/components/App";

interface DroneGroupInfoPanelProps {
  selectedGroup: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  drones: Drone[];
}

export function DroneGroupInfoPanel({ selectedGroup, drones }: DroneGroupInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate group stats
  const minBattery = drones.length > 0 ? Math.min(...drones.map(d => d.battery)) : 0;
  const avgBattery = drones.length > 0 
    ? Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length) 
    : 0;
  const activeDrones = drones.length;
  // Simulated distance to target - in a real app this would be calculated based on actual positions
  const distanceToTarget = 2.4;

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-w-[250px]">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="text-white">Control Group {selectedGroup}</div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">MIN BATTERY</span>
            <span className="text-white">{minBattery}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">AVG BATTERY</span>
            <span className="text-white">{avgBattery}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">DISTANCE TO TARGET</span>
            <span className="text-white">{distanceToTarget} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">ACTIVE DRONES</span>
            <span className="text-white">{activeDrones}</span>
          </div>
        </div>
      )}
    </div>
  );
}