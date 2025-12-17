import { AppLayout } from '@/components/layout/AppLayout';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { StatusBadge } from '@/components/ui/status-badge';
import { CaseCard } from '@/components/cards/CaseCard';
import { AuditTimeline } from '@/components/AuditLog';
import { Button } from '@/components/ui/button';
import { 
  mockPlots, mockPlaces, mockPaymentSchedules, mockPaymentInstallments, 
  mockFailedPayments, mockPurchases, mockPlotDetails, mockAuditLog
} from '@/data/mockData';
import { 
  Users, FileText, CreditCard, AlertTriangle, Scale, CheckCircle2,
  Clock, TrendingUp, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Calculate stats
  const pendingVerifications = mockPlotDetails.filter(d => d.verificationStatus === 'pending').length;
  const overduePayments = mockPaymentInstallments.filter(i => i.status === 'overdue').length;
  const activeCases = mockFailedPayments.filter(f => f.caseId).length;
  const totalRevenue = mockPaymentInstallments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} Lac`;
    return amount.toLocaleString();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all operations</p>
        </div>

        {/* Stats */}
        <BentoGrid columns={4}>
          <BentoCard interactive onClick={() => navigate('/admin/work-queue')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingVerifications}</p>
                <p className="text-sm text-muted-foreground">Pending Verifications</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard interactive onClick={() => navigate('/admin/payments')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overduePayments}</p>
                <p className="text-sm text-muted-foreground">Overdue Payments</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard interactive onClick={() => navigate('/admin/cases')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCases}</p>
                <p className="text-sm text-muted-foreground">Active Cases</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">PKR {formatAmount(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Total Collected</p>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Cases */}
          <BentoCard>
            <BentoCardHeader 
              title="Active Cases"
              action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/cases')}>View All <ChevronRight className="w-4 h-4 ml-1" /></Button>}
            />
            {mockFailedPayments.length > 0 ? (
              <div className="space-y-4">
                {mockFailedPayments.slice(0, 2).map(fp => {
                  const plot = mockPlots.find(p => p.plotId === fp.plotId);
                  const purchaser = mockPurchases.find(p => p.purchaseId === fp.purchaserId);
                  return (
                    <CaseCard key={fp.failedPaymentId} failedPayment={fp} plot={plot} purchaser={purchaser} />
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No active cases</p>
            )}
          </BentoCard>

          {/* Recent Activity */}
          <BentoCard>
            <BentoCardHeader 
              title="Recent Activity"
              action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/audit-log')}>View All <ChevronRight className="w-4 h-4 ml-1" /></Button>}
            />
            <AuditTimeline entries={mockAuditLog.slice(0, 5)} />
          </BentoCard>
        </div>
      </div>
    </AppLayout>
  );
}
