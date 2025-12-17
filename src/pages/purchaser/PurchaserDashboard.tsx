import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { MilestoneProgress, MilestoneSteps } from '@/components/ui/milestone-progress';
import { PlotCard } from '@/components/cards/PlotCard';
import { PaymentCard } from '@/components/cards/PaymentCard';
import { DocumentCard } from '@/components/cards/DocumentCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { 
  mockPlots, mockPlaces, mockPaymentSchedules, mockPaymentInstallments, 
  mockPlotDetails, getPlotWithDetails, calculateMilestone 
} from '@/data/mockData';
import { 
  ArrowRight, TrendingUp, FileText, CreditCard, AlertTriangle,
  CheckCircle2, Clock, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isBefore } from 'date-fns';

export default function PurchaserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get purchaser's plots (using mock data for Fatima Ali - purchase-002)
  const purchaserPlots = mockPlots.filter(p => p.purchaserId === 'purchase-002');
  
  // Get upcoming payments
  const upcomingPayments = mockPaymentInstallments
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .filter(i => {
      const schedule = mockPaymentSchedules.find(s => s.scheduleId === i.scheduleId);
      return purchaserPlots.some(p => p.plotId === schedule?.plotId);
    })
    .slice(0, 3);

  // Calculate statistics
  const totalPlots = purchaserPlots.length;
  const totalValue = purchaserPlots.reduce((sum, p) => sum + p.price, 0);
  const activePayments = upcomingPayments.length;

  // Get featured plot (first one)
  const featuredPlot = purchaserPlots[0];
  const featuredData = featuredPlot ? getPlotWithDetails(featuredPlot.plotId) : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your plots and payments
            </p>
          </div>
          <Button onClick={() => navigate('/purchaser/plots')}>
            Apply for New Plot
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Stats Cards */}
        <BentoGrid columns={4}>
          <BentoCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPlots}</p>
                <p className="text-sm text-muted-foreground">Active Plots</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(totalValue / 10000000).toFixed(1)} Cr
                </p>
                <p className="text-sm text-muted-foreground">Total Investment</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePayments}</p>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">25%</p>
                <p className="text-sm text-muted-foreground">Avg. Completion</p>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured Plot - Milestone Progress */}
          <div className="lg:col-span-2">
            {featuredData && featuredData.plot && (
              <BentoCard className="h-full">
                <BentoCardHeader 
                  title={`Plot ${featuredData.plot.plotNumber}`}
                  subtitle={featuredData.place?.placeName}
                  action={
                    <StatusBadge variant="active">
                      {featuredData.milestone.percentage}% Complete
                    </StatusBadge>
                  }
                />
                
                {/* Milestone Progress */}
                <div className="mb-6">
                  <MilestoneProgress 
                    percentage={featuredData.milestone.percentage}
                    milestoneLevel={featuredData.milestone.level}
                    size="lg"
                  />
                </div>

                {/* Milestone Steps */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { level: 10, label: 'Allotment', doc: featuredData.details?.allotmentDocUri },
                    { level: 50, label: 'Allocation', doc: featuredData.details?.allocationDocUri },
                    { level: 75, label: 'Possession', doc: featuredData.details?.possessionDocUri },
                    { level: 100, label: 'Clearance', doc: featuredData.details?.clearanceDocUri },
                  ].map((m) => {
                    const isCompleted = featuredData.milestone.level >= m.level;
                    const hasDoc = !!m.doc;
                    return (
                      <div 
                        key={m.level}
                        className={`p-3 rounded-lg border text-center ${
                          isCompleted ? 'bg-accent/10 border-accent' : 'bg-muted/50 border-border'
                        }`}
                      >
                        <p className={`text-xs font-medium ${isCompleted ? 'text-accent' : 'text-muted-foreground'}`}>
                          {m.level}%
                        </p>
                        <p className="text-sm font-medium mt-1">{m.label}</p>
                        {isCompleted && hasDoc && (
                          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-accent">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </div>
                        )}
                        {!isCompleted && (
                          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            Pending
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/purchaser/documents')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Documents
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => navigate('/purchaser/payments')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Make Payment
                  </Button>
                </div>
              </BentoCard>
            )}
          </div>

          {/* Upcoming Payments */}
          <div>
            <BentoCard className="h-full">
              <BentoCardHeader 
                title="Upcoming Payments"
                action={
                  <Button variant="ghost" size="sm" onClick={() => navigate('/purchaser/payments')}>
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                }
              />
              
              <div className="space-y-3">
                {upcomingPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending payments</p>
                  </div>
                ) : (
                  upcomingPayments.map((payment) => {
                    const schedule = mockPaymentSchedules.find(s => s.scheduleId === payment.scheduleId);
                    const plot = mockPlots.find(p => p.plotId === schedule?.plotId);
                    return (
                      <PaymentCard
                        key={payment.installmentId}
                        installment={payment}
                        plotNumber={plot?.plotNumber}
                        onPayNow={() => navigate('/purchaser/payments')}
                      />
                    );
                  })
                )}
              </div>
            </BentoCard>
          </div>
        </div>

        {/* My Plots Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Plots</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/purchaser/plots')}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <BentoGrid columns={3}>
            {purchaserPlots.map((plot) => {
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
        </div>
      </div>
    </AppLayout>
  );
}
