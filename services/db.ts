import { doc, setDoc, getDoc, updateDoc, onSnapshot, Unsubscribe, arrayUnion, deleteDoc } from 'firebase/firestore';
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
  socialBattery: 80,
  lastUpdated: Date.now(),
  pendingInteraction: null
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
      'guestState.lastUpdated': Date.now(),
      'guestState.pendingInteraction': null
    });
  }

  return true;
};

// Updated to allow returning null if document is deleted
export const subscribeToRoom = (code: string, callback: (data: RoomData | null) => void): Unsubscribe => {
  return onSnapshot(doc(db, ROOM_COLLECTION, code), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as RoomData);
    } else {
      callback(null); // Document deleted
    }
  });
};

export const logMood = async (code: string, userId: string, userName: string, mood: Mood | null, note: string, actionConfig?: { category: 'self_care'|'rough'|'needs', icon: string }) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  // Create object with only defined values to avoid Firestore "Unsupported field value: undefined" error
  const newEntry: MoodEntry = {
    id: crypto.randomUUID(),
    userId,
    userName,
    type: actionConfig ? 'action' : 'mood',
    note,
    timestamp: Date.now()
  };

  if (mood) {
    newEntry.mood = mood;
  }

  if (actionConfig) {
    newEntry.category = actionConfig.category;
    newEntry.icon = actionConfig.icon;
  }

  // We add to logs AND update the current state for backward compatibility/profile view
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const data = roomSnap.data() as RoomData;
  const isHost = data.hostId === userId;
  const fieldPrefix = isHost ? 'hostState' : 'guestState';

  const updates: any = {
    logs: arrayUnion(newEntry),
    [`${fieldPrefix}.lastUpdated`]: Date.now()
  };

  // Only update current mood state if it's a mood entry
  if (!actionConfig && mood) {
      updates[`${fieldPrefix}.mood`] = mood;
      updates[`${fieldPrefix}.note`] = note;
  }

  await updateDoc(roomRef, updates);
};

export const updateSocialBattery = async (code: string, userId: string, level: number) => {
    const roomRef = doc(db, ROOM_COLLECTION, code);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;
    const data = roomSnap.data() as RoomData;
    const isHost = data.hostId === userId;
    const fieldPrefix = isHost ? 'hostState' : 'guestState';

    await updateDoc(roomRef, {
        [`${fieldPrefix}.socialBattery`]: level,
        [`${fieldPrefix}.lastUpdated`]: Date.now()
    });
};

// Send interaction to the PARTNER'S pending state
export const sendInteraction = async (code: string, senderId: string, senderName: string, type: InteractionType) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const data = roomSnap.data() as RoomData;
  
  // If I am the host, I'm sending TO the guest
  const isHost = data.hostId === senderId;
  const targetFieldPrefix = isHost ? 'guestState' : 'hostState';

  await updateDoc(roomRef, {
    [`${targetFieldPrefix}.pendingInteraction`]: {
      type,
      senderId,
      senderName,
      timestamp: Date.now()
    }
  });
};

// Clear my own pending interaction
export const dismissInteraction = async (code: string, userId: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return;
  const data = roomSnap.data() as RoomData;
  
  const isHost = data.hostId === userId;
  const myFieldPrefix = isHost ? 'hostState' : 'guestState';

  await updateDoc(roomRef, {
    [`${myFieldPrefix}.pendingInteraction`]: null
  });
};

export const clearRoomLogs = async (code: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const snap = await getDoc(roomRef);
  
  if (snap.exists()) {
    // Clear logs completely and reset user states to a "fresh" state
    const updates: any = {
      logs: [],
      'hostState.mood': Mood.HAPPY,
      'hostState.note': 'Fresh start! 🌱',
      'hostState.lastUpdated': Date.now(),
      'guestState.mood': Mood.HAPPY,
      'guestState.note': 'Fresh start! 🌱',
      'guestState.lastUpdated': Date.now()
    };

    await updateDoc(roomRef, updates);
  }
};

export const deleteRoom = async (code: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await deleteDoc(roomRef);
};