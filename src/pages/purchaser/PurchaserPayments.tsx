import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { PaymentRow } from '@/components/cards/PaymentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMyPayments, useMakePayment } from '@/hooks/usePayments';
import { PaymentInstallment } from '@/types/entities';
import { Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PurchaserPayments() {
  const navigate = useNavigate();
  const { data: paymentsResponse, isLoading } = useMyPayments();
  const paymentsData = paymentsResponse?.data || [];

  const [paymentDialog, setPaymentDialog] = useState<{
    open: boolean;
    installment?: PaymentInstallment & { calculatedInstallmentNumber: number };
  }>({ open: false });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const makePaymentMutation = useMakePayment();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Flatten the response to get a list of installments for the list view
  const allInstallments = paymentsData.flatMap(item =>
    item.installments.map((inst, index) => ({
      ...inst,
      schedule: item.schedule,
      calculatedInstallmentNumber: index
    }))
  );

  const pendingPayments = allInstallments.filter(i => i.status === 'pending' || i.status === 'overdue');
  const historyPayments = allInstallments.filter(i => i.status === 'paid');

  const handlePayNow = (installment: PaymentInstallment & { calculatedInstallmentNumber: number }) => {
    setPaymentDialog({ open: true, installment });
    setPaymentAmount(installment.balance.toString());
    setProofFile(null);
  };

  const handleViewReceipt = (installmentId: string) => {
    console.log('View receipt for:', installmentId);
    // TODO: Implement receipt viewing
  };

  const handleSubmitPayment = async () => {
    if (!paymentDialog.installment || !proofFile) {
      toast.error('Please upload payment proof');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await makePaymentMutation.mutateAsync({
        installmentId: paymentDialog.installment._id,
        amount,
        proofFile,
      });

      toast.success('Payment submitted successfully! Awaiting verification.');

      // Check for milestone achievement
      if (response?.data?.milestone) {
        const { percentage } = response.data.milestone;
        setTimeout(() => {
          toast.success(`Congratulations! You've reached the ${percentage}% payment milestone.`, {
            description: 'A new milestone document has been generated for you.',
            duration: 5000,
          });
        }, 1000);
      }

      setPaymentDialog({ open: false });
      setProofFile(null);
      setPaymentAmount('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit payment');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Track your payment history and upcoming dues
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Payments */}
          <BentoCard className="h-full">
            <BentoCardHeader
              title="Due Payments"
              subtitle={`${pendingPayments.length} pending`}
            />
            <div className="divide-y divide-border">
              {pendingPayments.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No pending payments.</p>
              ) : (
                pendingPayments.map((item) => (
                  <PaymentRow
                    key={item._id}
                    installment={item}
                    installmentNumber={item.calculatedInstallmentNumber}
                    onPayNow={() => handlePayNow(item)}
                  />
                ))
              )}
            </div>
          </BentoCard>

          {/* Payment History */}
          <BentoCard className="h-full">
            <BentoCardHeader
              title="Payment History"
              subtitle={`${historyPayments.length} completed`}
            />
            <div className="divide-y divide-border">
              {historyPayments.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No payment history.</p>
              ) : (
                historyPayments.map((item) => (
                  <PaymentRow
                    key={item._id}
                    installment={item}
                    installmentNumber={item.calculatedInstallmentNumber}
                    onViewReceipt={() => handleViewReceipt(item._id)}
                  />
                ))
              )}
            </div>
          </BentoCard>
        </div>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make Payment</DialogTitle>
              <DialogDescription>
                Submit payment for Installment #{paymentDialog.installment?.calculatedInstallmentNumber ?? 0}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount Due</span>
                  <span className="text-xl font-bold">
                    PKR {paymentDialog.installment?.balance.toLocaleString()}
                  </span>
                </div>
                {paymentDialog.installment?.dueDate && (
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span>
                      {format(new Date(paymentDialog.installment.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Payment Amount (PKR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-1.5"
                />
              </div>

              <div className="p-4 rounded-lg border border-dashed">
                <Label className="text-sm text-muted-foreground mb-3 block">
                  Upload payment proof (bank transfer receipt) *
                </Label>
                <div className="flex items-center gap-2">
                  {proofFile && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="paymentProof"
                  />
                  <Button variant="outline" className="w-full" asChild>
                    <label htmlFor="paymentProof" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {proofFile ? proofFile.name : 'Upload Receipt'}
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialog({ open: false })}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitPayment}
                disabled={makePaymentMutation.isPending || !proofFile}
              >
                {makePaymentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Payment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
