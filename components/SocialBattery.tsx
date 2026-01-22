import React, { useState, useEffect } from 'react';
import { Battery, Zap } from 'lucide-react';

interface SocialBatteryProps {
  level: number;
  onUpdate?: (level: number) => void;
  readOnly?: boolean;
}

export const SocialBattery: React.FC<SocialBatteryProps> = ({ level, onUpdate, readOnly = false }) => {
  const [localLevel, setLocalLevel] = useState(level);
  
  useEffect(() => {
    setLocalLevel(level);
  }, [level]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalLevel(parseInt(e.target.value));
  };

  const handleCommit = () => {
    if (onUpdate && localLevel !== level) {
      onUpdate(localLevel);
    }
  };

  const getColor = () => {
    if (localLevel < 30) return '#ef4444'; // red
    if (localLevel < 70) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  return (
    <div className={`relative flex items-center gap-2 ${readOnly ? 'opacity-90' : 'cursor-pointer'}`}>
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: getColor() }}></div>
        <Zap size={16} fill={getColor()} className="text-transparent relative z-10" />
      </div>
      
      <div className="flex flex-col w-24">
         <div className="flex justify-between items-end mb-0.5">
             <span className="text-[10px] font-bold uppercase text-gray-400 leading-none">Energy</span>
             <span className="text-[10px] font-bold leading-none" style={{ color: getColor() }}>{localLevel}%</span>
         </div>
         
         {readOnly ? (
            // Read-only progress bar
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden border border-black/10">
                <div 
                    className="h-full transition-all duration-500 ease-out"
                    style={{ width: `${localLevel}%`, backgroundColor: getColor() }}
                />
            </div>
         ) : (
             // Interactive slider
             <input 
                type="range" 
                min="0" 
                max="100" 
                value={localLevel} 
                onChange={handleChange}
                onMouseUp={handleCommit}
                onTouchEnd={handleCommit}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer border border-black/10 focus:outline-none focus:ring-2 ring-offset-1 ring-blue-200"
                style={{ accentColor: getColor() }}
            />
         )}
      </div>
    </div>
  );
};