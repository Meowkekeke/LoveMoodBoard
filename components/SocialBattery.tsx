import React, { useState, useEffect, useRef } from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';

interface SocialBatteryProps {
  level: number;
  onUpdate?: (level: number) => void;
  readOnly?: boolean;
}

export const SocialBattery: React.FC<SocialBatteryProps> = ({ level, onUpdate, readOnly = false }) => {
  const [localLevel, setLocalLevel] = useState(level);
  
  // Sync prop changes unless user is interacting (handled by dragging)
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

  const getIcon = () => {
    if (localLevel < 30) return <BatteryLow className="text-red-500" />;
    if (localLevel < 70) return <BatteryMedium className="text-yellow-500" />;
    return <BatteryFull className="text-green-500" />;
  };

  const getColor = () => {
    if (localLevel < 30) return '#ef4444'; // red-500
    if (localLevel < 70) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  return (
    <div className="bg-[#fff7ed] p-4 rounded-xl border-2 border-[#fed7aa] shadow-sm mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Social Battery</span>
        </div>
        <span className="font-bold font-mono text-gray-700">{localLevel}%</span>
      </div>
      
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={localLevel} 
        onChange={handleChange}
        onMouseUp={handleCommit}
        onTouchEnd={handleCommit}
        disabled={readOnly}
        className={`w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[${getColor()}]`}
        style={{ accentColor: getColor() }}
      />
    </div>
  );
};