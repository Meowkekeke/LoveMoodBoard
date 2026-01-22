import React, { useState } from 'react';
import { X, Clock, Ghost } from 'lucide-react';
import { DoodleButton } from './DoodleButton';

interface SpaceDurationModalProps {
  onSelectDuration: (minutes: number, reason: string) => void;
  onCancel: () => void;
}

export const SpaceDurationModal: React.FC<SpaceDurationModalProps> = ({ onSelectDuration, onCancel }) => {
  const [reason, setReason] = useState('');

  const durations = [
    { label: '15 Mins', value: 15 },
    { label: '30 Mins', value: 30 },
    { label: '1 Hour', value: 60 },
    { label: '2 Hours', value: 120 },
  ];

  const handleSelect = (minutes: number) => {
      const finalReason = reason.trim() || "Just need a moment";
      onSelectDuration(minutes, finalReason);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-50 w-full max-w-sm rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold leading-tight flex items-center gap-2">
                <Ghost size={28} className="text-gray-600" />
                How much space?
            </h3>
            <button 
              onClick={onCancel}
              className="p-2 bg-white border-2 border-black rounded-full hover:bg-gray-200 transition-colors active:translate-y-0.5"
            >
              <X size={20} />
            </button>
        </div>

        <p className="text-gray-600 font-bold mb-4 leading-tight">
            I'll block everything so you can recharge. 🌙
        </p>

        <div className="mb-6">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Why do you need space?</label>
            <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Overwhelmed, Headache, Just need quiet..."
                className="w-full p-4 border-4 border-black rounded-2xl bg-white focus:outline-none focus:ring-4 ring-gray-200 font-[Patrick_Hand] text-lg resize-none"
                rows={2}
                maxLength={60}
            />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {durations.map((dur) => (
            <button
              key={dur.value}
              onClick={() => handleSelect(dur.value)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-black/10 bg-white hover:border-black hover:bg-[#f3f4f6] transition-all active:scale-95 shadow-sm"
            >
              <Clock size={32} className="text-gray-400 mb-2" />
              <span className="font-bold text-xl text-gray-800">{dur.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};