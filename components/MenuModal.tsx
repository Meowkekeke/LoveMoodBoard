import React, { useState } from 'react';
import { X, ChevronRight, PenLine, Send } from 'lucide-react';
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
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 relative flex flex-col max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {type === 'me' ? 'How are you?' : `For ${partnerName}`}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 border-2 border-black rounded-full hover:bg-gray-200 transition-colors shadow-sm active:translate-y-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content based on type */}
        {type === 'me' ? (
          <div className="space-y-6">
             <button 
               onClick={onOpenMoodEditor}
               className="w-full flex items-center justify-between p-4 bg-[#fef9c3] border-4 border-black rounded-2xl hover:bg-[#fde047] transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group"
             >
               <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-full border-2 border-black">
                    <PenLine size={20} />
                 </div>
                 <span className="font-bold text-lg">Write Note / Mood</span>
               </div>
               <ChevronRight className="group-hover:translate-x-1 transition-transform" />
             </button>

             <div className="relative flex items-center justify-center">
                <div className="border-t-2 border-dashed border-gray-300 w-full absolute"></div>
                <span className="bg-white px-3 text-gray-400 text-xs font-bold relative z-10 uppercase tracking-widest">Or Quick Log</span>
             </div>

             <ActionPanel onLogAction={(c, i, l) => { onLogAction(c, i, l); onClose(); }} />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Send Interaction</p>
              <InteractionBar onInteract={(t) => { onInteract(t); onClose(); }} />
            </div>

            <div className="relative flex items-center justify-center">
                <div className="border-t-2 border-dashed border-gray-300 w-full absolute"></div>
                <span className="bg-white px-3 text-gray-400 text-xs font-bold relative z-10 uppercase tracking-widest">Or Write Note</span>
             </div>

            <form onSubmit={handleSendNote} className="space-y-3">
              <div className="relative">
                <textarea
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                  placeholder={`Leave a note for ${partnerName}...`}
                  className="w-full p-4 border-4 border-black rounded-2xl bg-purple-50 focus:bg-white focus:ring-4 ring-purple-200 outline-none resize-none font-[Patrick_Hand] text-lg"
                  rows={3}
                  maxLength={100}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-bold">
                  {partnerNote.length}/100
                </div>
              </div>
              <DoodleButton type="submit" className="w-full flex items-center justify-center gap-2">
                Send Note <Send size={18} />
              </DoodleButton>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};