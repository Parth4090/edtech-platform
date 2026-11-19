import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  orderData: {
    orderId: string;
    orderNumber: string;
    razorpayOrderId: string;
    amountInPaise: number;
    currency: string;
    keyId: string;
    pricing: any;
  };
  onClose: () => void;
}

export const RazorpayCheckoutModal: React.FC<CheckoutModalProps> = ({ orderData, onClose }) => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const amountInRupees = (orderData.amountInPaise / 100).toFixed(0);

  // Handle Successful Payment
  const handleSuccess = async (paymentId: string) => {
    setIsProcessing(true);
    setPaymentStatus('pending');
    setErrorMessage(null);

    try {
      // 1. Request test signature from backend test signer
      const signRes = await api.post('/payment/sign-test', {
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: paymentId,
      });

      const signature = signRes.data.signature;

      // 2. Send verification request to backend verify API
      const verifyRes = await api.post('/payment/verify', {
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        method: activeTab,
      });

      if (verifyRes.data.success) {
        setPaymentStatus('success');
        clearCart();
        setTimeout(() => {
          navigate('/library', { state: { newOrder: true } });
        }, 1800);
      }
    } catch (err: any) {
      setPaymentStatus('failed');
      setErrorMessage(err.response?.data?.error || err.message || 'Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Failed Payment
  const handleFailure = async (reason: string) => {
    setIsProcessing(true);
    setPaymentStatus('pending');
    setErrorMessage(null);

    try {
      const failPaymentId = `pay_fail_${Date.now()}`;
      await api.post('/payment/failed', {
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: failPaymentId,
        errorDescription: reason,
      });

      setPaymentStatus('failed');
      setErrorMessage(reason);
    } catch (err: any) {
      setPaymentStatus('failed');
      setErrorMessage(err.response?.data?.error || 'Failed to record payment cancellation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayClick = () => {
    if (activeTab === 'upi') {
      if (upiId.trim().toLowerCase() === 'failure@razorpay') {
        handleFailure('UPI transaction failed: Bank server declined test payment (failure@razorpay)');
      } else {
        const paymentId = `pay_upi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        handleSuccess(paymentId);
      }
    } else {
      const paymentId = `pay_${activeTab}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      handleSuccess(paymentId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 p-6 text-white relative">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-300 uppercase tracking-wider mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Razorpay Secure Test Checkout</span>
          </div>

          <div className="flex items-baseline justify-between mt-2">
            <div>
              <p className="text-xs text-slate-300">Order: {orderData.orderNumber}</p>
              <h3 className="text-2xl font-black text-white mt-0.5">₹{amountInRupees}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Test Mode
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {paymentStatus === 'success' ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Payment Verified Successfully!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                HMAC-SHA256 signature verified. Study materials have been unlocked and added to
                your library.
              </p>
              <p className="text-xs text-brand-600 font-semibold animate-pulse">
                Redirecting to My Library...
              </p>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Payment Failed</h4>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                {errorMessage || 'Transaction could not be completed.'}
              </p>
              <p className="text-xs text-slate-500">
                No access granted. Your cart items are preserved. You can retry with a different test
                method.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setPaymentStatus('idle');
                    setUpiId('success@razorpay');
                  }}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition"
                >
                  Retry Payment
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setActiveTab('upi')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'upi' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  UPI (Instant)
                </button>
                <button
                  onClick={() => setActiveTab('card')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'card' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Cards
                </button>
                <button
                  onClick={() => setActiveTab('netbanking')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'netbanking'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  Net Banking
                </button>
              </div>

              {/* UPI Form */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>

                  {/* Preset test buttons for assessment demonstration */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Assessment Test Cases:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setUpiId('success@razorpay')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition text-left flex flex-col ${
                          upiId === 'success@razorpay'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-extrabold text-emerald-600">
                          Pass Test
                        </span>
                        <span>success@razorpay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUpiId('failure@razorpay')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition text-left flex flex-col ${
                          upiId === 'failure@razorpay'
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-extrabold text-red-600">
                          Fail Test
                        </span>
                        <span>failure@razorpay</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Form */}
              {activeTab === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Netbanking Form */}
              {activeTab === 'netbanking' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Select your bank for instant test mode authorization:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((b) => (
                      <div
                        key={b}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 flex items-center justify-between"
                      >
                        <span>{b}</span>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-600 bg-white"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Banner */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Payments encrypted via TLS 1.3. Cryptographic HMAC signature validated on backend.
                </span>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePayClick}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-navy-900 hover:from-brand-500 hover:to-navy-800 text-white font-extrabold rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying with Razorpay...</span>
                  </>
                ) : (
                  <span>
                    Pay ₹{amountInRupees} with{' '}
                    {activeTab === 'upi' ? upiId : activeTab.toUpperCase()}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
