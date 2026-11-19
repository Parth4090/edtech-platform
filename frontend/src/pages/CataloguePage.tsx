import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  ChevronRight,
  ShoppingCart,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { Board, Class, Subject, Chapter, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { PdfViewerModal } from '../components/PdfViewerModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const CataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();

  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState<'all' | 'chapters' | 'subjects' | 'passes'>('all');

  const [activePdfMaterialId, setActivePdfMaterialId] = useState<string | null>(null);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize
  useEffect(() => {
    const fetchCatalogue = async () => {
      setIsLoading(true);
      try {
        const [boardsRes, classesRes, subjectsRes, productsRes] = await Promise.all([
          api.get('/catalogue/boards'),
          api.get('/catalogue/classes'),
          api.get('/catalogue/subjects'),
          api.get('/catalogue/products'),
        ]);

        const classList: Class[] = classesRes.data.classes || [];
        setBoards(boardsRes.data.boards || []);
        setClasses(classList);
        setSubjects(subjectsRes.data.subjects || []);
        setProducts(productsRes.data.products || []);

        // URL param overrides
        const classParam = searchParams.get('classId');
        const subjectParam = searchParams.get('subjectId');
        const filterParam = searchParams.get('filter');

        if (filterParam === 'passes') setActiveFilter('passes');

        if (classParam) {
          setSelectedClassId(classParam);
        } else if (classList.length > 0 && !subjectParam) {
          setSelectedClassId(classList[0].id);
        }

        if (subjectParam) {
          setSelectedSubjectId(subjectParam);
          // find its class
          const foundSubject = subjectsRes.data.subjects.find((s: Subject) => s.id === subjectParam);
          if (foundSubject) setSelectedClassId(foundSubject.classId);
        }
      } catch (err) {
        console.error('Error fetching catalogue data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogue();
  }, [searchParams]);

  // When selectedSubjectId changes, fetch subject details including chapters and materials
  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!selectedSubjectId) {
        setSelectedSubjectDetail(null);
        return;
      }
      try {
        const res = await api.get(`/catalogue/subjects/${selectedSubjectId}`);
        setSelectedSubjectDetail(res.data);
      } catch (err) {
        console.error('Error fetching subject detail:', err);
      }
    };

    fetchSubjectDetails();
  }, [selectedSubjectId]);

  // Filtered subjects based on selected class
  const filteredSubjects = subjects.filter((s) => !selectedClassId || s.classId === selectedClassId);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    // Type filter
    if (activeFilter === 'chapters' && p.type !== 'CHAPTER') return false;
    if (activeFilter === 'subjects' && p.type !== 'SUBJECT') return false;
    if (activeFilter === 'passes' && p.type !== 'MONTHLY_PASS' && p.type !== 'ANNUAL_PASS')
      return false;

    // Class filter
    if (selectedClassId && p.classId && p.classId !== selectedClassId) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Curriculum Hierarchy • Board → Class → Subject → Chapter</span>
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950">Study Material Catalogue</h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse verified chapter notes, comprehensive subject packages, and all-access passes.
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, chapters, topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Class Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
          Select Class:
        </span>
        <button
          onClick={() => {
            setSelectedClassId('');
            setSelectedSubjectId('');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            !selectedClassId
              ? 'bg-navy-950 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          All Classes
        </button>
        {classes.map((cls) => (
          <button
            key={cls.id}
            onClick={() => {
              setSelectedClassId(cls.id);
              setSelectedSubjectId('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedClassId === cls.id
                ? 'bg-navy-950 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cls.name} ({cls.board?.name || 'CBSE'})
          </button>
        ))}
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'chapters', label: 'Chapter Notes' },
            { id: 'subjects', label: 'Subject Packages' },
            { id: 'passes', label: 'All-Access Passes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeFilter === tab.id ? 'bg-white text-navy-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Free sample indicator note */}
        <div className="flex items-center text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
          <span>Every subject includes 1 Free Sample Chapter for registered students</span>
        </div>
      </div>

      {/* Hierarchical Subject Navigator */}
      {selectedClassId && filteredSubjects.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-navy-950">
              Browse by Subject & Chapter Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              Click a subject to inspect individual chapter notes
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {filteredSubjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(isSelected ? '' : sub.id)}
                  className={`p-3.5 rounded-2xl text-left border transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen
                    className={`w-5 h-5 mb-2 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`}
                  />
                  <div>
                    <span className="text-xs font-bold text-navy-950 block truncate">{sub.name}</span>
                    <span className="text-[10px] text-slate-500 block">5 Chapters</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Drilldown Chapters View */}
          {selectedSubjectDetail && (
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-navy-950">
                    {selectedSubjectDetail.subject.name} Chapters & Materials
                  </h4>
                  <p className="text-xs text-slate-500">
                    Official chapter notes with in-browser protected viewer
                  </p>
                </div>
                {selectedSubjectDetail.packageProduct && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Complete Subject Package</span>
                    <span className="text-sm font-extrabold text-navy-950">
                      ₹{(selectedSubjectDetail.packageProduct.priceInPaise / 100).toFixed(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSubjectDetail.subject.chapters?.map((ch: Chapter) => {
                  const material = ch.materials && ch.materials[0];
                  const hasAccess = ch.hasAccess || ch.isFree;

                  return (
                    <div
                      key={ch.id}
                      className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between hover:bg-slate-50 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Chapter {ch.chapterNumber}
                          </span>
                          {ch.isFree && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Free Sample
                            </span>
                          )}
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 line-clamp-1">{ch.title}</h5>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ch.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-navy-900">
                          {ch.isFree ? 'FREE' : '₹99'}
                        </span>

                        {material && (
                          <button
                            onClick={() => setActivePdfMaterialId(material.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              hasAccess
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-navy-900 hover:bg-brand-600 text-white'
                            }`}
                          >
                            {hasAccess ? (
                              <>
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Read PDF</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>View / Unlock</span>
                              </>
                            )}
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

      {/* Product Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-navy-950">
            Available Study Packages & Chapter Notes ({filteredProducts.length})
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badge={
                  product.type === 'MONTHLY_PASS'
                    ? '30 Days Pass'
                    : product.type === 'ANNUAL_PASS'
                    ? '365 Days Pass'
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

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
