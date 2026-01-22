import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Copy, LogOut, Settings, Trash2, Eraser, X, Bell, Plus, Users, User, Ghost, MessageCircle } from 'lucide-react';
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

  // --- Render ---

  if (showNameModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-white w-full max-w-sm p-8 rounded-[2rem] border-4 border-black shadow-xl text-center">
          <Sprout className="w-16 h-16 text-[#86efac] mx-auto mb-4 stroke-2" />
          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="What's your name?"
            className="w-full p-4 border-2 border-gray-300 rounded-xl mb-6 text-center text-xl outline-none focus:border-black"
          />
          <DoodleButton onClick={() => userName.trim() && (localStorage.setItem('lovesync_name', userName), setShowNameModal(false))} className="w-full">
            Enter Garden
          </DoodleButton>
        </div>
      </div>
    );
  }

  if (!roomCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto bg-[#f0fdf4]">
        <div className="mb-8">
            <h1 className="text-5xl font-bold text-[#1a1a1a] mb-2 font-[Patrick_Hand]">LoveSync</h1>
            <p className="text-gray-500 font-bold">Your shared emotional garden</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-xl w-full border-2 border-gray-100 space-y-6">
           {error && <div className="text-red-500 font-bold bg-red-50 p-3 rounded-lg">{error}</div>}
           <DoodleButton onClick={handleCreateRoom} disabled={isLoading} className="w-full py-4 text-lg">
               {isLoading ? '...' : 'Create New Garden'}
           </DoodleButton>
           <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
             <div className="h-px bg-gray-200 flex-1"></div>OR<div className="h-px bg-gray-200 flex-1"></div>
           </div>
           <div>
             <input type="text" value={inputCode} onChange={(e) => setInputCode(e.target.value)} placeholder="ENTER CODE"
               className="w-full p-4 text-center text-2xl tracking-widest uppercase border-2 border-gray-200 rounded-xl mb-3 font-mono" maxLength={6} />
             <DoodleButton onClick={handleJoinRoom} variant="secondary" disabled={isLoading} className="w-full py-3">Join Partner</DoodleButton>
           </div>
        </div>
      </div>
    );
  }

  if (!roomData) return <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] text-xl font-bold text-green-600 animate-pulse">Loading Garden...</div>;

  const isHost = roomData.hostId === userId;
  const myState = isHost ? roomData.hostState : roomData.guestState;
  const partnerState = isHost ? roomData.guestState : roomData.hostState;
  const partnerName = (isHost && !roomData.guestId) ? 'Partner' : partnerState.name;
  
  const logs = roomData.logs || []; 
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  const myLogs = sortedLogs.filter(l => l.userId === userId || l.userId === 'SHARED');
  const partnerLogs = sortedLogs.filter(l => (l.userId !== userId && l.userId !== 'SHARED') || l.userId === 'SHARED');

  return (
    <div className="h-[100dvh] p-0 md:p-4 flex flex-col max-w-md md:max-w-2xl mx-auto relative overflow-hidden bg-[#f0fdf4]">
      
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
        {/* Modern Header with Embedded Batteries */}
        <header className="relative z-20 bg-white pt-10 pb-2 px-4 shadow-sm border-b border-gray-200 shrink-0">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1.5 rounded-lg">
                        <Sprout className="text-green-600 w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none">LoveSync</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{!roomData.guestId ? 'Waiting for partner' : 'Connected'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {!roomData.guestId && <button onClick={copyCode} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg flex items-center gap-1"><Copy size={12} /> {roomCode}</button>}
                    <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-gray-600"><Settings size={20} /></button>
                </div>
            </div>

            {/* Batteries Row */}
            {roomData.guestId && (
                <div className="flex gap-2">
                     <div className={`flex-1 p-2 rounded-xl border-2 ${activeTab === 'me' ? 'bg-white border-black shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Me</p>
                         <SocialBattery level={myState.socialBattery || 80} onUpdate={handleBatteryUpdate} />
                     </div>
                     <div className={`flex-1 p-2 rounded-xl border-2 ${activeTab === 'partner' ? 'bg-white border-black shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{partnerName}</p>
                         <SocialBattery level={partnerState.socialBattery || 80} readOnly={true} />
                     </div>
                </div>
            )}
        </header>

        {/* Tab Switcher */}
        <nav className="relative z-20 flex px-4 pt-4 shrink-0 bg-[#f0fdf4]">
            <button 
                onClick={() => setActiveTab('me')}
                className={`flex-1 pb-3 text-center font-bold text-lg transition-colors border-b-4 ${activeTab === 'me' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
            >
                My Journal
            </button>
            <button 
                onClick={() => setActiveTab('partner')}
                className={`flex-1 pb-3 text-center font-bold text-lg transition-colors border-b-4 ${activeTab === 'partner' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
            >
                {partnerName}
            </button>
        </nav>

        {/* Main Content Feed */}
        <main className="flex-1 flex flex-col relative z-10 min-h-0 bg-[#f0fdf4]">
            {activeTab === 'me' ? (
                <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-6">
                    {myLogs.length === 0 ? (
                         <div className="text-center mt-10 p-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
                             <h3 className="text-xl font-bold text-gray-400 mb-2">Your journal is empty</h3>
                             <p className="text-gray-400 text-sm">Tap the + button to log how you feel.</p>
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
                        <div className="mt-10 p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-200 text-center">
                            <p className="font-bold text-yellow-800">Share code {roomCode} to connect.</p>
                        </div>
                    ) : partnerLogs.length === 0 ? (
                        <div className="text-center mt-10 p-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
                             <h3 className="text-xl font-bold text-gray-400 mb-2">No updates yet</h3>
                             <p className="text-gray-400 text-sm">{partnerName} hasn't posted anything.</p>
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

      {/* Interaction Modals */}
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
            <button onClick={() => setIsChatMinimized(false)} className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center animate-bounce text-white">
              <MessageCircle size={28} />
            </button>
         </div>
      )}

      {/* Unified FAB */}
      {(roomData.guestId && (!roomData.conversationActive || isChatMinimized) && !isSpaceActive) && (
          <div className="fixed bottom-6 right-6 z-40">
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-16 h-16 bg-[#1a1a1a] text-white rounded-[2rem] shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
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
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-[Patrick_Hand]">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <button onClick={() => Notification.requestPermission()} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 font-bold text-gray-700">Notifications <Bell size={18} /></button>
                <button onClick={handleDisconnect} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 font-bold text-gray-700">Logout <LogOut size={18} /></button>
                <button onClick={handleClearMemory} className="w-full flex items-center justify-between p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 font-bold text-yellow-800">Clear History <Eraser size={18} /></button>
                <button onClick={handleDestroyGarden} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 font-bold text-red-800">Delete Room <Trash2 size={18} /></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;