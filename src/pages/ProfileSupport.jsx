import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import ProfileLayout from '../components/ProfileLayout';
import { Send, Smile, Paperclip, CornerDownRight, Edit3, Trash2, CheckCheck, MoreVertical, Info, MessageCircle } from 'lucide-react';

export default function ProfileSupport() {
  const { user } = useAuth();
  const { sendMessage, getUserChat, markAsRead, activeTyping, setTypingStatus, editMessage, deleteMessage } = useChat();
  const chatEndRef = useRef(null);
  const [chatMessage, setChatMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInput, setEditInput] = useState('');

  const userChat = getUserChat(user?.email);

  useEffect(() => {
    if (user?.email) markAsRead(user?.email);
  }, [user?.email, markAsRead]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userChat?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !user?.email) return;
    sendMessage(user.email, chatMessage, 'user');
    setChatMessage('');
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!editInput.trim()) return;
    editMessage(user.email, editingMessageId, editInput);
    setEditingMessageId(null);
    setEditInput('');
  };

  return (
    <ProfileLayout title="Support" subtitle="Chat with our team">
      <div className="bg-(--bg-card) rounded-2xl border border-(--border) overflow-hidden flex flex-col" style={{ height: 'min(600px, 70vh)' }}>
        {/* Header */}
        <div className="h-14 bg-(--bg-card) flex items-center gap-3 px-5 border-b border-(--border)">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-(--brand-gold)/10 flex items-center justify-center text-(--brand-gold)">
              <MessageCircle size={16} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-(--bg-card) rounded-full" />
          </div>
          <span className="text-sm font-bold text-(--text-primary)">Customer Support</span>
          <div className="ml-auto flex gap-3 text-(--text-muted)">
            <Info size={14} className="cursor-pointer hover:text-(--text-primary)" />
            <MoreVertical size={14} className="cursor-pointer hover:text-(--text-primary)" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-(--bg-primary)">
          <div className="bg-(--bg-secondary) text-(--text-primary) p-3 rounded-2xl text-xs leading-relaxed max-w-[80%]">
            Hello! Welcome to Aurum & Ember support. How can we assist you?
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Check my order', 'Restaurant hours', 'Talk to Human'].map((tip) => (
              <button
                key={tip}
                onClick={() => setChatMessage(tip)}
                className="px-3 py-1.5 bg-(--bg-card) border border-(--border) rounded-full text-[10px] font-bold text-(--text-secondary) hover:bg-(--brand-gold)/10 hover:text-(--brand-gold) hover:border-(--brand-gold)/30 transition-all flex items-center gap-1"
              >
                <CornerDownRight size={10} />
                {tip}
              </button>
            ))}
          </div>

          {userChat?.messages?.map((msg) => (
            <div key={msg.id} className={`flex flex-col group relative ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.sender === 'user' && !editingMessageId && (
                <div className="absolute -left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-(--bg-card) p-1 rounded-lg shadow-sm z-10">
                  <button onClick={() => { setEditingMessageId(msg.id); setEditInput(msg.text); }} className="p-1 hover:text-(--brand-gold) transition-colors"><Edit3 size={11} /></button>
                  <button onClick={() => deleteMessage(user.email, msg.id)} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={11} /></button>
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                msg.sender === 'user' ? 'bg-(--brand-gold) text-white' : 'bg-(--bg-secondary) text-(--text-primary)'
              }`}>
                {editingMessageId === msg.id ? (
                  <form onSubmit={saveEdit} className="flex flex-col gap-2 min-w-40">
                    <textarea value={editInput} onChange={(e) => setEditInput(e.target.value)} className="bg-transparent border border-(--border) rounded-lg p-1.5 text-(--text-primary) text-xs outline-none resize-none" rows={2} autoFocus />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingMessageId(null)} className="text-[10px] text-(--text-muted)">Cancel</button>
                      <button type="submit" className="text-[10px] font-bold text-(--brand-gold)">Save</button>
                    </div>
                  </form>
                ) : msg.text}
              </div>
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[8px] text-(--text-muted) font-bold uppercase tracking-widest">{msg.timestamp}</span>
                {msg.sender === 'user' && <CheckCheck size={10} className="text-(--brand-gold)" />}
              </div>
            </div>
          ))}

          {activeTyping[user?.email]?.isAdminTyping && (
            <div className="flex items-center gap-2 text-(--brand-gold) text-[10px] font-bold animate-pulse">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 bg-(--brand-gold) rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-(--brand-gold) rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 h-1 bg-(--brand-gold) rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              Admin typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="bg-(--bg-card) p-4 border-t border-(--border)">
          <form
            onSubmit={(e) => { handleSendMessage(e); setTypingStatus(user?.email, false, 'user'); }}
            className="bg-(--bg-secondary) border border-(--border) rounded-xl p-1.5 flex items-center gap-2 focus-within:border-(--brand-gold)/30 transition-colors"
          >
            <div className="flex gap-1 px-2">
              <button type="button" className="text-(--text-muted) hover:text-(--brand-gold) transition-colors"><Smile size={14} /></button>
              <button type="button" className="text-(--text-muted) hover:text-(--brand-gold) transition-colors"><Paperclip size={14} /></button>
            </div>
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => { setChatMessage(e.target.value); setTypingStatus(user?.email, e.target.value.length > 0, 'user'); }}
              placeholder="Write a message..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-(--text-primary) py-2 placeholder:text-(--text-muted)"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim()}
              className="bg-(--brand-gold) text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-md hover:brightness-110 transition-all disabled:opacity-20"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </ProfileLayout>
  );
}
