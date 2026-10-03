import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Invoice, AppSettings } from './types';

const PRODUCTS_KEY = 'cassava_products';
const INVOICES_KEY = 'cassava_invoices';
const SETTINGS_KEY = 'cassava_settings';

export const defaultProducts: Product[] = [
  { id: '1', name: 'ដំឡូងមីស្រស់ (Fresh Cassava)', unitPrice: 260 },
  { id: '2', name: 'ចំណិតដំឡូងមីក្រៀម (Dried Cassava Chips)', unitPrice: 580 },
  { id: '3', name: 'ម្សៅដំឡូងមីកែច្នៃ (Processed Cassava Flour)', unitPrice: 1850 },
  { id: '4', name: 'ដើមពូជដំឡូងមី KU50 / 81 (Cassava Stems)', unitPrice: 80 },
];

export const defaultSettings: AppSettings = {
  themeColor: 'emerald',
  defaultCurrency: 'KHR',
  exchangeRate: 4100,
  defaultUnit: 'kg',
  companyNameKhmer: 'ដេប៉ូ ចែម៉ាប់',
  companyNameEnglish: 'CHEY MAB PRODUCE WEIGHBRIDGE DEPOT',
  companyTagline: 'មានទទួលទិញ: ស្រូវ ដំឡូងមីស្រស់ និងស្ងួត',
  companyAddressKhmer: 'ភូមិព្រៃក្រឡាញ់ ឃុំស្រែណូយ ស្រុកវ៉ារិន ខេត្តសៀមរាប',
  companyPhone: '097 28 32 796',
  companyPhoneSecondary: '066 551 286',
  sellerName: 'តុលា (Tola)',
  weighMasterName: 'តុលា (Tola)',
  cashierName: 'ចែម៉ាប់ (Chey Mab)',
  bankName: 'ABA Bank',
  bankAccountName: 'CHEY MAB DEPOT',
  bankAccountNumber: '001 888 999',
  showStamp: true,
  stampText: 'Paid.',
  invoiceTemplate: 'clean',
  tableStyle: 'modern-inline',
  invoiceLanguage: 'both',
};

export const sampleInvoices: Invoice[] = [
  {
    id: 'demo-inv-001',
    invoiceNumber: 'INV-2026-0920',
    customerName: 'អតិថិជនទូទៅ (Customer)',
    customerPhone: '012 876 543',
    customerAddress: 'ស្រុកវ៉ារិន ខេត្តសៀមរាប',
    truckPlateNumber: 'សៀមរាប 3B-2680',
    driverName: 'តុលា (Tola)',
    date: '2026-09-20',
    time: '09:45 AM',
    items: [
      {
        id: 'item-1',
        productId: '1',
        productName: 'ដំឡូងមីស្រស់ (Fresh Cassava Root)',
        description: 'ដំឡូងមីស្រស់កាត់កងសំណើម និងដីតាមរូបមន្តស្ដង់ដារ',
        quantity: 1593,
        unitPrice: 320,
        total: 509760,
      },
      {
        id: 'item-2',
        productId: '3',
        productName: 'ថ្លៃសេវាលើកដាក់ & ថ្លឹងរថយន្ត (Weighbridge & Handling Fee)',
        description: 'សេវាជញ្ជីងអេឡិចត្រូនិច និងពលកម្មលើកដាក់',
        quantity: 1,
        unitPrice: 15000,
        total: 15000,
      }
    ],
    weighbridge: {
      grossWeight: 2680,
      tareWeight: 910,
      netWeight: 1770,
      deductionFactor: 0.90,
      deductionWeight: 177,
      payableWeight: 1593,
      pricePerKg: 320,
    },
    totalAmount: 524760,
    depositAmount: 0,
    remainingAmount: 524760,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    notes: 'ទម្ងន់ទូទាត់ជាក់ស្តែង = (2680 - 910) x 0.90 = 1593 Kg x 320៛ = 509,760៛ + សេវា 15,000៛',
    currency: 'KHR',
    unit: 'kg',
    exchangeRate: 4100,
    templateStyle: 'modern',
  },
  {
    id: 'demo-inv-002',
    invoiceNumber: 'INV-2025-0002',
    customerName: 'រោងចក្រម្សៅដំឡូងមី ខេត្តត្បូងឃ្មុំ (Tbong Khmum Flour Mill)',
    customerPhone: '088 998 776',
    customerAddress: 'ស្រុកមេមត់ ខេត្តត្បូងឃ្មុំ',
    truckPlateNumber: 'ភ្នំពេញ 3E-2244',
    driverName: 'កែវ សម្បត្តិ (Keo Sambath)',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '02:15 PM',
    items: [
      {
        id: 'item-2',
        productId: '2',
        productName: 'ចំណិតដំឡូងមីក្រៀម (Dried Cassava Chips)',
        quantity: 35.0,
        unitPrice: 580000,
        total: 20300000,
      }
    ],
    totalAmount: 20300000,
    depositAmount: 5000000,
    remainingAmount: 15300000,
    paymentMethod: 'transfer',
    paymentStatus: 'paid',
    notes: 'ទំនិញដឹកជញ្ជូនចូលរោងចក្រ ផ្ទេរប្រាក់តាមគណនី ABA Bank។',
    currency: 'KHR',
    unit: 'ton',
    exchangeRate: 4100,
    templateStyle: 'modern',
  }
];

