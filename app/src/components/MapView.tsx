import { useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { WaypointDialog } from './WaypointDialog';
import type { Drone } from "@/components/App";

interface POI {
  id: string;
  name: string;
  x: number; // percentage
  y: number; // percentage
  type: 'waypoint' | 'home' | 'target';
  lat?: number;
  lng?: number;
}

interface MapViewProps {
  selectedGroup: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  selectedDroneId: string;
  onSelectDrone: (droneId: string) => void;
  groupDrones: Drone[];
  allDrones: Drone[];
  onSwitchToFPVView: (droneId: string) => void;
}

const initialPOIs: POI[] = [
  { id: '1', name: 'Home Base', x: 20, y: 30, type: 'home', lat: 37.7749, lng: -122.4194 },
  { id: '2', name: 'Waypoint 1', x: 40, y: 45, type: 'waypoint', lat: 37.7849, lng: -122.4094 },
  { id: '3', name: 'Waypoint 2', x: 60, y: 35, type: 'waypoint', lat: 37.7949, lng: -122.3994 },
  { id: '4', name: 'Target Zone', x: 75, y: 55, type: 'target', lat: 37.8049, lng: -122.3894 },
  { id: '5', name: 'Waypoint 3', x: 50, y: 70, type: 'waypoint', lat: 37.8149, lng: -122.3794 },
];

// Simulated drone positions on the map - now keyed by drone ID string
const droneMapPositions: Record<string, { x: number; y: number }> = {
  // Group 1
  '1-1': { x: 35, y: 40 },
  '1-2': { x: 48, y: 52 },
  '1-3': { x: 62, y: 38 },
  '1-4': { x: 55, y: 65 },
  '1-5': { x: 42, y: 48 },
  '1-6': { x: 68, y: 44 },
  '1-7': { x: 50, y: 58 },
  '1-8': { x: 58, y: 50 },
  // Group 2
  '2-1': { x: 32, y: 42 },
  '2-2': { x: 52, y: 48 },
  '2-3': { x: 65, y: 40 },
  '2-4': { x: 45, y: 60 },
  // Group 3
  '3-1': { x: 38, y: 45 },
  '3-2': { x: 58, y: 52 },
  '3-3': { x: 72, y: 46 },
  // Group 4
  '4-1': { x: 28, y: 36 },
  '4-2': { x: 56, y: 44 },
  '4-3': { x: 66, y: 58 },
  // Group 5
  '5-1': { x: 40, y: 54 },
  '5-2': { x: 52, y: 62 },
  '5-3': { x: 74, y: 50 },
  // Group 6
  '6-1': { x: 30, y: 48 },
  '6-2': { x: 62, y: 56 },
  '6-3': { x: 70, y: 42 },
  // Group 7
  '7-1': { x: 25, y: 35 },
  '7-2': { x: 55, y: 42 },
  '7-3': { x: 70, y: 52 },
};

export function MapView({ selectedGroup, selectedDroneId, onSelectDrone, groupDrones, allDrones, onSwitchToFPVView }: MapViewProps) {
  const [pois, setPois] = useState<POI[]>(initialPOIs);
  const [draggedPOI, setDraggedPOI] = useState<string | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredDrone, setHoveredDrone] = useState<string | null>(null);
  const [boxSelectStart, setBoxSelectStart] = useState<{ x: number; y: number } | null>(null);
  const [boxSelectCurrent, setBoxSelectCurrent] = useState<{ x: number; y: number } | null>(null);
  const [boxSelectedDrones, setBoxSelectedDrones] = useState<Set<string>>(new Set());
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(1);
  const [isTwoFingerGesture, setIsTwoFingerGesture] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const transformedMapRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getPOIColor = (type: POI['type']) => {
    switch (type) {
      case 'home':
        return 'bg-green-500';
      case 'target':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const calculateDronesInBox = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    if (!transformedMapRef.current) return new Set<string>();

    const rect = transformedMapRef.current.getBoundingClientRect();
    
    // Calculate box bounds in screen coordinates
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const selected = new Set<string>();
    
    allDrones.forEach(drone => {
      const position = droneMapPositions[drone.id];
      if (!position) return;

      // Convert drone position percentage to screen coordinates
      const droneScreenX = rect.left + (position.x / 100) * rect.width;
      const droneScreenY = rect.top + (position.y / 100) * rect.height;

      // Check if drone is within selection box
      if (droneScreenX >= minX && droneScreenX <= maxX && 
          droneScreenY >= minY && droneScreenY <= maxY) {
        selected.add(drone.id);
      }
    });

    return selected;
  };

  // Touch handlers for the map container
  const handleMapTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger gesture for pan/zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setDragStart({ x: centerX, y: centerY });
      setInitialPinchDistance(Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY));
      setInitialZoom(zoom);
      setIsTwoFingerGesture(true);
      setIsDragging(true);
      // Clear any box selection
      setBoxSelectStart(null);
      setBoxSelectCurrent(null);
    } else if (e.touches.length === 1 && !draggedPOI) {
      // Single-finger gesture on map background = box select
      const touch = e.touches[0];
      setBoxSelectStart({ x: touch.clientX, y: touch.clientY });
      setBoxSelectCurrent({ x: touch.clientX, y: touch.clientY });
      setBoxSelectedDrones(new Set());
    }
  };

  const handleMapTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isTwoFingerGesture) {
      // Two-finger pan and pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      // Handle pinch to zoom
      const currentPinchDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      if (initialPinchDistance !== null) {
        const scale = currentPinchDistance / initialPinchDistance;
        const newZoom = initialZoom * scale;
        setZoom(Math.max(0.5, Math.min(3, newZoom)));
      }
      
      // Handle two-finger pan
      const deltaX = centerX - dragStart.x;
      const deltaY = centerY - dragStart.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setDragStart({ x: centerX, y: centerY });
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      
      if (draggedPOI && transformedMapRef.current) {
        // Dragging a POI
        const rect = transformedMapRef.current.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        
        setPois(prev => 
          prev.map(poi => 
            poi.id === draggedPOI 
              ? { ...poi, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
              : poi
          )
        );
      } else if (boxSelectStart) {
        // Update box selection
        setBoxSelectCurrent({ x: touch.clientX, y: touch.clientY });
        const selected = calculateDronesInBox(boxSelectStart, { x: touch.clientX, y: touch.clientY });
        setBoxSelectedDrones(selected);
      }
    }
  };

  const handleMapTouchEnd = () => {
    setIsDragging(false);
    setIsTwoFingerGesture(false);
    setInitialPinchDistance(null);
    setDraggedPOI(null);
    
    // Clear box selection after a moment
    if (boxSelectStart) {
      setTimeout(() => {
        setBoxSelectStart(null);
        setBoxSelectCurrent(null);
      }, 100);
    }
  };

  // POI touch handlers
  const handlePOITouchStart = (poiId: string, e: React.TouchEvent) => {
    e.stopPropagation();
    setDraggedPOI(poiId);
  };

  const handlePOITap = (poi: POI, e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
      // Double tap = open dialog
      setSelectedPOI(poi);
      setIsDialogOpen(true);
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        tapTimeoutRef.current = null;
      }, 300);
    }
  };

  // Drone touch handlers
  const handleDroneTap = (droneId: string, e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    // Clear box selection when tapping individual drone
    setBoxSelectedDrones(new Set());
    onSwitchToFPVView(droneId);
  };

  const handleWaypointSave = (name: string, lat: number, lng: number) => {
    if (selectedPOI) {
      setPois(prev =>
        prev.map(poi =>
          poi.id === selectedPOI.id
            ? { ...poi, name, lat, lng }
            : poi
        )
      );
    }
    setIsDialogOpen(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 75) return 'bg-green-500';
    if (battery > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCursorStyle = () => {
    if (isTwoFingerGesture || isDragging) return 'grabbing';
    if (draggedPOI) return 'move';
    if (boxSelectStart) return 'crosshair';
    return 'default';
  };

  return (
    <div 
      ref={mapRef}
      className="w-full h-full relative overflow-hidden select-none"
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={handleMapTouchStart}
      onTouchMove={handleMapTouchMove}
      onTouchEnd={handleMapTouchEnd}
      style={{ cursor: getCursorStyle(), touchAction: 'none' }}
    >
      {/* Large Map Canvas */}
      <div
        ref={transformedMapRef}
        className="absolute"
        style={{
          width: '300vw',
          height: '300vh',
          left: `calc(50% - 150vw + ${pan.x}px)`,
          top: `calc(50% - 150vh + ${pan.y}px)`,
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          background: 'linear-gradient(135deg, #9fdfb0 0%, #b8e6c0 25%, #a8d5a8 50%, #c5e5ce 75%, #d0e8d8 100%)',
        }}
      >
        {/* Map Grid */}
        <div className="absolute inset-0">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(100, 120, 100, 0.15)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Map Features - Grassy areas and buildings */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grassy parks */}
          <div className="absolute rounded-full opacity-70" style={{ 
            left: '15%', top: '20%', width: '12%', height: '18%', 
            background: 'radial-gradient(circle, #7fb587 0%, #9fdfb0 100%)' 
          }} />
          <div className="absolute rounded-full opacity-70" style={{ 
            left: '60%', top: '50%', width: '15%', height: '22%', 
            background: 'radial-gradient(circle, #7fb587 0%, #9fdfb0 100%)' 
          }} />
          <div className="absolute rounded-full opacity-60" style={{ 
            left: '35%', top: '65%', width: '10%', height: '15%', 
            background: 'radial-gradient(circle, #6fa577 0%, #8fcc98 100%)' 
          }} />
          <div className="absolute rounded-full opacity-65" style={{ 
            left: '80%', top: '75%', width: '8%', height: '12%', 
            background: 'radial-gradient(circle, #7fb587 0%, #9fdfb0 100%)' 
          }} />
          <div className="absolute rounded-full opacity-60" style={{ 
            left: '10%', top: '8%', width: '14%', height: '10%', 
            background: 'radial-gradient(circle, #6fa577 0%, #8fcc98 100%)' 
          }} />
          
          {/* Roads - Light grey paths */}
          <div className="absolute bg-slate-300/40 border-y border-slate-400/30" style={{ 
            left: '0%', top: '35%', width: '100%', height: '2%' 
          }} />
          <div className="absolute bg-slate-300/40 border-x border-slate-400/30" style={{ 
            left: '40%', top: '0%', width: '2%', height: '100%' 
          }} />
          <div className="absolute bg-slate-300/40 border-x border-slate-400/30" style={{ 
            left: '65%', top: '0%', width: '2%', height: '100%' 
          }} />
          
          {/* Building Blocks - Grey */}
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '25%', top: '30%', width: '8%', height: '10%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">Office Complex</div>
          </div>
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '48%', top: '42%', width: '9%', height: '12%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">Shopping Center</div>
          </div>
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '68%', top: '62%', width: '10%', height: '9%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">Warehouse</div>
          </div>
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '42%', top: '15%', width: '7%', height: '8%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">Hospital</div>
          </div>
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '12%', top: '38%', width: '6%', height: '7%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">School</div>
          </div>
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '70%', top: '28%', width: '9%', height: '11%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">Factory</div>
          </div>
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '28%', top: '72%', width: '8%', height: '6%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">Station</div>
          </div>
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '82%', top: '45%', width: '7%', height: '9%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">Depot</div>
          </div>
          <div className="absolute bg-slate-400/40 border border-slate-500/30 rounded pointer-events-auto" style={{ 
            left: '55%', top: '78%', width: '6%', height: '8%' 
          }}>
            <div className="text-slate-600 text-xs p-2 pointer-events-none">Tower</div>
          </div>
          
          {/* Parking Lots - Darker grey with stripes */}
          <div className="absolute bg-slate-500/30 border border-slate-600/30 rounded pointer-events-auto" style={{ 
            left: '44%', top: '56%', width: '5%', height: '6%' 
          }}>
            <div className="text-slate-700 text-xs p-1 pointer-events-none">Parking</div>
          </div>
          <div className="absolute bg-slate-500/30 border border-slate-600/30 rounded pointer-events-auto" style={{ 
            left: '20%', top: '48%', width: '4%', height: '5%' 
          }}>
            <div className="text-slate-700 text-xs p-1 pointer-events-none">Parking</div>
          </div>
          
          {/* Helipad marker */}
          <div className="absolute bg-orange-400/40 border-2 border-orange-500/50 rounded-full flex items-center justify-center pointer-events-auto" style={{ 
            left: '88%', top: '68%', width: '3%', height: '4.5%' 
          }}>
            <div className="text-orange-700 pointer-events-none">H</div>
          </div>
          
          {/* Water feature - Light blue pond */}
          <div className="absolute rounded-full opacity-50" style={{ 
            left: '8%', top: '82%', width: '12%', height: '10%', 
            background: 'radial-gradient(circle, #6bb6ff 0%, #89cff0 100%)' 
          }} />
          
          {/* Darker green forested areas */}
          <div className="absolute opacity-50" style={{ 
            left: '5%', top: '55%', width: '18%', height: '20%', 
            background: 'radial-gradient(ellipse, #5a8a62 0%, #7fb587 100%)' 
          }} />
          <div className="absolute opacity-50" style={{ 
            left: '70%', top: '20%', width: '20%', height: '25%', 
            background: 'radial-gradient(ellipse, #5a8a62 0%, #7fb587 100%)' 
          }} />
          <div className="absolute opacity-50" style={{ 
            left: '45%', top: '85%', width: '15%', height: '12%', 
            background: 'radial-gradient(ellipse, #5a8a62 0%, #7fb587 100%)' 
          }} />
        </div>

        {/* Flight path lines with arrows */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" opacity="0.7" />
            </marker>
          </defs>
          
          {/* Draw lines between POIs */}
          {pois.map((poi, index) => {
            if (index < pois.length - 1) {
              const nextPoi = pois[index + 1];
              return (
                <g key={`path-${poi.id}`}>
                  <line
                    x1={`${poi.x}%`}
                    y1={`${poi.y}%`}
                    x2={`${nextPoi.x}%`}
                    y2={`${nextPoi.y}%`}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    opacity="0.6"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            }
            return null;
          })}
        </svg>

        {/* POIs (Waypoints, Targets, Home) */}
        {pois.map(poi => (
          <div
            key={poi.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-move z-10 pointer-events-auto"
            style={{
              left: `${poi.x}%`,
              top: `${poi.y}%`,
            }}
            onTouchStart={(e) => handlePOITouchStart(poi.id, e)}
            onClick={(e) => handlePOITap(poi, e)}
          >
            <div className={`${getPOIColor(poi.type)} rounded-full p-2 border-2 border-white shadow-lg active:scale-110 transition-transform`}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
              {poi.name}
            </div>
          </div>
        ))}

        {/* Drone Markers */}
        {allDrones.map(drone => {
          const position = droneMapPositions[drone.id] || { x: 50, y: 50 };
          const isSelected = drone.id === selectedDroneId;
          const isBoxSelected = boxSelectedDrones.has(drone.id);
          
          return (
            <div
              key={drone.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 pointer-events-auto"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
              onClick={(e) => handleDroneTap(drone.id, e)}
              onTouchEnd={(e) => {
                // Only trigger if not in box select mode
                if (!boxSelectStart) {
                  handleDroneTap(drone.id, e);
                }
              }}
              onMouseEnter={() => setHoveredDrone(drone.id)}
              onMouseLeave={() => setHoveredDrone(null)}
            >
              <div className={`relative ${isSelected ? 'scale-125' : 'scale-100'} transition-transform`}>
                {/* Box selection highlight ring */}
                {isBoxSelected && (
                  <div className="absolute inset-0 -m-2 rounded-full border-2 border-blue-400 animate-pulse" />
                )}
                
                <div className={`w-4 h-4 ${getBatteryColor(drone.battery)} rounded-full border-2 ${isBoxSelected ? 'border-blue-400' : 'border-white'} shadow-lg ${isSelected ? 'animate-pulse' : ''}`} />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-xs px-2 py-0.5 rounded pointer-events-none">
                  {drone.name}
                </div>
                
                {/* Drone Info on Hover */}
                {hoveredDrone === drone.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                    <div className="space-y-1">
                      <div><span className="text-slate-400">Battery:</span> {drone.battery}%</div>
                      <div><span className="text-slate-400">Altitude:</span> {drone.altitude}m</div>
                      <div><span className="text-slate-400">Speed:</span> {drone.speed} km/h</div>
                      <div className="text-xs text-blue-400 mt-1">Tap to view FPV</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Box Selection Rectangle */}
      {boxSelectStart && boxSelectCurrent && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-50"
          style={{
            left: Math.min(boxSelectStart.x, boxSelectCurrent.x),
            top: Math.min(boxSelectStart.y, boxSelectCurrent.y),
            width: Math.abs(boxSelectCurrent.x - boxSelectStart.x),
            height: Math.abs(boxSelectCurrent.y - boxSelectStart.y),
          }}
        />
      )}

      {/* Waypoint Edit Dialog */}
      {selectedPOI && (
        <WaypointDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleWaypointSave}
          waypoint={selectedPOI}
        />
      )}

      {/* Map Controls Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm border border-slate-600/50 rounded px-4 py-2 text-slate-300 text-xs z-10">
        <div className="flex gap-6">
          <span>✌️ Two fingers to pan/zoom</span>
          <span>👆 Drag to box select</span>
          <span>🎯 Tap drones for FPV</span>
        </div>
      </div>

      {/* Box Selection Counter */}
      {boxSelectedDrones.size > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-10">
          {boxSelectedDrones.size} drone{boxSelectedDrones.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
