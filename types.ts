export enum Mood {
  // Positive
  HAPPY = 'happy',
  EXCITED = 'excited',
  ROMANTIC = 'romantic',
  CHILL = 'chill',
  GRATEFUL = 'grateful',
  
  // Neutral/Body
  HUNGRY = 'hungry',
  TIRED = 'tired',
  CONFUSED = 'confused',

  // Negative
  SAD = 'sad',
  ANGRY = 'angry',
  SICK = 'sick',
  STRESSED = 'stressed'
}

export type InteractionType = 'water' | 'sun' | 'love' | 'poke';

export interface Interaction {
  type: InteractionType;
  senderId: string;
  timestamp: number;
}

export interface UserState {
  name: string;
  mood: Mood;
  note: string;
  lastUpdated: number; // Timestamp
}

export interface MoodEntry {
  id: string;
  userId: string;
  userName: string;
  mood: Mood;
  note: string;
  timestamp: number;
}

export interface RoomData {
  hostId: string;
  guestId?: string; // Optional until guest joins
  hostState: UserState;
  guestState: UserState;
  createdAt: number;
  lastInteraction?: Interaction;
  logs: MoodEntry[];
}

export type MoodCategory = 'positive' | 'neutral' | 'negative';

export const MOOD_CATEGORIES: Record<MoodCategory, { label: string, emoji: string, moods: Mood[], baseColor: string }> = {
  positive: { 
    label: 'Happy', 
    emoji: '😊',
    moods: [Mood.HAPPY, Mood.EXCITED, Mood.ROMANTIC, Mood.CHILL, Mood.GRATEFUL],
    baseColor: 'bg-[#fef9c3]' // Yellow-100
  },
  neutral: { 
    label: 'Ok-ish', 
    emoji: '😐',
    moods: [Mood.HUNGRY, Mood.TIRED, Mood.CONFUSED],
    baseColor: 'bg-[#f3f4f6]' // Gray-100
  },
  negative: { 
    label: 'Not Good', 
    emoji: '😫',
    moods: [Mood.SAD, Mood.ANGRY, Mood.SICK, Mood.STRESSED],
    baseColor: 'bg-[#dbeafe]' // Blue-100
  }
};

export const MOOD_COLORS: Record<Mood, string> = {
  // Positive
  [Mood.HAPPY]: 'bg-yellow-200',
  [Mood.EXCITED]: 'bg-orange-200',
  [Mood.ROMANTIC]: 'bg-pink-200',
  [Mood.CHILL]: 'bg-purple-200',
  [Mood.GRATEFUL]: 'bg-teal-200',
  
  // Neutral
  [Mood.HUNGRY]: 'bg-lime-200',
  [Mood.TIRED]: 'bg-slate-200',
  [Mood.CONFUSED]: 'bg-amber-100', // Beige

  // Negative
  [Mood.SAD]: 'bg-blue-200',
  [Mood.ANGRY]: 'bg-red-200',
  [Mood.SICK]: 'bg-emerald-100', // Sickly green
  [Mood.STRESSED]: 'bg-rose-200',
};