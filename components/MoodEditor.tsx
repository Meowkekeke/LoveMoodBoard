import React, { useState } from 'react';
import { Mood, MOOD_EMOJIS, MOOD_COLORS } from '../types';
import { DoodleButton } from './DoodleButton';
import { X, Sparkles } from 'lucide-react';

interface MoodEditorProps {
  currentMood: Mood;
  currentNote: string;
  onSave: (mood: Mood, note: string) => void;
  onCancel: () => void;
}

export const MoodEditor: React.FC<MoodEditorProps> = ({ currentMood, currentNote, onSave, onCancel }) => {
  const [selectedMood, setSelectedMood] = useState<Mood>(currentMood);
  const [note, setNote] = useState(currentNote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedMood, note);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fffbeb] w-full max-w-md rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-y-auto max-h-[90vh] transform scale-100">
        <button 
          onClick={onCancel}
          className="absolute top-5 right-5 p-2 bg-white border-2 border-black rounded-full hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center items-center gap-2 mb-6 mt-2">
            <Sparkles className="text-[#fde047] fill-current" />
            <h2 className="text-3xl font-bold text-center">Current Vibe?</h2>
            <Sparkles className="text-[#fde047] fill-current" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-4 sm:gap-4">
            {Object.values(Mood).map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-2xl border-4 transition-all duration-200
                  ${selectedMood === mood 
                    ? `border-black ${MOOD_COLORS[mood]} -translate-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 rotate-[-3deg]` 
                    : 'border-transparent hover:bg-black/5 hover:border-black/10 hover:scale-105'
                  }
                `}
              >
                <span className="text-3xl sm:text-4xl">{MOOD_EMOJIS[mood]}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 bg-white p-4 rounded-2xl border-4 border-black/10">
            <label className="font-bold text-xl ml-1 flex items-center gap-2">
                ✏️ Add a note:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 border-2 border-black rounded-xl resize-none focus:outline-none focus:ring-4 ring-[#86efac]/50 text-xl font-[Patrick_Hand] bg-gray-50"
              rows={3}
              placeholder="Spill the tea... 🍵"
              maxLength={60}
            />
            <div className="text-right text-sm text-gray-500 font-bold">{note.length}/60</div>
          </div>

          <div className="flex gap-4 pt-2">
            <DoodleButton type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Nah
            </DoodleButton>
            <DoodleButton type="submit" variant="primary" className="flex-1">
              Post It!
            </DoodleButton>
          </div>
        </form>
      </div>
    </div>
  );
};