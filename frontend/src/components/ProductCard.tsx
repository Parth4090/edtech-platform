import React from 'react';
import { ShoppingCart, Check, BookOpen, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  isOwned?: boolean;
  onOpenReader?: () => void;
  subtitle?: string;
  badge?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isOwned = false,
  onOpenReader,
  subtitle,
  badge,
}) => {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const inCart = isInCart(product.id);

  const priceInRupees = (product.priceInPaise / 100).toFixed(0);
  const originalPriceInRupees = (product.originalPriceInPaise / 100).toFixed(0);
  const discountPercent = Math.round(
    ((product.originalPriceInPaise - product.priceInPaise) / product.originalPriceInPaise) * 100
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-2.5">
          {badge ? (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700">
              {badge}
            </span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {product.type.replace('_', ' ')}
            </span>
          )}

          {discountPercent > 0 && !isOwned && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
          {product.title}
        </h3>

        {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}

        {product.description && (
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="p-5 pt-0 mt-auto">
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-navy-900">₹{priceInRupees}</span>
              {discountPercent > 0 && (
                <span className="text-xs text-slate-400 line-through">₹{originalPriceInRupees}</span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Incl. 18% GST</span>
          </div>

          <div>
            {isOwned ? (
              <button
                onClick={onOpenReader}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Read Now
              </button>
            ) : inCart ? (
              <button
                onClick={() => navigate('/cart')}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                In Cart
              </button>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-brand-500/20"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
