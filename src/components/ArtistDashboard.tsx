import React, { useState, useEffect } from 'react';
import { UserSession, Release, Track, SupportTicket, RoyaltyReport, WithdrawalRequest } from '../types';
import Waveform from './Waveform';
import { 
  Music, Upload, BarChart3, Wallet, LifeBuoy, Plus, Sparkles, Send, 
  CheckCircle, AlertTriangle, Clock, ArrowUpRight, DollarSign, ListMusic, Eye, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface ArtistDashboardProps {
  session: UserSession;
  onLogout: () => void;
}

export default function ArtistDashboard({ session, onLogout }: ArtistDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'releases' | 'royalties' | 'support'>('overview');
  const [releases, setReleases] = useState<Release[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states for New Release
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Indian Classical / Fusion');
  const [subGenre, setSubGenre] = useState('Assamese Folk');
  const [language, setLanguage] = useState('Assamese');
  const [mood, setMood] = useState('Nostalgic');
  const [releaseDate, setReleaseDate] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80');
  const [stores, setStores] = useState<string[]>(['spotify', 'apple', 'jiosaavn', 'gaana', 'instagram', 'youtube']);
  
  // Tracklist form state
  const [tracks, setTracks] = useState<Track[]>([]);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackSinger, setNewTrackSinger] = useState(session.name);
  const [newTrackFeaturing, setNewTrackFeaturing] = useState('');
  const [newTrackComposer, setNewTrackComposer] = useState(session.name);
  const [newTrackLyricist, setNewTrackLyricist] = useState('');
  const [newTrackLyrics, setNewTrackLyrics] = useState('');

  // AI tools state
  const [aiMetadataLoading, setAiMetadataLoading] = useState(false);
  const [aiMetadataResult, setAiMetadataResult] = useState<any>(null);
  const [aiGenreLoading, setAiGenreLoading] = useState(false);
  const [aiGenreResult, setAiGenreResult] = useState<any>(null);
  const [aiLyricsLoading, setAiLyricsLoading] = useState(false);
  const [aiLyricsResult, setAiLyricsResult] = useState<any>(null);
  const [aiCoverLoading, setAiCoverLoading] = useState(false);
  const [aiCoverResult, setAiCoverResult] = useState<any>(null);
  const [coverDesc, setCoverDesc] = useState('');

  // Cashout Form State
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('UPI');
  const [withdrawalDetails, setWithdrawalDetails] = useState('');
  const [withdrawalMessage, setWithdrawalMessage] = useState('');

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('distribution');
  const [ticketMessage, setTicketMessage] = useState('');
  const [activeTicketChat, setActiveTicketChat] = useState<SupportTicket | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  // Fetch all core dashboard datasets
  const fetchData = async () => {
    setLoading(true);
    try {
      const relRes = await fetch(`/api/releases?artistId=${session.id}`);
      const relData = await relRes.json();
      setReleases(relData);

      const ticketRes = await fetch(`/api/tickets?artistId=${session.id}`);
      const ticketData = await ticketRes.json();
      setTickets(ticketData);

      const withRes = await fetch(`/api/withdrawals?artistId=${session.id}`);
      const withData = await withRes.json();
      setWithdrawals(withData);

      const statsRes = await fetch('/api/royalties/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session.id]);

  // Handle support ticket creation
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: session.id,
          artistName: session.name,
          subject: ticketSubject,
          category: ticketCategory,
          message: ticketMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setTickets([data.ticket, ...tickets]);
        setTicketSubject('');
        setTicketMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle posting a reply to a ticket
  const handlePostTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketChat || !chatMessage) return;

    try {
      const res = await fetch(`/api/tickets/${activeTicketChat.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'artist',
          senderName: session.name,
          message: chatMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(tickets.map(t => t.id === data.ticket.id ? data.ticket : t));
        setActiveTicketChat(data.ticket);
        setChatMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Payout Cashout Request
  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawalAmount);
    if (!amountNum || amountNum <= 0) {
      setWithdrawalMessage('Please input a valid transfer amount.');
      return;
    }
    if (stats && amountNum > stats.pendingBalance) {
      setWithdrawalMessage('Withdrawal limit exceeded your current cleared ledger wallet balance.');
      return;
    }

    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: session.id,
          artistName: session.name,
          amount: amountNum,
          paymentMethod: withdrawalMethod,
          details: withdrawalDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawals([data.withdrawal, ...withdrawals]);
        setWithdrawalAmount('');
        setWithdrawalDetails('');
        setWithdrawalMessage('Cashout proposal successfully logged for review.');
        fetchData(); // reload stats
      }
    } catch (err) {
      setWithdrawalMessage('Connection failure. Try again later.');
    }
  };

  // Submit Release Form
  const handleAddTrack = () => {
    if (!newTrackTitle) return;
    const track: Track = {
      title: newTrackTitle,
      version: 'Original Mix',
      singer: newTrackSinger || 'Unknown',
      featuring: newTrackFeaturing || '',
      composer: newTrackComposer || 'Unknown',
      lyricist: newTrackLyricist || 'Traditional',
      producer: session.name,
      publisher: 'Dream Records Publishing',
      copyrightHolder: session.labelName || 'Independent',
      lyrics: newTrackLyrics || '[Instrumental]',
      audioFileName: newTrackTitle.toLowerCase().replace(/ /g, '_') + '_audio.mp3',
      audioSize: (4 + Math.random() * 8).toFixed(1) + ' MB'
    };
    setTracks([...tracks, track]);
    setNewTrackTitle('');
    setNewTrackFeaturing('');
    setNewTrackLyrics('');
  };

  const handleRemoveTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleCreateRelease = async (status: 'draft' | 'scheduled') => {
    if (!title || tracks.length === 0) {
      alert("Please provide an Album/Single Title and add at least 1 track.");
      return;
    }

    try {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: session.id,
          artistName: session.name,
          title,
          coverUrl,
          genre,
          subGenre,
          language,
          mood,
          stores,
          tracks,
          releaseDate: releaseDate || new Date().toISOString().split('T')[0],
          status
        })
      });
      const data = await res.json();
      if (data.success) {
        setReleases([data.release, ...releases]);
        // Reset form
        setTitle('');
        setTracks([]);
        setCoverDesc('');
        setAiMetadataResult(null);
        setAiCoverResult(null);
        setActiveTab('releases');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // GEMINI AI INTEGRATIONS (CLIENT FETCHERS)
  // ==========================================

  // AI Metadata checker
  const runAiMetadataCheck = async () => {
    setAiMetadataLoading(true);
    setAiMetadataResult(null);
    try {
      const res = await fetch('/api/ai/metadata-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          genre,
          subGenre,
          language,
          mood,
          trackList: tracks
        })
      });
      const data = await res.json();
      setAiMetadataResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiMetadataLoading(false);
    }
  };

  // AI Genre suggester
  const runAiGenreSuggest = async () => {
    if (!newTrackTitle) {
      alert("Provide a track title first to suggest genres!");
      return;
    }
    setAiGenreLoading(true);
    setAiGenreResult(null);
    try {
      const res = await fetch('/api/ai/genre-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTrackTitle,
          mood,
          sampleLyrics: newTrackLyrics
        })
      });
      const data = await res.json();
      setAiGenreResult(data);
      if (data.suggestedGenre) {
        setGenre(data.suggestedGenre);
      }
      if (data.suggestedSubGenre) {
        setSubGenre(data.suggestedSubGenre);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenreLoading(false);
    }
  };

  // AI Lyrics formatter
  const runAiLyricsFormatter = async () => {
    if (!newTrackLyrics) {
      alert("Enter raw lyrics in the textarea first!");
      return;
    }
    setAiLyricsLoading(true);
    setAiLyricsResult(null);
    try {
      const res = await fetch('/api/ai/lyrics-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawLyrics: newTrackLyrics })
      });
      const data = await res.json();
      setAiLyricsResult(data);
      if (data.formattedLyrics) {
        setNewTrackLyrics(data.formattedLyrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLyricsLoading(false);
    }
  };

  // AI Cover Art compliance advisor
  const runAiCoverAdvisor = async () => {
    if (!coverDesc) {
      alert("Describe the visuals of your artwork in the text box.");
      return;
    }
    setAiCoverLoading(true);
    setAiCoverResult(null);
    try {
      const res = await fetch('/api/ai/cover-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseTitle: title || "Untitled Release",
          artworkDescription: coverDesc
        })
      });
      const data = await res.json();
      setAiCoverResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiCoverLoading(false);
    }
  };

  // Helper colors for charts
  const COLORS = ['#a855f7', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg text-white">
                <Music size={18} />
              </span>
              <span className="font-bold text-xl font-display text-white tracking-tight">Dream Records</span>
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold px-1">
              Independent Artist Center
            </div>
          </div>

          <div className="p-3 bg-slate-950/50 border border-slate-800/40 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center font-display font-semibold text-purple-300">
              {session.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate leading-none mb-1">{session.name}</h4>
              <p className="text-[10px] text-purple-400 font-mono truncate">{session.labelName || 'Independent Artist'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'overview' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <BarChart3 size={15} />
              Overview & Stats
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'upload' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Upload size={15} />
              Upload Release
              <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">AI Portal</span>
            </button>
            <button
              onClick={() => setActiveTab('releases')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'releases' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <ListMusic size={15} />
              My Releases
              {releases.length > 0 && (
                <span className="ml-auto text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {releases.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('royalties')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'royalties' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Wallet size={15} />
              Royalties Ledger
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'support' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <LifeBuoy size={15} />
              Support Helpdesk
              {tickets.filter(t => t.status === 'open').length > 0 && (
                <span className="ml-auto text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                  {tickets.filter(t => t.status === 'open').length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3">
          <button
            onClick={fetchData}
            className="w-full py-2 px-3 text-left rounded-lg text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1.5 hover:bg-slate-800/30 transition-all"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Fetch API Updates
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 text-left rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all cursor-pointer"
          >
            Disconnect Studio
          </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        
        {/* TAB HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold font-display text-white tracking-tight capitalize">
              {activeTab === 'overview' && 'Artist Analytics'}
              {activeTab === 'upload' && 'Upload Music'}
              {activeTab === 'releases' && 'Release Manager'}
              {activeTab === 'royalties' && 'Royalty Ledger'}
              {activeTab === 'support' && 'Support Tickets'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'overview' && 'Global streams cycles, digital storefront breakdowns, and earnings summaries.'}
              {activeTab === 'upload' && 'Submit files and utilize powerful server-side Gemini intelligence models to pass store compliance audits.'}
              {activeTab === 'releases' && 'Manage your master submissions queue, check UPCs, ISRCs, or read editorial feedback.'}
              {activeTab === 'royalties' && 'Unlocked payouts, withdrawable reserves ledger and transparent statements.'}
              {activeTab === 'support' && 'Direct contact desk with platform technicians and music publishing supervisors.'}
            </p>
          </div>
          <div className="text-[10px] font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            Node Container Ingress: <span className="text-green-400 font-bold">PORT 3000 (Active)</span>
          </div>
        </div>

        {/* LOADING BOX OVERLAY */}
        {loading && !stats && (
          <div className="py-24 text-center">
            <RefreshCw size={36} className="animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-mono">Syncing digital assets queue with Dream Records network databases...</p>
          </div>
        )}

        {/* ==========================================
            TAB: OVERVIEW & ANALYTICS
           ========================================== */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            
            {/* Top row cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3 text-slate-400 text-xs font-mono uppercase tracking-wider mb-3">
                  <BarChart3 size={14} className="text-purple-400" />
                  Lifetime Streams
                </div>
                <h3 className="text-3xl font-bold font-display text-white">{stats.lifetimeStreams.toLocaleString()}</h3>
                <p className="text-[10px] text-green-400 mt-2 font-mono flex items-center gap-1">
                  <ArrowUpRight size={12} />
                  +12.4% stream cycle acceleration
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3 text-slate-400 text-xs font-mono uppercase tracking-wider mb-3">
                  <DollarSign size={14} className="text-blue-400" />
                  Total Revenue Generated
                </div>
                <h3 className="text-3xl font-bold font-display text-white">₹{stats.lifetimeEarnings.toLocaleString()}</h3>
                <p className="text-[10px] text-blue-400 mt-2 font-mono">
                  100% Master Royalties Cleared
                </p>
              </div>

              <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-purple-500/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3 text-slate-400 text-xs font-mono uppercase tracking-wider mb-3">
                  <Wallet size={14} className="text-green-400" />
                  Withdrawable Wallet Balance
                </div>
                <h3 className="text-3xl font-bold font-display text-green-400">₹{stats.pendingBalance.toLocaleString()}</h3>
                <button
                  onClick={() => setActiveTab('royalties')}
                  className="mt-3 text-[10px] font-bold text-purple-400 hover:text-purple-300 font-mono uppercase flex items-center gap-1"
                >
                  Request Instant 1-Click Withdrawal →
                </button>
              </div>
            </div>

            {/* Interactive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Streams monthly area chart */}
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold font-display text-white mb-6 uppercase tracking-wider text-slate-400">Stream Volume Trajectory (Monthly Cycles)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.ledgerHistory}>
                      <defs>
                        <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Area type="monotone" dataKey="streams" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorStreams)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Digital Storefront distribution pie */}
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold font-display text-white mb-6 uppercase tracking-wider text-slate-400">Streams by Digital Platform</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.storeBreakdown}>
                      <XAxis dataKey="store" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      <Bar dataKey="streams" radius={[4, 4, 0, 0]}>
                        {stats.storeBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Geographic Audience breakdown */}
            <div className="glass-panel p-6 rounded-2xl">
              <h4 className="text-sm font-bold font-display text-white mb-4 uppercase tracking-wider text-slate-400">Territorial Revenue Demographics</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {stats.countryBreakdown.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 text-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{item.country}</span>
                    <h5 className="text-lg font-bold font-display text-white mt-1">{item.streams.toLocaleString()}</h5>
                    <p className="text-[10px] text-green-400 font-mono mt-0.5">₹{item.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <Waveform />
          </div>
        )}

        {/* ==========================================
            TAB: UPLOAD RELEASE (FORM WITH AI WORKFLOW)
           ========================================== */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Column 1 & 2: Main Metadata Form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Section A: Album Basic info */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                    <Music size={16} className="text-purple-400" />
                    <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider">A. Primary Release Metadata</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2">Album / Single Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-700 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. Maya (Traditional Soul)"
                      />
                      <p className="text-[9px] text-slate-500 font-mono mt-1">Note: Match spelling exactly with artwork and vocals.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2">Main Genre</label>
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Indian Classical / Fusion"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2">Sub Genre / Style</label>
                      <input
                        type="text"
                        value={subGenre}
                        onChange={(e) => setSubGenre(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Assamese Folk"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2">Content Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        <option>Assamese</option>
                        <option>Bengali</option>
                        <option>Hindi</option>
                        <option>English</option>
                        <option>Instrumental</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2">Atmospheric Mood</label>
                      <input
                        type="text"
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Nostalgic"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2">Release Date Planning</label>
                      <input
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <p className="text-[9px] text-slate-500 font-mono mt-1">Schedule at least 10 days in advance for verified playlist scouting.</p>
                    </div>
                  </div>
                </div>

                {/* Section B: Tracklist builder */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                    <ListMusic size={16} className="text-purple-400" />
                    <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider">B. Tracklist Manifest ({tracks.length} tracks added)</h4>
                  </div>

                  {tracks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {tracks.map((t, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-mono text-[10px] text-slate-500 mr-2">Track #{idx+1}</span>
                            <span className="font-bold text-white font-display">{t.title}</span>
                            <span className="ml-1 text-[10px] text-purple-400">({t.version})</span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Composer: {t.composer} | Lyricist: {t.lyricist}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTrack(idx)}
                            className="text-red-400 hover:text-red-300 font-mono text-[10px] border border-red-900/40 bg-red-950/20 px-2 py-1 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Track Sub-form */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900/60 space-y-3">
                    <h5 className="text-[10px] font-bold text-purple-300 font-mono uppercase tracking-wider">Add Individual Track Details</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Track Title</label>
                        <input
                          type="text"
                          value={newTrackTitle}
                          onChange={(e) => setNewTrackTitle(e.target.value)}
                          className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none"
                          placeholder="e.g. Sitar Awakening"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Featuring Artist</label>
                        <input
                          type="text"
                          value={newTrackFeaturing}
                          onChange={(e) => setNewTrackFeaturing(e.target.value)}
                          className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none"
                          placeholder="e.g. Tosiba Begum"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Singer</label>
                        <input
                          type="text"
                          value={newTrackSinger}
                          onChange={(e) => setNewTrackSinger(e.target.value)}
                          className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Lyricist</label>
                        <input
                          type="text"
                          value={newTrackLyricist}
                          onChange={(e) => setNewTrackLyricist(e.target.value)}
                          className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none"
                          placeholder="Traditional Folk"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[9px] text-slate-400 uppercase font-mono mb-1">Raw Song Lyrics (or type [Instrumental])</label>
                        <textarea
                          rows={2}
                          value={newTrackLyrics}
                          onChange={(e) => setNewTrackLyrics(e.target.value)}
                          className="w-full py-1.5 px-2 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none placeholder-slate-700"
                          placeholder="Type lyrics here..."
                        />
                      </div>
                    </div>

                    {/* AI Buttons for tracks */}
                    <div className="flex gap-2 flex-wrap pt-2">
                      <button
                        type="button"
                        onClick={runAiGenreSuggest}
                        disabled={aiGenreLoading}
                        className="py-1 px-2.5 rounded text-[10px] font-mono border border-purple-800/40 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={11} />
                        {aiGenreLoading ? 'Vibe Scanning...' : 'AI Genre & Playlist Suggest'}
                      </button>

                      <button
                        type="button"
                        onClick={runAiLyricsFormatter}
                        disabled={aiLyricsLoading}
                        className="py-1 px-2.5 rounded text-[10px] font-mono border border-blue-800/40 bg-blue-950/20 text-blue-300 hover:bg-blue-900/30 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={11} />
                        {aiLyricsLoading ? 'Lyrics formatting...' : 'AI Format Lyrics & LRC'}
                      </button>
                    </div>

                    {/* AI Track Result displays */}
                    {aiGenreResult && (
                      <div className="mt-2 p-3 rounded-lg bg-purple-950/20 border border-purple-900/40 text-[10px] font-mono text-purple-300">
                        <span className="font-bold text-white block mb-1">🔮 AI Playlist Advisory Result:</span>
                        Suggested Main Genre: {aiGenreResult.suggestedGenre} | Subgenre: {aiGenreResult.suggestedSubGenre}
                        <div className="mt-1 text-slate-300">Target Playlists: {aiGenreResult.targetPlaylists?.join(', ')}</div>
                        <div className="text-slate-400 italic mt-0.5">Vibe Analysis: {aiGenreResult.vibeAnalysis}</div>
                      </div>
                    )}

                    {aiLyricsResult && (
                      <div className="mt-2 p-3 rounded-lg bg-blue-950/20 border border-blue-900/40 text-[10px] font-mono text-blue-300">
                        <span className="font-bold text-white block mb-1">🎙️ AI Lyrics Compliance Result:</span>
                        Spam/Explicit Check: {aiLyricsResult.hasInappropriateContent ? '⚠️ Content flag detected!' : '✅ Compliance approved.'}
                        <div className="text-slate-300 mt-1">Suggested Tip: {aiLyricsResult.tips}</div>
                        <pre className="mt-2 bg-slate-950 p-2 rounded text-[9px] text-slate-400 overflow-x-auto whitespace-pre-wrap">{aiLyricsResult.timestampTemplate}</pre>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleAddTrack}
                        className="py-1.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        Append to Tracklist
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section C: Store destinations */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                    <CheckCircle size={16} className="text-purple-400" />
                    <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider">C. Streaming Store Targets</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['spotify', 'apple', 'jiosaavn', 'gaana', 'instagram', 'youtube', 'tiktok', 'amazonmusic'].map((st) => (
                      <label key={st} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-900/60 text-xs capitalize cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stores.includes(st)}
                          onChange={(e) => {
                            if (e.target.checked) setStores([...stores, st]);
                            else setStores(stores.filter(s => s !== st));
                          }}
                          className="accent-purple-500 rounded"
                        />
                        {st === 'jiosaavn' ? 'JioSaavn' : st === 'amazonmusic' ? 'Amazon Music' : st}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Action Block */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => handleCreateRelease('draft')}
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    Save as Temporary Draft
                  </button>
                  <button
                    onClick={() => handleCreateRelease('scheduled')}
                    className="py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
                  >
                    Submit for Official Store Audit
                  </button>
                </div>

              </div>

              {/* Column 3: AI Metadata & Cover Advisor */}
              <div className="space-y-6">
                
                {/* Visual Artwork Box */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider text-slate-400">D. Cover Artwork compliance</h4>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                    <img src={coverUrl} alt="Cover art" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="relative z-10 space-y-2">
                      <p className="text-xs font-bold text-white font-display">Simulated Store Image</p>
                      <input
                        type="text"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        className="py-1 px-2 text-[10px] bg-slate-950/90 border border-slate-800 text-slate-300 rounded focus:outline-none w-48 text-center"
                        placeholder="Image URL"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2">Describe visual details of cover art</label>
                    <textarea
                      rows={3}
                      value={coverDesc}
                      onChange={(e) => setCoverDesc(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-700 focus:outline-none"
                      placeholder="e.g. Portrait photo of singer with high-contrast violet shadows and album name 'Maya' written on bottom center in simple clean font..."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={runAiCoverAdvisor}
                    disabled={aiCoverLoading}
                    className="w-full py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] font-mono text-purple-400 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={12} />
                    {aiCoverLoading ? 'Analyzing Artwork Elements...' : 'AI Verify Cover Compliance'}
                  </button>

                  {aiCoverResult && (
                    <div className="p-4 rounded-xl bg-purple-950/10 border border-purple-900/40 text-[11px] font-mono text-purple-300 space-y-1">
                      <div className="font-bold text-white flex justify-between items-center mb-1">
                        <span>Cover Art Score:</span>
                        <span className="text-green-400">{aiCoverResult.complianceScore}%</span>
                      </div>
                      <div>Rejection Risk: <span className="font-bold text-red-400">{aiCoverResult.estimatedRejectionRisk}</span></div>
                      <div className="text-slate-300 pt-1 leading-normal">Tip: {aiCoverResult.suggestions}</div>
                    </div>
                  )}
                </div>

                {/* AI Metadata Compliance Auditor */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider text-slate-400">AI Metadata pre-audit</h4>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">Gemini 3.5</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Trigger a comprehensive structural audit of your album titles, spelling schemas, language tags, and track-level copyright credits.
                  </p>

                  <button
                    type="button"
                    onClick={runAiMetadataCheck}
                    disabled={aiMetadataLoading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/40 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className="text-purple-400 animate-pulse" />
                    {aiMetadataLoading ? 'Conducting Deep Audit...' : 'Audit Full Release Metadata'}
                  </button>

                  {aiMetadataResult && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                        <span className="text-xs text-slate-400 font-mono">Store Compliance Rating</span>
                        <div className="text-right">
                          <span className={`text-lg font-bold font-display ${aiMetadataResult.score >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>{aiMetadataResult.score}%</span>
                          <span className="text-[9px] font-mono text-slate-500 block">Status: {aiMetadataResult.compliance}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold font-mono text-slate-500 uppercase block">Checkpoints Checked</span>
                        {aiMetadataResult.checks?.map((chk: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start text-[10px] leading-snug">
                            <span>{chk.passed ? '✅' : '⚠️'}</span>
                            <div>
                              <span className="font-bold text-slate-300 block">{chk.label}</span>
                              <span className="text-slate-400 font-mono text-[9px]">{chk.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] font-mono leading-normal text-slate-400">
                        <span className="font-bold text-purple-400 block mb-0.5">🧠 AI Suggestion:</span>
                        {aiMetadataResult.aiSuggestions}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: RELEASE MANAGER
           ========================================== */}
        {activeTab === 'releases' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider text-slate-400">Released Master Catalog</h4>
              <button
                onClick={() => setActiveTab('upload')}
                className="py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg flex items-center gap-1"
              >
                <Plus size={14} /> Add New Release
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {releases.map((rel) => (
                <div key={rel.id} className="glass-panel p-5 rounded-2xl flex gap-4 relative">
                  
                  {/* Art Cover Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                    <img src={rel.coverUrl} alt={rel.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="overflow-hidden flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">UPC: {rel.upc || 'Pending review'}</span>
                        
                        {/* Status badges */}
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          rel.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          rel.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          rel.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {rel.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold font-display text-white mt-1 truncate">{rel.title}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Genre: {rel.genre} ({rel.subGenre})</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-900 pt-3 mt-3 text-[10px] text-slate-500 font-mono">
                      <span>Date: {rel.releaseDate}</span>
                      <span>Tracks: {rel.tracks?.length || 0}</span>
                    </div>
                  </div>

                  {/* Reject/Feedback Warning box if status is rejected */}
                  {rel.status === 'rejected' && rel.feedback && (
                    <div className="absolute inset-x-0 bottom-0 bg-red-950/95 border-t border-red-800 p-4 rounded-b-2xl text-xs text-red-200">
                      <div className="flex gap-2 items-start">
                        <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold block text-white">Platform Auditor Decision Feedback:</span>
                          <span className="italic">"{rel.feedback}"</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {releases.length === 0 && (
                <div className="col-span-2 py-16 text-center glass-panel rounded-2xl">
                  <Music size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-xs font-mono text-slate-400">No releases currently logged under your account. Launch a new upload!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: ROYALTIES LEDGER & CASHOUT
           ========================================== */}
        {activeTab === 'royalties' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Ledger Wallet balance card */}
              <div className="lg:col-span-1 bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Wallet size={14} className="text-purple-400" />
                    Ledger Wallet reserves
                  </div>
                  <h3 className="text-3xl font-bold font-display text-white mt-2">₹{stats.pendingBalance.toLocaleString()}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 leading-normal">
                    This balance represents your cleared digital mechanical and performance master royalties, compiled across all storefront audits.
                  </p>
                </div>

                {/* Instant payout request form */}
                <form onSubmit={handleCashout} className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                  <h5 className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider">1-Click Fast Withdrawal</h5>
                  
                  {withdrawalMessage && (
                    <div className="p-2.5 bg-purple-950/30 border border-purple-800/40 rounded text-[10px] font-mono text-purple-300 leading-normal">
                      {withdrawalMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Transfer Amount (INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10000"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Payment Channel</label>
                    <select
                      value={withdrawalMethod}
                      onChange={(e) => setWithdrawalMethod(e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    >
                      <option>UPI</option>
                      <option>Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">UPI ID or Bank Details (IFSC/ACC)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. name@okhdfcbank"
                      value={withdrawalDetails}
                      onChange={(e) => setWithdrawalDetails(e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow-md"
                  >
                    Send Withdrawal Request
                  </button>
                </form>
              </div>

              {/* Ledger history list */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold font-display text-white mb-4 uppercase tracking-wider text-slate-400">Statement Cycles Logs</h4>
                
                <div className="space-y-3">
                  {stats.ledgerHistory.map((hist: any) => (
                    <div key={hist.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-white font-display">{hist.month} Statement Cycle</span>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">
                          Audited Streams Volume: {hist.streams.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-400 font-display">₹{hist.revenue.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{hist.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="text-sm font-bold font-display text-white mb-4 mt-8 uppercase tracking-wider text-slate-400">Withdrawal Transactions History</h4>
                <div className="space-y-3">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">₹{w.amount.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-500 font-mono">Method: {w.paymentMethod} | {w.details}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-mono block">{new Date(w.createdAt).toLocaleDateString()}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase mt-1 inline-block px-1.5 py-0.5 rounded ${
                          w.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {withdrawals.length === 0 && (
                    <p className="text-xs text-slate-500 font-mono text-center py-4 italic">No withdrawal transactions logged yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB: SUPPORT HELPDESK & REAL-TIME CHAT
           ========================================== */}
        {activeTab === 'support' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Create ticket form */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-2xl">
                <h4 className="text-sm font-bold font-display text-white mb-4 uppercase tracking-wider text-slate-400 font-mono">File New Help Ticket</h4>
                
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. YouTube Note Badge Upgrade"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="distribution">Digital Distribution</option>
                      <option value="royalties">Royalties Accounting</option>
                      <option value="technical">Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Detailed Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Provide specific UPCs, ISRCs, or channel links to accelerate review."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xs rounded-xl"
                  >
                    Submit Support Case
                  </button>
                </form>
              </div>

              {/* Live tickets list & active chat log */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Active Chat Popup overlay if ticket selected */}
                {activeTicketChat ? (
                  <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[500px]">
                    <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                          Ticket #{activeTicketChat.id}
                        </span>
                        <h4 className="text-sm font-bold font-display text-white mt-1">{activeTicketChat.subject}</h4>
                      </div>
                      <button
                        onClick={() => setActiveTicketChat(null)}
                        className="text-xs font-mono text-slate-400 hover:text-white bg-slate-850 py-1 px-2.5 rounded border border-slate-800"
                      >
                        Exit chat
                      </button>
                    </div>

                    {/* Chat Logs Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                      
                      {/* Artist Initial Message */}
                      <div className="p-3 bg-slate-900/60 rounded-xl max-w-[80%] border border-slate-900">
                        <span className="text-[10px] font-bold text-purple-400 block mb-1">{activeTicketChat.artistName} (Opening Statement)</span>
                        <p className="text-xs text-slate-300">{activeTicketChat.message}</p>
                        <span className="text-[8px] text-slate-500 font-mono mt-1 block text-right">{new Date(activeTicketChat.createdAt).toLocaleString()}</span>
                      </div>

                      {/* Conversation thread */}
                      {activeTicketChat.replies?.map((rep, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl max-w-[80%] text-xs ${
                            rep.sender === 'artist' 
                              ? 'bg-slate-900 border border-slate-800 mr-auto' 
                              : 'bg-purple-950/40 border border-purple-800/40 ml-auto text-right'
                          }`}
                        >
                          <span className={`text-[10px] font-bold block mb-1 ${rep.sender === 'artist' ? 'text-purple-400' : 'text-blue-400'}`}>
                            {rep.senderName}
                          </span>
                          <p className="text-slate-200 leading-normal">{rep.message}</p>
                          <span className="text-[8px] text-slate-500 font-mono mt-1 block">{new Date(rep.createdAt).toLocaleString()}</span>
                        </div>
                      ))}

                    </div>

                    {/* Chat input box */}
                    <form onSubmit={handlePostTicketReply} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Type reply to platform auditors..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="flex-grow py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Send size={14} /> Send
                      </button>
                    </form>

                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-2xl">
                    <h4 className="text-sm font-bold font-display text-white mb-4 uppercase tracking-wider text-slate-400 font-mono">Your Support Tickets Log</h4>
                    
                    <div className="space-y-3">
                      {tickets.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setActiveTicketChat(t)}
                          className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 hover:border-purple-500/30 transition-all cursor-pointer flex justify-between items-center"
                        >
                          <div className="overflow-hidden flex-1 pr-4">
                            <div className="flex gap-2 items-center mb-1">
                              <span className="text-[9px] font-mono uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">#{t.id}</span>
                              <span className="text-[10px] font-mono text-slate-500">{t.category}</span>
                            </div>
                            <h5 className="text-xs font-bold text-white truncate font-display">{t.subject}</h5>
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              t.status === 'open' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {t.status}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono block mt-1">Read / Chat &rarr;</span>
                          </div>
                        </div>
                      ))}

                      {tickets.length === 0 && (
                        <p className="text-xs text-slate-500 font-mono text-center py-4 italic">No active support cases recorded.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
