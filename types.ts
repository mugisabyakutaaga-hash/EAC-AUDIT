
export type Language = 'en' | 'lg' | 'sw';
export type UserRole = 'client' | 'auditor';
export type EACCountry = 'Uganda' | 'Kenya' | 'Tanzania' | 'Rwanda' | 'Burundi' | 'SouthSudan' | 'DRC' | 'Somalia';

export enum DefaultCategory {
  SALES = 'Sales',
  RENT = 'Rent',
  UTILITIES = 'Utilities',
  SALARIES = 'Salaries',
  INVENTORY = 'Inventory',
  TRANSPORT = 'Transport',
  TAX_PAYMENT = 'Tax Payment',
  OTHER = 'Other'
}

export type AuditPhaseStatus = 'pending' | 'in-progress' | 'completed' | 'delayed';

export interface AuditPhase {
  id: string;
  name: string;
  status: AuditPhaseStatus;
  deadline: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Client {
  id: string;
  businessName: string;
  tin: string;
  location: string;
  country: EACCountry;
  complianceStatus: 'compliant' | 'warning' | 'overdue';
  lastAuditDate: string;
  anomalyCount: number;
  complianceScore: number;
  workflow: AuditPhase[];
  checklist: ChecklistItem[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  type: 'income' | 'expense';
  hasReceipt: boolean;
  receiptUrl?: string;
  invoiceNumber?: string;
  dueDate?: string;
  taxCalculated?: TaxCalculation;
  evidenceStatus?: 'verified' | 'missing' | 'pending';
}

export interface TaxCalculation {
  vat: number;
  wht: number;
  lst: number;
  netAmount: number;
}

export interface AnomalyReport {
  id: string;
  transactionId: string;
  severity: 'low' | 'medium' | 'high';
  reason: string;
  suggestedAction: string;
  status: 'open' | 'resolved' | 'ignored';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface MapsResult {
  title: string;
  uri: string;
}

export interface ComplianceAlertConfig {
  scoreThreshold: number;
  issueThreshold: number;
  deadlineAlertDays: number;
}

export interface AppState {
  role: UserRole;
  currentClientId: string | null;
  language: Language;
  country: EACCountry;
}
