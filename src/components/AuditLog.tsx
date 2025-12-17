import { cn } from '@/lib/utils';
import { AuditLogEntry } from '@/types/entities';
import { format } from 'date-fns';
import { 
  FileText, CreditCard, Scale, CheckCircle2, AlertTriangle, 
  User, Settings, Clock, ArrowRight
} from 'lucide-react';

const actionIcons: Record<string, typeof FileText> = {
  PLOT_APPLICATION_SUBMITTED: FileText,
  DOCUMENTS_VERIFIED: CheckCircle2,
  PAYMENT_SCHEDULE_CREATED: Settings,
  PAYMENT_RECEIVED: CreditCard,
  MILESTONE_REACHED: CheckCircle2,
  DOCUMENT_ISSUED: FileText,
  PAYMENT_OVERDUE: AlertTriangle,
  FAILED_PAYMENT_CREATED: AlertTriangle,
  CASE_FILED: Scale,
  PLOT_STATUS_CHANGED: Settings,
};

const actionColors: Record<string, string> = {
  PLOT_APPLICATION_SUBMITTED: 'bg-info/10 text-info',
  DOCUMENTS_VERIFIED: 'bg-success/10 text-success',
  PAYMENT_SCHEDULE_CREATED: 'bg-primary/10 text-primary',
  PAYMENT_RECEIVED: 'bg-success/10 text-success',
  MILESTONE_REACHED: 'bg-accent/10 text-accent',
  DOCUMENT_ISSUED: 'bg-info/10 text-info',
  PAYMENT_OVERDUE: 'bg-warning/10 text-warning',
  FAILED_PAYMENT_CREATED: 'bg-destructive/10 text-destructive',
  CASE_FILED: 'bg-destructive/10 text-destructive',
  PLOT_STATUS_CHANGED: 'bg-warning/10 text-warning',
};

interface AuditTimelineProps {
  entries: AuditLogEntry[];
  className?: string;
}

export function AuditTimeline({ entries, className }: AuditTimelineProps) {
  return (
    <div className={cn('audit-timeline', className)}>
      {entries.map((entry, index) => {
        const Icon = actionIcons[entry.action] || Settings;
        const colorClass = actionColors[entry.action] || 'bg-muted text-muted-foreground';
        
        return (
          <div key={entry.auditId} className="audit-item">
            <div className={cn(
              'absolute left-[-1.375rem] top-1 w-3 h-3 rounded-full ring-4 ring-background',
              colorClass.split(' ')[0].replace('/10', '')
            )} />
            
            <div className="ml-2">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  colorClass
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground">
                      {formatActionName(entry.action)}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {entry.details}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{entry.performedBy === 'system' ? 'System' : entry.performedBy}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded capitalize">
                      {entry.performedByRole.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatActionName(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

interface AuditTableRowProps {
  entry: AuditLogEntry;
}

export function AuditTableRow({ entry }: AuditTableRowProps) {
  const Icon = actionIcons[entry.action] || Settings;
  const colorClass = actionColors[entry.action] || 'bg-muted text-muted-foreground';
  
  return (
    <tr className="data-table-row">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">{formatActionName(entry.action)}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {entry.entityType}
      </td>
      <td className="py-3 px-4 text-sm max-w-[300px] truncate">
        {entry.details}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 text-sm">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          {entry.performedBy === 'system' ? 'System' : entry.performedBy}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
        {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
      </td>
    </tr>
  );
}
