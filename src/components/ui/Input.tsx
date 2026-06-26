import { type InputHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-brand-brown/80 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-brand-brown/50">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={clsx(
              'w-full py-2 text-sm border bg-white text-brand-charcoal transition-all duration-200 rounded-md focus:outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/15',
              leftIcon ? 'pl-10 pr-3' : 'px-3',
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-brand-sand',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
        {!error && helperText && <span className="text-xs text-brand-gray mt-0.5">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
