import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import AuthInput from '../common/AuthInput';
import Button from '../common/Button';

interface SignUpProps {
  setIsLogin: (isLogin: boolean) => void;
}

const SignUp: React.FC<SignUpProps> = ({ setIsLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
     <>
      <div className="flex border-b mb-6">
        <button onClick={() => setIsLogin(true)} className="flex-1 py-2 font-semibold text-gray-500">Login</button>
        <button className="flex-1 py-2 font-semibold text-indigo-600 border-b-2 border-indigo-600">Register</button>
      </div>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleSignUp} className="space-y-4">
        <AuthInput id="signup-email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthInput id="signup-password" type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </>
  );
};

export default SignUp;
