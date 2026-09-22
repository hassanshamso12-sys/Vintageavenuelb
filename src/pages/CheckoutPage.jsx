import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../components/ToastContainer';
import { generateInvoicePDF } from '../utils/generateInvoicePDF';

export const CheckoutPage = () => {
  const { cart, subtotal, discount, grandTotal, coupon, clearCart } = useCart();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [showWhishModal, setShowWhishModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Delivery rate calculations
  const standardFee = settings.delivery_rate !== undefined ? Number(settings.delivery_rate) : 10.00;
  const expressFee = settings.express_delivery_rate !== undefined ? Number(settings.express_delivery_rate) : 25.00;
  const freeThreshold = settings.free_delivery_threshold !== undefined ? Number(settings.free_delivery_threshold) : 300.00;

  const isFreeStandard = subtotal >= freeThreshold;
  const actualStandardFee = isFreeStandard ? 0 : standardFee;
  const selectedDeliveryFee = deliveryMethod === 'express' ? expressFee : actualStandardFee;
  const finalCalculatedTotal = Math.max(0, subtotal - discount + selectedDeliveryFee);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    const orderData = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      order_date: new Date().toISOString(),
      customer_name: customerName,
      customer_email: customerEmail.trim() || 'N/A',
      customer_phone: customerPhone,
      delivery_address: `${deliveryAddress}, ${city}`,
      items: cart,
      subtotal,
      discount,
      coupon_code: coupon ? coupon.code : null,
      delivery_method: deliveryMethod === 'express' ? 'Express Vault Concierge' : 'Standard Courier',
      delivery_fee: selectedDeliveryFee,
      total_amount: finalCalculatedTotal,
      payment_method: paymentMethod === 'whish' ? 'Whish Money Transfer' : 'Cash on Delivery',
      status: 'Pending',
      tracking_status: 'Processing',
      seen: false
    };

    // Save into localStorage va_orders
    try {
      const existing = JSON.parse(localStorage.getItem('va_orders') || '[]');
      localStorage.setItem('va_orders', JSON.stringify([orderData, ...existing]));
    } catch (e) {}

    // Try posting to API
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
    } catch (e) {}

    clearCart();
    setCompletedOrder(orderData);
    showToast('Order placed successfully!', 'success');
  };

  if (completedOrder) {
    return (
      <div className="container" style={{ padding: '80px 24px', maxWidth: '750px', textAlign: 'center' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--color-gold)', borderRadius: 'var(--radius-md)', padding: '48px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '4rem', color: '#10b981', marginBottom: '24px' }}></i>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-gold)', marginBottom: '16px' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '1.1rem' }}>
            Thank you, <strong>{completedOrder.customer_name}</strong>. Your order has been registered in our vault concierge dispatch system.
          </p>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-sm)', marginBottom: '32px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>
              <code>{completedOrder.id}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Delivery Method:</span>
              <span>{completedOrder.delivery_method} (${completedOrder.delivery_fee.toFixed(2)})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Payment Method:</span>
              <span>{completedOrder.payment_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Grand Total:</span>
              <strong style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>${completedOrder.total_amount.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => generateInvoicePDF(completedOrder, settings)}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
            >
              <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', fontSize: '1.2rem' }}></i> Download PDF Invoice
            </button>
            <Link to="/products" className="btn btn-gold">
              Continue Shopping →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <i className="fa-solid fa-bag-shopping" style={{ fontSize: '3rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}></i>
        <h2>Your bag is empty</h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: '16px 0 24px' }}>Add items from our vault collection to proceed with checkout.</p>
        <Link to="/products" className="btn btn-gold">Explore Catalog</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <h1 className="section-title" style={{ fontSize: '2.8rem', color: 'var(--color-gold)', marginBottom: '32px' }}>
        Concierge Checkout
      </h1>

      <form onSubmit={handleSubmitOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Shipping Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '24px' }}>
            <i className="fa-solid fa-truck-fast"></i> Delivery Information
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Full Name *</label>
            <input type="text" required className="form-control" style={{ width: '100%' }} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Hassan Shamso" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Phone Number *</label>
              <input type="tel" required className="form-control" style={{ width: '100%' }} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+961..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Email (Optional)</label>
              <input type="email" className="form-control" style={{ width: '100%' }} value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="client@domain.com" />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Street Address / Building *</label>
            <input type="text" required className="form-control" style={{ width: '100%' }} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Building, Street Name, Floor" />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>City / Region *</label>
            <input type="text" required className="form-control" style={{ width: '100%' }} value={city} onChange={e => setCity(e.target.value)} placeholder="Beirut, Tripoli, Saida..." />
          </div>

          {/* Delivery Rate Selector */}
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '16px' }}>
            <i className="fa-solid fa-box"></i> Delivery Shipping Rates
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <input type="radio" name="delivery" value="standard" checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Standard Courier Shipping</strong>
                  <strong style={{ color: 'var(--color-gold)' }}>
                    {isFreeStandard ? 'FREE' : `$${standardFee.toFixed(2)}`}
                  </strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Standard insured dispatch (2-4 business days). {isFreeStandard ? ' (Free Shipping Order Unlocked)' : `Free for orders over $${freeThreshold}`}
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <input type="radio" name="delivery" value="express" checked={deliveryMethod === 'express'} onChange={() => setDeliveryMethod('express')} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Express Vault Concierge Courier</strong>
                  <strong style={{ color: 'var(--color-gold)' }}>${expressFee.toFixed(2)}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Priority white-glove express delivery (Next Day / Hand Delivered)
                </div>
              </div>
            </label>
          </div>

          {/* Payment Method */}
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '16px' }}>
            <i className="fa-solid fa-credit-card"></i> Payment Option
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              <div>
                <strong>Cash on Delivery (COD)</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Pay cash upon courier arrival</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
              <input type="radio" name="payment" value="whish" checked={paymentMethod === 'whish'} onChange={() => { setPaymentMethod('whish'); setShowWhishModal(true); }} />
              <div>
                <strong>Whish Money Transfer / Barcode</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)' }}>Scan merchant QR code for instant payment</div>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-gold)', marginBottom: '20px' }}>
            Order Summary ({cart.length} items)
          </h3>

          <div style={{ marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                <div>
                  <strong>{item.name}</strong> × {item.quantity}
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <span>Discount ({coupon?.code}):</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>Delivery Shipping:</span>
              <span>{selectedDeliveryFee === 0 ? 'FREE' : `$${selectedDeliveryFee.toFixed(2)}`}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-gold)', marginTop: '8px' }}>
              <span>Grand Total:</span>
              <span>${finalCalculatedTotal.toFixed(2)}</span>
            </div>
          </div>

          <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '24px', fontSize: '1.05rem', padding: '14px' }}>
            Complete Order →
          </button>
        </div>
      </form>

      {/* Whish Barcode Modal */}
      {showWhishModal && (
        <div className="modal-overlay active" onClick={() => setShowWhishModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-gold)', marginBottom: '16px' }}>
              Whish Money Payment QR Code
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Scan the barcode using your Whish app to complete payment of <strong>${finalCalculatedTotal.toFixed(2)}</strong>.
            </p>

            {settings.whish_barcode_url ? (
              <img src={settings.whish_barcode_url} alt="Whish QR Barcode" style={{ maxWidth: '240px', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '12px', background: '#fff' }} />
            ) : (
              <div style={{ padding: '30px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--color-text-muted)' }}>
                Whish Merchant Barcode Image not configured in Admin Settings.
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <button className="btn btn-gold" onClick={() => setShowWhishModal(false)}>
                I Have Scanned & Sent Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
