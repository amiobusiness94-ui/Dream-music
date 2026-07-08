import React, { useState, useEffect } from 'react';
import { UserSession } from './types';
import ArtistDashboard from './components/ArtistDashboard';
import AdminDashboard from './components/AdminDashboard';
import { 
  Music, Shield, Globe, Award, Sparkles, Send, Volume2, Info, Check, 
  HelpCircle, Star, Menu, X, ArrowRight, CheckCircle2, AlertTriangle, Users
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Auth Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [labelName, setLabelName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  // Mobile menu responsive state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active contact form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactFeedback, setContactFeedback] = useState('');

  // Initialize session from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('dreamrecords_session') || localStorage.getItem('tuneflow_session');
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.user);
        localStorage.setItem('dreamrecords_session', JSON.stringify(data.user));
        setIsAuthOpen(false);
      } else {
        setAuthError(data.error || 'Failed to authenticate');
      }
    } catch (err) {
      setAuthError('Connection failure. Try again.');
    }
  };

  // Handle Register submission (triggers OTP verification)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !name) return;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, labelName })
      });
      const data = await res.json();
      if (data.success) {
        setIsVerifying(true);
      } else {
        setAuthError(data.error || 'Failed to register');
      }
    } catch (err) {
      setAuthError('Registration connection failure.');
    }
  };

  // Handle Verification OTP submission
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!verificationCode) return;

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: verificationCode })
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.user);
        localStorage.setItem('dreamrecords_session', JSON.stringify(data.user));
        setIsAuthOpen(false);
        setIsVerifying(false);
        setVerificationCode('');
      } else {
        setAuthError(data.error || 'Invalid verification passcode.');
      }
    } catch (err) {
      setAuthError('OTP Verification failure.');
    }
  };

  // Logouts
  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('dreamrecords_session');
    localStorage.removeItem('tuneflow_session');
  };

  // Quick Account Login presets
  const handleDemoLogin = async (demoEmail: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail })
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.user);
        localStorage.setItem('dreamrecords_session', JSON.stringify(data.user));
        setIsAuthOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactFeedback("Your support inquiry has been safely queued. We will respond within 4 hours!");
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div className="bg-[#050507] text-white min-h-screen font-sans selection:bg-blue-600/30 relative overflow-x-hidden">
      
      {/* Background atmosphere glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-0 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-pink-600/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[40%] left-[5%] w-[450px] h-[450px] bg-indigo-600/8 blur-[130px] rounded-full"></div>
      </div>

      {/* SESSIONS OVERLAYS - ARTIST DASHBOARD OR ADMIN DASHBOARD OR MAIN PAGE */}
      {session ? (
        session.role === 'admin' ? (
          <AdminDashboard session={session} onLogout={handleLogout} />
        ) : (
          <ArtistDashboard session={session} onLogout={handleLogout} />
        )
      ) : (
        <div className="relative z-10">
          {/* ==========================================
              PUBLIC LANDING PAGE
             ========================================== */}

          {/* 1. Header Navigation */}
          <header className="sticky top-0 z-50 bg-[#050507]/60 backdrop-blur-md border-b border-white/10 px-6 sm:px-12 py-4 flex justify-between items-center transition-all">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-[#1bb0ce] to-indigo-600 rounded-xl text-white shadow-lg shadow-[#1bb0ce]/25">
                <Music size={20} />
              </span>
              <span className="font-extrabold text-2xl font-display text-white tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-[#1bb0ce]">Dream Records</span>
            </div>

            {/* Desktop Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/70">
              <a href="#features" className="hover:text-white transition-colors">Distribution</a>
              <a href="#stores" className="hover:text-white transition-colors">Platforms</a>
              <a href="#statistics" className="hover:text-white transition-colors">Stats</a>
              <a href="#artists" className="hover:text-white transition-colors">Roster</a>
              <a href="#contact" className="hover:text-white transition-colors">Support Desk</a>
            </nav>

            {/* Desktop Auth buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                className="py-2 px-4 text-sm font-bold text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
                className="py-2.5 px-5 text-xs font-bold uppercase tracking-wider bg-[#1bb0ce] text-black hover:bg-[#1bb0ce]/90 active:scale-95 rounded-full transition-all shadow-xl shadow-[#1bb0ce]/10"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Responsive Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white/80 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-[#050507]/95 border-b border-white/10 p-6 space-y-4 text-sm font-semibold backdrop-blur-xl relative z-50">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block text-white/70 hover:text-white">Distribution</a>
              <a href="#stores" onClick={() => setIsMobileMenuOpen(false)} className="block text-white/70 hover:text-white">Platforms</a>
              <a href="#statistics" onClick={() => setIsMobileMenuOpen(false)} className="block text-white/70 hover:text-white">Stats</a>
              <a href="#artists" onClick={() => setIsMobileMenuOpen(false)} className="block text-white/70 hover:text-white">Roster</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="block text-white/70 hover:text-white">Support Desk</a>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setAuthMode('login'); setIsAuthOpen(true); }}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-center text-xs font-bold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setAuthMode('register'); setIsAuthOpen(true); }}
                  className="w-full py-2 bg-[#1bb0ce] text-black hover:bg-[#1bb0ce]/95 rounded-lg text-center text-xs font-bold"
                >
                  Sign Up For Free
                </button>
              </div>
            </div>
          )}

          {/* 2. Hero Presentation Section */}
          <section className="relative px-6 sm:px-12 py-24 md:py-32 text-center max-w-5xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1bb0ce]/10 border border-[#1bb0ce]/20 rounded-full text-[#1bb0ce] text-xs font-bold uppercase tracking-wider animate-shimmer">
              <span className="w-2 h-2 bg-[#1bb0ce] rounded-full animate-pulse"></span>
              India's Top Music Distributor
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold font-display text-white tracking-tight leading-[1.05]">
              Unlimited Music <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-[#1bb0ce] to-blue-500">Distribution. For Free.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-sans">
              Get your tracks on Facebook, Instagram, Spotify, Apple Music, Wynk, Hungama, YouTube, JioSaavn, and more. Keep 100% of your rights and earnings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
                className="py-4 px-8 bg-gradient-to-r from-[#1bb0ce] to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-[#1bb0ce]/20 text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              >
                Sign Up For Free
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                className="py-4 px-8 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Artist Portal Login
              </button>
            </div>

            {/* Quick Presets for Demo */}
            <div className="pt-16 max-w-lg mx-auto">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 block mb-3">Instant Demo Studio Logins</span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDemoLogin('artist@dreamrecords.in')}
                  className="p-4 bg-white/5 border border-white/5 hover:border-[#1bb0ce]/40 rounded-2xl text-left transition-all hover:bg-white/10"
                >
                  <span className="font-bold text-xs text-white block">Zubeen Garg</span>
                  <span className="text-[9px] font-mono text-[#1bb0ce]">Indie Artist Studio</span>
                </button>
                <button
                  onClick={() => handleDemoLogin('admin@dreamrecords.in')}
                  className="p-4 bg-white/5 border border-white/5 hover:border-purple-500/40 rounded-2xl text-left transition-all hover:bg-white/10"
                >
                  <span className="font-bold text-xs text-white block">Super Admin</span>
                  <span className="text-[9px] font-mono text-purple-400">Submission Auditor</span>
                </button>
              </div>
            </div>
          </section>

          {/* 3. Rolling Storefront Marquee */}
          <section id="stores" className="py-12 bg-black/40 backdrop-blur-md border-y border-white/5">
            <div className="text-center mb-6">
              <span className="text-xs text-white/30 font-semibold tracking-widest uppercase">Streaming Partners</span>
            </div>
            
            {/* Infinite scrolling simulation */}
            <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto px-6 opacity-40 grayscale hover:opacity-80 transition-opacity">
              {['Spotify', 'Apple Music', 'JioSaavn', 'Wynk Music', 'Gaana', 'YouTube Music', 'Instagram Music', 'Amazon Music', 'TikTok', 'Resso'].map((st) => (
                <div key={st} className="text-sm sm:text-base font-bold font-display text-slate-400 font-mono tracking-tight">
                  // {st}
                </div>
              ))}
            </div>
          </section>

          {/* 4. Core Features Section */}
          <section id="features" className="px-6 sm:px-12 py-24 max-w-6xl mx-auto space-y-16">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">The Ultimate Indie Package</span>
              <h2 className="text-3xl font-bold font-display text-white tracking-tight">Why independent artists distribute with Dream Records</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-3">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-12 h-12 flex items-center justify-center">
                  <Globe size={24} />
                </div>
                <h3 className="text-lg font-bold font-display text-white">Fastest Digital Release</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We guarantee that your music hits major streaming storefronts like Spotify and Apple Music faster than any traditional aggregator.
                </p>
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-3">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-12 h-12 flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-lg font-bold font-display text-white">AI Compliance Checker</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Utilize advanced server-side Gemini AI models to format lyrics, analyze audio vibes, suggest genres, and run store rejection checklists.
                </p>
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl space-y-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-12 h-12 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <h3 className="text-lg font-bold font-display text-white">Official Artist badges</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Apply for the YouTube Music Note badge, verified Apple Music artist pages, and official verification checkmarks directly from your helpdesk.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Statistics Overview */}
          <section id="statistics" className="bg-slate-900/40 border-y border-slate-900 py-16 px-6 sm:px-12">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="space-y-1">
                <h3 className="text-4xl sm:text-5xl font-extrabold font-display text-white">30,000+</h3>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">Tracks Distributed Globally</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl sm:text-5xl font-extrabold font-display text-white">2,000+</h3>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">Independent Artists Onboarded</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl sm:text-5xl font-extrabold font-display text-white">3,000+</h3>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">Independent Labels Registered</p>
              </div>
            </div>
          </section>

          {/* 6. Artist Spotlights Section */}
          <section id="artists" className="px-6 sm:px-12 py-24 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">Spotlight Roster</span>
              <h2 className="text-3xl font-bold font-display text-white tracking-tight">Our Legendary Independent Partners</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Dream Records is proud to manage, distribute, and audit catalog submissions for hundreds of prestigious regional labels.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Zubeen Garg', desc: 'Indie Icon / Folk Legend', img: 'https://dreamrecords.in/wp-content/uploads/2026/02/Zubeen-Garg-300x300.jpg' },
                { name: 'Tosiba Begum', desc: 'Classical Fusion Vocalist', img: 'https://dreamrecords.in/wp-content/uploads/2025/08/Tosiba-Begum-e1755291949198-300x300.jpg' },
                { name: 'Cinebap Mrinmoy', desc: 'Electro-Folk Pioneer', img: 'https://dreamrecords.in/wp-content/uploads/2025/08/Mrinmoy-Das-300x300.jpg' },
                { name: 'Shilpi Raj', desc: 'Bhojpuri Sensation', img: 'https://dreamrecords.in/wp-content/uploads/2025/09/Shilpi-Raj-300x300.jpg' },
                { name: 'Keshab Dey', desc: 'Bengali Hitmaker & Composer', img: 'https://dreamrecords.in/wp-content/uploads/2024/05/437714181_991909338981148_2960788003884250538_n-300x300.jpg' },
                { name: 'Neha Raj', desc: 'Playback Sensation', img: 'https://dreamrecords.in/wp-content/uploads/2025/08/Neha-Raj-300x300.jpg' },
                { name: 'Samidh Mukherjee', desc: 'Music Director & Lyricist', img: 'https://dreamrecords.in/wp-content/uploads/2024/06/281816616_3030595327252032_2083056097748731401_n-300x300.jpg' },
                { name: 'Debolina Nandy', desc: 'Melodious Vocalist', img: 'https://dreamrecords.in/wp-content/uploads/2024/05/315581991_3249392751942070_8800384197499614913_n-e1716331792499-300x300.jpg' }
              ].map((art) => (
                <div key={art.name} className="p-4 rounded-2xl bg-slate-900 border border-slate-850 text-center space-y-3">
                  <div className="aspect-square w-24 h-24 rounded-full overflow-hidden mx-auto border border-slate-800 bg-slate-950">
                    <img src={art.img} alt={art.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-display text-white truncate">{art.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{art.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Contact / Help Form */}
          <section id="contact" className="px-6 sm:px-12 py-24 max-w-4xl mx-auto space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-4 text-center md:text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400">Direct Communication</span>
                <h2 className="text-3xl font-bold font-display text-white tracking-tight leading-snug">Get in Touch with our Platform Specialists</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Questions about royalties calculations, territorial publishing splits, or VEVO distribution onboarding? Fill out the portal inquiry and our support desk technicians will contact you instantly.
                </p>
                <div className="text-[11px] text-slate-500 font-mono space-y-1.5 pt-2">
                  <p>CIN: U59202WB2024PTC268824</p>
                  <p>Address: New Town, Cooch Behar, West Bengal, 736170</p>
                  <p>Support Email: info@dreamrecords.in</p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {contactFeedback && (
                    <div className="p-3 bg-purple-950/20 border border-purple-900/40 rounded-xl text-xs text-purple-300">
                      {contactFeedback}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-widest mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      placeholder="name@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase font-mono tracking-widest mb-1.5">Detailed Message</label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      placeholder="How can we help?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    Send Inquiry Message
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* 8. Footer */}
          <footer className="border-t border-slate-900 px-6 sm:px-12 py-12 max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded text-white">
                <Music size={14} />
              </span>
              <span className="font-bold text-sm text-white tracking-tight">Dream Records</span>
            </div>
            <p className="text-[10px] text-slate-600 font-mono text-center sm:text-right">
              &copy; 2026 Dream Records Media Private Limited. All rights reserved. Registered under Indian Corporate Affairs.
            </p>
          </footer>
        </div>
      )}

      {/* ==========================================
          AUTHENTICATION OVERLAY DIALOG (OTP FLOW)
         ========================================== */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            
            <button
              onClick={() => { setIsAuthOpen(false); setIsVerifying(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* ERROR FLAG BANNER */}
            {authError && (
              <div className="mb-4 p-2.5 bg-red-950/40 border border-red-900/40 rounded-xl text-xs text-red-400 flex items-start gap-1.5">
                <AlertTriangle size={14} className="mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {!isVerifying ? (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold font-display text-white">
                    {authMode === 'login' ? 'Connect Studio Portal' : 'Register Creator Account'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {authMode === 'login' ? 'Access your mechanical stream ledger.' : 'Register to submit albums globally for free.'}
                  </p>
                </div>

                <form onSubmit={authMode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Artist / Brand Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                          placeholder="e.g. Rupankar Bagchi"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Independent Label Name</label>
                        <input
                          type="text"
                          value={labelName}
                          onChange={(e) => setLabelName(e.target.value)}
                          className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                          placeholder="e.g. Bengal Rhythm Works"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Studio Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      placeholder="e.g. artist@dreamrecords.in"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {authMode === 'login' ? 'Sign In' : 'Trigger Registry Code'}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-slate-850 text-center">
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-mono"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already registered? Login"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold font-display text-white">Registry Verification</h3>
                  <p className="text-xs text-slate-400 mt-1">We sent an OTP verification code to: <span className="text-white block font-mono">{email}</span></p>
                </div>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Enter Verification OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 1234"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white text-center font-mono font-bold tracking-widest"
                    />
                    <p className="text-[9px] text-slate-500 font-mono mt-1 text-center">Type any numeric value to verify unseeded preview accounts.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Unlock Studio Account
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
