import React, { useState } from 'react';
import { UserSession } from '../types';
import { Mail, Lock, User as UserIcon, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (session: UserSession) => void;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ onSuccess, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [labelName, setLabelName] = useState('');
  const [role, setRole] = useState<'artist' | 'admin'>('artist');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        if (!data.user.isVerified && data.user.role === 'artist') {
          // If register is pending verification, trigger OTP
          setMode('otp');
        } else {
          onSuccess(data.user);
          onClose();
        }
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError('Name and Email are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, labelName, role })
      });
      const data = await res.json();
      if (data.success) {
        setMode('otp');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Invalid verification code.');
      }
    } catch (err) {
      setError('Verification error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill buttons for testing
  const autoFill = (userType: 'artist' | 'admin') => {
    if (userType === 'artist') {
      setEmail('artist@dreamrecords.in');
      setPassword('123456');
      setRole('artist');
    } else {
      setEmail('admin@dreamrecords.in');
      setPassword('123456');
      setRole('admin');
    }
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl relative">
        
        {/* Decorative ambient spots */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold font-display text-white">
                {mode === 'login' && 'Sign in to Dream Records'}
                {mode === 'register' && 'Create your account'}
                {mode === 'otp' && 'Verify your Email'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {mode === 'login' && 'Enter your distributor credentials'}
                {mode === 'register' && 'Start releasing your music globally for free'}
                {mode === 'otp' && `A temporary OTP has been sent to ${email}`}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors"
            >
              &times;
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-sm">
              {error}
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Email address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="artist@dreamrecords.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Dev Autofill Helpers */}
              <div className="pt-2">
                <p className="text-xs text-slate-400 mb-2 font-mono">⚡ One-click sandbox credentials:</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => autoFill('artist')}
                    className="flex-1 py-1.5 px-3 rounded text-xs bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-200 transition-colors"
                  >
                    Load Artist Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => autoFill('admin')}
                    className="flex-1 py-1.5 px-3 rounded text-xs bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/40 text-indigo-200 transition-colors"
                  >
                    Load Admin Mode
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Entering Studio...' : 'Sign In Now'}
                <ArrowRight size={16} />
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  New to Dream Records? Register an account
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 mb-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole('artist')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${role === 'artist' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Independent Artist
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${role === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Platform Admin
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">FullName / Stage Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <UserIcon size={16} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Zubeen Garg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Email address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="zubeen@dreamrecords.com"
                  />
                </div>
              </div>

              {role === 'artist' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Record Label Name (Optional)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <HelpCircle size={16} />
                    </span>
                    <input
                      type="text"
                      value={labelName}
                      onChange={(e) => setLabelName(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="e.g. Assam Hills Records"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Creating Wallet...' : 'Register as Independent Maker'}
                <ArrowRight size={16} />
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center py-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-3">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-xs text-slate-400 font-mono">SIMULATION CODE: <span className="text-purple-400 font-bold font-sans">92225</span></p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 text-center">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full py-3 px-4 bg-slate-950 border border-slate-800 rounded-lg text-white text-center text-xl font-bold tracking-widest placeholder-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="•••••"
                  maxLength={5}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Verifying Wallet...' : 'Verify & Launch Dashboard'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
