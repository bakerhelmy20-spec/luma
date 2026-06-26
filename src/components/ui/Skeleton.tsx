import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded bg-brand-sand/60',
        className
      )}
      {...props}
    />
  );
};
