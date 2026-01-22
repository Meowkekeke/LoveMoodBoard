import React, { useState } from 'react';
import { X, Clock, Ghost } from 'lucide-react';

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

  const isValid = reason.trim().length > 0;

  const handleSelect = (minutes: number) => {
      if (!isValid) return;
      onSelectDuration(minutes, reason.trim());
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
                autoFocus
            />
            {!isValid && (
              <p className="text-xs text-red-500 font-bold mt-2 animate-pulse">
                * Please write a reason to continue
              </p>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {durations.map((dur) => (
            <button
              key={dur.value}
              onClick={() => handleSelect(dur.value)}
              disabled={!isValid}
              className={`
                flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all shadow-sm
                ${isValid 
                   ? 'border-black/10 bg-white hover:border-black hover:bg-[#f3f4f6] active:scale-95 cursor-pointer' 
                   : 'border-transparent bg-gray-200 opacity-50 cursor-not-allowed grayscale'
                }
              `}
            >
              <Clock size={32} className={`${isValid ? 'text-gray-400' : 'text-gray-300'} mb-2`} />
              <span className={`font-bold text-xl ${isValid ? 'text-gray-800' : 'text-gray-400'}`}>{dur.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};