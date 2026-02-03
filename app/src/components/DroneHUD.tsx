import { ChevronLeft, ChevronRight, Battery, Signal, Maximize2, Minimize2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import type { Drone } from '../App';
import type { Alert } from './AlertsPanel';

// Reusable Crosshair Component
function Crosshair({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="text-white">
      <line x1="20" y1="0" x2="20" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="20" y1="24" x2="20" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="0" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="24" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="20" cy="20" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

interface DroneHUDProps {
  selectedDroneId: string;
  onSwitchMainView: (droneId: string) => void;
  selectedGroup: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  groupDrones: Drone[];
  allDrones: Drone[];
  onSwitchToMapView: () => void;
  alerts: Alert[];
  expandedAlert: number | null;
  onToggleAlert: (alertId: number) => void;
  onDismissAlert: (alertId: number) => void;
  onGoToAlert?: (alert: Alert) => void;
}

interface DroneStats {
  speed: number;
  altitude: number;
  battery: number;
  connection: number; // 0-4 bars
  heading: number; // 0-360 degrees
}

export function DroneHUD({ 
  selectedDroneId, 
  onSwitchMainView, 
  selectedGroup, 
  groupDrones, 
  allDrones, 
  onSwitchToMapView,
  alerts,
  expandedAlert,
  onToggleAlert,
  onDismissAlert,
  onGoToAlert
}: DroneHUDProps) {
  const [currentDrone, setCurrentDrone] = useState(selectedDroneId);
  const [isFullMapView, setIsFullMapView] = useState(false);

  // Get stats from actual drones
  const currentDroneData = groupDrones.find(d => d.id === currentDrone) || groupDrones[0];
  const mainDroneData = groupDrones.find(d => d.id === selectedDroneId) || groupDrones[0];

  const currentStats = {
    speed: currentDroneData.speed,
    altitude: currentDroneData.altitude,
    battery: currentDroneData.battery,
    connection: currentDroneData.connection,
    heading: currentDroneData.heading
  };

  const mainStats = {
    speed: mainDroneData.speed,
    altitude: mainDroneData.altitude,
    battery: mainDroneData.battery,
    connection: mainDroneData.connection,
    heading: mainDroneData.heading
  };

  const batteryColor = currentStats.battery > 75 ? 'bg-green-500' : currentStats.battery > 50 ? 'bg-yellow-500' : 'bg-red-500';

  // Helper function to get direction label from heading
  const getDirectionLabel = (heading: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((heading % 360) / 45)) % 8;
    return directions[index];
  };

  const nextDrone = () => {
    const currentIndex = groupDrones.findIndex(d => d.id === currentDrone);
    const nextIndex = (currentIndex + 1) % groupDrones.length;
    setCurrentDrone(groupDrones[nextIndex].id);
  };

  const prevDrone = () => {
    const currentIndex = groupDrones.findIndex(d => d.id === currentDrone);
    const prevIndex = currentIndex === 0 ? groupDrones.length - 1 : currentIndex - 1;
    setCurrentDrone(groupDrones[prevIndex].id);
  };

  const handleSwitchToThisDrone = () => {
    onSwitchMainView(currentDrone);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Center Crosshairs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Crosshair size={60} />
      </div>

      {/* Top Center - First Person Compass */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-sm px-12 py-3 rounded border border-white/20">
          <div className="relative">
            {/* Compass tick marks - more ticks for wider compass */}
            <div className="flex items-center justify-center gap-1 mb-2">
              {[-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60].map((offset) => (
                <div key={offset} className="flex flex-col items-center">
                  <div 
                    className={`w-0.5 bg-white ${offset === 0 ? 'h-4' : offset % 20 === 0 ? 'h-3' : 'h-2'}`}
                    style={{ opacity: 1 - Math.abs(offset) / 70 }}
                  />
                </div>
              ))}
            </div>
            
            {/* Center indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-red-500" />
            
            {/* Degree and direction */}
            <div className="text-center text-white">
              <div className="text-xl font-mono">{mainStats.heading}° <span className="text-sm ml-1">{getDirectionLabel(mainStats.heading)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right - Always Visible Map View */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded border border-white/20 p-2 w-56">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-white text-xs opacity-60">Map</div>
            <Button 
              onClick={() => onSwitchToMapView()}
              className="h-6 px-1.5 bg-white/20 hover:bg-white/30 text-white"
              size="sm"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="relative w-full h-32 rounded overflow-hidden border border-white/30">
            <img 
              src="https://images.unsplash.com/photo-1517917635448-93c0dc320860?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRlbGxpdGUlMjBtYXAlMjB0ZXJyYWlufGVufDF8fHx8MTc2MjcyMjQ4OHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Map view"
              className="w-full h-full object-cover opacity-90"
            />
            {/* Drone markers overlay */}
            <div className="absolute inset-0">
              {/* Current drone marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-blue-500 rounded-full border border-white animate-pulse" />
              </div>
              {/* Other drone markers */}
              <div className="absolute top-[30%] left-[40%]">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full border border-white" />
              </div>
              <div className="absolute top-[60%] left-[70%]">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full border border-white" />
              </div>
              <div className="absolute top-[40%] left-[65%]">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full border border-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left - Cohesive Drone Control Section */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div className="space-y-2">
          {/* Manual Control Button */}
          <Button className="w-full bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 text-white">
            Manual Control
          </Button>

          {/* Main panel with FPV view and stats */}
          <div className="bg-black/40 backdrop-blur-sm rounded border border-white/20 p-3">
            <div className="flex gap-3">
              {/* Other Drone FPV View with navigation */}
              <div className="relative">
                <div className="text-white text-xs mb-1">Drone {currentDrone}</div>
                <div 
                  className="relative w-48 h-32 rounded overflow-hidden border border-white/30 cursor-pointer hover:border-white/50 transition-all"
                  onClick={handleSwitchToThisDrone}
                >
                  <img 
                    src={groupDrones.find(drone => drone.id === currentDrone)?.fpvView}
                    alt={`Drone ${currentDrone} FPV view`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Click indicator */}
                  <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-all flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 text-white text-xs bg-black/60 px-2 py-1 rounded">
                      Tap to switch
                    </div>
                  </div>
                  
                  {/* Navigation arrows */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevDrone(); }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1 rounded z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextDrone(); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1 rounded z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Small crosshair on preview */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <Crosshair size={20} />
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="flex flex-col justify-between text-white">
                {/* Speed and Altitude */}
                <div className="space-y-2">
                  <div className="bg-white/10 px-3 py-1.5 rounded">
                    <div className="text-xs opacity-60">SPEED</div>
                    <div className="font-mono">{currentStats.speed} km/h</div>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded">
                    <div className="text-xs opacity-60">ALTITUDE</div>
                    <div className="font-mono">{currentStats.altitude} m</div>
                  </div>
                </div>

                {/* Battery and Connection */}
                <div className="space-y-2">
                  <div className="bg-white/10 px-3 py-1.5 rounded">
                    <div className="flex items-center gap-2">
                      <Battery className="w-3 h-3" />
                      <span className="text-sm">{currentStats.battery}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full ${batteryColor} rounded-full`}
                        style={{ width: `${currentStats.battery}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded">
                    <div className="flex items-center gap-2">
                      <Signal className="w-3 h-3" />
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map((bar) => (
                          <div 
                            key={bar}
                            className={`w-1 rounded-sm ${
                              bar <= currentStats.connection 
                                ? 'bg-green-500' 
                                : 'bg-white/30'
                            }`}
                            style={{ height: `${bar * 3}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right - Alert Stack */}
      <div className="absolute bottom-6 right-6 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded border border-white/20 p-2 w-56">
          <div className="text-white text-xs mb-1.5 opacity-60">Alerts</div>
          <div className="space-y-1.5">
            {alerts.length === 0 ? (
              <div className="text-white/60 text-xs text-center py-2">
                No alerts
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id}
                  onClick={() => onToggleAlert(alert.id)}
                  className="bg-white/10 hover:bg-white/20 px-2 py-1.5 rounded cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-1.5">
                    {alert.type === 'warning' && <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />}
                    {alert.type === 'info' && <AlertCircle className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />}
                    {alert.type === 'success' && <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs">{alert.message}</div>
                      <div className="text-white/60 text-xs mt-0.5">{alert.time}</div>
                      {expandedAlert === alert.id && alert.details && (
                        <div className="mt-1.5 pt-1.5 border-t border-white/20 text-xs text-white/80">
                          <div className="text-xs mb-1.5">{alert.details}</div>
                          <div className="flex gap-1.5">
                            <Button 
                              className="h-6 text-xs bg-white/20 hover:bg-white/30 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                onGoToAlert?.(alert);
                              }}
                            >
                              Go to Alert
                            </Button>
                            <Button 
                              className="h-6 text-xs bg-white/20 hover:bg-white/30 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDismissAlert(alert.id);
                              }}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Corner frame indicators */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/30" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/30" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/30" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/30" />

      {/* Full Screen Map View Overlay */}
      {isFullMapView && (
        <div className="absolute inset-0 bg-black pointer-events-auto z-50">
          {/* Map Background */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1517917635448-93c0dc320860?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRlbGxpdGUlMjBtYXAlMjB0ZXJyYWlufGVufDF8fHx8MTc2MjcyMjQ4OHww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Full map view"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Map UI Overlay */}
          <div className="absolute inset-0">
            {/* Close/Minimize button */}
            <div className="absolute top-6 right-6">
              <Button 
                onClick={() => setIsFullMapView(false)}
                className="bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 text-white"
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                FPV View
              </Button>
            </div>

            {/* Drone markers with click to view FPV */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-6 h-6 bg-blue-500 rounded-full border-3 border-white animate-pulse" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-sm whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                  Your Drone
                </div>
              </div>
            </div>
            
            {[1, 2, 3, 4, 5].map((droneNum) => {
              const positions = [
                { top: '30%', left: '40%' },
                { top: '60%', left: '70%' },
                { top: '40%', left: '65%' },
                { top: '25%', left: '55%' },
                { top: '70%', left: '45%' },
              ];
              return (
                <div key={droneNum} className={`absolute`} style={positions[droneNum - 1]}>
                  <button
                    onClick={() => {
                      setCurrentDrone(droneNum);
                      setIsFullMapView(false);
                    }}
                    className="relative hover:scale-110 transition-transform"
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-white text-xs whitespace-nowrap bg-black/60 px-2 py-1 rounded">
                      Drone {droneNum}
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Map legend */}
            <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-sm border border-white/20 p-3 rounded">
              <div className="text-white text-sm mb-2">Legend</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-white text-xs">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border border-white" />
                  <span>Your Position</span>
                </div>
                <div className="flex items-center gap-2 text-white text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-white" />
                  <span>Other Drones (tap to view)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}