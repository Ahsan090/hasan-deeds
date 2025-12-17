import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type StatusVariant = 'pending' | 'active' | 'completed' | 'overdue' | 'hold' | 'info' | 'warning' | 'destructive';

interface StatusBadgeProps {
  variant: StatusVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<StatusVariant, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-accent/10 text-accent border-accent/20',
  completed: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  hold: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  info: 'bg-info/10 text-info border-info/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
};

const dotClasses: Record<StatusVariant, string> = {
  pending: 'bg-warning',
  active: 'bg-accent',
  completed: 'bg-success',
  overdue: 'bg-destructive',
  hold: 'bg-purple-500',
  info: 'bg-info',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

export function StatusBadge({ variant, children, className, dot = true }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotClasses[variant])} />}
      {children}
    </span>
  );
}

// Map entity statuses to badge variants
export function getPlotStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'available': return 'active';
    case 'reserved': return 'pending';
    case 'sold': return 'completed';
    case 'on_hold': return 'hold';
    default: return 'info';
  }
}

export function getPaymentStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'pending': return 'pending';
    case 'paid': return 'completed';
    case 'overdue': return 'overdue';
    case 'failed': return 'destructive';
    default: return 'info';
  }
}

export function getCaseStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'filed': return 'warning';
    case 'in_progress': return 'pending';
    case 'resolved': return 'completed';
    case 'dismissed': return 'info';
    default: return 'info';
  }
}

export function getVerificationStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'pending': return 'pending';
    case 'verified': return 'completed';
    case 'rejected': return 'destructive';
    default: return 'info';
  }
}
