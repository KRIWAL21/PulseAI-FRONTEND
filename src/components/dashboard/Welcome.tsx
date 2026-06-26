import { useChat } from '../../hooks/useChat';

const Welcome = () => {
  const { createNewConversation, sendMessage, selectedConversationId } = useChat();

  const suggestions = [
    { icon: '💊', text: 'What are common side effects of Aspirin?', category: 'Medications' },
    { icon: '🩺', text: 'Explain the symptoms of Type 2 diabetes', category: 'Conditions' },
    { icon: '🫁', text: 'How does the respiratory system work?', category: 'Anatomy' },
    { icon: '🧬', text: 'What is the difference between RNA and DNA?', category: 'Biology' },
    { icon: '❤️', text: 'What causes high blood pressure?', category: 'Cardiology' },
    { icon: '🌡️', text: 'How does the immune system fight infection?', category: 'Immunology' },
  ];

  const handleSuggestion = async (text: string) => {
    if (selectedConversationId) {
      await sendMessage(text, selectedConversationId);
    } else {
      const conversation = await createNewConversation();
      await sendMessage(text, conversation.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto" style={{ background: 'var(--bg-base)' }}>

      {/* Hero section */}
      <div className="text-center mb-10" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
        {/* Animated logo */}
        <div
          className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center avatar-pulse"
          style={{ background: 'var(--gradient-accent)', boxShadow: 'var(--shadow-glow)' }}
        >
          <svg className="w-11 h-11 text-white" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold mb-2 gradient-text">How can I help you today?</h2>
        <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
          Ask me anything about medicine, symptoms, medications, or anatomy.
          I'll answer from verified medical documents with source citations.
        </p>

        {/* Capabilities pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {['RAG-Powered', 'Source Citations', 'Voice Input', 'Conversational Memory'].map(cap => (
            <span
              key={cap}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'var(--accent-dim)',
                border: '1px solid rgba(0,212,255,0.2)',
                color: 'var(--accent)',
              }}
            >
              ✦ {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Suggestion cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl"
        style={{ animation: 'fadeSlideUp 0.6s ease-out 0.1s both' }}
      >
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSuggestion(s.text)}
            className="text-left p-4 rounded-2xl transition-all group"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              animationDelay: `${i * 0.05}s`,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(0,212,255,0.3)';
              el.style.background = 'var(--bg-overlay)';
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = 'var(--shadow-glow-sm)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'var(--border)';
              el.style.background = 'var(--bg-elevated)';
              el.style.transform = 'none';
              el.style.boxShadow = 'none';
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                  {s.category}
                </p>
                <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
                  {s.text}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-xs mt-8 text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
        ⚠️ PulseAI provides educational information only.
        Always consult a healthcare professional for medical advice.
      </p>
    </div>
  );
};

export default Welcome;
