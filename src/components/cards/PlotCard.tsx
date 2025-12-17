import { MapPin, Maximize2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Plot, Place } from '@/types/entities';
import { StatusBadge, getPlotStatusVariant } from '@/components/ui/status-badge';
import { MilestoneProgress } from '@/components/ui/milestone-progress';
import { Button } from '@/components/ui/button';
import { calculateMilestone } from '@/data/mockData';

interface PlotCardProps {
  plot: Plot;
  place?: Place;
  onClick?: () => void;
  showMilestone?: boolean;
  className?: string;
}

export function PlotCard({ plot, place, onClick, showMilestone = true, className }: PlotCardProps) {
  const milestone = calculateMilestone(plot.plotId);
  
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `PKR ${(price / 100000).toFixed(1)} Lac`;
    }
    return `PKR ${price.toLocaleString()}`;
  };

  const statusLabels: Record<string, string> = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
    on_hold: 'On Hold',
  };

  return (
    <div 
      className={cn(
        'bento-card group',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground">
            {plot.plotNumber}
          </h3>
          {place && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {place.placeName}, {place.city}
            </div>
          )}
        </div>
        <StatusBadge variant={getPlotStatusVariant(plot.status)}>
          {statusLabels[plot.status]}
        </StatusBadge>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Maximize2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Size</p>
            <p className="text-sm font-medium">{plot.size} {plot.sizeUnit}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Tag className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-sm font-medium">{formatPrice(plot.price)}</p>
          </div>
        </div>
      </div>

      {/* Milestone Progress - Only for sold/reserved plots */}
      {showMilestone && (plot.status === 'sold' || plot.status === 'reserved' || plot.status === 'on_hold') && (
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Payment Progress</span>
            <span className="text-xs font-medium text-accent">{milestone.percentage}%</span>
          </div>
          <MilestoneProgress 
            percentage={milestone.percentage} 
            milestoneLevel={milestone.level}
            showLabels={false}
            size="sm"
          />
        </div>
      )}

      {/* Hover Action */}
      {onClick && (
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </div>
      )}
    </div>
  );
}
