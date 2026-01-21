import React from 'react';
import { InteractionType } from '../types';
import { Smile, Sparkles, Heart, Hand } from 'lucide-react';

interface InteractionBarProps {
  onInteract: (type: InteractionType) => void;
  disabled?: boolean;
}

export const InteractionBar: React.FC<InteractionBarProps> = ({ onInteract, disabled }) => {
  return (
    <div className="flex justify-between items-center gap-2 w-full">
      <button 
        onClick={() => onInteract('hug')}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-orange-100 transition-colors active:scale-95 group"
      >
        <div className="bg-orange-200 p-3 rounded-full border-2 border-black group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Smile size={24} className="text-orange-600" />
        </div>
        <span className="text-xs font-bold">Hug</span>
      </button>

      <button 
        onClick={() => onInteract('kiss')}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-pink-100 transition-colors active:scale-95 group"
      >
        <div className="bg-pink-200 p-3 rounded-full border-2 border-black group-hover:rotate-12 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles size={24} className="text-pink-600" />
        </div>
        <span className="text-xs font-bold">Kiss</span>
      </button>

      <button 
        onClick={() => onInteract('poke')}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-purple-100 transition-colors active:scale-95 group"
      >
        <div className="bg-purple-200 p-3 rounded-full border-2 border-black group-hover:rotate-[-12deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Hand size={24} className="text-purple-600" />
        </div>
        <span className="text-xs font-bold">Poke</span>
      </button>

      <button 
        onClick={() => onInteract('love')}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-red-100 transition-colors active:scale-95 group"
      >
        <div className="bg-red-200 p-3 rounded-full border-2 border-black group-hover:animate-bounce shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Heart size={24} className="text-red-600 fill-current" />
        </div>
        <span className="text-xs font-bold">Love</span>
      </button>
    </div>
  );
};