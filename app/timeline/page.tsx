"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Heart, MapPin, Sparkles, Star, Calendar, Plus, ScrollText } from "lucide-react";
import Link from "next/link";
import { MOOD_MAP } from "@/lib/constants";
import { formatDateShort, getYearFromDate, daysSince } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";

export default function TimelinePage() {
  const { userId } = useAuth();
  const memories = useQuery(api.memories.getTimeline, { userId: userId || undefined });
  const stats    = useQuery(api.memories.getStats, { userId: userId || undefined });

  // Group by year
  const grouped: Record<string, any[]> = {};
  (memories ?? []).forEach((m: any) => {
    const y = getYearFromDate(m.date);
    if (!grouped[y]) grouped[y] = [];
    grouped[y].push(m);
  });
  const years = Object.keys(grouped).sort((a,b) => Number(b) - Number(a));

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen px-4 py-8 max-w-6xl mx-auto overflow-x-hidden pb-24">

        {/* ── Header ── */}
        <div className="text-center mb-16 sm:mb-24 px-4 pt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center mb-6 shadow-xl border" style={{ color: "var(--primary)", borderColor: "var(--border-glass-strong)" }}>
               <ScrollText className="w-8 h-8" />
            </div>
            <p className="text-xs font-black mb-3 uppercase tracking-[0.3em] font-bold" style={{ color:"var(--primary)" }}>Our Cinematic Saga</p>
            <h1 className="text-4xl sm:text-7xl font-bold mb-6" style={{ fontFamily:"var(--font-serif)", color:"var(--primary-deep)" }}>
              The Timeline
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 font-medium leading-relaxed" style={{ color:"var(--text-muted)" }}>
              {memories
                ? `A beautiful journey of ${memories.length} memories captured over ${years.length} year${years.length !== 1 ? "s" : ""} of togetherness.`
                : "Curating your story…"}
            </p>
            {stats?.firstDate && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center justify-center gap-3 px-6 py-3 rounded-full font-bold text-sm shadow-lg glass border" 
                style={{ color:"var(--primary)", borderColor: "var(--border-glass-strong)" }}>
                <Calendar className="w-4 h-4" />
                Since {new Date(stats.firstDate + "T00:00:00").toLocaleDateString("en-IN",{ month:"long", year:"numeric" })}
                <span className="opacity-20 mx-1">|</span>
                {daysSince(stats.firstDate)} Days Together 💕
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ── Loading skeleton ── */}
        {memories === undefined && (
          <div className="space-y-16 max-w-4xl mx-auto">
            {[...Array(4)].map((_,i) => (
              <div key={i} className="flex gap-8 pl-12 relative animate-pulse">
                <div className="absolute left-0 top-0 w-12 h-12 rounded-2xl shimmer" />
                <div className="glass-strong rounded-[32px] p-8 flex-1 space-y-4 shadow-xl border" style={{ borderColor: "var(--border-glass)" }}>
                  <div className="h-6 w-1/4 rounded-lg shimmer" />
                  <div className="h-4 w-full rounded shimmer" />
                  <div className="h-4 w-2/3 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {memories && memories.length === 0 && (
          <div className="text-center py-24 glass-strong rounded-[40px] border shadow-2xl max-w-2xl mx-auto" style={{ borderColor: "var(--border-glass)" }}>
            <p className="text-8xl mb-8 animate-float inline-block">📖</p>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily:"var(--font-serif)", color:"var(--primary-deep)" }}>
              Your story is just beginning
            </h2>
            <p className="text-base mb-10 opacity-60 font-medium" style={{ color:"var(--text-muted)" }}>
              Every love story is beautiful, but yours is my favorite. Add your first memory to start building your timeline.
            </p>
            <Link href="/memories/new" className="btn-primary px-10 py-4 text-base font-bold shadow-2xl">
              <Plus className="w-5 h-5 mr-2" /> Start the Journey
            </Link>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="relative pt-4 max-w-5xl mx-auto">
          {/* Vertical line */}
          {memories && memories.length > 0 && (
            <div className="absolute left-6 md:left-1/2 -ml-[2px] top-4 bottom-4 w-1 rounded-full opacity-10" 
                style={{ background: "var(--primary)" }} />
          )}

          {years.map((year) => (
            <div key={year} className="mb-20 sm:mb-32">
              {/* Year divider */}
              <div className="flex items-center gap-6 mb-16 relative z-10">
                <div className="h-px flex-1 hidden md:block opacity-20" style={{ background: "var(--primary)" }} />
                <span className="text-2xl sm:text-4xl font-bold px-10 py-3 rounded-3xl mx-0 md:mx-auto shadow-2xl glass-strong border"
                  style={{
                    fontFamily:"var(--font-serif)", color:"var(--primary-deep)",
                    borderColor:"var(--border-glass-strong)",
                  }}>
                  {year}
                </span>
                <div className="h-px flex-1 opacity-20" style={{ background: "var(--primary)" }} />
              </div>

              {/* Entries */}
              <div className="space-y-12 md:space-y-0 relative">
                {grouped[year].map((m: any, idx) => {
                  const mood = m.mood ? MOOD_MAP[m.mood] : null;
                  const isEven = idx % 2 === 0;

                  return (
                    <motion.div 
                      key={m._id}
                      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative md:pb-24 pl-16 md:pl-0"
                    >
                      <div className={`flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 ${isEven ? "" : "md:flex-row-reverse"}`}>
                        
                        {/* Card Side */}
                        <div className="w-full md:w-[45%]">
                          <Link href={`/memories/${m._id}`}
                            className="block glass-strong rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl border hover:scale-[1.02] active:scale-[0.98] group"
                            style={{ borderColor: "var(--border-glass)" }}>
                            <div className="flex flex-col sm:flex-row">
                              {/* Thumbnail */}
                              {m.imageUrl && (
                                <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 overflow-hidden relative">
                                  <img src={m.imageUrl} alt={m.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </div>
                              )}
                              <div className="p-6 sm:p-8 flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                  <span className="text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest border glass shadow-sm"
                                    style={{ color:"var(--primary)", borderColor: "var(--border-glass)" }}>
                                    {formatDateShort(m.date)}
                                  </span>
                                  {m.category && (
                                    <span className="text-[9px] px-2.5 py-1 rounded-xl font-black uppercase tracking-widest"
                                      style={{ background:"var(--primary-blush)", color:"var(--primary-deep)" }}>
                                      {m.category}
                                    </span>
                                  )}
                                  {m.isFavorite && (
                                    <Star className="w-4 h-4 text-orange-400 fill-orange-300 ml-auto" />
                                  )}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight truncate"
                                  style={{ fontFamily:"var(--font-serif)", color:"var(--primary-deep)" }}>
                                  {m.title}
                                </h3>
                                <p className="text-sm leading-relaxed line-clamp-2 mb-6 opacity-60 font-medium" style={{ color:"var(--text-muted)" }}>
                                  {m.caption}
                                </p>
                                <div className="flex items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-glass)' }}>
                                  {m.location && (
                                    <p className="flex items-center gap-1.5 text-xs font-bold truncate opacity-40 uppercase tracking-widest" style={{ color:"var(--text-muted)" }}>
                                      <MapPin className="w-3.5 h-3.5" />{m.location}
                                    </p>
                                  )}
                                  {m.aiCaption && (
                                    <Sparkles className="w-4 h-4 animate-swing" style={{ color: "var(--primary)" }} />
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>

                        {/* Dot (Centered on desktop, Left side on mobile) */}
                        <div className="absolute left-[-2.75rem] md:static md:flex items-center justify-center w-[10%] relative h-full">
                          <div className="z-10 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-4 border-white shadow-2xl shadow-rose-200 group-hover:scale-110 transition-transform"
                            style={{
                              background: m.isFavorite ? "var(--primary)" : "white",
                              borderColor: "var(--bg-card)",
                            }}>
                            {m.isFavorite
                              ? <Heart className="w-5 h-5 text-white fill-white" />
                              : <span className="text-xl sm:text-2xl">{mood?.emoji ?? "💕"}</span>
                            }
                          </div>
                        </div>

                        {/* Empty Space for Zigzag layout */}
                        <div className="hidden md:block w-[45%]" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* End of timeline */}
        {memories && memories.length > 0 && (
          <div className="text-center py-24 animate-fade-in relative z-10">
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} className="inline-flex items-center gap-6 px-10 py-5 rounded-[40px] shadow-2xl glass-strong border"
              style={{ borderColor: "var(--border-glass-strong)" }}>
              <Heart className="w-8 h-8 animate-heartbeat" style={{ color: "var(--primary)" }} />
              <span className="text-2xl sm:text-3xl italic font-bold" style={{ color:"var(--primary-deep)", fontFamily:"var(--font-script)" }}>
                And our story continues…
              </span>
              <Heart className="w-8 h-8 animate-heartbeat" style={{ color: "var(--primary)" }} />
            </motion.div>
          </div>
        )}
      </main>
      <Footer minimal />
    </ProtectedRoute>
  );
}
