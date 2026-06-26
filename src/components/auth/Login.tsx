import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AuthInput from '../common/AuthInput';
import Button from '../common/Button';

interface LoginProps {
  setIsLogin: (v: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      // Successful login → AuthContext updates → App redirects to /dashboard
    } catch (err) {
      // Error is handled by signIn (shows toast)
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tab switcher */}
      <div className="flex mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          className="flex-1 pb-3 text-sm font-semibold transition-colors"
          style={{ color: 'var(--accent)', borderBottom: '2px solid var(--accent)' }}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className="flex-1 pb-3 text-sm font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <AuthInput
          id="login-email"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon="✉️"
          required
          autoComplete="email"
        />
        <AuthInput
          id="login-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          icon="🔒"
          required
          autoComplete="current-password"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" style={{ width: 16, height: 16 }} />
              Signing in...
            </span>
          ) : 'Sign In →'}
        </Button>
      </form>
    </>
  );
};

export default Login;