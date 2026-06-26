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
          className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center avatar-pulse text-white font-extrabold text-4xl border border-cyan-400/30"
          style={{ background: 'var(--gradient-accent)', boxShadow: 'var(--shadow-glow)' }}
        >
          🩺
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3 tracking-wide uppercase">
          <span>● Verified Clinical RAG Active</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 text-white tracking-tight">
          Hello, I am <span className="gradient-text">Dr. Pulse AI</span>
        </h2>
        <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Your autonomous clinical medical consultant powered by DeepMind Gemini 2.5. 
          Every response is grounded in clinical literature and verified diagnostic databases.
        </p>

        {/* Capabilities pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-6">
          {[
            { label: 'Clinical Literature Grounding', icon: '📚' },
            { label: 'Diagnostic Source Citations', icon: '✚' },
            { label: 'Real-time Audio Symptom Input', icon: '🎙️' },
            { label: 'Encrypted Patient Memory', icon: '🛡️' }
          ].map(cap => (
            <span
              key={cap.label}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              style={{
                background: 'rgba(13, 148, 136, 0.15)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                color: '#2dd4bf',
              }}
            >
              <span>{cap.icon}</span>
              <span>{cap.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Suggestion cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full max-w-4xl"
        style={{ animation: 'fadeSlideUp 0.6s ease-out 0.1s both' }}
      >
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSuggestion(s.text)}
            className="text-left p-4 rounded-2xl transition-all relative overflow-hidden group"
            style={{
              background: 'linear-gradient(180deg, rgba(13, 22, 38, 0.7) 0%, rgba(9, 19, 34, 0.9) 100%)',
              border: '1px solid rgba(30, 58, 95, 0.7)',
              animationDelay: `${i * 0.05}s`,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.borderColor = '#2dd4bf';
              el.style.background = 'rgba(13, 148, 136, 0.12)';
              el.style.transform = 'translateY(-3px)';
              el.style.boxShadow = '0 10px 25px -5px rgba(13, 148, 136, 0.25)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(30, 58, 95, 0.7)';
              el.style.background = 'linear-gradient(180deg, rgba(13, 22, 38, 0.7) 0%, rgba(9, 19, 34, 0.9) 100%)';
              el.style.transform = 'none';
              el.style.boxShadow = 'none';
            }}
          >
            <div className="absolute top-2 right-2 opacity-5 font-black text-4xl select-none pointer-events-none text-teal-400">
              ✚
            </div>
            <div className="flex items-start gap-3.5 relative z-10">
              <span className="text-2xl p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 block">{s.icon}</span>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase block mb-1 text-teal-400">
                  {s.category}
                </span>
                <p className="text-xs sm:text-sm font-medium leading-snug text-gray-200 group-hover:text-white transition-colors">
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
