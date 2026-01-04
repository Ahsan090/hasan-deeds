import { AppLayout } from '@/components/layout/AppLayout';
import { BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import { usePlots } from '@/hooks/usePlots';
import { useCheckOverduePayments } from '@/hooks/usePayments';
import { Loader2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentsMonitor() {
  const { data: plotsResponse, isLoading } = usePlots();
  const plots = plotsResponse?.data || [];
  const checkOverdueMutation = useCheckOverduePayments();

  const handleCheckOverdue = async () => {
    try {
      const result = await checkOverdueMutation.mutateAsync();
      toast.success(`Checked overdue payments. ${result.data?.length || 0} marked as overdue.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check overdue payments');
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payments Monitor</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage payment statuses
            </p>
          </div>
          <Button onClick={handleCheckOverdue} disabled={checkOverdueMutation.isPending}>
            {checkOverdueMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Check Overdue
              </>
            )}
          </Button>
        </div>

        <BentoCard>
          <BentoCardHeader title="All Plots Payment Status" />
          {plots.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No plots found</p>
          ) : (
            <div className="divide-y divide-border">
              {plots.map((plot) => (
                <div key={plot._id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Plot {plot.plotNumber}</p>
                    <p className="text-sm text-muted-foreground">{plot.location}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Value: PKR {plot.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {plot.status === 'sold' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">Paid</span>
                      </>
                    ) : plot.status === 'reserved' ? (
                      <>
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-sm text-warning">In Progress</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">No Schedule</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </BentoCard>
      </div>
    </AppLayout>
  );
}
