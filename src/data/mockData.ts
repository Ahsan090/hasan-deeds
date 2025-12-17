import { 
  Place, Plot, PlotDetails, Purchase, ServiceProvider, 
  PaymentSchedule, PaymentInstallment, FailedPayment, 
  Notification, AuditLogEntry, UserSession 
} from '@/types/entities';

// Mock Places
export const mockPlaces: Place[] = [
  { placeId: 'place-001', placeName: 'Hasan Gardens Phase 1', city: 'Lahore', region: 'Punjab' },
  { placeId: 'place-002', placeName: 'Hasan Villas', city: 'Islamabad', region: 'ICT' },
  { placeId: 'place-003', placeName: 'Hasan Heights', city: 'Karachi', region: 'Sindh' },
];

// Mock Plots
export const mockPlots: Plot[] = [
  { plotId: 'plot-001', plotNumber: 'HG-A-101', placeId: 'place-001', size: 10, sizeUnit: 'marla', price: 5000000, status: 'sold', purchaserId: 'purchase-001', createdAt: '2024-01-15', updatedAt: '2024-12-01' },
  { plotId: 'plot-002', plotNumber: 'HG-A-102', placeId: 'place-001', size: 10, sizeUnit: 'marla', price: 5200000, status: 'reserved', purchaserId: 'purchase-002', createdAt: '2024-02-20', updatedAt: '2024-11-15' },
  { plotId: 'plot-003', plotNumber: 'HG-B-201', placeId: 'place-001', size: 1, sizeUnit: 'kanal', price: 12000000, status: 'on_hold', purchaserId: 'purchase-003', createdAt: '2024-03-10', updatedAt: '2024-12-10' },
  { plotId: 'plot-004', plotNumber: 'HV-C-301', placeId: 'place-002', size: 5, sizeUnit: 'marla', price: 3500000, status: 'available', createdAt: '2024-04-01', updatedAt: '2024-04-01' },
  { plotId: 'plot-005', plotNumber: 'HV-C-302', placeId: 'place-002', size: 7, sizeUnit: 'marla', price: 4200000, status: 'available', createdAt: '2024-04-01', updatedAt: '2024-04-01' },
];

// Mock Purchases (Purchasers)
export const mockPurchases: Purchase[] = [
  { purchaseId: 'purchase-001', fullName: 'Ahmed Khan', cnic: '35201-1234567-1', phone: '+92-300-1234567', email: 'ahmed.khan@email.com', address: '123 Main Street, Lahore', createdAt: '2024-01-15' },
  { purchaseId: 'purchase-002', fullName: 'Fatima Ali', cnic: '35202-7654321-2', phone: '+92-321-7654321', email: 'fatima.ali@email.com', address: '456 Garden Town, Lahore', createdAt: '2024-02-20' },
  { purchaseId: 'purchase-003', fullName: 'Hassan Malik', cnic: '35203-9876543-3', phone: '+92-333-9876543', email: 'hassan.malik@email.com', address: '789 DHA Phase 5, Lahore', createdAt: '2024-03-10' },
];

// Mock Plot Details
export const mockPlotDetails: PlotDetails[] = [
  { 
    plotDetailsId: 'pd-001', plotId: 'plot-001', 
    cnicCopyUri: 'secure://docs/cnic-001.pdf', 
    bankStatementUri: 'secure://docs/bank-001.pdf', 
    companyFormUri: 'secure://docs/form-001.pdf',
    allotmentDocUri: 'secure://docs/allotment-001.pdf',
    allocationDocUri: 'secure://docs/allocation-001.pdf',
    possessionDocUri: 'secure://docs/possession-001.pdf',
    clearanceDocUri: 'secure://docs/clearance-001.pdf',
    verificationStatus: 'verified', verifiedBy: 'sp-001', verifiedAt: '2024-01-20'
  },
  { 
    plotDetailsId: 'pd-002', plotId: 'plot-002', 
    cnicCopyUri: 'secure://docs/cnic-002.pdf', 
    bankStatementUri: 'secure://docs/bank-002.pdf', 
    companyFormUri: 'secure://docs/form-002.pdf',
    allotmentDocUri: 'secure://docs/allotment-002.pdf',
    verificationStatus: 'verified', verifiedBy: 'sp-001', verifiedAt: '2024-02-25'
  },
  { 
    plotDetailsId: 'pd-003', plotId: 'plot-003', 
    cnicCopyUri: 'secure://docs/cnic-003.pdf', 
    bankStatementUri: 'secure://docs/bank-003.pdf',
    verificationStatus: 'pending'
  },
];

