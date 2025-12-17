import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { PaymentRow } from '@/components/cards/PaymentCard';
import { MilestoneProgress } from '@/components/ui/milestone-progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  mockPlots, mockPlaces, mockPaymentSchedules, mockPaymentInstallments, 
  calculateMilestone 
} from '@/data/mockData';
import { 
  Search, CreditCard, Receipt, CheckCircle2, AlertTriangle, Clock,
  TrendingUp, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PurchaserPayments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; installment?: any }>({ open: false });
  const [receiptDialog, setReceiptDialog] = useState<{ open: boolean; installment?: any }>({ open: false });

  // Get purchaser's plots and payment data
  const purchaserPlots = mockPlots.filter(p => p.purchaserId === 'purchase-002');
  
  const plotPaymentData = purchaserPlots.map(plot => {
    const schedule = mockPaymentSchedules.find(s => s.plotId === plot.plotId);
    const installments = schedule 
      ? mockPaymentInstallments.filter(i => i.scheduleId === schedule.scheduleId)
      : [];
    const milestone = calculateMilestone(plot.plotId);
    const place = mockPlaces.find(p => p.placeId === plot.placeId);
    
    const paidAmount = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const pendingAmount = installments.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    
    return { plot, place, schedule, installments, milestone, paidAmount, pendingAmount };
  });

  // Calculate totals
  const totalPaid = plotPaymentData.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalPending = plotPaymentData.reduce((sum, d) => sum + d.pendingAmount, 0);
  const overdueCount = plotPaymentData.reduce((sum, d) => 
    sum + d.installments.filter(i => i.status === 'overdue').length, 0
  );

  const formatAmount = (amount: number) => `PKR ${amount.toLocaleString()}`;

  const handlePayNow = (installment: any) => {
    setPaymentDialog({ open: true, installment });
  };

  const handleViewReceipt = (installment: any) => {
    setReceiptDialog({ open: true, installment });
  };

  const processPayment = () => {
    toast.success('Payment processed successfully!');
    setPaymentDialog({ open: false });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Payment Schedule</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your payment installments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-lg font-bold text-success">{formatAmount(totalPaid)}</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-lg font-bold">{formatAmount(totalPending)}</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-lg font-bold text-destructive">{overdueCount} payments</p>
              </div>
            </div>
          </BentoCard>
          
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-lg font-bold">
                  {Math.round(plotPaymentData.reduce((sum, d) => sum + d.milestone.percentage, 0) / plotPaymentData.length)}%
                </p>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Payment Schedule by Plot */}
        <Accordion type="single" collapsible className="space-y-4">
          {plotPaymentData.map(({ plot, place, schedule, installments, milestone, paidAmount, pendingAmount }) => (
            <AccordionItem 
              key={plot.plotId} 
              value={plot.plotId}
              className="bento-card border rounded-xl overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-left">{plot.plotNumber}</h3>
                      <p className="text-sm text-muted-foreground text-left">
                        {place?.placeName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:block w-32">
                      <MilestoneProgress 
                        percentage={milestone.percentage}
                        milestoneLevel={milestone.level}
                        showLabels={false}
                        size="sm"
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{milestone.percentage}% paid</p>
                      <p className="text-xs text-muted-foreground">
                        {formatAmount(paidAmount)} of {formatAmount(schedule?.totalAmount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <div className="pt-4 border-t space-y-1">
                  {installments.map((installment) => (
                    <PaymentRow
                      key={installment.installmentId}
                      installment={installment}
                      onPayNow={() => handlePayNow(installment)}
                      onViewReceipt={() => handleViewReceipt(installment)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
              <DialogDescription>
                Complete your payment for {paymentDialog.installment?.installmentNumber === 0 
                  ? 'Down Payment' 
                  : `Installment #${paymentDialog.installment?.installmentNumber}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount Due</span>
                  <span className="text-xl font-bold">
                    {formatAmount(paymentDialog.installment?.amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>
                    {paymentDialog.installment?.dueDate && 
                      format(new Date(paymentDialog.installment.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground mb-3">
                  Upload payment proof (bank transfer receipt)
                </p>
                <Button variant="outline" className="w-full">
                  <Receipt className="w-4 h-4 mr-2" />
                  Upload Receipt
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialog({ open: false })}>
                Cancel
              </Button>
              <Button onClick={processPayment}>
                <CreditCard className="w-4 h-4 mr-2" />
                Submit Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Receipt Dialog */}
        <Dialog open={receiptDialog.open} onOpenChange={(open) => setReceiptDialog({ open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
              <DialogDescription>
                Receipt for {receiptDialog.installment?.installmentNumber === 0 
                  ? 'Down Payment' 
                  : `Installment #${receiptDialog.installment?.installmentNumber}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-6 rounded-lg bg-muted/50 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-3" />
                <p className="text-2xl font-bold">
                  {formatAmount(receiptDialog.installment?.amount || 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Paid on {receiptDialog.installment?.paidDate && 
                    format(new Date(receiptDialog.installment.paidDate), 'MMMM d, yyyy')}
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt ID</span>
                  <span className="font-mono">{receiptDialog.installment?.installmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span>Bank Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge variant="completed">Verified</StatusBadge>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setReceiptDialog({ open: false })}>
                Close
              </Button>
              <Button>
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
