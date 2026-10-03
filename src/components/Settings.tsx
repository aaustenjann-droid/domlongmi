import { useState } from 'react';
import { useStore } from '../store';
import { Save, RefreshCw, Stamp, Building2, User, CreditCard, Table2, FileText, CheckCircle2 } from 'lucide-react';
import { TableStyle } from '../types';

export default function Settings() {
  const { settings, updateSettings, resetToSampleData } = useStore();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const themes = [
    { name: 'emerald', label: 'ត្បូងមរកត (Emerald)', color: 'bg-emerald-600' },
    { name: 'blue', label: 'ខៀវស្រស់ (Blue)', color: 'bg-blue-600' },
    { name: 'amber', label: 'ពណ៌ទឹកក្រូច (Amber)', color: 'bg-amber-600' },
    { name: 'violet', label: 'ស្វាយ (Violet)', color: 'bg-violet-600' },
    { name: 'rose', label: 'ផ្កាឈូក (Rose)', color: 'bg-rose-600' },
    { name: 'slate', label: 'ប្រផេះ (Slate)', color: 'bg-slate-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-moul">
            ការកំណត់ទូទៅ (App & Depot Settings)
          </h2>
          <p className="text-sm text-gray-500">
            កំណត់ឈ្មោះដេប៉ូ អាសយដ្ឋាន គណនីធនាគារ KHQR និងត្រាផ្លូវការលើវិក្កយបត្រ
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>ផ្ទុកទិន្នន័យគំរូឡើងវិញ (Reset Demo)</span>
        </button>
      </div>

      {/* Reset Success Toast */}
      {showSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            បានកំណត់ឡើងវិញជោគជ័យ! (Reset to sample data successfully!)
          </span>
          <button
            type="button"
            onClick={() => setShowSuccessToast(false)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs cursor-pointer px-2 py-1 bg-emerald-100 rounded-lg"
          >
            បិទ
          </button>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-khmer">
                  កំណត់ទិន្នន័យគំរូឡើងវិញ (Reset Demo Data)
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Sample Data Reset
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-khmer">
              តើអ្នកពិតជាចង់ផ្ទុកទិន្នន័យគំរូឡើងវិញមែនទេ? ទិន្នន័យចាស់ទាំងអស់នឹងត្រូវជំនួសដោយទិន្នន័យគំរូដើម។
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToSampleData();
                  setShowResetModal(false);
                  setShowSuccessToast(true);
                  setTimeout(() => setShowSuccessToast(false), 4000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>បញ្ជាក់ការកំណត់ឡើងវិញ (Confirm Reset)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Depot / Company Information */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 md:p-6">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
            <Building2 className="w-5 h-5 text-primary-600" />
            <span>ព័ត៌មានដេប៉ូ / ក្រុមហ៊ុន (Depot & Company Profile)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ឈ្មោះដេប៉ូជាភាសាខ្មែរ (Company Name - Khmer)
              </label>
              <input
                type="text"
                value={settings.companyNameKhmer}
                onChange={(e) => updateSettings({ companyNameKhmer: e.target.value })}
                placeholder="ឧ. ដេប៉ូទិញដំឡូងមី ហេង ហេង"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-khmer font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ឈ្មោះដេប៉ូជាភាសាអង់គ្លេស (Company Name - English)
              </label>
              <input
                type="text"
                value={settings.companyNameEnglish}
                onChange={(e) => updateSettings({ companyNameEnglish: e.target.value })}
                placeholder="Heng Heng Cassava Depot"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                ពាក្យស្លោក / មុខទំនិញទទួលទិញ (Tagline / Purchases)
              </label>
              <input
                type="text"
                value={settings.companyTagline || ''}
                onChange={(e) => updateSettings({ companyTagline: e.target.value })}
                placeholder="ឧ. មានទទួលទិញ: ស្រូវ ដំឡូងមីស្រស់ និងស្ងួត"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-khmer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                ទីតាំង / អាសយដ្ឋានដេប៉ូ (Depot Address)
              </label>
              <input
                type="text"
                value={settings.companyAddressKhmer || ''}
                onChange={(e) => updateSettings({ companyAddressKhmer: e.target.value })}
                placeholder="ឧ. ភូមិព្រៃក្រឡាញ់ ឃុំស្រែណូយ ស្រុកវ៉ារិន ខេត្តសៀមរាប"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                លេខទូរស័ព្ទទី១ (Primary Phone)
              </label>
              <input
                type="text"
                value={settings.companyPhone || ''}
                onChange={(e) => updateSettings({ companyPhone: e.target.value })}
                placeholder="097 28 32 796"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                លេខទូរស័ព្ទទី២ (Secondary Phone)
              </label>
              <input
                type="text"
                value={settings.companyPhoneSecondary || ''}
                onChange={(e) => updateSettings({ companyPhoneSecondary: e.target.value })}
                placeholder="066 551 286"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                ទម្រង់វិក្កយបត្រលំនាំដើម (Default Invoice Template)
              </label>
              <select
                value={settings.invoiceTemplate || 'modern'}
                onChange={(e) =>
                  updateSettings({ invoiceTemplate: e.target.value as any })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500 font-bold"
              >
                <option value="modern">ពាណិជ្ជកម្មទំនើប (Modern Commercial - គំរូប្រណិត)</option>
                <option value="slip">បង្កាន់ដៃថ្លឹងខ្នាតតូច (Compact Scale Slip)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ភាសាបោះពុម្ពវិក្កយបត្រ (Invoice Print Language)
              </label>
              <select
                value={settings.invoiceLanguage || 'both'}
                onChange={(e) =>
                  updateSettings({ invoiceLanguage: e.target.value as 'khmer' | 'english' | 'both' })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500 font-medium"
              >
                <option value="both">ទាំងពីរភាសា (Both Khmer & English)</option>
                <option value="khmer">ភាសាខ្មែរតែប៉ុណ្ណោះ (Khmer Only)</option>
                <option value="english">English Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Scale Staff & Signers */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 md:p-6">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
            <User className="w-5 h-5 text-primary-600" />
            <span>បុគ្គលិកទទួលបន្ទុក & ហត្ថលេខា (Staff & Signatories)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ឈ្មោះអ្នកថ្លឹងជញ្ជីង (Scale Operator Name)
              </label>
              <input
                type="text"
                value={settings.weighMasterName || ''}
                onChange={(e) => updateSettings({ weighMasterName: e.target.value })}
                placeholder="ឧ. ចាន់ វិចិត្រ"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ឈ្មោះបេឡា / អ្នកទូទាត់ (Cashier Name)
              </label>
              <input
                type="text"
                value={settings.cashierName || ''}
                onChange={(e) => updateSettings({ cashierName: e.target.value })}
                placeholder="ឧ. លី ស្រីមុំ"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ឈ្មោះម្ចាស់ដេប៉ូ / អ្នកលក់ (Owner / Seller Name)
              </label>
              <input
                type="text"
                value={settings.sellerName || ''}
                onChange={(e) => updateSettings({ sellerName: e.target.value })}
                placeholder="ឧ. សុខ ហេង"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank & KHQR Settings */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 md:p-6">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <span>ព័ត៌មានគណនីធនាគារ & ស្កេន KHQR (Banking & KHQR)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ឈ្មោះធនាគារ (Bank Name)
              </label>
              <input
                type="text"
                value={settings.bankName || ''}
                onChange={(e) => updateSettings({ bankName: e.target.value })}
                placeholder="ABA Bank / ACLEDA / Wing"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                លេខគណនី (Account Number)
              </label>
              <input
                type="text"
                value={settings.bankAccountNumber || ''}
                onChange={(e) => updateSettings({ bankAccountNumber: e.target.value })}
                placeholder="001 888 999"
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ឈ្មោះម្ចាស់គណនី (Account Name)
              </label>
              <input
                type="text"
                value={settings.bankAccountName || ''}
                onChange={(e) => updateSettings({ bankAccountName: e.target.value })}
                placeholder="HENG HENG CASSAVA DEPOT"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 uppercase font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Official Rubber Stamp & Verification */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 md:p-6">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
            <Stamp className="w-5 h-5 text-red-600" />
            <span>ត្រាដេប៉ូ & និមិត្តសញ្ញាផ្លូវការ (Official Stamp Seal)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs items-center">
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={settings.showStamp ?? true}
                  onChange={(e) => updateSettings({ showStamp: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="font-semibold text-gray-800 text-sm">
                  បង្ហាញត្រាមូលផ្លូវការលើវិក្កយបត្រ (Enable Stamp on Invoices)
                </span>
              </label>

              <label className="block font-semibold text-gray-700 mb-1">
                អក្សរលើត្រា (Stamp Caption)
              </label>
              <input
                type="text"
                value={settings.stampText || ''}
                onChange={(e) => updateSettings({ stampText: e.target.value })}
                placeholder="ដេប៉ូ ហេង ហេង - បង់ប្រាក់រួច (PAID)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Stamp Preview */}
            <div className="flex justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <div className="w-24 h-24 border-4 border-red-600 rounded-full flex flex-col items-center justify-center text-center p-1.5 text-red-600 rotate-[-8deg] select-none">
                <span className="text-[7px] font-moul leading-none mb-0.5">
                  {settings.companyNameKhmer || 'ដេប៉ូ ហេង ហេង'}
                </span>
                <span className="text-[10px] font-black tracking-widest uppercase border-y border-red-600 py-0.5 my-0.5 w-full">
                  ★ PAID ★
                </span>
                <span className="text-[7px] font-bold">បានទូទាត់ប្រាក់រួច</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Invoice Layout Standard */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 md:p-6">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
            <FileText className="w-5 h-5 text-primary-600" />
            <span>រចនាប័ទ្មវិក្កយបត្រលំនាំដើម (Default Invoice Style)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {[
              {
                id: 'clean',
                title: 'សាមញ្ញប្រណិត (Clean Invoice)',
                desc: 'ទម្រង់ពេញលេញ A4 ស្អាតបាត ស៊ីវិល័យ បង្ហាញជំហានថ្លឹងជញ្ជីង Gross, Tare, Net, Factor តាមជួរនីមួយៗច្បាស់លាស់',
              },
              {
                id: 'slip',
                title: 'បង្កាន់ដៃតូច (Compact Scale Slip)',
                desc: 'ទំហំតូច 80mm សមស្របសម្រាប់ម៉ាស៊ីនព្រីនវិក្កយបត្រខ្នាតតូច ឬបង្កាន់ដៃថ្លឹងរហ័ស',
              },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => updateSettings({ invoiceTemplate: st.id as any })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  (settings.invoiceTemplate || 'clean') === st.id
                    ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-500 font-bold'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-khmer text-sm text-gray-900 font-bold mb-1">
                  {st.title}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed font-normal">
                  {st.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 6: Currency & Exchange Rate */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 md:p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
            រូបិយប័ណ្ណ & អត្រាប្តូរប្រាក់ (Currency & Exchange Rate)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                រូបិយប័ណ្ណលំនាំដើម (Default Currency)
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) =>
                  updateSettings({ defaultCurrency: e.target.value as 'KHR' | 'USD' })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="KHR">ប្រាក់រៀល (KHR ៛)</option>
                <option value="USD">ប្រាក់ដុល្លារ (USD $)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                អត្រាប្តូរប្រាក់ (1 USD = ? KHR)
              </label>
              <input
                type="number"
                value={settings.exchangeRate}
                onChange={(e) => updateSettings({ exchangeRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                min="1000"
                step="10"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                ខ្នាតរង្វាស់លំនាំដើម (Default Unit)
              </label>
              <select
                value={settings.defaultUnit}
                onChange={(e) => updateSettings({ defaultUnit: e.target.value as 'ton' | 'kg' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ton">តោន (Ton - 1000 Kg)</option>
                <option value="kg">គីឡូក្រាម (Kg)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 6: App Theme */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 md:p-6">
          <h3 className="text-base font-bold text-gray-800 mb-3">
            ពណ៌ចម្បងនៃប្រព័ន្ធ (App Theme Color)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.name}
                type="button"
                onClick={() => updateSettings({ themeColor: theme.name })}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  settings.themeColor === theme.name
                    ? 'border-gray-900 bg-gray-50 ring-2 ring-primary-500'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className={`w-8 h-8 rounded-full ${theme.color} shadow-xs`} />
                <span className="text-[11px] font-semibold text-gray-700 text-center">
                  {theme.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