interface StoreContextType {
  products: Product[];
  invoices: Invoice[];
  settings: AppSettings;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetToSampleData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('localStorage getItem failed', e);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('localStorage setItem failed', e);
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = safeGetItem(PRODUCTS_KEY);
    if (!saved) return defaultProducts;
    try {
      return JSON.parse(saved);
    } catch {
      return defaultProducts;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = safeGetItem(INVOICES_KEY);
    if (!saved) return sampleInvoices;
    try {
      const parsed: Invoice[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((inv) => {
          if (inv.id === 'demo-inv-001') {
            const sample = sampleInvoices.find((s) => s.id === 'demo-inv-001');
            return sample || inv;
          }
          return inv;
        });
      }
      return sampleInvoices;
    } catch {
      return sampleInvoices;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = safeGetItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSettings,
          ...parsed,
          companyTagline: parsed.companyTagline || defaultSettings.companyTagline,
          companyPhoneSecondary: parsed.companyPhoneSecondary || defaultSettings.companyPhoneSecondary,
        };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    safeSetItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    safeSetItem(INVOICES_KEY, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    safeSetItem(SETTINGS_KEY, JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.themeColor || 'emerald');
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const nextSettings = { ...prev, ...newSettings };
      safeSetItem(SETTINGS_KEY, JSON.stringify(nextSettings));
      return nextSettings;
    });
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts((prev) => {
      const nextProducts = [...prev, newProduct];
      safeSetItem(PRODUCTS_KEY, JSON.stringify(nextProducts));
      return nextProducts;
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const nextProducts = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      safeSetItem(PRODUCTS_KEY, JSON.stringify(nextProducts));
      return nextProducts;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const nextProducts = prev.filter((p) => p.id !== id);
      safeSetItem(PRODUCTS_KEY, JSON.stringify(nextProducts));
      return nextProducts;
    });
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newId = Date.now().toString();
    const newInvoice: Invoice = {
      ...invoice,
      id: newId,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
    };
    setInvoices((prev) => {
      const nextInvoices = [newInvoice, ...prev];
      safeSetItem(INVOICES_KEY, JSON.stringify(nextInvoices));
      return nextInvoices;
    });
    return newInvoice;
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices((prev) => {
      const nextInvoices = prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv));
      safeSetItem(INVOICES_KEY, JSON.stringify(nextInvoices));
      return nextInvoices;
    });
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => {
      const nextInvoices = prev.filter((inv) => inv.id !== id);
      safeSetItem(INVOICES_KEY, JSON.stringify(nextInvoices));
      return nextInvoices;
    });
  };

  const resetToSampleData = () => {
    setInvoices(sampleInvoices);
    setProducts(defaultProducts);
    setSettings(defaultSettings);
    safeSetItem(INVOICES_KEY, JSON.stringify(sampleInvoices));
    safeSetItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    safeSetItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        invoices,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        updateSettings,
        resetToSampleData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
