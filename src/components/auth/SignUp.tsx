import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AuthInput from '../common/AuthInput';
import Button from '../common/Button';
import { useToast } from '../../context/ToastContext';

interface SignUpProps {
  setIsLogin: (v: boolean) => void;
}

const SignUp: React.FC<SignUpProps> = ({ setIsLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName || undefined);
      setIsLogin(true);
    } catch (err) {
      // Error is handled by signUp (shows toast)
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tab switcher */}
      <div className="flex mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setIsLogin(true)}
          className="flex-1 pb-3 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          Sign In
        </button>
        <button
          className="flex-1 pb-3 text-sm font-semibold"
          style={{ color: 'var(--accent)', borderBottom: '2px solid var(--accent)' }}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <AuthInput
          id="signup-name"
          type="text"
          placeholder="Full name (optional)"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          icon="👤"
        />
        <AuthInput
          id="signup-email"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon="✉️"
          required
          autoComplete="email"
        />
        <AuthInput
          id="signup-password"
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          icon="🔒"
          required
          autoComplete="new-password"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" style={{ width: 16, height: 16 }} />
              Creating account...
            </span>
          ) : 'Create Account →'}
        </Button>
      </form>
    </>
  );
};

export default SignUp;
