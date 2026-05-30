import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../config/axios';
import Button from '../components/common/Button';
import { Package, ShieldCheck, Mail, MapPin, Calendar, CreditCard, XSquare, Settings } from 'lucide-react';

interface OrderItem {
  product: string;
  quantity: number;
  productOwner?: string;
  _id: string;
}

interface OrderDetails {
  _id: string;
  user_id: string;
  products: OrderItem[];
  location: string;
  mobile_no: string;
  price: number;
  status: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  mode_of_payment: string;
  createdAt: string;
  updatedAt: string;
}

export const Dashboard: React.FC = () => {
  const { user, updateProfile, isLoading: isAuthLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Profile Edit fields
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const fetchMyOrders = async () => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data || []);
    } catch (err: any) {
      setOrdersError(err.response?.data?.message || 'Failed to fetch order history.');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    try {
      await updateProfile({ name, location });
      setProfileSuccess('Profile credentials updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to save updates.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      // Update local state instead of full reload
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: 'cancelled' } : ord))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  const getStatusBadge = (status: OrderDetails['status']) => {
    const styles = {
      placed: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      confirmed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      packed: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      shipped: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      out_for_delivery: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      delivered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return (
      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        
        {/* SIDE PANEL: User card & tabs */}
        <div className="space-y-6">
          
          {/* User profile card summary */}
          <div className="glass p-6 rounded-3xl text-center space-y-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-purple-500 bg-purple-900 flex items-center justify-center text-xl font-bold text-white mx-auto">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-white text-lg leading-snug line-clamp-1">{user?.name}</h3>
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 block mt-1">
                {user?.role} Portal
              </span>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-gray-500 text-left">
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-gray-600" />
                <span className="line-clamp-1">{user?.email}</span>
              </div>
              {user?.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-gray-600" />
                  <span className="line-clamp-1">{user.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tab buttons */}
          <div className="glass p-2.5 rounded-2xl flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              <Package size={16} />
              <span>Order History</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              <Settings size={16} />
              <span>Account Settings</span>
            </button>
          </div>

        </div>

        {/* MAIN PANEL: Active Tab content */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: ORDERS HISTORY LIST */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider m-0">Purchase History</h2>
                <Button variant="outline" size="sm" onClick={fetchMyOrders} isLoading={isOrdersLoading}>
                  Sync History
                </Button>
              </div>

              {isOrdersLoading && orders.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-500">Checking delivery records...</p>
                </div>
              ) : ordersError ? (
                <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 flex items-start gap-3">
                  <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-red-400 font-medium">{ordersError}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 glass rounded-3xl space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-gray-600 mx-auto">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-300">No placed orders found</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[220px] mx-auto leading-normal">
                      Start browsing our store catalogue to acquire premium collections.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });
                    const isCancelable = ['placed', 'confirmed'].includes(order.status);

                    return (
                      <div key={order._id} className="glass p-6 rounded-3xl space-y-4">
                        
                        {/* Order Header summary */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
                          <div className="space-y-1">
                            <span className="text-[10px] text-gray-500 uppercase font-mono block">Order ID</span>
                            <span className="text-xs font-bold font-mono text-purple-400">{order._id}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right space-y-1">
                              <span className="text-[10px] text-gray-500 uppercase font-bold block">Grand Total</span>
                              <span className="text-sm font-bold text-white">${order.price.toLocaleString()}</span>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Order Items details list */}
                        <div className="space-y-2 text-xs text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-600" />
                            <span>Placed on {orderDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-600" />
                            <span className="line-clamp-1">Destination: {order.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-gray-600" />
                            <span className="uppercase font-mono">Payment: {order.mode_of_payment}</span>
                          </div>
                        </div>

                        {/* Actions: Cancel buttons */}
                        {isCancelable && (
                          <div className="pt-2 border-t border-white/5 flex justify-end">
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-red-650/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-xs font-bold uppercase transition-all cursor-pointer"
                            >
                              <XSquare size={14} />
                              <span>Cancel Order</span>
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PROFILE ACCREDITATION CONFIG */}
          {activeTab === 'profile' && (
            <div className="glass p-8 rounded-3xl space-y-6">
              
              <div className="pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider m-0">Profile Management</h2>
                <p className="text-xs text-gray-500 mt-1">Keep your basic account details and contact coordinates updated.</p>
              </div>

              {profileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                  <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-emerald-400 font-medium leading-relaxed">{profileSuccess}</p>
                </div>
              )}

              {profileError && (
                <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 flex items-start gap-3">
                  <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-xs text-red-400 font-medium leading-relaxed">{profileError}</p>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Location Address</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" isLoading={isAuthLoading} className="uppercase font-bold text-xs tracking-wider">
                    Save Changes
                  </Button>
                </div>

              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
