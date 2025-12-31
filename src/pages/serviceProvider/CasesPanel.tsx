import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { StatusBadge, getCaseStatusVariant } from '@/components/ui/status-badge';
import { CaseCard } from '@/components/cards/CaseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  mockPlots, mockPlaces, mockFailedPayments, mockPurchases, mockPaymentInstallments 
} from '@/data/mockData';
import { 
  Search, Scale, AlertTriangle, CheckCircle2, Clock, Calendar as CalendarIcon,
  Filter, FileText, User, MapPin, Gavel, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CasesPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [fileCaseDialog, setFileCaseDialog] = useState(false);
  const [caseDetailsDialog, setCaseDetailsDialog] = useState(false);
  const [courtDate, setCourtDate] = useState<Date>();
  const [caseNotes, setCaseNotes] = useState('');

  // Get all failed payments with related data
  const casesWithDetails = mockFailedPayments.map(fp => {
    const plot = mockPlots.find(p => p.plotId === fp.plotId);
    const place = mockPlaces.find(p => p.placeId === plot?.placeId);
    const purchaser = mockPurchases.find(p => p.purchaseId === fp.purchaserId);
    return { ...fp, plot, place, purchaser };
  });

  // Get overdue payments that could become cases
  const potentialCases = mockPaymentInstallments
    .filter(i => i.status === 'overdue')
    .filter(i => !mockFailedPayments.some(f => f.installmentId === i.installmentId))
    .map(i => {
      const schedule = mockPaymentInstallments.find(s => s.installmentId === i.installmentId);
      // For demo purposes, get associated plot
      const plot = mockPlots.find(p => p.plotId === 'plot-003'); // Using demo plot
      const purchaser = mockPurchases.find(p => p.purchaseId === plot?.purchaserId);
      return { installment: i, plot, purchaser };
    });

  // Filter cases
  const filteredCases = casesWithDetails.filter(c => {
    const matchesSearch = 
      c.plot?.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.purchaser?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.caseStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const filedCases = casesWithDetails.filter(c => c.caseId);
  const pendingCases = casesWithDetails.filter(c => !c.caseId);
  const inProgressCases = casesWithDetails.filter(c => c.caseStatus === 'in_progress');
  const resolvedCases = casesWithDetails.filter(c => c.caseStatus === 'resolved');

  const formatAmount = (amount: number) => `PKR ${amount.toLocaleString()}`;

  const handleFileCase = () => {
    if (!courtDate) {
      toast.error('Please select a court date');
      return;
    }
    toast.success('Case filed successfully!');
    setFileCaseDialog(false);
    setCourtDate(undefined);
    setCaseNotes('');
    setSelectedCase(null);
  };

  const handleUpdateCase = (status: string) => {
    toast.success(`Case status updated to ${status}`);
    setCaseDetailsDialog(false);
    setSelectedCase(null);
  };

  const maskCnic = (cnic: string) => cnic.replace(/(\d{5})-(\d{7})-(\d)/, '$1-*******-$3');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Cases Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage legal cases for failed payments (UC-08)
          </p>
        </div>

        {/* Stats */}
        <BentoGrid columns={4}>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xl font-bold">{filedCases.length}</p>
                <p className="text-xs text-muted-foreground">Filed Cases</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{potentialCases.length}</p>
                <p className="text-xs text-muted-foreground">Pending Filing</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-xl font-bold">{inProgressCases.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{resolvedCases.length}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by case ID, plot number, or purchaser..."
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
              <SelectItem value="filed">Filed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cases */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active Cases ({filedCases.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Filing ({potentialCases.length})</TabsTrigger>
            <TabsTrigger value="all">All Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <BentoGrid columns={2}>
              {filedCases.map(caseData => (
                <CaseCard
                  key={caseData.failedPaymentId}
                  failedPayment={caseData}
                  plot={caseData.plot}
                  purchaser={caseData.purchaser}
                  onViewDetails={() => { setSelectedCase(caseData); setCaseDetailsDialog(true); }}
                />
              ))}
            </BentoGrid>
            {filedCases.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active cases</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="space-y-3">
              {casesWithDetails.filter(c => !c.caseId).map(caseData => (
                <BentoCard key={caseData.failedPaymentId} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{caseData.plot?.plotNumber}</h3>
                        <StatusBadge variant="warning">Pending Case</StatusBadge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {caseData.purchaser?.fullName}
                        </span>
                        <span className="text-destructive font-medium">
                          {formatAmount(caseData.amount)} overdue
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => { setSelectedCase(caseData); setFileCaseDialog(true); }}
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    File Case
                  </Button>
                </BentoCard>
              ))}
              {casesWithDetails.filter(c => !c.caseId).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending cases to file</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <BentoGrid columns={2}>
              {filteredCases.map(caseData => (
                <CaseCard
                  key={caseData.failedPaymentId}
                  failedPayment={caseData}
                  plot={caseData.plot}
                  purchaser={caseData.purchaser}
                  onViewDetails={() => { setSelectedCase(caseData); setCaseDetailsDialog(true); }}
                  onFileCase={() => { setSelectedCase(caseData); setFileCaseDialog(true); }}
                />
              ))}
            </BentoGrid>
          </TabsContent>
        </Tabs>

        {/* File Case Dialog */}
        <Dialog open={fileCaseDialog} onOpenChange={setFileCaseDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>File Legal Case</DialogTitle>
              <DialogDescription>
                File a legal case against {selectedCase?.purchaser?.fullName} for Plot {selectedCase?.plot?.plotNumber}
              </DialogDescription>
            </DialogHeader>
            
            {selectedCase && (
              <div className="space-y-4 py-4">
                {/* Case Summary */}
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Purchaser</p>
                      <p className="font-medium">{selectedCase.purchaser?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CNIC</p>
                      <p className="font-medium">{maskCnic(selectedCase.purchaser?.cnic || '')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount Due</p>
                      <p className="font-bold text-destructive">{formatAmount(selectedCase.amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Original Due Date</p>
                      <p className="font-medium">{format(new Date(selectedCase.originalDueDate), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>

                {/* Court Date */}
                <div>
                  <Label>Court Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !courtDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {courtDate ? format(courtDate, "PPP") : "Select court date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={courtDate}
                        onSelect={setCourtDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Case Notes */}
                <div>
                  <Label>Case Notes</Label>
                  <Textarea
                    className="mt-1"
                    placeholder="Add any relevant notes about this case..."
                    value={caseNotes}
                    onChange={(e) => setCaseNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Warning */}
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm text-warning flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Filing a case will mark the plot as "On Hold" and notify the purchaser.
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setFileCaseDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleFileCase}>
                <Gavel className="w-4 h-4 mr-2" />
                File Case
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Case Details Dialog */}
        <Dialog open={caseDetailsDialog} onOpenChange={setCaseDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Case Details - {selectedCase?.caseId}</DialogTitle>
              <DialogDescription>
                View and manage case for Plot {selectedCase?.plot?.plotNumber}
              </DialogDescription>
            </DialogHeader>
            
            {selectedCase && (
              <div className="space-y-4 py-4">
                {/* Case Status */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Case Status</p>
                    <div className="mt-1">
                      <StatusBadge variant={getCaseStatusVariant(selectedCase.caseStatus || 'filed')}>
                        {selectedCase.caseStatus?.charAt(0).toUpperCase() + selectedCase.caseStatus?.slice(1) || 'Filed'}
                      </StatusBadge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Court Date</p>
                    <p className="font-medium mt-1">
                      {selectedCase.courtDate && format(new Date(selectedCase.courtDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Filed On</p>
                    <p className="font-medium mt-1">
                      {selectedCase.filedAt && format(new Date(selectedCase.filedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Purchaser & Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Purchaser Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{selectedCase.purchaser?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CNIC</span>
                        <span className="font-medium">{maskCnic(selectedCase.purchaser?.cnic || '')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{selectedCase.purchaser?.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <h4 className="font-medium mb-2 text-destructive">Amount Due</h4>
                    <p className="text-2xl font-bold text-destructive">{formatAmount(selectedCase.amount)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Original due: {format(new Date(selectedCase.originalDueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedCase.notes && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Case Notes</h4>
                    <p className="text-sm">{selectedCase.notes}</p>
                  </div>
                )}

                {/* Update Status */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Update Status:</span>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateCase('in_progress')}>
                    In Progress
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateCase('resolved')}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Resolved
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleUpdateCase('dismissed')}>
                    Dismissed
                  </Button>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCaseDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
