import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';
import { User, Mail, Lock, MapPin, Eye, EyeOff, FileText, Landmark, ShieldCheck, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, error, clearError, isLoading, isAuthenticated } = useAuthStore();

  const redirect = searchParams.get('redirect') || '/';

  // Toggle roles
  const [role, setRole] = useState<'customer' | 'seller'>('customer');

  // General fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);

  // Seller details
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [addressProof, setAddressProof] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect);
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, redirect, clearError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    // Initial check
    if (!name || !email || !password) {
      setLocalError('Please fill in name, email, and password.');
      return;
    }

    const formData = new FormData();
    formData.append('role', role);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('location', location);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    if (role === 'seller') {
      if (!panNumber || !gstNumber || !bankAccountNumber || !ifscCode || !addressProof || !businessAddress) {
        setLocalError('All business documents and tax credentials are required for sellers.');
        return;
      }
      formData.append('panNumber', panNumber);
      formData.append('gstNumber', gstNumber);
      formData.append('bankAccountNumber', bankAccountNumber);
      formData.append('ifscCode', ifscCode);
      formData.append('addressProof', addressProof);
      formData.append('businessAddress', businessAddress);
    }

    try {
      await register(formData);
      setSuccessMsg('Registration completed successfully! Please sign in with your new credentials.');
      // Auto-focus sign in redirect
      setTimeout(() => {
        navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      }, 3000);
    } catch (err) {}
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4 relative">
      <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-650/5 blur-[120px] top-6 left-6 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-650/5 blur-[120px] bottom-6 right-6 pointer-events-none" />

      <div className="w-full max-w-2xl glass rounded-3xl p-8 space-y-8 relative z-10 shadow-2xl">
        
        {/* Banner header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mb-2">
            <Layers size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight m-0">Create Your Profile</h2>
          <p className="text-xs text-gray-500">Choose your portal type and join our Web3D e-commerce community.</p>
        </div>

        {/* Form selection Tab */}
        <div className="flex border-b border-white/5 pb-2">
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              setLocalError(null);
            }}
            className={`flex-1 pb-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              role === 'customer'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            Customer Account
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('seller');
              setLocalError(null);
            }}
            className={`flex-1 pb-4 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              role === 'seller'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            Seller Portal
          </button>
        </div>

        {/* Error notification banner */}
        {(localError || error) && (
          <div className="p-4 rounded-xl bg-red-650/10 border border-red-500/25 flex items-start gap-3">
            <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-red-400 font-medium leading-relaxed">{localError || error}</p>
          </div>
        )}

        {/* Success message banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
            <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-emerald-400 font-medium leading-relaxed">{successMsg}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Grid fields for General Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rehan Bhai"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rehan@domain.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Physical Location */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Physical Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Kathmandu, Nepal"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              </div>
            </div>

            {/* Profile Avatar Upload */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Avatar Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-purple-900/20 file:text-purple-400 hover:file:bg-purple-900/30 text-xs text-gray-500 bg-slate-900 border border-white/5 p-2 rounded-xl cursor-pointer"
              />
            </div>

          </div>

          {/* Dynamic Seller Form details */}
          {role === 'seller' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-6 border-t border-white/5 space-y-6"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Business Verification Documents</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* PAN Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">PAN Identification</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value)}
                      placeholder="ABCDE1234F"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                    />
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>

                {/* GST Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">GST Registration</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="29AAAAA1111A1Z1"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                    />
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>

                {/* Bank Account */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Bank Account Number</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="123456789012"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                    />
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>

                {/* IFSC Code */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">IFSC Bank Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="SBIN0001234"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                    />
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>

                {/* Address Proof */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Address Proof Document URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={addressProof}
                      onChange={(e) => setAddressProof(e.target.value)}
                      placeholder="https://drive.google.com/proof"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                    />
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>

                {/* Business Address */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Registered Business Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="123 Store Lane, Trade Plaza"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-sm text-white placeholder-gray-650 focus:outline-none focus:border-purple-500"
                    />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Submit */}
          <Button type="submit" isLoading={isLoading} className="w-full py-4 uppercase font-bold tracking-wider">
            Register Account
          </Button>

        </form>

        {/* Footer Redirect link */}
        <div className="text-center pt-4 border-t border-white/5 text-xs text-gray-500">
          <span>Already have an account? </span>
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-purple-400 hover:text-purple-300 font-bold">
            Sign In Instead
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
