import { useState } from 'react';
import Login from '../components/auth/Login';
import SignUp from '../components/auth/SignUp';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-4">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H5.5L8 4L12.5 20L16.5 9L19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to PulseAI</h1>
          <p className="text-gray-500 mt-2">Your Secure Medical Assistant</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          {isLogin ? <Login setIsLogin={setIsLogin} /> : <SignUp setIsLogin={setIsLogin} />}
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
