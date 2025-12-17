// Entity Types - Mapped exactly to backend entity attributes
// JSON Mapping File: UI Field → Backend Entity.Attribute

export type PlotStatus = 'available' | 'reserved' | 'sold' | 'on_hold';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'failed';
export type CaseStatus = 'filed' | 'in_progress' | 'resolved' | 'dismissed';
export type MilestoneLevel = 0 | 10 | 50 | 75 | 100;
export type NotificationType = 'info' | 'warning' | 'critical';
export type UserRole = 'purchaser' | 'service_provider' | 'admin_legal' | 'admin';

// Place Entity
export interface Place {
  placeId: string;           // place.placeId
  placeName: string;         // place.placeName
  city: string;              // place.city
  region: string;            // place.region
}

// Plot Entity
export interface Plot {
  plotId: string;            // plot.plotId
  plotNumber: string;        // plot.plotNumber
  placeId: string;           // plot.placeId (FK to Place)
  size: number;              // plot.size (in marla/kanal)
  sizeUnit: 'marla' | 'kanal'; // plot.sizeUnit
  price: number;             // plot.price
  status: PlotStatus;        // plot.status
  purchaserId?: string;      // plot.purchaserId (FK to Purchase)
  createdAt: string;         // plot.createdAt
  updatedAt: string;         // plot.updatedAt
}

// Plot Details Entity - Document URIs
export interface PlotDetails {
  plotDetailsId: string;     // plotDetails.plotDetailsId
  plotId: string;            // plotDetails.plotId (FK to Plot)
  cnicCopyUri?: string;      // plotDetails.cnicCopyUri
  bankStatementUri?: string; // plotDetails.bankStatementUri
  companyFormUri?: string;   // plotDetails.companyFormUri
  allotmentDocUri?: string;  // plotDetails.allotmentDocUri (10% milestone)
  allocationDocUri?: string; // plotDetails.allocationDocUri (50% milestone)
  possessionDocUri?: string; // plotDetails.possessionDocUri (75% milestone)
  clearanceDocUri?: string;  // plotDetails.clearanceDocUri (100% milestone)
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;       // plotDetails.verifiedBy
  verifiedAt?: string;       // plotDetails.verifiedAt
}

// Purchase Entity (Purchaser)
export interface Purchase {
  purchaseId: string;        // purchase.purchaseId
  fullName: string;          // purchase.fullName
  cnic: string;              // purchase.cnic (masked in UI)
  phone: string;             // purchase.phone
  email: string;             // purchase.email
  address: string;           // purchase.address
  createdAt: string;         // purchase.createdAt
}

// Service Provider Entity
export interface ServiceProvider {
  providerId: string;        // serviceProvider.providerId
  name: string;              // serviceProvider.name
  role: 'service_provider' | 'admin_legal';
  email: string;             // serviceProvider.email
  phone: string;             // serviceProvider.phone
}

// Payment Schedule Entity
export interface PaymentSchedule {
  scheduleId: string;        // paymentSchedule.scheduleId
  plotId: string;            // paymentSchedule.plotId (FK to Plot)
  totalAmount: number;       // paymentSchedule.totalAmount
  downPayment: number;       // paymentSchedule.downPayment
  installmentCount: number;  // paymentSchedule.installmentCount
  createdAt: string;         // paymentSchedule.createdAt
  createdBy: string;         // paymentSchedule.createdBy
}

// Payment Installment Entity
export interface PaymentInstallment {
  installmentId: string;     // paymentInstallment.installmentId
  scheduleId: string;        // paymentInstallment.scheduleId (FK to PaymentSchedule)
  installmentNumber: number; // paymentInstallment.installmentNumber
  amount: number;            // paymentInstallment.amount
  dueDate: string;           // paymentInstallment.dueDate
  paidDate?: string;         // paymentInstallment.paidDate
  status: PaymentStatus;     // paymentInstallment.status
  receiptUri?: string;       // paymentInstallment.receiptUri
  paymentProofUri?: string;  // paymentInstallment.paymentProofUri
}

// Failed Payment Entity
export interface FailedPayment {
  failedPaymentId: string;   // failedPayment.failedPaymentId
  installmentId: string;     // failedPayment.installmentId (FK to PaymentInstallment)
  plotId: string;            // failedPayment.plotId (FK to Plot)
  purchaserId: string;       // failedPayment.purchaserId (FK to Purchase)
  amount: number;            // failedPayment.amount
  originalDueDate: string;   // failedPayment.originalDueDate
  gracePeriodEnd: string;    // failedPayment.gracePeriodEnd
  caseId?: string;           // failedPayment.caseId (if case filed)
  caseStatus?: CaseStatus;   // failedPayment.caseStatus
  courtDate?: string;        // failedPayment.courtDate
  filedBy?: string;          // failedPayment.filedBy
  filedAt?: string;          // failedPayment.filedAt
  notes?: string;            // failedPayment.notes
}

// Notification Entity (In-App Only)
export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: 'plot' | 'payment' | 'case' | 'document';
  entityId?: string;
  read: boolean;
  createdAt: string;
}

// Audit Log Entry
export interface AuditLogEntry {
  auditId: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  performedByRole: UserRole;
  details: string;
  timestamp: string;
}

// User Session
export interface UserSession {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
}
