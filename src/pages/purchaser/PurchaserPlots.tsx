import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { PlotCard } from '@/components/cards/PlotCard';
import { StatusBadge, getPlotStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  mockPlots, mockPlaces, mockPlotDetails, calculateMilestone 
} from '@/data/mockData';
import { 
  Search, Filter, Plus, MapPin, Maximize2, Tag, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PurchaserPlots() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [placeFilter, setPlaceFilter] = useState<string>('all');

  // Get purchaser's plots
  const purchaserPlots = mockPlots.filter(p => p.purchaserId === 'purchase-002');
  
  // Available plots for new applications
  const availablePlots = mockPlots.filter(p => p.status === 'available');

  // Filter plots
  const filteredPlots = purchaserPlots.filter(plot => {
    const matchesSearch = plot.plotNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plot.status === statusFilter;
    const matchesPlace = placeFilter === 'all' || plot.placeId === placeFilter;
    return matchesSearch && matchesStatus && matchesPlace;
  });

  const statusLabels: Record<string, string> = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
    on_hold: 'On Hold',
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Plots</h1>
            <p className="text-muted-foreground mt-1">
              Manage your plot applications and track progress
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by plot number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={placeFilter} onValueChange={setPlaceFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {mockPlaces.map((place) => (
                <SelectItem key={place.placeId} value={place.placeId}>
                  {place.placeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* My Plots Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Your Plots ({filteredPlots.length})
          </h2>
          
          {filteredPlots.length === 0 ? (
            <BentoCard className="text-center py-12">
              <div className="text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No plots found</p>
                <p className="text-sm mt-1">
                  {searchTerm || statusFilter !== 'all' || placeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Apply for a new plot to get started'}
                </p>
              </div>
            </BentoCard>
          ) : (
            <BentoGrid columns={3}>
              {filteredPlots.map((plot) => {
                const place = mockPlaces.find(p => p.placeId === plot.placeId);
                return (
                  <PlotCard
                    key={plot.plotId}
                    plot={plot}
                    place={place}
                    onClick={() => navigate(`/purchaser/plots/${plot.plotId}`)}
                  />
                );
              })}
            </BentoGrid>
          )}
        </div>

        {/* Available Plots Section */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Available Plots</h2>
              <p className="text-sm text-muted-foreground">
                Browse and apply for new plots
              </p>
            </div>
          </div>

          <BentoGrid columns={3}>
            {availablePlots.map((plot) => {
              const place = mockPlaces.find(p => p.placeId === plot.placeId);
              return (
                <BentoCard 
                  key={plot.plotId}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/purchaser/apply/${plot.plotId}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{plot.plotNumber}</h3>
                      {place && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {place.placeName}
                        </div>
                      )}
                    </div>
                    <StatusBadge variant="active">Available</StatusBadge>
                  </div>

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
                        <p className="text-sm font-medium">
                          {plot.price >= 10000000 
                            ? `PKR ${(plot.price / 10000000).toFixed(1)} Cr`
                            : `PKR ${(plot.price / 100000).toFixed(1)} Lac`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply Now
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </BentoCard>
              );
            })}
          </BentoGrid>
        </div>
      </div>
    </AppLayout>
  );
}
