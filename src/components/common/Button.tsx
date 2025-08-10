import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    {...props}
    className={`w-full text-white font-bold py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity disabled:from-gray-400 disabled:to-gray-500 ${className}`}
  >
    {children}
  </button>
);
export default Button;