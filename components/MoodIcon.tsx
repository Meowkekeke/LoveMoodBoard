import React from 'react';
import { Mood } from '../types';

interface MoodIconProps {
  mood: Mood;
  className?: string;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ mood, className = "w-16 h-16" }) => {
  const strokeColor = "currentColor";
  const strokeWidth = 2.5;
  const commonProps = {
    viewBox: "0 0 100 100",
    fill: "none",
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: className
  };

  switch (mood) {
    // --- POSITIVE ---
    case Mood.HAPPY:
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="50" r="35" />
          <path d="M35 40a5 5 0 0 1 5-5" />
          <path d="M60 40a5 5 0 0 1 5-5" />
          <path d="M35 60a20 20 0 0 0 30 0" />
        </svg>
      );
    case Mood.EXCITED:
      return (
        <svg {...commonProps}>
          <path d="M20 70l20-20" />
          <path d="M15 85l25-25" />
          <path d="M35 85l20-20" />
          <circle cx="65" cy="35" r="15" />
          <path d="M60 30l5 5l5-5" />
        </svg>
      );
    case Mood.ROMANTIC:
      return (
        <svg {...commonProps}>
          <path d="M50 80 C 20 50, 10 30, 30 15 A 15 15 0 0 1 50 30 A 15 15 0 0 1 70 15 C 90 30, 80 50, 50 80" fill="currentColor" fillOpacity="0.2"/>
          <path d="M35 30l5 5" />
          <path d="M60 30l5 5" />
          <path d="M45 50q5 5 10 0" />
        </svg>
      );
    case Mood.CHILL:
      return (
        <svg {...commonProps}>
          <rect x="25" y="40" width="50" height="10" rx="5" />
          <path d="M30 40l5-5" />
          <path d="M65 40l5-5" />
          <path d="M40 60h20" />
        </svg>
      );
    case Mood.GRATEFUL:
      return (
        <svg {...commonProps}>
          <path d="M25 60 Q35 80 50 80 Q65 80 75 60" />
          <path d="M50 45l0 -15" />
          <path d="M50 30l-5 5" />
          <path d="M50 30l5 5" />
        </svg>
      );
    case Mood.PLAYFUL:
       return (
        <svg {...commonProps}>
           <circle cx="50" cy="50" r="35" />
           <path d="M35 40l5 5" />
           <path d="M40 40l-5 5" />
           <circle cx="65" cy="42" r="3" fill="currentColor" />
           <path d="M50 60l5 5l-5 5" /> {/* Tongue out */}
        </svg>
       );
    case Mood.PROUD:
       return (
        <svg {...commonProps}>
            <circle cx="50" cy="50" r="35" />
            <path d="M30 45q20-10 40 0" /> {/* Sunglasses line */}
            <path d="M30 45v5a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5v-5" fill="currentColor" fillOpacity="0.2" />
            <path d="M50 45v5a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5v-5" fill="currentColor" fillOpacity="0.2" />
            <path d="M45 70h10" />
        </svg>
       );
    case Mood.SAFE:
        return (
            <svg {...commonProps}>
                <path d="M50 20 L25 30 V50 C25 70 50 90 50 90 C50 90 75 70 75 50 V30 Z" />
                <path d="M40 50l10 10l15-15" />
            </svg>
        );
    case Mood.HOPEFUL:
        return (
            <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <circle cx="35" cy="40" r="3" fill="currentColor" />
                <circle cx="65" cy="40" r="3" fill="currentColor" />
                <path d="M35 60q15 10 30 0" />
                <path d="M50 20l0 -5" />
                <path d="M50 15l-3 -3" />
                <path d="M50 15l3 -3" />
            </svg>
        );
    case Mood.ENERGETIC:
        return (
            <svg {...commonProps}>
                <path d="M50 10l-15 35h15l-5 45l20-35h-15z" fill="currentColor" fillOpacity="0.1" />
            </svg>
        );

    // --- NEUTRAL ---
    case Mood.HUNGRY:
      return (
        <svg {...commonProps}>
          <path d="M50 15 L85 80 Q50 90 15 80 Z" />
          <path d="M15 80 Q50 70 85 80" />
          <circle cx="50" cy="40" r="4" fill="currentColor" stroke="none" />
        </svg>
      );
    case Mood.TIRED:
      return (
        <svg {...commonProps}>
          <path d="M30 45l10 5" />
          <path d="M70 45l-10 5" />
          <circle cx="50" cy="65" r="5" />
          <path d="M80 20l5-5l5 5" />
        </svg>
      );
    case Mood.CONFUSED:
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="50" r="35" />
          <circle cx="35" cy="40" r="3" />
          <circle cx="65" cy="40" r="4" />
          <path d="M35 65q15-5 30 0" />
          <path d="M25 25l5-5" />
        </svg>
      );
    case Mood.BORED:
        return (
            <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <circle cx="35" cy="40" r="2" fill="currentColor"/>
                <circle cx="65" cy="40" r="2" fill="currentColor"/>
                <path d="M40 65h20" />
            </svg>
        );
    case Mood.BUSY:
        return (
            <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <path d="M50 50l15 -15" />
                <path d="M50 50l-10 5" />
                <path d="M50 20v5" />
                <path d="M80 50h-5" />
                <path d="M50 80v-5" />
                <path d="M20 50h5" />
            </svg>
        );
    case Mood.FOCUSED:
        return (
            <svg {...commonProps}>
                 <circle cx="50" cy="50" r="35" />
                 <circle cx="50" cy="50" r="15" />
                 <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
        );
    case Mood.NUMB:
        return (
            <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <path d="M30 40h10" />
                <path d="M60 40h10" />
                <path d="M40 65h20" strokeDasharray="2 2" />
            </svg>
        );
    case Mood.MEH:
        return (
            <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <circle cx="35" cy="40" r="3" fill="currentColor"/>
                <circle cx="65" cy="40" r="3" fill="currentColor"/>
                <path d="M35 60l30 -5" />
            </svg>
        );
    case Mood.COZY:
        return (
             <svg {...commonProps}>
                <path d="M20 70c0-20 30-20 30-40c0 20 30 20 30 40" />
                <path d="M30 50l5 5" />
                <path d="M65 50l5-5" />
                <path d="M20 70h60" />
             </svg>
        );
    case Mood.WOBBLY:
        return (
            <svg {...commonProps}>
                 <circle cx="50" cy="50" r="35" strokeDasharray="5 5" />
                 <circle cx="35" cy="45" r="2" />
                 <circle cx="65" cy="35" r="2" />
                 <path d="M40 65q10 5 20 0" />
            </svg>
        );

    // --- NEGATIVE ---
    case Mood.SAD:
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="50" r="35" />
          <path d="M35 45a5 5 0 0 1 5-5" transform="rotate(180 37.5 42.5)" />
          <path d="M60 45a5 5 0 0 1 5-5" transform="rotate(180 62.5 42.5)" />
          <path d="M35 70q15-10 30 0" />
          <path d="M65 55l0 10" /> {/* Tear */}
        </svg>
      );
    case Mood.ANGRY:
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="50" r="35" />
          <path d="M30 35l15 10" />
          <path d="M70 35l-15 10" />
          <circle cx="40" cy="50" r="3" fill="currentColor" />
          <circle cx="60" cy="50" r="3" fill="currentColor" />
          <path d="M40 70h20" />
        </svg>
      );
    case Mood.SICK:
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="50" r="35" />
          <path d="M35 40l5 5m-5-5l5-5" />
          <path d="M60 40l5 5m-5-5l5-5" />
          <path d="M35 65l5-5l5 5l5-5l5 5l5-5" />
        </svg>
      );
    case Mood.STRESSED:
      return (
        <svg {...commonProps}>
           <path d="M30 40 Q40 10 50 40 T70 40" />
           <circle cx="35" cy="50" r="4" fill="currentColor"/>
           <circle cx="65" cy="50" r="4" fill="currentColor"/>
           <path d="M40 70h20" />
           <path d="M15 20l10 10" />
           <path d="M85 20l-10 10" />
        </svg>
      );
    case Mood.ANXIOUS:
        return (
            <svg {...commonProps}>
                 <circle cx="50" cy="50" r="35" />
                 <circle cx="35" cy="40" r="4" />
                 <circle cx="65" cy="40" r="4" />
                 <path d="M30 65l5-2l5 2l5-2l5 2l5-2l5 2l5-2l5 2" /> {/* Trembling mouth */}
                 <path d="M10 50l10 0" />
                 <path d="M80 50l10 0" />
            </svg>
        );
    case Mood.LONELY:
        return (
            <svg {...commonProps}>
                 <circle cx="50" cy="50" r="35" />
                 <circle cx="50" cy="45" r="4" fill="currentColor" />
                 <path d="M45 65h10" />
                 <path d="M20 20l10 10" strokeDasharray="2 2" />
            </svg>
        );
    case Mood.HURT:
        return (
            <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <path d="M30 40l10 5" />
                <path d="M70 40l-10 5" />
                <path d="M40 65l10-5l10 5" />
                <path d="M30 50l40 0" strokeOpacity="0.3" /> {/* Bandage line */}
            </svg>
        );
    case Mood.JEALOUS:
        return (
            <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <path d="M30 40l15 0" />
                <path d="M60 40l10 5" />
                <path d="M50 65l5-5" />
            </svg>
        );
    case Mood.OVERWHELMED:
        return (
            <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <circle cx="35" cy="50" r="10" strokeOpacity="0.5" />
                <circle cx="65" cy="50" r="10" strokeOpacity="0.5" />
                <path d="M45 75l10-5" />
                <path d="M15 15l10 10" />
                <path d="M85 15l-10 10" />
            </svg>
        );
    case Mood.GUILTY:
        return (
             <svg {...commonProps}>
                <circle cx="50" cy="50" r="35" />
                <path d="M30 35l10 10" />
                <path d="M70 35l-10 10" />
                <path d="M40 65h20" />
                <path d="M80 20l-5 5" />
             </svg>
        );

    default:
      return null;
  }
};