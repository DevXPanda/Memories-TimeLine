"use client";
import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
   Search, MessageSquare, User, Loader2, Sparkles, Send,
   Smile, Check, CheckCheck, Ban, Shield, Lock, Info, ArrowLeft, Camera, Pencil
} from "lucide-react";
import Footer from "@/components/Footer";
import { ensureKeys, encryptMessage, decryptMessage } from "@/lib/crypto";

export default function ChatPage() {
   const { userId } = useAuth();
   const friends = useQuery(api.friends.listFriends, userId ? { userId } : "skip") || [];
   const setPublicKey = useMutation(api.auth.setPublicKey);
   const generateUploadUrl = useMutation(api.auth.generateUploadUrl);
   const updateProfileImage = useMutation(api.auth.updateProfileImage);
   const updateLastSeen = useMutation(api.auth.updateLastSeen);
   const currentUser = useQuery(api.auth.getUser, { userId: userId ?? undefined });
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [isUploading, setIsUploading] = useState(false);

   const [activeChat, setActiveChat] = useState<{ id: any; name: string } | null>(null);
   const [searchTerm, setSearchTerm] = useState("");
   const [showChatOnMobile, setShowChatOnMobile] = useState(false);
   const [isSearchOpen, setIsSearchOpen] = useState(false);

   const [isEditingChatName, setIsEditingChatName] = useState(false);
   const [tempChatName, setTempChatName] = useState("");
   const [chatNameError, setChatNameError] = useState("");
   const updateChatUserName = useMutation(api.auth.updateChatUserName);

   useEffect(() => {
      if (userId && currentUser) {
         ensureKeys(userId).then(pub => {
            if (currentUser.publicKey !== pub) {
               setPublicKey({ userId, publicKey: pub });
            }
         });
      }
   }, [userId, currentUser, setPublicKey]);

   // Heartbeat for last seen
   useEffect(() => {
      if (!userId) return;
      updateLastSeen({ userId }); // Initial ping
      const interval = setInterval(() => {
         updateLastSeen({ userId });
      }, 60000); // 1 minute
      return () => clearInterval(interval);
   }, [userId, updateLastSeen]);

   if (!userId) return null;

   const filteredFriends = friends.filter((f: any) =>
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.chatUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (f.username?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (f.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
   );

   const selectChat = (friend: { id: any; name: string }) => {
      setActiveChat(friend);
      setShowChatOnMobile(true);
   };

   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !userId) return;

      setIsUploading(true);
      try {
         const postUrl = await generateUploadUrl();
         const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
         });
         const { storageId } = await result.json();
         await updateProfileImage({ userId, storageId });
      } catch (err) {
         console.error("Upload failed", err);
         alert("Failed to upload profile image. 🥺");
      } finally {
         setIsUploading(false);
         if (fileInputRef.current) fileInputRef.current.value = "";
      }
   };

   return (
      <main className="h-[calc(100dvh-64px)] bg-transparent flex flex-col overflow-hidden relative">
         <div className="flex-1 w-full max-w-6xl mx-auto px-0 md:px-6 md:py-6 flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 flex w-full md:glass-strong border-0 md:border md:rounded-[48px] overflow-hidden md:shadow-2xl" style={{ borderColor: 'var(--border-glass-strong)', background: 'var(--bg-cream)' }}>

               {/* Sidebar */}
               <div className={`${showChatOnMobile ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] flex flex-col border-r h-full shrink-0`} style={{ borderColor: 'var(--border-glass)', backgroundColor: 'rgba(var(--primary-rgb), 0.03)' }}>

                  {/* My Profile Section - Aligned with Chat Thread Header */}
                  <div className="relative border-b shrink-0 overflow-hidden" style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass)', height: '100px' }}>
                     <AnimatePresence mode="wait">
                        {!isSearchOpen ? (
                           <motion.div
                              key="profile"
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -20, opacity: 0 }}
                              className="absolute inset-0 p-4 md:p-6 flex items-center justify-between"
                           >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                 <div className="relative group/avatar shrink-0">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border shadow-md flex items-center justify-center overflow-hidden transition-transform group-hover/avatar:scale-105" style={{ borderColor: 'var(--border-glass-strong)', background: 'var(--bg-glass-strong)' }}>
                                       {currentUser?.profileImage ? (
                                          <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                       ) : (
                                          <User className="w-6 h-6 opacity-20" />
                                       )}
                                       {isUploading && (
                                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                             <Loader2 className="w-4 h-4 animate-spin text-white" />
                                          </div>
                                       )}
                                       <button
                                          onClick={() => fileInputRef.current?.click()}
                                          className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity"
                                       >
                                          <Camera className="w-4 h-4 text-white" />
                                       </button>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">My Identity</p>
                                    {isEditingChatName ? (
                                       <div className="space-y-1">
                                          <input
                                             autoFocus
                                             value={tempChatName}
                                             onChange={(e) => { setTempChatName(e.target.value); setChatNameError(""); }}
                                             onBlur={() => {
                                                if (tempChatName.trim() === (currentUser?.chatUsername || currentUser?.email.split('@')[0])) {
                                                   setIsEditingChatName(false);
                                                }
                                             }}
                                             onKeyDown={async (e) => {
                                                if (e.key === 'Enter') {
                                                   try {
                                                      await updateChatUserName({ userId, chatUsername: tempChatName });
                                                      setIsEditingChatName(false);
                                                   } catch (err: any) {
                                                      const msg = err.message || "";
                                                      if (msg.includes("this user name exist")) {
                                                         setChatNameError("this user name exist");
                                                      } else {
                                                         // Extract clean message from Convex technical error
                                                         const cleanMatch = msg.match(/Uncaught Error: (.*?)(?:\nat|$)/);
                                                         setChatNameError(cleanMatch ? cleanMatch[1].trim() : msg);
                                                      }
                                                   }
                                                } else if (e.key === 'Escape') {
                                                   setIsEditingChatName(false);
                                                }
                                             }}
                                             className="w-full border rounded px-2 py-0.5 font-bold text-sm outline-none"
                                             style={{ color: 'var(--primary-deep)', background: 'var(--bg-glass-strong)', borderColor: 'var(--border-glass-strong)' }}
                                          />
                                          {chatNameError && <p className="text-[8px] font-bold uppercase tracking-tight" style={{ color: 'var(--primary)' }}>{chatNameError}</p>}
                                       </div>
                                    ) : (
                                       <div className="flex items-center gap-1.5 group/name cursor-pointer rounded transition-colors hover:opacity-70" onClick={() => { setTempChatName(currentUser?.chatUsername || currentUser?.email.split('@')[0] || ""); setIsEditingChatName(true); }}>
                                          <h4 className="font-bold text-sm truncate" style={{ color: 'var(--primary-deep)' }}>
                                             {currentUser?.chatUsername || currentUser?.email.split('@')[0]}
                                          </h4>
                                          <Pencil className="w-2.5 h-2.5 opacity-20 group-hover/name:opacity-60 transition-opacity" />
                                       </div>
                                    )}
                                    <p className="text-[9px] font-medium opacity-30 truncate uppercase tracking-widest leading-none">{currentUser?.uniqueId}</p>
                                 </div>
                              </div>
                              <button
                                 onClick={() => setIsSearchOpen(true)}
                                 className="w-10 h-10 rounded-full hover:bg-rose-50/50 flex items-center justify-center transition-colors shrink-0"
                              >
                                 <Search className="w-5 h-5 opacity-40" />
                              </button>
                           </motion.div>
                        ) : (
                           <motion.div
                              key="search"
                              initial={{ x: -340, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -20, opacity: 0 }}
                              className="absolute inset-0 p-4 md:p-6 z-50 flex items-center gap-3 backdrop-blur-3xl"
                              style={{ background: 'var(--bg-glass)' }}
                           >
                              <div className="relative flex-1">
                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                                 <input
                                    autoFocus
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search Circle..."
                                    className="w-full h-12 rounded-full pl-12 pr-4 text-[10px] uppercase font-black tracking-widest glass border outline-none transition-all focus:shadow-md"
                                    style={{ color: 'var(--text-main)', borderColor: 'var(--border-glass-strong)', background: 'var(--bg-glass-strong)' }}
                                 />
                              </div>
                              <button
                                 onClick={() => { setIsSearchOpen(false); setSearchTerm(""); }}
                                 className="w-10 h-10 rounded-full hover:bg-rose-50 flex items-center justify-center transition-colors text-[10px] font-bold uppercase tracking-tighter opacity-60"
                              >
                                 Close
                              </button>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="p-6 md:p-8 pb-4 flex flex-col gap-4 md:gap-6 shrink-0">
                     <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: 'var(--primary-deep)' }}>Circle of Sanctuary</h2>
                        <div className="w-10 h-10 rounded-full glass border flex items-center justify-center opacity-20">
                           <MessageSquare className="w-5 h-5" />
                        </div>
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
                           onClick={() => selectChat({ id: f._id, name: f.chatUsername || f.username || f.email.split('@')[0] })}
                           whileHover={{ x: 4 }}
                           whileTap={{ scale: 0.98 }}
                           className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300 ${activeChat?.id === f._id ? 'glass shadow-lg' : 'border-transparent hover:glass'}`}
                           style={{ borderColor: activeChat?.id === f._id ? 'var(--primary-soft)' : undefined }}
                        >
                           <div className="relative">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md border overflow-hidden" style={{ borderColor: 'var(--border-glass-strong)', background: 'var(--bg-glass-strong)' }}>
                                 {f.profileImage ? (
                                    <img src={f.profileImage} alt={f.email} className="w-full h-full object-cover" />
                                 ) : (
                                    <User className="w-6 h-6 opacity-10" />
                                 )}
                              </div>
                              <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] shadow-sm ${f.status === 'blocked_by_other' ? 'bg-rose-500' : 'animate-pulse'}`} style={{ borderColor: 'var(--bg-glass)', background: f.status !== 'blocked_by_other' ? 'var(--primary)' : undefined }} />
                           </div>
                           <div className="flex-1 text-left overflow-hidden">
                              <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--primary-deep)' }}>
                                 {f.chatUsername || f.username || f.email.split('@')[0]}
                              </h4>
                              <p className="text-[7px] font-black opacity-30 uppercase tracking-[0.2em] font-mono truncate">{f.uniqueId}</p>
                           </div>
                        </motion.button>
                     ))}
                  </div>

                  <div className="p-6 border-t hidden md:flex items-center gap-3 opacity-60 shrink-0" style={{ borderColor: 'var(--border-glass)' }}>
                     <Shield className="w-4 h-4 text-emerald-500" />
                     <p className="text-[8px] font-black uppercase tracking-[0.1em]">Strictly E2EE Enforced</p>
                  </div>
               </div>

               {/* Chat Thread Area */}
               <div className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col h-full relative overflow-hidden backdrop-blur-sm`} style={{ background: 'var(--bg-glass)' }}>
                  <AnimatePresence mode="wait">
                     {activeChat ? (
                        <ChatThread
                           key={activeChat.id}
                           userId={userId}
                           friendId={activeChat.id}
                           friendName={activeChat.name}
                           onBack={() => setShowChatOnMobile(false)}
                        />
                     ) : (
                        <motion.div
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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
         <div className={showChatOnMobile ? "hidden md:block shrink-0" : "shrink-0"}>
            <Footer minimal />
         </div>
         <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-glass); border-radius: 10px; }
         `}</style>
      </main>
   );
}

