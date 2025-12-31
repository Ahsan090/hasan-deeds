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
  Clock, TrendingUp, ChevronRight, ClipboardList, FolderOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ServiceProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculate stats
  const pendingVerifications = mockPlotDetails.filter(d => d.verificationStatus === 'pending').length;
  const overduePayments = mockPaymentInstallments.filter(i => i.status === 'overdue').length;
  const activeCases = mockFailedPayments.filter(f => f.caseId).length;
  const pendingCases = mockFailedPayments.filter(f => !f.caseId).length;
  const totalRevenue = mockPaymentInstallments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const totalPlots = mockPlots.length;
  const activePurchasers = mockPurchases.length;
  const pendingDocuments = mockPlotDetails.filter(d => 
    d.verificationStatus === 'verified' && (!d.allotmentDocUri || !d.allocationDocUri)
  ).length;

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} Lac`;
    return amount.toLocaleString();
  };

  // Recent pending applications
  const pendingApplications = mockPlotDetails
    .filter(d => d.verificationStatus === 'pending')
    .slice(0, 3)
    .map(d => {
      const plot = mockPlots.find(p => p.plotId === d.plotId);
      const purchaser = mockPurchases.find(p => p.purchaseId === plot?.purchaserId);
      return { ...d, plot, purchaser };
    });

  // Upcoming due payments
  const upcomingPayments = mockPaymentInstallments
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .slice(0, 5)
    .map(i => {
      const schedule = mockPaymentSchedules.find(s => s.scheduleId === i.scheduleId);
      const plot = mockPlots.find(p => p.plotId === schedule?.plotId);
      const purchaser = mockPurchases.find(p => p.purchaseId === plot?.purchaserId);
      return { ...i, plot, purchaser };
    });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Service Provider Dashboard - Overview of all operations</p>
        </div>

        {/* Quick Stats */}
        <BentoGrid columns={4}>
          <BentoCard interactive onClick={() => navigate('/service-provider/work-queue')}>
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
          
          <BentoCard interactive onClick={() => navigate('/service-provider/payments')}>
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
          
          <BentoCard interactive onClick={() => navigate('/service-provider/cases')}>
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

        {/* Secondary Stats */}
        <BentoGrid columns={4}>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{totalPlots}</p>
                <p className="text-xs text-muted-foreground">Total Plots</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold">{activePurchasers}</p>
                <p className="text-xs text-muted-foreground">Active Purchasers</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-xl font-bold">{pendingDocuments}</p>
                <p className="text-xs text-muted-foreground">Pending Issuance</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{pendingCases}</p>
                <p className="text-xs text-muted-foreground">Pending Cases</p>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Applications */}
          <BentoCard>
            <BentoCardHeader 
              title="Pending Applications"
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/service-provider/work-queue')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              }
            />
            {pendingApplications.length > 0 ? (
              <div className="space-y-3">
                {pendingApplications.map(app => (
                  <div 
                    key={app.plotDetailsId} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate('/service-provider/work-queue')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{app.plot?.plotNumber}</p>
                        <p className="text-xs text-muted-foreground">{app.purchaser?.fullName}</p>
                      </div>
                    </div>
                    <StatusBadge variant="warning">Pending</StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No pending applications</p>
            )}
          </BentoCard>

          {/* Active Cases */}
          <BentoCard>
            <BentoCardHeader 
              title="Active Cases"
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/service-provider/cases')}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              }
            />
            {mockFailedPayments.length > 0 ? (
              <div className="space-y-4">
                {mockFailedPayments.slice(0, 2).map(fp => {
                  const plot = mockPlots.find(p => p.plotId === fp.plotId);
                  const purchaser = mockPurchases.find(p => p.purchaseId === fp.purchaserId);
                  return (
                    <CaseCard 
                      key={fp.failedPaymentId} 
                      failedPayment={fp} 
                      plot={plot} 
                      purchaser={purchaser}
                      onViewDetails={() => navigate('/service-provider/cases')}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No active cases</p>
            )}
          </BentoCard>
        </div>

        {/* Recent Activity */}
        <BentoCard>
          <BentoCardHeader 
            title="Recent Activity"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/service-provider/audit-log')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            }
          />
          <AuditTimeline entries={mockAuditLog.slice(0, 5)} />
        </BentoCard>
      </div>
    </AppLayout>
  );
}
