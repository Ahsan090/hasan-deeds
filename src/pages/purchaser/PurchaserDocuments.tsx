import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { DocumentList, UploadedDocumentCard } from '@/components/cards/DocumentCard';
import { MilestoneProgress } from '@/components/ui/milestone-progress';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  mockPlots, mockPlaces, mockPlotDetails, calculateMilestone 
} from '@/data/mockData';
import { 
  FileText, Download, Eye, Lock, CheckCircle2, AlertCircle, FolderOpen
} from 'lucide-react';

export default function PurchaserDocuments() {
  const [viewerDialog, setViewerDialog] = useState<{ open: boolean; title?: string; uri?: string }>({ open: false });

  // Get purchaser's plots
  const purchaserPlots = mockPlots.filter(p => p.purchaserId === 'purchase-002');
  
  const plotDocumentData = purchaserPlots.map(plot => {
    const details = mockPlotDetails.find(d => d.plotId === plot.plotId);
    const place = mockPlaces.find(p => p.placeId === plot.placeId);
    const milestone = calculateMilestone(plot.plotId);
    
    return { plot, place, details, milestone };
  });

  const handleViewDocument = (title: string, uri: string) => {
    setViewerDialog({ open: true, title, uri });
  };

  const handleDownloadDocument = (uri: string) => {
    // Simulate download
    console.log('Downloading:', uri);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Document Center</h1>
          <p className="text-muted-foreground mt-1">
            Access and manage all your plot-related documents
          </p>
        </div>

        {/* Documents by Plot */}
        {plotDocumentData.map(({ plot, place, details, milestone }) => (
          <BentoCard key={plot.plotId}>
            <BentoCardHeader 
              title={`Plot ${plot.plotNumber}`}
              subtitle={place?.placeName}
              action={
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {milestone.percentage}% Complete
                  </span>
                </div>
              }
            />
            
            {/* Milestone Progress */}
            <div className="mb-6">
              <MilestoneProgress 
                percentage={milestone.percentage}
                milestoneLevel={milestone.level}
                size="md"
              />
            </div>

            <Tabs defaultValue="issued" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="issued">Issued Documents</TabsTrigger>
                <TabsTrigger value="submitted">Submitted Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="issued" className="mt-4">
                <div className="grid gap-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Documents are issued as you reach payment milestones
                  </p>
                  <DocumentList
                    documents={[
                      { 
                        title: 'Allotment Letter', 
                        description: 'Plot allotment confirmation',
                        uri: details?.allotmentDocUri,
                        milestoneRequired: 10 
                      },
                      { 
                        title: 'Allocation Document', 
                        description: 'Official plot allocation',
                        uri: details?.allocationDocUri,
                        milestoneRequired: 50 
                      },
                      { 
                        title: 'Possession Certificate', 
                        description: 'Plot possession transfer',
                        uri: details?.possessionDocUri,
                        milestoneRequired: 75 
                      },
                      { 
                        title: 'Clearance Certificate', 
                        description: 'Final payment clearance',
                        uri: details?.clearanceDocUri,
                        milestoneRequired: 100 
                      },
                    ]}
                    currentMilestone={milestone.level}
                    onView={(uri) => handleViewDocument('Document', uri)}
                    onDownload={handleDownloadDocument}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="submitted" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Documents you've submitted for verification
                  </p>
                  <UploadedDocumentCard
                    title="CNIC Copy"
                    fileName="cnic_front_back.pdf"
                    uploadedAt="Jan 15, 2024"
                    status={details?.verificationStatus === 'verified' ? 'verified' : 'uploaded'}
                    onView={() => handleViewDocument('CNIC Copy', details?.cnicCopyUri || '')}
                  />
                  <UploadedDocumentCard
                    title="Bank Statement"
                    fileName="bank_statement_6months.pdf"
                    uploadedAt="Jan 15, 2024"
                    status={details?.verificationStatus === 'verified' ? 'verified' : 'uploaded'}
                    onView={() => handleViewDocument('Bank Statement', details?.bankStatementUri || '')}
                  />
                  {details?.companyFormUri && (
                    <UploadedDocumentCard
                      title="Company Form"
                      fileName="company_registration.pdf"
                      uploadedAt="Jan 15, 2024"
                      status={details?.verificationStatus === 'verified' ? 'verified' : 'uploaded'}
                      onView={() => handleViewDocument('Company Form', details?.companyFormUri || '')}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </BentoCard>
        ))}

        {/* No plots state */}
        {plotDocumentData.length === 0 && (
          <BentoCard className="text-center py-12">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-semibold">No Documents Yet</h2>
            <p className="text-muted-foreground mt-2">
              Apply for a plot to start receiving documents
            </p>
          </BentoCard>
        )}

        {/* Document Viewer Dialog */}
        <Dialog open={viewerDialog.open} onOpenChange={(open) => setViewerDialog({ open })}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{viewerDialog.title}</DialogTitle>
              <DialogDescription>
                Secure document viewer • Watermarked copy
              </DialogDescription>
            </DialogHeader>
            
            <div className="min-h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Document Preview</p>
                <p className="text-sm mt-1">
                  Secure URI: {viewerDialog.uri}
                </p>
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
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
