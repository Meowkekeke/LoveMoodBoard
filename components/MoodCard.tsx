import React, { useMemo, useState } from 'react';
import { MOOD_COLORS, Mood, ChatMessage } from '../types';
import { Clock, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { MoodIcon } from './MoodIcon';
import { 
  Flower2, Footprints, Activity, Dumbbell, BookOpen, Palette, Droplet, 
  Briefcase, Moon, BatteryLow, Frown, Wind, Thermometer, Edit3, 
  MessageCircle, Heart, MoonStar, Home, Ear, Ghost 
} from 'lucide-react';

// Re-map icons here
const IconMap: Record<string, React.FC<any>> = {
  Flower: Flower2, Footprints, Activity, Dumbbell, BookOpen, Palette, Droplet,
  Briefcase, Moon, BatteryLow, Frown, Wind, Thermometer, Edit3,
  MessageCircle, Heart, MoonStar, Home, Ear, Ghost
};

interface MoodData {
  userName: string;
  userId?: string;
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
    IconComponent = <MoodIcon mood={data.mood} className="w-10 h-10 sm:w-12 sm:h-12 text-black/90" />;
  } else if (data.type === 'action' && data.icon) {
    // Action Colors
    if (data.category === 'rough') bgColor = 'bg-red-200';
    if (data.category === 'needs') bgColor = 'bg-purple-200'; 
    
    const LucideIcon = IconMap[data.icon] || Edit3;
    IconComponent = <LucideIcon size={40} className="text-black/80" strokeWidth={2.5} />;
  } else if (data.type === 'conversation') {
    bgColor = 'bg-blue-200';
    IconComponent = (
      <div className="bg-white rounded-full p-2 border-4 border-blue-300">
         <Check size={28} className="text-green-600" strokeWidth={4} />
      </div>
    );
  }

  // Format time to exact date & time
  const getTimeString = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Deterministic "random" styles
  const style = useMemo(() => {
    const hash = (data.userName || '').length + (data.note || '').length + data.timestamp;
    const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0'];
    return {
      rotation: rotations[hash % rotations.length],
    };
  }, [data.note, data.timestamp, data.userName]);

  const hasMessages = data.messages && data.messages.length > 0;
  
  // ALIGNMENT LOGIC:
  // ME (I send): Icon LHS, Word RHS. Align Card Left.
  // PARTNER (They send): Icon RHS, Word LHS. Align Card Right.
  // SHARED: Center.

  let alignClass = isMe ? 'mr-auto' : 'ml-auto'; // Me=Left of screen, Partner=Right of screen
  let roundedClass = isMe ? 'rounded-tl-none' : 'rounded-tr-none'; // Tail follows alignment
  
  if (isShared) {
      alignClass = 'mx-auto';
      roundedClass = 'rounded-[1.5rem]';
  }

  // Flex Direction for Inner Content
  // Me = Icon Left = flex-row
  // Partner = Icon Right = flex-row-reverse
  const contentFlexDir = isMe ? 'flex-row' : 'flex-row-reverse';

  return (
    <div className={`relative group w-[95%] max-w-sm mb-6 ${alignClass} ${style.rotation} transition-transform hover:z-10`}>
       
       {/* Timestamp floating outside */}
       <div className={`absolute -top-6 ${!isMe ? 'right-2' : isShared ? 'w-full text-center' : 'left-2'} text-xs font-bold text-gray-400 flex items-center gap-1 ${isShared ? 'justify-center' : ''}`}>
          {!isShared && <Clock size={10} />} {getTimeString(data.timestamp)}
       </div>

       {/* Card Body */}
       <div className={`flex w-full bg-white border-4 border-black rounded-[1.5rem] ${roundedClass} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden`}>
          
          <div className={`flex w-full ${isShared ? 'flex-row' : contentFlexDir}`}>
            
            {/* Icon Column */}
            <div className={`w-[80px] shrink-0 ${bgColor} ${isMe || isShared ? 'border-r-4' : 'border-l-4'} border-black flex flex-col items-center justify-center p-2 relative`}>
                <div className="transform transition-transform group-hover:scale-110 duration-200">
                  {IconComponent}
                </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 p-3 flex flex-col justify-center relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] min-w-0">
                <div className="relative">
                    <p className={`font-[Patrick_Hand] text-xl leading-snug text-gray-800 break-words w-full ${!isMe && !isShared ? 'text-right' : 'text-left'}`}>
                        {data.note}
                    </p>
                </div>

                {/* Conversation Footer */}
                {data.type === 'conversation' && hasMessages && (
                  <button 
                    onClick={() => setExpanded(!expanded)}
                    className={`mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors ${!isMe && !isShared ? 'justify-end' : 'justify-start'}`}
                  >
                    {expanded ? 'Hide Chat' : 'View Chat'}
                    {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
            </div>
          </div>
       </div>

       {/* Expanded Chat History */}
       {expanded && data.messages && (
        <div className="mt-2 bg-white/80 backdrop-blur-sm border-2 border-black/20 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto mx-1 shadow-inner">
            {data.messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderId === data.userId || msg.senderId === (localStorage.getItem('lovesync_uid')) ? 'items-end' : 'items-start'}`}>
                <div className={`px-2 py-1 rounded-lg text-sm font-[Patrick_Hand] border ${msg.senderId === data.userId || msg.senderId === (localStorage.getItem('lovesync_uid')) ? 'bg-blue-100 border-blue-200' : 'bg-white border-gray-200'}`}>
                    {msg.text}
                </div>
                </div>
            ))}
        </div>
       )}
    </div>
  );
};