import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoCard, BentoCardHeader, BentoGrid } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlot, useApplyPlot, usePlots } from '@/hooks/usePlots';
import { useUploadPlotDocuments } from '@/hooks/useDocuments';
import { PlotCard } from '@/components/cards/PlotCard';
import {
  ArrowLeft, MapPin, Maximize2, Tag, Upload, FileText,
  CheckCircle2, AlertCircle, ChevronRight, Loader2, Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function PlotApplication() {
  const { plotId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{
    plotMap?: File;
    cnicCopy?: File;
    bankStatement?: File;
    companyForm?: File;
  }>({});

  // Check if this is the initial plot selection screen
  const isSelectingPlot = plotId === 'new';

  // Fetch available plots when in selection mode
  const { data: availablePlotsResponse, isLoading: isLoadingPlots } = usePlots(
    isSelectingPlot ? { status: 'available' } : undefined
  );
  const availablePlots = isSelectingPlot ? availablePlotsResponse?.data || [] : [];

  // Fetch specific plot data when a plot is selected
  const { data: plotResponse, isLoading: isLoadingPlot } = usePlot(
    !isSelectingPlot && plotId ? plotId : ''
  );
  const plot = plotResponse?.data?.plot;

  // Mutations
  const applyMutation = useApplyPlot();
  const uploadDocsMutation = useUploadPlotDocuments(plotId || '');

  // Handle plot selection from available plots list
  const handleSelectPlot = (selectedPlotId: string) => {
    navigate(`/purchaser/apply/${selectedPlotId}`);
  };

  // Show available plots selection screen
  if (isSelectingPlot) {
    const filteredPlots = availablePlots.filter(p =>
      p.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <AppLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Browse Available Plots</h1>
              <p className="text-muted-foreground">
                Select a plot to apply for
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by plot number or location..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoadingPlots ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPlots.length === 0 ? (
            <BentoCard className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No Available Plots</h2>
              <p className="text-muted-foreground mt-2">
                {searchTerm ? 'Try adjusting your search' : 'No plots currently available for application'}
              </p>
            </BentoCard>
          ) : (
            <BentoGrid columns={3}>
              {filteredPlots.map((plot) => (
                <PlotCard
                  key={plot._id}
                  plot={plot}
                  onClick={() => handleSelectPlot(plot._id)}
                />
              ))}
            </BentoGrid>
          )}
        </div>
      </AppLayout>
    );
  }

  // Regular plot application flow
  const isLoading = isLoadingPlot;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!plot || plot.status !== 'available') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <BentoCard className="max-w-md text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold">Plot Not Available</h2>
            <p className="text-muted-foreground mt-2">
              This plot is either not available or doesn't exist.
            </p>
            <Button className="mt-4" onClick={() => navigate('/purchaser/apply/new')}>
              Browse Available Plots
            </Button>
          </BentoCard>
        </div>
      </AppLayout>
    );
  }

  const handleFileChange = (docType: keyof typeof uploadedFiles, file: File | null) => {
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [docType]: file }));
      toast.success(`${getDocumentLabel(docType)} selected`);
    }
  };

  const getDocumentLabel = (docType: string) => {
    const labels: Record<string, string> = {
      plotMap: 'Plot Map',
      cnicCopy: 'CNIC Copy',
      bankStatement: 'Bank Statement',
      companyForm: 'Company Form',
    };
    return labels[docType] || docType;
  };

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync(plotId || '');
      toast.success('Application submitted! Please upload documents.');
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const handleSubmitDocuments = async () => {
    // Validate required documents
    if (!uploadedFiles.cnicCopy || !uploadedFiles.bankStatement) {
      toast.error('Please upload CNIC copy and bank statement (required)');
      return;
    }

    try {
      await uploadDocsMutation.mutateAsync(uploadedFiles);
      toast.success('Documents uploaded successfully! Your application is under review.');
      navigate('/purchaser');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload documents');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `PKR ${(price / 10000000).toFixed(2)} Crore`;
    } else if (price >= 100000) {
      return `PKR ${(price / 100000).toFixed(1)} Lac`;
    }
    return `PKR ${price.toLocaleString()}`;
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Plot Application</h1>
            <p className="text-muted-foreground">
              Apply for Plot {plot.plotNumber}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 py-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              {s > 1 && <div className={`w-16 h-0.5 ${step >= s ? 'bg-primary' : 'bg-border'}`} />}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 text-sm text-muted-foreground">
          <span className={step >= 1 ? 'text-foreground font-medium' : ''}>Plot Details</span>
          <span className={step >= 2 ? 'text-foreground font-medium' : ''}>Upload Documents</span>
        </div>

        {/* Step 1: Plot Details & Apply */}
        {step === 1 && (
          <BentoCard>
            <BentoCardHeader
              title="Plot Details"
              subtitle="Review the plot information before applying"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Plot Number</Label>
                  <p className="text-lg font-semibold mt-1">{plot.plotNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{plot.location}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Area</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{plot.area}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Price</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xl font-bold text-accent">{formatPrice(plot.totalValue)}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Payment Structure</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Down Payment Required</li>
                    <li>• Installments as per schedule</li>
                    <li>• Documents issued at milestones</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleApply}
                disabled={applyMutation.isPending}
              >
                {applyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Apply for Plot
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </BentoCard>
        )}

        {/* Step 2: Upload Documents */}
        {step === 2 && (
          <BentoCard>
            <BentoCardHeader
              title="Required Documents"
              subtitle="Upload the following documents to complete your application"
            />

            <div className="space-y-4">
              {/* Plot Map */}
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Plot Map</p>
                    <p className="text-sm text-muted-foreground">Optional</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadedFiles.plotMap && (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    )}
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange('plotMap', e.target.files?.[0] || null)}
                      className="hidden"
                      id="plotMap"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="plotMap" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadedFiles.plotMap ? 'Change' : 'Upload'}
                      </label>
                    </Button>
                  </div>
                </div>
                {uploadedFiles.plotMap && (
                  <p className="text-sm text-muted-foreground mt-2">{uploadedFiles.plotMap.name}</p>
                )}
              </div>

              {/* CNIC Copy */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CNIC Copy (Front & Back) *</p>
                    <p className="text-sm text-muted-foreground">Required</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadedFiles.cnicCopy && (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    )}
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange('cnicCopy', e.target.files?.[0] || null)}
                      className="hidden"
                      id="cnicCopy"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="cnicCopy" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadedFiles.cnicCopy ? 'Change' : 'Upload'}
                      </label>
                    </Button>
                  </div>
                </div>
                {uploadedFiles.cnicCopy && (
                  <p className="text-sm text-muted-foreground mt-2">{uploadedFiles.cnicCopy.name}</p>
                )}
              </div>

              {/* Bank Statement */}
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bank Statement (Last 6 Months) *</p>
                    <p className="text-sm text-muted-foreground">Required</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadedFiles.bankStatement && (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    )}
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange('bankStatement', e.target.files?.[0] || null)}
                      className="hidden"
                      id="bankStatement"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="bankStatement" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadedFiles.bankStatement ? 'Change' : 'Upload'}
                      </label>
                    </Button>
                  </div>
                </div>
                {uploadedFiles.bankStatement && (
                  <p className="text-sm text-muted-foreground mt-2">{uploadedFiles.bankStatement.name}</p>
                )}
              </div>

              {/* Company Form */}
              <div className="p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Company Form</p>
                    <p className="text-sm text-muted-foreground">Optional (if applicable)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadedFiles.companyForm && (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    )}
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange('companyForm', e.target.files?.[0] || null)}
                      className="hidden"
                      id="companyForm"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="companyForm" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadedFiles.companyForm ? 'Change' : 'Upload'}
                      </label>
                    </Button>
                  </div>
                </div>
                {uploadedFiles.companyForm && (
                  <p className="text-sm text-muted-foreground mt-2">{uploadedFiles.companyForm.name}</p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-info/10 border border-info/20 mt-6">
              <p className="text-sm text-info">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                All documents will be verified by our team before your application is approved.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleSubmitDocuments}
                disabled={uploadDocsMutation.isPending || !uploadedFiles.cnicCopy || !uploadedFiles.bankStatement}
              >
                {uploadDocsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle2 className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </BentoCard>
        )}
      </div>
    </AppLayout>
  );
}
