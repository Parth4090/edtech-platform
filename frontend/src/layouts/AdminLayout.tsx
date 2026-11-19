import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  BookOpen,
  FileText,
  UploadCloud,
  Tag,
  CreditCard,
  Ticket,
  Users,
  KeyRound,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Boards', path: '/admin/boards', icon: Layers },
    { name: 'Classes', path: '/admin/classes', icon: GraduationCap },
    { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { name: 'Chapters', path: '/admin/chapters', icon: FileText },
    { name: 'Study Materials', path: '/admin/materials', icon: UploadCloud },
    { name: 'Products & Pricing', path: '/admin/products', icon: Tag },
    { name: 'Orders & Payments', path: '/admin/orders', icon: CreditCard },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Access Management', path: '/admin/access', icon: KeyRound },
  ];

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied (403)</h2>
          <p className="text-slate-600 text-sm mb-6">
            You must be logged in as an Administrator to view the management dashboard.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition"
            >
              Sign In as Admin
            </button>
            <Link
              to="/"
              className="block w-full py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-950 text-slate-300 border-r border-navy-900 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-navy-900 justify-between">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">
              Admin<span className="text-brand-400">Portal</span>
            </span>
          </Link>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900'
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick links & Logout */}
        <div className="p-4 border-t border-navy-900 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center text-xs text-slate-400 hover:text-white py-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-2" />
            Open Student Site
          </Link>
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs">
              <p className="font-bold text-white truncate max-w-[130px]">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Super Admin
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-navy-900 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-16 bg-navy-950 px-4 text-white">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
            <span className="font-bold text-base">EdTech Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="md:hidden bg-navy-950 px-4 py-3 space-y-1 border-b border-navy-900">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                  location.pathname === item.path
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-navy-800">
              <button
                onClick={() => logout()}
                className="w-full text-left text-sm text-red-400 py-1.5"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
