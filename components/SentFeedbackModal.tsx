import React from 'react';
import { InteractionType } from '../types';
import { DoodleButton } from './DoodleButton';
import { Check, Send, Heart, Smile, Sparkles, Hand } from 'lucide-react';

interface SentFeedbackModalProps {
  type: InteractionType;
  partnerName: string;
  onClose: () => void;
}

export const SentFeedbackModal: React.FC<SentFeedbackModalProps> = ({ type, partnerName, onClose }) => {
  
  const getConfig = () => {
    switch(type) {
      case 'hug':
        return {
          icon: <Smile size={80} className="text-orange-500 fill-orange-100" />,
          label: 'Hug'
        };
      case 'kiss':
        return {
          icon: <Sparkles size={80} className="text-pink-500 fill-pink-100" />,
          label: 'Kiss'
        };
      case 'love':
        return {
          icon: <Heart size={80} className="text-red-500 fill-red-100" />,
          label: 'Love'
        };
      case 'poke':
        return {
          icon: <Hand size={80} className="text-purple-500 fill-purple-100" />,
          label: 'Poke'
        };
      default:
        return {
          icon: <Send size={80} className="text-gray-500" />,
          label: 'Message'
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f0fdf4] w-full max-w-sm rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 relative text-center animate-in zoom-in duration-300">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#fde047] px-4 py-1 border-2 border-black rounded-full font-bold text-sm tracking-widest shadow-sm">
            DELIVERED! 📬
        </div>

        <div className="flex justify-center mb-6 mt-4 animate-bounce">
          {config.icon}
        </div>

        <h3 className="text-2xl font-bold mb-4 leading-tight">
          Your <span className="text-green-600 underline decoration-wavy decoration-2">{config.label}</span> has been sent to <span className="text-green-600">{partnerName}</span>!
        </h3>

        <DoodleButton onClick={onClose} className="w-full">
          <span className="flex items-center justify-center gap-2">
            Awesome <Check size={24} strokeWidth={3} />
          </span>
        </DoodleButton>
      </div>
    </div>
  );
};