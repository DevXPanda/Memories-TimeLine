"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/AuthProvider";
import { 
  UserPlus, Users, Clock, Check, Shield, 
  Search, Copy, Send, Loader2, Sparkles, User, Key, Heart, Ban, UserMinus, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSanctuaryUI } from "@/components/SanctuaryUIProvider";
import SanctuaryChat from "@/components/SanctuaryChat";

export default function FriendsPage() {
  const { userId } = useAuth();
  const user = useQuery(api.auth.getUser, { userId: userId ?? undefined });
  const friends = useQuery(api.friends.listFriends, { userId: userId! }) || [];
  const pending = useQuery(api.friends.listPending, { userId: userId! }) || [];
  const blocked = useQuery(api.friends.listBlocked, { userId: userId! }) || [];
  
  const sendRequest = useMutation(api.friends.sendRequest);
  const acceptRequest = useMutation(api.friends.acceptRequest);
  const updateAccess = useMutation(api.friends.updateAccess);
  const removeFriend = useMutation(api.friends.removeFriend);
  const blockFriend = useMutation(api.friends.blockFriend);
  const unblockFriend = useMutation(api.friends.unblockFriend);

  const { toast, confirm } = useSanctuaryUI();

  const [uidInput, setUidInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState<{ friendId: any; friendName: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uidInput.trim()) return;
    setLoading(true);
    try {
      await sendRequest({ userId: userId!, friendUniqueId: uidInput.trim().toUpperCase() });
      toast("Invitation sent to your friend! ✨", "success");
      setUidInput("");
    } catch (err: any) {
      toast(err.message || "Could not send invitation", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyUid = () => {
    if (user?.uniqueId) {
      navigator.clipboard.writeText(user.uniqueId);
      toast("Copied Identity Handle! 📋", "success");
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
                         className="btn-primary h-10 px-5 rounded-xl disabled:opacity-30 flex items-center justify-center font-black text-[9px] uppercase tracking-widest gap-2"
                       >
                         {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3 h-3 text-white" /> <span className="text-white">Invite</span></>}
                       </button>
                     </div>
                  </form>
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
            <div className="text-center py-20 px-6 glass-strong rounded-[48px] border-4 border-dashed bg-white/5 relative overflow-hidden" style={{ borderColor: 'var(--border-glass-strong)' }}>
               <div className="max-w-xs mx-auto space-y-5 relative z-10">
                  <div className="w-16 h-16 rounded-[24px] glass flex items-center justify-center mx-auto shadow-inner border animate-float" style={{ borderColor: 'var(--border-glass-strong)' }}>
                     <UserPlus className="w-6 h-6 opacity-20" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Silent Sanctuary</h4>
                    <p className="text-[11px] font-medium opacity-50 leading-relaxed italic px-8">
                      Your circle is ready. Share your handle to start building a private world together.
                    </p>
                  </div>
                  <button onClick={copyUid} className="btn-primary py-2.5 px-8 text-[10px] uppercase tracking-widest font-black">Copy Identity Handle</button>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {friends.map((f: any, idx: number) => (
                <motion.div 
                   key={f._id} 
                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                   className="glass-strong rounded-[32px] p-6 border group relative overflow-hidden transition-all duration-500 hover:shadow-xl h-auto flex flex-col gap-6" 
                   style={{ borderColor: 'var(--border-glass-strong)' }}
                 >
                    {f.status === "blocked_by_other" ? (
                      <div className="flex flex-col items-center justify-center text-center gap-4 py-8 relative">
                        <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center border shadow-inner" style={{ borderColor: 'var(--border-glass-strong)' }}>
                          <Ban className="w-8 h-8 text-rose-500 opacity-20" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg tracking-tight" style={{ color: 'var(--primary-deep)' }}>Sanctuary Access Locked</h4>
                          <p className="text-[10px] font-medium opacity-40 mt-2 leading-relaxed px-4 max-w-[200px] mx-auto">
                            Oops... you no longer have access to this private sanctuary. 🔒
                          </p>
                        </div>
                        <div className="mt-4 px-4 py-1.5 rounded-full glass text-[8px] font-black uppercase tracking-widest text-rose-500 border shadow-sm transition-all group-hover:bg-rose-500 group-hover:text-white" style={{ borderColor: 'var(--border-glass-strong)' }}>
                          Account Restricted
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Top: Avatar & Identity */}
                        <div className="flex items-center justify-between gap-4 relative z-10 w-full">
                           <div className="flex items-center gap-4 flex-1 min-w-0">
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

                           <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => { 
                                   confirm({
                                     title: "Block Connection?",
                                     message: "Are you sure you want to block this member? This action is permanent. 🔒",
                                     confirmText: "Block Member",
                                     type: "danger",
                                     onConfirm: () => {
                                       blockFriend({ friendshipId: f.friendshipId, userId: userId! });
                                       toast("Connection blocked successfully", "success");
                                     }
                                   });
                                 }}
                                 className="w-10 h-10 rounded-xl glass border flex items-center justify-center shadow-md hover:bg-rose-600 hover:text-white transition-all group/blk" style={{ borderColor: 'var(--border-glass)' }}>
                                  <Ban className="w-4 h-4 opacity-40 group-hover/blk:opacity-100" />
                               </button>

                               <button 
                                  onClick={() => { 
                                    confirm({
                                     title: "Remove Friend?",
                                     message: "End this sanctuary connection? You can re-invite them later if you change your mind. 🏃‍♂️",
                                     confirmText: "Remove Connection",
                                     type: "danger",
                                     onConfirm: () => {
                                       removeFriend({ friendshipId: f.friendshipId });
                                       toast("Friend removed from circle", "info");
                                     }
                                   });
                                  }}
                                  className="w-10 h-10 rounded-xl glass border flex items-center justify-center shadow-md hover:bg-rose-500 hover:text-white transition-all group/rmv" style={{ borderColor: 'var(--border-glass)' }}>
                                  <UserMinus className="w-4 h-4 opacity-40 group-hover/rmv:opacity-100" />
                               </button>
                           </div>
                        </div>

                        {/* Bottom: Access Management Dashboard */}
                        <div className="relative z-10 pt-5 border-t" style={{ borderColor: 'var(--border-glass)' }}>
                           <div className="flex items-center justify-between mb-4">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Their Access Level</p>
                              <label className="flex items-center gap-2 cursor-pointer group/toggle">
                                 <input 
                                   type="checkbox" 
                                   checked={f.friendAccessToMe.includes("all")} 
                                   onChange={(e) => updateAccess({ userId: userId!, friendshipId: f.friendshipId, access: e.target.checked ? ["all"] : ["memories", "events"] })}
                                   className="hidden" 
                                 />
                                 <div className={`w-8 h-4 rounded-full relative transition-all ${f.friendAccessToMe.includes("all") ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                                    <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-all ${f.friendAccessToMe.includes("all") ? 'translate-x-4' : ''}`} />
                                 </div>
                                 <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover/toggle:opacity-100">ALL</span>
                              </label>
                           </div>

                           <div className="flex gap-2">
                              <AccessButton 
                                 active={f.friendAccessToMe.includes("memories") || f.friendAccessToMe.includes("all")} 
                                 icon={Heart} label="Memories"
                                 onClick={() => {
                                    if (f.friendAccessToMe.includes("all")) return;
                                    const current = f.friendAccessToMe.filter((a: string) => a !== "all");
                                    const next = current.includes("memories") ? current.filter((a: string) => a !== "memories") : [...current, "memories"];
                                    updateAccess({ userId: userId!, friendshipId: f.friendshipId, access: next });
                                  }}
                              />
                              <AccessButton 
                                 active={f.friendAccessToMe.includes("events") || f.friendAccessToMe.includes("all")} 
                                 icon={Clock} label="Events"
                                 onClick={() => {
                                    if (f.friendAccessToMe.includes("all")) return;
                                    const current = f.friendAccessToMe.filter((a: string) => a !== "all");
                                    const next = current.includes("events") ? current.filter((a: string) => a !== "events") : [...current, "events"];
                                    updateAccess({ userId: userId!, friendshipId: f.friendshipId, access: next });
                                  }}
                              />
                           </div>
                        </div>
                      </>
                    )}

                    {/* Background Glow Effect */}
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Blocked Members Management Section */}
        <AnimatePresence>
          {blocked.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-24 pt-16 border-t" style={{ borderColor: 'var(--border-glass)' }}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center shadow-sm" style={{ borderColor: 'var(--border-glass)' }}>
                    <Ban className="w-5 h-5 text-rose-600" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Blocked Sanctuary Members</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5">Manage restricted access</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blocked.map((b: any) => (
                  <div key={b.friendshipId} className="glass-strong rounded-[28px] p-5 border flex items-center justify-between group grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100" style={{ borderColor: 'var(--border-glass-strong)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl glass flex items-center justify-center shrink-0">
                         <Ban className="w-5 h-5 opacity-20 text-rose-500" />
                      </div>
                      <div className="overflow-hidden">
                         <h4 className="font-bold truncate text-[var(--text-main)] text-base">{b.email.split('@')[0]}</h4>
                         <p className="text-[8px] opacity-40 font-mono tracking-widest uppercase font-black">{b.uniqueId}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        confirm({
                          title: "Unblock Friend?",
                          message: "Restore access for this person? They will be able to see your shared sanctuary again. ✨",
                          confirmText: "Unblock Member",
                          onConfirm: () => {
                            unblockFriend({ friendshipId: b.friendshipId, userId: userId! });
                            toast(`Unblocked ${b.email.split('@')[0]}`, "success");
                          }
                        });
                      }}
                      className="px-4 h-10 rounded-xl glass border font-black text-[9px] uppercase tracking-widest transition-all shadow-sm hover:opacity-80"
                      style={{ borderColor: 'var(--border-glass-strong)', color: 'var(--primary)' }}
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

         <AnimatePresence>
            {activeChat && (
               <SanctuaryChat 
                  userId={userId!} 
                  friendId={activeChat.friendId}
                  friendName={activeChat.friendName}
                  onClose={() => setActiveChat(null)}
               />
            )}
         </AnimatePresence>
      </div>
      <Footer minimal />
    </main>
  );
}

function AccessButton({ active, icon: Icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${active ? 'glass shadow-md opacity-100' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100 bg-white/5'}`}
      style={{ borderColor: active ? 'var(--primary)' : 'transparent' }}
    >
       <Icon className={`w-4 h-4 ${active ? '' : 'text-gray-400'}`} style={{ color: active ? 'var(--primary)' : undefined }} />
       <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: active ? 'var(--text-main)' : 'var(--text-light)' }}>{label}</span>
    </button>
  );
}
