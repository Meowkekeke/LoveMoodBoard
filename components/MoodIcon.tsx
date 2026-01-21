import React from 'react';
import { Mood } from '../types';

interface MoodIconProps {
  mood: Mood;
  className?: string;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ mood, className = "w-16 h-16" }) => {
  const strokeColor = "currentColor";
  const strokeWidth = 3; // Slightly thicker for marker feel
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
          <circle cx="50" cy="50" r="15" />
          <path d="M50 20c0-10-10-15-20-10s-10 20 5 25" />
          <path d="M50 20c0-10 10-15 20-10s10 20-5 25" transform="rotate(72 50 50)" />
          <path d="M50 20c0-10 10-15 20-10s10 20-5 25" transform="rotate(144 50 50)" />
          <path d="M50 20c0-10 10-15 20-10s10 20-5 25" transform="rotate(216 50 50)" />
          <path d="M50 20c0-10 10-15 20-10s10 20-5 25" transform="rotate(288 50 50)" />
        </svg>
      );
    case Mood.EXCITED:
      return (
        <svg {...commonProps}>
          <path d="M20 70l20-20" />
          <path d="M15 85l25-25" />
          <path d="M35 85l20-20" />
          <path d="M65 35l5-15l5 15h15l-10 10l5 15l-15-10l-15 10l5-15l-10-10h15z" />
        </svg>
      );
    case Mood.ROMANTIC:
      return (
        <svg {...commonProps}>
          <rect x="15" y="30" width="70" height="50" rx="5" />
          <path d="M15 30l35 25l35-25" />
          <path d="M50 55c-5-10-15-10-20 0s20 25 20 25s20-15 20-25s-15-10-20 0" fill="currentColor" fillOpacity="0.1" strokeWidth="2" transform="translate(0, 10) scale(0.6) translate(33, 0)" />
        </svg>
      );
    case Mood.CHILL:
      return (
        <svg {...commonProps}>
          <path d="M25 35 h50 v35 a15 15 0 0 1 -15 15 h-20 a15 15 0 0 1 -15 -15 v-35" />
          <path d="M75 45 h10 a10 10 0 0 1 0 20 h-10" />
          <path d="M35 25c0-10 10-10 10-20" />
          <path d="M50 25c0-10 10-10 10-20" />
          <path d="M65 25c0-10 10-10 10-20" />
        </svg>
      );
    case Mood.GRATEFUL:
      return (
        <svg {...commonProps}>
          {/* Hands holding a heart or sparkle */}
          <path d="M25 60 Q35 80 50 80 Q65 80 75 60" /> {/* Hands cupped */}
          <path d="M50 45l0 -15" /> {/* Sparkle center */}
          <path d="M50 30l-5 5" />
          <path d="M50 30l5 5" />
          <path d="M35 30l15 15" strokeDasharray="2 2" />
          <path d="M65 30l-15 15" strokeDasharray="2 2" />
          <path d="M50 55c-5-10-15-10-20 0s20 25 20 25s20-15 20-25s-15-10-20 0" transform="scale(0.5) translate(50, 40)" /> 
        </svg>
      );

    // --- NEUTRAL / BODY ---
    case Mood.HUNGRY:
      return (
        <svg {...commonProps}>
          <path d="M50 15 L85 80 Q50 90 15 80 Z" />
          <path d="M15 80 Q50 70 85 80" />
          <circle cx="50" cy="40" r="4" fill="currentColor" stroke="none" />
          <circle cx="35" cy="60" r="4" fill="currentColor" stroke="none" />
          <circle cx="65" cy="65" r="4" fill="currentColor" stroke="none" />
        </svg>
      );
    case Mood.TIRED:
      return (
        <svg {...commonProps}>
          <path d="M60 20A30 30 0 1 1 50 80A22 22 0 0 0 60 20" />
          <path d="M75 25l10 0l-10 10l10 0" transform="scale(0.8)" strokeWidth="2" />
          <path d="M95 15l10 0l-10 10l10 0" transform="scale(0.6)" strokeWidth="2" />
        </svg>
      );
    case Mood.CONFUSED:
      return (
        <svg {...commonProps}>
          {/* Swirl / Spiral */}
          <path d="M50 50 m-25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0" strokeOpacity="0.2" />
          <path d="M50 50 m-20 0 a 20 20 0 1 1 40 0 a 20 20 0 1 1 -40 0" strokeDasharray="5 5" />
          <path d="M40 35c0-10 20-10 20 0c0 10-10 10-10 20v5" /> {/* Question mark top */}
          <circle cx="50" cy="75" r="2" fill="currentColor" />
        </svg>
      );

    // --- NEGATIVE ---
    case Mood.SAD:
      return (
        <svg {...commonProps}>
          <path d="M25 55a15 15 0 0 1 0-30a20 20 0 0 1 35 0a15 15 0 0 1 5 30z" />
          <path d="M35 65l-5 10" strokeDasharray="5 5" />
          <path d="M50 65l-5 10" strokeDasharray="5 5" />
          <path d="M65 65l-5 10" strokeDasharray="5 5" />
        </svg>
      );
    case Mood.ANGRY:
      return (
        <svg {...commonProps}>
          <path d="M25 50a15 15 0 0 1 0-30a20 20 0 0 1 35 0a15 15 0 0 1 5 30h-10l5 10l-15-5l5 15l-15-10l5-5h-10" />
        </svg>
      );
    case Mood.SICK:
      return (
        <svg {...commonProps}>
          {/* Thermometerish */}
          <rect x="40" y="20" width="20" height="40" rx="10" />
          <circle cx="50" cy="70" r="15" />
          <path d="M50 30v30" />
          <path d="M80 30l5 5m-5-5l-5 5" /> {/* Germs */}
          <path d="M20 50l5 5m-5-5l-5 5" />
        </svg>
      );
    case Mood.STRESSED:
      return (
        <svg {...commonProps}>
          {/* Squiggly line head/explosion */}
          <path d="M30 40 Q40 10 50 40 T70 40" />
          <path d="M20 50l60 0" strokeDasharray="4 4" />
          <path d="M25 65l10-10l10 10l10-10l10 10" />
          <circle cx="35" cy="30" r="2" />
          <circle cx="65" cy="30" r="2" />
        </svg>
      );
      
    default:
      return null;
  }
};