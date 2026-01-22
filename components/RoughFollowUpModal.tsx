import React from 'react';
import { DoodleButton } from './DoodleButton';
import { Ghost, Heart, MessageCircle, Lightbulb, X } from 'lucide-react';

interface RoughFollowUpModalProps {
  onSelect: (needId: string, needLabel: string) => void;
  onCancel: () => void;
}

export const RoughFollowUpModal: React.FC<RoughFollowUpModalProps> = ({ onSelect, onCancel }) => {
  const options = [
    { id: 'comfort', label: 'I need comfort', icon: <Heart size={32} className="text-pink-500 fill-pink-200" />, color: 'bg-pink-100 hover:bg-pink-200' },
    { id: 'talk', label: 'I need to talk', icon: <MessageCircle size={32} className="text-blue-500" />, color: 'bg-blue-100 hover:bg-blue-200' },
    { id: 'solution', label: 'I need a solution', icon: <Lightbulb size={32} className="text-yellow-600 fill-yellow-200" />, color: 'bg-yellow-100 hover:bg-yellow-200' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold leading-tight">What can help right now?</h3>
            <button 
              onClick={onCancel}
              className="p-2 bg-gray-100 border-2 border-black rounded-full hover:bg-gray-200 transition-colors active:translate-y-0.5"
            >
              <X size={20} />
            </button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id, opt.label)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-black/10 transition-all active:scale-98 active:border-black ${opt.color} text-left group`}
            >
              <div className="bg-white p-2 rounded-full border-2 border-black shadow-sm group-hover:scale-110 transition-transform">
                {opt.icon}
              </div>
              <span className="font-bold text-lg text-gray-800">{opt.label}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            This will be added to your note
        </p>
      </div>
    </div>
  );
};