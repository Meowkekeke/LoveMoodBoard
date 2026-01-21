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