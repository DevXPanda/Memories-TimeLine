"use client";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import MemoryCard from "@/components/MemoryCard";
import UpcomingEvents from "@/components/UpcomingEvents";
import HeroSection from "@/components/HeroSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import AuthPage from "@/components/AuthPage";
import { Heart, Star, Calendar, Filter, Sparkles, Clock, X, TrendingUp, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MOODS, CATEGORIES, MOOD_MAP } from "@/lib/constants";
import { formatDate, formatDateFull } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const router = useRouter();
  const params = useSearchParams();
  const { userId, login } = useAuth();

  const category = params.get("category") || "";
  const mood     = params.get("mood") || "";
  const search   = params.get("search") || "";
  const favOnly  = params.get("favorite") === "true";

  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(9);
  }, [category, mood, search, favOnly]);


  const memories = useQuery(api.memories.list, {
    userId:       userId || undefined,
    category:     category || undefined,
    mood:         mood     || undefined,
    favoritesOnly:favOnly  || undefined,
    search:       search   || undefined,
  });
  const stats      = useQuery(api.memories.getStats, { userId: userId || undefined });

  const activeFilters = [category, mood, favOnly, search].filter(Boolean).length;

  const setParam = (key: string, val: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (val) p.set(key, val); else p.delete(key);
    router.push(`/?${p.toString()}`);
  };

  const clearAll = () => router.push("/");

  return (
    <>
      <Navbar />

      {userId ? (
        <>
          <HeroSection />
          <main className="px-4 max-w-6xl mx-auto pb-24 pt-8 sm:pt-16">
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12 animate-fade-up">
               <StatCard label="Total Memories" value={stats?.total ?? 0} icon={Heart} />
               <StatCard label="Your Favorites" value={stats?.favorites ?? 0} icon={Star} />
               <StatCard label="Moods Captured" value={stats?.moods?.length ?? 0} icon={TrendingUp} />
               <StatCard label="Joined Since" value={stats?.firstDate ? formatDate(stats.firstDate) : "---"} icon={Calendar} />
            </div>

            {/* Upcoming Events Section */}
            <UpcomingEvents />

            {/* Gallery Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pt-16 border-t" style={{ borderColor: "var(--border-glass)" }}>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                  {search ? `Searching for "${search}"` : category ? `${category} Moments` : "The Gallery"}
                </h2>
                <p className="text-sm opacity-60 font-medium" style={{ color: "var(--text-muted)" }}>
                  {memories ? `${memories.length} memories found` : "Loading your history..."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                    showFilters || activeFilters > 0 ? 'bg-white shadow-md' : 'glass'
                  }`}
                  style={{ 
                    borderColor: showFilters || activeFilters > 0 ? "var(--primary)" : "var(--border-glass)",
                    color: showFilters || activeFilters > 0 ? "var(--primary)" : "var(--text-light)"
                  }}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter {activeFilters > 0 && `(${activeFilters})`}
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-10"
                >
                  <div className="p-6 rounded-[32px] glass-strong border space-y-8" style={{ borderColor: "var(--border-glass)" }}>
                    {/* Categories */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 ml-1" style={{ color: "var(--text-main)" }}>Category</p>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(c => (
                          <button key={c} onClick={() => setParam("category", category === c ? null : c)}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                            style={{ 
                              background: category === c ? "var(--primary)" : "white",
                              color: category === c ? "white" : "var(--text-light)",
                              borderColor: category === c ? "var(--primary)" : "var(--border-glass)"
                            }}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Moods */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 ml-1" style={{ color: "var(--text-main)" }}>The Vibe</p>
                      <div className="flex flex-wrap gap-2">
                        {MOODS.map(m => (
                          <button key={m.value} onClick={() => setParam("mood", mood === m.value ? null : m.value)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                            style={{ 
                              background: mood === m.value ? "var(--primary-soft)" : "white",
                              color: mood === m.value ? "var(--primary-deep)" : "var(--text-light)",
                              borderColor: mood === m.value ? "var(--primary-soft)" : "var(--border-glass)"
                            }}>
                            <span>{m.emoji}</span> {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border-glass)" }}>
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" checked={favOnly} onChange={e => setParam("favorite", e.target.checked ? "true" : null)} className="hidden" />
                          <div className={`w-10 h-6 rounded-full relative transition-all ${favOnly ? 'bg-rose-500' : 'bg-gray-200'}`}>
                             <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${favOnly ? 'translate-x-4' : ''}`} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest opacity-60">Favorites Only ❤️</span>
                       </label>

                       <button onClick={clearAll} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline">Reset All Filters</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Memory List */}
            {memories === undefined ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-[40px] shimmer border" style={{ borderColor: "var(--border-glass)" }} />
                ))}
              </div>
            ) : memories.length > 0 ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {memories.slice(0, visibleCount).map(m => (
                    <MemoryCard key={m._id} memory={m} />
                  ))}
                </div>

                {memories.length > visibleCount && (
                  <div className="flex justify-center pb-12">
                    <button 
                      onClick={() => setVisibleCount(v => v + 9)}
                      className="group flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary-deep)" }}>
                        More stories to uncover
                      </div>
                      <div className="w-16 h-16 rounded-[28px] glass-strong border shadow-xl flex items-center justify-center transition-all group-hover:shadow-2xl group-hover:border-rose-300" 
                        style={{ borderColor: "var(--border-glass)", color: "var(--primary)" }}>
                        <ArrowRight className="w-6 h-6 rotate-90" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-32 glass-strong rounded-[40px] border" style={{ borderColor: "var(--border-glass)" }}>
                <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ color: "var(--primary)" }}>
                   <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>No memories found</h3>
                <p className="text-sm opacity-60 font-medium mb-8" style={{ color: "var(--text-muted)" }}>Try adjusting your filters or search terms.</p>
                <button onClick={clearAll} className="btn-primary py-3 px-8 text-sm">Clear Filters</button>
              </div>
            )}
            <Footer minimal />
          </main>
        </>
      ) : (
        /* Guest View - Centered Auth Portal */
        <>
          <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#fffbf9]">
            {/* Cinematic Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none" 
              style={{ background: "linear-gradient(180deg, var(--primary-blush) 0%, rgba(255,255,255,0) 100%)" }} />
            
            <div className="absolute top-1/3 right-0 w-[600px] h-[600px] blur-[180px] rounded-full opacity-10 pointer-events-none translate-x-1/2" style={{ background: "var(--primary)" }} />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] blur-[150px] rounded-full opacity-10 pointer-events-none -translate-x-1/2" style={{ background: "var(--accent)" }} />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center relative z-10">
                <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-left">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-8 glass shadow-xl border" style={{ borderColor: "var(--border-glass-strong)" }}>
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]" style={{ color: "var(--primary-deep)" }}>
                        A Private Sanctuary for Your Moments
                      </span>
                  </div>
                  <h1 className="text-6xl sm:text-8xl font-bold mb-10 hero-title leading-[1.1] tracking-tight">
                      Preserve the <br /> <span className="text-gradient">Magic of Us.</span>
                  </h1>
                  <p className="text-lg sm:text-xl opacity-80 font-medium leading-relaxed mb-10 max-w-lg" style={{ color: "var(--text-muted)" }}>
                      Join a beautiful, private space designed uniquely for your collective memories, photos, and secret whispers.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-rose-100 max-w-md">
                      <div>
                        <p className="text-3xl font-black mb-1" style={{ color: "var(--primary)" }}>100%</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Private & Secure</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black mb-1" style={{ color: "var(--primary)" }}>Shared</p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Journeys Only</p>
                      </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex justify-center">
                  <div className="w-full bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border p-4 relative" style={{ borderColor: "var(--border-glass-strong)" }}>
                      <div className="absolute -top-6 -left-6 w-12 h-12 rounded-2xl glass flex items-center justify-center shadow-xl border" style={{ borderColor: "var(--border-glass-strong)", color: "var(--primary)" }}>
                        <Lock className="w-6 h-6" />
                      </div>
                      <AuthPage onLogin={login} isModal={false} />
                  </div>
                </motion.div>
            </div>
            
            <div className="mt-32 w-full max-w-6xl">
                <FAQSection />
            </div>
          </div>
          <Footer />
        </>
      )}
    </>
  );
}

function StatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="glass-strong p-6 rounded-[32px] border group hover:shadow-xl transition-all h-full" style={{ borderColor: "var(--border-glass)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center shadow-sm" style={{ color: "var(--primary)" }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-black tracking-tight" style={{ color: "var(--primary-deep)" }}>{value}</h3>
        <p className="text-[10px] uppercase tracking-widest font-black opacity-40" style={{ color: "var(--text-muted)" }}>{label}</p>
      </div>
    </div>
  );
}
