
export enum Mood {
  // Positive (10)
  HAPPY = 'happy',
  EXCITED = 'excited',
  ROMANTIC = 'romantic',
  CHILL = 'chill',
  GRATEFUL = 'grateful',
  PLAYFUL = 'playful',
  PROUD = 'proud',
  SAFE = 'safe',
  HOPEFUL = 'hopeful',
  ENERGETIC = 'energetic',
  
  // Neutral/Body (10)
  HUNGRY = 'hungry',
  TIRED = 'tired',
  CONFUSED = 'confused',
  BORED = 'bored',
  BUSY = 'busy',
  FOCUSED = 'focused',
  NUMB = 'numb',
  MEH = 'meh',
  COZY = 'cozy',
  WOBBLY = 'wobbly',

  // Negative (10)
  SAD = 'sad',
  ANGRY = 'angry',
  SICK = 'sick',
  STRESSED = 'stressed',
  ANXIOUS = 'anxious',
  LONELY = 'lonely',
  HURT = 'hurt',
  JEALOUS = 'jealous',
  OVERWHELMED = 'overwhelmed',
  GUILTY = 'guilty'
}

export type InteractionType = 'hug' | 'kiss' | 'love' | 'poke';

export interface Interaction {
  type: InteractionType;
  senderId: string;
  senderName: string;
  timestamp: number;
}

export interface UserState {
  name: string;
  mood: Mood;
  note: string;
  socialBattery: number; // 0-100
  lastUpdated: number; // Timestamp
  pendingInteraction?: Interaction | null; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface MoodEntry {
  id: string;
  userId: string;
  userName: string;
  type: 'mood' | 'action' | 'conversation';
  mood?: Mood; 
  category?: 'rough' | 'needs';
  icon?: string; 
  note: string;
  messages?: ChatMessage[];
  timestamp: number;
}

export interface SpaceModeState {
  isActive: boolean;
  initiatorId: string;
  initiatorName: string;
  endTime: number;
  reason?: string;
}

export interface RoomData {
  hostId: string;
  guestId?: string;
  hostState: UserState;
  guestState: UserState;
  createdAt: number;
  lastInteraction?: Interaction;
  logs: MoodEntry[];
  
  conversationActive?: boolean;
  conversationTopic?: string;
  conversationTrigger?: 'rough' | 'needs';
  conversationSourceLogId?: string | null;
  messages?: ChatMessage[];

  spaceMode?: SpaceModeState;
}

export type MoodCategory = 'positive' | 'neutral' | 'negative';

export const MOOD_CATEGORIES: Record<MoodCategory, { label: string, emoji: string, moods: Mood[], baseColor: string }> = {
  positive: { 
    label: 'Good', 
    emoji: '😊',
    moods: [
      Mood.HAPPY, Mood.EXCITED, Mood.ROMANTIC, Mood.CHILL, Mood.GRATEFUL,
      Mood.PLAYFUL, Mood.PROUD, Mood.SAFE, Mood.HOPEFUL, Mood.ENERGETIC
    ],
    baseColor: 'bg-[#fef9c3]' // Yellow-100
  },
  neutral: { 
    label: 'Meh', 
    emoji: '😐',
    moods: [
      Mood.HUNGRY, Mood.TIRED, Mood.CONFUSED, Mood.BORED, Mood.BUSY,
      Mood.FOCUSED, Mood.NUMB, Mood.MEH, Mood.COZY, Mood.WOBBLY
    ],
    baseColor: 'bg-[#f3f4f6]' // Gray-100
  },
  negative: { 
    label: 'Bad', 
    emoji: '😫',
    moods: [
      Mood.SAD, Mood.ANGRY, Mood.SICK, Mood.STRESSED, Mood.ANXIOUS,
      Mood.LONELY, Mood.HURT, Mood.JEALOUS, Mood.OVERWHELMED, Mood.GUILTY
    ],
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
  [Mood.PLAYFUL]: 'bg-lime-200',
  [Mood.PROUD]: 'bg-amber-200',
  [Mood.SAFE]: 'bg-emerald-200',
  [Mood.HOPEFUL]: 'bg-sky-200',
  [Mood.ENERGETIC]: 'bg-red-200', // Energetic often red/orange
  
  // Neutral
  [Mood.HUNGRY]: 'bg-orange-100',
  [Mood.TIRED]: 'bg-slate-200',
  [Mood.CONFUSED]: 'bg-stone-200',
  [Mood.BORED]: 'bg-gray-200',
  [Mood.BUSY]: 'bg-blue-100',
  [Mood.FOCUSED]: 'bg-indigo-100',
  [Mood.NUMB]: 'bg-gray-300',
  [Mood.MEH]: 'bg-zinc-200',
  [Mood.COZY]: 'bg-orange-50',
  [Mood.WOBBLY]: 'bg-violet-100',

  // Negative
  [Mood.SAD]: 'bg-blue-200',
  [Mood.ANGRY]: 'bg-red-300',
  [Mood.SICK]: 'bg-green-100',
  [Mood.STRESSED]: 'bg-rose-200',
  [Mood.ANXIOUS]: 'bg-cyan-200',
  [Mood.LONELY]: 'bg-indigo-200',
  [Mood.HURT]: 'bg-fuchsia-200',
  [Mood.JEALOUS]: 'bg-lime-300',
  [Mood.OVERWHELMED]: 'bg-orange-300',
  [Mood.GUILTY]: 'bg-stone-300',
};

// --- ACTION CONFIGURATION ---

export interface ActionItem {
  id: string;
  label: string;
  icon: string; 
  color: string;
}

export const ACTION_CATEGORIES = {
  needs: {
    label: 'Needs',
    color: 'bg-purple-50 border-purple-200',
    items: [
      { id: 'talk', label: "Let's Talk", icon: 'MessageCircle', color: 'text-emerald-600' },
      { id: 'hug', label: 'Need Hug', icon: 'Heart', color: 'text-pink-500' },
      { id: 'sleep_early', label: 'Sleep Early', icon: 'MoonStar', color: 'text-indigo-500' },
      { id: 'help', label: 'House Help', icon: 'Home', color: 'text-orange-600' },
      { id: 'listen', label: 'Listen', icon: 'Ear', color: 'text-amber-600' },
    ]
  },
  rough: {
    label: 'Rough Time',
    color: 'bg-red-50 border-red-200',
    items: [
      { id: 'bad_meeting', label: 'Bad Meeting', icon: 'Briefcase', color: 'text-red-600' },
      { id: 'no_sleep', label: 'No Sleep', icon: 'Moon', color: 'text-indigo-600' },
      { id: 'tired', label: 'Just Tired', icon: 'BatteryLow', color: 'text-orange-500' },
      { id: 'poorly', label: 'Felt Poorly', icon: 'Frown', color: 'text-gray-600' },
      { id: 'anxious', label: 'Anxious', icon: 'Wind', color: 'text-blue-400' },
      { id: 'sick', label: 'Feeling Sick', icon: 'Thermometer', color: 'text-red-500' },
      { id: 'other', label: 'Other', icon: 'Edit3', color: 'text-gray-500' },
    ]
  }
};
