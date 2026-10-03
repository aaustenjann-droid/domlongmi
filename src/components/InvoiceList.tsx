import { useState } from 'react';
import { useStore } from '../store';
import { FileText, Eye, Trash2, Edit, Plus, Scale, Search, RefreshCw, Truck } from 'lucide-react';

interface InvoiceListProps {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
}

export default function InvoiceList({ onView, onEdit, onCreateNew }: InvoiceListProps) {
  const { invoices, deleteInvoice, resetToSampleData } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<any | null>(null);

  const formatCurrency = (amount: number, currency: 'KHR' | 'USD' = 'KHR') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }
    return new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR', maximumFractionDigits: 0 }).format(amount);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      (inv.truckPlateNumber && inv.truckPlateNumber.toLowerCase().includes(q)) ||
      (inv.driverName && inv.driverName.toLowerCase().includes(q))
    );
  });

  // Calculate statistics
  const totalTonnage = invoices.reduce((sum, inv) => {
    return (
      sum +
      inv.items.reduce((s, it) => s + (inv.unit === 'ton' ? it.quantity : it.quantity / 1000), 0)
    );
  }, 0);

  const totalKhr = invoices
    .filter((inv) => inv.currency === 'KHR')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalUsd = invoices
    .filter((inv) => inv.currency === 'USD')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-moul">
            ប្រវត្តិវិក្កយបត្រ & ប័ណ្ណថ្លឹងទំនិញ
          </h2>
          <p className="text-sm text-gray-500">
            គ្រប់គ្រងការទិញ-លក់ដំឡូងមី ថ្លឹងរថយន្ត និងបោះពុម្ពវិក្កយបត្រ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToSampleData}
            title="Reload Demo Invoices"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>គំរូវិក្កយបត្រ (Demo)</span>
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white font-bold rounded-lg hover:bg-primary-800 transition-colors shadow-xs text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតវិក្កយបត្រថ្មី</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards: responsive on mobile, tablet & desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="overflow-hidden min-w-0 pr-2">
            <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase block truncate">វិក្កយបត្រសរុប</span>
            <span className="text-xl sm:text-2xl font-black text-gray-900 block leading-tight">{invoices.length}</span>
            <span className="text-[10px] sm:text-[11px] text-gray-400 block truncate">ប័ណ្ណថ្លឹងទំនិញ</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="overflow-hidden min-w-0 pr-2">
            <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase block truncate">បរិមាណសរុប</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700 block leading-tight truncate">
              {totalTonnage.toFixed(1)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-gray-400 block truncate">តោន (Total Tons)</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="overflow-hidden min-w-0 pr-2">
            <span className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase block truncate">ទឹកប្រាក់សរុប</span>
            <span className="text-base sm:text-lg lg:text-xl font-black font-mono text-gray-900 block truncate leading-tight">
              {formatCurrency(totalKhr, 'KHR')}
            </span>
            {totalUsd > 0 && (
              <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-500 block truncate">
                + {formatCurrency(totalUsd, 'USD')}
              </span>
            )}
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 shrink-0">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Search & Invoices Table / Mobile Cards */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរកអតិថិជន ផ្លាកលេខឡាន លេខប័ណ្ណ..."
              className="w-full pl-9 pr-3 py-2 text-sm sm:text-xs border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="text-xs text-gray-500">
            បង្ហាញ <span className="font-bold text-gray-900">{filteredInvoices.length}</span> នៃ {invoices.length} វិក្កយបត្រ
          </div>
        </div>

        {/* MOBILE CARD VIEW (< 640px) */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {filteredInvoices.map((invoice) => {
            const totalQty = invoice.items.reduce((sum, it) => sum + it.quantity, 0);
            return (
              <div key={invoice.id} className="p-3.5 space-y-2.5 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-primary-900 bg-primary-50 px-2 py-0.5 rounded border border-primary-200/60">
                    {invoice.invoiceNumber}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {invoice.date} {invoice.time && `· ${invoice.time}`}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{invoice.customerName}</h4>
                    {invoice.customerPhone && (
                      <p className="text-[11px] text-gray-400">{invoice.customerPhone}</p>
                    )}
                    {invoice.truckPlateNumber && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono font-bold text-[10px]">
                        ឡាន: {invoice.truckPlateNumber}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black font-mono text-gray-900">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500">
                      {totalQty} {invoice.unit === 'ton' ? 'តោន' : 'Kg'}
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons with generous touch targets */}
                <div className="grid grid-cols-6 gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => onView(invoice.id)}
                    className="col-span-4 h-10 px-3 bg-primary-50 text-primary-800 hover:bg-primary-100 active:bg-primary-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-4 h-4 text-primary-700 shrink-0" />
                    <span>មើល & បោះពុម្ព (View)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(invoice.id)}
                    className="col-span-1 h-10 text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    title="Edit Invoice"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInvoiceToDelete(invoice);
                    }}
                    className="col-span-1 h-10 text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    title="Delete Invoice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredInvoices.length === 0 && (
            <div className="p-8 text-center text-gray-400 space-y-1">
              <FileText className="w-8 h-8 mx-auto text-gray-300 mb-1" />
              <p className="font-medium text-xs text-gray-600">រកមិនឃើញវិក្កយបត្រទេ</p>
            </div>
          )}
        </div>

        {/* TABLE VIEW (Tablet & Desktop: >= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                <th className="p-3 whitespace-nowrap">លេខវិក្កយបត្រ (No.)</th>
                <th className="p-3 whitespace-nowrap">កាលបរិច្ឆេទ (Date)</th>
                <th className="p-3 whitespace-nowrap">អតិថិជន (Customer)</th>
                <th className="p-3 whitespace-nowrap">ផ្លាកលេខឡាន (Plate)</th>
                <th className="p-3 whitespace-nowrap text-right">បរិមាណ (Weight)</th>
                <th className="p-3 whitespace-nowrap text-right">សរុបទឹកប្រាក់ (Total)</th>
                <th className="p-3 whitespace-nowrap text-center">សកម្មភាព (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => {
                const totalQty = invoice.items.reduce((sum, it) => sum + it.quantity, 0);
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary-900 whitespace-nowrap">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="p-3 text-gray-600 whitespace-nowrap">
                      {invoice.date} {invoice.time && <span className="text-[10px] text-gray-400 block">{invoice.time}</span>}
                    </td>
                    <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
                      <div>{invoice.customerName}</div>
                      {invoice.customerPhone && (
                        <span className="text-[11px] text-gray-400">{invoice.customerPhone}</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {invoice.truckPlateNumber ? (
                        <span className="inline-block px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded font-mono font-bold text-[11px]">
                          {invoice.truckPlateNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-gray-800 whitespace-nowrap">
                      {totalQty} {invoice.unit === 'ton' ? 'តោន' : 'Kg'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onView(invoice.id)}
                          className="px-2.5 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-md font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="View & Print"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>មើល & បោះពុម្ព</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(invoice.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInvoiceToDelete(invoice);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-sm text-gray-500">រកមិនឃើញវិក្កយបត្រទេ</p>
                    <p className="text-xs text-gray-400 mt-1">
                      សូមចុច "បង្កើតវិក្កយបត្រថ្មី" ឬ "គំរូវិក្កយបត្រ" ដើម្បីចាប់ផ្តើម
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal (Native In-App Dialog, no window.confirm) */}
      {invoiceToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setInvoiceToDelete(null)}
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
                  {invoiceToDelete.invoiceNumber}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-khmer">
              តើអ្នកពិតជាចង់លុបវិក្កយបត្រលេខ <strong>{invoiceToDelete.invoiceNumber}</strong> របស់អតិថិជន{' '}
              <strong>{invoiceToDelete.customerName || 'ទូទៅ'}</strong> នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = invoiceToDelete.id;
                  setInvoiceToDelete(null);
                  deleteInvoice(targetId);
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
