import { useState } from 'react';
import Layout from './components/Layout';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import ProductManager from './components/ProductManager';
import InvoicePrint from './components/InvoicePrint';
import Settings from './components/Settings';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'create' | 'products' | 'view' | 'settings'>('dashboard');
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>('demo-inv-001'); // Pre-select the demo invoice so users immediately see an invoice that "look like this"!
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  const handleNavigate = (view: 'dashboard' | 'create' | 'products' | 'settings') => {
    setCurrentView(view);
    if (view === 'create') {
      setEditingInvoiceId(null);
    }
  };

  const handleViewInvoice = (id: string) => {
    setViewingInvoiceId(id);
    setCurrentView('view');
  };

  const handleEditInvoice = (id: string) => {
    setEditingInvoiceId(id);
    setCurrentView('create');
  };

  const handleCreateNew = () => {
    setEditingInvoiceId(null);
    setCurrentView('create');
  };

  const handleSaveInvoice = (id: string) => {
    setViewingInvoiceId(id);
    setEditingInvoiceId(null);
    setCurrentView('view');
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'dashboard' && (
        <InvoiceList
          onView={handleViewInvoice}
          onEdit={handleEditInvoice}
          onCreateNew={handleCreateNew}
        />
      )}
      {currentView === 'create' && (
        <InvoiceForm
          onSave={handleSaveInvoice}
          onDelete={() => handleNavigate('dashboard')}
          initialInvoiceId={editingInvoiceId}
        />
      )}
      {currentView === 'products' && <ProductManager />}
      {currentView === 'settings' && <Settings />}
      {currentView === 'view' && viewingInvoiceId && (
        <InvoicePrint
          id={viewingInvoiceId}
          onBack={() => {
            setViewingInvoiceId(null);
            handleNavigate('dashboard');
          }}
          onEdit={handleEditInvoice}
        />
      )}
    </Layout>
  );
}
