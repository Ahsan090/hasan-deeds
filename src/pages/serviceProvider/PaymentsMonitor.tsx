import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { StatusBadge, getPaymentStatusVariant } from '@/components/ui/status-badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  mockPlots, mockPlaces, mockPaymentSchedules, mockPaymentInstallments, 
  mockPurchases, mockFailedPayments 
} from '@/data/mockData';
import { 
  Search, Clock, CheckCircle2, AlertTriangle, CreditCard, 
  Calendar, User, Bell, TrendingUp, Filter, ChevronRight, Send
} from 'lucide-react';
import { format, isPast, addDays, isBefore } from 'date-fns';
import { toast } from 'sonner';

export default function PaymentsMonitor() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');

  // Get all payments with related data
  const paymentsWithDetails = mockPaymentInstallments.map(installment => {
    const schedule = mockPaymentSchedules.find(s => s.scheduleId === installment.scheduleId);
    const plot = mockPlots.find(p => p.plotId === schedule?.plotId);
    const place = mockPlaces.find(p => p.placeId === plot?.placeId);
    const purchaser = mockPurchases.find(p => p.purchaseId === plot?.purchaserId);
    const failedPayment = mockFailedPayments.find(f => f.installmentId === installment.installmentId);
    return { installment, schedule, plot, place, purchaser, failedPayment };
  });

  // Filter payments
  const filteredPayments = paymentsWithDetails.filter(p => {
    const matchesSearch = 
      p.plot?.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.purchaser?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.installment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const pendingPayments = paymentsWithDetails.filter(p => p.installment.status === 'pending');
  const overduePayments = paymentsWithDetails.filter(p => p.installment.status === 'overdue');
  const paidPayments = paymentsWithDetails.filter(p => p.installment.status === 'paid');
  const failedPayments = paymentsWithDetails.filter(p => p.failedPayment);

  const upcomingPayments = pendingPayments.filter(p => {
    const dueDate = new Date(p.installment.dueDate);
    return isBefore(dueDate, addDays(new Date(), 7));
  });

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.installment.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.installment.amount, 0);
  const totalCollected = paidPayments.reduce((sum, p) => sum + p.installment.amount, 0);

  const formatAmount = (amount: number) => `PKR ${amount.toLocaleString()}`;

  const handleSendReminder = () => {
    toast.success('Reminder sent successfully!');
    setReminderDialog(false);
    setReminderMessage('');
    setSelectedPayment(null);
  };

  const maskCnic = (cnic: string) => cnic.replace(/(\d{5})-(\d{7})-(\d)/, '$1-*******-$3');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Payments Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all payment installments
          </p>
        </div>

        {/* Stats */}
        <BentoGrid columns={4}>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatAmount(totalPending)}</p>
                <p className="text-xs text-muted-foreground">Pending ({pendingPayments.length})</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-bold text-destructive">{formatAmount(totalOverdue)}</p>
                <p className="text-xs text-muted-foreground">Overdue ({overduePayments.length})</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold text-success">{formatAmount(totalCollected)}</p>
                <p className="text-xs text-muted-foreground">Collected ({paidPayments.length})</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-lg font-bold">{upcomingPayments.length}</p>
                <p className="text-xs text-muted-foreground">Due Within 7 Days</p>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by plot number or purchaser..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table */}
        <Tabs defaultValue="overdue" className="w-full">
          <TabsList>
            <TabsTrigger value="overdue" className="text-destructive">
              Overdue ({overduePayments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Payments ({paymentsWithDetails.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overdue" className="mt-4">
            <BentoCard className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plot</TableHead>
                    <TableHead>Purchaser</TableHead>
                    <TableHead>Installment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overduePayments.map(p => (
                    <TableRow key={p.installment.installmentId}>
                      <TableCell className="font-medium">{p.plot?.plotNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{p.purchaser?.fullName}</p>
                          <p className="text-xs text-muted-foreground">{p.purchaser?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.installment.installmentNumber === 0 
                          ? 'Down Payment' 
                          : `#${p.installment.installmentNumber}`}
                      </TableCell>
                      <TableCell className="font-semibold text-destructive">
                        {formatAmount(p.installment.amount)}
                      </TableCell>
                      <TableCell>{format(new Date(p.installment.dueDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <StatusBadge variant="overdue">Overdue</StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => { setSelectedPayment(p); setReminderDialog(true); }}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          Remind
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {overduePayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No overdue payments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </BentoCard>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4">
            <BentoCard className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plot</TableHead>
                    <TableHead>Purchaser</TableHead>
                    <TableHead>Installment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingPayments.map(p => (
                    <TableRow key={p.installment.installmentId}>
                      <TableCell className="font-medium">{p.plot?.plotNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{p.purchaser?.fullName}</p>
                          <p className="text-xs text-muted-foreground">{p.purchaser?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.installment.installmentNumber === 0 
                          ? 'Down Payment' 
                          : `#${p.installment.installmentNumber}`}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatAmount(p.installment.amount)}
                      </TableCell>
                      <TableCell>{format(new Date(p.installment.dueDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <StatusBadge variant="warning">Due Soon</StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => { setSelectedPayment(p); setReminderDialog(true); }}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          Remind
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {upcomingPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No upcoming payments within 7 days
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </BentoCard>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <BentoCard className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plot</TableHead>
                    <TableHead>Purchaser</TableHead>
                    <TableHead>Installment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.slice(0, 20).map(p => (
                    <TableRow key={p.installment.installmentId}>
                      <TableCell className="font-medium">{p.plot?.plotNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{p.purchaser?.fullName}</p>
                          <p className="text-xs text-muted-foreground">{p.purchaser?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.installment.installmentNumber === 0 
                          ? 'Down Payment' 
                          : `#${p.installment.installmentNumber}`}
                      </TableCell>
                      <TableCell className={`font-semibold ${p.installment.status === 'overdue' ? 'text-destructive' : ''}`}>
                        {formatAmount(p.installment.amount)}
                      </TableCell>
                      <TableCell>
                        {p.installment.paidDate 
                          ? format(new Date(p.installment.paidDate), 'MMM d, yyyy')
                          : format(new Date(p.installment.dueDate), 'MMM d, yyyy')
                        }
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={getPaymentStatusVariant(p.installment.status)}>
                          {p.installment.status.charAt(0).toUpperCase() + p.installment.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        {p.installment.status !== 'paid' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setSelectedPayment(p); setReminderDialog(true); }}
                          >
                            <Bell className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </BentoCard>
          </TabsContent>
        </Tabs>

        {/* Send Reminder Dialog */}
        <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Payment Reminder</DialogTitle>
              <DialogDescription>
                Send an in-app reminder to {selectedPayment?.purchaser?.fullName} for their payment
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Plot</p>
                      <p className="font-medium">{selectedPayment.plot?.plotNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount Due</p>
                      <p className="font-bold text-destructive">{formatAmount(selectedPayment.installment.amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">{format(new Date(selectedPayment.installment.dueDate), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <StatusBadge variant={getPaymentStatusVariant(selectedPayment.installment.status)}>
                        {selectedPayment.installment.status.charAt(0).toUpperCase() + selectedPayment.installment.status.slice(1)}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Custom Message (Optional)</label>
                  <Textarea
                    className="mt-1"
                    placeholder="Add a personalized message to the reminder..."
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setReminderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReminder}>
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
