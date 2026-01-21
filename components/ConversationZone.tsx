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
    if (confirm("Are we feeling better? This will close the conversation zone.")) {
      await endConversation(roomCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#eff6ff] flex flex-col animate-in slide-in-from-bottom duration-500">
      {/* Header */}
      <div className="bg-white p-4 border-b-4 border-blue-200 shadow-sm flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full border-2 border-blue-300">
             <MessageCircle className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 leading-none">Conversation Zone</h2>
            <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">Safe Space</p>
          </div>
        </div>
        
        <button 
          onClick={handleEnd}
          className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-xl border-2 border-green-300 font-bold text-sm transition-colors flex items-center gap-2"
        >
          <HeartHandshake size={18} />
          We're Good
        </button>
      </div>

      {/* Topic Banner */}
      <div className="bg-blue-500 text-white p-3 text-center shadow-inner shrink-0">
        <p className="text-sm font-bold opacity-90 uppercase tracking-wider mb-1">We are talking about</p>
        <p className="text-xl font-[Patrick_Hand] leading-tight">{topic}</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
        {messages.length === 0 && (
           <div className="text-center text-gray-400 mt-10">
             <p className="italic">This is a safe space to discuss what's on your mind.</p>
           </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div 
                className={`
                  max-w-[85%] px-4 py-3 rounded-2xl text-lg font-[Patrick_Hand] border-2 shadow-sm
                  ${isMe 
                    ? 'bg-blue-100 border-blue-300 rounded-br-none text-blue-900' 
                    : 'bg-white border-gray-200 rounded-bl-none text-gray-800'
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
      <div className="p-4 bg-white border-t-4 border-blue-200 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your thoughts..."
            className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-[Patrick_Hand] text-xl"
          />
          <button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl border-2 border-blue-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};