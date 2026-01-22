import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Copy, LogOut, Settings, Trash2, Eraser, X, Bell, Plus, Users, User, Ghost, MessageCircle, Cloud, Sun, Flower, Leaf, Heart, Star } from 'lucide-react';
import { createRoom, joinRoom, subscribeToRoom, logMood, sendInteraction, dismissInteraction, updateSocialBattery, clearRoomLogs, deleteRoom, startConversation, activateSpaceMode, endSpaceMode, checkAndEndSpaceMode } from './services/db';
import { RoomData, Mood, InteractionType } from './types';
import { MoodCard } from './components/MoodCard';
import { MoodEditor } from './components/MoodEditor';
import { DoodleButton } from './components/DoodleButton';
import { SocialBattery } from './components/SocialBattery';
import { MenuModal } from './components/MenuModal';
import { InteractionModal } from './components/InteractionModal';
import { SentFeedbackModal } from './components/SentFeedbackModal';
import { RoughFollowUpModal } from './components/RoughFollowUpModal';
import { ConversationZone } from './components/ConversationZone';
import { SpaceDurationModal } from './components/SpaceDurationModal';
import { SpaceCountdown } from './components/SpaceCountdown';

// Utility for persistent User ID
const getUserId = () => {
  let id = localStorage.getItem('lovesync_uid');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('lovesync_uid', id);
  }
  return id;
};

// Utility for sending notifications
const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    if (document.visibilityState === 'hidden') {
       new Notification(title, {
         body,
         icon: '/icon-192.png',
         vibrate: [200, 100, 200]
       } as any);
    }
  }
};

