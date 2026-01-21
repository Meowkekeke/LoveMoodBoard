import { doc, setDoc, getDoc, updateDoc, onSnapshot, Unsubscribe, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { RoomData, Mood, UserState, InteractionType, MoodEntry } from '../types';

const ROOM_COLLECTION = 'couple_rooms';

// Generate a random 6-character code
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, 1, O, 0 for clarity
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const initialUserState: UserState = {
  name: 'Anonymous',
  mood: Mood.HAPPY,
  note: 'Just joined!',
  lastUpdated: Date.now(),
};

export const createRoom = async (userId: string, userName: string): Promise<string> => {
  const code = generateRoomCode();
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  const initialData: RoomData = {
    hostId: userId,
    hostState: { ...initialUserState, name: userName },
    guestState: { ...initialUserState, name: 'Waiting for partner...' },
    createdAt: Date.now(),
    logs: [] // Initialize empty logs
  };

  await setDoc(roomRef, initialData);
  return code;
};

export const joinRoom = async (code: string, userId: string, userName: string): Promise<boolean> => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    return false;
  }

  const data = roomSnap.data() as RoomData;

  // If I am already the host, just re-enter
  if (data.hostId === userId) {
    return true;
  }

  // If room is full and I'm not the guest
  if (data.guestId && data.guestId !== userId) {
    throw new Error("Room is full!");
  }

  // Determine if we need to update the guest slot
  if (!data.guestId) {
     await updateDoc(roomRef, {
      guestId: userId,
      'guestState.name': userName,
      'guestState.lastUpdated': Date.now()
    });
  }

  return true;
};

export const subscribeToRoom = (code: string, callback: (data: RoomData) => void): Unsubscribe => {
  return onSnapshot(doc(db, ROOM_COLLECTION, code), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as RoomData);
    }
  });
};

export const logMood = async (code: string, userId: string, userName: string, mood: Mood, note: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  const newEntry: MoodEntry = {
    id: crypto.randomUUID(),
    userId,
    userName,
    mood,
    note,
    timestamp: Date.now()
  };

  // We add to logs AND update the current state for backward compatibility/profile view
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const data = roomSnap.data() as RoomData;
  const isHost = data.hostId === userId;
  const fieldPrefix = isHost ? 'hostState' : 'guestState';

  await updateDoc(roomRef, {
    logs: arrayUnion(newEntry),
    [`${fieldPrefix}.mood`]: mood,
    [`${fieldPrefix}.note`]: note,
    [`${fieldPrefix}.lastUpdated`]: Date.now()
  });
};

export const sendInteraction = async (code: string, userId: string, type: InteractionType) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, {
    lastInteraction: {
      type,
      senderId: userId,
      timestamp: Date.now()
    }
  });
};