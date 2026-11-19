import React, { useState, useEffect } from 'react';
import { Tag, Edit, Plus, Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPriceRupees, setEditPriceRupees] = useState<string>('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditPriceRupees((product.priceInPaise / 100).toFixed(0));
  };

  const handleSavePrice = async (productId: string) => {
    const rupees = parseFloat(editPriceRupees);
    if (isNaN(rupees) || rupees < 0) {
      alert('Please enter a valid price in Rupees');
      return;
    }
    const priceInPaise = Math.round(rupees * 100);

    try {
      await api.patch(`/admin/products/${productId}/price`, {
        priceInPaise,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, priceInPaise } : p))
      );
      setEditingProductId(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update product price');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <Tag className="w-3.5 h-3.5" />
          <span>Commerce Configuration</span>
        </div>
        <h1 className="text-3xl font-black text-navy-950">Products & Pricing Management</h1>
        <p className="text-slate-600 text-sm mt-1">
          Control pricing in integer paise (18% GST inclusive), configure passes, and toggle active
          sales status.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6">Product Title</th>
              <th className="py-3 px-6">Type</th>
              <th className="py-3 px-6">Class</th>
              <th className="py-3 px-6">Original Price</th>
              <th className="py-3 px-6">Selling Price (Incl. 18% GST)</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const isEditing = editingProductId === p.id;
              const priceRupees = (p.priceInPaise / 100).toFixed(0);
              const originalRupees = (p.originalPriceInPaise / 100).toFixed(0);

              return (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6">
                    <p className="font-bold text-navy-950">{p.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                  </td>
                  <td className="py-3 px-6">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] uppercase">
                      {p.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-slate-600 font-medium">{p.class?.name || 'Class-wide'}</td>
                  <td className="py-3 px-6 text-slate-400 line-through">₹{originalRupees}</td>
                  <td className="py-3 px-6">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-700">₹</span>
                        <input
                          type="number"
                          value={editPriceRupees}
                          onChange={(e) => setEditPriceRupees(e.target.value)}
                          className="w-20 px-2 py-1 border rounded-lg text-xs font-bold font-mono"
                        />
                      </div>
                    ) : (
                      <span className="font-extrabold text-navy-950 text-sm">₹{priceRupees}</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSavePrice(p.id)}
                          className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingProductId(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 font-bold rounded-lg transition inline-flex items-center gap-1 text-[11px]"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Price</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
