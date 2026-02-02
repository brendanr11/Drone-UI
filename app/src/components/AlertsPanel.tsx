import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

export interface Alert {
  id: number;
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
  details?: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
  expandedAlert: number | null;
  onToggleAlert: (alertId: number) => void;
  onDismissAlert: (alertId: number) => void;
  onGoToAlert?: (alert: Alert) => void;
}

export function AlertsPanel({ 
  alerts, 
  expandedAlert, 
  onToggleAlert, 
  onDismissAlert,
  onGoToAlert 
}: AlertsPanelProps) {

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="w-3 h-3 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
  };

  const handleDismissAlert = (alertId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDismissAlert(alertId);
  };

  return (
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
                {getAlertIcon(alert.type)}
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
                          onClick={(e) => handleDismissAlert(alert.id, e)}
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
  );
}
