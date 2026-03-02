import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Waypoint {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'waypoint' | 'home' | 'target';
  lat?: number;
  lng?: number;
}

interface WaypointDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, lat: number, lng: number, type: Waypoint['type']) => void;
  waypoint: Waypoint;
}

export function WaypointDialog({ isOpen, onClose, onSave, waypoint }: WaypointDialogProps) {
  const [name, setName] = useState(waypoint.name);
  const [lat, setLat] = useState(waypoint.lat?.toString() || '0');
  const [lng, setLng] = useState(waypoint.lng?.toString() || '0');
  const [type, setType] = useState<Waypoint['type']>(waypoint.type);

  useEffect(() => {
    setName(waypoint.name);
    setLat(waypoint.lat?.toString() || '0');
    setLng(waypoint.lng?.toString() || '0');
    setType(waypoint.type);
  }, [waypoint]);

  const handleSave = () => {
    onSave(name, parseFloat(lat), parseFloat(lng), type);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Edit Waypoint</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the waypoint name and coordinates below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter waypoint name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-300">Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as Waypoint['type'])}
              className="w-full h-9 rounded-md bg-slate-700 border border-slate-600 px-3 text-sm text-white"
            >
              <option value="waypoint">Waypoint</option>
              <option value="target">Target</option>
              <option value="home">Home Base</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat" className="text-slate-300">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="37.7749"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lng" className="text-slate-300">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="-122.4194"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
