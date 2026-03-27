"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  Heart, MapPin, Calendar, Clock, Tag, Sparkles, 
  ArrowLeft, Edit2, Trash2, Hash, X, ZoomIn 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOOD_MAP } from "@/lib/constants";
import { formatDateFull } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

export default function MemoryDetailPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const router = useRouter();
  const memory = useQuery(api.memories.getById, { 
    id: params.id as Id<"memories">, 
    userId: userId || undefined 
  });
  const toggleFav = useMutation(api.memories.toggleFavorite);
  const removeFn = useMutation(api.memories.remove);
  
  const [deleting, setDeleting] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  if (memory === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="px-4 py-8 max-w-4xl mx-auto">
          <div className="glass-strong rounded-[40px] overflow-hidden animate-pulse">
            <div className="h-[400px] shimmer" />
            <div className="p-10 space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-4 rounded-xl shimmer ${i === 0 ? "w-3/4" : i === 1 ? "w-1/2" : "w-full"}`} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!memory && userId) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="flex items-center justify-center p-4 py-32">
          <div className="text-center glass-strong p-16 rounded-[48px] border max-w-lg shadow-2xl" style={{ borderColor: "var(--border-glass)" }}>
            <p className="text-8xl mb-10 animate-float">💔</p>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Moment Not Found</h2>
            <p className="mb-10 text-sm opacity-60 font-medium leading-relaxed" style={{ color: "var(--text-muted)" }}>This beautiful moment seems to have slipped away, or perhaps it&apos;s a private secret between hearts.</p>
            <Link href="/" className="btn-primary px-10 py-4 shadow-xl">Back to Sanctuary</Link>
          </div>
        </main>
      </div>
    );
  }

  const mood = memory?.mood ? MOOD_MAP[memory.mood] : null;

  const handleDelete = async () => {
    if (!userId || !memory) return;
    if (!confirm("Delete this memory forever? ❤️‍🩹 Once gone, it remains only in your hearts.")) return;
    setDeleting(true);
    await removeFn({ id: memory._id, userId });
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen px-4 py-8 max-w-4xl mx-auto pb-32">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-10 px-4 py-2 rounded-xl glass border group hover:shadow-md transition-all"
          style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to History
        </Link>

        {memory && (
          <article className="glass-strong rounded-[48px] overflow-hidden border shadow-[0_40px_100px_rgba(0,0,0,0.1)] bg-white" style={{ borderColor: "var(--border-glass)" }}>
            {memory.imageUrl ? (
              <div className="relative w-full h-[400px] sm:h-[600px] overflow-hidden group">
                <img src={memory.imageUrl} alt={memory.title} 
                  className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                
                <div className="absolute top-8 right-8 flex gap-4">
                   <button onClick={() => setShowLightbox(true)}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center glass backdrop-blur-xl shadow-2xl border border-white/20 text-white hover:scale-110 transition-transform">
                      <ZoomIn className="w-6 h-6" />
                   </button>
                   <button onClick={() => userId && toggleFav({ id: memory._id, userId })}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center glass backdrop-blur-xl shadow-2xl border border-white/20 hover:scale-110 transition-transform"
                      style={{ color: memory.isFavorite ? "#f43f5e" : "white" }}>
                      <Heart className={`w-6 h-6 ${memory.isFavorite ? "fill-current" : ""}`} />
                   </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-10 sm:p-16 text-left">
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-start gap-6">
                    <div className="flex items-center gap-3">
                       {mood && (
                          <span className="glass backdrop-blur-xl px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl" style={{ color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                            {mood.emoji} {mood.label}
                          </span>
                       )}
                       {memory.category && (
                          <span className="glass backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl" style={{ color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                            {memory.category}
                          </span>
                       )}
                    </div>
                    <h1 className="text-4xl sm:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                      {memory.title}
                    </h1>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="p-12 sm:p-20 border-b relative overflow-hidden" style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass)" }}>
                  <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none -mr-32 -mt-32 rounded-full" style={{ background: "var(--primary)" }} />
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl sm:text-7xl font-bold mb-8 relative z-10" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                      {memory.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 relative z-10">
                       {mood && (
                          <span className="px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest glass border shadow-sm" style={{ color: "var(--primary)", borderColor: "var(--border-glass-strong)" }}>
                            {mood.emoji} {mood.label}
                          </span>
                       )}
                       {memory.category && (
                          <span className="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] glass border shadow-sm" style={{ color: "var(--text-light)", borderColor: "var(--border-glass-strong)" }}>
                            {memory.category}
                          </span>
                       )}
                    </div>
                  </motion.div>
              </div>
            )}

            <div className="p-10 sm:p-20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20">
                 <MetaInfo icon={<Calendar className="w-5 h-5" />} label="Captured On" value={formatDateFull(memory.date)} />
                 {memory.time && <MetaInfo icon={<Clock className="w-5 h-5" />} label="Moment Time" value={memory.time} />}
                 {memory.location && <MetaInfo icon={<MapPin className="w-5 h-5" />} label="LocationSpot" value={memory.location} />}
              </div>

              <div className="relative mb-20 px-4 text-left">
                <p className="text-xl sm:text-2xl leading-[1.8] font-medium relative z-10 opacity-80" style={{ color: "var(--text-main)" }}>
                  {memory.caption}
                </p>
                <div className="w-12 h-1 bg-rose-100 mt-10 rounded-full" />
              </div>

              {memory.aiCaption && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="rounded-[40px] p-10 sm:p-14 mb-20 relative overflow-hidden text-center shadow-2xl border"
                  style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass)" }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1" style={{ background: "linear-gradient(90deg, transparent, var(--primary), transparent)" }} />
                  <div className="flex flex-col items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[24px] glass flex items-center justify-center shadow-xl border" style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: "var(--primary-deep)" }}>
                      Dil&apos;s Heartfelt Note
                    </span>
                    <p className="text-3xl sm:text-4xl italic leading-relaxed"
                      style={{ fontFamily: "var(--font-script)", color: "var(--primary-deep)" }}>
                      &quot;{memory.aiCaption}&quot;
                    </p>
                  </div>
                </motion.div>
              )}

              {memory.tags && memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-20">
                  {memory.tags.map((t: string) => (
                    <span key={t} className="flex items-center gap-2 text-[10px] px-5 py-2.5 rounded-2xl font-black uppercase tracking-[0.15em] glass border hover:shadow-md transition-all group"
                      style={{ color: "var(--text-light)", borderColor: "var(--border-glass)" }}>
                      <Hash className="w-3.5 h-3.5 opacity-30 group-hover:scale-125 transition-transform" />{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-12 border-t flex-wrap gap-6" style={{ borderColor: "var(--border-glass)" }}>
                <div className="flex items-center gap-4">
                   <Link href={`/memories/${memory._id}/edit`}
                     className="btn-ghost h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border hover:glass transition-all"
                     style={{ borderColor: "var(--border-glass)" }}>
                     <Edit2 className="w-4 h-4" /> Edit Story
                   </Link>
                </div>

                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-2 h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-50 text-red-500 hover:scale-105 active:scale-95">
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Removing..." : "Delete Forever"}
                </button>
              </div>
            </div>
          </article>
        )}
      </main>
      <Footer minimal />
      <AnimatePresence>
        {showLightbox && memory?.imageUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 sm:p-20" onClick={() => setShowLightbox(false)}>
            <button className="absolute top-10 right-10 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[1010]">
              <X className="w-10 h-10" />
            </button>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 30 }} className="relative max-w-7xl w-full h-full flex items-center justify-center p-4 sm:p-10" onClick={(e) => e.stopPropagation()}>
              <img src={memory.imageUrl} alt={memory.title} className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_150px_rgba(0,0,0,0.5)] border border-white/10" />
              <div className="absolute bottom-10 left-10 text-white text-left hidden md:block">
                 <h2 className="text-3xl font-bold mb-2 tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>{memory.title}</h2>
                 <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.3em]">{formatDateFull(memory.date)}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
}

function MetaInfo({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-3 p-6 rounded-[32px] glass-strong border group hover:shadow-xl transition-all h-full" style={{ borderColor: "var(--border-glass)" }}>
       <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: "var(--text-main)" }}>
          <div className="w-8 h-8 rounded-xl glass flex items-center justify-center" style={{ color: "var(--primary)" }}>{icon}</div>
          {label}
       </div>
       <div className="text-base font-bold pl-1" style={{ color: "var(--primary-deep)" }}>{value}</div>
    </div>
  );
}
