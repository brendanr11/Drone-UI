import { useState, useEffect } from 'react';

interface CompassProps {
  animate?: boolean;
  initialHeading?: number;
}

export function Compass({ animate = false, initialHeading = 0 }: CompassProps) {
  const [heading, setHeading] = useState(initialHeading);

  useEffect(() => {
    if (!animate) return;
    
    const interval = setInterval(() => {
      setHeading(prev => (prev + 1) % 360);
    }, 150);

    return () => clearInterval(interval);
  }, [animate]);

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-full p-4 w-28 h-28 flex items-center justify-center">
      <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="rgba(148, 163, 184, 0.3)" 
            strokeWidth="1"
          />
          
          {directions.map((dir, index) => {
            const angle = (index * 45 - heading) * (Math.PI / 180);
            const x = 50 + Math.sin(angle) * 35;
            const y = 50 - Math.cos(angle) * 35;
            const isCardinal = index % 2 === 0;
            
            return (
              <g key={dir}>
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`${isCardinal ? 'text-[10px]' : 'text-[8px]'} ${
                    dir === 'N' ? 'fill-red-400' : 'fill-slate-300'
                  }`}
                  style={{ fontWeight: isCardinal ? 'bold' : 'normal' }}
                >
                  {dir}
                </text>
              </g>
            );
          })}
          
          <g transform={`rotate(${-heading} 50 50)`}>
            <path
              d="M 50 15 L 53 50 L 50 52 L 47 50 Z"
              fill="#ef4444"
              stroke="white"
              strokeWidth="0.5"
            />
            <path
              d="M 50 50 L 53 50 L 50 52 L 47 50 Z M 50 52 L 53 85 L 50 88 L 47 85 Z"
              fill="#64748b"
              stroke="white"
              strokeWidth="0.5"
            />
          </g>
          
          <circle cx="50" cy="50" r="3" fill="white" />
        </svg>
        
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 text-white text-xs">
          {heading}°
        </div>
      </div>
    </div>
  );
}
