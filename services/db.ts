import { doc, setDoc, getDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase';
import { RoomData, Mood, UserState } from '../types';

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
  return onSnapshot(doc(db, ROOM_COLLECTION, code), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as RoomData);
    }
  });
};

export const updateMyState = async (code: string, isHost: boolean, updates: Partial<UserState>) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const fieldPrefix = isHost ? 'hostState' : 'guestState';
  
  // We need to construct the update object dynamically for nested fields
  const firestoreUpdates: Record<string, any> = {};
  
  Object.keys(updates).forEach((key) => {
    // @ts-ignore
    firestoreUpdates[`${fieldPrefix}.${key}`] = updates[key as keyof UserState];
  });
  
  firestoreUpdates[`${fieldPrefix}.lastUpdated`] = Date.now();

  await updateDoc(roomRef, firestoreUpdates);
};