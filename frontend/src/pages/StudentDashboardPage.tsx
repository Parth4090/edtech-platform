import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  CreditCard,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { PdfViewerModal } from '../components/PdfViewerModal';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [libraryData, setLibraryData] = useState<any | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePdfMaterialId, setActivePdfMaterialId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [libRes, prodRes] = await Promise.all([
          api.get('/library/my-library'),
          api.get('/catalogue/products'),
        ]);

        setLibraryData(libRes.data);
        setRecommendedProducts(prodRes.data.products?.slice(0, 3) || []);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const summary = libraryData?.summary || {
    totalMaterials: 0,
    activeSubscriptionsCount: 0,
    purchasedSubjectsCount: 0,
    purchasedChaptersCount: 0,
  };
  const activePasses = libraryData?.activePasses || [];
  const subjects = libraryData?.subjects || [];
  const chapters = libraryData?.individualChapters || [];
  const recentOrders = libraryData?.recentOrders || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-brand-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <BookOpen className="w-80 h-80" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CBSE Student Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, {user?.name.split(' ')[0]}!
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Track your enrolled subjects, active class passes, and continue learning from where you
            left off.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/library"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to My Study Library</span>
            </Link>
            <Link
              to="/catalogue"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition border border-white/15"
            >
              Browse New Materials
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Purchased Notes
          </span>
          <p className="text-3xl font-black text-navy-950 mt-2">{summary.totalMaterials}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Full PDF study materials</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Active Passes
          </span>
          <p className="text-3xl font-black text-brand-600 mt-2">
            {summary.activeSubscriptionsCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Monthly / Annual passes</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Subject Packages
          </span>
          <p className="text-3xl font-black text-indigo-600 mt-2">
            {summary.purchasedSubjectsCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Complete subject sets</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Single Chapters
          </span>
          <p className="text-3xl font-black text-emerald-600 mt-2">
            {summary.purchasedChaptersCount}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Standalone chapter notes</span>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-navy-950">Continue Learning</h2>
          <Link to="/library" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View All in Library →
          </Link>
        </div>

        {chapters.length === 0 && subjects.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-navy-950">No Study Materials Enrolled</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start with free sample chapters or purchase chapter notes from our catalogue.
            </p>
            <Link
              to="/catalogue"
              className="inline-block px-5 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Explore Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {chapters.slice(0, 3).map((ch: any) => {
              const material = ch.materials && ch.materials[0];
              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-full">
                      {ch.subject?.class?.name} • Chapter {ch.chapterNumber}
                    </span>
                    <h4 className="text-sm font-bold text-navy-950 mt-2 line-clamp-1">{ch.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ch.subject?.name}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">PDF Reader Ready</span>
                    {material && (
                      <button
                        onClick={() => setActivePdfMaterialId(material.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Purchases & Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-navy-950">Recent Transactions</h2>
          <Link to="/orders" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View All Orders & Invoices →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
            No past orders found.
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
            {recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-navy-950">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {order.items?.length || 1} items • Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-navy-950">
                      ₹{(order.totalInPaise / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      18% GST Incl.
                    </span>
                  </div>
                  <Link
                    to="/orders"
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    View Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-navy-950">Recommended For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* PDF Reader Modal */}
      {activePdfMaterialId && (
        <PdfViewerModal
          materialId={activePdfMaterialId}
          onClose={() => setActivePdfMaterialId(null)}
        />
      )}
    </div>
  );
};
