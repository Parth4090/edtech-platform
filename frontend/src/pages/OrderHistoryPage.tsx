import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  CreditCard,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { InvoiceModal } from '../components/InvoiceModal';
import { Link } from 'react-router-dom';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/library/my-orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span>Billing & Compliance</span>
        </div>
        <h1 className="text-3xl font-black text-navy-950">Order History & Invoices</h1>
        <p className="text-slate-600 text-sm mt-1">
          View all transactions, payment verification references, and download official 18% GST tax
          invoices.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you make a purchase via Razorpay Test Checkout, your order details and GST tax
            invoice will appear here.
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <span>Browse Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">Order ID & Date</th>
                  <th className="py-3.5 px-6">Purchased Products</th>
                  <th className="py-3.5 px-6">Payment Mode & ID</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Amount (Incl. 18% GST)</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const payment = order.payments && order.payments[0];
                  const isPaid = order.status === 'PAID';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      {/* Order info */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-navy-950 block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Products */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="font-medium text-slate-800 truncate">
                              • {item.title}
                            </p>
                          ))}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-6">
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
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
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

                      {/* Amount */}
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-extrabold text-navy-950 block">
                          ₹{(order.totalInPaise / 100).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          GST: ₹{(order.gstInPaise / 100).toFixed(2)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {isPaid ? (
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>Invoice</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No invoice</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
