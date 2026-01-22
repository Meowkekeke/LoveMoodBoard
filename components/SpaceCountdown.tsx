import React, { useState, useEffect } from 'react';
import { Ghost, Clock, Loader2, Check } from 'lucide-react';
import { DoodleButton } from './DoodleButton';

interface SpaceCountdownProps {
  endTime: number;
  initiatorName: string;
  isMe: boolean;
  reason?: string;
  onEndEarly?: () => void;
}

export const SpaceCountdown: React.FC<SpaceCountdownProps> = ({ endTime, initiatorName, isMe, reason, onEndEarly }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours > 0 ? hours + ':' : ''}${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500 w-full bg-[#f0fdf4]">
      
      {/* Icon Circle */}
      <div className="relative mb-8 mt-10">
        <div className="absolute inset-0 bg-gray-200 rounded-full animate-ping opacity-20"></div>
        <div className="w-40 h-40 bg-gray-100 rounded-full border-8 border-gray-300 flex items-center justify-center relative z-10 shadow-lg">
           <Ghost size={80} className="text-gray-400" />
        </div>
        
        {/* Orbiting Moon */}
        <div className="absolute top-0 left-0 w-full h-full animate-spin" style={{ animationDuration: '10s' }}>
             <div className="w-8 h-8 bg-indigo-200 rounded-full absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-indigo-300"></div>
        </div>
      </div>

      <h2 className="text-4xl font-bold text-gray-700 mb-2 font-[Patrick_Hand] tracking-wider">
        {isMe ? 'You are recharging' : `${initiatorName} needs space`}
      </h2>
      
      {/* Reason Pill */}
      {reason && (
        <div className="bg-white border-2 border-black px-6 py-3 rounded-xl mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] -rotate-1 max-w-xs">
            <p className="text-lg font-bold text-gray-600 italic">"{reason}"</p>
        </div>
      )}

      <div className="bg-black/5 px-6 py-2 rounded-2xl mb-8 inline-block">
        <div className="text-6xl font-mono font-bold text-gray-800 tracking-widest tabular-nums">
            {timeLeft}
        </div>
      </div>

      <p className="text-xl text-gray-500 font-bold max-w-xs leading-relaxed mb-10">
        {isMe 
          ? "The world can wait. Take your time to breathe." 
          : "They are taking a moment to recharge. Interaction is paused until the timer ends."
        }
      </p>

      {isMe && onEndEarly && (
        <DoodleButton onClick={onEndEarly} className="animate-pulse hover:animate-none bg-white">
            I'm Ready to Return <Check size={20} className="inline ml-2"/>
        </DoodleButton>
      )}

      {!isMe && (
          <div className="bg-gray-200/50 p-4 rounded-xl text-gray-500 font-bold text-sm uppercase tracking-widest">
              🔒 Garden Locked
          </div>
      )}

    </div>
  );
};