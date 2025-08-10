import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import Button from '../common/Button';

const Sidebar = () => {
  const { user } = useAuth();
  const { conversations, selectConversation, createNewConversation, selectedConversationId } = useChat();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 className="text-xl font-bold">PulseAI</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Button onClick={createNewConversation}>New Chat</Button>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-4">Recent Chats</h3>
        <div className="space-y-1">
          {conversations.map(convo => (
            <button
              key={convo.id}
              onClick={() => selectConversation(convo.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg font-medium text-left transition-colors ${selectedConversationId === convo.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <svg className="h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <span className="truncate">{convo.title}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-indigo-600">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium truncate">{user?.email}</span>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 font-semibold">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;