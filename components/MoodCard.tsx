import React from 'react';
import { Mood, MOOD_COLORS, MOOD_EMOJIS, UserState } from '../types';
import { Clock } from 'lucide-react';

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
    <div className={`relative flex flex-col items-center p-6 border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${bgColor} transition-transform hover:-translate-y-1`}>
      {isMe && (
        <div className="absolute top-2 right-2 bg-white border border-black rounded-full px-2 py-0.5 text-xs font-bold rotate-6">
          YOU
        </div>
      )}
      
      <div className="w-full text-center mb-4">
        <h3 className="text-xl font-bold border-b-2 border-black/20 pb-2 inline-block">
          {userState.name}
        </h3>
      </div>

      <div className="text-8xl mb-4 animate-bounce hover:animate-pulse cursor-default select-none filter drop-shadow-md">
        {MOOD_EMOJIS[userState.mood]}
      </div>

      <div className="w-full bg-white/60 p-4 rounded-xl border-2 border-black/10 min-h-[80px] flex items-center justify-center text-center">
        <p className="text-lg leading-tight italic">
          "{userState.note || "No status yet..."}"
        </p>
      </div>

      <div className="mt-4 flex items-center text-xs text-gray-700 font-bold bg-white/50 px-3 py-1 rounded-full">
        <Clock size={12} className="mr-1" />
        {getTimeString(userState.lastUpdated)}
      </div>

      {isMe && onEdit && (
        <button 
          onClick={onEdit}
          className="mt-4 bg-white border-2 border-black px-4 py-2 rounded-lg font-bold hover:bg-gray-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]"
        >
          Update Mood
        </button>
      )}
    </div>
  );
};