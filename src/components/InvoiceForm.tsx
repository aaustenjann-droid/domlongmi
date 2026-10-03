import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { InvoiceItem, WeighbridgeRecord } from '../types';
import { Plus, Trash2, Save, Scale, Truck, ChevronDown, ChevronUp, UserCheck, X } from 'lucide-react';

interface PastCustomer {
  name: string;
  phone: string;
  address: string;
  plate: string;
  driver: string;
}

interface InvoiceFormProps {
  onSave: (id: string) => void;
  onDelete?: () => void;
  initialInvoiceId?: string | null;
}

export default function InvoiceForm({ onSave, onDelete, initialInvoiceId }: InvoiceFormProps) {
  const { products, addInvoice, updateInvoice, deleteInvoice, invoices, settings } = useStore();

  const existingInvoice = initialInvoiceId ? invoices.find((inv) => inv.id === initialInvoiceId) : null;
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Header Details (Can be blank)
  const [customerName, setCustomerName] = useState(existingInvoice?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(existingInvoice?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(existingInvoice?.customerAddress || '');
  const [truckPlateNumber, setTruckPlateNumber] = useState(existingInvoice?.truckPlateNumber || '');
  const [driverName, setDriverName] = useState(existingInvoice?.driverName || '');

  // Dropdown state for Customer & Vehicle Info section
  // If editing an existing invoice that already has customer info, keep open; otherwise keep compact dropdown
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(
    Boolean(existingInvoice?.customerName || existingInvoice?.truckPlateNumber)
  );

  const [date, setDate] = useState(existingInvoice?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    existingInvoice?.time ||
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
  const [currency, setCurrency] = useState<'KHR' | 'USD'>(
    existingInvoice?.currency || settings.defaultCurrency
  );
  const [unit, setUnit] = useState<'ton' | 'kg'>(existingInvoice?.unit || settings.defaultUnit);
  const [templateStyle, setTemplateStyle] = useState<'depot' | 'modern' | 'slip'>(
    existingInvoice?.templateStyle || settings.invoiceTemplate || 'depot'
  );

  // Items
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>(
    existingInvoice?.items.map((it) => ({
      productId: it.productId,
      productName: it.productName,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    })) || []
  );

  // Weighbridge Scale Ticket State
  const [isWeighbridgeMode, setIsWeighbridgeMode] = useState(!!existingInvoice?.weighbridge);
  const [grossWeight, setGrossWeight] = useState<number | ''>(existingInvoice?.weighbridge?.grossWeight || '');
  const [tareWeight, setTareWeight] = useState<number | ''>(existingInvoice?.weighbridge?.tareWeight || '');
  // Fixed number 0.9 (can be adjusted by user)
  const [deductionFactor, setDeductionFactor] = useState<number | ''>(
    existingInvoice?.weighbridge?.deductionFactor ?? 0.9
  );
  const [scaleProductPriceKg, setScaleProductPriceKg] = useState<number | ''>('');
  const [scaleProductPriceTon, setScaleProductPriceTon] = useState<number | ''>('');
  const [scaleProductId, setScaleProductId] = useState<string>('1');

  // Manual Item Add State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [customPricePerTon, setCustomPricePerTon] = useState<number | ''>('');
  const [customPricePerKg, setCustomPricePerKg] = useState<number | ''>('');

  // Payment Settlement
  const [depositAmount, setDepositAmount] = useState<number | ''>(existingInvoice?.depositAmount || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'credit'>(
    existingInvoice?.paymentMethod || 'cash'
  );
  const [notes, setNotes] = useState(existingInvoice?.notes || '');

  // Extract unique past customers from invoices for the quick dropdown
  const pastCustomers: PastCustomer[] = Array.from(
    new Map<string, PastCustomer>(
      invoices
        .filter((inv) => inv.customerName && inv.customerName.trim() !== '')
        .map((inv) => [
          inv.customerName,
          {
            name: inv.customerName,
            phone: inv.customerPhone || '',
            address: inv.customerAddress || '',
            plate: inv.truckPlateNumber || '',
            driver: inv.driverName || '',
          },
        ])
    ).values()
  );

  // Auto-calculated weighbridge values:
  // (Gross - Tare) * deductionFactor (0.9)
  const grossNum = Number(grossWeight) || 0;
  const tareNum = Number(tareWeight) || 0;
  const netWeightCalc = Math.max(0, grossNum - tareNum);
  const factorNum = deductionFactor !== '' ? Number(deductionFactor) : 0.9;
  const payableWeightCalc = Number((netWeightCalc * factorNum).toFixed(3));
  const deductionWeightCalc = Number((netWeightCalc - payableWeightCalc).toFixed(3));

  // Initialize scale price when product or currency changes
  useEffect(() => {
    const prod = products.find((p) => p.id === scaleProductId) || products[0];
    if (prod) {
      const priceKg = currency === 'USD' ? prod.unitPrice / settings.exchangeRate : prod.unitPrice;
      setScaleProductPriceKg(Number(priceKg.toFixed(4)));
      setScaleProductPriceTon(Number((priceKg * 1000).toFixed(2)));
    }
  }, [scaleProductId, currency, settings.exchangeRate, products]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      const priceKg = currency === 'USD' ? product.unitPrice / settings.exchangeRate : product.unitPrice;
      setCustomPricePerKg(Number(priceKg.toFixed(4)));
      setCustomPricePerTon(Number((priceKg * 1000).toFixed(2)));
    } else {
      setCustomPricePerTon('');
      setCustomPricePerKg('');
    }
  };

  const handleCustomPricePerTonChange = (val: string) => {
    const num = val ? Number(val) : '';
    setCustomPricePerTon(num);
    if (num !== '') {
      setCustomPricePerKg(Number((num / 1000).toFixed(4)));
    } else {
      setCustomPricePerKg('');
    }
  };

  const handleCustomPricePerKgChange = (val: string) => {
    const num = val ? Number(val) : '';
    setCustomPricePerKg(num);
    if (num !== '') {
      setCustomPricePerTon(Number((num * 1000).toFixed(2)));
    } else {
      setCustomPricePerTon('');
    }
  };

  const handleScalePricePerTonChange = (val: string) => {
    const num = val ? Number(val) : '';
    setScaleProductPriceTon(num);
    if (num !== '') {
      setScaleProductPriceKg(Number((num / 1000).toFixed(4)));
    } else {
      setScaleProductPriceKg('');
    }
  };

  const handleScalePricePerKgChange = (val: string) => {
    const num = val ? Number(val) : '';
    setScaleProductPriceKg(num);
    if (num !== '') {
      setScaleProductPriceTon(Number((num * 1000).toFixed(2)));
    } else {
      setScaleProductPriceTon('');
    }
  };

  // Quick select customer from history dropdown
  const handleSelectPastCustomer = (custName: string) => {
    if (!custName) {
      // Clear fields if selecting blank option
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setTruckPlateNumber('');
      setDriverName('');
      return;
    }
    const found = pastCustomers.find((c) => c.name === custName);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address);
      setTruckPlateNumber(found.plate);
      setDriverName(found.driver);
    }
  };

  // Clear customer fields
  const handleClearCustomerFields = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setTruckPlateNumber('');
    setDriverName('');
  };

  // Add Item from Weighbridge Ticket
  const handleAddFromWeighbridge = () => {
    if (payableWeightCalc <= 0) {
      setFormError('សូមបញ្ចូលទម្ងន់ថ្លឹង (Please enter gross and tare weights)');
      return;
    }
    setFormError(null);

    const prod = products.find((p) => p.id === scaleProductId) || products[0];
    const priceKg = Number(scaleProductPriceKg) || 0;
    const finalUnitPrice = unit === 'ton' ? Number(scaleProductPriceTon) : priceKg;
    const finalQuantity = payableWeightCalc;
    
    // Formula: (Gross - Tare) * 0.9 * pricePerKg
    const payableWeightInKg = unit === 'ton' ? payableWeightCalc * 1000 : payableWeightCalc;
    const finalTotal = Math.round(payableWeightInKg * priceKg);

    const unitStr = unit === 'ton' ? 'តោន' : 'គីឡូក្រាម';
    const calcLines = [
      `ទម្ងន់សរុប (Gross): ${grossNum.toLocaleString()} ${unitStr}`,
      `ឡានទទេ (Tare): ${tareNum.toLocaleString()} ${unitStr}`,
      `ទម្ងន់សុទ្ធ (Net): ${netWeightCalc.toLocaleString()} ${unitStr}`,
      `មេគុណកាត់កង (Factor): × ${factorNum}`,
      `ទម្ងន់ទូទាត់ជាក់ស្តែង (Payable): ${payableWeightCalc.toLocaleString()} ${unitStr}`,
    ].join('\n');

    const newItem = {
      productId: prod?.id || '1',
      productName: `${prod?.name || 'ដំឡូងមីស្រស់'} (ថ្លឹង × ${factorNum})`,
      description: calcLines,
      quantity: Number(finalQuantity.toFixed(3)),
      unitPrice: finalUnitPrice,
      total: finalTotal,
    };

    setItems([newItem, ...items]);
  };

  // Add Manual Item
  const handleAddManualItem = () => {
    if (!selectedProductId || quantity === '' || customPricePerTon === '' || customPricePerKg === '') return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const finalUnitPrice = unit === 'ton' ? Number(customPricePerTon) : Number(customPricePerKg);
    const qty = Number(quantity);

    const newItem = {
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: finalUnitPrice,
      total: Math.round(qty * finalUnitPrice),
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setQuantity('');
    setCustomPricePerTon('');
    setCustomPricePerKg('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const depositNum = Number(depositAmount) || 0;
  const remainingAmount = Math.max(0, totalAmount - depositNum);

  const formatCurrency = (amount: number) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR' }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Customer Name is completely OPTIONAL and can be blank
    if (items.length === 0) {
      setFormError('សូមបន្ថែមមុខទំនិញយ៉ាងហោចណាស់មួយ (Please add at least one item)');
      return;
    }
    setFormError(null);

    const finalCustomerName = customerName.trim();

    const weighbridgeData: WeighbridgeRecord | undefined =
      isWeighbridgeMode && grossNum > 0
        ? {
            grossWeight: grossNum,
            tareWeight: tareNum,
            netWeight: netWeightCalc,
            deductionFactor: factorNum,
            deductionWeight: deductionWeightCalc,
            payableWeight: payableWeightCalc,
            pricePerKg: Number(scaleProductPriceKg) || 0,
          }
        : undefined;

    if (existingInvoice) {
      const updated = {
        ...existingInvoice,
        customerName: finalCustomerName,
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        truckPlateNumber: truckPlateNumber.trim(),
        driverName: driverName.trim(),
        date,
        time,
        items: items.map((it, idx) => ({ ...it, id: `item-${Date.now()}-${idx}` })),
        totalAmount,
        depositAmount: depositNum > 0 ? depositNum : undefined,
        remainingAmount: depositNum > 0 ? remainingAmount : undefined,
        paymentMethod,
        paymentStatus: depositNum >= totalAmount ? ('paid' as const) : ('partial' as const),
        notes,
        currency,
        unit,
        templateStyle,
        weighbridge: weighbridgeData,
      };
      updateInvoice(updated);
      onSave(updated.id);
    } else {
      const newInvoice = addInvoice({
        customerName: finalCustomerName,
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        truckPlateNumber: truckPlateNumber.trim(),
        driverName: driverName.trim(),
        date,
        time,
        items: items.map((it, idx) => ({ ...it, id: `item-${Date.now()}-${idx}` })),
        totalAmount,
        depositAmount: depositNum > 0 ? depositNum : undefined,
        remainingAmount: depositNum > 0 ? remainingAmount : undefined,
        paymentMethod,
        paymentStatus: depositNum >= totalAmount ? 'paid' : 'partial',
        notes,
        currency,
        unit,
        exchangeRate: settings.exchangeRate,
        templateStyle,
        weighbridge: weighbridgeData,
      });
      onSave(newInvoice.id);
    }
  };

  const hasCustomerInfoFilled = Boolean(
    customerName || customerPhone || customerAddress || truckPlateNumber || driverName
  );

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-moul">
            {existingInvoice ? 'កែសម្រួលវិក្កយបត្រ' : 'បង្កើតវិក្កយបត្រថ្មី'}
          </h2>
          <p className="text-sm text-gray-500">
            កត់ត្រាការទិញ-លក់ដំឡូងមី ថ្លឹងរថយន្ត និងគណនាតម្លៃដោយស្វ័យប្រវត្តិ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {existingInvoice && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Delete Invoice"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>លុបវិក្កយបត្រ (Delete)</span>
            </button>
          )}

          {/* Template Style Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs shadow-xs">
            <span className="font-semibold text-gray-500">ទម្រង់វិក្កយបត្រ:</span>
            <select
              value={templateStyle}
              onChange={(e) => setTemplateStyle(e.target.value as 'depot' | 'modern' | 'slip')}
              className="font-medium text-gray-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="depot">ប័ណ្ណថ្លឹងដេប៉ូ (Depot Scale)</option>
              <option value="modern">ពាណិជ្ជកម្មទំនើប (Modern)</option>
              <option value="slip">បង្កាន់ដៃតូច (Compact Slip)</option>
            </select>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs">
            <span>⚠️ {formError}</span>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-600 hover:text-rose-900 font-bold text-xs cursor-pointer px-2 py-1 bg-rose-100 rounded-lg"
            >
              បិទ (Close)
            </button>
          </div>
        )}
        {/* SECTION 1: Date, Time & Currency Bar */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 md:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">កាលបរិច្ឆេទ (Date)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">ម៉ោង (Time)</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">រូបិយប័ណ្ណ (Currency)</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'KHR' | 'USD')}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              >
                <option value="KHR">ប្រាក់រៀល (KHR ៛)</option>
                <option value="USD">ប្រាក់ដុល្លារ (USD $)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">ខ្នាតទម្ងន់ (Weight Unit)</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'ton' | 'kg')}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              >
                <option value="ton">គិតជាតោន (Ton)</option>
                <option value="kg">គិតជាគីឡូ (Kg)</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block font-semibold text-gray-700 mb-1">អត្រាប្តូរប្រាក់</label>
              <div className="px-3 py-2 text-xs bg-gray-50 rounded-lg border border-gray-300 text-gray-700 font-mono font-medium truncate">
                1$ = {settings.exchangeRate.toLocaleString()} ៛
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CUSTOMER & VEHICLE INFO (MOVED TO DROPDOWN - CAN BE BLANK) */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden transition-all">
          {/* Dropdown Header Trigger */}
          <button
            type="button"
            onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
            className="w-full p-4 md:px-5 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-900 font-khmer">
                    ព័ត៌មានអតិថិជន & រថយន្តដឹកជញ្ជូន (Customer & Vehicle Info)
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-full border border-gray-200">
                    ស្រេចចិត្ត (Can be blank)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hasCustomerInfoFilled ? (
                    <span className="text-primary-700 font-medium font-mono">
                      {[
                        customerName && `ឈ្មោះ: ${customerName}`,
                        truckPlateNumber && `ផ្លាកលេខ: ${truckPlateNumber}`,
                        driverName && `អ្នកបើកបរ: ${driverName}`,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </span>
                  ) : (
                    'ចុចទីនេះដើម្បីបង្ហាញ ឬទម្លាក់ចុះ (ចុចពង្រីក ឬទុកនៅទំនេរបាន)'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold shrink-0">
              <span className="hidden sm:inline">
                {isCustomerDropdownOpen ? 'បង្រួម (Close)' : 'ទម្លាក់ចុះ (Dropdown)'}
              </span>
              {isCustomerDropdownOpen ? (
                <ChevronUp className="w-5 h-5 text-primary-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {/* Dropdown Body Content */}
          {isCustomerDropdownOpen && (
            <div className="p-5 md:p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
              {/* Optional Quick Customer Selector from past invoices */}
              {pastCustomers.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200/70 text-xs">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-blue-900 mb-1">
                      ជ្រើសរើសពីអតិថិជនធ្លាប់កត់ត្រា (Select from previous customers dropdown):
                    </label>
                    <select
                      onChange={(e) => handleSelectPastCustomer(e.target.value)}
                      defaultValue=""
                      className="w-full px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg outline-none font-medium text-gray-800"
                    >
                      <option value="">-- ជ្រើសរើសពីបញ្ជីចាស់ ឬវាយបញ្ចូលថ្មីខាងក្រោម --</option>
                      {pastCustomers.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name} {c.plate ? `(ឡាន: ${c.plate})` : ''} {c.phone ? `- ${c.phone}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  {hasCustomerInfoFilled && (
                    <button
                      type="button"
                      onClick={handleClearCustomerFields}
                      className="px-2.5 py-1.5 text-[11px] text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer self-end flex items-center gap-1"
                      title="Clear to blank"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ទុកទំនេរ (Clear)</span>
                    </button>
                  )}
                </div>
              )}

              {/* 5 Input Fields (All 100% Optional / Can be blank) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    ឈ្មោះអតិថិជន / ម្ចាស់ទំនិញ
                    <span className="text-gray-400 font-normal ml-1">(ស្រេចចិត្ត / Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ឧ. សុខ ចាន់ដារ៉ា (អាចទុកនៅទំនេរបាន)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    លេខទូរស័ព្ទ (Phone Number)
                    <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="012 876 543"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    អាសយដ្ឋាន (Address / Depot Location)
                    <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="ឧ. ស្រុកសង្កែ ខេត្តបាត់ដំបង"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    ផ្លាកលេខរថយន្ត (Truck Plate #)
                    <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={truckPlateNumber}
                    onChange={(e) => setTruckPlateNumber(e.target.value)}
                    placeholder="ឧ. បាត់ដំបង 3B-8899"
                    className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none uppercase bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    ឈ្មោះអ្នកបើកបរ (Driver Name)
                    <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="ឧ. ម៉ៅ វិបុល"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleClearCustomerFields}
                    className="px-3 py-2 text-xs text-gray-600 hover:text-red-600 bg-white border border-gray-300 rounded-lg hover:border-red-300 transition-colors cursor-pointer w-full flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>លុបព័ត៌មានអតិថិជនចោល (Clear All)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: WEIGHBRIDGE SCALE CALCULATOR (Cambodian Cassava Scale) */}
        <div className="bg-white rounded-xl shadow-xs border-2 border-emerald-600/30 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-300" />
              <div>
                <h3 className="font-bold text-sm md:text-base font-khmer">
                  ម៉ាស៊ីនគណនាថ្លឹងជញ្ជីងរថយន្ត (Weighbridge Scale Calculator)
                </h3>
                <p className="text-[11px] text-emerald-200">
                  គណនាទម្ងន់សុទ្ធ កាត់ដី/សំណើម % និងទម្ងន់ទូទាត់ជាក់ស្តែងដោយស្វ័យប្រវត្តិ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWeighbridgeMode(!isWeighbridgeMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isWeighbridgeMode ? 'bg-emerald-500 text-white shadow-xs' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isWeighbridgeMode ? '✓ កំពុងបើកមុខងារថ្លឹង' : '+ បើកមុខងារថ្លឹង'}
            </button>
          </div>

          {isWeighbridgeMode && (
            <div className="p-5 md:p-6 bg-emerald-50/20 space-y-5">
              {/* Formula Explanation Callout */}
              <div className="px-4 py-2.5 bg-emerald-100/80 rounded-lg border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold flex items-center gap-1.5 font-khmer">
                  <span>📐 រូបមន្តគណនា៖</span>
                  <span className="font-mono text-emerald-950 font-black">
                    (ទម្ងន់សរុប Gross - ឡានទទេ Tare) × 0.9 (កាត់កង) × តម្លៃ/គីឡូ (Price/Kg)
                  </span>
                </span>
                <span className="text-[11px] text-emerald-700 bg-white/60 px-2 py-0.5 rounded">
                  មេគុណ 0.9 អាចកែសម្រួលបាន
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Gross Weight */}
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <label className="block font-semibold text-gray-700 mb-1">
                    ទម្ងន់សរុប (Gross Weight - {unit === 'ton' ? 'Tons' : 'Kg'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value ? Number(e.target.value) : '')}
                    placeholder={unit === 'ton' ? '34.50' : '34500'}
                    className="w-full px-3 py-2 text-base font-mono font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">ទម្ងន់ឡាន + ទំនិញ (Gross)</span>
                </div>

                {/* Tare Weight */}
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <label className="block font-semibold text-gray-700 mb-1">
                    ទម្ងន់ឡានទទេ (Tare Weight - {unit === 'ton' ? 'Tons' : 'Kg'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(e.target.value ? Number(e.target.value) : '')}
                    placeholder={unit === 'ton' ? '11.20' : '11200'}
                    className="w-full px-3 py-2 text-base font-mono font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">ទម្ងន់ឡានទទេ (Tare)</span>
                </div>

                {/* Deduction Factor (0.9 Fixed, can be adjusted) */}
                <div className="bg-white p-3 rounded-lg border-2 border-emerald-400 shadow-xs">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-emerald-900">
                      មេគុណកាត់កង (Deduction Factor)
                    </label>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                      Fixed 0.9
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={deductionFactor}
                    onChange={(e) => setDeductionFactor(e.target.value !== '' ? Number(e.target.value) : '')}
                    placeholder="0.9"
                    className="w-full px-3 py-2 text-base font-mono font-black border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-800"
                  />
                  <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                    គុណនឹង {factorNum} (អាចកែប្រែបាន / Can adjust)
                  </span>
                </div>

                {/* Price per Kg directly */}
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <label className="block font-semibold text-gray-700 mb-1">
                    តម្លៃក្នុង ១គីឡូ (Price / Kg - {currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={scaleProductPriceKg}
                    onChange={(e) => handleScalePricePerKgChange(e.target.value)}
                    placeholder="260"
                    className="w-full px-3 py-2 text-base font-mono font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-primary-700"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    ≈ {scaleProductPriceTon || 0} /{unit === 'ton' ? 'តោន' : '1000Kg'}
                  </span>
                </div>
              </div>

              {/* Realtime Scale Summary Dashboard (Responsive Grid on Mobile & Tablet) */}
              <div className="bg-emerald-100/70 p-3.5 sm:p-4 rounded-xl border border-emerald-300 space-y-3.5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[10px] sm:text-xs text-gray-500 font-semibold block">ទម្ងន់សុទ្ធ (Net: G - T)</span>
                    <strong className="text-sm sm:text-base font-mono font-bold text-gray-900 block truncate">
                      {netWeightCalc} {unit === 'ton' ? 'តោន' : 'Kg'}
                    </strong>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[10px] sm:text-xs text-gray-500 font-semibold block">មេគុណ (Factor)</span>
                    <strong className="text-sm sm:text-base font-mono font-bold text-emerald-700 block">
                      × {factorNum}
                    </strong>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border-2 border-emerald-400 shadow-2xs">
                    <span className="text-[10px] sm:text-xs text-emerald-800 font-bold block truncate">ទម្ងន់ទូទាត់ (Payable)</span>
                    <strong className="text-sm sm:text-base font-mono font-black text-emerald-700 block truncate">
                      {payableWeightCalc} {unit === 'ton' ? 'តោន' : 'Kg'}
                    </strong>
                  </div>

                  <div className="bg-emerald-800 text-white p-2.5 rounded-lg shadow-2xs">
                    <span className="text-emerald-200 text-[10px] block uppercase font-bold truncate">សរុបទឹកប្រាក់គណនា</span>
                    <strong className="text-sm sm:text-base font-mono font-black text-white block truncate">
                      {formatCurrency(
                        Math.round(
                          (unit === 'ton' ? payableWeightCalc * 1000 : payableWeightCalc) *
                            (Number(scaleProductPriceKg) || 0)
                        )
                      )}
                    </strong>
                  </div>
                </div>

                {/* Select Product and Add to Items */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-emerald-200/80">
                  <div className="flex-1 sm:max-w-xs">
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1 sm:hidden">មុខទំនិញដំឡូង:</label>
                    <select
                      value={scaleProductId}
                      onChange={(e) => setScaleProductId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg font-medium outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddFromWeighbridge}
                    className="h-10 px-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>បញ្ចូលទំនិញក្នុងវិក្កយបត្រ (Add to Invoice)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Direct Add Additional Item */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-5 md:p-6">
          <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary-600" />
            <span>បន្ថែមទំនិញដោយផ្ទាល់ (Add Item Manually)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end text-xs">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">មុខទំនិញ (Product)</label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="" disabled>-- ជ្រើសរើសមុខទំនិញ --</option>
                {products.map((p) => {
                  const priceKg = currency === 'USD' ? p.unitPrice / settings.exchangeRate : p.unitPrice;
                  const displayPrice = unit === 'ton' ? priceKg * 1000 : priceKg;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(displayPrice)}/{unit === 'ton' ? 'តោន' : 'គីឡូ'})
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedProductId && (
              <>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 whitespace-nowrap">
                    តម្លៃ/គីឡូ ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customPricePerKg}
                    onChange={(e) => handleCustomPricePerKgChange(e.target.value)}
                    placeholder="260"
                    className="w-full px-3 py-2 text-sm sm:text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 whitespace-nowrap">
                    តម្លៃ/តោន ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customPricePerTon}
                    onChange={(e) => handleCustomPricePerTonChange(e.target.value)}
                    placeholder="260000"
                    className="w-full px-3 py-2 text-sm sm:text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-gray-700 mb-1 whitespace-nowrap">
                បរិមាណ ({unit === 'ton' ? 'Tons' : 'Kg'})
              </label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                placeholder={unit === 'ton' ? '15.5' : '15500'}
                className="w-full px-3 py-2 text-sm sm:text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddManualItem}
                className="w-full h-10 px-4 bg-primary-100 text-primary-800 font-bold rounded-xl hover:bg-primary-200 active:bg-primary-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>បន្ថែម (Add)</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: Items Table & Mobile Cards */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="p-3.5 sm:p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-xs sm:text-sm text-gray-800">
              បញ្ជីមុខទំនិញក្នុងវិក្កយបត្រ (Items in Invoice) — ({items.length} មុខ)
            </h3>
          </div>

          {/* MOBILE ITEMS LIST (< 640px) */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {items.map((item, index) => (
              <div key={index} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block">#{index + 1}</span>
                    <h4 className="text-xs font-bold text-gray-900">{item.productName}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-50/80 p-2 rounded-lg text-[11px] font-mono">
                  <div>
                    <span className="text-[9px] text-gray-400 block font-sans">បរិមាណ</span>
                    <span className="font-bold text-gray-800">
                      {item.quantity} {unit === 'ton' ? 'តោន' : 'Kg'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block font-sans">តម្លៃឯកតា</span>
                    <span className="text-gray-700">{formatCurrency(item.unitPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 block font-sans">សរុប</span>
                    <span className="font-bold text-emerald-800">{formatCurrency(item.total)}</span>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-xs">
                មិនទាន់មានទំនិញនៅឡើយទេ សូមប្រើម៉ាស៊ីនថ្លឹង ឬបន្ថែមទំនិញខាងលើ
              </div>
            )}
          </div>

          {/* TABLE VIEW (Tablet & Desktop: >= 640px) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3">មុខទំនិញ (Description)</th>
                  <th className="p-3 text-right">បរិមាណ (Qty)</th>
                  <th className="p-3 text-right">តម្លៃឯកតា (Unit Price)</th>
                  <th className="p-3 text-right">សរុប (Total)</th>
                  <th className="p-3 text-center w-14">លុប</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/70">
                    <td className="p-3 text-center text-gray-500 font-mono">{index + 1}</td>
                    <td className="p-3 font-semibold text-gray-900">{item.productName}</td>
                    <td className="p-3 text-right font-mono">
                      {item.quantity} {unit === 'ton' ? 'តោន' : 'គីឡូ'}
                    </td>
                    <td className="p-3 text-right font-mono text-gray-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors inline-block cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      មិនទាន់មានទំនិញនៅឡើយទេ សូមប្រើម៉ាស៊ីនថ្លឹង ឬបន្ថែមទំនិញខាងលើ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 6: Payment Settlement & Deposit */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                វិធីសាស្ត្រទូទាត់ប្រាក់ (Payment Method)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'border-primary-600 bg-primary-50 text-primary-900'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  💵 សាច់ប្រាក់ (Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'border-primary-600 bg-primary-50 text-primary-900'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📱 ផ្ទេរ / KHQR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                    paymentMethod === 'credit'
                      ? 'border-primary-600 bg-primary-50 text-primary-900'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📝 ជំពាក់ (Credit)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ចំណាំបន្ថែម (Notes / Special Conditions)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="ព័ត៌មានបន្ថែម គុណភាពដំឡូង ឬលក្ខខណ្ឌនៃការទូទាត់..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-white"
              />
            </div>
          </div>

          {/* Totals & Deposit Box */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3 text-xs">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
              <span>សរុបទឹកប្រាក់ទំនិញ (Subtotal):</span>
              <span className="font-mono text-base font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600">ប្រាក់កក់ / បើកមុន (Advance Deposit):</span>
              <div className="w-36">
                <input
                  type="number"
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0"
                  className="w-full px-3 py-1.5 text-sm font-mono text-right border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center">
              <div>
                <span className="text-sm font-bold text-primary-900 block font-khmer">
                  ទឹកប្រាក់ត្រូវទូទាត់ជាក់ស្តែង:
                </span>
                <span className="text-[10px] text-gray-500">Net Payable Balance</span>
              </div>
              <span className="font-mono text-xl font-black text-primary-800">
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2">
          {existingInvoice ? (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-3 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>លុបវិក្កយបត្រនេះ (Delete Invoice)</span>
            </button>
          ) : <div />}

          <button
            type="submit"
            className="px-8 py-3.5 bg-primary-700 text-white font-bold rounded-xl hover:bg-primary-800 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm"
          >
            <Save className="w-5 h-5" />
            <span>រក្សាទុក & មើលវិក្កយបត្រ (Save & Preview Invoice)</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && existingInvoice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-khmer">
                  លុបវិក្កយបត្រ (Delete Invoice)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {existingInvoice.invoiceNumber}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-khmer">
              តើអ្នកពិតជាចង់លុបវិក្កយបត្រលេខ <strong>{existingInvoice.invoiceNumber}</strong> របស់អតិថិជន{' '}
              <strong>{existingInvoice.customerName || 'ទូទៅ'}</strong> នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = existingInvoice.id;
                  setShowDeleteModal(false);
                  deleteInvoice(targetId);
                  if (onDelete) {
                    onDelete();
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុបចេញ (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
