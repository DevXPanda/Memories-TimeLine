"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/AuthProvider";
import { 
  UserPlus, Users, Clock, Check, Shield, 
  Search, Copy, Send, Loader2, Sparkles, User, Key, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FriendsPage() {
  const { userId } = useAuth();
  const user = useQuery(api.auth.getUser, { userId: userId ?? undefined });
  const friends = useQuery(api.friends.listFriends, { userId: userId! }) || [];
  const pending = useQuery(api.friends.listPending, { userId: userId! }) || [];
  
  const sendRequest = useMutation(api.friends.sendRequest);
  const acceptRequest = useMutation(api.friends.acceptRequest);

  const [uidInput, setUidInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uidInput.trim()) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      await sendRequest({ userId: userId!, friendUniqueId: uidInput.trim().toUpperCase() });
      setSuccess("Sent! ✨");
      setUidInput("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed");
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  const copyUid = () => {
    if (user?.uniqueId) {
      navigator.clipboard.writeText(user.uniqueId);
      setSuccess("Copied! 📋");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  if (!userId) return null;

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Header Selection */}
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 glass border" style={{ borderColor: "var(--border-glass-strong)" }}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--primary-deep)" }}>
                Sanctuary Connections
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] mb-6 hero-title font-bold tracking-tighter whitespace-nowrap">
              The Social Sanctuary
            </h1>
            
            <p className="text-base sm:text-lg max-w-xl mx-auto mb-12 leading-relaxed font-medium opacity-60" style={{ color: "var(--text-muted)" }}>
              A private, secure haven for your inner circle. Connect via digital keys to share moments and milestones together.
            </p>

            {/* Symmetrical Control Pods */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-5 max-w-3xl mx-auto">
               <motion.div whileHover={{ scale: 1.01 }} className="glass-strong rounded-[32px] p-6 border shadow-xl w-full md:w-[380px] h-[120px] flex flex-col justify-center relative group overflow-hidden" 
                  style={{ borderColor: "var(--border-glass-strong)" }}>
                  <form className="space-y-3 relative z-10 w-full">
                     <div className="flex items-center justify-between px-1">
                        <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-30">My Secure ID</p>
                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-all">
                           <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
                           <span className="text-[8px] font-black uppercase tracking-widest text-green-600">Secure</span>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <div className="relative flex-1 bg-white/40 border border-white/20 rounded-xl flex items-center px-4 h-10 shadow-inner group-hover:bg-white/60 transition-colors">
                          <Key className="w-3.5 h-3.5 text-orange-500 mr-2.5 opacity-30" />
                          <span className="text-base font-black tracking-[0.15em] font-mono leading-none" style={{ color: "var(--primary-deep)" }}>
                            {user?.uniqueId || "••••••••"}
                          </span>
                       </div>
                       <button type="button" onClick={copyUid} className="h-10 px-4 rounded-xl bg-white shadow-md hover:scale-105 active:scale-95 transition-all border border-rose-50/50 flex items-center justify-center">
                          <Copy className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                       </button>
                     </div>
                  </form>
               </motion.div>

               <motion.div whileHover={{ scale: 1.01 }} className="glass rounded-[32px] p-6 border shadow-lg w-full md:w-[380px] h-[120px] flex flex-col justify-center relative overflow-hidden" 
                  style={{ borderColor: "var(--border-glass)" }}>
                  <form onSubmit={handleSend} className="space-y-3 relative z-10 w-full">
                     <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-30 px-1 text-left">Connect New Member</p>
                     <div className="flex gap-2">
                       <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-20" />
                          <input 
                            value={uidInput} onChange={(e) => setUidInput(e.target.value)}
                            placeholder="ENTER UID..." 
                            className="w-full h-10 pl-10 pr-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] bg-white/50 border border-white/20 focus:border-rose-300 outline-none transition-all shadow-inner" 
                          />
                       </div>
                       <button 
                         disabled={loading || !uidInput}
                         className="h-10 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center font-black text-[9px] uppercase tracking-widest gap-2"
                       >
                         {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3 h-3" /> Invite</>}
                       </button>
                     </div>
                  </form>
                  <AnimatePresence>
                     {(error || success) && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                         className={`absolute bottom-1 left-4 right-4 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border text-center z-20 ${error ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}
                       >
                         {error || success}
                       </motion.div>
                     )}
                  </AnimatePresence>
               </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Home-Page Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] blur-[150px] rounded-full opacity-10 pointer-events-none -translate-y-1/2" style={{ background: "var(--primary)" }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] blur-[180px] rounded-full opacity-10 pointer-events-none translate-y-1/2" style={{ background: "var(--accent)" }} />
      </section>

      {/* Main Container - Matched to Global UI */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        
        {/* Pending Requests Section */}
        <AnimatePresence>
          {pending.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 pt-16 border-t" style={{ borderColor: 'var(--border-glass)' }}>
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center shadow-sm" style={{ borderColor: 'var(--border-glass)' }}>
                     <Clock className="w-5 h-5 text-rose-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Pending Invitations</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5">Awaiting sanctuary access</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pending.map((p: any) => (
                    <div key={p.friendshipId} className="glass-strong rounded-[32px] p-5 border flex items-center justify-between group hover:border-rose-400 transition-all shadow-md" style={{ borderColor: 'var(--border-glass-strong)' }}>
                       <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100 group-hover:rotate-3 transition-all duration-500">
                             <User className="w-6 h-6 opacity-20" />
                          </div>
                          <div className="overflow-hidden">
                             <h4 className="font-bold truncate text-[var(--primary-deep)] text-lg tracking-tight">{p.email.split('@')[0]}</h4>
                             <p className="text-[9px] opacity-40 font-mono tracking-widest uppercase font-black">{p.uniqueId}</p>
                          </div>
                       </div>
                       <button onClick={() => acceptRequest({ friendshipId: p.friendshipId })}
                         className="w-11 h-11 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                          <Check className="w-5 h-5" />
                       </button>
                    </div>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Sanctuary Circle Section hub */}
        <div className="pt-16 border-t" style={{ borderColor: "var(--border-glass)" }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-1">
               <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                  The Sanctuary Circle
               </h2>
               <p className="text-sm opacity-60 font-medium" style={{ color: "var(--text-muted)" }}>
                  {friends.length} trusted connections in your circle
               </p>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center shadow-sm border" style={{ borderColor: 'var(--border-glass)' }}>
                  <Users className="w-5 h-5 text-indigo-500" />
               </div>
               <div className="px-4 py-2 rounded-2xl glass border text-[10px] font-black uppercase tracking-widest opacity-40" style={{ borderColor: 'var(--border-glass)' }}>
                  Secure Hub
               </div>
            </div>
          </div>

          {friends.length === 0 ? (
            <div className="text-center py-40 glass-strong rounded-[48px] border-4 border-dashed bg-white/5 relative overflow-hidden" style={{ borderColor: 'var(--border-glass-strong)' }}>
               <div className="max-w-xs mx-auto space-y-6 relative z-10">
                  <div className="w-20 h-20 rounded-[32px] bg-rose-50 flex items-center justify-center mx-auto shadow-inner border border-rose-100 animate-float">
                     <UserPlus className="w-8 h-8 opacity-20" style={{ color: 'var(--primary)' }} />
                  </div>
                  <h4 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Silent Sanctuary</h4>
                  <p className="text-sm font-medium opacity-50 leading-relaxed italic px-8">
                    Your circle is ready. Share your handle to start building a private world together.
                  </p>
                  <button onClick={copyUid} className="btn-primary py-2.5 px-6 text-[10px] uppercase tracking-widest font-black">Copy Identity Handle</button>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {friends.map((f: any, idx: number) => (
                <motion.div 
                  key={f._id} 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                  className="glass-strong rounded-[32px] p-5 border group relative overflow-hidden transition-all duration-500 hover:shadow-xl h-[120px] flex items-center justify-between gap-4" 
                  style={{ borderColor: 'var(--border-glass-strong)' }}
                >
                   {/* Left Side: Avatar & Identity */}
                   <div className="flex items-center gap-4 flex-1 min-w-0 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg relative border border-rose-50/50 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500 shrink-0">
                          <User className="w-7 h-7 opacity-10" />
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-[3px] border-white shadow-sm" />
                      </div>
                      
                      <div className="space-y-0.5 overflow-hidden">
                         <h4 className="font-black text-lg tracking-tight truncate group-hover:text-rose-500 transition-colors" style={{ color: 'var(--primary-deep)' }}>
                            {f.email.split('@')[0]}
                         </h4>
                         <p className="text-[9px] font-black tracking-[0.2em] opacity-30 uppercase font-mono">{f.uniqueId}</p>
                      </div>
                   </div>

                   {/* Right Side: Quick Actions */}
                   <div className="flex items-center gap-2 relative z-10">
                      <button className="w-10 h-10 rounded-xl glass border flex items-center justify-center shadow-md hover:bg-rose-500 hover:text-white transition-all group/clk" style={{ borderColor: 'var(--border-glass)' }}>
                         <Clock className="w-4.5 h-4.5 opacity-40 group-hover/clk:opacity-100" />
                      </button>
                   </div>

                   {/* Background Glow Effect */}
                   <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer minimal />
    </main>
  );
}
