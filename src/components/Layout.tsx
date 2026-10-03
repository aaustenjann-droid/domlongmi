import { ReactNode } from 'react';
import { FileText, PlusCircle, Settings as SettingsIcon, Package, Scale, Eye } from 'lucide-react';
import { useStore } from '../store';

interface LayoutProps {
  children: ReactNode;
  currentView: 'dashboard' | 'create' | 'products' | 'view' | 'settings';
  onNavigate: (view: 'dashboard' | 'create' | 'products' | 'settings') => void;
}

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const { settings } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar - responsive width: md:w-52 lg:w-60 xl:w-64, hidden on mobile */}
      <aside className="hidden md:flex md:w-52 lg:w-60 xl:w-64 bg-primary-900 text-white shrink-0 flex-col print:hidden shadow-xl z-20 transition-all">
        <div className="p-3.5 lg:p-5 border-b border-primary-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-200 border border-white/10 shrink-0">
              <Scale className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-300" />
            </div>
            <div className="overflow-hidden min-w-0">
              <h1 className="text-xs lg:text-sm font-bold font-moul leading-snug truncate text-white" title={settings.companyNameKhmer}>
                {settings.companyNameKhmer || 'ដេប៉ូទិញដំឡូងមី'}
              </h1>
              <p className="text-primary-200 text-[8px] lg:text-[10px] uppercase font-bold tracking-wider truncate" title={settings.companyNameEnglish}>
                {settings.companyNameEnglish || 'CASSAVA INVOICE SYSTEM'}
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-3 lg:mt-5 flex flex-col gap-1 px-2 lg:px-3 flex-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-primary-700 text-white shadow-xs font-bold'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">បញ្ជីវិក្កយបត្រ (Invoices)</span>
          </button>

          <button
            onClick={() => onNavigate('create')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
              currentView === 'create'
                ? 'bg-primary-700 text-white shadow-xs font-bold'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="truncate">បង្កើតវិក្កយបត្រ (New)</span>
          </button>

          <button
            onClick={() => onNavigate('products')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
              currentView === 'products'
                ? 'bg-primary-700 text-white shadow-xs font-bold'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">គ្រប់គ្រងទំនិញ (Products)</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold cursor-pointer ${
              currentView === 'settings'
                ? 'bg-primary-700 text-white shadow-xs font-bold'
                : 'text-primary-100 hover:bg-primary-800 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-blue-300 shrink-0" />
            <span className="truncate">ការកំណត់ (Settings)</span>
          </button>
        </nav>

        {/* Sidebar Footer info */}
        <div className="p-2.5 lg:p-3.5 m-2 lg:m-3 rounded-xl bg-primary-800/60 border border-primary-700/50 text-[10px] lg:text-[11px] text-primary-200">
          <p className="font-bold text-white mb-0.5">អត្រាប្តូរប្រាក់</p>
          <p className="font-mono text-xs text-emerald-300 font-semibold">
            1 USD = {settings.exchangeRate.toLocaleString()} KHR
          </p>
        </div>
      </aside>

      {/* Mobile Top Header with company brand and live rate */}
      <header className="md:hidden bg-primary-900 text-white px-3.5 py-2.5 flex items-center justify-between print:hidden sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2 overflow-hidden min-w-0 mr-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300 border border-white/10 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="overflow-hidden min-w-0">
            <h1 className="text-xs font-bold font-moul truncate">
              {settings.companyNameKhmer || 'ដេប៉ូទិញដំឡូងមី'}
            </h1>
            <p className="text-[9px] text-primary-200 uppercase font-mono truncate">
              {settings.companyNameEnglish || 'CASSAVA WEIGHBRIDGE'}
            </p>
          </div>
        </div>

        <div className="bg-primary-800/90 border border-primary-700/60 px-2.5 py-1 rounded-lg text-right shrink-0">
          <span className="text-[8px] text-primary-300 block uppercase leading-none font-semibold">1 USD =</span>
          <span className="font-mono text-[11px] font-bold text-emerald-300 leading-tight">
            {settings.exchangeRate.toLocaleString()}៛
          </span>
        </div>
      </header>

      {/* Main Content Area: responsive padding and bottom space on mobile to prevent navbar overlap */}
      <main className="flex-1 overflow-y-auto min-w-0 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 pb-24 md:pb-6 print:p-0 print:overflow-visible">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar: thumb-friendly touch targets with safe-area */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around items-center h-16 print:hidden z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-1 pb-[env(safe-area-inset-bottom,0px)]">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] ${
            currentView === 'dashboard' || currentView === 'view'
              ? 'text-primary-800 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${currentView === 'dashboard' || currentView === 'view' ? 'bg-primary-50 text-primary-700' : ''}`}>
            <FileText className="w-4 h-4" />
          </div>
          <span className="mt-0.5">វិក្កយបត្រ</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('create')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] ${
            currentView === 'create'
              ? 'text-primary-800 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${currentView === 'create' ? 'bg-primary-50 text-emerald-600' : ''}`}>
            <PlusCircle className="w-4 h-4" />
          </div>
          <span className="mt-0.5">បង្កើតថ្មី</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('products')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] ${
            currentView === 'products'
              ? 'text-primary-800 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${currentView === 'products' ? 'bg-primary-50 text-amber-600' : ''}`}>
            <Package className="w-4 h-4" />
          </div>
          <span className="mt-0.5">ទំនិញ</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors cursor-pointer min-h-[44px] ${
            currentView === 'settings'
              ? 'text-primary-800 font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${currentView === 'settings' ? 'bg-primary-50 text-blue-600' : ''}`}>
            <SettingsIcon className="w-4 h-4" />
          </div>
          <span className="mt-0.5">ការកំណត់</span>
        </button>
      </nav>
    </div>
  );
}
