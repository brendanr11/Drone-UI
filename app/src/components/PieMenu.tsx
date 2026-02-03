import { useEffect, useRef } from 'react';
import type { Drone } from '../App';

interface PieMenuProps {
  x: number;
  y: number;
  drones: Drone[];
  selectedDroneId: string;
  onSelectDrone: (droneId: string) => void;
  onClose: () => void;
}

export function PieMenu({ x, y, drones, selectedDroneId, onSelectDrone, onClose }: PieMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  const radius = 120;
  const angleStep = (2 * Math.PI) / drones.length;

  return (
    <div
      ref={menuRef}
      className="fixed z-50"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Center circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-800 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
        <div className="text-white text-xs text-center">
          Select<br/>Drone
        </div>
      </div>

      {/* Drone options in circle */}
      {drones.map((drone, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        const isSelected = drone.id === selectedDroneId;

        return (
          <button
            key={drone.id}
            className={`absolute w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
              isSelected
                ? 'bg-blue-500 border-2 border-white scale-110'
                : 'bg-slate-700 border-2 border-slate-600 hover:bg-slate-600'
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
            }}
            onClick={() => onSelectDrone(drone.id)}
          >
            <div className="text-white text-xs text-center">
              <div>{drone.id}</div>
            </div>
          </button>
        );
      })}

      {/* Connecting lines */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: radius * 2 + 100, height: radius * 2 + 100 }}
      >
        {drones.map((drone, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const dx = Math.cos(angle) * radius;
          const dy = Math.sin(angle) * radius;
          const centerX = (radius * 2 + 100) / 2;
          const centerY = (radius * 2 + 100) / 2;

          return (
            <line
              key={drone.id}
              x1={centerX}
              y1={centerY}
              x2={centerX + dx}
              y2={centerY + dy}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}