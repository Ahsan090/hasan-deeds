import { FileText, Download, Eye, Lock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type DocumentStatus = 'available' | 'pending' | 'locked';

interface DocumentCardProps {
  title: string;
  description?: string;
  documentUri?: string;
  status: DocumentStatus;
  milestoneRequired?: number;
  currentMilestone?: number;
  issuedDate?: string;
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function DocumentCard({
  title,
  description,
  documentUri,
  status,
  milestoneRequired,
  currentMilestone = 0,
  issuedDate,
  onView,
  onDownload,
  className,
}: DocumentCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'available':
        return 'Available for download';
      case 'pending':
        return 'Pending issuance';
      case 'locked':
        return milestoneRequired 
          ? `Requires ${milestoneRequired}% payment (${currentMilestone}% paid)`
          : 'Not yet available';
    }
  };

  return (
    <div className={cn(
      'document-card',
      status === 'locked' && 'opacity-60',
      className
    )}>
      <div className={cn(
        'w-12 h-12 rounded-lg flex items-center justify-center',
        status === 'available' && 'bg-success/10',
        status === 'pending' && 'bg-warning/10',
        status === 'locked' && 'bg-muted'
      )}>
        <FileText className={cn(
          'w-6 h-6',
          status === 'available' && 'text-success',
          status === 'pending' && 'text-warning',
          status === 'locked' && 'text-muted-foreground'
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{title}</h4>
          <Tooltip>
            <TooltipTrigger asChild>
              {getStatusIcon()}
            </TooltipTrigger>
            <TooltipContent>
              <p>{getStatusText()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        )}
        {issuedDate && status === 'available' && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Issued: {issuedDate}
          </p>
        )}
      </div>

      {status === 'available' && documentUri && (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onView}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDownload}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {status === 'locked' && milestoneRequired && (
        <div className="text-xs text-muted-foreground text-right">
          <p className="font-medium">{milestoneRequired}%</p>
          <p>required</p>
        </div>
      )}
    </div>
  );
}

interface DocumentListProps {
  documents: {
    title: string;
    description?: string;
    uri?: string;
    milestoneRequired: number;
  }[];
  currentMilestone: number;
  onView?: (uri: string) => void;
  onDownload?: (uri: string) => void;
}

export function DocumentList({ documents, currentMilestone, onView, onDownload }: DocumentListProps) {
  return (
    <div className="space-y-3">
      {documents.map((doc, index) => {
        const status: DocumentStatus = doc.uri 
          ? 'available' 
          : currentMilestone >= doc.milestoneRequired 
            ? 'pending' 
            : 'locked';
        
        return (
          <DocumentCard
            key={index}
            title={doc.title}
            description={doc.description}
            documentUri={doc.uri}
            status={status}
            milestoneRequired={doc.milestoneRequired}
            currentMilestone={currentMilestone}
            onView={doc.uri ? () => onView?.(doc.uri!) : undefined}
            onDownload={doc.uri ? () => onDownload?.(doc.uri!) : undefined}
          />
        );
      })}
    </div>
  );
}

interface UploadedDocumentCardProps {
  title: string;
  fileName?: string;
  uploadedAt?: string;
  status: 'uploaded' | 'verified' | 'rejected' | 'required';
  onView?: () => void;
  onUpload?: () => void;
  className?: string;
}

export function UploadedDocumentCard({
  title,
  fileName,
  uploadedAt,
  status,
  onView,
  onUpload,
  className,
}: UploadedDocumentCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'uploaded':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'required':
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const statusLabels = {
    verified: 'Verified',
    uploaded: 'Pending Review',
    rejected: 'Rejected',
    required: 'Required',
  };

  return (
    <div className={cn(
      'document-card',
      status === 'rejected' && 'border-destructive/50 bg-destructive/5',
      status === 'required' && 'border-dashed',
      className
    )}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        status === 'verified' && 'bg-success/10',
        status === 'uploaded' && 'bg-warning/10',
        status === 'rejected' && 'bg-destructive/10',
        status === 'required' && 'bg-muted'
      )}>
        <FileText className={cn(
          'w-5 h-5',
          status === 'verified' && 'text-success',
          status === 'uploaded' && 'text-warning',
          status === 'rejected' && 'text-destructive',
          status === 'required' && 'text-muted-foreground'
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{title}</h4>
          {getStatusIcon()}
        </div>
        {fileName && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{fileName}</p>
        )}
        {uploadedAt && (
          <p className="text-xs text-muted-foreground">Uploaded: {uploadedAt}</p>
        )}
        <span className={cn(
          'text-xs',
          status === 'verified' && 'text-success',
          status === 'uploaded' && 'text-warning',
          status === 'rejected' && 'text-destructive',
          status === 'required' && 'text-muted-foreground'
        )}>
          {statusLabels[status]}
        </span>
      </div>

      {(status === 'uploaded' || status === 'verified') && (
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="w-4 h-4" />
        </Button>
      )}
      
      {(status === 'required' || status === 'rejected') && (
        <Button variant="outline" size="sm" onClick={onUpload}>
          Upload
        </Button>
      )}
    </div>
  );
}
