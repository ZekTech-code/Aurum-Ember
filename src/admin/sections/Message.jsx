/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '../../hooks/useChat';
import { 
  MessageSquare, Send, Search, User as UserIcon, X, Trash2, 
  CheckCircle2, Edit3, Paperclip, Smile, MoreVertical, 
  Menu, BellOff, Loader2, Pin, Phone, Video, Search as SearchIcon,
  Info, Archive, Filter, Image as ImageIcon, FileText, Mic,
  ChevronDown, Heart, ThumbsUp, Laugh, Star, Plus, Settings,
  Hash, Bell, UserPlus, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/ConfirmModal';

// --- Sub-Components ---

const StatBadge = ({ count }) => (
  <div className="w-5 h-5 bg-accent text-[10px] font-black text-white rounded-full flex items-center justify-center shadow-lg shadow-accent/20">
    {count}
  </div>
);

const MessageBubble = ({ msg, isAdmin, currentSelectedUser, onEdit, onDelete, isEditing, editInput, setEditInput, onSave, onCancel }) => {
  return (
    <div className={`flex w-full group ${isAdmin ? 'justify-end' : 'justify-start'} mb-4 px-1`}>
      <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isAdmin ? 'flex-row-reverse' : ''} relative`}>
        {!isAdmin && (
          <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden mt-auto mb-1">
            {currentSelectedUser?.avatar ? (
              <img src={currentSelectedUser.avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-accent/10 flex items-center justify-center text-accent font-black">
                {currentSelectedUser?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        )}

        <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
          {/* Actions - Hover only */}
          {!isEditing && (
            <div className={`absolute ${isAdmin ? 'left-[-40px]' : 'right-[-40px]'} top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10`}>
               {/* Admin can ONLY edit their own messages */}
               {isAdmin && (
                 <button 
                  onClick={() => onEdit(msg.id, msg.text)}
                  className="p-1.5 bg-[var(--admin-card)] rounded-lg shadow-xl text-[var(--admin-text-muted)] hover:text-accent transition-colors border border-[var(--admin-border)]"
                 >
                   <Edit3 size={12} />
                 </button>
               )}
               <button 
                onClick={() => onDelete(msg.id)}
                className="p-1.5 bg-[var(--admin-card)] rounded-lg shadow-xl text-[var(--admin-text-muted)] hover:text-red-500 transition-colors border border-[var(--admin-border)]"
               >
                 <Trash2 size={12} />
               </button>
            </div>
          )}

          <div className={`relative px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm transition-all border ${
            isAdmin 
              ? 'bg-accent text-white border-accent/50' 
              : 'bg-[var(--admin-card)] text-[var(--admin-text)] border-[var(--admin-border)]'
          }`}>
            {isEditing ? (
               <div className="min-w-[200px]">
                  <textarea 
                    autoFocus
                    className="w-full bg-black/20 border-none outline-none text-white p-0 resize-none overflow-hidden"
                    rows={2}
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 mt-2">
                     <button onClick={onCancel} className="text-[10px] uppercase font-black opacity-60 hover:opacity-100 transition-opacity">Cancel</button>
                     <button onClick={onSave} className="text-[10px] uppercase font-black bg-white/20 px-2 py-1 rounded-lg hover:bg-white/30 transition-all">Save</button>
                  </div>
               </div>
            ) : (
               msg.text
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <span className="text-[9px] font-medium text-[var(--admin-text-muted)]">
              {msg.timestamp}
            </span>
            {msg.isEdited && <span className="text-[9px] text-[var(--admin-text-muted)]/60 font-medium">(edited)</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Message = () => {
  const { 
    getAllChats, sendMessage, markAsRead, toggleResolved, 
    deleteConversation, activeTyping, setTypingStatus, deleteMessage,
    toggleArchived, editMessage
  } = useChat();
  
  const chats = getAllChats();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Direct');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInput, setEditInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [usersDb, setUsersDb] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, messageId: null });

  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('ae-admin-token');
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUsersDb(Array.isArray(data) ? data : (data.users || []));
      } catch (e) {
        console.error("Failed to fetch users:", e);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const getUserData = (email) => {
    return usersDb.find(u => u.email?.toLowerCase() === email?.toLowerCase()) || {
      name: email?.split('@')[0] || 'User', email: email, avatar: null
    };
  };

  const selectedChat = useMemo(() => chats.find(c => c.userId === selectedChatId), [chats, selectedChatId]);
  const currentSelectedUser = useMemo(() => selectedChat ? getUserData(selectedChat.userId) : null, [selectedChat, usersDb]);

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      const userData = getUserData(chat.userId);
      const matchesSearch = userData.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isUrgent = chat.unreadCount > 0;
      
      if (urgentOnly && !isUrgent) return false;
      if (activeTab === 'Archived') return matchesSearch && chat.isArchived;
      return matchesSearch && !chat.isArchived;
    });
  }, [chats, searchTerm, urgentOnly, activeTab]);

  useEffect(() => {
    if (selectedChatId) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      markAsRead(selectedChatId);
    }
  }, [selectedChatId, selectedChat?.messages?.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatId) return;
    sendMessage(selectedChatId, replyText, 'admin');
    setReplyText('');
    setTypingStatus(selectedChatId, false, 'admin');
  };

  const handleEditMessage = (id, text) => {
    setEditingMessageId(id);
    setEditInput(text);
  };

  const saveEdit = () => {
    if (!editInput.trim() || !selectedChatId) return;
    editMessage(selectedChatId, editingMessageId, editInput);
    setEditingMessageId(null);
    setEditInput('');
  };

  const handleDeleteMessage = (id) => {
    setDeleteModal({ isOpen: true, messageId: id });
  };

  const confirmDeleteMessage = () => {
    if (deleteModal.messageId && selectedChatId) {
      deleteMessage(selectedChatId, deleteModal.messageId);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--admin-bg)]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
      <div className="h-[calc(100vh-140px)] flex flex-col bg-[var(--admin-card)] overflow-hidden transition-colors duration-500 rounded-2xl shadow-lg border border-[var(--admin-border)]">
      
    <div className="flex-1 flex overflow-hidden">
        
        {/* --- LEFT SIDEBAR (CHATS) --- */}
        <aside className="w-full md:w-[340px] lg:w-[360px] border-r border-[var(--admin-border)] flex flex-col shrink-0 bg-[var(--admin-bg)]">
          <div className="px-5 pt-5 pb-4">
             <div className="flex items-center justify-between mb-5">
                <div className="flex gap-2">
                   <button 
                    onClick={() => setActiveTab('Direct')}
                    className={`p-2 rounded-lg transition-colors ${activeTab === 'Direct' ? 'text-accent bg-accent/10' : 'text-[var(--admin-text-muted)] hover:text-accent hover:bg-accent/5'}`}
                   >
                    <Menu size={18} />
                   </button>
                   <button 
                    onClick={() => setIsSearchActive(!isSearchActive)}
                    className={`p-2 rounded-lg transition-colors ${isSearchActive ? 'text-accent bg-accent/10' : 'text-[var(--admin-text-muted)] hover:text-accent hover:bg-accent/5'}`}
                   >
                    <Search size={18} />
                   </button>
                </div>
                <div className="flex gap-1.5">
                   <button 
                    onClick={() => setUrgentOnly(!urgentOnly)}
                    className={`p-2 rounded-lg transition-colors ${urgentOnly ? 'text-amber-500 bg-amber-500/10' : 'text-[var(--admin-text-muted)] hover:text-amber-500 hover:bg-amber-500/5'}`}
                   >
                    <Zap size={18} />
                   </button>
                   <button 
                    onClick={() => {
                      if (selectedChatId) {
                        toggleArchived(selectedChatId);
                        setSelectedChatId(null);
                      }
                    }}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-accent hover:bg-accent/5 transition-colors"
                   >
                    <Archive size={18} />
                   </button>
                </div>
             </div>
             
             {isSearchActive ? (
                <div className="mb-5 animate-in slide-in-from-top-2 duration-300">
                   <input 
                     autoFocus
                     type="text" 
                     placeholder="Search chats..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl py-2.5 px-4 text-xs font-medium outline-none focus:border-accent/50 transition-all text-[var(--admin-text)] placeholder-[var(--admin-text-muted)]"
                   />
                </div>
             ) : (
                <h2 className="text-2xl font-black text-[var(--admin-text)] mb-6">Chats</h2>
             )}

             <div className="flex gap-1">
                {['Direct', 'Groups', 'Archived'].map(tab => (
                   <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === tab ? 'bg-accent text-white shadow-sm' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)]'
                    }`}
                   >
                     {tab}
                   </button>
                ))}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4 custom-scrollbar pt-1">
             {filteredChats.map(chat => {
                const userData = getUserData(chat.userId);
                const isActive = selectedChatId === chat.userId;
                return (
                    <div 
                     key={chat.userId}
                     onClick={() => setSelectedChatId(chat.userId)}
                     className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                       isActive ? 'bg-accent/10 ring-1 ring-accent/20' : 'hover:bg-[var(--admin-surface-hover)]'
                     }`}
                    >
                       <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                             {userData.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold">{userData.name[0]}</div>}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[var(--admin-bg)] rounded-full" />
                       </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center">
                            <h4 className="text-xs font-semibold text-[var(--admin-text)] truncate">{userData.name}</h4>
                            <span className="text-[9px] text-[var(--admin-text-muted)] font-medium">{chat.lastTimestamp}</span>
                         </div>
                         <p className="text-[11px] text-[var(--admin-text-muted)] truncate mt-0.5">{chat.lastMessage}</p>
                      </div>
                   </div>
                );
             })}
          </div>
        </aside>

        {/* --- MAIN CHAT SECTION --- */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--admin-bg)] relative h-full">
           {selectedChatId && selectedChat ? (
             <>
                {/* Chat Header */}
                <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--admin-border)] shrink-0 bg-[var(--admin-card)] z-40 sticky top-0">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden">
                         {currentSelectedUser?.avatar ? <img src={currentSelectedUser.avatar} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold">{currentSelectedUser?.name?.[0]}</div>}
                      </div>
                      <div>
                         <h3 className="text-sm font-semibold text-[var(--admin-text)]">{currentSelectedUser?.name}</h3>
                         <p className="text-[10px] font-medium text-green-500 mt-0.5">Online</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-1">
                      <button className="p-2 rounded-lg text-gray-400 hover:text-accent hover:bg-accent/5 transition-colors"><Phone size={16} /></button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-accent hover:bg-accent/5 transition-colors"><Video size={16} /></button>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-accent hover:bg-accent/5 transition-colors"><MoreVertical size={16} /></button>
                   </div>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-[var(--admin-bg)] relative">
                  <div className="max-w-3xl mx-auto">
                     {selectedChat.messages.map((msg, i) => (
                        <MessageBubble 
                          key={msg.id || i} 
                          msg={msg} 
                          isAdmin={msg.sender === 'admin'} 
                          currentSelectedUser={currentSelectedUser}
                          onEdit={handleEditMessage}
                          onDelete={handleDeleteMessage}
                          isEditing={editingMessageId === msg.id}
                          editInput={editInput}
                          setEditInput={setEditInput}
                          onSave={saveEdit}
                          onCancel={() => setEditingMessageId(null)}
                        />
                     ))}
                     <div ref={chatEndRef} className="h-4" />
                  </div>
               </div>

                {/* Input */}
                <div className="px-6 pb-5 pt-3 bg-[var(--admin-bg)] z-40">
                   <div className="max-w-3xl mx-auto">
                      <form onSubmit={handleSend} className="flex items-center gap-3 bg-[var(--admin-card)] rounded-xl p-2 border border-[var(--admin-border)]">
                         <button type="button" className="p-2 text-[var(--admin-text-muted)] hover:text-accent rounded-lg hover:bg-accent/5 transition-colors"><Plus size={18} /></button>
                         <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={replyText}
                            onChange={(e) => { setReplyText(e.target.value); setTypingStatus(selectedChatId, e.target.value.length > 0, 'admin'); }}
                            className="flex-1 bg-transparent border-none outline-none py-2 px-1 text-sm text-[var(--admin-text)]"
                         />
                         <div className="flex items-center gap-0.5">
                            <button type="button" className="p-2 text-[var(--admin-text-muted)] hover:text-accent rounded-lg hover:bg-accent/5 transition-colors"><Smile size={18} /></button>
                            <button type="button" className="p-2 text-[var(--admin-text-muted)] hover:text-accent rounded-lg hover:bg-accent/5 transition-colors"><Mic size={18} /></button>
                            <button 
                               type="submit"
                               disabled={!replyText.trim()}
                               className="w-9 h-9 bg-accent text-white rounded-lg flex items-center justify-center hover:bg-accent/90 transition-all disabled:opacity-20"
                            >
                               <Send size={15} className="ml-0.5" />
                            </button>
                         </div>
                      </form>
                   </div>
                </div>
             </>
           ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-40">
                 <MessageSquare size={48} className="text-[var(--admin-text-muted)] mb-3" />
                 <h3 className="text-lg font-semibold text-[var(--admin-text-muted)]">Select a conversation</h3>
                 <p className="text-xs text-[var(--admin-text-muted)] mt-1 opacity-60">Choose from the sidebar to start chatting</p>
             </div>
           )}
        </main>
      </div>
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, messageId: null })}
        onConfirm={confirmDeleteMessage}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />
    </div>
  );
};

export default Message;
