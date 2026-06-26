import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'accent' | 'ghost';
  fullWidth?: boolean;
}

const Button = ({ children, variant = 'accent', fullWidth = true, className = '', ...rest }: ButtonProps) => (
  <button
    className={`btn-${variant} px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${fullWidth ? 'w-full' : ''} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;