import React, { useState, useEffect } from 'react';
import { UserSession, Release, SupportTicket, WithdrawalRequest } from '../types';
import { 
  Music, CheckSquare, ShieldCheck, Ticket, Database, Check, X, RefreshCw, 
  Send, User, BarChart3, AlertCircle, Sparkles, AlertTriangle, LogOut
} from 'lucide-react';

interface AdminDashboardProps {
  session: UserSession;
  onLogout: () => void;
}

interface ActivityLog {
  time: string;
  user: string;
  action: string;
}

export default function AdminDashboard({ session, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'releases' | 'payouts' | 'tickets' | 'logs'>('releases');
  const [releases, setReleases] = useState<Release[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter for release tabs in admin
  const [releaseFilter, setReleaseFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Input states for audit actions
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [upcCode, setUpcCode] = useState('');
  const [isrcCodes, setIsrcCodes] = useState<string[]>([]);
  const [rejectFeedback, setRejectFeedback] = useState('');

  // Active chat state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReply, setAdminReply] = useState('');

  // Fetch all admin data
  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const relRes = await fetch('/api/releases');
      const relData = await relRes.json();
      setReleases(relData);

      const withRes = await fetch('/api/withdrawals');
      const withData = await withRes.json();
      setWithdrawals(withData);

      const ticketRes = await fetch('/api/tickets');
      const ticketData = await ticketRes.json();
      setTickets(ticketData);

      const logRes = await fetch('/api/admin/logs');
      const logData = await logRes.json();
      setLogs(logData);
    } catch (err) {
      console.error("Failed fetching admin overview datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Handle Approve Release Submit
  const handleApproveReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelease) return;

    try {
      const res = await fetch('/api/admin/releases/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseId: selectedRelease.id,
          upc: upcCode || '50' + Math.floor(10000000000 + Math.random() * 90000000000),
          isrcs: isrcCodes
        })
      });
      const data = await res.json();
      if (data.success) {
        setReleases(releases.map(r => r.id === selectedRelease.id ? data.release : r));
        setSelectedRelease(null);
        setActionType(null);
        setUpcCode('');
        setIsrcCodes([]);
        fetchAllAdminData(); // Refresh activity log and state
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Reject Release Submit
  const handleRejectReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelease || !rejectFeedback) return;

    try {
      const res = await fetch('/api/admin/releases/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseId: selectedRelease.id,
          feedback: rejectFeedback
        })
      });
      const data = await res.json();
      if (data.success) {
        setReleases(releases.map(r => r.id === selectedRelease.id ? data.release : r));
        setSelectedRelease(null);
        setActionType(null);
        setRejectFeedback('');
        fetchAllAdminData(); // Refresh activity logs
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Payout request settlement approval
  const handleApprovePayout = async (id: string) => {
    try {
      const res = await fetch('/api/admin/withdrawals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawals(withdrawals.map(w => w.id === id ? data.withdrawal : w));
        fetchAllAdminData(); // refresh log & state
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Ticket Reply as Admin
  const handleTicketReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReply) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'admin',
          senderName: 'Dream Records Auditor Team',
          message: adminReply
        })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(tickets.map(t => t.id === data.ticket.id ? data.ticket : t));
        setSelectedTicket(data.ticket);
        setAdminReply('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered releases lists
  const filteredReleases = releases.filter(r => {
    if (releaseFilter === 'pending') return r.status === 'scheduled';
    if (releaseFilter === 'approved') return r.status === 'approved';
    return r.status === 'rejected';
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-gradient-to-br from-red-600 to-amber-600 rounded-lg text-white">
                <ShieldCheck size={18} />
              </span>
              <span className="font-bold text-xl font-display text-white tracking-tight">Dream Records</span>
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-red-500 font-bold px-1">
              Supervising Auditor HQ
            </div>
          </div>

          <div className="p-3 bg-slate-950/50 border border-slate-800/40 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center font-display font-semibold text-red-300">
              AD
            </div>
            <div>
              <h4 className="text-xs font-bold text-white truncate leading-none mb-1">{session.name}</h4>
              <p className="text-[10px] text-red-400 font-mono">Platform Admin</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('releases')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'releases' ? 'bg-red-600 text-white shadow-lg shadow-red-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Music size={15} />
              Releases Auditing
              {releases.filter(r => r.status === 'scheduled').length > 0 && (
                <span className="ml-auto text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">
                  {releases.filter(r => r.status === 'scheduled').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'payouts' ? 'bg-red-600 text-white shadow-lg shadow-red-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <CheckSquare size={15} />
              Payout Processing
              {withdrawals.filter(w => w.status === 'pending').length > 0 && (
                <span className="ml-auto text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                  {withdrawals.filter(w => w.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'tickets' ? 'bg-red-600 text-white shadow-lg shadow-red-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Ticket size={15} />
              Auditor Support Desk
              {tickets.filter(t => t.status === 'open').length > 0 && (
                <span className="ml-auto text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                  {tickets.filter(t => t.status === 'open').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${activeTab === 'logs' ? 'bg-red-600 text-white shadow-lg shadow-red-600/15' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Database size={15} />
              Activity oversight logs
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3">
          <button
            onClick={fetchAllAdminData}
            className="w-full py-2 px-3 text-left rounded-lg text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1.5 hover:bg-slate-800/30 transition-all"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh global state
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 text-left rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE PANEL */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        
        {/* HEADER AREA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold font-display text-white tracking-tight capitalize">
              {activeTab === 'releases' && 'Release Submissions Desk'}
              {activeTab === 'payouts' && 'Revenue Distribution Ledger'}
              {activeTab === 'tickets' && 'Support Incident Cases'}
              {activeTab === 'logs' && 'Global Database Activity Trails'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'releases' && 'Review independent metadata entries, evaluate catalog covers, and assign global UPCs and ISRCs.'}
              {activeTab === 'payouts' && 'Inspect and settle pending financial payout request receipts directly to creators.'}
              {activeTab === 'tickets' && 'Answer platform support tickets, upgrade YouTube channels, and manage incidents.'}
              {activeTab === 'logs' && 'Platform Audit trail oversight. In-memory datastore state logs updated in real-time.'}
            </p>
          </div>
          <div className="text-[10px] font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            Current Session: <span className="text-amber-400 font-bold">Platform Director (Active)</span>
          </div>
        </div>

        {/* LOADING NOTIFICATION */}
        {loading && (
          <div className="py-2 flex items-center justify-center gap-2 text-xs font-mono text-red-400">
            <RefreshCw size={14} className="animate-spin" />
            Syncing platform datastores...
          </div>
        )}

        {/* ==========================================
            TAB: RELEASES AUDITING PANEL
           ========================================== */}
        {activeTab === 'releases' && (
          <div className="space-y-6">
            
            {/* Filtering tab headers */}
            <div className="flex gap-2 border-b border-slate-900 pb-2">
              <button
                onClick={() => { setReleaseFilter('pending'); setSelectedRelease(null); setActionType(null); }}
                className={`py-1.5 px-3 rounded text-xs font-bold font-mono uppercase ${releaseFilter === 'pending' ? 'bg-red-600/20 text-red-400 border border-red-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Pending Review ({releases.filter(r => r.status === 'scheduled').length})
              </button>
              <button
                onClick={() => { setReleaseFilter('approved'); setSelectedRelease(null); setActionType(null); }}
                className={`py-1.5 px-3 rounded text-xs font-bold font-mono uppercase ${releaseFilter === 'approved' ? 'bg-green-600/20 text-green-400 border border-green-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Approved Catalog ({releases.filter(r => r.status === 'approved').length})
              </button>
              <button
                onClick={() => { setReleaseFilter('rejected'); setSelectedRelease(null); setActionType(null); }}
                className={`py-1.5 px-3 rounded text-xs font-bold font-mono uppercase ${releaseFilter === 'rejected' ? 'bg-slate-800 text-slate-400 border border-slate-700/50' : 'text-slate-400 hover:text-white'}`}
              >
                Rejected Queue ({releases.filter(r => r.status === 'rejected').length})
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 columns: Releases list */}
              <div className="lg:col-span-2 space-y-4">
                {filteredReleases.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setSelectedRelease(rel);
                      setActionType(null);
                      // Pre-fill mock codes
                      setUpcCode('50' + Math.floor(10000000000 + Math.random() * 90000000000));
                      setIsrcCodes(rel.tracks?.map(() => 'IN-TFW-26-' + Math.floor(10000 + Math.random() * 90000)) || []);
                    }}
                    className={`p-5 rounded-2xl bg-slate-900 border transition-all cursor-pointer flex gap-4 ${selectedRelease?.id === rel.id ? 'border-red-500 bg-slate-900/80 shadow-lg shadow-red-500/5' : 'border-slate-800/60 hover:border-slate-700/60'}`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                      <img src={rel.coverUrl} alt={rel.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-grow overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-0.5">
                          <span>Created: {new Date(rel.createdAt).toLocaleDateString()}</span>
                          <span className="capitalize text-red-400">By: {rel.artistName}</span>
                        </div>
                        <h4 className="text-base font-bold font-display text-white truncate">{rel.title}</h4>
                        <p className="text-xs text-slate-400 font-mono">Genre: {rel.genre} / {rel.subGenre}</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                        <span>Language: {rel.language}</span>
                        <span>Tracks count: {rel.tracks?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredReleases.length === 0 && (
                  <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800/40">
                    <Music size={32} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-xs font-mono text-slate-500">No releases found matching your search filter tab.</p>
                  </div>
                )}
              </div>

              {/* Right column: Single Release Detailed review & Action panel */}
              <div className="lg:col-span-1">
                {selectedRelease ? (
                  <div className="glass-panel p-6 rounded-2xl space-y-6 sticky top-8">
                    
                    <div>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Submission Details</span>
                      <h3 className="text-lg font-bold font-display text-white mt-2 leading-tight">{selectedRelease.title}</h3>
                      <p className="text-xs text-purple-400 font-mono mt-0.5">Artist: {selectedRelease.artistName}</p>
                    </div>

                    <div className="aspect-square w-32 h-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 mx-auto">
                      <img src={selectedRelease.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    </div>

                    {/* Metadata attributes list */}
                    <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs leading-normal">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Language:</span>
                        <span className="text-slate-300 font-bold">{selectedRelease.language}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Genre:</span>
                        <span className="text-slate-300 font-bold">{selectedRelease.genre}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Sub Genre:</span>
                        <span className="text-slate-300 font-bold">{selectedRelease.subGenre}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Target Stores:</span>
                        <span className="text-slate-300 font-bold max-w-[120px] truncate capitalize">{selectedRelease.stores?.join(', ')}</span>
                      </div>
                    </div>

                    {/* Tracklist layout */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase font-mono tracking-wider text-slate-500">Tracks breakdown</h4>
                      {selectedRelease.tracks?.map((t, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-950 text-xs border border-slate-900">
                          <span className="font-bold text-white block">{t.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Singers: {t.singer} | Featuring: {t.featuring || 'None'}</span>
                          <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">"{t.lyrics}"</p>
                        </div>
                      ))}
                    </div>

                    {/* Action form buttons */}
                    {selectedRelease.status === 'scheduled' && (
                      <div className="space-y-4 pt-4 border-t border-slate-900">
                        {!actionType ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => { setActionType('reject'); setRejectFeedback('Artwork criteria not met: Title misspelling.'); }}
                              className="py-2.5 bg-slate-950 hover:bg-slate-900 border border-red-950 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X size={14} /> Reject release
                            </button>
                            <button
                              onClick={() => setActionType('approve')}
                              className="py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check size={14} /> Approve release
                            </button>
                          </div>
                        ) : actionType === 'approve' ? (
                          <form onSubmit={handleApproveReleaseSubmit} className="space-y-3 p-3.5 bg-green-950/20 rounded-xl border border-green-900/40">
                            <h5 className="text-[10px] font-bold uppercase font-mono text-green-400">Confirm Catalog codes</h5>
                            
                            <div>
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Assigned UPC Code</label>
                              <input
                                type="text"
                                required
                                value={upcCode}
                                onChange={(e) => setUpcCode(e.target.value)}
                                className="w-full py-1.5 px-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-md shadow-green-500/10 cursor-pointer"
                            >
                              <Check size={14} /> Distribute to Stores Now
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionType(null)}
                              className="w-full py-1 text-[10px] font-mono text-slate-400 hover:text-white"
                            >
                              Cancel audit action
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handleRejectReleaseSubmit} className="space-y-3 p-3.5 bg-red-950/20 rounded-xl border border-red-900/40">
                            <h5 className="text-[10px] font-bold uppercase font-mono text-red-400">Decision Feedback</h5>
                            
                            <div>
                              <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Reason for Rejection</label>
                              <textarea
                                required
                                rows={3}
                                value={rejectFeedback}
                                onChange={(e) => setRejectFeedback(e.target.value)}
                                className="w-full py-1.5 px-2 bg-slate-950 border border-slate-850 rounded text-xs text-white"
                                placeholder="Be detailed so the artist can resubmit cleanly..."
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-md cursor-pointer"
                            >
                              <X size={14} /> Submit Rejection feedback
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionType(null)}
                              className="w-full py-1 text-[10px] font-mono text-slate-400 hover:text-white"
                            >
                              Cancel audit action
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="glass-panel p-6 rounded-2xl text-center space-y-3 text-xs text-slate-500 font-mono sticky top-8">
                    <Music size={24} className="text-slate-700 mx-auto mb-1" />
                    <p>Select a digital release card to inspect lyrics compliance, cover visuals, and process approval.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB: PAYOUTS MANAGER
           ========================================== */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-display text-white uppercase tracking-wider font-mono text-slate-400">Creators Cashout Requests Ledger</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {withdrawals.map((w) => (
                <div key={w.id} className="glass-panel p-5 rounded-2xl flex justify-between items-center flex-col sm:flex-row gap-4">
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="flex gap-2 items-center flex-col sm:flex-row">
                      <span className="text-lg font-bold text-green-400 font-display">₹{w.amount.toLocaleString()}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-900 capitalize">
                        Target: {w.paymentMethod}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 leading-normal">
                      Request ID: <span className="font-mono text-[10px] text-purple-400">{w.id}</span> | 
                      Recipient Creator: <span className="font-bold text-white">{w.artistName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Routing details: <span className="font-bold text-slate-300">{w.details}</span> | 
                      Date logged: {new Date(w.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {w.status === 'pending' ? (
                      <button
                        onClick={() => handleApprovePayout(w.id)}
                        className="py-2 px-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-green-600/10 cursor-pointer"
                      >
                        Settle & Mark Completed
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-bold uppercase text-green-400 bg-green-950/40 border border-green-900/30 px-3 py-1 rounded-lg">
                        Paid / Settle Complete
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {withdrawals.length === 0 && (
                <p className="text-xs text-slate-500 font-mono text-center py-8">No payout transactions recorded in database.</p>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: HELPDESK TICKETS CHAT
           ========================================== */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Tickets list */}
              <div className="lg:col-span-1 glass-panel p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider text-slate-400 font-mono">Help tickets logs</h4>
                
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTicket?.id === t.id ? 'border-red-500 bg-slate-950' : 'border-slate-850 bg-slate-950/40 hover:border-slate-800'}`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
                        <span>#{t.id}</span>
                        <span className={`font-bold uppercase ${t.status === 'open' ? 'text-red-400' : 'text-green-400'}`}>{t.status}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white font-display truncate">{t.subject}</h5>
                      <span className="text-[10px] text-slate-400 block mt-1">Creator: {t.artistName}</span>
                    </div>
                  ))}

                  {tickets.length === 0 && (
                    <p className="text-xs text-slate-500 font-mono text-center py-4 italic">No support incidents filed.</p>
                  )}
                </div>
              </div>

              {/* Chat thread box */}
              <div className="lg:col-span-2">
                {selectedTicket ? (
                  <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[500px]">
                    
                    <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">Incident #{selectedTicket.id}</span>
                        <h4 className="text-sm font-bold font-display text-white mt-1">{selectedTicket.subject}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Submitting Creator: {selectedTicket.artistName}</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                      
                      {/* Ticket Opening statement */}
                      <div className="p-3.5 bg-slate-900 rounded-xl max-w-[80%] border border-slate-850">
                        <span className="text-[10px] font-bold text-purple-400 block mb-1">{selectedTicket.artistName} (Opening Incident Statement)</span>
                        <p className="text-xs text-slate-300 leading-normal">{selectedTicket.message}</p>
                        <span className="text-[8px] text-slate-500 font-mono mt-1 block text-right">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                      </div>

                      {/* Conversation flow */}
                      {selectedTicket.replies?.map((rep, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl max-w-[80%] text-xs ${
                            rep.sender === 'admin'
                              ? 'bg-red-950/20 border border-red-900/30 ml-auto text-right'
                              : 'bg-slate-900 border border-slate-850 mr-auto'
                          }`}
                        >
                          <span className={`text-[10px] font-bold block mb-1 ${rep.sender === 'admin' ? 'text-red-400' : 'text-purple-400'}`}>
                            {rep.senderName}
                          </span>
                          <p className="text-slate-200 leading-normal">{rep.message}</p>
                          <span className="text-[8px] text-slate-500 font-mono mt-1 block">{new Date(rep.createdAt).toLocaleString()}</span>
                        </div>
                      ))}

                    </div>

                    {/* Chat reply input */}
                    <form onSubmit={handleTicketReplySubmit} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Type audit instructions or incident solution..."
                        value={adminReply}
                        onChange={(e) => setAdminReply(e.target.value)}
                        className="flex-grow py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Send size={14} /> Send & Resolve
                      </button>
                    </form>

                  </div>
                ) : (
                  <div className="glass-panel p-8 rounded-2xl text-center text-xs text-slate-500 font-mono py-24 border border-slate-850">
                    <Ticket size={28} className="text-slate-700 mx-auto mb-2" />
                    <p>Select a support incident from the log list to reply or review attachments.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB: SYSTEM OVERSIGHT ACTIVITY TRAILS
           ========================================== */}
        {activeTab === 'logs' && (
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold font-display text-white uppercase tracking-wider text-slate-400 font-mono">Platform oversight logs</h4>
            
            <div className="space-y-2 font-mono text-[11px] leading-relaxed">
              {logs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-950/60 border border-slate-900/60 rounded-xl flex gap-3 items-start">
                  <span className="text-red-500 font-bold flex-shrink-0">●</span>
                  <div className="flex-1">
                    <span className="text-slate-500 mr-2">[{new Date(log.time).toLocaleTimeString()}]</span>
                    <span className="font-bold text-slate-300">{log.user}:</span>
                    <span className="text-slate-400 ml-1">{log.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
