import React from 'react';
import { Mood, MOOD_COLORS, MOOD_EMOJIS, UserState } from '../types';
import { Clock, PenLine } from 'lucide-react';

interface MoodCardProps {
  userState: UserState;
  isMe: boolean;
  onEdit?: () => void;
}

export const MoodCard: React.FC<MoodCardProps> = ({ userState, isMe, onEdit }) => {
  const bgColor = MOOD_COLORS[userState.mood] || 'bg-white';
  
  // Format time relative
  const getTimeString = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'A while ago';
  };

  return (
    <div className="relative group">
      {/* Washi Tape Effect */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#fde047]/80 backdrop-blur-sm border-2 border-black/20 rotate-[-2deg] z-10 shadow-sm clip-path-tape"></div>

      <div className={`relative flex flex-col items-center p-6 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${bgColor} transition-transform hover:-translate-y-1 bg-opacity-90`}>
        {isMe && (
          <div className="absolute top-4 right-4 bg-white border-2 border-black rounded-xl px-3 py-1 text-sm font-bold -rotate-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            YOU
          </div>
        )}
        
        <div className="w-full text-center mb-2 mt-4">
          <h3 className="text-2xl font-bold border-b-4 border-black/10 pb-2 inline-block px-4">
            {userState.name}
          </h3>
        </div>

        <div className="text-9xl mb-6 mt-2 animate-bounce hover:animate-pulse cursor-default select-none filter drop-shadow-md transform transition-transform hover:scale-110 duration-300">
          {MOOD_EMOJIS[userState.mood]}
        </div>

        <div className="w-full bg-white/80 p-5 rounded-2xl border-4 border-black/10 min-h-[100px] flex items-center justify-center text-center relative">
          {/* Note decoration */}
          <div className="absolute -top-3 -left-2 text-2xl rotate-[-15deg]">📌</div>
          <p className="text-xl leading-snug italic font-medium text-gray-800">
            "{userState.note || "No status yet..."}"
          </p>
        </div>

        <div className="mt-6 flex items-center text-sm text-gray-800 font-bold bg-white/60 px-4 py-2 rounded-full border-2 border-black/10">
          <Clock size={16} className="mr-2" />
          {getTimeString(userState.lastUpdated)}
        </div>

        {isMe && onEdit && (
          <button 
            onClick={onEdit}
            className="absolute -bottom-5 right-6 bg-white border-4 border-black p-3 rounded-full font-bold hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] rotate-3 hover:rotate-12 transition-all"
            title="Update Mood"
          >
            <PenLine size={24} />
          </button>
        )}
      </div>
    </div>
  );
};