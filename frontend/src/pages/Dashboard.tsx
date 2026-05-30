import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCategories } from '../hooks/useCategories';
import api from '../config/axios';
import Button from '../components/common/Button';
import {
  Package,
  ShieldCheck,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Settings,
  Plus,
  Trash2,
  FolderKanban,
  Edit,
  Sparkles,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

interface OrderItem {
  product: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
  } | string;
  quantity: number;
  productOwner?: string;
  _id: string;
}

interface OrderDetails {
  _id: string;
  user_id: any; // User object or ID
  products: OrderItem[];
  location: string;
  mobile_no: string;
  price: number;
  status: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  mode_of_payment: string;
  createdAt: string;
  updatedAt: string;
}

interface SellerProduct {
  _id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  images: string[];
  rating?: number;
}

export const Dashboard: React.FC = () => {
  const { user, updateProfile, isLoading: isAuthLoading } = useAuthStore();
  const { categories } = useCategories();

  const isSeller = user?.role === 'seller';

  // Tabs
  // Customer tabs: 'orders' | 'profile'
  // Seller tabs: 'inventory' | 'seller-orders' | 'profile'
  const [activeTab, setActiveTab] = useState<string>(isSeller ? 'inventory' : 'orders');

  // Customer profile fields
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Seller Upgrade fields
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [upgradePan, setUpgradePan] = useState('');
  const [upgradeGst, setUpgradeGst] = useState('');
  const [upgradeBankAccount, setUpgradeBankAccount] = useState('');
  const [upgradeIfsc, setUpgradeIfsc] = useState('');
  const [upgradeAddressProof, setUpgradeAddressProof] = useState('');
  const [upgradeBusinessAddress, setUpgradeBusinessAddress] = useState('');

  // Customer orders
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Seller Inventory
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Add / Edit Product modal or view
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productTitle, setProductTitle] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [productActionError, setProductActionError] = useState<string | null>(null);
  const [productActionLoading, setProductActionLoading] = useState(false);

  // Seller Orders
  const [sellerOrders, setSellerOrders] = useState<OrderDetails[]>([]);
  const [isSellerOrdersLoading, setIsSellerOrdersLoading] = useState(false);
  const [sellerOrdersError, setSellerOrdersError] = useState<string | null>(null);

  // Load Categories on startup (assign default if list exists)
  useEffect(() => {
    if (categories.length > 0) {
      setProductCategory(categories[0]._id);
    }
  }, [categories]);

  // Fetch Customer Orders
  const fetchMyOrders = async () => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data || []);
    } catch (err: any) {
      setOrdersError(err.response?.data?.message || 'Failed to fetch customer orders.');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Fetch Seller Products
  const fetchSellerProducts = async () => {
    setIsProductsLoading(true);
    setProductsError(null);
    try {
      const response = await api.get('/products/seller/my-products');
      setSellerProducts(response.data.data || []);
    } catch (err: any) {
      setProductsError(err.response?.data?.message || 'Failed to fetch your listed products.');
    } finally {
      setIsProductsLoading(false);
    }
  };

  // Fetch Seller Orders
  const fetchSellerOrders = async () => {
    setIsSellerOrdersLoading(true);
    setSellerOrdersError(null);
    try {
      const response = await api.get('/orders/seller/orders');
      setSellerOrders(response.data.data || []);
    } catch (err: any) {
      setSellerOrdersError(err.response?.data?.message || 'Failed to fetch seller orders.');
    } finally {
      setIsSellerOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller) {
      fetchSellerProducts();
      fetchSellerOrders();
    } else {
      fetchMyOrders();
    }
  }, [isSeller]);

  // Handle profile save
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

  // Customer: Upgrade to Seller
  const handleUpgradeToSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    if (!upgradePan || !upgradeGst || !upgradeBankAccount || !upgradeIfsc || !upgradeAddressProof || !upgradeBusinessAddress) {
      setProfileError('All business registration fields are required to upgrade.');
      return;
    }
    try {
      await updateProfile({
        name,
        location,
        role: 'seller',
        panNumber: upgradePan,
        gstNumber: upgradeGst,
        bankAccountNumber: Number(upgradeBankAccount),
        ifscCode: upgradeIfsc,
        addressProof: upgradeAddressProof,
        businessAddress: upgradeBusinessAddress
      } as any);
      setProfileSuccess('Account upgraded to seller successfully! Re-indexing dashboard panels...');
      setActiveTab('inventory'); // Switch active tab
      setShowUpgradeForm(false);
    } catch (err: any) {
      setProfileError(err.message || 'Upgrade operation failed.');
    }
  };

  // Customer: Cancel placed order
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: 'cancelled' } : ord))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  // Seller: Add / Edit Product submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductActionError(null);
    setProductActionLoading(true);

    if (!productTitle || !productPrice || !productStock) {
      setProductActionError('Title, price, and stock quantities are required.');
      setProductActionLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', productTitle);
    formData.append('description', productDesc);
    formData.append('price', productPrice);
    formData.append('stock', productStock);
    formData.append('category', productCategory);
    
    if (productImages) {
      for (let i = 0; i < productImages.length; i++) {
        formData.append('images', productImages[i]);
      }
    }

    try {
      if (editProductId) {
        // Edit existing product with form data (in case images are updated)
        await api.patch(`/products/${editProductId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Add new product
        await api.post('/products/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Reset Form fields
      setProductTitle('');
      setProductDesc('');
      setProductPrice('');
      setProductStock('');
      setProductImages(null);
      setShowAddForm(false);
      setEditProductId(null);

      // Reload listed products
      fetchSellerProducts();
    } catch (err: any) {
      setProductActionError(err.response?.data?.message || 'Failed to register product.');
    } finally {
      setProductActionLoading(false);
    }
  };

  // Seller: Trigger edit populate
  const triggerEditProduct = (prod: SellerProduct) => {
    setEditProductId(prod._id);
    setProductTitle(prod.title);
    setProductDesc(prod.description || '');
    setProductPrice(prod.price.toString());
    setProductStock(prod.stock.toString());
    setProductCategory(prod.category || (categories[0]?._id || ''));
    setShowAddForm(true);
  };

  // Seller: Delete listed product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product listing? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${productId}`);
      setSellerProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  // Seller: Update status of customer order
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Update local state list
      setSellerOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: ord.status = newStatus as any } : ord))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order delivery status.');
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
        
        {/* SIDEBAR NAVIGATION PANEL */}
        <div className="space-y-6">
          
          {/* Profile Card Summary */}
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
                {user?.role} portal
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

          {/* Dynamic Tab links depending on user Role */}
          <div className="glass p-2.5 rounded-2xl flex flex-col gap-1.5">
            {!isSeller ? (
              <>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'orders'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-slate-900/60 hover:text-white'
                  }`}
                >
                  <Package size={16} />
                  <span>My Orders</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setShowAddForm(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-slate-900/60 hover:text-white'
                  }`}
                >
                  <FolderKanban size={16} />
                  <span>Listed Inventory</span>
                </button>
                <button
                  onClick={() => setActiveTab('seller-orders')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'seller-orders'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-slate-900/60 hover:text-white'
                  }`}
                >
                  <ShoppingBag size={16} />
                  <span>Manage Sales</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              <Settings size={16} />
              <span>Profile Settings</span>
            </button>
          </div>

        </div>

        {/* MAIN PANEL CONTENT VIEW */}
        <div className="lg:col-span-3">
          
          {/* TAB: CUSTOMER ORDERS LIST */}
          {activeTab === 'orders' && !isSeller && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider m-0">Purchase History</h2>
                <Button variant="outline" size="sm" onClick={fetchMyOrders} isLoading={isOrdersLoading}>
                  Sync History
                </Button>
              </div>

              {isOrdersLoading && orders.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto animate-pulse"></div>
                  <p className="text-sm text-gray-500">Checking delivery records...</p>
                </div>
              ) : ordersError ? (
                <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 text-xs text-red-400 font-medium">
                  {ordersError}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 glass rounded-3xl space-y-4">
                  <p className="text-sm text-gray-500">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* DESKTOP VIEW: Multi-Column Table Layout (visible on md+) */}
                  <div className="hidden md:block overflow-hidden rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md">
                    <table className="w-full border-collapse text-left text-xs text-gray-300">
                      <thead className="bg-slate-900/60 text-[10px] uppercase font-bold tracking-wider text-gray-500 border-b border-white/5">
                        <tr>
                          <th className="py-4 px-6">Product Details</th>
                          <th className="py-4 px-4 text-center">Qty</th>
                          <th className="py-4 px-4 text-right">Price</th>
                          <th className="py-4 px-4 text-right">Grand Total</th>
                          <th className="py-4 px-6 text-center">Order Date</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                          <React.Fragment key={order._id}>
                            {order.products.map((item, idx) => {
                              const isProductObj = item.product && typeof item.product === 'object';
                              const prod = isProductObj ? (item.product as { _id: string; title: string; price: number; images?: string[]; }) : null;
                              const title = prod ? prod.title : 'Premium Item';
                              const price = prod ? prod.price : 0;
                              const image = prod && prod.images?.[0] 
                                ? prod.images[0] 
                                : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';
                              
                              const isCancelable = ['placed', 'confirmed'].includes(order.status);

                              return (
                                <tr key={`${order._id}-${prod?._id || idx}`} className="hover:bg-white/[0.02] transition-colors">
                                  {/* Product (Image + Title) */}
                                  <td className="py-4 px-6 flex items-center gap-3">
                                    <img src={image} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/5 shrink-0" />
                                    <span className="font-semibold text-gray-200 line-clamp-1 max-w-[200px]">{title}</span>
                                  </td>
                                  
                                  {/* Qty */}
                                  <td className="py-4 px-4 text-center font-medium">{item.quantity}</td>
                                  
                                  {/* Price */}
                                  <td className="py-4 px-4 text-right font-mono font-bold text-gray-405">
                                    ₹{price.toLocaleString('en-IN')}
                                  </td>
                                  
                                  {/* Grand Total (Only show once on the first item row of the order) */}
                                  <td className="py-4 px-4 text-right font-mono font-extrabold text-purple-400">
                                    {idx === 0 ? `₹${order.price.toLocaleString('en-IN')}` : ''}
                                  </td>
                                  
                                  {/* Date */}
                                  <td className="py-4 px-6 text-center text-gray-400">
                                    {idx === 0 ? new Date(order.createdAt).toLocaleDateString() : ''}
                                  </td>
                                  
                                  {/* Status */}
                                  <td className="py-4 px-6 text-center">
                                    {idx === 0 ? getStatusBadge(order.status) : ''}
                                  </td>

                                  {/* Action */}
                                  <td className="py-4 px-6 text-center">
                                    {idx === 0 && isCancelable && (
                                      <button
                                        onClick={() => handleCancelOrder(order._id)}
                                        className="px-3 py-1.5 bg-red-650/10 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE VIEW: Stacked Vertical Cards Layout (visible under md) */}
                  <div className="block md:hidden space-y-4">
                    {orders.map((order) => {
                      const isCancelable = ['placed', 'confirmed'].includes(order.status);
                      return (
                        <div key={order._id} className="glass p-5 rounded-2xl space-y-4">
                          {/* Card Header: ID & Status */}
                          <div className="flex justify-between items-center pb-3 border-b border-white/5">
                            <div>
                              <span className="text-[9px] uppercase font-mono text-gray-500 block">Order ID</span>
                              <span className="text-xs font-bold text-purple-400 font-mono">#{order._id.slice(-8)}</span>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>

                          {/* Products List inside order */}
                          <div className="space-y-3">
                            {order.products?.map((item) => {
                              const isProductObj = item.product && typeof item.product === 'object';
                              const prod = isProductObj ? (item.product as { _id: string; title: string; price: number; images?: string[]; }) : null;
                              const title = prod ? prod.title : 'Premium Item';
                              const price = prod ? prod.price : 0;
                              const image = prod && prod.images?.[0] 
                                ? prod.images[0] 
                                : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';
                              
                              return (
                                <div key={item._id || (prod ? prod._id : Math.random().toString())} className="flex items-center justify-between text-xs text-gray-300">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/5 bg-slate-900">
                                      <img src={image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <span className="font-semibold block leading-tight text-gray-200 line-clamp-1 max-w-[155px]">{title}</span>
                                      <span className="text-[10px] text-gray-500 block mt-0.5">Qty: {item.quantity} × ₹{price.toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                  <span className="font-bold text-gray-300 font-mono">
                                    ₹{(price * item.quantity).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Card Footer: Date & Destination */}
                          <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px] text-gray-550">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-gray-700" />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 justify-end">
                              <MapPin size={12} className="text-gray-700" />
                              <span className="truncate max-w-[100px]">{order.location}</span>
                            </div>
                          </div>

                          {/* Grand Total Row */}
                          <div className="p-3 rounded-xl bg-purple-950/15 border border-purple-500/10 flex justify-between items-center mt-2">
                            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Grand Total</span>
                            <span className="text-xs font-extrabold text-white font-mono">
                              ₹{order.price.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Cancel Order Action button */}
                          {isCancelable && (
                            <div className="pt-2 border-t border-white/5 flex justify-end">
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="w-full py-2 bg-red-650/10 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                              >
                                Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SELLER INVENTORY (My Products & Add Product) */}
          {activeTab === 'inventory' && isSeller && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider m-0">Listed Inventory</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage and edit your active 3D models and catalog items.</p>
                </div>
                {!showAddForm ? (
                  <Button variant="primary" size="sm" className="gap-2" onClick={() => setShowAddForm(true)}>
                    <Plus size={16} />
                    <span>List New Item</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditProductId(null);
                      setProductTitle('');
                      setProductDesc('');
                      setProductPrice('');
                      setProductStock('');
                      setProductImages(null);
                    }}
                  >
                    Cancel Action
                  </Button>
                )}
              </div>

              {productsError && (
                <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 text-xs text-red-400 font-medium">
                  {productsError}
                </div>
              )}

              {/* Add / Edit Form Panel */}
              {showAddForm && (
                <div className="glass p-8 rounded-3xl space-y-6">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Sparkles size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      {editProductId ? 'Modify Product Specifications' : 'List New Premium Product'}
                    </h3>
                  </div>

                  {productActionError && (
                    <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 text-xs text-red-400 font-medium">
                      {productActionError}
                    </div>
                  )}

                  <form onSubmit={handleProductSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* Title */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Product Title</label>
                        <input
                          type="text"
                          required
                          value={productTitle}
                          onChange={(e) => setProductTitle(e.target.value)}
                          placeholder="Futuristic Spatial Headset"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Category Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Category Class</label>
                        <select
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id} className="bg-slate-950">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Price */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Price ($ USD)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          placeholder="299"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Stock Quantity */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Initial Stock Volume</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={productStock}
                          onChange={(e) => setProductStock(e.target.value)}
                          placeholder="10"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Detailed Overview Description</label>
                        <textarea
                          rows={4}
                          value={productDesc}
                          onChange={(e) => setProductDesc(e.target.value)}
                          placeholder="Provide details, performance characteristics, or size parameters..."
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Images Selection */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">
                          Product Images (Optional on edit, up to 5 images)
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setProductImages(e.target.files)}
                          className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-purple-900/20 file:text-purple-400 hover:file:bg-purple-900/30 text-xs text-gray-500 bg-slate-900 border border-white/5 p-2 rounded-xl cursor-pointer"
                        />
                      </div>

                    </div>

                    <div className="flex justify-end pt-4 gap-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditProductId(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" isLoading={productActionLoading}>
                        {editProductId ? 'Save Product Modifications' : 'Publish Product Listing'}
                      </Button>
                    </div>

                  </form>
                </div>
              )}

              {/* Listed Products Grid */}
              {!showAddForm && (
                <>
                  {isProductsLoading && sellerProducts.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-4">Retrieving catalog inventory details...</p>
                    </div>
                  ) : sellerProducts.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl space-y-4">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-gray-600 mx-auto">
                        <FolderKanban size={24} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-300">No active products listed</h3>
                        <p className="text-xs text-gray-550 mt-1">
                          Click "List New Item" at the top to publish your first 3D catalog model.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sellerProducts.map((prod) => (
                        <div key={prod._id} className="glass p-5 rounded-2xl flex gap-4">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/5">
                            <img
                              src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                              alt={prod.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-grow flex flex-col justify-between min-w-0">
                            <div>
                              <h4 className="text-sm font-bold text-white truncate leading-snug">{prod.title}</h4>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                                <span>Price: <strong className="text-purple-400">${prod.price}</strong></span>
                                <span>Stock: <strong className="text-gray-300">{prod.stock} units</strong></span>
                              </div>
                            </div>

                            <div className="flex gap-2.5 pt-3 border-t border-white/5 mt-3 justify-end">
                              <button
                                onClick={() => triggerEditProduct(prod)}
                                className="p-2 bg-slate-900 border border-white/5 hover:border-purple-500/25 hover:text-purple-400 text-gray-400 rounded-xl transition-all cursor-pointer"
                                title="Edit specs"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod._id)}
                                className="p-2 bg-slate-900 border border-white/5 hover:border-red-500/25 hover:text-red-500 text-gray-400 rounded-xl transition-all cursor-pointer"
                                title="Delete listing"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* TAB: SELLER MANAGE CUSTOMER ORDERS */}
          {activeTab === 'seller-orders' && isSeller && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider m-0">Incoming Orders</h2>
                  <p className="text-xs text-gray-500 mt-1">Verify placements and update transit shipping coordinates.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSellerOrders} isLoading={isSellerOrdersLoading}>
                  Sync Sales
                </Button>
              </div>

              {isSellerOrdersLoading && sellerOrders.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-4">Retrieving delivery logs...</p>
                </div>
              ) : sellerOrdersError ? (
                <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 text-xs text-red-400 font-medium">
                  {sellerOrdersError}
                </div>
              ) : sellerOrders.length === 0 ? (
                <div className="text-center py-20 glass rounded-3xl space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-gray-600 mx-auto">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-300">No client sales recorded</h3>
                    <p className="text-xs text-gray-550 mt-1">
                      Customer purchases containing your listed products will propagate here automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {sellerOrders.map((order) => {
                    return (
                      <div key={order._id} className="glass p-6 rounded-3xl space-y-4">
                        
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase font-mono block">Order ID Reference</span>
                            <span className="text-xs font-bold font-mono text-purple-400">{order._id}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] text-gray-500 uppercase font-bold block">Assigned Total</span>
                              <span className="text-sm font-bold text-white">${order.price.toLocaleString()}</span>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Delivery Specs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400 py-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-650" />
                              <span className="line-clamp-1">Address: {order.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-650" />
                              <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CreditCard size={14} className="text-gray-650" />
                              <span className="uppercase font-mono">Method: {order.mode_of_payment}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ShieldCheck size={14} className="text-gray-650" />
                              <span>Buyer Contact: {order.mobile_no}</span>
                            </div>
                          </div>
                        </div>

                        {/* Dropdown status transition selector */}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Update Ship Status</span>
                            
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-xs text-purple-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                              <option value="placed">Placed</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="out_for_delivery">Out For Delivery</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB: PROFILE CONFIGURATION (Customer & Seller Shared) */}
          {activeTab === 'profile' && (
            <div className="glass p-8 rounded-3xl space-y-6">
              
              {!showUpgradeForm ? (
                <>
                  <div className="pb-4 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider m-0">Profile Information</h2>
                    <p className="text-xs text-gray-500 mt-1">Keep your display name and shipping/business location accurate.</p>
                  </div>

                  {profileSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-medium">
                      {profileSuccess}
                    </div>
                  )}

                  {profileError && (
                    <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 text-xs text-red-400 font-medium">
                      {profileError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Profile Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Registered Location</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      {!isSeller && (
                        <button
                          type="button"
                          onClick={() => setShowUpgradeForm(true)}
                          className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider cursor-pointer"
                        >
                          Become a Seller
                        </button>
                      )}
                      <Button type="submit" isLoading={isAuthLoading} className="ml-auto">
                        Save Modifications
                      </Button>
                    </div>

                  </form>
                </>
              ) : (
                <>
                  <div className="pb-4 border-b border-white/5 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-white uppercase tracking-wider m-0">Become a Seller</h2>
                      <p className="text-xs text-gray-500 mt-1">Provide your business identification details and credentials to upgrade.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUpgradeForm(false)}
                      className="px-4 py-2 border border-white/5 bg-slate-900 rounded-xl text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Back to profile
                    </button>
                  </div>

                  {profileError && (
                    <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 text-xs text-red-400 font-medium">
                      {profileError}
                    </div>
                  )}

                  <form onSubmit={handleUpgradeToSeller} className="space-y-6">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      {/* PAN */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">PAN Identification</label>
                        <input
                          type="text"
                          required
                          value={upgradePan}
                          onChange={(e) => setUpgradePan(e.target.value)}
                          placeholder="ABCDE1234F"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* GST */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">GST Registration</label>
                        <input
                          type="text"
                          required
                          value={upgradeGst}
                          onChange={(e) => setUpgradeGst(e.target.value)}
                          placeholder="29AAAAA1111A1Z1"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Bank Account */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Bank Account Number</label>
                        <input
                          type="number"
                          required
                          value={upgradeBankAccount}
                          onChange={(e) => setUpgradeBankAccount(e.target.value)}
                          placeholder="123456789012"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* IFSC Code */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">IFSC Bank Code</label>
                        <input
                          type="text"
                          required
                          value={upgradeIfsc}
                          onChange={(e) => setUpgradeIfsc(e.target.value)}
                          placeholder="SBIN0001234"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Address Proof */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Address Proof Document URL</label>
                        <input
                          type="text"
                          required
                          value={upgradeAddressProof}
                          onChange={(e) => setUpgradeAddressProof(e.target.value)}
                          placeholder="https://drive.google.com/proof"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Business Address */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Registered Business Address</label>
                        <input
                          type="text"
                          required
                          value={upgradeBusinessAddress}
                          onChange={(e) => setUpgradeBusinessAddress(e.target.value)}
                          placeholder="123 Store Lane, Trade Plaza"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button type="submit" isLoading={isAuthLoading}>
                        Authorize Upgrade
                      </Button>
                    </div>

                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
