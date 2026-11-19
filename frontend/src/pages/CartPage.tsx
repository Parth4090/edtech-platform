import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingCart,
  Ticket,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  Lock,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { RazorpayCheckoutModal } from '../components/RazorpayCheckoutModal';

export const CartPage: React.FC = () => {
  const { items, calculation, isLoadingCalculation, error, removeFromCart, clearCart, applyCoupon, removeCoupon } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [checkoutOrderData, setCheckoutOrderData] = useState<any | null>(null);
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      await applyCoupon(inputCoupon.trim());
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }

    setIsInitiatingCheckout(true);
    setCheckoutError(null);

    try {
      const res = await api.post('/cart/checkout', {
        productIds: items.map((i) => i.id),
        couponCode: calculation?.couponApplied?.code || undefined,
      });

      setCheckoutOrderData(res.data.checkoutOrder);
    } catch (err: any) {
      setCheckoutError(
        err.response?.data?.error || err.message || 'Failed to initiate checkout order'
      );
    } finally {
      setIsInitiatingCheckout(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-navy-950">Your Cart is Empty</h2>
        <p className="text-slate-600 text-sm mt-2 max-w-sm mx-auto">
          Explore our curriculum catalogue to select chapter notes, complete subject packages, or
          all-access passes.
        </p>
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-brand-600 to-navy-900 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-navy-800 transition"
        >
          <span>Browse Catalogue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const subtotalInRupees = calculation
    ? (calculation.subtotalInPaise / 100).toFixed(2)
    : '0.00';
  const upgradeCreditInRupees = calculation
    ? (calculation.totalUpgradeCreditInPaise / 100).toFixed(2)
    : '0.00';
  const discountInRupees = calculation
    ? (calculation.discountInPaise / 100).toFixed(2)
    : '0.00';
  const taxableInRupees = calculation
    ? (calculation.taxableAmountInPaise / 100).toFixed(2)
    : '0.00';
  const gstInRupees = calculation
    ? (calculation.gstInPaise / 100).toFixed(2)
    : '0.00';
  const cgstInRupees = calculation
    ? (calculation.cgstInPaise / 100).toFixed(2)
    : '0.00';
  const sgstInRupees = calculation
    ? (calculation.sgstInPaise / 100).toFixed(2)
    : '0.00';
  const finalPayableInRupees = calculation
    ? (calculation.finalPayableInPaise / 100).toFixed(2)
    : '0.00';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy-950">Shopping Cart ({items.length})</h1>
        <p className="text-slate-600 text-sm mt-1">
          Review your selected study packages and proceed to secure Razorpay Checkout.
        </p>
      </div>

      {/* Global Error Banner */}
      {(error || checkoutError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-bold">Cart Adjustment Required</p>
            <p className="mt-0.5 text-xs text-red-600">{error || checkoutError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selected Products
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const itemCalc = calculation?.items.find((i) => i.productId === item.id);
                const hasUpgradeCredit = itemCalc && itemCalc.upgradeCreditInPaise > 0;
                const effectiveRupees = itemCalc
                  ? (itemCalc.effectivePriceInPaise / 100).toFixed(0)
                  : (item.priceInPaise / 100).toFixed(0);

                return (
                  <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.type.replace('_', ' ')}
                        </span>
                        {hasUpgradeCredit && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Upgrade Credit: -₹{(itemCalc.upgradeCreditInPaise / 100).toFixed(0)}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-navy-950">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-base font-extrabold text-navy-900">
                          ₹{effectiveRupees}
                        </span>
                        {hasUpgradeCredit && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{(item.priceInPaise / 100).toFixed(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">Incl. 18% GST</span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-2 text-slate-400 hover:text-red-600 p-1 transition"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Coupons Banner */}
          <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 p-5 rounded-3xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-950">Active Promo Codes Available</p>
                <p className="text-[11px] text-slate-600">
                  Use <span className="font-mono font-bold text-brand-700">WELCOME50</span> for 50% off or{' '}
                  <span className="font-mono font-bold text-brand-700">FLAT100</span> for ₹100 flat discount.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setInputCoupon('WELCOME50');
                applyCoupon('WELCOME50');
              }}
              className="px-3.5 py-1.5 bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-bold transition shadow-sm shrink-0"
            >
              Apply WELCOME50
            </button>
          </div>
        </div>

        {/* Right: Price Breakdown & Checkout */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-navy-950 pb-3 border-b border-slate-100">
              Order Summary & GST Breakdown
            </h3>

            {/* Coupon Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Have a Coupon Code?
              </label>
              {calculation?.couponApplied ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-mono font-extrabold text-emerald-900">
                        {calculation.couponApplied.code}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        Discount applied
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Enter coupon (e.g. WELCOME50)"
                    className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !inputCoupon.trim()}
                    className="px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
            </div>

            {/* Itemized Calculations */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
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
                  <span>Coupon Discount:</span>
                  <span>-₹{discountInRupees}</span>
                </div>
              )}

              {/* 18% GST itemized breakdown */}
              <div className="border-t border-slate-100 pt-2 space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>Taxable Base Value:</span>
                  <span>₹{taxableInRupees}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%):</span>
                  <span>₹{cgstInRupees}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%):</span>
                  <span>₹{sgstInRupees}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Total Included GST (18%):</span>
                  <span>₹{gstInRupees}</span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="border-t-2 border-slate-200 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-navy-950 block">Total Payable</span>
                  <span className="text-[10px] text-slate-400">18% GST Inclusive</span>
                </div>
                <span className="text-2xl font-black text-navy-950">₹{finalPayableInRupees}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedToCheckout}
              disabled={isInitiatingCheckout || isLoadingCalculation || !!error}
              className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-navy-900 hover:from-brand-500 hover:to-navy-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isInitiatingCheckout ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Razorpay Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Razorpay Checkout</span>
                </>
              )}
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Razorpay Test Mode • Verified HMAC Verification</span>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      {checkoutOrderData && (
        <RazorpayCheckoutModal
          orderData={checkoutOrderData}
          onClose={() => setCheckoutOrderData(null)}
        />
      )}
    </div>
  );
};
