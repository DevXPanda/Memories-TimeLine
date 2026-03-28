"use client";
import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
   Search, MessageSquare, User, Loader2, Sparkles, Send,
   Smile, Check, CheckCheck, Clock, Ban, UserCheck, Shield
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSanctuaryUI } from "@/components/SanctuaryUIProvider";

export default function ChatPage() {
   const { userId } = useAuth();
   const friends = useQuery(api.friends.listFriends, { userId: userId! }) || [];
   const [activeChat, setActiveChat] = useState<{ id: any; name: string } | null>(null);
   const [searchTerm, setSearchTerm] = useState("");

   if (!userId) return null;

   const filteredFriends = friends.filter(f =>
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
   );

   return (
      <main className="h-screen bg-transparent flex flex-col overflow-hidden relative">
         <Navbar />

         <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col justify-center overflow-hidden min-h-0 mb-4">

            {/* Unified Chat Hub Container */}
            <div className="flex w-full h-full glass-strong rounded-[48px] border overflow-hidden shadow-2xl" style={{ borderColor: 'var(--border-glass-strong)' }}>

               {/* Left: Chat List Sidebar - SEALED WITHIN CONTAINER */}
               <div className="w-[340px] flex flex-col border-r h-full shrink-0" style={{ borderColor: 'var(--border-glass)', backgroundColor: 'rgba(var(--primary-rgb), 0.03)' }}>
                  <div className="p-8 pb-6 flex flex-col gap-6 shrink-0">
                     <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--primary-deep)' }}>Sanctuary Chat</h2>
                        <div className="w-10 h-10 rounded-xl glass border flex items-center justify-center opacity-40">
                           <MessageSquare className="w-5 h-5" />
                        </div>
                     </div>

                     <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20 group-focus-within:opacity-100 transition-opacity" />
                        <input
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           placeholder="Search Circle..."
                           className="w-full h-12 rounded-2xl pl-12 pr-4 text-[10px] uppercase font-black tracking-widest glass border outline-none focus:border-rose-400 transition-all shadow-inner"
                           style={{ color: 'var(--text-main)', borderColor: 'var(--border-glass)' }}
                        />
                     </div>
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-8 custom-scrollbar min-h-0">
                     {filteredFriends.length === 0 ? (
                        <div className="py-12 text-center opacity-40">
                           <p className="text-[10px] font-black uppercase tracking-widest italic">No connections found in this circle.</p>
                        </div>
                     ) : filteredFriends.map((f: any) => (
                        <motion.button
                           key={f._id}
                           onClick={() => setActiveChat({ id: f._id, name: f.email.split('@')[0] })}
                           whileHover={{ x: 4 }}
                           whileTap={{ scale: 0.98 }}
                           className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${activeChat?.id === f._id ? 'glass shadow-lg border-rose-300' : 'hover:bg-rose-50/10 border-transparent'}`}
                        >
                           <div className="relative">
                              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md border border-rose-50/50">
                                 <User className="w-6 h-6 opacity-10" />
                              </div>
                              <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm ${f.status === 'blocked_by_other' ? 'bg-rose-500' : 'bg-green-500 animate-pulse'}`} />
                           </div>
                           <div className="flex-1 text-left overflow-hidden">
                              <h4 className="font-bold truncate" style={{ color: 'var(--primary-deep)' }}>{f.email.split('@')[0]}</h4>
                              <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em] font-mono">{f.uniqueId}</p>
                           </div>
                        </motion.button>
                     ))}
                  </div>

                  <div className="p-6 border-t flex items-center gap-3 opacity-60 shrink-0" style={{ borderColor: 'var(--border-glass)' }}>
                     <Shield className="w-4 h-4 text-emerald-500" />
                     <p className="text-[8px] font-black uppercase tracking-[0.1em]">Privately Encrypted</p>
                  </div>
               </div>

               {/* Right: Active Messaging Thread - SEALED WITHIN CONTAINER */}
               <div className="flex-1 flex flex-col h-full relative overflow-hidden backdrop-blur-sm">
                  <AnimatePresence mode="wait">
                     {activeChat ? (
                        <motion.div
                           key={activeChat.id}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           className="flex-1 flex flex-col h-full overflow-hidden"
                        >
                           <div className="h-full flex flex-col">
                              <ChatThread
                                 userId={userId}
                                 friendId={activeChat.id}
                                 friendName={activeChat.name}
                              />
                           </div>
                        </motion.div>
                     ) : (
                        <motion.div
                           key="empty"
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           className="h-full flex flex-col items-center justify-center text-center px-12 gap-6"
                        >
                           <div className="w-32 h-32 rounded-[48px] glass flex items-center justify-center border animate-float" style={{ borderColor: 'var(--border-glass)' }}>
                              <Sparkles className="w-12 h-12 opacity-10 text-amber-500" />
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--primary-deep)', fontFamily: 'var(--font-serif)' }}>Pulse of the Sanctuary</h3>
                              <p className="text-sm font-medium opacity-40 italic max-w-xs leading-relaxed">
                                 Select a circle member to begin your private exchange.
                              </p>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

            </div>
         </div>
         <div className="shrink-0">
            <Footer minimal />
         </div>

         <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-glass);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--primary-soft);
        }
      `}</style>
      </main>
   );
}

function ChatThread({ userId, friendId, friendName }: any) {
   const [input, setInput] = useState("");
   const messages = useQuery(api.messages.list, { userId, friendId });
   const isTyping = useQuery(api.messages.getTyping, { userId, friendId });

   const sendMessage = useMutation(api.messages.send);
   const setTypingStatus = useMutation(api.messages.setTyping);
   const markRead = useMutation(api.messages.markRead);

   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (scrollRef.current) {
         // Tiny delay ensures Convex has fully rendered the new message nodes
         setTimeout(() => {
            scrollRef.current?.scrollTo({
               top: scrollRef.current.scrollHeight,
               behavior: 'smooth'
            });
         }, 50);
      }
      if (messages && messages.length > 0) {
         markRead({ userId, friendId });
      }
   }, [messages, userId, friendId, markRead]);

   const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      const content = input.trim();
      setInput("");
      await sendMessage({ senderId: userId, receiverId: friendId, content });
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      if (e.target.value.length > 0) {
         setTypingStatus({ userId, receiverId: friendId, isTyping: true });
      } else {
         setTypingStatus({ userId, receiverId: friendId, isTyping: false });
      }
   };

   return (
      <div className="flex-1 flex flex-col h-full min-h-0 relative">
         {/* Header pod - STATIONARY */}
         <div className="p-6 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border relative" style={{ borderColor: 'var(--border-glass-strong)' }}>
                  <User className="w-6 h-6 opacity-10" />
                  <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-green-400'}`} />
               </div>
               <div className="space-y-0.5">
                  <h4 className="text-xl font-bold tracking-tight" style={{ color: 'var(--primary-deep)', fontFamily: 'var(--font-serif)' }}>{friendName}</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-30">{isTyping ? "Transmitting..." : "Encrypted"}</p>
               </div>
            </div>
         </div>

         {/* Bubble flow - INDEPENDENT SCROLL AREA */}
         <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-4 flex flex-col custom-scrollbar relative min-h-0"
            style={{
               scrollBehavior: 'smooth',
               WebkitOverflowScrolling: 'touch',
               overscrollBehavior: 'contain'
            }}
         >
            {!messages ? (
               <div className="h-full flex items-center justify-center opacity-20"><Loader2 className="w-10 h-10 animate-spin" /></div>
            ) : messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center px-12 py-32 opacity-20 grayscale border-2 border-dashed rounded-[64px]" style={{ borderColor: 'var(--border-glass)' }}>
                  <Sparkles className="w-16 h-16 animate-pulse mb-6" />
                  <p className="text-lg font-medium italic">Begin a new thread in the sanctuary circle.</p>
               </div>
            ) : (
               messages.map((m: any) => {
                  const isMe = m.senderId === userId;
                  return (
                     <motion.div
                        key={m._id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full group`}
                     >
                        <div className={`max-w-[70%] space-y-2 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                           <div className={`px-6 py-4 rounded-[32px] text-base leading-relaxed shadow-xl border ${isMe ? 'btn-primary text-white border-white/20' : 'glass-strong bg-white/60 text-[var(--text-main)] border-white/40'}`}>
                              {m.content}
                           </div>
                           <div className={`flex items-center gap-3 px-2 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">
                                 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                 m.status === "read" ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Check className="w-4 h-4 opacity-10" />
                              )}
                           </div>
                        </div>
                     </motion.div>
                  );
               })
            )}
            {isTyping && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="px-6 py-3 rounded-full glass border opacity-40 flex gap-1 items-center">
                     <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  </div>
               </motion.div>
            )}

            {/* Visual Spacer to prevent last message being covered by the absolute footer */}
            <div className="h-32 shrink-0 w-full" />
         </div>

         {/* Composition hub - FIXED AT BOTTOM */}
         <div className="absolute bottom-0 left-0 w-full border-t glass-strong z-30 backdrop-blur-3xl" style={{ borderColor: 'var(--border-glass)' }}>
            <form onSubmit={handleSend} className="p-4 md:p-6 lg:p-8">
               <div className="flex gap-4 relative max-w-4xl mx-auto">
                  <div className="relative flex-1">
                     <input
                        autoFocus
                        value={input}
                        onChange={handleInputChange}
                        placeholder="TRANSFUSE A MESSAGE..."
                        className="w-full h-14 pl-8 pr-16 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] glass border outline-none transition-all shadow-inner focus:shadow-xl focus:border-rose-300"
                        style={{ color: 'var(--text-main)', borderColor: 'var(--border-glass-strong)' }}
                     />
                     <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity">
                        <Smile className="w-5 h-5" />
                     </button>
                  </div>
                  <button
                     type="submit"
                     disabled={!input.trim()}
                     className="btn-primary w-14 h-14 rounded-[24px] flex items-center justify-center transition-all disabled:opacity-30 shadow-lg hover:scale-105 active:scale-95 shrink-0"
                  >
                     <Send className="w-6 h-6 text-white" />
                  </button>
               </div>
            </form>
         </div>

         {/* Background decoration */}
         <div className="absolute top-0 right-0 w-96 h-96 blur-[150px] opacity-10 -z-10 bg-[var(--primary)]" />
         <div className="absolute bottom-0 left-0 w-80 h-80 blur-[130px] opacity-10 -z-10 bg-[var(--accent)]" />
      </div>
   );
}
