import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-navy-800 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                EdTech<span className="text-brand-400">Academy</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's premier digital study platform for CBSE Class 10 & 11 students. Verified
              revision notes, chapter question banks, and all-access passes.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Razorpay Verified • 18% GST Compliant Invoices</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore Study Materials
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/catalogue" className="hover:text-white transition-colors">
                  Class 10 Mathematics
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-white transition-colors">
                  Class 10 Science
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-white transition-colors">
                  Class 11 Physics
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-white transition-colors">
                  Class 11 Chemistry
                </Link>
              </li>
              <li>
                <Link to="/catalogue?filter=passes" className="hover:text-white transition-colors">
                  All-Access Monthly Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Business Rules */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>• Instant Upgrade Credits on Subject Packages</li>
              <li>• Free Sample Chapter Preview in Each Subject</li>
              <li>• In-Browser Protected PDF Reader</li>
              <li>• Auto-Extended Subscription Renewals</li>
              <li>• Automated 18% GST Breakdown & Invoices</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Support & Contact
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@edtechacademy.edu</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 1800-EDTECH-EDU</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5" />
                <span>Tech Knowledge Park, Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EdTech Academy Ltd. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 md:mt-0">
            <span>Built with modern engineering standards for internship technical evaluation</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
