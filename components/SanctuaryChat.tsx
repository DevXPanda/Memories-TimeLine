"use client";
import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Check, CheckCheck, Loader2, Sparkles, User, Smile, Lock, Shield, Ban } from "lucide-react";
import { encryptMessage, decryptMessage } from "@/lib/crypto";

interface SanctuaryChatProps {
  userId: Id<"users">;
  friendId: Id<"users">;
  friendName: string;
  onClose: () => void;
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

export default function SanctuaryChat({ userId, friendId, friendName, onClose }: SanctuaryChatProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messages = useQuery(api.messages.list, { userId, friendId });
  const isTyping = useQuery(api.messages.getTyping, { userId, friendId });
  
  const sendMessage = useMutation(api.messages.send);
  const setTypingStatus = useMutation(api.messages.setTyping);
  const markRead = useMutation(api.messages.markRead);

  const currentUser = useQuery(api.auth.getUser, { userId });
  const targetUser = useQuery(api.auth.getUser, { userId: friendId });

  const scrollRef = useRef<HTMLDivElement>(null);

  const isEncryptionReady = !!(currentUser?.publicKey && targetUser?.publicKey);

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Mark as read when messages load
    if (messages && messages.length > 0) {
      markRead({ userId, friendId });
    }
  }, [messages, userId, friendId, markRead]);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-[420px] h-[600px] glass-strong rounded-[40px] shadow-2xl border flex flex-col z-[500] overflow-hidden"
      style={{ borderColor: 'var(--border-glass-strong)' }}
    >
      {/* Header Area */}
      <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-glass)' }}>
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg relative border border-rose-50/50">
                <User className="w-6 h-6 opacity-10" />
                <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-gray-200'}`} />
            </div>
            <div className="space-y-0.5">
               <h4 className="font-black text-lg tracking-tight" style={{ color: 'var(--primary-deep)' }}>{friendName}</h4>
               <div className="flex items-center gap-1 leading-none">
                  <Lock className={`w-2 h-2 ${isEncryptionReady ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30">
                    {isEncryptionReady ? "Strict E2EE Enforced" : "Securing Connection..."}
                  </p>
               </div>
            </div>
         </div>
         <button onClick={onClose} className="w-10 h-10 rounded-xl glass border flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-md group">
            <X className="w-4 h-4 opacity-40 group-hover:opacity-100" />
         </button>
      </div>

      {/* Messages Feed Loop */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
      >
        {!messages ? (
          <div className="h-full flex items-center justify-center opacity-20">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-12 gap-4">
             <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center opacity-20 border animate-float">
                <Sparkles className="w-8 h-8" />
             </div>
             <p className="text-[11px] font-medium opacity-40 leading-relaxed italic">
                Start your conversation... This sanctuary is private between you and {friendName}. ✨
             </p>
          </div>
        ) : (
          <>
            {isEncryptionReady && (
              <div className="mx-auto flex items-center justify-center gap-2 mb-4 bg-amber-50/30 px-3 py-1.5 rounded-xl border border-amber-100/30">
                <Shield className="w-2.5 h-2.5 text-amber-600" />
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-700 opacity-60">Secured with E2EE</p>
              </div>
            )}
            {messages.map((m: any) => {
              const isMe = m.senderId === userId;
              return (
                <motion.div 
                  key={m._id} 
                  initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-md border ${isMe ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white border-rose-400' : 'glass bg-white text-[var(--text-main)] border-rose-100'}`}>
                      <MessageContent content={m.content} encryptedKey={isMe ? m.senderEncryptedKey : m.encryptedKey} iv={m.iv} userId={userId} />
                    </div>
                    <div className={`flex items-center gap-2 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-30">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                       {isMe && (
                          m.status === "read" ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Check className="w-3 h-3 opacity-30" />
                       )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Composition Pod */}
      <form onSubmit={handleSend} className="p-6 border-t" style={{ borderColor: 'var(--border-glass)' }}>
         {!isEncryptionReady && (
            <p className="text-[7px] font-bold uppercase tracking-widest text-amber-600 mb-2 px-2">Verifying Security Keys...</p>
         )}
         <div className="flex gap-3 relative">
            <div className="relative flex-1">
               <input 
                 autoFocus
                 disabled={!isEncryptionReady || isSending}
                 value={input}
                 onChange={handleInputChange}
                 placeholder={isEncryptionReady ? "Compose Message..." : "Securing Connection..."}
                 className="w-full h-12 pl-6 pr-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] glass-strong border border-rose-100 outline-none focus:border-rose-300 transition-all shadow-inner"
                 style={{ color: 'var(--text-main)' }}
               />
               <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity">
                  <Smile className="w-5 h-5" />
               </button>
            </div>
            <button 
              type="submit" 
              disabled={!input.trim() || !isEncryptionReady || isSending}
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
            >
               {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
         </div>
      </form>
    </motion.div>
  );
}
