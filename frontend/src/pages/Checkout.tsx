import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../config/axios';
import Button from '../components/common/Button';
import { MapPin, CreditCard, ShieldCheck, Truck, CheckCircle2, ChevronRight, ShoppingBag, Landmark } from 'lucide-react';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Shipping, 2: Payment, 3: Review, 4: Success
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Step 1: Shipping Info
  const [address, setAddress] = useState(user?.location || '');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Step 2: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'upi'>('card');

  // step validation helpers
  const handleNextStep = () => {
    if (step === 1) {
      if (!address || !city || !postalCode || !country || !mobileNo) {
        setShippingError('Please fill in all shipping fields and contact number.');
        return;
      }
      setShippingError(null);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const shippingAddress = { address, city, postalCode, country };
      const formattedItems = items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Call API order create
      const response = await api.post('/orders/create', {
        shippingAddress,
        mobile_no: mobileNo,
        paymentMethod,
        items: formattedItems,
        totalAmount: totalPrice,
      });

      setPlacedOrder(response.data.data);
      // Clean up cart store locally
      await clearCart();
      setStep(4);
    } catch (err: any) {
      setShippingError(err.response?.data?.message || 'Failed to process order. Try again.');
    }
  };

  useEffect(() => {
    if (items.length === 0 && step !== 4) {
      navigate('/catalog');
    }
  }, [items, step, navigate]);

  if (step === 4 && placedOrder) {
    return (
      <div className="flex-grow max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <CheckCircle2 size={48} className="animate-bounce" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Order Placed Successfully!</h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          Thank you for choosing our platform. Your order ID is <span className="font-mono text-purple-400 font-bold">{placedOrder._id}</span>. We will start dispatching your package immediately.
        </p>

        <div className="pt-8 flex justify-center gap-4">
          <Button variant="primary" onClick={() => navigate('/dashboard')} className="uppercase font-bold text-xs tracking-wider">
            Track Order Status
          </Button>
          <Button variant="outline" onClick={() => navigate('/catalog')} className="uppercase font-bold text-xs tracking-wider">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* 3 Step progress tracker */}
      <div className="flex items-center justify-center gap-4 mb-12 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-900 text-gray-500 border border-white/5'
          }`}>
            1
          </span>
          <span className={`text-xs font-bold ${step >= 1 ? 'text-white' : 'text-gray-500'}`}>Shipping</span>
        </div>
        
        <ChevronRight size={14} className="text-gray-600" />

        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 2 ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-900 text-gray-500 border border-white/5'
          }`}>
            2
          </span>
          <span className={`text-xs font-bold ${step >= 2 ? 'text-white' : 'text-gray-500'}`}>Payment</span>
        </div>

        <ChevronRight size={14} className="text-gray-600" />

        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 3 ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-900 text-gray-500 border border-white/5'
          }`}>
            3
          </span>
          <span className={`text-xs font-bold ${step >= 3 ? 'text-white' : 'text-gray-500'}`}>Review</span>
        </div>
      </div>

      {shippingError && (
        <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 flex items-start gap-3 max-w-3xl mx-auto mb-8">
          <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-red-400 font-medium leading-relaxed">{shippingError}</p>
        </div>
      )}

      {/* Main split grid: Form Details on Left | Summary Cart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* LEFT COMPONENT: Steps view */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: SHIPPING DETAILS */}
          {step === 1 && (
            <div className="glass p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="text-purple-500" size={20} />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Street Address */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Luxury Road, Apt 4"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kathmandu"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="44600"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Nepal"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Mobile No */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Contact Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    placeholder="+977 98XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleNextStep} className="uppercase font-bold text-xs tracking-wider">
                  Continue To Payment
                </Button>
              </div>

            </div>
          )}

          {/* STEP 2: PAYMENT SELECTION */}
          {step === 2 && (
            <div className="glass p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <CreditCard className="text-purple-500" size={20} />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Card Payment */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-purple-500 bg-purple-950/20 text-purple-300'
                      : 'border-white/5 bg-slate-900/40 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <CreditCard size={24} className="text-purple-400" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Credit / Debit Card</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Visa, MasterCard, Stripe secured.</p>
                  </div>
                </button>

                {/* UPI Payment */}
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-purple-500 bg-purple-950/20 text-purple-300'
                      : 'border-white/5 bg-slate-900/40 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Landmark size={24} className="text-purple-400" />
                  <div>
                    <h4 className="font-bold text-sm text-white">NetBanking / UPI</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Direct Bank connection transfer.</p>
                  </div>
                </button>

                {/* COD Payment */}
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-6 rounded-2xl border text-left flex flex-col justify-between h-40 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-purple-500 bg-purple-950/20 text-purple-300'
                      : 'border-white/5 bg-slate-900/40 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Truck size={24} className="text-purple-400" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Cash on Delivery</h4>
                    <p className="text-[10px] text-gray-500 mt-1">Pay at door on product delivery.</p>
                  </div>
                </button>

              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="uppercase font-bold text-xs tracking-wider">
                  Back
                </Button>
                <Button onClick={handleNextStep} className="uppercase font-bold text-xs tracking-wider">
                  Review Order Details
                </Button>
              </div>

            </div>
          )}

          {/* STEP 3: FINAL REVIEW */}
          {step === 3 && (
            <div className="glass p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-purple-500" size={20} />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Order Verification Review</h2>
              </div>

              <div className="space-y-6 divide-y divide-white/5">
                
                {/* Shipping Review */}
                <div className="py-4 first:pt-0">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Shipping Destination</h4>
                  <p className="text-sm text-white mt-2 leading-relaxed">
                    {address}, {city}, {postalCode}, {country}
                  </p>
                  <p className="text-xs text-gray-550 mt-1">Contact: {mobileNo}</p>
                </div>

                {/* Payment Review */}
                <div className="pt-6">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Payment Selected</h4>
                  <p className="text-sm text-white mt-2 uppercase font-mono tracking-wider">
                    {paymentMethod === 'card' ? 'Visa/Mastercard Online Card' : paymentMethod === 'upi' ? 'UPI Netbanking' : 'Cash on Delivery (COD)'}
                  </p>
                </div>

              </div>

              <div className="pt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="uppercase font-bold text-xs tracking-wider">
                  Back
                </Button>
                <Button onClick={handlePlaceOrder} className="uppercase font-bold text-xs tracking-wider gap-2">
                  <span>Authorize & Place Order</span>
                </Button>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Order Summary panel */}
        <div className="glass p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <ShoppingBag className="text-purple-500" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Summary</h3>
          </div>

          {/* List of items summary */}
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product._id} className="flex gap-3 text-xs">
                <div className="w-12 h-12 rounded-lg border border-white/5 overflow-hidden shrink-0 bg-slate-950">
                  <img src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} alt={item.product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-0.5">
                  <span className="text-gray-300 font-semibold line-clamp-1 leading-snug">{item.product.title}</span>
                  <span className="text-gray-500">Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-purple-400 shrink-0 self-center">
                  ${(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span className="text-white">${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-emerald-400 font-bold">FREE SHIPPING</span>
            </div>
            <div className="flex justify-between">
              <span>Local GST / Sales Tax</span>
              <span className="text-white">$0.00</span>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-white/5 text-sm font-bold text-white">
              <span>Grand Total</span>
              <span className="text-lg text-gradient font-extrabold">${totalPrice.toLocaleString()}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
