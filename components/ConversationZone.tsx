import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, HeartHandshake } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage, endConversation } from '../services/db';

interface ConversationZoneProps {
  roomCode: string;
  userId: string;
  userName: string;
  topic: string;
  messages: ChatMessage[];
}

export const ConversationZone: React.FC<ConversationZoneProps> = ({ roomCode, userId, userName, topic, messages }) => {
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await sendChatMessage(roomCode, userId, userName, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleEnd = async () => {
    if (confirm("Are we feeling better? This will fold the conversation into your history.")) {
      await endConversation(roomCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity" />

      {/* Floating Bubble Container */}
      <div className="bg-white w-full max-w-md h-[80vh] rounded-[3rem] border-8 border-blue-400 shadow-[0px_10px_0px_0px_rgba(59,130,246,0.3)] pointer-events-auto flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Cute Header */}
        <div className="bg-blue-400 p-4 pt-6 pb-4 shrink-0 relative">
           <div className="absolute top-0 left-0 w-full h-4 bg-blue-300 rounded-t-[2.5rem] opacity-50"></div>
           <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                   <MessageCircle size={24} className="fill-white" />
                </div>
                <div>
                   <h2 className="font-bold text-xl leading-none">Safe Space</h2>
                   <p className="text-xs opacity-90 font-bold">Talking about it</p>
                </div>
              </div>
              
              <button 
                onClick={handleEnd}
                className="bg-white text-blue-500 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-1 border-2 border-transparent hover:border-blue-200"
              >
                <HeartHandshake size={14} />
                We're Good
              </button>
           </div>
           
           {/* Topic Pill */}
           <div className="mt-4 bg-white/20 backdrop-blur-md rounded-xl p-3 text-center border-2 border-white/30">
              <p className="text-white font-[Patrick_Hand] text-lg leading-tight drop-shadow-sm">
                "{topic}"
              </p>
           </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f9ff]">
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
               <MessageCircle size={60} className="mb-2 text-blue-300" />
               <p className="font-bold text-blue-300">Start the conversation...</p>
             </div>
          )}
          
          {messages.map((msg) => {
            const isMe = msg.senderId === userId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`
                    max-w-[85%] px-5 py-3 text-lg font-[Patrick_Hand] shadow-sm relative
                    ${isMe 
                      ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white text-gray-700 border-2 border-gray-100 rounded-2xl rounded-tl-sm'
                    }
                  `}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 font-bold mt-1 px-1">
                  {isMe ? 'You' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t-2 border-blue-50 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type here..."
              className="flex-1 p-4 bg-gray-50 border-2 border-gray-200 rounded-[2rem] focus:outline-none focus:border-blue-400 focus:bg-white transition-all font-[Patrick_Hand] text-xl"
            />
            <button 
              type="submit"
              className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center border-4 border-blue-100"
            >
              <Send size={24} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};