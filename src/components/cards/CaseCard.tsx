import { Scale, Calendar, MapPin, User, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FailedPayment, Plot, Purchase } from '@/types/entities';
import { StatusBadge, getCaseStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface CaseCardProps {
  failedPayment: FailedPayment;
  plot?: Plot;
  purchaser?: Purchase;
  onViewDetails?: () => void;
  onFileCase?: () => void;
  className?: string;
}

export function CaseCard({
  failedPayment,
  plot,
  purchaser,
  onViewDetails,
  onFileCase,
  className,
}: CaseCardProps) {
  const formatAmount = (amount: number) => `PKR ${amount.toLocaleString()}`;
  
  const caseStatusLabels = {
    filed: 'Case Filed',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
  };

  const hasCaseFiled = !!failedPayment.caseId;

  return (
    <div className={cn(
      'bento-card',
      hasCaseFiled && 'border-destructive/30 bg-destructive/5',
      className
    )}>
      {/* Alert Banner for filed cases */}
      {hasCaseFiled && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Legal Case Active</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">
            {hasCaseFiled ? `Case #${failedPayment.caseId}` : 'Failed Payment'}
          </h3>
          {plot && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              Plot {plot.plotNumber}
            </div>
          )}
        </div>
        {hasCaseFiled && failedPayment.caseStatus && (
          <StatusBadge variant={getCaseStatusVariant(failedPayment.caseStatus)}>
            {caseStatusLabels[failedPayment.caseStatus]}
          </StatusBadge>
        )}
      </div>

      {/* Purchaser Info */}
      {purchaser && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50">
          <User className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{purchaser.fullName}</p>
            <p className="text-xs text-muted-foreground mask-sensitive">{purchaser.cnic}</p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Amount Due</p>
          <p className="text-sm font-semibold text-destructive">{formatAmount(failedPayment.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Original Due Date</p>
          <p className="text-sm font-medium">{format(new Date(failedPayment.originalDueDate), 'MMM d, yyyy')}</p>
        </div>
        {hasCaseFiled && failedPayment.courtDate && (
          <>
            <div>
              <p className="text-xs text-muted-foreground">Court Date</p>
              <p className="text-sm font-medium">{format(new Date(failedPayment.courtDate), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Filed On</p>
              <p className="text-sm font-medium">
                {failedPayment.filedAt && format(new Date(failedPayment.filedAt), 'MMM d, yyyy')}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Notes */}
      {failedPayment.notes && (
        <div className="mb-4 p-2 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-sm">{failedPayment.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t">
        {!hasCaseFiled && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex-1"
            onClick={onFileCase}
          >
            <Scale className="w-4 h-4 mr-1.5" />
            File Case
          </Button>
        )}
        <Button 
          variant={hasCaseFiled ? 'default' : 'outline'} 
          size="sm" 
          className={cn(!hasCaseFiled && 'flex-1')}
          onClick={onViewDetails}
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

interface CaseRowProps {
  failedPayment: FailedPayment;
  plotNumber?: string;
  purchaserName?: string;
  onViewDetails?: () => void;
}

export function CaseRow({ failedPayment, plotNumber, purchaserName, onViewDetails }: CaseRowProps) {
  const formatAmount = (amount: number) => `PKR ${amount.toLocaleString()}`;
  
  const caseStatusLabels = {
    filed: 'Filed',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    dismissed: 'Dismissed',
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          failedPayment.caseId ? 'bg-destructive/10' : 'bg-warning/10'
        )}>
          <Scale className={cn(
            'w-5 h-5',
            failedPayment.caseId ? 'text-destructive' : 'text-warning'
          )} />
        </div>
        <div>
          <p className="font-medium text-sm">
            {failedPayment.caseId ? `Case #${failedPayment.caseId}` : 'Pending Case'}
          </p>
          <p className="text-xs text-muted-foreground">
            {plotNumber && `Plot ${plotNumber}`}
            {purchaserName && ` • ${purchaserName}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold text-sm text-destructive">{formatAmount(failedPayment.amount)}</p>
          {failedPayment.courtDate && (
            <p className="text-xs text-muted-foreground">
              Court: {format(new Date(failedPayment.courtDate), 'MMM d')}
            </p>
          )}
        </div>
        {failedPayment.caseStatus && (
          <StatusBadge variant={getCaseStatusVariant(failedPayment.caseStatus)}>
            {caseStatusLabels[failedPayment.caseStatus]}
          </StatusBadge>
        )}
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
