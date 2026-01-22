import React, { useState } from 'react';
import { X, ChevronRight, PenLine, Send, Ghost } from 'lucide-react';
import { ActionPanel } from './ActionPanel';
import { InteractionBar } from './InteractionBar';
import { DoodleButton } from './DoodleButton';
import { InteractionType } from '../types';

interface MenuModalProps {
  type: 'me' | 'partner';
  onClose: () => void;
  // Me Actions
  onOpenMoodEditor: () => void;
  onLogAction: (category: 'self_care'|'rough'|'needs', icon: string, label: string) => void;
  onStartSpaceMode: () => void;
  // Partner Actions
  onInteract: (type: InteractionType) => void;
  onSendPartnerNote: (note: string) => void;
  partnerName: string;
}

export const MenuModal: React.FC<MenuModalProps> = ({ 
  type, 
  onClose, 
  onOpenMoodEditor, 
  onLogAction,
  onStartSpaceMode,
  onInteract,
  onSendPartnerNote,
  partnerName
}) => {
  const [partnerNote, setPartnerNote] = useState('');

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerNote.trim()) {
      onSendPartnerNote(partnerNote);
      setPartnerNote('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] border-4 border-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 relative flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 pb-4">
          <h2 className="text-2xl font-bold font-[Patrick_Hand]">
            {type === 'me' ? 'My Journal' : `Connect with ${partnerName}`}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 border-2 border-gray-200 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content based on type */}
        {type === 'me' ? (
          <div className="space-y-6">
             {/* 1. Primary Write Action */}
             <button 
               onClick={onOpenMoodEditor}
               className="w-full flex items-center justify-between p-4 bg-[#fef9c3] border-4 border-black rounded-2xl hover:bg-[#fde047] transition-all active:scale-[0.98] shadow-sm group"
             >
               <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-full border-2 border-black">
                    <PenLine size={20} />
                 </div>
                 <div className="text-left">
                    <span className="font-bold text-lg block leading-none">Log Mood</span>
                    <span className="text-xs font-bold text-yellow-800 opacity-70">How are you feeling?</span>
                 </div>
               </div>
               <ChevronRight className="group-hover:translate-x-1 transition-transform" />
             </button>

             {/* 2. Quick Actions */}
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Quick Log Action</p>
                <ActionPanel onLogAction={(c, i, l) => { onLogAction(c, i, l); onClose(); }} />
             </div>

             <div className="border-t-2 border-dashed border-gray-200 my-2"></div>

             {/* 3. Space Mode (Red Zone) */}
             <button 
               onClick={() => { onClose(); onStartSpaceMode(); }}
               className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-800 hover:text-white hover:border-black transition-all font-bold"
             >
               <Ghost size={18} />
               I need some space
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Interactions */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Send Love</p>
              <InteractionBar onInteract={(t) => { onInteract(t); onClose(); }} />
            </div>

            <div className="border-t-2 border-dashed border-gray-200"></div>

            {/* 2. Note */}
            <form onSubmit={handleSendNote} className="space-y-3">
              <div className="relative">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Leave a Sticky Note</p>
                <textarea
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                  placeholder="Thinking of you..."
                  className="w-full p-4 border-2 border-gray-300 rounded-2xl bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-4 ring-purple-100 outline-none resize-none font-[Patrick_Hand] text-lg transition-all"
                  rows={3}
                  maxLength={100}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-bold">
                  {partnerNote.length}/100
                </div>
              </div>
              <DoodleButton type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-purple-100 hover:bg-purple-200 border-purple-900 text-purple-900">
                Post to Garden <Send size={18} />
              </DoodleButton>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};