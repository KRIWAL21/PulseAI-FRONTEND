import React from 'react';
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
const AuthInput: React.FC<AuthInputProps> = (props) => (
  <div>
    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">{props.placeholder}</label>
    <input
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);
export default AuthInput;