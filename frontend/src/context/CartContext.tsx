import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { Product, CartCalculation } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: Product[];
  couponCode: string | null;
  calculation: CartCalculation | null;
  isLoadingCalculation: boolean;
  error: string | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  refreshCalculation: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('edtech_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [couponCode, setCouponCode] = useState<string | null>(() => {
    return localStorage.getItem('edtech_coupon') || null;
  });
  const [calculation, setCalculation] = useState<CartCalculation | null>(null);
  const [isLoadingCalculation, setIsLoadingCalculation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('edtech_cart', JSON.stringify(items));
    if (couponCode) {
      localStorage.setItem('edtech_coupon', couponCode);
    } else {
      localStorage.removeItem('edtech_coupon');
    }
  }, [items, couponCode]);

  // Recalculate whenever items, coupon, or user changes
  const refreshCalculation = async () => {
    if (items.length === 0) {
      setCalculation(null);
      setError(null);
      return;
    }

    if (!user) {
      // Offline fallback simple preview calculation before login
      const subtotal = items.reduce((sum, item) => sum + item.priceInPaise, 0);
      const taxable = Math.round(subtotal / 1.18);
      const gst = subtotal - taxable;
      setCalculation({
        items: items.map((p) => ({
          productId: p.id,
          title: p.title,
          type: p.type,
          targetId: p.targetId,
          priceInPaise: p.priceInPaise,
          originalPriceInPaise: p.originalPriceInPaise,
          upgradeCreditInPaise: 0,
          effectivePriceInPaise: p.priceInPaise,
          isAlreadyOwned: false,
        })),
        subtotalInPaise: subtotal,
        totalUpgradeCreditInPaise: 0,
        subtotalAfterUpgradeInPaise: subtotal,
        discountInPaise: 0,
        taxableAmountInPaise: taxable,
        gstInPaise: gst,
        cgstInPaise: Math.floor(gst / 2),
        sgstInPaise: gst - Math.floor(gst / 2),
        finalPayableInPaise: subtotal,
        couponCode: null,
        couponApplied: null,
      });
      setError(null);
      return;
    }

    setIsLoadingCalculation(true);
    setError(null);

    try {
      const res = await api.post('/cart/calculate', {
        productIds: items.map((i) => i.id),
        couponCode: couponCode || undefined,
      });
      setCalculation(res.data.calculation);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Cart calculation error';
      setError(errMsg);
    } finally {
      setIsLoadingCalculation(false);
    }
  };

  useEffect(() => {
    refreshCalculation();
  }, [items, couponCode, user?.id]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setCalculation(null);
    setError(null);
  };

  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    setCouponCode(cleanCode);
  };

  const removeCoupon = () => {
    setCouponCode(null);
  };

  const isInCart = (productId: string) => {
    return items.some((i) => i.id === productId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        couponCode,
        calculation,
        isLoadingCalculation,
        error,
        addToCart,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCalculation,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
