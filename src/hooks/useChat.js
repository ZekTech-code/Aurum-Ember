import { useContext } from 'react';
import { ChatContext } from '../context/ChatContextInstance';

export const useChat = () => useContext(ChatContext);
