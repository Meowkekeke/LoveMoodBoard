import React, { useState } from 'react';
import { ACTION_CATEGORIES } from '../types';
import { 
  Flower2, Footprints, Activity, Dumbbell, BookOpen, Palette, Droplet, // Self Care
  Briefcase, Moon, BatteryLow, Frown, Wind, Thermometer, Edit3, // Rough
  MessageCircle, Heart, MoonStar, Home, Ear, Ghost // Needs
} from 'lucide-react';

interface ActionPanelProps {
  onLogAction: (category: 'self_care'|'rough'|'needs', icon: string, label: string) => void;
}

const IconMap: Record<string, React.FC<any>> = {
  // Self Care
  Flower: Flower2,
  Footprints: Footprints,
  Activity: Activity,
  Dumbbell: Dumbbell,
  BookOpen: BookOpen,
  Palette: Palette,
  Droplet: Droplet,
  // Rough
  Briefcase: Briefcase,
  Moon: Moon,
  BatteryLow: BatteryLow,
  Frown: Frown,
  Wind: Wind,
  Thermometer: Thermometer,
  Edit3: Edit3,
  // Needs
  MessageCircle: MessageCircle,
  Heart: Heart,
  MoonStar: MoonStar,
  Home: Home,
  Ear: Ear,
  Ghost: Ghost
};

export const ActionPanel: React.FC<ActionPanelProps> = ({ onLogAction }) => {
  const [activeTab, setActiveTab] = useState<'self_care'|'rough'|'needs'>('self_care');

  const config = ACTION_CATEGORIES[activeTab];

  return (
    <div className="bg-white rounded-t-[2.5rem] border-t-4 border-l-4 border-r-4 border-black shadow-[0px_-4px_0px_0px_rgba(0,0,0,0.1)] p-6 mt-4">
      
      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        {(Object.keys(ACTION_CATEGORIES) as Array<keyof typeof ACTION_CATEGORIES>).map((key) => (
           <button
             key={key}
             onClick={() => setActiveTab(key)}
             className={`
               px-4 py-2 rounded-full font-bold text-lg border-2 transition-all
               ${activeTab === key 
                 ? `bg-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-1` 
                 : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600'
               }
             `}
           >
             {ACTION_CATEGORIES[key].label}
           </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4 sm:gap-6">
        {config.items.map((item) => {
          const Icon = IconMap[item.icon] || Edit3;
          return (
            <button
              key={item.id}
              onClick={() => onLogAction(activeTab, item.icon, item.label)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`p-3 rounded-2xl border-2 border-transparent bg-gray-50 group-hover:bg-white group-hover:border-black group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group-active:scale-95`}>
                <Icon size={28} className={item.color} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-gray-500 text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};