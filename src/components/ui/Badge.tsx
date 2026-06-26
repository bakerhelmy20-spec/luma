import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning';
}

export const Badge = ({ className, variant = 'primary', ...props }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide';
  
  const variants = {
    primary: 'bg-brand-olive/10 text-brand-olive border border-brand-olive/20',
    secondary: 'bg-brand-sand text-brand-brown border border-brand-sand/50',
    outline: 'bg-transparent border border-brand-brown/30 text-brand-brown',
    danger: 'bg-red-50 text-red-700 border border-red-100',
    success: 'bg-green-50 text-green-700 border border-green-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  };

  return (
    <span
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    />
  );
};
