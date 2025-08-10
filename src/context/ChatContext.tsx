import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

// Define types for our chat data
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: any;
}

export interface Conversation {
  id: string;
  title: string;
  startTime: any;
}

interface ChatContextType {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messages: Message[];
  loadingMessages: boolean;
  selectConversation: (id: string | null) => void;
  createNewConversation: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Effect to listen for chat history changes from Firestore
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }
    const historyRef = collection(db, `users/${user.uid}/conversations`);
    const q = query(historyRef, orderBy("startTime", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(convos);
    });
    return () => unsubscribe();
  }, [user]);

  // Effect to listen for messages in the selected conversation
  useEffect(() => {
    if (!user || !selectedConversationId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    const messagesRef = collection(db, `users/${user.uid}/conversations/${selectedConversationId}/messages`);
    const q = query(messagesRef, orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoadingMessages(false);
    });
    return () => unsubscribe();
  }, [user, selectedConversationId]);

  const selectConversation = (id: string | null) => {
    setSelectedConversationId(id);
  };

  const createNewConversation = async () => {
    if (!user) return;
    const newConvoRef = await addDoc(collection(db, `users/${user.uid}/conversations`), {
      startTime: serverTimestamp(),
      title: "New Chat"
    });
    selectConversation(newConvoRef.id);
  };

  const sendMessage = async (text: string) => {
    if (!user || !selectedConversationId) return;

    // 1. Add user message to Firestore
    const messagesCollection = collection(db, `users/${user.uid}/conversations/${selectedConversationId}/messages`);
    await addDoc(messagesCollection, { sender: 'user', text, timestamp: serverTimestamp() });

    // 2. Call Flask backend for AI response
    try {
      const response = await fetch('http://localhost:8080/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      const answer = data.answer || "Sorry, I couldn't get a response.";

      // 3. Add bot response to Firestore
      await addDoc(messagesCollection, { sender: 'bot', text: answer, timestamp: serverTimestamp() });

      // 4. Update conversation title if it's the first message
      const convoRef = doc(db, `users/${user.uid}/conversations`, selectedConversationId);
      const messagesSnapshot = await getDocs(collection(convoRef, "messages"));
      if (messagesSnapshot.docs.length <= 2) {
        await updateDoc(convoRef, { title: text });
      }

    } catch (error) {
      console.error("Failed to get response from AI:", error);
      await addDoc(messagesCollection, { sender: 'bot', text: 'Sorry, a connection error occurred.', timestamp: serverTimestamp() });
    }
  };

  const value = { conversations, selectedConversationId, messages, loadingMessages, selectConversation, createNewConversation, sendMessage };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};




// const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
  // method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ question: text })
// });
