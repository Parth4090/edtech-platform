import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import api from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/admin/metrics');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching admin metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const metrics = data?.metrics || {
    totalStudents: 0,
    totalOrders: 0,
    totalRevenueInRupees: 0,
    successfulPaymentsCount: 0,
    failedPaymentsCount: 0,
    activeSubscriptionsCount: 0,
  };

  const recentOrders = data?.recentOrders || [];
  const topSellingItems = data?.topSellingItems || [];
  const chartData = data?.chartData || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Platform Overview & Analytics</span>
        </div>
        <h1 className="text-3xl font-black text-navy-950">Executive Dashboard</h1>
        <p className="text-slate-600 text-sm mt-1">
          Real-time metrics, revenue analysis, transaction audits, and product performance.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-navy-950">{metrics.totalStudents}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Verified Accounts
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="font-extrabold text-base">₹</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-navy-950">
              ₹{metrics.totalRevenueInRupees.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              18% GST Compliant Gross
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-navy-950">{metrics.totalOrders}</h3>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="text-emerald-600 font-bold">
                {metrics.successfulPaymentsCount} Paid
              </span>
              <span>•</span>
              <span className="text-red-500 font-bold">
                {metrics.failedPaymentsCount} Failed
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Passes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-navy-950">
              {metrics.activeSubscriptionsCount}
            </h3>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
              Live All-Access Subscriptions
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Graph & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Visualizer */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-navy-950">Monthly Revenue Stream</h3>
              <p className="text-xs text-slate-500">Gross revenue performance over billing cycles</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              18% GST Accounted
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="h-48 flex items-end gap-6 pt-6 px-4 border-b border-slate-100">
            {chartData.length === 0 ? (
              <div className="w-full flex items-center justify-center text-xs text-slate-400 h-full">
                No billing history recorded yet.
              </div>
            ) : (
              chartData.map((item: any, idx: number) => {
                const maxRev = Math.max(...chartData.map((d: any) => d.revenueInRupees), 1);
                const heightPct = Math.max(15, Math.round((item.revenueInRupees / maxRev) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-600">
                      ₹{item.revenueInRupees}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-brand-600 to-indigo-500 rounded-t-xl transition-all"
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {item.month}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-navy-950">Top Selling Products</h3>
          <p className="text-xs text-slate-500">Ranked by volume of student purchases</p>

          <div className="space-y-3 pt-2">
            {topSellingItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No sales recorded yet.</p>
            ) : (
              topSellingItems.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between"
                >
                  <div className="max-w-[170px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 block">
                      {item.itemType}
                    </span>
                    <p className="text-xs font-bold text-navy-950 truncate">{item.title}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-navy-900 block">
                      {item._count.id} sales
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ₹{((item._sum.priceInPaise || 0) / 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Audit Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-navy-950">Recent Platform Transactions</h3>
            <p className="text-xs text-slate-500">Audit log of student orders and payment attempts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Order Number</th>
                <th className="py-2.5">Student</th>
                <th className="py-2.5">Payment Reference</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order: any) => {
                const payment = order.payments && order.payments[0];
                const isPaid = order.status === 'PAID';

                return (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-mono font-bold text-navy-950">{order.orderNumber}</td>
                    <td className="py-3">
                      <p className="font-bold text-slate-800">{order.user?.name}</p>
                      <p className="text-[11px] text-slate-400">{order.user?.email}</p>
                    </td>
                    <td className="py-3">
                      {payment ? (
                        <div>
                          <span className="font-bold text-slate-700 uppercase">
                            {payment.method}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 block">
                            {payment.razorpayPaymentId}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-extrabold text-navy-950">
                      ₹{(order.totalInPaise / 100).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
