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

  if (memory === undefined) return null;

  if (!memory && userId) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="flex items-center justify-center p-4 py-32">
          <div className="text-center glass-strong p-16 rounded-[48px] border max-w-lg shadow-2xl" style={{ borderColor: "var(--border-glass)" }}>
            <p className="text-8xl mb-10 animate-float">💔</p>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Moment Not Found</h2>
            <Link href="/" className="btn-primary px-10 py-4 shadow-xl">Back to Sanctuary</Link>
          </div>
        </main>
      </div>
    );
  }

  const mood = memory?.mood ? MOOD_MAP[memory.mood] : null;

  const handleDelete = async () => {
    if (!userId || !memory) return;
    if (!confirm("Delete this memory forever? ❤️‍🩹")) return;
    setDeleting(true);
    await removeFn({ id: memory._id, userId });
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen px-4 py-8 max-w-6xl mx-auto pb-32">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-10 px-4 py-2 rounded-xl glass border group hover:shadow-md transition-all"
          style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to History
        </Link>

        {memory && (
          <article className="glass-strong rounded-[48px] overflow-hidden border shadow-2xl bg-white flex flex-col md:flex-row md:h-[450px]" style={{ borderColor: "var(--border-glass)" }}>
            {/* Left side: Immersive Landscape Image */}
            <div className="md:w-1/2 relative bg-black/5 h-[300px] md:h-full cursor-pointer group flex-shrink-0" onClick={() => memory.imageUrl && setShowLightbox(true)}>
              {memory.imageUrl ? (
                <>
                  <img src={memory.imageUrl} alt={memory.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-6 left-6">
                    <button onClick={(e) => { e.stopPropagation(); userId && toggleFav({ id: memory._id, userId }); }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center glass backdrop-blur-md shadow-lg border border-white/20 text-white">
                      <Heart className={`w-5 h-5 ${memory.isFavorite ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {mood && (
                        <span className="px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/10 text-white">
                          {mood.emoji} {mood.label}
                        </span>
                      )}
                      {memory.category && (
                        <span className="px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md border border-white/10 text-white">
                          {memory.category}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tighter text-white truncate" style={{ fontFamily: "var(--font-serif)" }}>
                      {memory.title}
                    </h1>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl" style={{ background: "var(--primary-blush)" }}>✨</div>
              )}
            </div>

            {/* Right side: Compact Content */}
            <div className="flex-1 p-6 sm:p-10 flex flex-col min-w-0 bg-white overflow-hidden">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30" style={{ color: "var(--text-main)" }}>
                  Capturing the Essence
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--primary)" }}>
                  {formatDateFull(memory.date)}
                </span>
              </div>

              {/* <div className="flex justify-center mb-6">
                  <div className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-[28px] glass-strong border shadow-sm w-full max-w-[240px]" style={{ borderColor: "var(--border-glass)" }}>
                     <div className="w-8 h-8 rounded-xl glass flex items-center justify-center" style={{ color: "var(--primary)" }}>
                        <Calendar className="w-4 h-4" />
                     </div>
                     <p className="text-[10px] font-bold mt-1" style={{ color: "var(--primary-deep)" }}>{formatDateFull(memory.date)}</p>
                  </div>
               </div> */}

              <div className="mb-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <p className="text-sm leading-relaxed font-medium opacity-80" style={{ color: "var(--text-main)" }}>
                  {memory.caption}
                </p>
              </div>

              {memory.aiCaption && (
                <div className="rounded-[24px] p-5 mb-4 relative overflow-hidden shadow-sm border mt-auto"
                  style={{ background: "var(--primary-blush)", borderColor: "var(--border-glass)" }}>
                  <div className="flex flex-col gap-1.5 relative z-10">
                    <div className="flex items-center gap-1.5 opacity-20">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-[7px] font-black uppercase tracking-[0.2em]">A Secret Shared</span>
                    </div>
                    <p className="text-base italic leading-snug" style={{ fontFamily: "var(--font-script)", color: "var(--primary-deep)" }}>
                      &quot;{memory.aiCaption}&quot;
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t flex items-center justify-between gap-4" style={{ borderColor: "var(--border-glass)" }}>
                <div className="flex gap-2">
                  {memory.tags?.slice(0, 2).map((t: string) => (
                    <span key={t} className="text-[7px] px-2.5 py-1 rounded-lg font-black uppercase tracking-[0.1em] glass border"
                      style={{ color: "var(--text-light)", borderColor: "var(--border-glass)" }}>
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/memories/${memory._id}/edit`} className="p-2 rounded-xl glass border hover:scale-105" title="Edit Story" style={{ borderColor: "var(--border-glass)", color: "var(--primary)" }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={handleDelete} className="p-2 rounded-xl glass border hover:scale-105 text-red-400" title="Delete Forever" style={{ borderColor: "var(--border-glass)" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}

        <RelatedMoments memory={memory} />
      </main>
      <Footer minimal />

      <AnimatePresence>
        {showLightbox && memory?.imageUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 sm:p-20" onClick={() => setShowLightbox(false)}>
            <button className="absolute top-10 right-10 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-[1010]">
              <X className="w-10 h-10" />
            </button>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", damping: 30 }} className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img src={memory.imageUrl} alt={memory.title} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
}

function RelatedMoments({ memory }: { memory: any }) {
  const { userId } = useAuth();
  const related = useQuery(api.memories.getByDate, {
    date: memory?.date || "",
    userId: userId || undefined,
    excludeId: memory?._id
  });

  if (!related || related.length === 0) return null;

  return (
    <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-12 pt-12 border-t" style={{ borderColor: "var(--border-glass)" }}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-xl glass flex items-center justify-center shadow-sm" style={{ borderColor: 'var(--border-glass)', color: "var(--primary)" }}>
          <Calendar className="w-4 h-4" />
        </div>
        <h3 className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Shared Hearts</h3>
      </div>
      <div className="overflow-x-auto pb-6 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-4 min-w-max">
          {related.map((m: any) => (
            <Link key={m._id} href={`/memories/${m._id}`} className="w-[200px] group">
              <div className="aspect-video rounded-[20px] overflow-hidden border mb-3 relative shadow-sm transition-all group-hover:shadow-lg" style={{ borderColor: "var(--border-glass)" }}>
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full glass flex items-center justify-center text-4xl">✨</div>
                )}
              </div>
              <h4 className="font-bold text-xs truncate uppercase tracking-tighter" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>{m.title}</h4>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
