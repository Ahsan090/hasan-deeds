import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 'auto';
}

export function BentoGrid({ children, className, columns = 'auto' }: BentoGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    auto: 'bento-grid',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4 | 'full';
  onClick?: () => void;
  interactive?: boolean;
}

export function BentoCard({ 
  children, 
  className, 
  span = 1, 
  onClick,
  interactive = false 
}: BentoCardProps) {
  const spanClasses = {
    1: '',
    2: 'md:col-span-2',
    3: 'md:col-span-2 lg:col-span-3',
    4: 'md:col-span-2 lg:col-span-4',
    full: 'col-span-full',
  };

  return (
    <div 
      className={cn(
        'bento-card',
        spanClasses[span],
        interactive && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface BentoCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function BentoCardHeader({ title, subtitle, action }: BentoCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
