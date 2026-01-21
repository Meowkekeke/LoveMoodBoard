import React from 'react';
import { InteractionType } from '../types';
import { CloudRain, Sun, Heart, Hand } from 'lucide-react';

interface InteractionBarProps {
  onInteract: (type: InteractionType) => void;
  disabled?: boolean;
}

export const InteractionBar: React.FC<InteractionBarProps> = ({ onInteract, disabled }) => {
  return (
    <div className="bg-white/90 p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center gap-2">
      <span className="text-sm font-bold text-gray-400 rotate-[-90deg] hidden sm:block">GIVE</span>
      
      <button 
        onClick={() => onInteract('water')}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-blue-100 transition-colors active:scale-95 group"
      >
        <div className="bg-blue-200 p-2 rounded-full border-2 border-black group-hover:rotate-12 transition-transform">
          <CloudRain size={20} className="text-blue-600" />
        </div>
        <span className="text-xs font-bold">Water</span>
      </button>

      <button 
        onClick={() => onInteract('sun')}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-yellow-100 transition-colors active:scale-95 group"
      >
        <div className="bg-yellow-200 p-2 rounded-full border-2 border-black group-hover:spin-slow">
          <Sun size={20} className="text-orange-600" />
        </div>
        <span className="text-xs font-bold">Shine</span>
      </button>

      <button 
        onClick={() => onInteract('love')}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-pink-100 transition-colors active:scale-95 group"
      >
        <div className="bg-pink-200 p-2 rounded-full border-2 border-black group-hover:animate-bounce">
          <Heart size={20} className="text-pink-600 fill-current" />
        </div>
        <span className="text-xs font-bold">Love</span>
      </button>
      
       <button 
        onClick={() => onInteract('poke')}
        disabled={disabled}
        className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-purple-100 transition-colors active:scale-95 group"
      >
        <div className="bg-purple-200 p-2 rounded-full border-2 border-black group-hover:rotate-[-12deg]">
          <Hand size={20} className="text-purple-600" />
        </div>
        <span className="text-xs font-bold">Poke</span>
      </button>
    </div>
  );
};