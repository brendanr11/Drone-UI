import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PieMenu } from './PieMenu';
import type { Drone } from '../App';

interface StatusPanelProps {
  selectedGroup: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  onGroupChange: (groupId: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  selectedDroneId: string;
  onSelectDrone: (droneId: string) => void;
  groupDrones: Drone[];
  onSwitchToFPVView?: (droneId: string) => void;
}

export function StatusPanel({
  selectedGroup,
  onGroupChange,
  selectedDroneId,
  onSelectDrone,
  groupDrones,
  onSwitchToFPVView
}: StatusPanelProps) {
  const [showPieMenu, setShowPieMenu] = useState(false);
  const [pieMenuPosition, setPieMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    longPressTimerRef.current = setTimeout(() => {
      setPieMenuPosition({ x, y });
      setShowPieMenu(true);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    
    longPressTimerRef.current = setTimeout(() => {
      setPieMenuPosition({ x, y });
      setShowPieMenu(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  
  const selectedDrone = groupDrones.find(d => d.id === selectedDroneId) || groupDrones[0];
  
  // Navigation functions
  const handlePrevDrone = () => {
    const currentIndex = groupDrones.findIndex(d => d.id === selectedDroneId);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : groupDrones.length - 1;
    onSelectDrone(groupDrones[prevIndex].id);
  };

  const handleNextDrone = () => {
    const currentIndex = groupDrones.findIndex(d => d.id === selectedDroneId);
    const nextIndex = currentIndex < groupDrones.length - 1 ? currentIndex + 1 : 0;
    onSelectDrone(groupDrones[nextIndex].id);
  };

  return (
    <>
      <div
        ref={panelRef}
        className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-3 md:p-4 w-64 sm:w-72 md:w-80 lg:w-96"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Group Selector */}
        <div className="mb-3">
          <div className="text-slate-400 text-xs mb-2">Control Group</div>
          <div className="flex gap-1.5 md:gap-2">
            {([1, 2, 3, 4, 5, 6, 7] as const).map((groupId) => (
              <button
                key={groupId}
                onClick={() => onGroupChange(groupId)}
                className={`px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm rounded transition-all ${
                  selectedGroup === groupId
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {groupId}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Drone Info */}
        {selectedDrone && (
          <div className="space-y-2 md:space-y-3">
            {/* Selected Drone Label */}
            <div className="text-slate-400 text-xs">Selected Drone</div>

            {/* FPV Preview with Navigation Arrows */}
            <div className="relative">
              <div 
                className={`relative w-full h-32 md:h-36 lg:h-40 rounded overflow-hidden border border-white/30 bg-slate-900 ${onSwitchToFPVView ? 'cursor-pointer hover:border-blue-500 transition-colors' : ''}`}
                onClick={() => onSwitchToFPVView?.(selectedDrone.id)}
              >
                <img 
                  src={selectedDrone.fpvView}
                  alt={`${selectedDrone.name} FPV`}
                  className="w-full h-full object-cover"
                />
                {/* Crosshair overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg width="30" height="30" viewBox="0 0 40 40" className="text-white opacity-60">
                    <line x1="20" y1="0" x2="20" y2="16" stroke="currentColor" strokeWidth="1" />
                    <line x1="20" y1="24" x2="20" y2="40" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="1" />
                    <line x1="24" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1" />
                    <circle cx="20" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
                {/* Drone Name Overlay */}
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs">
                  {selectedDrone.name}
                </div>
                {/* Tap to view FPV indicator */}
                {onSwitchToFPVView && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-500/80 hover:bg-blue-600/90 px-3 py-1 rounded text-white text-xs transition-colors">
                    Tap to view FPV
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {groupDrones.length > 1 && (
                <>
                  <button
                    onClick={handlePrevDrone}
                    className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 rounded-full p-1 md:p-2 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </button>
                  <button
                    onClick={handleNextDrone}
                    className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 rounded-full p-1 md:p-2 transition-all"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-1.5 md:gap-2 text-xs">
              <div className="bg-slate-800 rounded p-1.5 md:p-2">
                <div className="text-slate-400 text-[10px] md:text-xs">Altitude</div>
                <div className="text-white text-xs md:text-sm">{selectedDrone.altitude}m</div>
              </div>
              <div className="bg-slate-800 rounded p-1.5 md:p-2">
                <div className="text-slate-400 text-[10px] md:text-xs">Speed</div>
                <div className="text-white text-xs md:text-sm">{selectedDrone.speed} km/h</div>
              </div>
              <div className="bg-slate-800 rounded p-1.5 md:p-2">
                <div className="text-slate-400 text-[10px] md:text-xs">Battery</div>
                <div className="text-white text-xs md:text-sm">{selectedDrone.battery}%</div>
              </div>
              <div className="bg-slate-800 rounded p-1.5 md:p-2">
                <div className="text-slate-400 text-[10px] md:text-xs">Signal</div>
                <div className="text-white text-xs md:text-sm">{selectedDrone.connection}/4</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-slate-500 text-center">
          Long-press for drone selection menu
        </div>
      </div>

      {/* Pie Menu */}
      {showPieMenu && (
        <PieMenu
          x={pieMenuPosition.x}
          y={pieMenuPosition.y}
          drones={groupDrones}
          selectedDroneId={selectedDroneId}
          onSelectDrone={(droneId) => {
            onSelectDrone(droneId);
            setShowPieMenu(false);
          }}
          onClose={() => setShowPieMenu(false)}
        />
      )}
    </>
  );
}