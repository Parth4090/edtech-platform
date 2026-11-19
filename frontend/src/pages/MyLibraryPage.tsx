import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { Subject, Chapter } from '../types';
import { PdfViewerModal } from '../components/PdfViewerModal';

export const MyLibraryPage: React.FC = () => {
  const location = useLocation();
  const [libraryData, setLibraryData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'subjects' | 'chapters' | 'passes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePdfMaterialId, setActivePdfMaterialId] = useState<string | null>(null);

  const fetchLibrary = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/library/my-library');
      setLibraryData(res.data);
    } catch (err) {
      console.error('Error fetching library:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [location.state]);

  const activePasses = libraryData?.activePasses || [];
  const subjects: Subject[] = libraryData?.subjects || [];
  const chapters: Chapter[] = libraryData?.individualChapters || [];
  const summary = libraryData?.summary || {
    totalMaterials: 0,
    activeSubscriptionsCount: 0,
    purchasedSubjectsCount: 0,
    purchasedChaptersCount: 0,
  };

  const hasAnyItems =
    activePasses.length > 0 || subjects.length > 0 || chapters.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Enrolled Materials & Active Access Passes</span>
          </div>
          <h1 className="text-3xl font-black text-navy-950">My Study Library</h1>
          <p className="text-slate-600 text-sm mt-1">
            Access your purchased chapter notes, subject packages, and subscriptions.
          </p>
        </div>

        <Link
          to="/catalogue"
          className="px-5 py-2.5 bg-navy-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 self-start md:self-auto shadow-sm"
        >
          <span>Explore More Materials</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Study Notes
          </span>
          <p className="text-2xl font-black text-navy-950 mt-1">{summary.totalMaterials}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Subscriptions
          </span>
          <p className="text-2xl font-black text-brand-600 mt-1">
            {summary.activeSubscriptionsCount}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Subject Packages
          </span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {summary.purchasedSubjectsCount}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Individual Chapters
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {summary.purchasedChaptersCount}
          </p>
        </div>
      </div>

      {/* Active Subscriptions Banner */}
      {activePasses.length > 0 && (
        <div className="bg-gradient-to-r from-navy-900 to-brand-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-extrabold text-white">Active All-Access Subscriptions</h3>
            </div>
            <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              Full Class Access Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activePasses.map((pass: any) => (
              <div
                key={pass.id}
                className="bg-white/10 backdrop-blur border border-white/10 p-4 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <p className="font-extrabold text-sm text-white">{pass.class?.name} All-Access Pass</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {pass.class?.board?.name || 'CBSE Board'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-300 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{pass.daysLeft} Days Left</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Expires: {new Date(pass.validUntil).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'subjects', label: `Subject Packages (${subjects.length})` },
            { id: 'chapters', label: `Single Chapters (${chapters.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === tab.id ? 'bg-white text-navy-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your library..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {!hasAnyItems ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-navy-950">No Study Materials Enrolled Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Browse our curriculum catalogue to unlock verified chapter notes or test a Free Sample
            Chapter in your favorite subject.
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Purchased Subjects Section */}
          {(activeTab === 'all' || activeTab === 'subjects') && subjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-navy-950">
                Purchased Subject Packages ({subjects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                          {sub.class?.name} • Full Package
                        </span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Unlocked
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-navy-950">{sub.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Includes all 5 chapters, notes, solved exercises, and formula sheets.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Included Chapters:
                      </span>
                      <div className="divide-y divide-slate-100">
                        {sub.chapters?.map((ch: any) => {
                          const material = ch.materials && ch.materials[0];
                          return (
                            <div
                              key={ch.id}
                              className="py-2 flex items-center justify-between text-xs"
                            >
                              <span className="font-medium text-slate-800 truncate mr-2">
                                Ch {ch.chapterNumber}: {ch.title}
                              </span>
                              {material && (
                                <button
                                  onClick={() => setActivePdfMaterialId(material.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1 shrink-0"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Read PDF</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Purchased Chapters Section */}
          {(activeTab === 'all' || activeTab === 'chapters') && chapters.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-navy-950">
                Individual Chapter Notes ({chapters.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {chapters.map((ch) => {
                  const material = ch.materials && ch.materials[0];
                  return (
                    <div
                      key={ch.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Chapter {ch.chapterNumber}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Owned
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-navy-950 line-clamp-1">{ch.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {ch.subject?.class?.name} • {ch.subject?.name}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">PDF Study Notes</span>
                        {material && (
                          <button
                            onClick={() => setActivePdfMaterialId(material.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Open Reader</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-Browser PDF Reader Modal */}
      {activePdfMaterialId && (
        <PdfViewerModal
          materialId={activePdfMaterialId}
          onClose={() => setActivePdfMaterialId(null)}
        />
      )}
    </div>
  );
};
