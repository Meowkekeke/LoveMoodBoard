import React from 'react';
import { Shuffle } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  onShuffle: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onShuffle }) => {
  return (
    <div className="relative mt-8">
       {/* Background decorative tape */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-red-200/80 backdrop-blur-sm border-2 border-black/20 rotate-1 z-10 shadow-sm clip-path-tape"></div>
      
      <div className="bg-[#fefce8] p-5 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Conversation Seed 🌱</h4>
            <button 
                onClick={onShuffle}
                className="p-1 hover:bg-black/5 rounded-full transition-colors"
                title="New Question"
            >
                <Shuffle size={16} className="text-gray-400" />
            </button>
        </div>
        
        <p className="text-xl font-bold text-center py-2 text-gray-800 font-[Patrick_Hand]">
            {question || "What's on your mind today?"}
        </p>
      </div>
    </div>
  );
};