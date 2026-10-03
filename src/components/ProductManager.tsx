import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../store';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function ProductManager() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [pricePerKg, setPricePerKg] = useState<number | ''>('');
  const [pricePerTon, setPricePerTon] = useState<number | ''>('');

  const handlePricePerTonChange = (val: string) => {
    const num = val ? Number(val) : '';
    setPricePerTon(num);
    if (num !== '') {
      setPricePerKg(num / 1000);
    } else {
      setPricePerKg('');
    }
  };

  const handlePricePerKgChange = (val: string) => {
    const num = val ? Number(val) : '';
    setPricePerKg(num);
    if (num !== '') {
      setPricePerTon(num * 1000);
    } else {
      setPricePerTon('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || pricePerKg === '') return;

    if (editingId) {
      updateProduct({ id: editingId, name, unitPrice: Number(pricePerKg) });
      setEditingId(null);
    } else {
      addProduct({ name, unitPrice: Number(pricePerKg) });
    }
    setName('');
    setPricePerKg('');
    setPricePerTon('');
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setPricePerKg(product.unitPrice);
    setPricePerTon(product.unitPrice * 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">គ្រប់គ្រងប្រភេទដំឡូង (Manage Products)</h2>
      
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-5 md:p-6 mb-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">ឈ្មោះប្រភេទ (Product Name)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              placeholder="ឧ. ដំឡូងមីស្រស់"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">តម្លៃ/គីឡូ (Price/Kg - KHR)</label>
            <input
              type="number"
              value={pricePerKg}
              onChange={(e) => handlePricePerKgChange(e.target.value)}
              className="w-full px-3.5 py-2 font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              placeholder="260"
              required
              min="0"
              step="any"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">តម្លៃ/តោន (Price/Ton - KHR)</label>
            <input
              type="number"
              value={pricePerTon}
              onChange={(e) => handlePricePerTonChange(e.target.value)}
              className="w-full px-3.5 py-2 font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              placeholder="260000"
              required
              min="0"
              step="any"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 sm:flex-none h-10 px-5 bg-primary-700 text-white font-bold rounded-xl hover:bg-primary-800 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-xs"
            >
              {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingId ? 'កែប្រែ (Update)' : 'បន្ថែមមុខទំនិញ (Add Product)'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setPricePerKg('');
                  setPricePerTon('');
                }}
                className="h-10 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {/* MOBILE PRODUCT CARDS (< 640px) */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {products.map((product) => (
            <div key={product.id} className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-gray-900">{product.name}</h4>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg text-xs font-mono">
                <div>
                  <span className="text-[10px] text-gray-500 font-sans block">តម្លៃក្នុង ១គីឡូ</span>
                  <span className="font-bold text-gray-900">
                    {new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR' }).format(product.unitPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-sans block">តម្លៃក្នុង ១តោន</span>
                  <span className="font-bold text-emerald-800">
                    {new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR' }).format(product.unitPrice * 1000)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs">
              មិនទាន់មានទំនិញនៅឡើយទេ
            </div>
          )}
        </div>

        {/* TABLE VIEW (Tablet & Desktop: >= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b border-gray-200">
                <th className="p-3 whitespace-nowrap">ឈ្មោះប្រភេទ (Name)</th>
                <th className="p-3 whitespace-nowrap">តម្លៃក្នុងមួយគីឡូ (Price/Kg)</th>
                <th className="p-3 whitespace-nowrap">តម្លៃក្នុងមួយតោន (Price/Ton)</th>
                <th className="p-3 text-right whitespace-nowrap">សកម្មភាព (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-gray-900 font-medium whitespace-nowrap">{product.name}</td>
                  <td className="p-3 text-gray-800 font-mono whitespace-nowrap">
                    {new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR' }).format(product.unitPrice)}
                  </td>
                  <td className="p-3 text-emerald-800 font-mono font-bold whitespace-nowrap">
                    {new Intl.NumberFormat('km-KH', { style: 'currency', currency: 'KHR' }).format(product.unitPrice * 1000)}
                  </td>
                  <td className="p-3 flex justify-end gap-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    មិនទាន់មានទិន្នន័យ (No products found)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
