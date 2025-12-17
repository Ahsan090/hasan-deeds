import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { BentoCard, BentoCardHeader } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadedDocumentCard } from '@/components/cards/DocumentCard';
import { mockPlots, mockPlaces } from '@/data/mockData';
import { 
  ArrowLeft, MapPin, Maximize2, Tag, Upload, FileText, 
  CheckCircle2, AlertCircle, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function PlotApplication() {
  const { plotId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    cnic: '',
    phone: '',
    email: '',
    address: '',
  });
  const [documents, setDocuments] = useState({
    cnicCopy: false,
    bankStatement: false,
    companyForm: false,
  });

  const plot = mockPlots.find(p => p.plotId === plotId);
  const place = plot ? mockPlaces.find(p => p.placeId === plot.placeId) : null;

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
            <Button className="mt-4" onClick={() => navigate('/purchaser/plots')}>
              Browse Available Plots
            </Button>
          </BentoCard>
        </div>
      </AppLayout>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (docType: keyof typeof documents) => {
    // Simulate upload
    setDocuments(prev => ({ ...prev, [docType]: true }));
    toast.success(`${docType === 'cnicCopy' ? 'CNIC Copy' : docType === 'bankStatement' ? 'Bank Statement' : 'Company Form'} uploaded successfully`);
  };

  const handleSubmit = () => {
    // Validate
    if (!formData.fullName || !formData.cnic || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!documents.cnicCopy || !documents.bankStatement) {
      toast.error('Please upload all required documents');
      return;
    }

    toast.success('Application submitted successfully!');
    navigate('/purchaser');
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
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              {s > 1 && <div className={`w-16 h-0.5 ${step >= s ? 'bg-primary' : 'bg-border'}`} />}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-12 text-sm text-muted-foreground">
          <span className={step >= 1 ? 'text-foreground font-medium' : ''}>Plot Details</span>
          <span className={step >= 2 ? 'text-foreground font-medium' : ''}>Your Information</span>
          <span className={step >= 3 ? 'text-foreground font-medium' : ''}>Documents</span>
        </div>

        {/* Step 1: Plot Details */}
        {step === 1 && (
          <BentoCard>
            <BentoCardHeader 
              title="Plot Details"
              subtitle="Review the plot information before proceeding"
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
                    <p className="font-medium">{place?.placeName}, {place?.city}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Size</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{plot.size} {plot.sizeUnit}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Price</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xl font-bold text-accent">{formatPrice(plot.price)}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Payment Structure</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 10% Down Payment Required</li>
                    <li>• Remaining in 24 Monthly Installments</li>
                    <li>• Documents issued at milestones</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)}>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </BentoCard>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <BentoCard>
            <BentoCardHeader 
              title="Personal Information"
              subtitle="Enter your details as they appear on your CNIC"
            />
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="As per CNIC"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="cnic">CNIC Number *</Label>
                <Input
                  id="cnic"
                  value={formData.cnic}
                  onChange={(e) => handleInputChange('cnic', e.target.value)}
                  placeholder="XXXXX-XXXXXXX-X"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+92-XXX-XXXXXXX"
                  className="mt-1.5"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1.5"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Residential Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address"
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </BentoCard>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <BentoCard>
            <BentoCardHeader 
              title="Required Documents"
              subtitle="Upload the following documents to complete your application"
            />
            
            <div className="space-y-4">
              <UploadedDocumentCard
                title="CNIC Copy (Front & Back)"
                status={documents.cnicCopy ? 'uploaded' : 'required'}
                onUpload={() => handleDocumentUpload('cnicCopy')}
              />
              <UploadedDocumentCard
                title="Bank Statement (Last 6 Months)"
                status={documents.bankStatement ? 'uploaded' : 'required'}
                onUpload={() => handleDocumentUpload('bankStatement')}
              />
              <UploadedDocumentCard
                title="Company Form (if applicable)"
                status={documents.companyForm ? 'uploaded' : 'required'}
                onUpload={() => handleDocumentUpload('companyForm')}
              />
            </div>

            <div className="p-4 rounded-lg bg-info/10 border border-info/20 mt-6">
              <p className="text-sm text-info">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                All documents will be verified by our team before your application is approved.
              </p>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Submit Application
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </BentoCard>
        )}
      </div>
    </AppLayout>
  );
}
