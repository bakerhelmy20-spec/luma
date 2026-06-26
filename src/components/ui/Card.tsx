import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = ({ className, hoverEffect = false, ...props }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-white border border-brand-sand/50 rounded-lg overflow-hidden transition-all duration-300',
        hoverEffect && 'hover:shadow-md hover:border-brand-sand hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-4 flex flex-col gap-1.5', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={clsx('font-serif text-lg font-semibold text-brand-brown', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx('text-xs text-brand-gray', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-4 pt-0', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx('p-4 pt-0 flex items-center justify-between', className)} {...props} />
);
