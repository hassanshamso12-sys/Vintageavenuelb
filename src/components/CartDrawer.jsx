import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from './ToastContainer';

export const CartDrawer = () => {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, subtotal, discount, grandTotal, coupon, setCoupon } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (res.ok && data.coupon) {
        setCoupon(data.coupon);
        showToast(`Promo code '${code}' applied!`, 'success');
        setCouponInput('');
      } else {
        // Local static coupons check fallback
        if (code === 'SUMMER15' || code === 'VIP10') {
          const fallbackCoupon = {
            code,
            discount_type: code === 'SUMMER15' ? 'percentage' : 'fixed',
            discount_value: code === 'SUMMER15' ? 15 : 10,
            min_order_amount: 0
          };
          setCoupon(fallbackCoupon);
          showToast(`Promo code '${code}' applied!`, 'success');
          setCouponInput('');
        } else {
          showToast(data.error || 'Invalid promo code', 'danger');
        }
      }
    } catch (err) {
      if (code === 'SUMMER15' || code === 'VIP10') {
        const fallbackCoupon = {
          code,
          discount_type: code === 'SUMMER15' ? 'percentage' : 'fixed',
          discount_value: code === 'SUMMER15' ? 15 : 10,
          min_order_amount: 0
        };
        setCoupon(fallbackCoupon);
        showToast(`Promo code '${code}' applied!`, 'success');
        setCouponInput('');
      } else {
        showToast('Invalid promo code', 'danger');
      }
    }
  };

  const handleCheckout = () => {
    toggleCart(false);
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={() => toggleCart(false)}
      ></div>

      <div className={`cart-drawer ${isCartOpen ? 'active' : ''}`}>
        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">
            <i className="fa-solid fa-bag-shopping" style={{ color: 'var(--color-gold)', marginRight: '8px' }}></i>
            Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h3>
          <button className="cart-drawer-close" onClick={() => toggleCart(false)}>
            &times;
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
              <i className="fa-solid fa-cart-flatbed" style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}></i>
              <p>Your shopping bag is currently empty.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item-row">
                <img src={item.image_url || (item.images ? item.images[0] : '/uploads/placeholder.jpg')} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-price">${Number(item.price).toFixed(2)}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#ef4444' }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="PROMO CODE"
                className="form-control"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                style={{ textTransform: 'uppercase', flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-outline btn-sm">Apply</button>
            </form>

            {coupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span>Coupon ({coupon.code}):</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--color-gold)' }}>${grandTotal.toFixed(2)}</span>
            </div>

            <button onClick={handleCheckout} className="btn btn-gold" style={{ width: '100%' }}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
};
