import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Copy, LogOut, Heart, Cloud, Sun, Flower, Leaf, User, Users, Plus, Settings, Trash2, Eraser, X, Smile, Sparkles } from 'lucide-react';
import { createRoom, joinRoom, subscribeToRoom, logMood, sendInteraction, dismissInteraction, updateSocialBattery, clearRoomLogs, deleteRoom, startConversation } from './services/db';
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

// Utility for persistent User ID
const getUserId = () => {
  let id = localStorage.getItem('lovesync_uid');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('lovesync_uid', id);
  }
  return id;
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
  
  // Modal State for Interactions
  const [sentInteractionData, setSentInteractionData] = useState<{ type: InteractionType; partnerName: string } | null>(null);
  
  // State for Rough Follow-up
  const [pendingRoughLog, setPendingRoughLog] = useState<{ icon: string; label: string } | null>(null);

  // Subscription Effect
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToRoom(roomCode, (data) => {
      if (!data) {
        // Room was deleted
        localStorage.removeItem('lovesync_code');
        setRoomCode(null);
        setRoomData(null);
        setShowSettings(false);
        setError('The garden was destroyed.');
        return;
      }

      setRoomData(data);
    });

    return () => unsubscribe();
  }, [roomCode, userId]);

  // Actions
  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      setShowNameModal(true);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const code = await createRoom(userId, userName);
      localStorage.setItem('lovesync_code', code);
      setRoomCode(code);
    } catch (err) {
      setError('Failed to create room. Try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    if (!userName.trim()) {
      setShowNameModal(true);
      return;
    }

    setIsLoading(true);
    setError('');
    const code = inputCode.toUpperCase().trim();
    
    try {
      const success = await joinRoom(code, userId, userName);
      if (success) {
        localStorage.setItem('lovesync_code', code);
        setRoomCode(code);
      } else {
        setError('Room not found or full!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLog = async (mood: Mood, note: string) => {
    if (!roomCode || !roomData) return;
    
    try {
      await logMood(roomCode, userId, userName, mood, note);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to add log", err);
      alert("Couldn't add note, check internet!");
    }
  };

  const handleActionLog = async (category: 'self_care'|'rough'|'needs', icon: string, label: string) => {
    if (!roomCode) return;

    // Intercept "Rough" category to show follow-up modal
    if (category === 'rough') {
      setIsMenuOpen(false);
      setPendingRoughLog({ icon, label });
      return;
    }

    try {
      await logMood(roomCode, userId, userName, null, label, { category, icon });
      
      // If category is NEEDS, start conversation immediately
      if (category === 'needs') {
        // TRIGGER TYPE: needs
        await startConversation(roomCode, `${userName} posted: ${label}`, 'needs');
      }
    } catch (err) {
      console.error("Failed to log action", err);
    }
  };

  const handleRoughCompletion = async (need: string) => {
    if (!roomCode || !pendingRoughLog) return;
    
    try {
      // Combine the original label (e.g., "Bad Meeting") with the specific need
      const combinedNote = `${pendingRoughLog.label} • ${need}`;
      await logMood(roomCode, userId, userName, null, combinedNote, { category: 'rough', icon: pendingRoughLog.icon });
      setPendingRoughLog(null);

      // Trigger Conversation
      // TRIGGER TYPE: rough
      await startConversation(roomCode, `${userName} is having a rough time: ${combinedNote}`, 'rough');

    } catch (err) {
      console.error("Failed to log rough action", err);
    }
  };

  const handleBatteryUpdate = async (level: number) => {
    if (!roomCode) return;
    try {
      await updateSocialBattery(roomCode, userId, level);
    } catch (err) {
      console.error("Failed battery update", err);
    }
  };

  const handleInteraction = async (type: InteractionType) => {
      if (!roomCode || !roomData) return;
      
      const isHost = roomData.hostId === userId;
      const targetId = isHost ? roomData.guestId : roomData.hostId;
      const targetName = isHost ? roomData.guestState.name : roomData.hostState.name;

      if (!targetId) {
          alert("Partner hasn't joined yet!");
          return;
      }

      const messages: Record<InteractionType, string> = {
          hug: 'sent a hug 🤗',
          kiss: 'sent a kiss 💋',
          poke: 'poked you 👉',
          love: 'sent love ❤️'
      };

      try {
          // Log to history
          await logMood(roomCode, userId, userName, null, messages[type], { category: 'needs', icon: 'Heart' });
          // Send persistent popup to partner
          await sendInteraction(roomCode, userId, userName, type);
          
          // Show confirmation modal to sender
          setSentInteractionData({
            type,
            partnerName: targetName || 'Partner'
          });

      } catch (err) {
          console.error(err);
      }
  };

  const handleDismissInteraction = async () => {
      if (!roomCode) return;
      await dismissInteraction(roomCode, userId);
  };

  const handleSendPartnerNote = async (note: string) => {
      if (!roomCode || !roomData) return;
      const isHost = roomData.hostId === userId;
      const targetId = isHost ? roomData.guestId : roomData.hostId;

      if (!targetId) {
          alert("Partner hasn't joined yet!");
          return;
      }

      try {
          // Log note to partner's ID
          await logMood(roomCode, targetId, userName, null, note, { category: 'needs', icon: 'MessageCircle' });
      } catch (err) {
          console.error(err);
          alert("Failed to send note.");
      }
  };

  const handleDisconnect = () => {
    if(confirm("Just leaving for now? You can re-join with the code.")) {
      localStorage.removeItem('lovesync_code');
      setRoomCode(null);
      setRoomData(null);
      setShowSettings(false);
    }
  };

  const handleClearMemory = async () => {
    if (!roomCode) return;
    if (confirm("Are you sure? This will wipe the ENTIRE garden history for BOTH of you. (A fresh start!)")) {
      try {
        await clearRoomLogs(roomCode);
        setShowSettings(false);
      } catch (err) {
        alert("Failed to clear memory.");
      }
    }
  };

  const handleDestroyGarden = async () => {
    if (!roomCode) return;
    const confirmation = prompt("This will DELETE the entire room for both of you. Type 'DELETE' to confirm.");
    if (confirmation === 'DELETE') {
      try {
        await deleteRoom(roomCode);
        // Subscription will handle the cleanup via null data
      } catch (err) {
        alert("Failed to destroy garden.");
      }
    }
  };

  const saveName = () => {
    if (userName.trim()) {
      localStorage.setItem('lovesync_name', userName);
      setShowNameModal(false);
    }
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      alert('Code copied to clipboard! Share it with your partner.');
    }
  };

  // --- Render Logic ---

  // Decorative Background Elements
  const BackgroundDoodles = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <Cloud className="absolute top-10 left-[-20px] text-white/60 w-32 h-32 animate-pulse" style={{ animationDuration: '4s' }} />
      <Cloud className="absolute top-40 right-[-40px] text-white/60 w-40 h-40 animate-pulse" style={{ animationDuration: '6s' }} />
      <Sun className="absolute top-8 right-8 text-[#fde047]/40 w-24 h-24 animate-spin-slow" style={{ animationDuration: '10s' }} />
      <Flower className="absolute bottom-10 left-10 text-[#fca5a5]/40 w-16 h-16 animate-bounce" style={{ animationDuration: '3s' }} />
      <Leaf className="absolute bottom-20 right-20 text-[#86efac]/40 w-20 h-20 rotate-45" />
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0fdf4]">
        <Leaf size={80} className="text-[#86efac] fill-current stroke-black stroke-[3] animate-bounce mb-4" />
        <p className="text-2xl font-bold text-gray-800 tracking-widest uppercase animate-pulse">Loading...</p>
      </div>
    );
  }

  // Derived Data
  const isHost = roomData.hostId === userId;
  const myState = isHost ? roomData.hostState : roomData.guestState;
  const partnerState = isHost ? roomData.guestState : roomData.hostState;
  
  // Use Partner Name if joined, otherwise default to "Partner"
  const partnerTabLabel = (isHost && !roomData.guestId) ? 'Partner' : partnerState.name;
  const isPartnerJoined = !!roomData.guestId;

  const logs = roomData.logs || []; 
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  
  // Filter Logs
  // Include my logs OR shared conversations
  const myLogs = sortedLogs.filter(l => l.userId === userId || l.userId === 'SHARED');
  // Include partner logs OR shared conversations
  const partnerLogs = sortedLogs.filter(l => (l.userId !== userId && l.userId !== 'SHARED') || l.userId === 'SHARED');

  return (
    <div className="h-[100dvh] p-4 flex flex-col max-w-md md:max-w-2xl mx-auto relative overflow-hidden">
      <BackgroundDoodles />
      
      {/* Header */}
      <header className="relative z-20 flex justify-between items-center mb-4 bg-white p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-[#86efac] p-2 rounded-lg border-2 border-black">
            <Sprout className="text-black w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight hidden sm:block">LoveSync</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Only show code if partner hasn't joined */}
          {!isPartnerJoined && (
            <button 
                onClick={copyCode}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#fde047] hover:bg-[#facc15] border-2 border-black rounded-lg text-xs font-bold transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
                <span className="font-mono">{roomCode}</span>
                <Copy size={12} />
            </button>
          )}

          <button onClick={() => setShowSettings(true)} className="p-2 bg-white hover:bg-gray-100 border-2 border-black rounded-lg text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="relative z-20 flex gap-2 mb-4 shrink-0">
        <button 
          onClick={() => setActiveTab('me')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-4 font-bold text-lg transition-all min-w-0 ${
            activeTab === 'me' 
              ? 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px]' 
              : 'bg-black/5 border-transparent text-gray-500 hover:bg-black/10'
          }`}
        >
          <User size={20} className="shrink-0" />
          Me
        </button>
        <button 
          onClick={() => setActiveTab('partner')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-4 font-bold text-lg transition-all min-w-0 ${
            activeTab === 'partner' 
              ? 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px]' 
              : 'bg-black/5 border-transparent text-gray-500 hover:bg-black/10'
          }`}
        >
          <Users size={20} className="shrink-0" />
          <span className="truncate">{partnerTabLabel}</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 min-h-0">
        
        {/* Me Tab */}
        {activeTab === 'me' && (
          <section className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300">
             
             {/* 1. Status Section */}
             <div className="mb-4 shrink-0">
               <SocialBattery 
                 level={myState.socialBattery || 80} 
                 onUpdate={handleBatteryUpdate} 
               />
             </div>

             {/* 2. Logs Feed (Scrollable) */}
             <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-24">
                {myLogs.length === 0 ? (
                  <div className="text-center py-10 opacity-60">
                      <p className="font-bold text-xl">No notes yet!</p>
                  </div>
                ) : (
                    myLogs.map(log => (
                        <MoodCard 
                            key={log.id} 
                            data={{
                                name: log.userName,
                                type: log.type,
                                mood: log.mood,
                                category: log.category,
                                icon: log.icon,
                                note: log.note,
                                timestamp: log.timestamp,
                                messages: log.messages
                            }}
                            isMe={log.userId === userId || log.userId === 'SHARED'} // Highlight shared as 'me' style or similar?
                        />
                    ))
                )}
             </div>
          </section>
        )}

        {/* Partner Tab */}
        {activeTab === 'partner' && (
          <section className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
             {roomData.guestId ? (
                <>
                  <div className="mb-4 shrink-0">
                     <SocialBattery 
                        level={partnerState.socialBattery || 80} 
                        readOnly={true}
                     />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-24">
                    {partnerLogs.length === 0 ? (
                        <div className="text-center py-10 opacity-60">
                            <p className="font-bold text-xl">{partnerTabLabel} hasn't posted yet.</p>
                        </div>
                    ) : (
                        partnerLogs.map(log => (
                            <MoodCard 
                                key={log.id} 
                                data={{
                                    name: log.userName,
                                    type: log.type,
                                    mood: log.mood,
                                    category: log.category,
                                    icon: log.icon,
                                    note: log.note,
                                    timestamp: log.timestamp,
                                    messages: log.messages
                                }}
                                isMe={false}
                            />
                        ))
                    )}
                  </div>
                </>
             ) : (
                <div className="bg-white p-8 rounded-3xl border-4 border-black border-dashed text-center">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="font-bold text-gray-500 text-xl">Waiting for partner...</p>
                    <p className="mt-2">Share code: <span className="font-mono bg-[#fde047] px-2 py-1 rounded border-2 border-black">{roomCode}</span></p>
                </div>
             )}
          </section>
        )}

      </main>

      {/* Persistent Interaction Pop-up (Only shows when on ME tab) - RECEIVER */}
      {activeTab === 'me' && myState.pendingInteraction && (
          <InteractionModal 
            interaction={myState.pendingInteraction} 
            onDismiss={handleDismissInteraction}
          />
      )}

      {/* Sent Confirmation Pop-up - SENDER */}
      {sentInteractionData && (
        <SentFeedbackModal 
          type={sentInteractionData.type}
          partnerName={sentInteractionData.partnerName}
          onClose={() => setSentInteractionData(null)}
        />
      )}

      {/* Rough Follow-up Modal */}
      {pendingRoughLog && (
        <RoughFollowUpModal 
          onSelect={handleRoughCompletion}
          onCancel={() => setPendingRoughLog(null)}
        />
      )}
      
      {/* CONVERSATION ZONE OVERLAY */}
      {roomData.conversationActive && (
        <ConversationZone 
          roomCode={roomCode}
          userId={userId}
          userName={userName}
          topic={roomData.conversationTopic || 'General Chat'}
          messages={roomData.messages || []}
        />
      )}

      {/* Floating Action Button */}
      {(roomData.guestId && !roomData.conversationActive) && (
          <div className="fixed bottom-6 right-6 z-40">
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-16 h-16 bg-[#fde047] border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:bg-[#facc15] active:translate-y-1 active:shadow-none transition-all animate-bounce-in"
            >
                <Plus size={32} strokeWidth={3} />
            </button>
          </div>
      )}

      {/* Main Menu Modal */}
      {isMenuOpen && (
        <MenuModal 
          type={activeTab}
          partnerName={partnerTabLabel}
          onClose={() => setIsMenuOpen(false)}
          onOpenMoodEditor={() => { setIsMenuOpen(false); setIsEditing(true); }}
          onLogAction={handleActionLog}
          onInteract={handleInteraction}
          onSendPartnerNote={handleSendPartnerNote}
        />
      )}

      {/* Editor Modal */}
      {isEditing && (
        <MoodEditor 
          currentMood={Mood.HAPPY} 
          currentNote=""
          onSave={handleAddLog}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Garden Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 bg-gray-100 border-2 border-black rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 border-4 border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors group"
                >
                  <span className="font-bold text-gray-600">Disconnect Device</span>
                  <LogOut className="text-gray-400 group-hover:text-black" />
                </button>

                <button 
                  onClick={handleClearMemory}
                  className="w-full flex items-center justify-between p-4 bg-yellow-50 border-4 border-yellow-200 rounded-2xl hover:bg-yellow-100 transition-colors group"
                >
                   <div className="text-left">
                     <span className="font-bold text-yellow-800 block">Clear Memories</span>
                     <span className="text-xs font-bold text-yellow-600">Reset logs for BOTH</span>
                   </div>
                   <Eraser className="text-yellow-600 group-hover:text-yellow-800" />
                </button>

                <button 
                  onClick={handleDestroyGarden}
                  className="w-full flex items-center justify-between p-4 bg-red-50 border-4 border-red-200 rounded-2xl hover:bg-red-100 transition-colors group"
                >
                   <div className="text-left">
                     <span className="font-bold text-red-800 block">Destroy Garden</span>
                     <span className="text-xs font-bold text-red-600">Delete everything & Exit</span>
                   </div>
                   <Trash2 className="text-red-600 group-hover:text-red-800" />
                </button>
              </div>

              <div className="mt-6 text-center">
                 <p className="text-xs text-gray-400 font-bold">LoveSync v1.0</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;