import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import Welcome from './Welcome';
import Message from './Message';
import Spinner from '../common/Spinner';

const ChatWindow = () => {
  const { messages, sendMessage, selectedConversationId, loadingMessages } = useChat();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConversationId) return;

    const text = input;
    setInput('');
    setIsSending(true);
    await sendMessage(text);
    setIsSending(false);
  };

  if (!selectedConversationId) {
    return <Welcome />;
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full"><Spinner /></div>
        ) : (
          messages.map(msg => <Message key={msg.id} message={msg} />)
        )}
        {isSending && <Message message={{id: 'sending', sender: 'user', text: input, timestamp: null}} />}
        {isSending && <Message message={{id: 'typing', sender: 'bot', text: '...', timestamp: null}} isTyping />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-6 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a medical question..."
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isSending}
          />
          <button type="submit" disabled={isSending || !input.trim()} className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-white rounded-r-lg bg-gradient-to-r from-indigo-500 to-purple-600 disabled:from-gray-400 disabled:to-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">Disclaimer: PulseAI is an informational tool and not a substitute for professional medical advice.</p>
      </div>
    </div>
  );
};

export default ChatWindow;
