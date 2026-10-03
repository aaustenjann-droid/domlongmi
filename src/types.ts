export type TableStyle = 'modern-inline' | 'stepped' | 'grid' | 'striped';

export interface Product {
  id: string;
  name: string;
  unitPrice: number;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  description?: string; // ព័ត៌មានលម្អិតដូចជាការគណនា (Calculation details)
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface WeighbridgeRecord {
  grossWeight: number;        // ទម្ងន់សរុប (Kg or Ton)
  tareWeight: number;         // ទម្ងន់រថយន្តទទេ
  netWeight: number;          // ទម្ងន់ទំនិញសុទ្ធ (Gross - Tare)
  deductionFactor: number;    // មេគុណកាត់កង (e.g. 0.9 - adjustable)
  deductionPercent?: number;  // ភាគរយកាត់កង % (optional)
  deductionWeight: number;    // ទម្ងន់កាត់កង (Kg or Ton)
  payableWeight: number;      // ទម្ងន់ទូទាត់ជាក់ស្តែង = (Gross - Tare) * deductionFactor
  pricePerKg?: number;        // តម្លៃទំនិញក្នុង ១គីឡូ
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  truckPlateNumber?: string;  // ផ្លាកលេខឡាន
  driverName?: string;        // ឈ្មោះអ្នកបើកបរ
  date: string;
  time?: string;
  items: InvoiceItem[];
  totalAmount: number;
  depositAmount?: number;     // ប្រាក់កក់ ឬ បើកមុន
  remainingAmount?: number;   // ប្រាក់នៅខ្វះ
  paymentMethod?: 'cash' | 'transfer' | 'credit';
  paymentStatus?: 'paid' | 'partial' | 'pending';
  notes?: string;
  currency: 'KHR' | 'USD';
  unit: 'ton' | 'kg';
  exchangeRate: number;
  templateStyle?: 'clean' | 'slip' | string;
  tableStyle?: TableStyle;
  invoiceLanguage?: 'khmer' | 'english' | 'both';
  weighbridge?: WeighbridgeRecord;
}

export interface AppSettings {
  themeColor: string;
  defaultCurrency: 'KHR' | 'USD';
  exchangeRate: number;
  defaultUnit: 'ton' | 'kg';
  companyNameKhmer: string;
  companyNameEnglish: string;
  companyTagline?: string;
  companyAddressKhmer?: string;
  companyPhone?: string;
  companyPhoneSecondary?: string;
  sellerName: string;
  weighMasterName?: string;
  cashierName?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  showStamp?: boolean;
  stampText?: string;
  invoiceTemplate?: 'clean' | 'slip' | string;
  tableStyle?: TableStyle;
  invoiceLanguage?: 'khmer' | 'english' | 'both';
}
