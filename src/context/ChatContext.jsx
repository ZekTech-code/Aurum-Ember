import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatContext } from './ChatContextInstance';
import { useAuth } from '../hooks/useAuth';

const API_BASE = '/api';
const BASE_INTERVAL = 10000;
const MAX_INTERVAL = 120000;
const MAX_RETRIES = 5;

export const ChatProvider = ({ children }) => {
  const { token: userToken, isAdminAuthenticated } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeTyping, setActiveTyping] = useState({});
  const failCountRef = useRef(0);
  const timerRef = useRef(null);
  const fnStoreRef = useRef({});

  const getAuthHeaders = useCallback(() => {
    const adminToken = isAdminAuthenticated ? sessionStorage.getItem('ae-admin-token') : null;
    const t = adminToken || userToken;
    return {
      'Content-Type': 'application/json',
      ...(t ? { 'Authorization': `Bearer ${t}` } : {})
    };
  }, [userToken, isAdminAuthenticated]);

  const scheduleNext = useCallback((delay) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fnStoreRef.current.fetchChats();
    }, delay);
  }, []);

  const fetchChatsFn = useCallback(async () => {
    const adminToken = isAdminAuthenticated ? sessionStorage.getItem('ae-admin-token') : null;
    if (!adminToken && !userToken) {
      scheduleNext(BASE_INTERVAL);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/chats`, {
        headers: getAuthHeaders(),
        signal: AbortSignal.timeout(8000)
      });
      if (response.ok) {
        const data = await response.json();
        setChats(Array.isArray(data) ? data : []);
        failCountRef.current = 0;
        scheduleNext(BASE_INTERVAL);
      } else {
        failCountRef.current += 1;
        const delay = Math.min(BASE_INTERVAL * Math.pow(2, failCountRef.current), MAX_INTERVAL);
        scheduleNext(delay);
      }
    } catch {
      failCountRef.current += 1;
      if (failCountRef.current <= MAX_RETRIES) {
        const delay = Math.min(BASE_INTERVAL * Math.pow(2, failCountRef.current), MAX_INTERVAL);
        scheduleNext(delay);
      } else {
        scheduleNext(MAX_INTERVAL);
      }
    }
  }, [getAuthHeaders, scheduleNext, userToken, isAdminAuthenticated]);

  useEffect(() => {
    fnStoreRef.current.fetchChats = fetchChatsFn;
  }, [fetchChatsFn]);

  useEffect(() => {
    (async () => { await fetchChatsFn(); })();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchChatsFn]);

  const sendMessage = useCallback(async (userId, text, sender = 'user', metadata = {}) => {
    try {
      const response = await fetch(`${API_BASE}/chats/message`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, text, sender, metadata })
      });
      if (response.ok) {
        await fnStoreRef.current.fetchChats();
        if (sender === 'admin') {
          const event = new CustomEvent('ae-new-message', { detail: { text, userId } });
          window.dispatchEvent(event);
        }
      }
    } catch {
      // Silent fail
    }
  }, [getAuthHeaders]);

  const markAsRead = useCallback(async (userId) => {
    try {
      await fetch(`${API_BASE}/chats/field`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, field: 'unreadCount', value: 0 })
      });
      setChats(prev => prev.map(chat =>
        chat.userId === userId ? { ...chat, unreadCount: 0 } : chat
      ));
    } catch {
      // Silent fail
    }
  }, [getAuthHeaders]);

  const toggleResolved = useCallback(async (userId) => {
    try {
      await fetch(`${API_BASE}/chats/field`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, field: 'status' })
      });
      setChats(prev => prev.map(chat =>
        chat.userId === userId ? { ...chat, status: chat.status === 'resolved' ? 'active' : 'resolved' } : chat
      ));
    } catch {
      // Silent fail
    }
  }, [getAuthHeaders]);

  const togglePinned = useCallback(async (userId) => {
    try {
      await fetch(`${API_BASE}/chats/field`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, field: 'isPinned' })
      });
      setChats(prev => prev.map(chat =>
        chat.userId === userId ? { ...chat, isPinned: !chat.isPinned } : chat
      ));
    } catch {
      // Silent fail
    }
  }, [getAuthHeaders]);

  const deleteConversation = useCallback(async (userId) => {
    try {
      await fetch(`${API_BASE}/chats/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      setChats(prev => prev.filter(chat => chat.userId !== userId));
    } catch {
      // Silent fail
    }
  }, [getAuthHeaders]);

  const toggleArchived = useCallback(async (userId) => {
    try {
      await fetch(`${API_BASE}/chats/field`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, field: 'isArchived' })
      });
      setChats(prev => prev.map(chat =>
        chat.userId === userId ? { ...chat, isArchived: !chat.isArchived } : chat
      ));
    } catch {
      // Silent fail
    }
  }, [getAuthHeaders]);

  const editMessage = useCallback(async (userId, messageId, newText) => {
    try {
      await fetch(`${API_BASE}/chats/edit`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, messageId, newText })
      });
      await fnStoreRef.current.fetchChats();
    } catch {
      // Silent fail
    }
  }, [getAuthHeaders]);

  const deleteMessage = useCallback(async (userId, messageId) => {
    try {
      await fetch(`${API_BASE}/chats/message`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, messageId })
      });
      await fnStoreRef.current.fetchChats();
    } catch {
      // Silent fail
    }
  }, [getAuthHeaders]);

  const setTypingStatus = useCallback((userId, isTyping, sender = 'user') => {
    setActiveTyping(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [sender === 'user' ? 'isUserTyping' : 'isAdminTyping']: isTyping
      }
    }));
  }, []);

  const getAllChats = useCallback(() => {
    if (!Array.isArray(chats)) return [];
    return [...chats].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [chats]);

  const getUserChat = useCallback((userId) => {
    if (!userId) return { messages: [] };
    return chats.find(c => c.userId === userId) || { messages: [] };
  }, [chats]);

  return (
    <ChatContext.Provider value={{
      chats,
      getAllChats,
      getUserChat,
      sendMessage,
      markAsRead,
      toggleResolved,
      togglePinned,
      toggleArchived,
      deleteConversation,
      editMessage,
      deleteMessage,
      setTypingStatus,
      activeTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};
