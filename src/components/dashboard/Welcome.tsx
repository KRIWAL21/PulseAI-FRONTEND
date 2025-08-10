import { useChat } from '../../hooks/useChat';

const Welcome = () => {
    const { sendMessage, createNewConversation } = useChat();

    const suggestions = [
        "What are symptoms of the flu?",
        "Explain Type 2 diabetes",
        "Common side effects of Aspirin",
        "Tell me about preventative care"
    ];

    const handleSuggestionClick = async (suggestion: string) => {
        await createNewConversation();
        // A small delay to ensure the new conversation is selected before sending a message
        setTimeout(() => sendMessage(suggestion), 100);
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-6">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">How can I help you today?</h2>
            <p className="text-gray-500 mt-2 max-w-md">Ask me anything about your medical documents. I'm here to provide quick and accurate information.</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestions.map((text, i) => (
                    <button key={i} onClick={() => handleSuggestionClick(text)} className="bg-gray-100 p-3 rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-colors text-sm">
                        {text}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Welcome;