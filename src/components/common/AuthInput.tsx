import type { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

const AuthInput = ({ icon, className = '', ...rest }: AuthInputProps) => (
  <div
    className="focus-ring flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
    style={{
      background: 'var(--bg-input)',
      border: '1px solid var(--border)',
    }}
  >
    {icon && <span className="text-lg flex-shrink-0 opacity-60">{icon}</span>}
    <input
      className={`flex-1 bg-transparent text-sm outline-none ${className}`}
      style={{ color: 'var(--text-primary)' }}
      {...rest}
    />
  </div>
);

export default AuthInput;