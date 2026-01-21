import React, { useState } from 'react';
import { Mood, MOOD_EMOJIS, MOOD_COLORS } from '../types';
import { DoodleButton } from './DoodleButton';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-center mb-6">How are you feeling?</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-3">
            {Object.values(Mood).map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all
                  ${selectedMood === mood 
                    ? `border-black ${MOOD_COLORS[mood]} scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10` 
                    : 'border-transparent hover:bg-gray-100 hover:border-gray-200'
                  }
                `}
              >
                <span className="text-3xl">{MOOD_EMOJIS[mood]}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="font-bold text-lg ml-1">Add a little note:</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-4 border-2 border-black rounded-xl resize-none focus:outline-none focus:ring-4 ring-[#A1C4FD]/50 text-xl font-[Patrick_Hand]"
              rows={3}
              placeholder="I'm craving tacos..."
              maxLength={60}
            />
            <div className="text-right text-sm text-gray-500">{note.length}/60</div>
          </div>

          <div className="flex gap-4 pt-2">
            <DoodleButton type="button" variant="secondary" onClick={onCancel} className="flex-1">
              Cancel
            </DoodleButton>
            <DoodleButton type="submit" variant="primary" className="flex-1">
              Share Mood
            </DoodleButton>
          </div>
        </form>
      </div>
    </div>
  );
};