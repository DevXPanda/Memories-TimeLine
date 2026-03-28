"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageCircleHeart, Heart, X, Send, Settings2, Trash2, RefreshCw, History, Plus, Image as ImageIcon, Loader2, ChevronDown } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { CHAT_SETTINGS_KEY, CHAT_HISTORY_KEY } from "@/lib/constants";
import { useAuth } from "./AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}
interface Settings { userName: string; partnerName: string; }
interface ChatSession {
  id: string;
  title: string;
  msgs: Message[];
  updatedAt: number;
}

const QUICK = [
  "Aaj kaisa feel ho raha hai? 💭",
  "Koi shayari sunao 📝",
  "Kuch romantic bolo 🌹",
  "I miss you 🥺",
  "Aaj ka din kaisa tha? ☀️",
  "Mujhe motivate karo 💪",
];

export default function LoveChatbot() {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [settings, setSettings] = useState<Settings>({ userName: "", partnerName: "" });
  const [tempSet, setTempSet] = useState<Settings>({ userName: "", partnerName: "" });
  const [showSet, setShowSet] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const [inited, setInited] = useState(false);
  const [nudge, setNudge] = useState("");

  const generateUploadUrl = useMutation(api.memories.generateUploadUrl);
  const createMemory = useMutation(api.memories.create);

  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inRef = useRef<HTMLInputElement>(null);
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";

  const typeIn = useCallback((full: string) => {
    if (!full) { setBusy(false); return; }
    setBusy(true);
    setTyping(true);
    let i = 0;
    setMsgs(p => [...p, { id: `${Date.now()}`, role: "assistant", content: "", ts: Date.now() }]);

    const int = setInterval(() => {
      setMsgs(p => {
        const last = [...p];
        last[last.length - 1].content = full.slice(0, i + 1);
        return last;
      });
      i++;
      if (i >= full.length) {
        clearInterval(int);
        setBusy(false);
        setTyping(false);
      }
    }, 25);
  }, []);

  const startNewChat = useCallback(() => {
    const id = `${Date.now()}`;
    const newSess: ChatSession = { id, title: "New Conversation", msgs: [], updatedAt: Date.now() };
    setSessions(p => [newSess, ...p]);
    setActiveId(id);
    setMsgs([]);
    setInited(false);
    setShowHist(false);
    setShowSet(false);
  }, []);

  const loadSession = useCallback((id: string, sessionsList: ChatSession[]) => {
    const sess = sessionsList.find(s => s.id === id);
    if (sess) {
      setMsgs(sess.msgs);
      setActiveId(id);
      setInited(true);
      setShowHist(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    try {
      const s = localStorage.getItem(CHAT_SETTINGS_KEY);
      if (s) { const p = JSON.parse(s); setSettings(p); setTempSet(p); }

      const h = localStorage.getItem(CHAT_HISTORY_KEY);
      if (h) {
        const parsed: ChatSession[] = JSON.parse(h);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const latest = parsed.sort((a, b) => b.updatedAt - a.updatedAt)[0];
          setMsgs(latest.msgs);
          setActiveId(latest.id);
          setInited(true);
        }
      }
    } catch { }
  }, [userId]);

  useEffect(() => {
    if (!activeId || typing || !userId) return;
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === activeId);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], msgs, updatedAt: Date.now() };
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [msgs, typing, activeId, userId]);

  useEffect(() => {
    if (userId && open && !activeId && sessions.length === 0) {
      startNewChat();
    }
  }, [open, activeId, sessions.length, userId, startNewChat]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy, open]);

  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(() => {
      const texts = ["Heyy! What's Up ❤️", "Kuch share karna hai? ✨", "Yaha aao na... 👉"];
      setNudge(texts[Math.floor(Math.random() * texts.length)]);
    }, 5000);
    return () => clearTimeout(timer);
  }, [userId]);

  const send = async (txt?: string) => {
    const content = txt || input.trim();
    if (!content || busy) return;
    setInput("");
    const userMsg: Message = { id: `${Date.now()}`, role: "user", content, ts: Date.now() };
    setMsgs(prev => [...prev, userMsg]);
    setBusy(true);
    try {
      const response = await fetch(`${siteUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: msgs.slice(-10),
          userName: settings.userName || "jaan",
          partnerName: settings.partnerName || "partner",
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      typeIn(data.reply);
    } catch {
      setBusy(false);
      typeIn("Oh no, network nakhre kar raha hai... 🥺 Ek baar check karoge please?");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setBusy(true);
    try {
      const url = await generateUploadUrl();
      const push = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      const { storageId } = await push.json();
      const visionRes = await fetch(`${siteUrl}/api/vision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageId, userName: settings.userName || "jaan", partnerName: settings.partnerName || "partner" }),
      });
      const visionData = await visionRes.json();
      if (visionData.error) throw new Error(visionData.error);
      await createMemory({
        ...visionData,
        userId: userId!,
        imageStorageId: storageId,
        date: visionData.date || new Date().toISOString().split("T")[0],
        isFavorite: false,
        visibility: "friends",
      });
      setUploading(false);
      setBusy(false);
      typeIn(visionData.aiCaption || "Aww... maine ye moment save kar liya hai! ❤️ Kitni pyaari photo hai na?");
    } catch {
      setUploading(false);
      setBusy(false);
      typeIn("Arre yaar, upload mein kuch problem aayi 😔 Ek baar check kariye na?");
    }
  };

  const saveSettings = () => {
    setSettings(tempSet);
    localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(tempSet));
    setShowSet(false);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSess = sessions.filter(s => s.id !== id);
    setSessions(newSess);
    if (activeId === id) {
      if (newSess.length > 0) loadSession(newSess[0].id, newSess);
      else { setActiveId(null); setMsgs([]); setInited(false); }
    }
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newSess));
  };

  const fmt = (ts: number) => new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const [fabOpen, setFabOpen] = useState(false);

  const FAB_ITEMS = [
    { href: "/memories/new", label: "New Story", icon: Plus, color: "var(--primary)" },
    { href: "/timeline", label: "Timeline", icon: History, color: "var(--primary-soft)" },
    { href: "/friends", label: "Partners", icon: Settings2, color: "var(--accent)" },
    { href: "/chat", label: "Messages", icon: MessageCircleHeart, color: "var(--primary-deep)" },
  ];

  if (!userId) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Shortcut Quick Menu (Drop-up) - VERTICAL */}
        <AnimatePresence>
          {fabOpen && !open && (
            <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.8 }} 
               animate={{ opacity: 1, y: 0, scale: 1 }} 
               exit={{ opacity: 0, y: 20, scale: 0.8 }}
               className="flex flex-col items-end gap-3 mb-2"
            >
              {FAB_ITEMS.map((item, i) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className="group flex items-center gap-3 pr-1 pointer-events-auto"
                  onClick={() => setFabOpen(false)}
                >
                  <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-3 group-hover:translate-x-0"
                    style={{ borderColor: "var(--border-glass-strong)", color: "var(--primary-deep)" }}>
                    {item.label}
                  </span>
                  <div className="w-12 h-12 rounded-[20px] flex items-center justify-center shadow-2xl border border-white/20 transition-all hover:scale-110 active:scale-90"
                    style={{ background: item.color }}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Buttons (Stacked Vertically) */}
        {!open && (
         <button
           onClick={() => setFabOpen(!fabOpen)}
           className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all shadow-2xl group border border-white/20 pointer-events-auto ${fabOpen ? "rotate-45" : ""}`}
           style={{ 
             background: fabOpen ? "var(--text-main)" : "var(--primary)", 
             boxShadow: "0 10px 40px rgba(0,0,0,0.15)" 
           }}>
           <Plus className="w-6 h-6 text-white transition-transform" />
         </button>
        )}

        <div className="flex flex-row items-center justify-end gap-3 pointer-events-auto">
           {/* Nudge Bubble (Positioned to the LEFT) */}
           <AnimatePresence>
             {nudge && !open && (
               <motion.div
                 initial={{ opacity: 0, x: 20, scale: 0.9 }}
                 animate={{ opacity: 1, x: 0, scale: 1 }}
                 exit={{ opacity: 0, x: 20, scale: 0.9 }}
                 className="glass-strong backdrop-blur-md px-5 py-3 rounded-[24px] rounded-br-[4px] shadow-2xl border relative flex-shrink-0"
                 onClick={() => setOpen(true)}
                 style={{ cursor: "pointer", background: "var(--primary-blush)", borderColor: "var(--border-glass-strong)" }}>
                 <p className="text-[13px] font-bold" style={{ color: "var(--primary)" }}>{nudge}</p>
                 <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-3 h-3 border-r border-t rotate-45" style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass-strong)" }} />
               </motion.div>
             )}
           </AnimatePresence>

           <button
             onClick={() => { setOpen(!open); setFabOpen(false); }}
             className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl border border-white/20 group relative ${open ? "bg-white rotate-90" : ""}`}
             style={{
               background: open ? "var(--bg-glass-strong)" : "var(--primary)",
               boxShadow: "0 10px 40px rgba(0,0,0,0.15)"
             }}>
             {open ? (
               <X className="w-6 h-6" style={{ color: "var(--primary)" }} />
             ) : (
               <>
                 <MessageCircleHeart className="w-6 h-6 text-white" />
                 <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
               </>
             )}
           </button>
        </div>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            className="fixed bottom-24 right-6 z-[60] w-[90vw] sm:w-[400px] h-[75vh] sm:h-[600px] glass-strong rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border overflow-hidden flex flex-col"
            style={{ background: "var(--bg-glass-strong)", borderColor: "var(--border-glass-strong)" }}>

            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between" style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass)" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: "var(--bg-glass-strong)" }}>
                  <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                    {settings.partnerName || "Dil"}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-30" style={{ color: "var(--text-main)" }}>Always Loving</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowHist(!showHist)} className={`p-2.5 rounded-xl transition-all ${showHist ? "glass shadow-inner" : "hover:glass"}`} style={{ color: "var(--primary)" }}>
                  <History className="w-5 h-5" />
                </button>
                <button onClick={() => setShowSet(!showSet)} className={`p-2.5 rounded-xl transition-all ${showSet ? "glass shadow-inner" : "hover:glass"}`} style={{ color: "var(--primary)" }}>
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messenger Body */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {showSet ? (
                <div className="p-8 flex flex-col gap-6 h-full">
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Personalize Your Chat ✨</h4>
                    <p className="text-xs opacity-60 font-medium leading-relaxed" style={{ color: "var(--text-muted)" }}>This information is saved locally on your device.</p>
                  </div>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 ml-1" style={{ color: "var(--text-main)" }}>What should I call you?</label>
                      <input className="input-rose h-12 rounded-xl text-sm" placeholder="e.g. Jaan, Baby, [Name]..." value={tempSet.userName} onChange={(e) => setTempSet((s) => ({ ...s, userName: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 ml-1" style={{ color: "var(--text-main)" }}>Bot&apos;s Name</label>
                      <input className="input-rose h-12 rounded-xl text-sm" placeholder="e.g. Dil, Love, Priyam..." value={tempSet.partnerName} onChange={(e) => setTempSet((s) => ({ ...s, partnerName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-auto pt-6 border-t" style={{ borderColor: 'var(--border-glass)' }}>
                    <button onClick={() => setShowSet(false)} className="btn-ghost flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                    <button onClick={saveSettings} className="btn-primary flex-[2] justify-center h-12 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl">Save Magic</button>
                  </div>
                </div>
              ) : showHist ? (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2 px-2 text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: "var(--text-main)" }}>
                    <span>Past Conversations</span>
                    <button onClick={startNewChat} className="flex items-center gap-1.5 text-rose-500 font-black"><Plus className="w-3.5 h-3.5" /> Start New</button>
                  </div>
                  {sessions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center py-20 gap-4">
                      <MessageCircleHeart className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-[0.2em]">No stories yet</p>
                    </div>
                  ) :
                    sessions.map(s => (
                      <button key={s.id} onClick={() => loadSession(s.id, sessions)} className={`group relative text-left p-5 rounded-[24px] transition-all border ${activeId === s.id ? "bg-rose-50 border-rose-200 shadow-sm" : "hover:bg-rose-50/30 border-transparent hover:border-rose-100"}`}>
                        <p className="text-sm font-bold leading-snug pr-8 line-clamp-1" style={{ color: activeId === s.id ? "var(--primary)" : "var(--primary-deep)" }}>{s.title}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1.5" style={{ color: "var(--text-muted)" }}>{new Date(s.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        <button onClick={(e) => deleteSession(e, s.id)} className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-50 text-red-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </button>
                    ))
                  }
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-5">
                    {msgs.length === 0 && !busy && (
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-30 py-16 text-center">
                        <div className="w-20 h-20 rounded-[30px] glass flex items-center justify-center text-4xl shadow-inner">💭</div>
                        <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>Start the conversation...</p>
                      </div>
                    )}
                    {msgs.map((m) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        {m.role === "assistant" && <div className="w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center text-sm shadow-sm mt-1 border" style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass)" }}>💕</div>}
                        <div className="max-w-[85%]">
                          <div className={`px-5 py-3.5 rounded-[24px] text-sm leading-relaxed shadow-sm ${m.role === "user" ? "rounded-tr-[4px] font-medium" : "rounded-tl-[4px] border"}`}
                            style={m.role === "user" ? { background: "var(--primary)", color: "#fff" } : { background: "var(--primary-blush)", color: "var(--primary-deep)", borderColor: "var(--border-glass)" }}>
                            {m.content || <div className="flex gap-1.5 items-center h-5">{[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--primary-soft)", animationDelay: `${i * 0.15}s` }} />)}</div>}
                          </div>
                          <p className={`text-[9px] font-black uppercase tracking-widest opacity-30 mt-2 ${m.role === "user" ? "text-right" : ""}`} style={{ color: "var(--text-muted)" }}>{fmt(m.ts)}</p>
                        </div>
                      </motion.div>
                    ))}
                    {busy && !typing && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                        <div className="w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center text-sm shadow-sm mt-1 border" style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass)" }}>💕</div>
                        <div className="max-w-[85%]">
                          <div className="px-5 py-3.5 rounded-[24px] rounded-tl-[4px] border border-rose-100 bg-white" style={{ background: "var(--primary-blush)", color: "var(--primary-deep)", borderColor: "var(--border-glass)" }}>
                            <div className="flex gap-1.5 items-center h-5">
                              {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--primary-soft)", animationDelay: `${i * 0.15}s` }} />)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={endRef} />
                  </div>
                  <div className="px-6 py-5 flex flex-col gap-4 border-t" style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass)" }}>
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                      {QUICK.map((q) => <button key={q} onClick={() => send(q)} disabled={busy || typing} className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 glass border disabled:opacity-30" style={{ borderColor: "var(--border-glass)", color: "var(--primary)" }}>{q}</button>)}
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
                      <button onClick={() => fileRef.current?.click()} disabled={busy || uploading} title="Upload photo" className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all glass hover:shadow-lg disabled:opacity-30 flex-shrink-0 border" style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                      </button>
                      <input ref={inRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={uploading ? "Analyzing... 💕" : "Write your heart out... 💬"} disabled={busy || typing || uploading} className="flex-1 px-5 py-3.5 rounded-2xl text-sm outline-none transition-all placeholder:text-rose-300 font-medium border" style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass)", color: "var(--primary-deep)" }} />
                      <button onClick={() => send()} disabled={!input.trim() || busy || typing || uploading} className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-xl" style={{ background: "var(--primary)" }}><Send className="w-5 h-5 text-white" /></button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
