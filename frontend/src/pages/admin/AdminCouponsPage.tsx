import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Check, X, Sparkles, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Coupon } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderValueInRupees: 200,
    maxDiscountInRupees: 200,
    usageLimit: 100,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.coupons || []);
    } catch (err) {
      console.error('Error fetching admin coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await api.patch(`/admin/coupons/${id}/toggle`);
      setCoupons((prev) => prev.map((c) => (c.id === id ? res.data.coupon : c)));
    } catch (err) {
      alert('Failed to toggle coupon status');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const minOrderPaise = Math.round(parseFloat(formData.minOrderValueInRupees || '0') * 100);
      const maxDiscountPaise = formData.maxDiscountInRupees
        ? Math.round(parseFloat(formData.maxDiscountInRupees) * 100)
        : null;
      const discountValue =
        formData.discountType === 'FLAT'
          ? Math.round(parseFloat(formData.discountValue) * 100)
          : parseInt(formData.discountValue);

      await api.post('/admin/coupons', {
        code: formData.code.trim().toUpperCase(),
        description: formData.description,
        discountType: formData.discountType,
        discountValue,
        minOrderValueInPaise: minOrderPaise,
        maxDiscountInPaise: maxDiscountPaise,
        validUntil: new Date(formData.validUntil).toISOString(),
        usageLimit: parseInt(formData.usageLimit || '100'),
      });

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Promotions & Coupons</h1>
          <p className="text-slate-600 text-sm mt-1">
            Create flat or percentage discount coupons, set expiration rules and usage limits.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6">Coupon Code</th>
              <th className="py-3 px-6">Discount Type & Value</th>
              <th className="py-3 px-6">Min Order (₹)</th>
              <th className="py-3 px-6">Usage (Used / Limit)</th>
              <th className="py-3 px-6">Expires On</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((c) => {
              const isFlat = c.discountType === 'FLAT';
              const valueFormatted = isFlat
                ? `₹${(c.discountValue / 100).toFixed(0)} FLAT`
                : `${c.discountValue}% OFF`;

              return (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6">
                    <span className="font-mono font-black text-brand-700 text-sm">{c.code}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.description}</p>
                  </td>
                  <td className="py-3 px-6">
                    <span className="font-bold text-navy-950">{valueFormatted}</span>
                    {c.maxDiscountInPaise && (
                      <span className="text-[10px] text-slate-400 block">
                        Max ₹{(c.maxDiscountInPaise / 100).toFixed(0)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 font-bold text-slate-700">
                    ₹{(c.minOrderValueInPaise / 100).toFixed(0)}
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-navy-950">
                    {c.timesUsed} / {c.usageLimit}
                  </td>
                  <td className="py-3 px-6 text-slate-600">
                    {new Date(c.validUntil).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => handleToggle(c.id)}
                      className={`px-3 py-1 rounded-xl font-bold text-[11px] transition ${
                        c.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-navy-950">Create Promotional Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE30"
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="30% discount on all packages"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {formData.discountType === 'FLAT' ? 'Amount in ₹' : 'Discount %'}
                  </label>
                  <input
                    type="number"
                    required
                    defaultValue={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    defaultValue={200}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderValueInRupees: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    defaultValue={200}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscountInRupees: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    defaultValue={100}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    defaultValue={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition mt-4"
              >
                {isSubmitting ? 'Creating...' : 'Save Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
