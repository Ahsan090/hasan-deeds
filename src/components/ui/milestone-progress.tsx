import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check } from 'lucide-react';

interface MilestoneProgressProps {
  percentage: number;
  milestoneLevel: 0 | 10 | 50 | 75 | 100;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const milestones = [
  { level: 10, label: 'Allotment', document: 'Allotment Document' },
  { level: 50, label: 'Allocation', document: 'Allocation Document' },
  { level: 75, label: 'Possession', document: 'Possession Document' },
  { level: 100, label: 'Clearance', document: 'Clearance Certificate' },
];

export function MilestoneProgress({ 
  percentage, 
  milestoneLevel, 
  showLabels = true,
  size = 'md',
  className 
}: MilestoneProgressProps) {
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const markerSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        {/* Track */}
        <div className={cn('milestone-track', sizeClasses[size])}>
          <div 
            className="milestone-fill gradient-milestone"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {/* Markers */}
        <div className="absolute inset-0 flex items-center">
          {milestones.map((m) => {
            const isCompleted = milestoneLevel >= m.level;
            const isActive = milestoneLevel === m.level;
            
            return (
              <Tooltip key={m.level}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'milestone-marker',
                      markerSizeClasses[size],
                      isCompleted ? 'bg-accent border-accent' : 'bg-card border-muted-foreground/30',
                      isActive && 'milestone-marker-active animate-pulse-glow'
                    )}
                    style={{ left: `${m.level}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    {isCompleted && (
                      <Check className="w-full h-full p-0.5 text-accent-foreground" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="font-medium">{m.level}% - {m.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isCompleted 
                      ? `${m.document} issued` 
                      : `Complete ${m.level}% payment to receive ${m.document}`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
      
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>0%</span>
          {milestones.map((m) => (
            <span 
              key={m.level}
              className={cn(
                milestoneLevel >= m.level && 'text-accent font-medium'
              )}
            >
              {m.level}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface MilestoneStepsProps {
  milestoneLevel: 0 | 10 | 50 | 75 | 100;
  className?: string;
}

export function MilestoneSteps({ milestoneLevel, className }: MilestoneStepsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {milestones.map((m, index) => {
        const isCompleted = milestoneLevel >= m.level;
        const isCurrent = milestoneLevel === m.level || 
          (milestoneLevel < m.level && (index === 0 || milestoneLevel >= milestones[index - 1].level));
        
        return (
          <div key={m.level} className="flex items-center">
            {index > 0 && (
              <div className={cn(
                'w-8 h-0.5 mx-1',
                isCompleted ? 'bg-accent' : 'bg-border'
              )} />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all',
                  isCompleted && 'bg-accent text-accent-foreground',
                  !isCompleted && isCurrent && 'bg-primary/10 text-primary border-2 border-primary',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : `${m.level}%`}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{m.label}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
