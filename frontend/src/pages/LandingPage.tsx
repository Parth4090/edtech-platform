import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  GraduationCap,
  ArrowRight,
  Star,
  ChevronDown,
  Layers,
  FileCheck,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { Board, Class, Subject, Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boardsRes, classesRes, subjectsRes, productsRes] = await Promise.all([
          api.get('/catalogue/boards'),
          api.get('/catalogue/classes'),
          api.get('/catalogue/subjects'),
          api.get('/catalogue/products'),
        ]);

        setBoards(boardsRes.data.boards || []);
        setClasses(classesRes.data.classes || []);
        setSubjects(subjectsRes.data.subjects || []);
        setFeaturedProducts(productsRes.data.products?.slice(0, 6) || []);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const faqs = [
    {
      q: 'How does the Upgrade Credit discount work if I already bought single chapters?',
      a: 'If you purchased one or more individual chapter notes within a subject, our system automatically subtracts 100% of the amount you already paid from the full subject package price! The price never drops below ₹0.',
    },
    {
      q: 'What is included in the Monthly and Annual All-Access Passes?',
      a: 'An All-Access Pass unlocks every single chapter, subject package, formula sheet, and sample question paper for your chosen class for 30 days (Monthly Pass) or 365 days (Annual Pass).',
    },
    {
      q: 'Can I view free sample study materials before purchasing?',
      a: 'Yes! Every subject includes at least one Chapter completely FREE. Simply create a student account and sign in to access the in-browser protected PDF reader with zero payment required.',
    },
    {
      q: 'What payment methods are supported on Razorpay Checkout?',
      a: 'We support all major payment modes including Instant UPI (Google Pay, PhonePe, Paytm), Credit and Debit Cards (Visa, Mastercard, RuPay), and Net Banking across 50+ Indian banks in Razorpay Test Mode.',
    },
    {
      q: 'Are all prices compliant with GST regulations?',
      a: 'Yes, all listed prices are inclusive of 18% GST. You can view the itemized breakdown (Taxable amount, 9% CGST, and 9% SGST) in your cart and download official tax invoices directly from your Order History.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>CBSE Class 10 & 11 Curated Study Material Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Master Every Concept with{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Precision Notes & Smart Passes
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Instant digital access to board-aligned chapter notes, full subject mastery packages,
            and all-access subscription passes with automatic upgrade credits.
          </p>

          {/* Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by chapter, subject, or formula (e.g. Quadratic Equations, Newton's Laws)..."
                className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:bg-white/15 text-sm transition shadow-2xl"
              />
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold text-xs rounded-xl transition shadow-md"
              >
                Search
              </button>
            </form>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalogue"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Explore Catalogue
            </Link>
            <Link
              to="/catalogue?filter=passes"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <span>View All-Access Passes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-400 text-xs font-semibold">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Razorpay Test Verified</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Entitlement Unlock</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-brand-400" />
              <span>CBSE Curriculum Aligned</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>18% GST Compliant Invoices</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED BOARDS & CLASSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-navy-950">Structured Curriculum Hierarchy</h2>
          <p className="mt-2 text-slate-600 text-sm">
            Browse through national boards, academic classes, individual subjects, and chapter notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
                    {cls.board?.name || 'CBSE Board'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {cls.subjects?.length || 3} Subjects Available
                  </span>
                </div>
                <h3 className="text-2xl font-black text-navy-950 group-hover:text-brand-600 transition-colors">
                  {cls.name} Curriculum
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Full syllabi coverage including core theory, formulae charts, NCERT-exemplary
                  problems, and high-yield revision summaries.
                </p>

                {/* Subject tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {cls.subjects?.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/catalogue?subjectId=${sub.id}`}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Monthly Pass starting at</span>
                  <span className="text-xl font-extrabold text-navy-900">₹499/mo</span>
                </div>
                <Link
                  to={`/catalogue?classId=${cls.id}`}
                  className="px-5 py-2.5 bg-navy-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
                >
                  <span>Explore {cls.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR SUBJECTS */}
      <section className="bg-slate-100/70 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Comprehensive Mastery
              </span>
              <h2 className="text-3xl font-extrabold text-navy-950 mt-1">Popular Study Subjects</h2>
            </div>
            <Link
              to="/catalogue"
              className="mt-4 sm:mt-0 text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All 6 Subjects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subjects.slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {sub.class?.name}
                </span>
                <h3 className="text-xl font-bold text-navy-900 mt-1">{sub.name}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {sub.description || 'Complete syllabus with chapter notes and solved examples.'}
                </p>

                <div className="mt-4 flex items-center text-xs text-slate-500 font-semibold space-x-3">
                  <span>5 Chapters</span>
                  <span>•</span>
                  <span className="text-emerald-600">1 Free Sample Chapter</span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-navy-900">Package: ₹399</span>
                  <Link
                    to={`/catalogue?subjectId=${sub.id}`}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    View Chapters →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED STUDY PACKAGES & PASSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Most Popular Deals
          </span>
          <h2 className="text-3xl font-extrabold text-navy-950 mt-1">Featured Study Packages</h2>
          <p className="mt-2 text-slate-600 text-sm">
            Save up to 60% with complete packages and all-access passes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BENEFITS OF THE PLATFORM */}
      <section className="bg-navy-950 text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Why Choose EdTech Academy?</h2>
            <p className="mt-2 text-slate-400 text-sm">
              Engineered for academic excellence and smooth technical reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-navy-900/90 border border-navy-800 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Automated Upgrade Credits</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Bought individual chapter notes first? When you upgrade to the complete subject
                package, 100% of your chapter spend is automatically deducted!
              </p>
            </div>

            <div className="bg-navy-900/90 border border-navy-800 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Secure In-Browser PDF Reader</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stream verified PDFs instantly with student watermarking and zero downloads
                required. Never worry about losing your study materials.
              </p>
            </div>

            <div className="bg-navy-900/90 border border-navy-800 p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Instant Entitlements</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                With Razorpay webhook idempotency and HMAC signature validation, your study materials
                are unlocked within seconds of payment completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING COMPARISON SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Flexible Purchasing Options
          </span>
          <h2 className="text-3xl font-extrabold text-navy-950 mt-1">Simple, Transparent Pricing</h2>
          <p className="mt-2 text-slate-600 text-sm">
            All plans include 18% GST with zero hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Chapter Notes */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pay-Per-Topic
              </span>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">Single Chapter Notes</h3>
              <p className="text-xs text-slate-500 mt-1">Ideal for quick test prep</p>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-navy-900">₹99</span>
                <span className="text-xs text-slate-500 ml-1">/ chapter</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full Chapter PDF notes & formula sheet</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Lifetime permanent access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Eligible for 100% upgrade credit</span>
                </li>
              </ul>
            </div>

            <Link
              to="/catalogue"
              className="mt-8 w-full py-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
            >
              Browse Chapters
            </Link>
          </div>

          {/* Subject Package */}
          <div className="bg-white rounded-3xl p-8 border-2 border-brand-500 shadow-xl flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Most Popular
            </span>
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Full Subject Mastery
              </span>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">Complete Subject Package</h3>
              <p className="text-xs text-slate-500 mt-1">All 5 chapters bundled</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-navy-900">₹399</span>
                <span className="text-sm text-slate-400 line-through">₹799</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All 5 chapters in the subject</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Comprehensive solved question bank</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Subtracts any chapter notes you already own</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Lifetime permanent library access</span>
                </li>
              </ul>
            </div>

            <Link
              to="/catalogue"
              className="mt-8 w-full py-3.5 text-center bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/25 transition"
            >
              Get Subject Package
            </Link>
          </div>

          {/* All-Access Pass */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Unlimited Pass
              </span>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">Class All-Access Pass</h3>
              <p className="text-xs text-slate-500 mt-1">Monthly or Annual validity</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-navy-900">₹499</span>
                <span className="text-xs text-slate-500">/ 30 days</span>
              </div>

              <ul className="mt-8 space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All subjects & chapters across entire class</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full unlimited in-browser reader access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Renewals seamlessly extend existing expiry</span>
                </li>
              </ul>
            </div>

            <Link
              to="/catalogue?filter=passes"
              className="mt-8 w-full py-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
            >
              View Pass Options
            </Link>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Student Success Stories
            </span>
            <h2 className="text-3xl font-extrabold text-navy-950 mt-1">Trusted by CBSE Toppers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ananya Deshmukh',
                class: 'Class 10 CBSE (96.4%)',
                quote:
                  'The Science chapter notes and formula cheat sheets were the exact reason I scored 98 in Science. The upgrade credit feature saved me money when I bought the full package later!',
              },
              {
                name: 'Rohan Sengupta',
                class: 'Class 11 Physics & Math',
                quote:
                  'The in-browser PDF reader is super fast and clean. I bought the Class 11 Monthly Pass and had access to every derivation and sample problem right before mid-terms.',
              },
              {
                name: 'Pooja Iyer',
                class: 'Class 10 Mathematics',
                quote:
                  'I loved that I could read Chapter 1 for free first to verify the quality. The checkout was seamless with UPI, and the tax invoice was generated instantly.',
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex text-amber-400 space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{t.quote}"</p>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm font-bold text-navy-950">{t.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{t.class}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-navy-950 mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-sm text-slate-800 hover:text-brand-600 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === index ? 'rotate-180 text-brand-600' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
