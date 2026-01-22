import { doc, setDoc, getDoc, updateDoc, onSnapshot, Unsubscribe, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { RoomData, Mood, UserState, InteractionType, MoodEntry, ChatMessage, SpaceModeState } from '../types';

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
    logs: [], // Initialize empty logs
    conversationActive: false,
    messages: [],
    spaceMode: { isActive: false, initiatorId: '', initiatorName: '', endTime: 0 }
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

export const logMood = async (code: string, userId: string, userName: string, mood: Mood | null, note: string, actionConfig?: { category: 'self_care'|'rough'|'needs', icon: string }): Promise<string> => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  const entryId = crypto.randomUUID();

  // Create object with only defined values to avoid Firestore "Unsupported field value: undefined" error
  const newEntry: MoodEntry = {
    id: entryId,
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
  if (!roomSnap.exists()) return entryId;
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
  return entryId;
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
      'guestState.lastUpdated': Date.now(),
      conversationActive: false,
      messages: [],
      spaceMode: { isActive: false, initiatorId: '', initiatorName: '', endTime: 0 }
    };

    await updateDoc(roomRef, updates);
  }
};

export const deleteRoom = async (code: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await deleteDoc(roomRef);
};

// --- SPACE MODE ---

export const activateSpaceMode = async (code: string, userId: string, userName: string, durationMinutes: number) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  const endTime = Date.now() + (durationMinutes * 60 * 1000);
  
  const spaceModeData: SpaceModeState = {
    isActive: true,
    initiatorId: userId,
    initiatorName: userName,
    endTime: endTime
  };

  // Log it as an action too so there is a record
  const entryId = crypto.randomUUID();
  const newEntry: MoodEntry = {
    id: entryId,
    userId,
    userName,
    type: 'action',
    category: 'rough',
    icon: 'Ghost',
    note: `Taking space for ${durationMinutes}m`,
    timestamp: Date.now()
  };

  await updateDoc(roomRef, {
    spaceMode: spaceModeData,
    logs: arrayUnion(newEntry)
  });
};

export const checkAndEndSpaceMode = async (roomData: RoomData, code: string) => {
    if (roomData.spaceMode?.isActive && Date.now() > roomData.spaceMode.endTime) {
         const roomRef = doc(db, ROOM_COLLECTION, code);
         await updateDoc(roomRef, {
             'spaceMode.isActive': false
         });
    }
};

// --- CONVERSATION ZONE HELPERS ---

export const startConversation = async (code: string, topic: string, trigger: 'rough' | 'needs' = 'needs', sourceLogId?: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  await updateDoc(roomRef, {
    conversationActive: true,
    conversationTopic: topic,
    conversationTrigger: trigger,
    conversationSourceLogId: sourceLogId || null,
    messages: [] // Reset messages for new topic
  });
};

export const sendChatMessage = async (code: string, userId: string, userName: string, text: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  
  const newMessage: ChatMessage = {
    id: crypto.randomUUID(),
    senderId: userId,
    senderName: userName,
    text,
    timestamp: Date.now()
  };

  await updateDoc(roomRef, {
    messages: arrayUnion(newMessage)
  });
};

export const endConversation = async (code: string) => {
  const roomRef = doc(db, ROOM_COLLECTION, code);
  const snap = await getDoc(roomRef);
  
  if (snap.exists()) {
    const data = snap.data() as RoomData;
    
    // Determine title based on trigger
    let title = 'Heart-to-Heart'; 
    if (data.conversationTrigger === 'needs') {
      title = 'Game Plan';
    }

    const logs = data.logs || [];
    const sourceId = data.conversationSourceLogId;
    
    // 1. Try to find log by exact ID
    let logIndex = logs.findIndex(l => l.id === sourceId);

    // 2. Heuristic Fallback: If exact ID not found, find the most recent log 
    // that matches the trigger type. This fixes "initial log not changing" if ID is lost.
    if (logIndex === -1 && data.conversationTrigger) {
        for (let i = logs.length - 1; i >= 0; i--) {
            const l = logs[i];
            if (l.type === 'action' && l.category === data.conversationTrigger) {
                logIndex = i;
                break;
            }
        }
    }

    // If we found the source log, update it regardless of message count 
    if (logIndex !== -1) {
        const updatedLog = { ...logs[logIndex] };
        
        // Transform into shared conversation
        updatedLog.type = 'conversation';
        updatedLog.userId = 'SHARED'; // Visible to both
        updatedLog.userName = title; // 'Heart-to-Heart' or 'Game Plan'
        updatedLog.messages = data.messages || [];
        
        const newLogs = [...logs];
        newLogs[logIndex] = updatedLog;
        
        await updateDoc(roomRef, {
            logs: newLogs,
            conversationActive: false,
            messages: [],
            conversationTopic: '',
            conversationSourceLogId: null
        });

    } else if (data.messages && data.messages.length > 0) {
       // Fallback: create new entry only if we really couldn't find a source log
       const archiveEntry: MoodEntry = {
        id: crypto.randomUUID(),
        userId: 'SHARED', // Special ID for shared logs
        userName: title, 
        type: 'conversation',
        note: data.conversationTopic || 'Conversation',
        messages: data.messages,
        timestamp: Date.now()
      };
      
      await updateDoc(roomRef, {
        conversationActive: false,
        messages: [],
        conversationTopic: '',
        logs: arrayUnion(archiveEntry),
        conversationSourceLogId: null
      });
    } else {
      // Just close if empty and no source log found to patch
      await updateDoc(roomRef, {
        conversationActive: false,
        conversationSourceLogId: null
      });
    }
  }
};