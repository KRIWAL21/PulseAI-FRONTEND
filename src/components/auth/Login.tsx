import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import AuthInput from '../common/AuthInput';
import Button from '../common/Button';

interface LoginProps {
  setIsLogin: (isLogin: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex border-b mb-6">
        <button className="flex-1 py-2 font-semibold text-indigo-600 border-b-2 border-indigo-600">Login</button>
        <button onClick={() => setIsLogin(false)} className="flex-1 py-2 font-semibold text-gray-500">Register</button>
      </div>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <AuthInput id="login-email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthInput id="login-password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </>
  );
};

export default Login;