// Mock Payment Schedules
export const mockPaymentSchedules: PaymentSchedule[] = [
  { scheduleId: 'sched-001', plotId: 'plot-001', totalAmount: 5000000, downPayment: 500000, installmentCount: 24, createdAt: '2024-01-20', createdBy: 'sp-001' },
  { scheduleId: 'sched-002', plotId: 'plot-002', totalAmount: 5200000, downPayment: 520000, installmentCount: 24, createdAt: '2024-02-25', createdBy: 'sp-001' },
  { scheduleId: 'sched-003', plotId: 'plot-003', totalAmount: 12000000, downPayment: 1200000, installmentCount: 36, createdAt: '2024-03-15', createdBy: 'sp-001' },
];

// Mock Payment Installments
export const mockPaymentInstallments: PaymentInstallment[] = [
  // Plot 001 - Fully paid (100%)
  { installmentId: 'inst-001-01', scheduleId: 'sched-001', installmentNumber: 0, amount: 500000, dueDate: '2024-01-25', paidDate: '2024-01-25', status: 'paid', receiptUri: 'secure://receipts/001-01.pdf' },
  { installmentId: 'inst-001-02', scheduleId: 'sched-001', installmentNumber: 1, amount: 187500, dueDate: '2024-02-25', paidDate: '2024-02-24', status: 'paid', receiptUri: 'secure://receipts/001-02.pdf' },
  { installmentId: 'inst-001-03', scheduleId: 'sched-001', installmentNumber: 2, amount: 187500, dueDate: '2024-03-25', paidDate: '2024-03-25', status: 'paid', receiptUri: 'secure://receipts/001-03.pdf' },
  // ... more installments would continue
  
  // Plot 002 - 25% paid (between 10% and 50%)
  { installmentId: 'inst-002-01', scheduleId: 'sched-002', installmentNumber: 0, amount: 520000, dueDate: '2024-03-01', paidDate: '2024-03-01', status: 'paid', receiptUri: 'secure://receipts/002-01.pdf' },
  { installmentId: 'inst-002-02', scheduleId: 'sched-002', installmentNumber: 1, amount: 195000, dueDate: '2024-04-01', paidDate: '2024-04-01', status: 'paid', receiptUri: 'secure://receipts/002-02.pdf' },
  { installmentId: 'inst-002-03', scheduleId: 'sched-002', installmentNumber: 2, amount: 195000, dueDate: '2024-05-01', paidDate: '2024-05-01', status: 'paid', receiptUri: 'secure://receipts/002-03.pdf' },
  { installmentId: 'inst-002-04', scheduleId: 'sched-002', installmentNumber: 3, amount: 195000, dueDate: '2024-06-01', status: 'pending' },
  { installmentId: 'inst-002-05', scheduleId: 'sched-002', installmentNumber: 4, amount: 195000, dueDate: '2024-07-01', status: 'pending' },
  
  // Plot 003 - 8% paid with overdue (leading to case)
  { installmentId: 'inst-003-01', scheduleId: 'sched-003', installmentNumber: 0, amount: 1200000, dueDate: '2024-03-20', paidDate: '2024-03-20', status: 'paid', receiptUri: 'secure://receipts/003-01.pdf' },
  { installmentId: 'inst-003-02', scheduleId: 'sched-003', installmentNumber: 1, amount: 300000, dueDate: '2024-04-20', status: 'overdue' },
  { installmentId: 'inst-003-03', scheduleId: 'sched-003', installmentNumber: 2, amount: 300000, dueDate: '2024-05-20', status: 'overdue' },
  { installmentId: 'inst-003-04', scheduleId: 'sched-003', installmentNumber: 3, amount: 300000, dueDate: '2024-06-20', status: 'overdue' },
];

