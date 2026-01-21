export enum Mood {
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  ROMANTIC = 'romantic',
  TIRED = 'tired',
  EXCITED = 'excited',
  HUNGRY = 'hungry',
  CHILL = 'chill'
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

export interface RoomData {
  hostId: string;
  guestId?: string; // Optional until guest joins
  hostState: UserState;
  guestState: UserState;
  createdAt: number;
  lastInteraction?: Interaction;
  dailyQuestion?: string;
  dailyQuestionTimestamp?: number;
}

export const MOOD_EMOJIS: Record<Mood, string> = {
  [Mood.HAPPY]: '😊',
  [Mood.SAD]: '😢',
  [Mood.ANGRY]: '😠',
  [Mood.ROMANTIC]: '🥰',
  [Mood.TIRED]: '😴',
  [Mood.EXCITED]: '🤩',
  [Mood.HUNGRY]: '🤤',
  [Mood.CHILL]: '😎',
};

export const MOOD_COLORS: Record<Mood, string> = {
  [Mood.HAPPY]: 'bg-yellow-200',
  [Mood.SAD]: 'bg-blue-200',
  [Mood.ANGRY]: 'bg-red-200',
  [Mood.ROMANTIC]: 'bg-pink-200',
  [Mood.TIRED]: 'bg-gray-200',
  [Mood.EXCITED]: 'bg-orange-200',
  [Mood.HUNGRY]: 'bg-green-200',
  [Mood.CHILL]: 'bg-purple-200',
};

export const QUESTIONS = [
  "What's the best thing that happened today?",
  "What are you craving right now?",
  "If we could teleport anywhere, where to?",
  "What's a movie you want to watch together?",
  "What's your favorite memory of us recently?",
  "How can I make your day better?",
  "What's a small goal for this week?",
  "Send a selfie right now!",
  "What song describes your mood?",
  "Rate your energy level 1-10.",
  "Plan our next date meal.",
  "What's something funny you saw today?"
];