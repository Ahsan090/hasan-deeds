import { Calendar, CreditCard, Receipt, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentInstallment } from '@/types/entities';
import { StatusBadge, getPaymentStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday, addDays, isBefore } from 'date-fns';

interface PaymentCardProps {
  installment: PaymentInstallment;
  plotNumber?: string;
  onPayNow?: () => void;
  onViewReceipt?: () => void;
  className?: string;
}

export function PaymentCard({ 
  installment, 
  plotNumber,
  onPayNow, 
  onViewReceipt,
  className 
}: PaymentCardProps) {
  const dueDate = new Date(installment.dueDate);
  const isOverdue = installment.status === 'overdue' || (installment.status === 'pending' && isPast(dueDate) && !isToday(dueDate));
  const isDueSoon = installment.status === 'pending' && isBefore(dueDate, addDays(new Date(), 7));
  
  const formatAmount = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    failed: 'Failed',
  };

  return (
    <div className={cn(
      'bento-card',
      isOverdue && 'border-destructive/50 bg-destructive/5',
      isDueSoon && !isOverdue && 'border-warning/50 bg-warning/5',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">
              {installment.installmentNumber === 0 ? 'Down Payment' : `Installment #${installment.installmentNumber}`}
            </h4>
            {plotNumber && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {plotNumber}
              </span>
            )}
          </div>
        </div>
        <StatusBadge variant={getPaymentStatusVariant(isOverdue ? 'overdue' : installment.status)}>
          {statusLabels[isOverdue ? 'overdue' : installment.status]}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            installment.status === 'paid' ? 'bg-success/10' : 'bg-primary/10'
          )}>
            <CreditCard className={cn(
              'w-4 h-4',
              installment.status === 'paid' ? 'text-success' : 'text-primary'
            )} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-semibold">{formatAmount(installment.amount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            isOverdue ? 'bg-destructive/10' : isDueSoon ? 'bg-warning/10' : 'bg-muted'
          )}>
            <Calendar className={cn(
              'w-4 h-4',
              isOverdue ? 'text-destructive' : isDueSoon ? 'text-warning' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {installment.status === 'paid' ? 'Paid On' : 'Due Date'}
            </p>
            <p className={cn(
              'text-sm font-medium',
              isOverdue && 'text-destructive'
            )}>
              {format(installment.status === 'paid' && installment.paidDate 
                ? new Date(installment.paidDate) 
                : dueDate, 
                'MMM d, yyyy'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t">
        {installment.status === 'paid' && installment.receiptUri && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={onViewReceipt}
          >
            <Receipt className="w-4 h-4 mr-1.5" />
            View Receipt
          </Button>
        )}
        {(installment.status === 'pending' || installment.status === 'overdue') && (
          <Button 
            variant={isOverdue ? 'destructive' : 'default'} 
            size="sm" 
            className="flex-1"
            onClick={onPayNow}
          >
            Pay Now
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface PaymentRowProps {
  installment: PaymentInstallment;
  onPayNow?: () => void;
  onViewReceipt?: () => void;
}

export function PaymentRow({ installment, onPayNow, onViewReceipt }: PaymentRowProps) {
  const dueDate = new Date(installment.dueDate);
  const isOverdue = installment.status === 'overdue' || (installment.status === 'pending' && isPast(dueDate) && !isToday(dueDate));
  
  const formatAmount = (amount: number) => `PKR ${amount.toLocaleString()}`;

  return (
    <div className={cn(
      'flex items-center justify-between py-3 px-4 rounded-lg transition-colors',
      'hover:bg-muted/50',
      isOverdue && 'bg-destructive/5'
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
          installment.status === 'paid' && 'bg-success/10 text-success',
          installment.status === 'pending' && 'bg-primary/10 text-primary',
          (installment.status === 'overdue' || isOverdue) && 'bg-destructive/10 text-destructive',
          installment.status === 'failed' && 'bg-destructive/10 text-destructive'
        )}>
          {installment.installmentNumber === 0 ? 'DP' : `#${installment.installmentNumber}`}
        </div>
        <div>
          <p className="font-medium text-sm">
            {installment.installmentNumber === 0 ? 'Down Payment' : `Installment ${installment.installmentNumber}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {installment.status === 'paid' 
              ? `Paid on ${format(new Date(installment.paidDate!), 'MMM d, yyyy')}`
              : `Due ${format(dueDate, 'MMM d, yyyy')}`
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-semibold text-sm">{formatAmount(installment.amount)}</p>
        <StatusBadge variant={getPaymentStatusVariant(isOverdue ? 'overdue' : installment.status)}>
          {installment.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
        </StatusBadge>
        {installment.status === 'paid' && installment.receiptUri ? (
          <Button variant="ghost" size="sm" onClick={onViewReceipt}>
            <Receipt className="w-4 h-4" />
          </Button>
        ) : (installment.status === 'pending' || installment.status === 'overdue') ? (
          <Button 
            variant={isOverdue ? 'destructive' : 'outline'} 
            size="sm"
            onClick={onPayNow}
          >
            Pay
          </Button>
        ) : null}
      </div>
    </div>
  );
}
