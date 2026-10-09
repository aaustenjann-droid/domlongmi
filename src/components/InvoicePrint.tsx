import { useState, useRef, useEffect, Fragment } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useStore } from '../store';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Stamp,
  Scale,
  Edit,
  Trash2,
  Truck,
  Languages,
  Sparkles,
  Receipt,
  Download,
} from 'lucide-react';
import { numberToKhmerWords, numberToEnglishWords } from '../utils/khmerCurrency';
import { QRCodeSVG } from 'qrcode.react';

export type InvoiceVisualStyle = 'clean' | 'slip';

interface InvoicePrintProps {
  id: string;
  onBack: () => void;
  onEdit?: (id: string) => void;
}

export default function InvoicePrint({ id, onBack, onEdit }: InvoicePrintProps) {
  const { invoices, settings, deleteInvoice } = useStore();
  const invoice = invoices.find((inv) => inv.id === id);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeStyle, setActiveStyle] = useState<InvoiceVisualStyle>(() => {
    const pref = (invoice?.templateStyle || settings.invoiceTemplate) as InvoiceVisualStyle;
    if (pref === 'clean' || pref === 'slip') {
      return pref;
    }
    return 'clean';
  });
  const [printLanguage, setPrintLanguage] = useState<'khmer' | 'english' | 'both'>(
    invoice?.invoiceLanguage || settings.invoiceLanguage || 'both'
  );
  const [showCustomerInfo, setShowCustomerInfo] = useState(
    Boolean(invoice?.customerName || invoice?.truckPlateNumber)
  );
  const [showStamp, setShowStamp] = useState(settings.showStamp ?? true);
  const [showQr, setShowQr] = useState(true);
  const [showWeighbridge, setShowWeighbridge] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [zoomMode, setZoomMode] = useState<'fit' | 'full'>('fit');
  const workspaceRef = useRef<HTMLDivElement>(null);
  const printableAreaRef = useRef<HTMLDivElement>(null);
  const [workspaceWidth, setWorkspaceWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth - 32 : 760
  );
  const [contentHeight, setContentHeight] = useState<number>(1080);

  useEffect(() => {
    const updateDims = () => {
      if (workspaceRef.current) {
        setWorkspaceWidth(workspaceRef.current.clientWidth);
      } else if (typeof window !== 'undefined') {
        setWorkspaceWidth(window.innerWidth - 32);
      }
      if (printableAreaRef.current) {
        setContentHeight(printableAreaRef.current.scrollHeight || 1080);
      }
    };

    updateDims();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateDims();
      });
      if (workspaceRef.current) resizeObserver.observe(workspaceRef.current);
      if (printableAreaRef.current) resizeObserver.observe(printableAreaRef.current);
    }

    window.addEventListener('resize', updateDims);
    return () => {
      window.removeEventListener('resize', updateDims);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [activeStyle]);

  // For A4 Clean Template: base width is 760px.
  // If available workspace width is less than 760px, calculate exact scale:
  const availableWidth = workspaceWidth > 0 ? workspaceWidth - 16 : 760;
  const baseWidth = 760;
  const calculatedScale = availableWidth < baseWidth ? availableWidth / baseWidth : 1;
  const scaleFactor = zoomMode === 'fit' ? calculatedScale : 1;

  if (!invoice) {
    return (
      <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 max-w-lg mx-auto mt-10">
        <p className="text-red-500 font-medium text-lg mb-2">រកមិនឃើញវិក្កយបត្រ (Invoice not found)</p>
        <p className="text-gray-500 text-sm mb-6">
          វិក្កយបត្រដែលអ្នកស្វែងរកប្រហែលជាត្រូវបានលុប ឬមិនមាននៅក្នុងប្រព័ន្ធ។
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          ត្រឡប់ក្រោយ (Go Back)
        </button>
      </div>
    );
  }

  const [isPrinting, setIsPrinting] = useState(false);

  const reactToPrintFn = useReactToPrint({
    contentRef: printableAreaRef,
    documentTitle: invoice ? `${invoice.invoiceNumber}` : 'Invoice',
    pageStyle: `
      @page {
        size: ${activeStyle === 'clean' ? 'A4 portrait' : '80mm auto'};
        margin: 0;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
      }
    `,
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    onPrintError: (errorLocation, error) => {
      console.warn('ReactToPrint failed:', errorLocation, error);
      setIsPrinting(false);
      try {
        window.print();
      } catch (e) {
        console.error('window.print() fallback failed:', e);
      }
    },
  });

  const handlePrint = () => {
    setIsPrinting(true);
    try {
      if (typeof reactToPrintFn === 'function') {
        reactToPrintFn();
      } else {
        window.print();
        setTimeout(() => setIsPrinting(false), 800);
      }
    } catch (err) {
      console.warn('ReactToPrint trigger failed, attempting window.print():', err);
      try {
        window.print();
      } catch (err2) {
        console.error('window.print() also failed:', err2);
      }
      setTimeout(() => setIsPrinting(false), 800);
    }
  };

  const formatCurrency = (amount: number, curr: 'KHR' | 'USD' = invoice.currency) => {
    if (curr === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amount);
    }
    return (
      new Intl.NumberFormat('km-KH', {
        maximumFractionDigits: 0,
      }).format(amount) + ' ៛'
    );
  };

  const equivalentAmount =
    invoice.currency === 'KHR'
      ? invoice.totalAmount / (invoice.exchangeRate || settings.exchangeRate || 4100)
      : invoice.totalAmount * (invoice.exchangeRate || settings.exchangeRate || 4100);

  const amountInWords =
    printLanguage === 'english'
      ? numberToEnglishWords(invoice.totalAmount)
      : numberToKhmerWords(invoice.totalAmount);

  const unitLabelKh = invoice.unit === 'ton' ? 'តោន' : 'គីឡូក្រាម';
  const unitLabelEn = invoice.unit === 'ton' ? 'Tons' : 'Kg';

  const qrPaymentPayload = `KHQR:${settings.bankName || 'ABA'}|ACC:${
    settings.bankAccountNumber || '001888999'
  }|AMT:${invoice.totalAmount}|CUR:${invoice.currency}|INV:${invoice.invoiceNumber}`;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Top Action & Style Controls - Hidden when Printing */}
      <div className="print:hidden space-y-3 mb-6">
        {/* Navigation & Two Styles Bar: Responsive on mobile & tablet */}
        <div className="flex flex-col gap-3 bg-white p-3 sm:p-3.5 rounded-xl shadow-sm border border-gray-100">
          {/* Mobile/Tablet Screen Fit Toggle & Scroll Hint (Moved to Top) */}
          {activeStyle === 'clean' && availableWidth < 760 && (
            <div className="flex items-center justify-between w-full pb-2.5 text-xs text-slate-600 border-b border-gray-100 px-1">
              <span className="font-khmer font-medium">
                {zoomMode === 'fit' ? '📱 ពង្រីកសមនឹងអេក្រង់ (Auto-fit to screen)' : '↔ រមូរឆ្វេង-ស្តាំ (100% Full size)'}
              </span>
              <button
                type="button"
                onClick={() => setZoomMode(zoomMode === 'fit' ? 'full' : 'fit')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-md border border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                {zoomMode === 'fit' ? 'ទំហំពិត 100% (Full)' : 'សមនឹងអេក្រង់ (Fit)'}
              </button>
            </div>
          )}

          {/* Row 1: Back, Edit, Delete */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1 px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-xs sm:text-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden xs:inline">បញ្ជីវីក្កយបត្រ</span>
                <span className="xs:hidden">ត្រឡប់</span>
              </button>
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(invoice.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium text-xs sm:text-sm border border-blue-200 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>កែសម្រួល</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium text-xs sm:text-sm border border-rose-200 cursor-pointer"
                title="Delete Invoice"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>លុប</span>
              </button>
            </div>
          </div>

          {/* Row 2: Styles, Languages, and Unified Print & PDF Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
            {/* Style Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveStyle('clean')}
                className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                  activeStyle === 'clean'
                    ? 'bg-white text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>សាមញ្ញ (Clean)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStyle('slip')}
                className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                  activeStyle === 'slip'
                    ? 'bg-white text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3 h-3 text-amber-700" />
                <span>បង្កាន់ដៃ (Slip)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Language Switch */}
              <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPrintLanguage('both')}
                  className={`px-1.5 sm:px-2 py-1 rounded font-medium cursor-pointer text-[11px] sm:text-xs ${
                    printLanguage === 'both' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600'
                  }`}
                >
                  ទាំងពីរ
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLanguage('khmer')}
                  className={`px-1.5 sm:px-2 py-1 rounded font-medium cursor-pointer text-[11px] sm:text-xs ${
                    printLanguage === 'khmer' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600'
                  }`}
                >
                  ខ្មែរ
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLanguage('english')}
                  className={`px-1.5 sm:px-2 py-1 rounded font-medium cursor-pointer text-[11px] sm:text-xs ${
                    printLanguage === 'english' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Print & PDF Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 active:scale-95 transition-all shadow-sm cursor-pointer text-xs sm:text-sm disabled:opacity-75"
                  title="បោះពុម្ពវិក្កយបត្រ (Print Invoice)"
                >
                  <Printer className={`w-4 h-4 text-emerald-400 ${isPrinting ? 'animate-pulse' : ''}`} />
                  <span>{isPrinting ? '...' : 'បោះពុម្ព'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 active:scale-95 transition-all shadow-sm cursor-pointer text-xs sm:text-sm disabled:opacity-75"
                  title="ទាញយកជា PDF (Download PDF)"
                >
                  <Download className={`w-4 h-4 text-white ${isPrinting ? 'animate-pulse' : ''}`} />
                  <span>ទាញយក PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* A4 Paper Sheet Workspace with horizontal scroll for exact desktop preview */}
      <div
        ref={workspaceRef}
        className={`p-2 sm:p-4 md:p-6 lg:p-8 rounded-2xl flex flex-col items-center overflow-x-auto w-full transition-all ${
          activeStyle === 'clean' ? 'bg-slate-200/80 shadow-inner' : 'bg-gray-100/80'
        }`}
      >
        {/* Viewport container */}
        <div className="w-full flex justify-center">
          {/* Scaled Wrapper for centering and sizing */}
          <div
            style={
              scaleFactor < 1 && zoomMode === 'fit'
                ? {
                    width: `${baseWidth * scaleFactor}px`,
                    height: `${contentHeight * scaleFactor}px`,
                    maxWidth: '100%',
                  }
                : {
                    width: activeStyle === 'clean' ? '760px' : '100%',
                    maxWidth: '100%',
                  }
            }
            className="relative mx-auto flex justify-center"
          >
            {/* PHYSICAL A4 PAPER SHEET CONTAINER (Maintains true A4 proportions: width 210mm / min 760px) */}
            <div
              ref={printableAreaRef}
              id="printable-area"
              style={
                scaleFactor < 1 && zoomMode === 'fit'
                  ? {
                      transform: `scale(${scaleFactor})`,
                      transformOrigin: 'top left',
                      width: `${baseWidth}px`,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }
                  : undefined
              }
              className={
                activeStyle === 'clean'
                  ? 'w-[210mm] min-w-[760px] max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-[0_14px_50px_rgba(0,0,0,0.16)] border border-slate-300/90 rounded-none print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-full print:min-w-0 print:min-h-0 print:m-0 print:p-0 transition-all'
                  : 'w-full max-w-[130mm] bg-white text-slate-900 shadow-lg border border-slate-300/80 rounded-lg print:shadow-none print:border-none print:rounded-none'
              }
            >
          {activeStyle === 'clean' ? (
            <CleanInvoiceTemplate
              invoice={invoice}
              settings={settings}
              formatCurrency={formatCurrency}
              equivalentAmount={equivalentAmount}
              amountInWords={amountInWords}
              unitLabelKh={unitLabelKh}
              unitLabelEn={unitLabelEn}
              showCustomerInfo={showCustomerInfo}
              showStamp={showStamp}
              showQr={showQr}
              showWeighbridge={showWeighbridge}
              showSignatures={showSignatures}
              qrPaymentPayload={qrPaymentPayload}
              language={printLanguage}
            />
          ) : (
            <CompactScaleSlipTemplate
              invoice={invoice}
              settings={settings}
              formatCurrency={formatCurrency}
              equivalentAmount={equivalentAmount}
              amountInWords={amountInWords}
              unitLabelKh={unitLabelKh}
              unitLabelEn={unitLabelEn}
              showCustomerInfo={showCustomerInfo}
              showStamp={showStamp}
              showQr={showQr}
              showWeighbridge={showWeighbridge}
              showSignatures={showSignatures}
              qrPaymentPayload={qrPaymentPayload}
              language={printLanguage}
            />
          )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (Native In-App Dialog, no window.confirm) */}
      {showDeleteModal && (
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
                  {invoice.invoiceNumber}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-khmer">
              តើអ្នកពិតជាចង់លុបវិក្កយបត្រលេខ <strong>{invoice.invoiceNumber}</strong> របស់អតិថិជន{' '}
              <strong>{invoice.customerName || 'ទូទៅ'}</strong> នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
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
                  const targetId = invoice.id;
                  setShowDeleteModal(false);
                  deleteInvoice(targetId);
                  onBack();
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

// -------------------------------------------------------------
// Format Clean Date Helper
// -------------------------------------------------------------
function formatCleanDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch (e) {}
  return dateStr;
}

interface CommonTemplateProps {
  invoice: any;
  settings: any;
  formatCurrency: (amount: number, curr?: 'KHR' | 'USD') => string;
  equivalentAmount: number;
  amountInWords: string;
  unitLabelKh: string;
  unitLabelEn: string;
  showCustomerInfo: boolean;
  showStamp: boolean;
  showQr: boolean;
  showWeighbridge: boolean;
  showSignatures: boolean;
  qrPaymentPayload: string;
  language?: 'khmer' | 'english' | 'both';
}

// ============================================================================
// STYLE 1: CLEAN INVOICE ON A4 PAPER SHEET
// (Gross Weight, Tare Weight, Net Weight, Deduction Factor, and Payable Weight
// on DIFFERENT ROWS in table, sized perfectly for standard A4 paper 210mm × 297mm)
// ============================================================================
function CleanInvoiceTemplate({
  invoice,
  settings,
  formatCurrency,
  equivalentAmount,
  amountInWords,
  unitLabelKh,
  unitLabelEn,
  showCustomerInfo,
  showStamp,
  showQr,
  showWeighbridge,
  showSignatures,
  qrPaymentPayload,
  language = 'both',
}: CommonTemplateProps) {
  const wb = invoice.weighbridge;
  const companyNameEn = settings.companyNameEnglish || 'CHEY MAB PRODUCE DEPOT';
  const companyNameKh = settings.companyNameKhmer || 'ដេប៉ូ ចែម៉ាប់';

  const subtotal = invoice.totalAmount;
  const finalTotal =
    invoice.remainingAmount ?? invoice.totalAmount - (invoice.depositAmount || 0);
  const isPaid = invoice.paymentStatus === 'paid';
  const isPartial = invoice.paymentStatus === 'partial';

  return (
    <div className="w-full h-full min-h-[297mm] p-6 sm:p-8 text-slate-900 bg-white flex flex-col justify-between print:p-0 print:m-0 print:min-h-0">
      <div>
        {/* Top Header: Unboxed Minimalist Brand & Editorial Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-6 mb-6 border-b border-slate-200 gap-6">
          <div>
            <h2 className="font-serif-luxury text-3xl font-bold tracking-tight text-slate-950">
              {companyNameEn}
            </h2>
            {companyNameKh && (
              <p className="font-khmer text-sm text-slate-800 font-semibold mt-1">
                {companyNameKh}
              </p>
            )}
            {/* Clean inline unboxed metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono mt-2">
              {settings.companyTagline && (
                <>
                  <span>{settings.companyTagline}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              {settings.companyPhone && (
                <>
                  <span>Tel: {settings.companyPhone}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>Weighbridge Scale Depot</span>
            </div>
            {settings.companyAddressKhmer && (
              <p className="text-xs text-slate-500 font-khmer mt-1 max-w-md">
                {settings.companyAddressKhmer}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right shrink-0">
            <h1 className="text-4xl md:text-5xl font-serif-luxury font-normal text-slate-950 tracking-tight">
              Invoice
            </h1>
            <div className="flex items-center sm:justify-end gap-2 text-xs font-mono mt-2">
              <span className="text-slate-400 uppercase tracking-wider font-semibold">
                COMMERCIAL INVOICE
              </span>
              <span aria-hidden="true">·</span>
              {isPaid ? (
                <span className="text-emerald-700 font-bold uppercase tracking-wider">
                  ● PAID IN FULL
                </span>
              ) : isPartial ? (
                <span className="text-amber-700 font-bold uppercase tracking-wider">
                  ● PARTIAL DEPOSIT
                </span>
              ) : (
                <span className="text-rose-700 font-bold uppercase tracking-wider">
                  ○ DUE UPON RECEIPT
                </span>
              )}
            </div>

            <div className="mt-3 space-y-1 text-xs font-mono text-slate-600">
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-bold text-slate-950">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400">Issue Date:</span>
                <span>{formatCleanDate(invoice.date)}</span>
              </div>
              {invoice.time && (
                <div className="flex sm:justify-end items-center gap-2">
                  <span className="text-slate-400">Time:</span>
                  <span>{invoice.time}</span>
                </div>
              )}
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400">Currency:</span>
                <span className="font-semibold text-slate-900">{invoice.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Transport Info (Clean 2-Column Unboxed) */}
        {showCustomerInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 mb-8 border-b border-slate-100 text-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
                BILLED TO / ចេញជូនអតិថិជន
              </p>
              <p className="text-base font-bold text-slate-950 font-khmer">
                {invoice.customerName || 'អតិថិជនទូទៅ (Customer)'}
              </p>
              {invoice.customerPhone && (
                <p className="text-slate-600 font-mono mt-1">Tel: {invoice.customerPhone}</p>
              )}
              {invoice.customerAddress && (
                <p className="text-slate-500 font-khmer mt-1 max-w-sm">
                  {invoice.customerAddress}
                </p>
              )}
            </div>

            <div className="space-y-1.5 md:text-right">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">
                TRANSPORT & WEIGHBRIDGE / ការដឹកជញ្ជូន
              </p>
              {invoice.truckPlateNumber ? (
                <p className="text-sm font-bold text-slate-900 font-mono">
                  Plate No: <span className="font-black text-slate-950">{invoice.truckPlateNumber}</span>
                </p>
              ) : (
                <p className="text-slate-400 italic">Plate No: Unspecified</p>
              )}
              {invoice.driverName && (
                <p className="text-slate-700 font-khmer">
                  Driver / អ្នកបើកបរ: <strong>{invoice.driverName}</strong>
                </p>
              )}
              <p className="text-slate-500 font-mono">
                Unit of Measure: {unitLabelKh} ({unitLabelEn})
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WEIGHBRIDGE BREAKDOWN & ITEMS: Matching the exact slip style from image   */}
        {/* ========================================================================= */}
        <div className="mb-6 w-full space-y-3.5 font-mono">
          {/* Metadata Bar (Slip No / Date) */}
          <div className="py-3 border-y border-dashed border-slate-300 flex flex-wrap justify-between items-center text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Invoice No:</span>
              <strong className="text-slate-950 font-bold text-sm sm:text-base">{invoice.invoiceNumber}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Date:</span>
              <span className="text-slate-900 font-semibold">{formatCleanDate(invoice.date)} {invoice.time || ''}</span>
            </div>
          </div>

          {/* Weighbridge Breakdown */}
          {wb && showWeighbridge && (
            <div className="py-3 sm:py-3.5 border-b border-dashed border-slate-300 space-y-2 sm:space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-khmer text-slate-700 text-sm sm:text-base font-semibold">
                  ទម្ងន់សរុប (Gross):
                </span>
                <strong className="text-slate-950 font-bold text-base sm:text-lg font-mono">
                  {wb.grossWeight.toLocaleString()} {unitLabelKh}
                </strong>
              </div>
              <div className="flex justify-between items-center text-rose-700">
                <span className="font-khmer font-semibold text-sm sm:text-base">
                  ទម្ងន់រថយន្តទទេ (Tare):
                </span>
                <strong className="font-bold text-base sm:text-lg font-mono">
                  -{wb.tareWeight.toLocaleString()} {unitLabelKh}
                </strong>
              </div>
              <div className="flex justify-between items-center text-blue-900 font-bold">
                <span className="font-khmer text-sm sm:text-base">
                  ទម្ងន់ទំនិញសុទ្ធ (Net):
                </span>
                <strong className="text-base sm:text-lg font-mono">
                  {wb.netWeight.toLocaleString()} {unitLabelKh}
                </strong>
              </div>
              {wb.deductionFactor && (
                <div className="flex justify-between items-center text-amber-800">
                  <span className="font-khmer font-semibold text-sm sm:text-base">
                    មេគុណកាត់កង (Factor):
                  </span>
                  <strong className="text-base sm:text-lg font-mono">
                    ×{wb.deductionFactor}
                  </strong>
                </div>
              )}
              <div className="flex justify-between items-center text-emerald-950 font-black border-t border-slate-300 pt-2.5 mt-1 text-base sm:text-lg">
                <span className="font-khmer font-bold">
                  ទម្ងន់ទូទាត់ (Payable):
                </span>
                <span className="text-lg sm:text-xl font-black font-mono">
                  {wb.payableWeight.toLocaleString()} {unitLabelKh}
                </span>
              </div>
            </div>
          )}

          {/* Items list */}
          <div className="py-3 sm:py-3.5 border-b-2 border-dashed border-slate-300 space-y-2.5">
            {invoice.items.map((item: any, idx: number) => {
              const isWbItem = idx === 0 && wb;
              const itemQty =
                isWbItem &&
                invoice.unit === 'kg' &&
                item.quantity > 50000 &&
                wb.payableWeight < 50000
                  ? wb.payableWeight
                  : item.quantity;

              return (
                <div key={item.id || idx} className="space-y-1">
                  <div className="font-khmer font-bold text-slate-950 text-base sm:text-lg">
                    {item.productName}
                  </div>
                  <div className="flex justify-between items-baseline text-slate-700 text-sm sm:text-base font-mono">
                    <span>
                      {itemQty.toLocaleString()} {unitLabelKh} × {formatCurrency(item.unitPrice)}
                    </span>
                    <strong className="text-slate-950 font-black text-lg sm:text-xl">
                      {formatCurrency(item.total)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment QR (Left) and Total Due (Right) side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-8 pt-2">
          {/* Left Side: Pure QR Code without outline boxes */}
          {showQr ? (
            <div className="flex items-end">
              <QRCodeSVG value={qrPaymentPayload} size={215} />
            </div>
          ) : (
            <div></div>
          )}

          {/* Right Side: Payment Info (on top of Total, align start) & Total Due */}
          <div className="space-y-3">
            {/* Bank Payment Info moved on top of Total Due, aligned start */}
            {showQr && (
              <div className="text-left space-y-1 pb-3 border-b border-slate-200/90">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  SCAN TO PAY / ស្កេនទូទាត់
                </p>
                <p className="font-black text-slate-950 text-base">{settings.bankName || 'ABA Bank'}</p>
                <div className="text-xs text-slate-600 font-mono space-y-0.5">
                  <p>
                    Name: <strong className="text-slate-900 font-semibold">{settings.bankAccountName || companyNameEn}</strong>
                  </p>
                  <p className="text-slate-900">
                    Account:{' '}
                    <strong className="text-sm sm:text-base font-black text-slate-950 tracking-wider">
                      {settings.bankAccountNumber || '001 888 999'}
                    </strong>
                  </p>
                </div>
              </div>
            )}

            {invoice.depositAmount && invoice.depositAmount > 0 ? (
              <div className="flex justify-between items-center py-1 text-rose-700 font-mono text-xs sm:text-sm">
                <span className="uppercase tracking-wider">Advance Deposit / ប្រាក់កក់:</span>
                <span className="font-bold">
                  -{formatCurrency(invoice.depositAmount)}
                </span>
              </div>
            ) : null}

            {/* Grand Total - Matching screenshot */}
            <div className="border-t-2 border-b-2 border-slate-950 py-3 flex justify-between items-baseline font-black font-mono">
              <span className="text-sm sm:text-base tracking-wider text-slate-900">TOTAL:</span>
              <span className="text-2xl sm:text-3xl text-slate-950">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            {/* Amount In Words Quote */}
            <p className="text-right text-xs sm:text-sm font-khmer text-slate-600 pt-0.5 italic">
              « {amountInWords} »
            </p>
          </div>
        </div>
      </div>

      {/* Signatures & Clean Footer: Bigger & more prominent per user request */}
      <div className="pt-8 border-t border-slate-200">
        {showSignatures && (
          <div className="grid grid-cols-2 gap-10 text-xs sm:text-sm pb-6">
            <div>
              <p className="font-bold text-slate-950 font-mono text-xs sm:text-sm uppercase tracking-wider">
                Receiver Signature
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-khmer mt-0.5">ហត្ថលេខាអ្នកទទួលទំនិញ</p>
              <div className="mt-16 sm:mt-20 border-b-2 border-slate-400 w-52 sm:w-64"></div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 font-mono mt-2">
                {invoice.customerName || 'Customer / Receiver'}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-950 font-mono text-xs sm:text-sm uppercase tracking-wider">
                Authorized Signatory
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-khmer mt-0.5">ហត្ថលេខាអ្នកមានសិទ្ធិ</p>
              <div className="mt-16 sm:mt-20 border-b-2 border-slate-400 w-52 sm:w-64 ml-auto"></div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 font-mono mt-2">
                {invoice.driverName || settings.sellerName || 'Authorized Signatory'}
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 font-mono pt-4">
          Commercial Weighbridge Invoice • វិក្កយបត្រថ្លឹងទំនិញស្របច្បាប់
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// STYLE 2: COMPACT SCALE SLIP (80mm Scale Receipt Ticket)
// Dotted dividers, compact receipt typography, optimized for scale vouchers.
// ============================================================================
function CompactScaleSlipTemplate(props: CommonTemplateProps) {
  const {
    invoice,
    settings,
    formatCurrency,
    amountInWords,
    unitLabelKh,
    showStamp,
    showQr,
    showWeighbridge,
    qrPaymentPayload,
  } = props;

  const wb = invoice.weighbridge;
  const companyNameEn = settings.companyNameEnglish || 'CHEY MAB PRODUCE DEPOT';
  const companyNameKh = settings.companyNameKhmer || 'ដេប៉ូ ចែម៉ាប់';
  const finalTotal =
    invoice.remainingAmount ?? invoice.totalAmount - (invoice.depositAmount || 0);

  return (
    <div className="w-full max-w-[130mm] mx-auto p-6 text-slate-900 bg-white font-mono text-xs print:p-2 print:w-full print:max-w-full">
      <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
        <h2 className="font-moul text-base text-slate-950">{companyNameKh}</h2>
        <p className="text-[11px] text-slate-600">{companyNameEn}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {settings.companyPhone && `Tel: ${settings.companyPhone}`}
        </p>
        <p className="text-xs font-bold text-slate-900 mt-2 uppercase tracking-wider">
          *** បង្កាន់ដៃថ្លឹងទំនិញ (SCALE TICKET) ***
        </p>
      </div>

      <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Slip No:</span>
          <strong>{invoice.invoiceNumber}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Date:</span>
          <span>{formatCleanDate(invoice.date)} {invoice.time || ''}</span>
        </div>
        {invoice.customerName && (
          <div className="flex justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-khmer font-bold">{invoice.customerName}</span>
          </div>
        )}
        {invoice.truckPlateNumber && (
          <div className="flex justify-between">
            <span className="text-slate-500">Truck Plate:</span>
            <strong>{invoice.truckPlateNumber}</strong>
          </div>
        )}
      </div>

      {wb && showWeighbridge && (
        <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>ទម្ងន់សរុប (Gross):</span>
            <strong>{wb.grossWeight.toLocaleString()} {unitLabelKh}</strong>
          </div>
          <div className="flex justify-between text-rose-700">
            <span>ទម្ងន់រថយន្តទទេ (Tare):</span>
            <strong>-{wb.tareWeight.toLocaleString()} {unitLabelKh}</strong>
          </div>
          <div className="flex justify-between text-blue-900 font-bold">
            <span>ទម្ងន់ទំនិញសុទ្ធ (Net):</span>
            <strong>{wb.netWeight.toLocaleString()} {unitLabelKh}</strong>
          </div>
          {wb.deductionFactor && (
            <div className="flex justify-between text-amber-800">
              <span>មេគុណកាត់កង (Factor):</span>
              <strong>×{wb.deductionFactor}</strong>
            </div>
          )}
          <div className="flex justify-between text-emerald-950 font-black border-t border-slate-200 pt-1">
            <span>ទម្ងន់ទូទាត់ (Payable):</span>
            <span>{wb.payableWeight.toLocaleString()} {unitLabelKh}</span>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="py-2.5 border-b-2 border-dashed border-slate-300 space-y-2">
        {invoice.items.map((item: any, idx: number) => (
          <div key={idx} className="space-y-0.5">
            <div className="font-khmer font-bold text-slate-950">{item.productName}</div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>{item.quantity.toLocaleString()} {unitLabelKh} × {formatCurrency(item.unitPrice)}</span>
              <strong className="text-slate-900">{formatCurrency(item.total)}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="py-3 border-b-2 border-dashed border-slate-300 space-y-1 text-sm">
        <div className="flex justify-between items-baseline font-black">
          <span className="text-xs">TOTAL:</span>
          <span className="text-lg">{formatCurrency(finalTotal)}</span>
        </div>
        <p className="text-[10px] font-khmer text-slate-500 italic text-right">
          « {amountInWords} »
        </p>
      </div>

      {showQr && (
        <div className="py-3 text-center border-b border-dashed border-slate-300">
          <div className="inline-block p-1 bg-white border border-slate-200 rounded">
            <QRCodeSVG value={qrPaymentPayload} size={80} />
          </div>
          <span className="text-[9px] text-slate-500 block mt-1">KHQR PAYMENT</span>
        </div>
      )}

      {showStamp && (
        <div className="py-2 text-center text-red-600 font-bold text-xs uppercase tracking-widest">
          ★ PAID IN FULL / បានទូទាត់ប្រាក់រួច ★
        </div>
      )}

      <div className="text-center pt-3 text-[10px] text-slate-400">
        *** សូមអរគុណ! THANK YOU! ***
      </div>
    </div>
  );
}
