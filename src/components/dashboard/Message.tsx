import { useAuth } from '../../hooks/useAuth';
import type { Message as MessageType } from '../../context/ChatContext';

interface MessageProps {
  message: MessageType;
  isTyping?: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isTyping = false }) => {
  const { user } = useAuth();
  const isUser = message.sender === 'user';

  return (
    <div className={`flex items-start space-x-3 max-w-xl my-4 ${isUser ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'}`}>
        {isUser ? (
          user?.email?.charAt(0).toUpperCase()
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </div>
      <div className={`rounded-lg p-3 shadow-md ${isUser ? 'bg-indigo-500 text-white' : 'bg-white text-gray-800'}`}>
        {isTyping ? (
          <div className="flex items-center space-x-1">
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    </div>
  );
};

export default Message;
