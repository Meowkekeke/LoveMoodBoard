import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Copy, LogOut, Heart, Cloud, Sun, Flower, Leaf } from 'lucide-react';
import { createRoom, joinRoom, subscribeToRoom, updateMyState, sendInteraction, shuffleQuestion } from './services/db';
import { RoomData, Mood, InteractionType } from './types';
import { MoodCard } from './components/MoodCard';
import { MoodEditor } from './components/MoodEditor';
import { DoodleButton } from './components/DoodleButton';
import { InteractionBar } from './components/InteractionBar';
import { QuestionCard } from './components/QuestionCard';

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
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('lovesync_name'));
  
  // Animation State
  const [animationType, setAnimationType] = useState<InteractionType | null>(null);
  const lastInteractionRef = useRef<number>(0);

  // Subscription Effect
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToRoom(roomCode, (data) => {
      setRoomData(data);

      // Handle Interactions
      if (data.lastInteraction) {
        const { timestamp, senderId, type } = data.lastInteraction;
        // Only animate if it's a new interaction and NOT sent by me
        if (timestamp > lastInteractionRef.current && senderId !== userId) {
          triggerAnimation(type);
          lastInteractionRef.current = timestamp;
        } 
        // Sync ref on initial load to avoid playing old animations
        else if (lastInteractionRef.current === 0) {
            lastInteractionRef.current = timestamp;
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode, userId]);

  const triggerAnimation = (type: InteractionType) => {
    setAnimationType(type);
    setTimeout(() => setAnimationType(null), 3000);
  };

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

  const handleUpdateMood = async (mood: Mood, note: string) => {
    if (!roomCode || !roomData) return;
    const isHost = roomData.hostId === userId;
    
    try {
      await updateMyState(roomCode, isHost, { mood, note });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update mood", err);
      alert("Couldn't update mood, check internet!");
    }
  };

  const handleInteraction = async (type: InteractionType) => {
      if (!roomCode) return;
      try {
          await sendInteraction(roomCode, userId, type);
          // Optional: Give feedback to sender too? For now, we only animate receiver.
      } catch (err) {
          console.error(err);
      }
  };

  const handleShuffleQuestion = async () => {
      if (!roomCode) return;
      await shuffleQuestion(roomCode);
  };

  const handleLeaveRoom = () => {
    if(confirm("Are you sure you want to disconnect? You'll need the code to join again.")) {
      localStorage.removeItem('lovesync_code');
      setRoomCode(null);
      setRoomData(null);
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

  const InteractionOverlay = () => {
    if (!animationType) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            {animationType === 'love' && (
                <>
                  {[...Array(20)].map((_, i) => (
                      <div key={i} className="absolute text-5xl animate-float-up" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 0.5}s` }}>
                          ❤️
                      </div>
                  ))}
                </>
            )}
            {animationType === 'water' && (
                 <>
                 {[...Array(30)].map((_, i) => (
                     <div key={i} className="absolute text-4xl animate-rain" style={{ left: `${Math.random() * 100}%`, top: '-10%', animationDelay: `${Math.random()}s` }}>
                         💧
                     </div>
                 ))}
               </>
            )}
             {animationType === 'sun' && (
                 <div className="absolute inset-0 bg-yellow-100/50 flex items-center justify-center animate-sun-pulse">
                     <Sun size={200} className="text-yellow-500 fill-yellow-300" />
                 </div>
            )}
             {animationType === 'poke' && (
                <div className="text-9xl animate-bounce">
                    👉
                </div>
             )}
        </div>
    );
  };

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
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4]">
        <div className="animate-spin text-6xl">🌻</div>
      </div>
    );
  }

  const isHost = roomData.hostId === userId;
  const myState = isHost ? roomData.hostState : roomData.guestState;
  const partnerState = isHost ? roomData.guestState : roomData.hostState;

  return (
    <div className="min-h-screen p-4 flex flex-col max-w-md md:max-w-2xl mx-auto relative">
      <BackgroundDoodles />
      <InteractionOverlay />
      
      {/* Header */}
      <header className="relative z-20 flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2">
          <div className="bg-[#86efac] p-2 rounded-lg border-2 border-black">
            <Sprout className="text-black w-6 h-6" />
          </div>
          <h1 className="font-bold text-2xl tracking-tight hidden sm:block">LoveSync</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2 bg-[#fde047] hover:bg-[#facc15] border-2 border-black rounded-xl text-sm font-bold transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="font-mono text-base">{roomCode}</span>
            <Copy size={16} />
          </button>
          <button onClick={handleLeaveRoom} className="p-2 bg-white hover:bg-red-100 border-2 border-black rounded-xl text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 flex flex-col gap-6 relative z-10 pb-20">
        
        {/* Interaction Bar */}
        <section>
            <InteractionBar onInteract={handleInteraction} disabled={!roomData.guestId} />
        </section>

        {/* My Card */}
        <section>
          <div className="flex justify-between items-end mb-1 px-4">
            <h2 className="text-2xl font-bold text-gray-800 bg-white/50 px-3 py-1 rounded-t-xl border-t-2 border-x-2 border-black/10 inline-block">Me</h2>
          </div>
          <MoodCard 
            userState={myState} 
            isMe={true} 
            onEdit={() => setIsEditing(true)} 
          />
        </section>

        {/* Connector */}
        <div className="flex justify-center -my-8 z-20 relative pointer-events-none">
             <div className="bg-white border-4 border-black rounded-full p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">
                <Heart className="w-8 h-8 text-[#fca5a5] fill-current animate-pulse" />
             </div>
        </div>

        {/* Partner Card */}
        <section className={`transition-all duration-500 ${!roomData.guestId && isHost ? 'opacity-70 blur-[1px]' : 'opacity-100'}`}>
          <div className="flex justify-between items-end mb-1 px-4">
             <h2 className="text-2xl font-bold text-gray-800 bg-white/50 px-3 py-1 rounded-t-xl border-t-2 border-x-2 border-black/10 inline-block">Partner</h2>
          </div>
          <MoodCard 
            userState={partnerState} 
            isMe={false} 
          />
          {!roomData.guestId && isHost && (
             <div className="mt-4 bg-white p-4 rounded-xl border-2 border-black border-dashed text-center">
                <p className="font-bold text-gray-500 animate-pulse">Waiting for partner...</p>
                <p className="text-sm">Share code: <span className="font-mono bg-yellow-200 px-1">{roomCode}</span></p>
             </div>
          )}
        </section>
        
        {/* Daily Question */}
        <QuestionCard 
            question={roomData.dailyQuestion || "What's on your mind?"} 
            onShuffle={handleShuffleQuestion} 
        />

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 font-bold relative z-10">
        <p className="flex items-center justify-center gap-2">
            Made with <Heart size={16} className="fill-[#fca5a5] text-[#fca5a5]" /> for us
        </p>
      </footer>

      {/* Editor Modal */}
      {isEditing && (
        <MoodEditor 
          currentMood={myState.mood}
          currentNote={myState.note}
          onSave={handleUpdateMood}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default App;