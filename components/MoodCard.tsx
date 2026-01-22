import React, { useMemo, useState } from 'react';
import { MOOD_COLORS, Mood, ChatMessage } from '../types';
import { Clock, ChevronDown, ChevronUp, MessageCircle, CheckCircle } from 'lucide-react';
import { MoodIcon } from './MoodIcon';
import { 
  Flower2, Footprints, Activity, Dumbbell, BookOpen, Palette, Droplet, 
  Briefcase, Moon, BatteryLow, Frown, Wind, Thermometer, Edit3, 
  Heart, MoonStar, Home, Ear, Ghost 
} from 'lucide-react';

// Re-map icons here
const IconMap: Record<string, React.FC<any>> = {
  Flower: Flower2, Footprints, Activity, Dumbbell, BookOpen, Palette, Droplet,
  Briefcase, Moon, BatteryLow, Frown, Wind, Thermometer, Edit3,
  MessageCircle, Heart, MoonStar, Home, Ear, Ghost
};

interface MoodData {
  name: string;
  type: 'mood' | 'action' | 'conversation';
  mood?: Mood;
  icon?: string;
  category?: string;
  note: string;
  timestamp: number;
  messages?: ChatMessage[];
}

interface MoodCardProps {
  data: MoodData;
  isMe: boolean;
  isShared?: boolean;
}

export const MoodCard: React.FC<MoodCardProps> = ({ data, isMe, isShared = false }) => {
  const [expanded, setExpanded] = useState(false);
  
  let bgColor = 'bg-white';
  let IconComponent = null;

  if (data.type === 'mood' && data.mood) {
    bgColor = MOOD_COLORS[data.mood];
    IconComponent = <MoodIcon mood={data.mood} className="w-12 h-12 sm:w-14 sm:h-14 text-black/90" />;
  } else if (data.type === 'action' && data.icon) {
    // Action Colors
    if (data.category === 'self_care') bgColor = 'bg-green-200';
    if (data.category === 'rough') bgColor = 'bg-red-200';
    if (data.category === 'needs') bgColor = 'bg-purple-200'; 
    
    const LucideIcon = IconMap[data.icon] || Edit3;
    IconComponent = <LucideIcon size={48} className="text-black/80" strokeWidth={2.5} />;
  } else if (data.type === 'conversation') {
    bgColor = 'bg-blue-200';
    IconComponent = <CheckCircle size={48} className="text-blue-700" strokeWidth={3} />;
  }

  // Format time to exact date & time
  const getTimeString = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Deterministic "random" styles
  const style = useMemo(() => {
    const hash = data.name.length + data.note.length + data.timestamp;
    const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0'];
    const tapePositions = ['left-[10%]', 'left-[30%]', 'right-[15%]', 'left-[50%] -translate-x-1/2'];
    const tapeRotations = ['rotate-[-3deg]', 'rotate-[2deg]', 'rotate-[-5deg]', 'rotate-[4deg]'];
    
    return {
      rotation: rotations[hash % rotations.length],
      tapePos: tapePositions[hash % tapePositions.length],
      tapeRot: tapeRotations[hash % tapeRotations.length],
    };
  }, [data.note, data.timestamp, data.name]);

  const hasMessages = data.messages && data.messages.length > 0;

  return (
    <div className={`relative group w-full max-w-md mx-auto mb-6 ${style.rotation} transition-transform hover:scale-[1.01] hover:z-10`}>
       {/* Tape */}
       <div className={`
         absolute -top-3 ${style.tapePos} w-16 h-8 
         ${data.type === 'conversation' ? 'bg-blue-300/90' : (data.type === 'action' ? 'bg-purple-300/90' : 'bg-[#fde047]/90')} 
         backdrop-blur-sm border-2 border-black/10 ${style.tapeRot} z-20 shadow-sm clip-path-tape opacity-95
       `}></div>

       {/* Card Body */}
       <div className="flex flex-col w-full bg-white border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          
          <div className="flex w-full min-h-[110px]">
            {/* LHS: Icon Area */}
            <div className={`w-[30%] min-w-[85px] ${bgColor} border-r-4 border-black flex flex-col items-center justify-center p-3 relative`}>
                {isMe && !isShared && (
                  <div className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest z-10 -rotate-12 shadow-sm">
                    YOU
                  </div>
                )}
                {isShared && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-widest z-10 -rotate-12 shadow-sm">
                    US
                  </div>
                )}
                <div className="transform transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300 drop-shadow-sm">
                  {IconComponent}
                </div>
            </div>

            {/* RHS: Content Area */}
            <div className="w-[70%] p-4 flex flex-col justify-center relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-black leading-none tracking-tight">
                      {data.name}
                    </h3>
                    <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full border-2 border-gray-100 flex items-center gap-1">
                      <Clock size={10} />
                      {getTimeString(data.timestamp)}
                    </div>
                </div>
                
                <div className="relative pt-1">
                    <p className="font-[Patrick_Hand] text-xl leading-6 text-gray-800 break-words w-full">
                        {data.note}
                    </p>
                </div>

                {/* Expansion for Conversation */}
                {data.type === 'conversation' && hasMessages && (
                  <button 
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {expanded ? 'Close Chat' : 'Read Chat'}
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
                
                {data.type === 'conversation' && !hasMessages && (
                    <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Resolved offline
                    </span>
                )}
            </div>
          </div>

          {/* Expanded Chat History */}
          {expanded && data.messages && (
            <div className="bg-gray-50 border-t-4 border-black p-4 space-y-3 max-h-60 overflow-y-auto">
               {data.messages.map(msg => (
                 <div key={msg.id} className={`flex flex-col ${msg.senderId === data.userId ? 'items-end' : (msg.senderName ? 'items-start' : 'items-start')}`}>
                    <span className="text-[10px] font-bold text-gray-400 mb-0.5">{msg.senderName}</span>
                    <div className="px-3 py-2 rounded-xl text-sm font-[Patrick_Hand] bg-white border border-gray-200 text-gray-800">
                      {msg.text}
                    </div>
                 </div>
               ))}
            </div>
          )}

       </div>
    </div>
  );
};