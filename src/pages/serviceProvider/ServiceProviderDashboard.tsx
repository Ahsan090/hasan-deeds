import { AppLayout } from '@/components/layout/AppLayout';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import { useServiceProviderDashboard } from '@/hooks/useDashboard';
import {
  Clock, AlertTriangle, Scale, TrendingUp, FileText, Users,
  FolderOpen, ClipboardList, ChevronRight, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ServiceProviderDashboard() {
  const navigate = useNavigate();
  const { data: dashboardResponse, isLoading, error } = useServiceProviderDashboard();

  // Safely extract dashboard data
  const dashboardData = dashboardResponse?.data || {};

  // Log for debugging
  console.log('Dashboard Response:', dashboardResponse);
  console.log('Dashboard Data:', dashboardData);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive">Failed to load dashboard data</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const formatAmount = (amount: number | undefined) => {
    if (!amount) return '0';
    if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)} Lac`;
    return amount.toLocaleString();
  };

  // Safely extract numeric values
  const pendingVerifications = Number(dashboardData.pendingVerifications) || 0;
  const overduePayments = Number(dashboardData.overduePayments) || 0;
  const activeCases = Number(dashboardData.activeCases) || 0;
  const totalRevenue = Number(dashboardData.totalRevenue) || 0;
  const totalPlots = Number(dashboardData.totalPlots) || 0;
  const activePurchasers = Number(dashboardData.activePurchasers) || 0;
  const pendingDocuments = Number(dashboardData.pendingDocuments) || 0;
  const pendingCases = Number(dashboardData.pendingCases) || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Service Provider Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of all operations</p>
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

        {/* Quick Actions */}
        <BentoCard>
          <BentoCardHeader title="Quick Actions" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => navigate('/service-provider/work-queue')}>
              <Clock className="w-4 h-4 mr-2" />
              Verify Documents
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/service-provider/payments')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Check Payments
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/service-provider/documents')}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Issue Documents
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/service-provider/cases')}>
              <Scale className="w-4 h-4 mr-2" />
              Manage Cases
            </Button>
          </div>
        </BentoCard>
      </div>
    </AppLayout>
  );
}
