import React from 'react';
import { MOOD_COLORS, Mood } from '../types';
import { Clock } from 'lucide-react';
import { MoodIcon } from './MoodIcon';

interface MoodData {
  name: string;
  mood: Mood;
  note: string;
  timestamp: number;
}

interface MoodCardProps {
  data: MoodData;
  isMe: boolean;
}

export const MoodCard: React.FC<MoodCardProps> = ({ data, isMe }) => {
  const bgColor = MOOD_COLORS[data.mood] || 'bg-white';
  
  // Format time relative
  const getTimeString = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="relative group w-full max-w-md mx-auto mb-4">
       {/* Tape - placed to look like it's sticking the ticket to the board */}
       <div className="absolute -top-2 left-[15%] w-12 h-5 bg-[#fde047]/90 backdrop-blur-sm border border-black/20 rotate-[-3deg] z-20 shadow-sm clip-path-tape"></div>

       <div className="flex w-full bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-h-[90px] transition-transform hover:-translate-y-0.5">
          
          {/* LHS: 1/4 - Icon & Color Area */}
          <div className={`w-[25%] min-w-[70px] ${bgColor} border-r-2 border-black flex flex-col items-center justify-center p-2 relative`}>
              {isMe && (
                 <div className="absolute top-1 left-1 bg-black text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider z-10">YOU</div>
              )}
              <MoodIcon mood={data.mood} className="w-10 h-10 sm:w-12 sm:h-12 text-black/80" />
          </div>

          {/* RHS: 3/4 - Content Area */}
          <div className="w-[75%] p-3 flex flex-col relative">
              
              {/* Header: Name + Time */}
              <div className="flex justify-between items-baseline mb-1 border-b border-gray-100 pb-1">
                  <h3 className="font-bold text-sm text-gray-700 truncate pr-2">{data.name}</h3>
                  <div className="flex items-center text-[10px] font-bold text-gray-400 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    <Clock size={10} className="mr-1" />
                    {getTimeString(data.timestamp)}
                  </div>
              </div>
              
              {/* Note Body */}
              <div className="flex-1 flex items-start pt-1">
                  <p className="font-[Patrick_Hand] text-base leading-5 text-gray-900 break-words w-full">
                      {data.note || <span className="text-gray-300 italic text-sm">No notes...</span>}
                  </p>
              </div>
          </div>
       </div>
    </div>
  );
};