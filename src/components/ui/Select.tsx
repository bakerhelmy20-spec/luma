import { type SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5 relative">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-brand-brown/80 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'w-full appearance-none px-3 py-2 pr-10 text-sm border bg-white text-brand-charcoal transition-all duration-200 rounded-md focus:outline-none focus:border-brand-olive focus:ring-2 focus:ring-brand-olive/15 cursor-pointer',
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-brand-sand',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-brand-brown/50">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