// Mock Failed Payments
export const mockFailedPayments: FailedPayment[] = [
  {
    failedPaymentId: 'fail-001',
    installmentId: 'inst-003-02',
    plotId: 'plot-003',
    purchaserId: 'purchase-003',
    amount: 300000,
    originalDueDate: '2024-04-20',
    gracePeriodEnd: '2024-05-20',
    caseId: 'case-001',
    caseStatus: 'filed',
    courtDate: '2025-01-15',
    filedBy: 'sp-002',
    filedAt: '2024-12-01',
    notes: 'Multiple reminders sent. Purchaser unresponsive.'
  },
];

// Mock Service Providers
export const mockServiceProviders: ServiceProvider[] = [
  { providerId: 'sp-001', name: 'Muhammad Imran', role: 'service_provider', email: 'imran@hasanenterprises.com', phone: '+92-42-1234567' },
  { providerId: 'sp-002', name: 'Advocate Rizwan', role: 'admin_legal', email: 'rizwan@hasanenterprises.com', phone: '+92-42-7654321' },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  { notificationId: 'notif-001', userId: 'purchase-002', type: 'info', title: 'Payment Reminder', message: 'Your next installment of PKR 195,000 is due on June 1st, 2024.', entityType: 'payment', entityId: 'inst-002-04', read: false, createdAt: '2024-05-25T10:00:00Z' },
  { notificationId: 'notif-002', userId: 'purchase-002', type: 'info', title: 'Document Ready', message: 'Your allotment document is ready for download.', entityType: 'document', entityId: 'pd-002', read: true, createdAt: '2024-03-15T14:30:00Z' },
  { notificationId: 'notif-003', userId: 'purchase-003', type: 'critical', title: 'Payment Overdue', message: 'Your payment is overdue. Please contact support immediately to avoid legal action.', entityType: 'payment', entityId: 'inst-003-02', read: false, createdAt: '2024-05-25T08:00:00Z' },
  { notificationId: 'notif-004', userId: 'purchase-003', type: 'warning', title: 'Case Filed', message: 'A legal case has been filed for overdue payments. Your plot is now on hold.', entityType: 'case', entityId: 'fail-001', read: false, createdAt: '2024-12-01T16:00:00Z' },
  { notificationId: 'notif-005', userId: 'sp-001', type: 'info', title: 'New Application', message: 'New plot application received from Hassan Malik for HG-B-201.', entityType: 'plot', entityId: 'plot-003', read: false, createdAt: '2024-03-10T09:15:00Z' },
];

