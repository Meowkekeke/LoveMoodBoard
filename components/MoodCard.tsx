import React from 'react';
import { MOOD_COLORS, Mood } from '../types';
import { Clock } from 'lucide-react';
import { MoodIcon } from './MoodIcon';
import { 
  Flower2, Footprints, Activity, Dumbbell, BookOpen, Palette, Droplet, 
  Briefcase, Moon, BatteryLow, Frown, Wind, Thermometer, Edit3, 
  MessageCircle, Heart, MoonStar, Home, Ear, Ghost 
} from 'lucide-react';

// Re-map icons here (ideally shared util, but keeping component self-contained for now)
const IconMap: Record<string, React.FC<any>> = {
  Flower: Flower2, Footprints, Activity, Dumbbell, BookOpen, Palette, Droplet,
  Briefcase, Moon, BatteryLow, Frown, Wind, Thermometer, Edit3,
  MessageCircle, Heart, MoonStar, Home, Ear, Ghost
};

interface MoodData {
  name: string;
  type: 'mood' | 'action';
  mood?: Mood;
  icon?: string;
  category?: string;
  note: string;
  timestamp: number;
}

interface MoodCardProps {
  data: MoodData;
  isMe: boolean;
}

export const MoodCard: React.FC<MoodCardProps> = ({ data, isMe }) => {
  let bgColor = 'bg-white';
  let IconComponent = null;

  if (data.type === 'mood' && data.mood) {
    bgColor = MOOD_COLORS[data.mood];
    IconComponent = <MoodIcon mood={data.mood} className="w-10 h-10 sm:w-12 sm:h-12 text-black/80" />;
  } else if (data.type === 'action' && data.icon) {
    // Action Colors
    if (data.category === 'self_care') bgColor = 'bg-green-100';
    if (data.category === 'rough') bgColor = 'bg-red-100';
    if (data.category === 'needs') bgColor = 'bg-purple-100'; // Fixed 'needs' check
    
    const LucideIcon = IconMap[data.icon] || Edit3;
    IconComponent = <LucideIcon size={40} className="text-black/70" strokeWidth={2} />;
  }

  // Format time to exact date & time
  const getTimeString = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="relative group w-full max-w-md mx-auto mb-4">
       {/* Tape */}
       <div className={`absolute -top-2 left-[15%] w-12 h-5 ${data.type === 'action' ? 'bg-blue-200/90' : 'bg-[#fde047]/90'} backdrop-blur-sm border border-black/20 rotate-[-3deg] z-20 shadow-sm clip-path-tape`}></div>

       <div className="flex w-full bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-h-[90px] transition-transform hover:-translate-y-0.5">
          
          {/* LHS: Icon Area */}
          <div className={`w-[25%] min-w-[70px] ${bgColor} border-r-2 border-black flex flex-col items-center justify-center p-2 relative`}>
              {isMe && (
                 <div className="absolute top-1 left-1 bg-black text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider z-10">YOU</div>
              )}
              {IconComponent}
          </div>

          {/* RHS: Content Area */}
          <div className="w-[75%] p-3 flex flex-col relative">
              
              <div className="flex justify-between items-baseline mb-1 border-b border-gray-100 pb-1">
                  <h3 className="font-bold text-sm text-gray-700 truncate pr-2">{data.name}</h3>
                  <div className="flex items-center text-[10px] font-bold text-gray-400 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    <Clock size={10} className="mr-1" />
                    {getTimeString(data.timestamp)}
                  </div>
              </div>
              
              <div className="flex-1 flex items-start pt-1">
                  <p className="font-[Patrick_Hand] text-base leading-5 text-gray-900 break-words w-full">
                      {data.note}
                  </p>
              </div>
          </div>
       </div>
    </div>
  );
};