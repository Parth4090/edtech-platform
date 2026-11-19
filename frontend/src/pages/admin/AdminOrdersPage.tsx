import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';
import { InvoiceModal } from '../../components/InvoiceModal';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/orders', {
        params: {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: search.trim() || undefined,
        },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Orders & Payment Transactions</h1>
          <p className="text-slate-600 text-sm mt-1">
            Real-time audit log of student orders, payment methods, transaction references, and
            tax invoices.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {['ALL', 'PAID', 'FAILED', 'CREATED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-navy-950 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, email, or student..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6">Order Details</th>
              <th className="py-3 px-6">Student Information</th>
              <th className="py-3 px-6">Items Purchased</th>
              <th className="py-3 px-6">Payment Mode & ID</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Amount (₹)</th>
              <th className="py-3 px-6 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const payment = order.payments && order.payments[0];
              const isPaid = order.status === 'PAID';

              return (
                <tr key={order.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6">
                    <span className="font-mono font-bold text-navy-950 block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3 px-6">
                    <p className="font-bold text-slate-900">{order.user?.name}</p>
                    <p className="text-[11px] text-slate-400">{order.user?.email}</p>
                  </td>

                  <td className="py-3 px-6 max-w-xs">
                    <div className="space-y-0.5">
                      {order.items.map((i, idx) => (
                        <p key={idx} className="truncate text-slate-700 font-medium">
                          • {i.title}
                        </p>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-6">
                    {payment ? (
                      <div>
                        <span className="font-bold text-slate-800 uppercase block">
                          {payment.method}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[140px]">
                          {payment.razorpayPaymentId}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No payment record</span>
                    )}
                  </td>

                  <td className="py-3 px-6">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      )}
                      {order.status}
                    </span>
                  </td>

                  <td className="py-3 px-6 text-right font-extrabold text-navy-950">
                    ₹{(order.totalInPaise / 100).toFixed(2)}
                  </td>

                  <td className="py-3 px-6 text-right">
                    {isPaid ? (
                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition inline-flex items-center gap-1 text-[11px]"
                      >
                        <Printer className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
};