// Mock Audit Log
export const mockAuditLog: AuditLogEntry[] = [
  { auditId: 'audit-001', action: 'PLOT_APPLICATION_SUBMITTED', entityType: 'plot', entityId: 'plot-001', performedBy: 'purchase-001', performedByRole: 'purchaser', details: 'Plot application submitted with required documents', timestamp: '2024-01-15T10:30:00Z' },
  { auditId: 'audit-002', action: 'DOCUMENTS_VERIFIED', entityType: 'plotDetails', entityId: 'pd-001', performedBy: 'sp-001', performedByRole: 'service_provider', details: 'All submitted documents verified successfully', timestamp: '2024-01-20T14:00:00Z' },
  { auditId: 'audit-003', action: 'PAYMENT_SCHEDULE_CREATED', entityType: 'paymentSchedule', entityId: 'sched-001', performedBy: 'sp-001', performedByRole: 'service_provider', details: 'Payment schedule created: 24 installments over 2 years', timestamp: '2024-01-20T14:30:00Z' },
  { auditId: 'audit-004', action: 'PAYMENT_RECEIVED', entityType: 'paymentInstallment', entityId: 'inst-001-01', performedBy: 'purchase-001', performedByRole: 'purchaser', details: 'Down payment of PKR 500,000 received', timestamp: '2024-01-25T11:00:00Z' },
  { auditId: 'audit-005', action: 'MILESTONE_REACHED', entityType: 'plot', entityId: 'plot-001', performedBy: 'system', performedByRole: 'admin', details: '10% milestone reached - Allotment document generated', timestamp: '2024-01-25T11:05:00Z' },
  { auditId: 'audit-006', action: 'DOCUMENT_ISSUED', entityType: 'plotDetails', entityId: 'pd-001', performedBy: 'sp-001', performedByRole: 'service_provider', details: 'Allotment document issued and URI stored', timestamp: '2024-01-26T09:00:00Z' },
  { auditId: 'audit-007', action: 'PAYMENT_OVERDUE', entityType: 'paymentInstallment', entityId: 'inst-003-02', performedBy: 'system', performedByRole: 'admin', details: 'Payment overdue - Grace period started', timestamp: '2024-04-21T00:00:00Z' },
  { auditId: 'audit-008', action: 'FAILED_PAYMENT_CREATED', entityType: 'failedPayment', entityId: 'fail-001', performedBy: 'system', performedByRole: 'admin', details: 'Failed payment record created after grace period', timestamp: '2024-05-21T00:00:00Z' },
  { auditId: 'audit-009', action: 'CASE_FILED', entityType: 'failedPayment', entityId: 'fail-001', performedBy: 'sp-002', performedByRole: 'admin_legal', details: 'Legal case filed - Case ID: case-001', timestamp: '2024-12-01T16:00:00Z' },
  { auditId: 'audit-010', action: 'PLOT_STATUS_CHANGED', entityType: 'plot', entityId: 'plot-003', performedBy: 'sp-002', performedByRole: 'admin_legal', details: 'Plot status changed to ON_HOLD due to legal case', timestamp: '2024-12-01T16:05:00Z' },
];

// Mock User Sessions for role switching
export const mockUserSessions: Record<string, UserSession> = {
  purchaser: { userId: 'purchase-002', role: 'purchaser', name: 'Fatima Ali', email: 'fatima.ali@email.com' },
  service_provider: { userId: 'sp-001', role: 'service_provider', name: 'Muhammad Imran', email: 'imran@hasanenterprises.com' },
  admin_legal: { userId: 'sp-002', role: 'admin_legal', name: 'Advocate Rizwan', email: 'rizwan@hasanenterprises.com' },
  admin: { userId: 'admin-001', role: 'admin', name: 'System Admin', email: 'admin@hasanenterprises.com' },
};

// Helper functions
export function calculateMilestone(plotId: string): { percentage: number; level: 0 | 10 | 50 | 75 | 100 } {
  const schedule = mockPaymentSchedules.find(s => s.plotId === plotId);
  if (!schedule) return { percentage: 0, level: 0 };
  
  const installments = mockPaymentInstallments.filter(i => i.scheduleId === schedule.scheduleId);
  const paidAmount = installments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  
  const percentage = Math.round((paidAmount / schedule.totalAmount) * 100);
  
  let level: 0 | 10 | 50 | 75 | 100 = 0;
  if (percentage >= 100) level = 100;
  else if (percentage >= 75) level = 75;
  else if (percentage >= 50) level = 50;
  else if (percentage >= 10) level = 10;
  
  return { percentage, level };
}

export function getPlotWithDetails(plotId: string) {
  const plot = mockPlots.find(p => p.plotId === plotId);
  const details = mockPlotDetails.find(d => d.plotId === plotId);
  const place = mockPlaces.find(p => p.placeId === plot?.placeId);
  const purchaser = mockPurchases.find(p => p.purchaseId === plot?.purchaserId);
  const schedule = mockPaymentSchedules.find(s => s.plotId === plotId);
  const installments = schedule 
    ? mockPaymentInstallments.filter(i => i.scheduleId === schedule.scheduleId)
    : [];
  const milestone = calculateMilestone(plotId);
  const failedPayment = mockFailedPayments.find(f => f.plotId === plotId);
  
  return { plot, details, place, purchaser, schedule, installments, milestone, failedPayment };
}
