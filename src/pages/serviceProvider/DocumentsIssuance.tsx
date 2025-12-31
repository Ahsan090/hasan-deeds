import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoGrid, BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { MilestoneProgress } from '@/components/ui/milestone-progress';
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
import { 
  mockPlots, mockPlaces, mockPlotDetails, mockPurchases, calculateMilestone 
} from '@/data/mockData';
import { 
  Search, FileText, CheckCircle2, Clock, Download, Eye, Upload,
  FileCheck, FilePlus, Filter, User, MapPin, Printer
} from 'lucide-react';
import { toast } from 'sonner';

interface PlotDocumentData {
  plot: typeof mockPlots[0];
  place: typeof mockPlaces[0] | undefined;
  details: typeof mockPlotDetails[0] | undefined;
  purchaser: typeof mockPurchases[0] | undefined;
  milestone: { percentage: number; level: 0 | 10 | 50 | 75 | 100 };
}

export default function DocumentsIssuance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('all');
  const [selectedPlot, setSelectedPlot] = useState<PlotDocumentData | null>(null);
  const [issueDialog, setIssueDialog] = useState(false);
  const [issueDocType, setIssueDocType] = useState<string>('');
  const [viewDialog, setViewDialog] = useState(false);
  const [viewDocUri, setViewDocUri] = useState('');

  // Get all plots with document data
  const plotsWithDocs: PlotDocumentData[] = mockPlots
    .filter(p => p.status !== 'available')
    .map(plot => {
      const place = mockPlaces.find(p => p.placeId === plot.placeId);
      const details = mockPlotDetails.find(d => d.plotId === plot.plotId);
      const purchaser = mockPurchases.find(p => p.purchaseId === plot.purchaserId);
      const milestone = calculateMilestone(plot.plotId);
      return { plot, place, details, purchaser, milestone };
    });

  // Filter plots
  const filteredPlots = plotsWithDocs.filter(p => {
    const matchesSearch = 
      p.plot.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.purchaser?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMilestone = milestoneFilter === 'all' || p.milestone.level.toString() === milestoneFilter;
    return matchesSearch && matchesMilestone;
  });

  // Stats
  const readyForIssuance = plotsWithDocs.filter(p => {
    const m = p.milestone.level;
    const d = p.details;
    return (m >= 10 && !d?.allotmentDocUri) ||
           (m >= 50 && !d?.allocationDocUri) ||
           (m >= 75 && !d?.possessionDocUri) ||
           (m >= 100 && !d?.clearanceDocUri);
  });

  const fullyIssued = plotsWithDocs.filter(p => {
    const d = p.details;
    return d?.allotmentDocUri && d?.allocationDocUri && d?.possessionDocUri && d?.clearanceDocUri;
  });

  const docTypes = [
    { key: 'allotment', label: 'Allotment Letter', milestone: 10 },
    { key: 'allocation', label: 'Allocation Document', milestone: 50 },
    { key: 'possession', label: 'Possession Certificate', milestone: 75 },
    { key: 'clearance', label: 'Clearance Certificate', milestone: 100 },
  ];

  const handleIssueDocument = () => {
    toast.success(`${issueDocType} document generated and issued successfully!`);
    setIssueDialog(false);
    setIssueDocType('');
    setSelectedPlot(null);
  };

  const canIssueDoc = (plotData: PlotDocumentData, docMilestone: number, docUri?: string) => {
    return plotData.milestone.level >= docMilestone && !docUri;
  };

  const getDocStatus = (plotData: PlotDocumentData, docMilestone: number, docUri?: string) => {
    if (docUri) return 'issued';
    if (plotData.milestone.level >= docMilestone) return 'ready';
    return 'locked';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Documents & Issuance</h1>
          <p className="text-muted-foreground mt-1">
            Generate and issue milestone documents (UC-04 to UC-07)
          </p>
        </div>

        {/* Stats */}
        <BentoGrid columns={4}>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FilePlus className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{readyForIssuance.length}</p>
                <p className="text-xs text-muted-foreground">Ready for Issuance</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{fullyIssued.length}</p>
                <p className="text-xs text-muted-foreground">Fully Issued</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{plotsWithDocs.length}</p>
                <p className="text-xs text-muted-foreground">Total Plots</p>
              </div>
            </div>
          </BentoCard>
          <BentoCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {plotsWithDocs.filter(p => p.milestone.level === 100).length}
                </p>
                <p className="text-xs text-muted-foreground">100% Complete</p>
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
          <Select value={milestoneFilter} onValueChange={setMilestoneFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by milestone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Milestones</SelectItem>
              <SelectItem value="10">10% (Allotment)</SelectItem>
              <SelectItem value="50">50% (Allocation)</SelectItem>
              <SelectItem value="75">75% (Possession)</SelectItem>
              <SelectItem value="100">100% (Clearance)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plots with Documents */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pending Issuance ({readyForIssuance.length})</TabsTrigger>
            <TabsTrigger value="all">All Plots ({plotsWithDocs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <div className="space-y-4">
              {readyForIssuance.map(plotData => (
                <PlotDocumentRow 
                  key={plotData.plot.plotId}
                  plotData={plotData}
                  docTypes={docTypes}
                  onIssue={(docType) => { 
                    setSelectedPlot(plotData); 
                    setIssueDocType(docType); 
                    setIssueDialog(true); 
                  }}
                  onView={(uri) => { setViewDocUri(uri); setViewDialog(true); }}
                  canIssueDoc={canIssueDoc}
                  getDocStatus={getDocStatus}
                />
              ))}
              {readyForIssuance.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>All eligible documents have been issued</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-4">
              {filteredPlots.map(plotData => (
                <PlotDocumentRow 
                  key={plotData.plot.plotId}
                  plotData={plotData}
                  docTypes={docTypes}
                  onIssue={(docType) => { 
                    setSelectedPlot(plotData); 
                    setIssueDocType(docType); 
                    setIssueDialog(true); 
                  }}
                  onView={(uri) => { setViewDocUri(uri); setViewDialog(true); }}
                  canIssueDoc={canIssueDoc}
                  getDocStatus={getDocStatus}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Issue Document Dialog */}
        <Dialog open={issueDialog} onOpenChange={setIssueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue {issueDocType}</DialogTitle>
              <DialogDescription>
                Generate and issue {issueDocType} for Plot {selectedPlot?.plot.plotNumber}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlot && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Plot</p>
                      <p className="font-medium">{selectedPlot.plot.plotNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Purchaser</p>
                      <p className="font-medium">{selectedPlot.purchaser?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedPlot.place?.placeName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Milestone</p>
                      <p className="font-medium">{selectedPlot.milestone.percentage}% Complete</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-accent flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document will be generated with secure URI and stored in Plot Details.
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIssueDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleIssueDocument}>
                <Printer className="w-4 h-4 mr-2" />
                Generate & Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Document Dialog */}
        <Dialog open={viewDialog} onOpenChange={setViewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Document Viewer</DialogTitle>
              <DialogDescription>
                Secure document preview • Watermarked copy
              </DialogDescription>
            </DialogHeader>
            
            <div className="min-h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Document Preview</p>
                <p className="text-sm mt-1">Secure URI: {viewDocUri}</p>
                <div className="mt-4 flex gap-2 justify-center">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full
                  </Button>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function PlotDocumentRow({ 
  plotData, 
  docTypes, 
  onIssue, 
  onView,
  canIssueDoc,
  getDocStatus
}: {
  plotData: PlotDocumentData;
  docTypes: { key: string; label: string; milestone: number }[];
  onIssue: (docType: string) => void;
  onView: (uri: string) => void;
  canIssueDoc: (plotData: PlotDocumentData, milestone: number, uri?: string) => boolean;
  getDocStatus: (plotData: PlotDocumentData, milestone: number, uri?: string) => string;
}) {
  const getDocUri = (key: string) => {
    switch (key) {
      case 'allotment': return plotData.details?.allotmentDocUri;
      case 'allocation': return plotData.details?.allocationDocUri;
      case 'possession': return plotData.details?.possessionDocUri;
      case 'clearance': return plotData.details?.clearanceDocUri;
      default: return undefined;
    }
  };

  return (
    <BentoCard>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{plotData.plot.plotNumber}</h3>
              <StatusBadge variant={plotData.milestone.level === 100 ? 'completed' : 'active'}>
                {plotData.milestone.percentage}%
              </StatusBadge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {plotData.purchaser?.fullName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {plotData.place?.placeName}
              </span>
            </div>
          </div>
        </div>
        <div className="w-32">
          <MilestoneProgress 
            percentage={plotData.milestone.percentage}
            milestoneLevel={plotData.milestone.level}
            showLabels={false}
            size="sm"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-4 gap-3">
        {docTypes.map(doc => {
          const uri = getDocUri(doc.key);
          const status = getDocStatus(plotData, doc.milestone, uri);
          const canIssue = canIssueDoc(plotData, doc.milestone, uri);

          return (
            <div 
              key={doc.key}
              className={`p-3 rounded-lg border text-center ${
                status === 'issued' 
                  ? 'bg-success/10 border-success/30' 
                  : status === 'ready'
                    ? 'bg-warning/10 border-warning/30'
                    : 'bg-muted/50 border-border'
              }`}
            >
              <p className="text-xs font-medium text-muted-foreground">{doc.milestone}%</p>
              <p className="text-sm font-medium mt-1">{doc.label}</p>
              
              {status === 'issued' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 h-7 text-xs text-success"
                  onClick={() => onView(uri!)}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Issued
                </Button>
              )}
              {status === 'ready' && (
                <Button 
                  size="sm" 
                  className="mt-2 h-7 text-xs"
                  onClick={() => onIssue(doc.label)}
                >
                  <FilePlus className="w-3 h-3 mr-1" />
                  Issue
                </Button>
              )}
              {status === 'locked' && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BentoCard>
  );
}
