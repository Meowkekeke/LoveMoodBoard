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

export type InteractionType = 'hug' | 'kiss' | 'love' | 'poke';

export interface Interaction {
  type: InteractionType;
  senderId: string;
  senderName: string; // Added name so we can display it easily
  timestamp: number;
}

export interface UserState {
  name: string;
  mood: Mood;
  note: string;
  socialBattery: number; // 0-100
  lastUpdated: number; // Timestamp
  pendingInteraction?: Interaction | null; // The notification waiting for this user
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
  type: 'mood' | 'action' | 'conversation'; // Added 'conversation'
  mood?: Mood; // Only for type 'mood'
  category?: 'self_care' | 'rough' | 'needs'; // Only for type 'action'
  icon?: string; // Icon identifier for actions
  note: string; // For conversations, this is the topic
  messages?: ChatMessage[]; // For archived conversations
  timestamp: number;
}

export interface RoomData {
  hostId: string;
  guestId?: string; // Optional until guest joins
  hostState: UserState;
  guestState: UserState;
  createdAt: number;
  lastInteraction?: Interaction; // Kept for legacy or global effects if needed
  logs: MoodEntry[];
  
  // Conversation Zone State
  conversationActive?: boolean;
  conversationTopic?: string;
  conversationTrigger?: 'rough' | 'needs'; // Track source
  messages?: ChatMessage[];
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

// --- ACTION CONFIGURATION ---

export interface ActionItem {
  id: string;
  label: string;
  icon: string; // We'll map string to Lucide icon in component
  color: string;
}

export const ACTION_CATEGORIES = {
  self_care: {
    label: 'Self Care',
    color: 'bg-green-100 border-green-300',
    items: [
      { id: 'meditation', label: 'Meditation', icon: 'Flower', color: 'text-pink-500' },
      { id: 'walk', label: 'Walk', icon: 'Footprints', color: 'text-orange-600' },
      { id: 'yoga', label: 'Yoga', icon: 'Activity', color: 'text-purple-600' },
      { id: 'gym', label: 'Gym', icon: 'Dumbbell', color: 'text-slate-600' },
      { id: 'read', label: 'Read', icon: 'BookOpen', color: 'text-blue-600' },
      { id: 'painting', label: 'Painting', icon: 'Palette', color: 'text-red-500' },
      { id: 'hydrate', label: 'Hydrate', icon: 'Droplet', color: 'text-cyan-500' },
    ]
  },
  rough: {
    label: 'Rough',
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
  },
  needs: {
    label: 'Needs',
    color: 'bg-purple-50 border-purple-200',
    items: [
      { id: 'talk', label: "Let's Talk", icon: 'MessageCircle', color: 'text-emerald-600' },
      { id: 'hug', label: 'Need Hug', icon: 'Heart', color: 'text-pink-500' },
      { id: 'sleep_early', label: 'Sleep Early', icon: 'MoonStar', color: 'text-indigo-500' },
      { id: 'help', label: 'House Help', icon: 'Home', color: 'text-orange-600' },
      { id: 'listen', label: 'Listen', icon: 'Ear', color: 'text-amber-600' },
      { id: 'space', label: 'Space', icon: 'Ghost', color: 'text-gray-400' },
    ]
  }
};