import React from 'react';
import { Interaction } from '../types';
import { Smile, Sparkles, Heart, Hand, X } from 'lucide-react';
import { DoodleButton } from './DoodleButton';

interface InteractionModalProps {
  interaction: Interaction;
  onDismiss: () => void;
}

export const InteractionModal: React.FC<InteractionModalProps> = ({ interaction, onDismiss }) => {
  
  const getConfig = () => {
    switch(interaction.type) {
      case 'hug':
        return {
          icon: <Smile size={120} className="text-orange-500 fill-orange-200 stroke-[3]" />,
          text: 'hugs you! 🤗',
          animation: 'animate-bounce',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'kiss':
        return {
          icon: <Sparkles size={120} className="text-pink-500 fill-pink-200 stroke-[3]" />,
          text: 'kisses you! 💋',
          animation: 'animate-pulse',
          bgColor: 'bg-pink-50',
          borderColor: 'border-pink-200'
        };
      case 'love':
        return {
          icon: <Heart size={120} className="text-red-500 fill-red-200 stroke-[3]" />,
          text: 'loves you! ❤️',
          animation: 'animate-bounce',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'poke':
        return {
          icon: <Hand size={120} className="text-purple-500 fill-purple-200 stroke-[3]" />,
          text: 'pokes you! 👉',
          animation: 'animate-shake', // We'll rely on existing shake or generic
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          icon: <Smile size={120} />,
          text: 'sent good vibes!',
          animation: '',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-sm rounded-[3rem] border-8 border-black ${config.bgColor} p-8 relative shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center animate-in zoom-in-90 duration-300`}>
        
        {/* Decorative Tape */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-200/90 border-2 border-black rotate-2 z-10 shadow-sm clip-path-tape"></div>

        <div className={`flex justify-center mb-6 mt-4 ${config.animation}`}>
          {config.icon}
        </div>

        <h2 className="text-3xl font-bold mb-2 break-words">
          {interaction.senderName}
        </h2>
        <p className="text-2xl text-gray-600 font-[Patrick_Hand] mb-8">
          {config.text}
        </p>

        <DoodleButton onClick={onDismiss} className="w-full">
          Thanks! (Close)
        </DoodleButton>
      </div>
    </div>
  );
};