const App: React.FC = () => {
  // Application State
  const [userId] = useState(getUserId());
  const [roomCode, setRoomCode] = useState<string | null>(localStorage.getItem('lovesync_code'));
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [userName, setUserName] = useState<string>(localStorage.getItem('lovesync_name') || '');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'me' | 'partner'>('me');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false); // Controls MoodEditor
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Controls FAB Menu
  const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('lovesync_name'));
  const [showSettings, setShowSettings] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  
  // Modal State for Interactions
  const [sentInteractionData, setSentInteractionData] = useState<{ type: InteractionType; partnerName: string } | null>(null);
  const [pendingRoughLog, setPendingRoughLog] = useState<{ icon: string; label: string } | null>(null);
  const [showSpaceDuration, setShowSpaceDuration] = useState(false);

  // Refs for change detection (Notifications)
  const prevLogsLength = useRef(0);
  const prevInteractionTimestamp = useRef(0);

  // Request Notification Permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Subscription Effect
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToRoom(roomCode, (data) => {
      if (!data) {
        localStorage.removeItem('lovesync_code');
        setRoomCode(null);
        setRoomData(null);
        setShowSettings(false);
        setError('The garden was destroyed.');
        return;
      }
      setRoomData(data);
    });

    const interval = setInterval(() => {
        if (roomData && roomCode) {
            checkAndEndSpaceMode(roomData, roomCode);
        }
    }, 60000);

    return () => {
        unsubscribe();
        clearInterval(interval);
    }
  }, [roomCode, userId, roomData]); 

  // Notification Logic
  useEffect(() => {
    if (!roomData) return;
    
    const isSpaceActive = roomData.spaceMode?.isActive && (roomData.spaceMode.endTime > Date.now());
    const amITakingSpace = isSpaceActive && roomData.spaceMode?.initiatorId === userId;
    
    if (amITakingSpace) {
        prevLogsLength.current = roomData.logs.length;
        return;
    }

    if (roomData.logs.length > prevLogsLength.current) {
        const newLog = roomData.logs[roomData.logs.length - 1];
        if (newLog.userId !== userId && newLog.userId !== 'SHARED') {
            sendNotification('New Note 🌱', `${newLog.userName}: ${newLog.note}`);
        }
    }
    prevLogsLength.current = roomData.logs.length;

    const myData = roomData.hostId === userId ? roomData.hostState : roomData.guestState;
    if (myData.pendingInteraction) {
        if (myData.pendingInteraction.timestamp > prevInteractionTimestamp.current) {
            sendNotification('New Love! ❤️', `${myData.pendingInteraction.senderName} sent a ${myData.pendingInteraction.type}!`);
            prevInteractionTimestamp.current = myData.pendingInteraction.timestamp;
        }
    }
  }, [roomData, userId]);


  useEffect(() => {
    if (roomData && !roomData.conversationActive) {
        setIsChatMinimized(false);
    }
  }, [roomData?.conversationActive]);

  // Derived Data
  const isSpaceActive = roomData?.spaceMode?.isActive && (roomData.spaceMode.endTime > Date.now());
  const amITakingSpace = isSpaceActive && roomData?.spaceMode?.initiatorId === userId;
  const isPartnerTakingSpace = isSpaceActive && !amITakingSpace;

  const handleCreateRoom = async () => {
    if (!userName.trim()) { setShowNameModal(true); return; }
    setIsLoading(true); setError('');
    try {
      const code = await createRoom(userId, userName);
      localStorage.setItem('lovesync_code', code);
      setRoomCode(code);
    } catch (err) { setError('Failed to create room.'); } finally { setIsLoading(false); }
  };

  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    if (!userName.trim()) { setShowNameModal(true); return; }
    setIsLoading(true); setError('');
    try {
      const success = await joinRoom(inputCode.toUpperCase().trim(), userId, userName);
      if (success) {
        localStorage.setItem('lovesync_code', inputCode.toUpperCase().trim());
        setRoomCode(inputCode.toUpperCase().trim());
      } else { setError('Room not found or full!'); }
    } catch (err: any) { setError(err.message || 'Failed to join.'); } finally { setIsLoading(false); }
  };

  const handleAddLog = async (mood: Mood, note: string) => {
    if (!roomCode || !roomData) return;
    try { await logMood(roomCode, userId, userName, mood, note); setIsEditing(false); } 
    catch (err) { alert("Couldn't add note."); }
  };

  const handleActionLog = async (category: 'self_care'|'rough'|'needs', icon: string, label: string) => {
    if (!roomCode) return;
    if (category === 'rough') { setIsMenuOpen(false); setPendingRoughLog({ icon, label }); return; }
    try {
      const logId = await logMood(roomCode, userId, userName, null, label, { category, icon });
      if (category === 'needs') {
        await startConversation(roomCode, `${userName} posted: ${label}`, 'needs', logId);
        setIsChatMinimized(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleRoughCompletion = async (needId: string, needLabel: string) => {
    if (!roomCode || !pendingRoughLog) return;
    try {
      const combinedNote = `${pendingRoughLog.label} • ${needLabel}`;
      const logId = await logMood(roomCode, userId, userName, null, combinedNote, { category: 'rough', icon: pendingRoughLog.icon });
      setPendingRoughLog(null);
      await startConversation(roomCode, `${userName} is having a rough time: ${combinedNote}`, 'rough', logId);
      setIsChatMinimized(false);
    } catch (err) { console.error(err); }
  };

  const handleStartSpaceMode = async (minutes: number, reason: string) => {
     if (!roomCode) return;
     try {
         await activateSpaceMode(roomCode, userId, userName, minutes, reason);
         setShowSpaceDuration(false);
         setPendingRoughLog(null);
     } catch (err) { console.error(err); }
  };

  const handleEndSpaceEarly = async () => {
    if (!roomCode) return;
    try { await endSpaceMode(roomCode); } catch (err) { console.error(err); }
  };

  const handleBatteryUpdate = async (level: number) => {
    if (!roomCode) return;
    try { await updateSocialBattery(roomCode, userId, level); } catch (err) { console.error(err); }
  };

  const handleDismissInteraction = async () => {
      if (!roomCode) return;
      try { await dismissInteraction(roomCode, userId); } catch (err) { console.error(err); }
  };

  const handleInteraction = async (type: InteractionType) => {
      if (!roomCode || !roomData) return;
      const isHost = roomData.hostId === userId;
      const targetId = isHost ? roomData.guestId : roomData.hostId;
      const targetName = isHost ? roomData.guestState.name : roomData.hostState.name;
      if (!targetId) { alert("Partner hasn't joined yet!"); return; }

      const messages: Record<InteractionType, string> = {
          hug: 'sent a hug 🤗', kiss: 'sent a kiss 💋', poke: 'poked you 👉', love: 'sent love ❤️'
      };

      try {
          await logMood(roomCode, userId, userName, null, messages[type], { category: 'needs', icon: 'Heart' });
          await sendInteraction(roomCode, userId, userName, type);
          setSentInteractionData({ type, partnerName: targetName || 'Partner' });
      } catch (err) { console.error(err); }
  };

  const handleSendPartnerNote = async (note: string) => {
      if (!roomCode || !roomData) return;
      const isHost = roomData.hostId === userId;
      const targetId = isHost ? roomData.guestId : roomData.hostId;
      if (!targetId) { alert("Partner hasn't joined yet!"); return; }
      try { await logMood(roomCode, targetId, userName, null, note, { category: 'needs', icon: 'MessageCircle' }); }
      catch (err) { alert("Failed to send note."); }
  };

  const handleDisconnect = () => {
    if(confirm("Just leaving for now?")) {
      localStorage.removeItem('lovesync_code'); setRoomCode(null); setRoomData(null); setShowSettings(false);
    }
  };

  const handleClearMemory = async () => {
    if (!roomCode) return;
    if (confirm("Wipe ALL history?")) { try { await clearRoomLogs(roomCode); setShowSettings(false); } catch (err) { alert("Failed."); } }
  };

  const handleDestroyGarden = async () => {
    if (!roomCode) return;
    if (prompt("Type 'DELETE' to destroy room.") === 'DELETE') { try { await deleteRoom(roomCode); } catch (err) { alert("Failed."); } }
  };

  const copyCode = () => {
    if (roomCode) { navigator.clipboard.writeText(roomCode); alert('Copied!'); }
  };

  const enableNotifications = () => {
      Notification.requestPermission();
  };

  const saveName = () => {
    if (userName.trim()) {
      localStorage.setItem('lovesync_name', userName.trim());
      setShowNameModal(false);
    }
  };

  // --- Render Logic ---

  // Decorative Background Elements
  const BackgroundDoodles = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <Cloud className="absolute top-10 left-[-20px] text-green-200/40 w-32 h-32 animate-wiggle" style={{ animationDuration: '8s' }} strokeWidth={1.5} />
      <Cloud className="absolute top-40 right-[-40px] text-green-200/40 w-40 h-40 animate-wiggle" style={{ animationDuration: '10s', animationDelay: '1s' }} strokeWidth={1.5} />
      <Sun className="absolute top-8 right-8 text-yellow-300/40 w-24 h-24 animate-spin-slow" style={{ animationDuration: '20s' }} strokeWidth={1.5} />
      
      {/* Scattered Organic Elements */}
      <Flower className="absolute bottom-1/4 left-10 text-pink-200/50 w-12 h-12 animate-bounce-in" strokeWidth={1.5} />
      <Leaf className="absolute bottom-20 right-20 text-green-300/50 w-16 h-16 rotate-45" strokeWidth={1.5} />
      <Heart className="absolute top-1/3 left-1/4 text-red-200/30 w-8 h-8 -rotate-12" strokeWidth={1.5} />
      <Star className="absolute bottom-1/3 right-10 text-yellow-200/50 w-10 h-10 rotate-12" strokeWidth={1.5} />
      
      {/* Little dots */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-green-300/30 rounded-full"></div>
      <div className="absolute top-60 right-1/3 w-3 h-3 bg-yellow-300/30 rounded-full"></div>
      <div className="absolute bottom-10 left-1/2 w-2 h-2 bg-pink-300/30 rounded-full"></div>
    </div>
  );

  // 1. Name Entry Modal
  if (showNameModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <BackgroundDoodles />
        <div className="bg-white w-full max-w-sm p-8 rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center relative z-10">
          <Sprout className="w-20 h-20 text-[#86efac] mx-auto mb-4 fill-current animate-bounce stroke-black stroke-2" />
          <h1 className="text-4xl font-bold mb-2">Hello!</h1>
          <p className="mb-6 text-gray-600 text-xl">What's your name?</p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Honey Bun 🍯"
            className="w-full p-4 border-4 border-black rounded-2xl mb-6 text-center text-xl outline-none focus:ring-4 ring-[#86efac]/50 shadow-inner bg-gray-50"
          />
          <DoodleButton onClick={saveName} className="w-full">
            Let's Go!
          </DoodleButton>
        </div>
      </div>
    );
  }

  // 2. Landing Page (No Room)
  if (!roomCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto relative overflow-hidden">
        <BackgroundDoodles />
        <div className="mb-10 transform -rotate-2 relative z-10">
            <h1 className="text-7xl font-bold text-[#86efac] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black tracking-wider" style={{ WebkitTextStroke: '2px black' }}>LoveSync</h1>
            <p className="text-2xl mt-3 font-bold text-gray-800 bg-white/80 inline-block px-4 py-1 rounded-full border-2 border-black rotate-2">
                Grow Together 🌱
            </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full space-y-8 relative z-10">
           {error && (
             <div className="bg-[#fca5a5] border-4 border-black text-black p-3 rounded-xl font-bold animate-shake">
               {error}
             </div>
           )}

           <div>
             <DoodleButton onClick={handleCreateRoom} disabled={isLoading} className="w-full text-2xl py-5 rounded-2xl">
               {isLoading ? 'Planting Seeds...' : 'Create New Garden'}
             </DoodleButton>
             <p className="text-base text-gray-500 mt-3 font-bold">Start a new space for you two</p>
           </div>

           <div className="relative flex items-center justify-center py-2">
             <div className="border-t-4 border-black/10 w-full absolute border-dashed"></div>
             <div className="bg-white px-4 relative z-10 font-bold text-xl text-gray-400 rotate-12">OR</div>
           </div>

           <div>
             <input
               type="text"
               value={inputCode}
               onChange={(e) => setInputCode(e.target.value)}
               placeholder="ENTER CODE"
               className="w-full p-5 text-center text-3xl tracking-[0.5em] uppercase border-4 border-black rounded-2xl mb-4 focus:outline-none focus:ring-4 ring-[#fde047]/50 font-mono bg-[#fdf6e3]"
               maxLength={6}
             />
             <DoodleButton onClick={handleJoinRoom} variant="secondary" disabled={isLoading} className="w-full">
                {isLoading ? 'Finding...' : 'Join Partner'}
             </DoodleButton>
           </div>
        </div>
      </div>
    );
  }

  // 3. Dashboard (In Room)
  if (!roomData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <BackgroundDoodles />
        <div className="relative z-10 flex flex-col items-center">
             <Leaf size={80} className="text-[#86efac] fill-current stroke-black stroke-[3] animate-bounce mb-4" />
             <p className="text-2xl font-bold text-gray-800 tracking-widest uppercase animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  const isHost = roomData.hostId === userId;
  const myState = isHost ? roomData.hostState : roomData.guestState;
  const partnerState = isHost ? roomData.guestState : roomData.hostState;
  const partnerName = (isHost && !roomData.guestId) ? 'Partner' : partnerState.name;
  
  const logs = roomData.logs || []; 
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const myLogs = sortedLogs.filter(l => l.userId === userId || l.userId === 'SHARED');
  const partnerLogs = sortedLogs.filter(l => (l.userId !== userId && l.userId !== 'SHARED') || l.userId === 'SHARED');

  return (
    <div className="h-[100dvh] p-0 md:p-4 flex flex-col max-w-md md:max-w-2xl mx-auto relative overflow-hidden">
      <BackgroundDoodles />
      
      {isSpaceActive ? (
          <div className="relative z-50 h-full">
            <SpaceCountdown 
              endTime={roomData.spaceMode!.endTime} 
              initiatorName={roomData.spaceMode!.initiatorName}
              isMe={amITakingSpace}
              reason={roomData.spaceMode!.reason}
              onEndEarly={amITakingSpace ? handleEndSpaceEarly : undefined}
            />
          </div>
      ) : (
      <>
        {/* Header */}
        <header className="relative z-20 bg-white/90 backdrop-blur-sm pt-10 pb-2 px-4 shadow-sm border-b-2 border-green-100 shrink-0 rounded-b-2xl">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1.5 rounded-lg border-2 border-green-200">
                        <Sprout className="text-green-600 w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none text-gray-800">LoveSync</h1>
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{!roomData.guestId ? 'Waiting for partner' : 'Connected'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {!roomData.guestId && <button onClick={copyCode} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg flex items-center gap-1 border border-yellow-200"><Copy size={12} /> {roomCode}</button>}
                    <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-gray-600"><Settings size={20} /></button>
                </div>
            </div>

            {/* Batteries Row */}
            {roomData.guestId && (
                <div className="flex gap-2">
                     <div className={`flex-1 p-2 rounded-xl border-2 transition-all ${activeTab === 'me' ? 'bg-white border-green-400 shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Me</p>
                         <SocialBattery level={myState.socialBattery || 80} onUpdate={handleBatteryUpdate} />
                     </div>
                     <div className={`flex-1 p-2 rounded-xl border-2 transition-all ${activeTab === 'partner' ? 'bg-white border-green-400 shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{partnerName}</p>
                         <SocialBattery level={partnerState.socialBattery || 80} readOnly={true} />
                     </div>
                </div>
            )}
        </header>

        {/* Tab Switcher */}
        <nav className="relative z-20 flex px-4 pt-4 shrink-0">
            <button 
                onClick={() => setActiveTab('me')}
                className={`flex-1 pb-3 text-center font-bold text-lg transition-colors border-b-4 ${activeTab === 'me' ? 'border-black text-black' : 'border-transparent text-gray-400/70'}`}
            >
                My Journal
            </button>
            <button 
                onClick={() => setActiveTab('partner')}
                className={`flex-1 pb-3 text-center font-bold text-lg transition-colors border-b-4 ${activeTab === 'partner' ? 'border-black text-black' : 'border-transparent text-gray-400/70'}`}
            >
                {partnerName}
            </button>
        </nav>

        {/* Main Content Feed */}
        <main className="flex-1 flex flex-col relative z-10 min-h-0">
            {activeTab === 'me' ? (
                <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-6">
                    {myLogs.length === 0 ? (
                         <div className="text-center mt-10 p-8 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300">
                             <h3 className="text-xl font-bold text-gray-500 mb-2 font-[Patrick_Hand]">Your journal is empty</h3>
                             <p className="text-gray-400 text-sm font-bold">Tap the + button to log how you feel.</p>
                         </div>
                    ) : (
                        myLogs.map(log => (
                            <MoodCard key={log.id} data={log} isMe={log.userId === userId} isShared={log.userId === 'SHARED'} />
                        ))
                    )}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-6">
                    {!roomData.guestId ? (
                        <div className="mt-10 p-6 bg-yellow-50/90 rounded-2xl border-2 border-yellow-200 text-center shadow-sm">
                            <p className="font-bold text-yellow-800">Share code <span className="font-mono bg-white px-1 rounded">{roomCode}</span> to connect.</p>
                        </div>
                    ) : partnerLogs.length === 0 ? (
                        <div className="text-center mt-10 p-8 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300">
                             <h3 className="text-xl font-bold text-gray-500 mb-2 font-[Patrick_Hand]">No updates yet</h3>
                             <p className="text-gray-400 text-sm font-bold">{partnerName} hasn't posted anything.</p>
                        </div>
                    ) : (
                        partnerLogs.map(log => (
                            <MoodCard key={log.id} data={log} isMe={false} isShared={log.userId === 'SHARED'} />
                        ))
                    )}
                </div>
            )}
        </main>
      </>
      )}

      {/* Interaction Modals & Overlays */}
      {activeTab === 'me' && myState.pendingInteraction && !amITakingSpace && !isSpaceActive && (
          <InteractionModal interaction={myState.pendingInteraction} onDismiss={handleDismissInteraction} />
      )}
      {sentInteractionData && <SentFeedbackModal type={sentInteractionData.type} partnerName={sentInteractionData.partnerName} onClose={() => setSentInteractionData(null)} />}
      {pendingRoughLog && <RoughFollowUpModal onSelect={handleRoughCompletion} onCancel={() => setPendingRoughLog(null)} />}
      {showSpaceDuration && <SpaceDurationModal onSelectDuration={handleStartSpaceMode} onCancel={() => setShowSpaceDuration(false)} />}
      
      {roomData.conversationActive && !isChatMinimized && !amITakingSpace && !isSpaceActive && (
        <ConversationZone roomCode={roomCode} userId={userId} userName={userName} topic={roomData.conversationTopic || 'Chat'} messages={roomData.messages || []} onMinimize={() => setIsChatMinimized(true)} />
      )}
      
      {roomData.conversationActive && isChatMinimized && !amITakingSpace && !isSpaceActive && (
         <div className="fixed bottom-6 left-6 z-40">
            <button onClick={() => setIsChatMinimized(false)} className="w-14 h-14 bg-blue-500 border-4 border-white rounded-full shadow-lg flex items-center justify-center animate-bounce text-white">
              <MessageCircle size={28} />
            </button>
         </div>
      )}

      {/* Unified FAB */}
      {(roomData.guestId && (!roomData.conversationActive || isChatMinimized) && !isSpaceActive) && (
          <div className="fixed bottom-6 right-6 z-40">
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-16 h-16 bg-[#1a1a1a] text-white rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-2 border-white/20"
            >
                <Plus size={32} strokeWidth={3} />
            </button>
          </div>
      )}

      {/* Menu Modal */}
      {isMenuOpen && (
        <MenuModal 
          type={activeTab}
          partnerName={partnerName}
          onClose={() => setIsMenuOpen(false)}
          onOpenMoodEditor={() => { setIsMenuOpen(false); setIsEditing(true); }}
          onLogAction={handleActionLog}
          onStartSpaceMode={() => setShowSpaceDuration(true)}
          onInteract={handleInteraction}
          onSendPartnerNote={handleSendPartnerNote}
        />
      )}

      {isEditing && <MoodEditor currentMood={Mood.HAPPY} currentNote="" onSave={handleAddLog} onCancel={() => setIsEditing(false)} />}

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl border-4 border-black">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-[Patrick_Hand]">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <button onClick={() => Notification.requestPermission()} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 font-bold text-gray-700 transition-colors">Notifications <Bell size={18} /></button>
                <button onClick={handleDisconnect} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 font-bold text-gray-700 transition-colors">Logout <LogOut size={18} /></button>
                <button onClick={handleClearMemory} className="w-full flex items-center justify-between p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 font-bold text-yellow-800 transition-colors">Clear History <Eraser size={18} /></button>
                <button onClick={handleDestroyGarden} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 font-bold text-red-800 transition-colors">Delete Room <Trash2 size={18} /></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;