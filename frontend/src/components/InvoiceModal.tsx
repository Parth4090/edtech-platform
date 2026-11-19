import React from 'react';
import { X, Printer, Download, ShieldCheck, GraduationCap } from 'lucide-react';
import { Order } from '../types';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = order.invoiceNumber || `INV-${order.id.substring(0, 8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const totalInRupees = (order.totalInPaise / 100).toFixed(2);
  const subtotalInRupees = (order.subtotalInPaise / 100).toFixed(2);
  const discountInRupees = (order.discountInPaise / 100).toFixed(2);
  const upgradeCreditInRupees = (order.upgradeCreditInPaise / 100).toFixed(2);
  const gstInRupees = (order.gstInPaise / 100).toFixed(2);
  const cgstInRupees = ((order.gstInPaise / 2) / 100).toFixed(2);
  const sgstInRupees = (Number(gstInRupees) - Number(cgstInRupees)).toFixed(2);
  const taxableInRupees = (Number(totalInRupees) - Number(gstInRupees)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-none flex flex-col max-h-[90vh]">
        {/* Modal Toolbar (hidden in print) */}
        <div className="bg-slate-100 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Tax Invoice Preview
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 print:p-6" id="invoice-printable">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-navy-900 flex items-center justify-center text-white">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-navy-950 tracking-tight">
                  EdTech Academy Ltd.
                </h2>
                <p className="text-xs text-slate-500 font-medium">Digital Education Platforms</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  GSTIN: 29AABCE1234F1Z5 • PAN: AABCE1234F
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
                Original Tax Invoice
              </span>
              <p className="text-sm font-extrabold text-navy-900 mt-2">{invoiceNumber}</p>
              <p className="text-xs text-slate-500 mt-0.5">Date: {orderDate}</p>
            </div>
          </div>

          {/* Billed To & Order Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Billed To (Student)
              </p>
              <p className="font-bold text-slate-900 text-sm">{order.user?.name || 'Enrolled Student'}</p>
              <p className="text-slate-600">{order.user?.email}</p>
              {order.user?.phone && <p className="text-slate-600">Tel: {order.user.phone}</p>}
              <p className="text-slate-500 mt-1">Place of Supply: India (Inter-State / Intra-State)</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Order & Payment Reference
              </p>
              <p className="font-semibold text-slate-900">Order ID: {order.orderNumber}</p>
              <p className="text-slate-600">
                Payment Status: <span className="font-bold text-emerald-600">{order.status}</span>
              </p>
              {order.payments && order.payments.length > 0 && (
                <p className="text-slate-600 font-mono text-[11px] mt-0.5">
                  Txn ID: {order.payments[0].razorpayPaymentId} ({order.payments[0].method.toUpperCase()})
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5">Type</th>
                <th className="py-2.5 text-right">HSN/SAC</th>
                <th className="py-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-medium text-slate-800">{item.title}</td>
                  <td className="py-3 text-slate-500">{item.itemType}</td>
                  <td className="py-3 text-right font-mono text-slate-500">998431</td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    ₹{(item.priceInPaise / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Breakdown & GST Calculation */}
          <div className="border-t border-slate-200 pt-4 flex justify-end">
            <div className="w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Catalogue Subtotal:</span>
                <span>₹{subtotalInRupees}</span>
              </div>

              {Number(upgradeCreditInRupees) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Upgrade Credit Deducted:</span>
                  <span>-₹{upgradeCreditInRupees}</span>
                </div>
              )}

              {Number(discountInRupees) > 0 && (
                <div className="flex justify-between text-brand-600 font-semibold">
                  <span>Coupon Discount ({order.coupon?.code || 'OFFER'}):</span>
                  <span>-₹{discountInRupees}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                <span>Taxable Value:</span>
                <span>₹{taxableInRupees}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>CGST (9%):</span>
                <span>₹{cgstInRupees}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>SGST (9%):</span>
                <span>₹{sgstInRupees}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-navy-950 pt-2 border-t-2 border-slate-300">
                <span>Total Amount Paid:</span>
                <span>₹{totalInRupees}</span>
              </div>
              <p className="text-[10px] text-slate-400 text-right">Prices inclusive of 18% GST</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 flex items-center justify-between">
            <p>This is a computer-generated invoice. No physical signature required.</p>
            <div className="flex items-center space-x-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Razorpay Verified Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
