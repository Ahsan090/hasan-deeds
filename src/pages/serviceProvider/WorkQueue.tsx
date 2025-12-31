import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  mockPlots, mockPlaces, mockPlotDetails, mockPurchases, mockPaymentSchedules 
} from '@/data/mockData';
import { 
  Search, Clock, CheckCircle2, XCircle, Eye, FileText, User, 
  MapPin, Calendar, ChevronRight, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ApplicationWithDetails {
  plotDetails: typeof mockPlotDetails[0];
  plot: typeof mockPlots[0] | undefined;
  place: typeof mockPlaces[0] | undefined;
  purchaser: typeof mockPurchases[0] | undefined;
}

export default function WorkQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [scheduleDialog, setScheduleDialog] = useState(false);

  // Get all applications with details
  const applications: ApplicationWithDetails[] = mockPlotDetails.map(pd => {
    const plot = mockPlots.find(p => p.plotId === pd.plotId);
    const place = mockPlaces.find(p => p.placeId === plot?.placeId);
    const purchaser = mockPurchases.find(p => p.purchaseId === plot?.purchaserId);
    return { plotDetails: pd, plot, place, purchaser };
  });

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.plot?.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.purchaser?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.plotDetails.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter(a => a.plotDetails.verificationStatus === 'pending').length;
  const verifiedCount = applications.filter(a => a.plotDetails.verificationStatus === 'verified').length;

  const handleVerify = () => {
    toast.success('Application verified successfully!');
    setVerifyDialog(false);
    setSelectedApp(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    toast.success('Application rejected');
    setRejectDialog(false);
    setRejectReason('');
    setSelectedApp(null);
  };

  const handleSetupSchedule = () => {
    toast.success('Payment schedule created successfully!');
    setScheduleDialog(false);
    setSelectedApp(null);
  };

  const maskCnic = (cnic: string) => {
    return cnic.replace(/(\d{5})-(\d{7})-(\d)/, '$1-*******-$3');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Work Queue</h1>
          <p className="text-muted-foreground mt-1">
            Manage new applications and pending verifications
          </p>
        </div>

        {/* Stats */}
        <BentoGrid columns={3}>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Verification</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{verifiedCount}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{applications.length}</p>
                <p className="text-xs text-muted-foreground">Total Applications</p>
              </div>
            </div>
          </BentoCard>
        </BentoGrid>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by plot number or purchaser name..."
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
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="all">All Applications ({applications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <div className="space-y-3">
              {filteredApps
                .filter(app => app.plotDetails.verificationStatus === 'pending')
                .map(app => (
                  <ApplicationRow 
                    key={app.plotDetails.plotDetailsId} 
                    app={app} 
                    onView={() => setSelectedApp(app)}
                    onVerify={() => { setSelectedApp(app); setVerifyDialog(true); }}
                    onReject={() => { setSelectedApp(app); setRejectDialog(true); }}
                    maskCnic={maskCnic}
                  />
                ))}
              {filteredApps.filter(a => a.plotDetails.verificationStatus === 'pending').length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending applications</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-3">
              {filteredApps.map(app => (
                <ApplicationRow 
                  key={app.plotDetails.plotDetailsId} 
                  app={app} 
                  onView={() => setSelectedApp(app)}
                  onVerify={() => { setSelectedApp(app); setVerifyDialog(true); }}
                  onReject={() => { setSelectedApp(app); setRejectDialog(true); }}
                  onSetupSchedule={() => { setSelectedApp(app); setScheduleDialog(true); }}
                  maskCnic={maskCnic}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Verify Dialog */}
        <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Verify Application</DialogTitle>
              <DialogDescription>
                Review and verify the application for Plot {selectedApp?.plot?.plotNumber}
              </DialogDescription>
            </DialogHeader>
            
            {selectedApp && (
              <div className="space-y-4 py-4">
                {/* Purchaser Details */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Purchaser Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedApp.purchaser?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CNIC</p>
                      <p className="font-medium">{maskCnic(selectedApp.purchaser?.cnic || '')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedApp.purchaser?.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedApp.purchaser?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Submitted Documents
                  </h4>
                  <div className="space-y-2">
                    {selectedApp.plotDetails.cnicCopyUri && (
                      <div className="flex items-center justify-between p-2 rounded bg-background">
                        <span className="text-sm">CNIC Copy</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </div>
                    )}
                    {selectedApp.plotDetails.bankStatementUri && (
                      <div className="flex items-center justify-between p-2 rounded bg-background">
                        <span className="text-sm">Bank Statement</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </div>
                    )}
                    {selectedApp.plotDetails.companyFormUri && (
                      <div className="flex items-center justify-between p-2 rounded bg-background">
                        <span className="text-sm">Company Form</span>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => { setVerifyDialog(false); setRejectDialog(true); }}>
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleVerify}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting the application for Plot {selectedApp?.plot?.plotNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Setup Payment Schedule Dialog */}
        <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Setup Payment Schedule</DialogTitle>
              <DialogDescription>
                Create payment schedule for Plot {selectedApp?.plot?.plotNumber}
              </DialogDescription>
            </DialogHeader>
            
            {selectedApp && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Plot Price</p>
                      <p className="text-lg font-bold">PKR {selectedApp.plot?.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Down Payment (10%)</p>
                      <p className="text-lg font-bold">PKR {((selectedApp.plot?.price || 0) * 0.1).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Installment Count</label>
                    <Select defaultValue="24">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="24">24 Months</SelectItem>
                        <SelectItem value="36">36 Months</SelectItem>
                        <SelectItem value="48">48 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monthly Amount</label>
                    <p className="text-lg font-bold mt-2">
                      PKR {(((selectedApp.plot?.price || 0) * 0.9) / 24).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSetupSchedule}>
                Create Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function ApplicationRow({ 
  app, 
  onView, 
  onVerify, 
  onReject,
  onSetupSchedule,
  maskCnic 
}: { 
  app: ApplicationWithDetails;
  onView: () => void;
  onVerify: () => void;
  onReject: () => void;
  onSetupSchedule?: () => void;
  maskCnic: (cnic: string) => string;
}) {
  const statusVariants = {
    pending: 'warning',
    verified: 'completed',
    rejected: 'overdue',
  } as const;

  const hasSchedule = mockPaymentSchedules.some(s => s.plotId === app.plot?.plotId);

  return (
    <div className="bento-card flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          app.plotDetails.verificationStatus === 'pending' 
            ? 'bg-warning/10' 
            : app.plotDetails.verificationStatus === 'verified'
              ? 'bg-success/10'
              : 'bg-destructive/10'
        }`}>
          {app.plotDetails.verificationStatus === 'pending' ? (
            <Clock className="w-6 h-6 text-warning" />
          ) : app.plotDetails.verificationStatus === 'verified' ? (
            <CheckCircle2 className="w-6 h-6 text-success" />
          ) : (
            <XCircle className="w-6 h-6 text-destructive" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{app.plot?.plotNumber}</h3>
            <StatusBadge variant={statusVariants[app.plotDetails.verificationStatus]}>
              {app.plotDetails.verificationStatus.charAt(0).toUpperCase() + app.plotDetails.verificationStatus.slice(1)}
            </StatusBadge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {app.purchaser?.fullName}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {app.place?.placeName}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {app.plotDetails.verificationStatus === 'pending' && (
          <>
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="w-4 h-4 mr-1" />
              Review
            </Button>
            <Button variant="destructive" size="sm" onClick={onReject}>
              <XCircle className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={onVerify}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Verify
            </Button>
          </>
        )}
        {app.plotDetails.verificationStatus === 'verified' && !hasSchedule && onSetupSchedule && (
          <Button size="sm" onClick={onSetupSchedule}>
            Setup Schedule
          </Button>
        )}
        {app.plotDetails.verificationStatus === 'verified' && hasSchedule && (
          <Button variant="ghost" size="sm" onClick={onView}>
            View <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
