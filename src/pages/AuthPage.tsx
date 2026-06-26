import { useState } from 'react';
import Login from '../components/auth/Login';
import SignUp from '../components/auth/SignUp';

/**
 * AuthPage — Split-panel login/register screen
 *
 * LEFT PANEL: Brand identity with animated pulse graphic and feature highlights
 * RIGHT PANEL: Login / Register form with glassmorphism card
 *
 * On mobile (< md): The left panel is hidden, form takes full screen.
 */
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    { icon: '🧠', title: 'RAG-Powered', desc: 'Grounded answers from medical documents — no hallucinations' },
    { icon: '⚡', title: 'Real-time Streaming', desc: 'Watch answers form token-by-token like ChatGPT' },
    { icon: '💬', title: 'Conversational Memory', desc: 'Follow-up questions work naturally with full context' },
    { icon: '📄', title: 'Source Citations', desc: 'Every answer shows which documents it came from' },
  ];

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden" style={{ boxShadow: 'var(--shadow-elevated)', minHeight: 560 }}>

        {/* ── LEFT PANEL — Brand ─────────────────────────────────── */}
        <div
          className="hidden md:flex flex-col justify-between p-10 flex-1"
          style={{
            background: 'linear-gradient(135deg, #060e20 0%, #0a1a35 50%, #0d2044 100%)',
            borderRight: '1px solid var(--border)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-accent)', boxShadow: 'var(--shadow-glow)' }}
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">PulseAI</span>
          </div>

          {/* Hero text */}
          <div>
            <h1 className="text-3xl font-bold leading-tight mb-3" style={{ color: 'var(--text-primary)' }}>
              Your AI Medical<br />
              <span className="gradient-text">Knowledge Assistant</span>
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
              Ask complex medical questions and get accurate, document-grounded answers with source citations — powered by RAG + Gemini.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-1 gap-3">
              {features.map(f => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)' }}
                >
                  <span className="text-xl flex-shrink-0">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{f.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ⚠️ For educational use only. Not a substitute for professional medical advice.
          </p>
        </div>

        {/* ── RIGHT PANEL — Form ─────────────────────────────────── */}
        <div
          className="flex flex-col justify-center p-8 sm:p-10 w-full md:w-96 flex-shrink-0"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-accent)' }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text">PulseAI</span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {isLogin ? 'Sign in to your medical assistant' : 'Start exploring medical knowledge'}
            </p>
          </div>

          {isLogin
            ? <Login setIsLogin={setIsLogin} />
            : <SignUp setIsLogin={setIsLogin} />
          }
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
