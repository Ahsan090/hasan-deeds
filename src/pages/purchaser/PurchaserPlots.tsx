import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PlotCard } from '@/components/cards/PlotCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, MapPin } from 'lucide-react';
import { useMyPlots } from '@/hooks/usePlots';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

export default function PurchaserPlots() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: plotsResponse, isLoading } = useMyPlots();
  const plotsData = plotsResponse?.data || [];

  const filteredPlots = plotsData.filter(item => {
    const plot = item.plot;
    if (!plot) return false;

    const matchesSearch = plot.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plot.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plot.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Plots</h1>
            <p className="text-muted-foreground mt-1">
              Manage your active plots and view details
            </p>
          </div>
          <Button onClick={() => navigate('/purchaser/apply/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Apply for Plot
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by plot number or location..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <h2 className="text-lg font-semibold">
          Your Plots ({filteredPlots.length})
        </h2>

        {filteredPlots.length === 0 ? (
          <BentoCard className="text-center py-12">
            <div className="text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No plots found</p>
              <p className="text-sm mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Apply for a new plot to get started'}
              </p>
            </div>
          </BentoCard>
        ) : (
          <BentoGrid columns={3}>
            {filteredPlots.map((item) => (
              <PlotCard
                key={item.plot._id}
                plot={item.plot}
                onClick={() => navigate(`/purchaser/plots/${item.plot._id}`)}
              />
            ))}
          </BentoGrid>
        )}
      </div>
    </AppLayout>
  );
}