function MessageContent({ content, encryptedKey, iv, userId }: any) {
   const [decrypted, setDecrypted] = useState<string | null>(null);
   const [error, setError] = useState(false);

   useEffect(() => {
      if (!encryptedKey || !iv) {
         setDecrypted("Plaintext message not supported.");
         setError(true);
         return;
      }

      decryptMessage(content, encryptedKey, iv, userId)
         .then(setDecrypted)
         .catch((err) => {
            console.error("Decryption error:", err);
            setError(true);
         });
   }, [content, encryptedKey, iv, userId]);

   if (error) return <span className="opacity-40 italic flex items-center gap-2 text-rose-500"><Ban className="w-3 h-3" /> Secure decryption failed</span>;
   if (decrypted === null) return <div className="w-16 h-4 bg-gray-200/50 animate-pulse rounded" />;
   return <>{decrypted}</>;
}

function ChatThread({ userId, friendId, friendName, onBack }: any) {
   const [input, setInput] = useState("");
   const [isSending, setIsSending] = useState(false);
   const messages = useQuery(api.messages.list, (userId && friendId) ? { userId, friendId } : "skip");
   const isTyping = useQuery(api.messages.getTyping, (userId && friendId) ? { userId, friendId } : "skip");

   const sendMessage = useMutation(api.messages.send);
   const setTypingStatus = useMutation(api.messages.setTyping);
   const markRead = useMutation(api.messages.markRead);

   const targetUser = useQuery(api.auth.getUser, { userId: friendId ?? undefined });
   const currentUser = useQuery(api.auth.getUser, { userId: userId ?? undefined });

   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
      if (messages && messages.length > 0) {
         markRead({ userId, friendId });
      }
   }, [messages, userId, friendId, markRead]);

   const isEncryptionReady = !!(currentUser?.publicKey && targetUser?.publicKey);

   const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || !userId || !friendId || !currentUser || !targetUser || !isEncryptionReady || isSending) return;

      const content = input.trim();
      setInput("");
      setIsSending(true);

      try {
         const { ciphertext, encryptedKey, senderEncryptedKey, iv } = await encryptMessage(content, targetUser.publicKey!, currentUser.publicKey!);
         await sendMessage({ senderId: userId, receiverId: friendId, content: ciphertext, encryptedKey, senderEncryptedKey, iv });
      } catch (err: any) {
         console.error("Critical: Encryption failed.", err);
         alert(`${err.message || "Message could not be sent securely."} 🔒`);
      } finally {
         setIsSending(false);
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      setTypingStatus({ userId, receiverId: friendId, isTyping: e.target.value.length > 0 });
   };

   // Active status logic
   let statusText = "offline";
   let isOnline = false;
   if (isTyping) {
      statusText = "typing...";
      isOnline = true;
   } else if (targetUser?.lastSeen) {
      const diffMs = Date.now() - targetUser.lastSeen;
      if (diffMs < 180000) { // 3 minutes
         statusText = "online";
         isOnline = true;
      } else {
         const d = new Date(targetUser.lastSeen);
         const isToday = new Date().toDateString() === d.toDateString();
         const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
         statusText = `last seen ${isToday ? 'today' : d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
      }
   }

   return (
      <div className="flex-1 flex flex-col h-full min-h-0 relative">
         <div className="p-4 md:p-6 border-b flex items-center gap-2 md:gap-4 shrink-0 z-40" style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-strong)', height: '100px' }}>
            <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/5">
               <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 md:gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md border relative overflow-hidden" style={{ borderColor: 'var(--border-glass-strong)', background: 'var(--bg-glass-strong)' }}>
                  {targetUser?.profileImage ? (
                     <img src={targetUser.profileImage} alt={friendName} className="w-full h-full object-cover" />
                  ) : (
                     <User className="w-5 h-5 md:w-6 md:h-6 opacity-10" />
                  )}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-[3px] shadow-sm z-10 ${isTyping ? 'animate-pulse' : ''}`} style={{ borderColor: 'var(--bg-glass)', background: 'var(--primary)' }} />
               </div>
               <div className="space-y-0.5">
                  <h4 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: 'var(--primary-deep)', fontFamily: 'var(--font-serif)' }}>
                     {targetUser?.chatUsername || targetUser?.username || friendName}
                  </h4>
                  <div className="flex items-center leading-none mt-1">
                     <p className={`text-[11px] md:text-xs font-medium tracking-wide lowercase transition-all ${isOnline ? 'text-emerald-500 font-bold' : 'opacity-60'}`}>
                        {statusText}
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 flex flex-col custom-scrollbar relative min-h-0">
            {isEncryptionReady && (
               <div className="mx-auto flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-xl border glass shadow-sm" style={{ borderColor: 'var(--border-glass-strong)', background: 'var(--bg-glass-strong)' }}>
                  <Shield className="w-3 h-3 opacity-60" style={{ color: 'var(--primary)' }} />
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--primary)' }}>Messages secured with Sanctuary E2EE</p>
               </div>
            )}
            {messages?.map((m: any) => {
               const isMe = m.senderId === userId;
               return (
                  <motion.div key={m._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                     <div className={`max-w-[85%] md:max-w-[70%] space-y-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                           className={`px-4 py-2.5 md:px-6 md:py-4 rounded-[18px] text-sm md:text-base leading-relaxed shadow-sm border ${isMe ? 'text-white rounded-tr-none' : 'glass-strong text-[var(--text-main)] rounded-tl-none'}`}
                           style={{
                              background: isMe ? 'var(--primary-gradient)' : 'var(--bg-glass-strong)',
                              borderColor: isMe ? 'var(--primary)' : 'var(--border-glass-strong)'
                           }}
                        >
                           <MessageContent content={m.content} encryptedKey={isMe ? m.senderEncryptedKey : m.encryptedKey} iv={m.iv} userId={userId} />
                        </div>
                        <div className={`flex items-center gap-2 px-1 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                           <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] opacity-30">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           {isMe && (m.status === "read" ? <CheckCheck className="w-4 h-4" style={{ color: 'var(--primary)' }} /> : <Check className="w-4 h-4 opacity-10" />)}
                        </div>
                     </div>
                  </motion.div>
               );
            })}
            {isTyping && (
               <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-full glass border opacity-40 flex gap-1 items-center">
                     <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                  </div>
               </div>
            )}
            <div className="h-4 md:h-8 shrink-0 w-full" />
         </div>

         <div className="shrink-0 p-3 md:p-6 lg:p-8 backdrop-blur-3xl border-t z-40" style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-strong)' }}>
            {!isEncryptionReady && (
               <div className="max-w-4xl mx-auto mb-4 p-3 rounded-2xl border flex items-center gap-3 glass" style={{ borderColor: 'var(--border-glass-strong)', color: 'var(--text-main)' }}>
                  <Info className="w-5 h-5 flex-shrink-0 opacity-60" />
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Establishing secure connection. Messaging will be enabled once E2EE keys are verified. 🔒</p>
               </div>
            )}
            <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2 md:gap-4 relative items-center">
               <button type="button" className="hidden md:flex p-2 opacity-30 hover:opacity-100 transition-opacity"><Smile className="w-6 h-6" /></button>
               <div className="relative flex-1">
                  <input
                     autoFocus disabled={!isEncryptionReady || isSending} value={input} onChange={handleInputChange}
                     placeholder={isEncryptionReady ? "Type a secure message..." : "Establishing secure link... You can still type."}
                     className="w-full h-11 md:h-14 pl-6 pr-12 rounded-full md:rounded-[24px] text-xs md:text-[10px] font-bold md:font-black md:uppercase tracking-[0.1em] md:tracking-[0.2em] glass border outline-none transition-all shadow-sm focus:shadow-md"
                     style={{ color: 'var(--text-main)', borderColor: 'var(--border-glass-strong)', background: 'var(--bg-glass-strong)' }}
                  />
                  <button type="button" className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 opacity-30"><Smile className="w-5 h-5" /></button>
               </div>
               <button type="submit" disabled={!input.trim() || !isEncryptionReady || isSending} className="btn-primary w-11 h-11 md:w-14 md:h-14 rounded-full md:rounded-[24px] flex items-center justify-center transition-all disabled:opacity-30 shadow-lg hover:scale-105 active:scale-95 shrink-0">
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6 text-white" />}
               </button>
            </form>
         </div>

         <div className="absolute top-0 right-0 w-96 h-96 blur-[150px] opacity-10 -z-10 bg-[var(--primary)] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-80 h-80 blur-[130px] opacity-10 -z-10 bg-[var(--accent)] pointer-events-none" />
      </div>
   );
}
