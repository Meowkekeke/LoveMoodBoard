import React, { useState, useEffect } from 'react';
import { Heart, Copy, LogOut } from 'lucide-react';
import { createRoom, joinRoom, subscribeToRoom, updateMyState } from './services/db';
import { RoomData, Mood } from './types';
import { MoodCard } from './components/MoodCard';
import { MoodEditor } from './components/MoodEditor';
import { DoodleButton } from './components/DoodleButton';

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

  // Subscription Effect
  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToRoom(roomCode, (data) => {
      setRoomData(data);
    });

    return () => unsubscribe();
  }, [roomCode]);

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

  // 1. Name Entry Modal
  if (showNameModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdf6e3]">
        <div className="bg-white w-full max-w-sm p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <Heart className="w-16 h-16 text-[#FF9A9E] mx-auto mb-4 fill-current animate-pulse" />
          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
          <p className="mb-6 text-gray-600">What should we call you?</p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name..."
            className="w-full p-3 border-2 border-black rounded-xl mb-6 text-center text-xl outline-none focus:ring-4 ring-[#A1C4FD]/50"
          />
          <DoodleButton onClick={saveName} className="w-full">
            Get Started
          </DoodleButton>
        </div>
      </div>
    );
  }

  // 2. Landing Page (No Room)
  if (!roomCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="mb-8 transform rotate-2">
            <h1 className="text-6xl font-bold text-[#FF9A9E] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] stroke-black" style={{ WebkitTextStroke: '2px black' }}>LoveSync</h1>
            <p className="text-xl mt-2 font-bold text-gray-700">Connect & Share Your Vibe</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full space-y-8 relative">
           {/* Decorative elements */}
           <div className="absolute -top-6 -left-6 text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>💖</div>
           <div className="absolute -bottom-6 -right-6 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>💌</div>

           {error && (
             <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded-xl font-bold">
               {error}
             </div>
           )}

           <div>
             <DoodleButton onClick={handleCreateRoom} disabled={isLoading} className="w-full text-xl py-4">
               {isLoading ? 'Creating...' : 'Create New Room'}
             </DoodleButton>
             <p className="text-sm text-gray-500 mt-2">Get a code to share with your partner</p>
           </div>

           <div className="relative flex items-center justify-center">
             <div className="border-t-2 border-black w-full absolute"></div>
             <span className="bg-white px-4 relative z-10 font-bold text-lg">OR</span>
           </div>

           <div>
             <input
               type="text"
               value={inputCode}
               onChange={(e) => setInputCode(e.target.value)}
               placeholder="Enter 6-digit code"
               className="w-full p-4 text-center text-2xl tracking-widest uppercase border-2 border-black rounded-xl mb-4 focus:outline-none focus:ring-4 ring-[#A1C4FD]/50 font-mono"
               maxLength={6}
             />
             <DoodleButton onClick={handleJoinRoom} variant="secondary" disabled={isLoading} className="w-full">
                {isLoading ? 'Joining...' : 'Join Existing Room'}
             </DoodleButton>
           </div>
        </div>
      </div>
    );
  }

  // 3. Dashboard (In Room)
  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🌀</div>
      </div>
    );
  }

  const isHost = roomData.hostId === userId;
  const myState = isHost ? roomData.hostState : roomData.guestState;
  const partnerState = isHost ? roomData.guestState : roomData.hostState;

  return (
    <div className="min-h-screen p-4 flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2">
          <Heart className="fill-red-400 text-red-400 animate-pulse" />
          <h1 className="font-bold text-xl">LoveSync</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={copyCode}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg text-sm font-bold transition-transform active:scale-95"
          >
            CODE: {roomCode}
            <Copy size={14} />
          </button>
          <button onClick={handleLeaveRoom} className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 flex flex-col gap-6">
        
        {/* My Card */}
        <section>
          <div className="flex justify-between items-end mb-2 px-2">
            <h2 className="text-2xl font-bold text-gray-800">My Vibe</h2>
          </div>
          <MoodCard 
            userState={myState} 
            isMe={true} 
            onEdit={() => setIsEditing(true)} 
          />
        </section>

        {/* Connector */}
        <div className="flex justify-center -my-4 z-10 relative">
             <div className="bg-white border-2 border-black rounded-full p-2 shadow-md">
                <Heart className="w-8 h-8 text-[#FF9A9E] fill-current animate-bounce" />
             </div>
        </div>

        {/* Partner Card */}
        <section className={`transition-opacity duration-500 ${!roomData.guestId && isHost ? 'opacity-50' : 'opacity-100'}`}>
          <div className="flex justify-between items-end mb-2 px-2">
            <h2 className="text-2xl font-bold text-gray-800">Partner's Vibe</h2>
          </div>
          <MoodCard 
            userState={partnerState} 
            isMe={false} 
          />
          {!roomData.guestId && isHost && (
             <p className="text-center mt-4 font-bold text-gray-500 animate-pulse">Waiting for your partner to join using code: {roomCode}</p>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm font-bold">
        <p>Made with ❤️ for couples</p>
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