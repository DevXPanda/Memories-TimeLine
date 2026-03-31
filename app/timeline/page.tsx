"use client";
import React, { useRef, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Heart, MapPin, Sparkles, Star, Calendar,
  Plus, ScrollText, Flag, Navigation, Map as MapIcon,
  ChevronRight, Footprints, LayoutGrid, ArrowLeftRight
} from "lucide-react";
import Link from "next/link";
import { MOOD_MAP } from "@/lib/constants";
import { formatDateShort, getYearFromDate } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { motion, useScroll, useSpring } from "framer-motion";

export default function TimelinePage() {
  const { userId } = useAuth();
  const memories = useQuery(api.memories.getTimeline, { userId: userId || undefined });

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollXProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Group by year
  const allMemories = useMemo(() => memories ?? [], [memories]);
  const years = useMemo(() => {
    const set = new Set<string>();
    allMemories.forEach(m => set.add(getYearFromDate(m.date)));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [allMemories]);

  return (
    <ProtectedRoute>
      <Navbar />

      <main className="h-screen flex flex-col pt-12 sm:pt-14 bg-transparent relative overflow-hidden transition-colors duration-500">

        {/* GLOBAL WRAPPER */}
        <div className="max-w-6xl mx-auto w-full px-6 flex flex-col items-center flex-1 relative z-10">

          {/* THEME-AWARE HEADER: Using hero-title for premium feel */}
          <div className="w-full flex flex-col items-center mb-0 mt-4 sm:mt-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center relative">
              <div className="flex items-center justify-center gap-3 mb-2 opacity-40">
                <Sparkles className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-main" style={{ color: 'var(--text-main)' }}>Our Journey Saga</h1>
                <Sparkles className="w-3 h-3" style={{ color: 'var(--primary)' }} />
              </div>

              {/* Premium Gradient Headline constrained to data-theme colors */}
              <h2 className="hero-title text-4xl sm:text-6xl font-black py-2"
                style={{
                  filter: 'drop-shadow(0 10px 40px var(--shadow-primary))',
                  background: 'var(--primary-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                Whispers of Our Forever
              </h2>

              <div className="w-20 h-0.5 rounded-full mx-auto mt-4 transition-all" style={{ background: 'var(--primary)', opacity: 0.2 }} />
            </motion.div>
          </div>

          {/* HORIZONTAL SLIDER: Theme-Aware Track */}
          <div
            ref={containerRef}
            className="flex-1 w-full flex items-center overflow-x-auto overflow-y-hidden hide-scrollbar cursor-grab active:cursor-grabbing snap-x snap-mandatory gap-6 sm:gap-14 relative py-4"
          >
            {/* CENTRAL ROAD TRACK */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0 h-4 pointer-events-none w-[5000px]">
              <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="none">
                <path
                  d="M0,50 Q100,25 200,50 Q300,75 400,50 Q500,25 600,50 Q700,75 800,50 Q900,25 1000,50"
                  stroke="var(--primary)"
                  strokeWidth="0.4"
                  strokeDasharray="2 2"
                  className="opacity-20 transition-all duration-700"
                />
              </svg>
            </div>

            {allMemories.map((m, idx) => {
              const mood = m.mood ? MOOD_MAP[m.mood] : null;
              const yOffset = idx % 2 === 0 ? -25 : 25;

              return (
                <div key={m._id} className="relative flex flex-col items-center justify-center shrink-0 w-[60vw] sm:w-[240px] md:w-[280px] snap-center">
                  <Link href={`/memories/${m._id}`} className="relative group/item flex flex-col items-center w-full">

                    {/* THEME-AWARE MILESTONE CARD */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: yOffset > 0 ? 10 : -10 }}
                      className="w-full aspect-[2/3] rounded-[24px] p-1.5 glass-strong border transition-all duration-700 relative z-20 shadow-xl hover:shadow-2xl"
                      style={{
                        borderColor: 'var(--border-glass-strong)',
                        transform: `translateY(${yOffset}px)`,
                        boxShadow: `0 20px 50px var(--shadow-primary)`
                      }}
                    >
                      <div className="w-full h-full rounded-[18px] overflow-hidden border-[3px] border-white/80 transition-border duration-700 relative flex flex-col bg-white/5">
                        {/* Image Layer */}
                        <div className="flex-1 relative overflow-hidden">
                          {m.imageUrl ? (
                            <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-1000" />
                          ) : (
                            <div className="w-full h-full bg-primary-blush/20 flex items-center justify-center">
                              <Heart className="w-10 h-10 opacity-10" style={{ color: 'var(--primary)' }} />
                            </div>
                          )}
                          {/* Floating Mood */}
                          <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center text-xl group-hover/item:scale-110 transition-all duration-500">
                            {mood?.emoji ?? "❤️"}
                          </div>
                        </div>

                        {/* Theme-Aware Detail Panel */}
                        <div className="p-4 sm:p-5 glass border-t transition-all duration-500 relative z-30" style={{ borderColor: 'var(--border-glass-strong)' }}>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1" style={{ color: 'var(--text-muted)' }}>{formatDateShort(m.date)}</p>
                          <h3 className="font-bold text-sm sm:text-lg truncate leading-tight transition-colors duration-500" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>{m.title}</h3>
                          <div className="mt-2.5 flex items-center gap-2 opacity-30 text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-light)' }}>
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Milestone</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Connecting Road Line */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 w-px h-10 opacity-10 border-l border-dashed z-10 transition-all duration-700`}
                      style={{
                        borderColor: 'var(--primary)',
                        transform: `translateY(${yOffset > 0 ? -25 : 25}px)`
                      }} />

                  </Link>
                </div>
              );
            })}

            {/* Ending Saga Text: Theme-Aware */}
            {/* <div className="shrink-0 w-[40vw] flex items-center justify-center pr-20">
              <p className="font-black italic text-xl opacity-20 transition-colors duration-500" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-script)' }}>To be continued...</p>
            </div> */}
          </div>

          {/* THEME-AWARE HUD CONTROLS */}
          <div className="w-full flex flex-col items-center pb-8 pt-2">
            <div className="max-w-xl w-full flex flex-col items-center gap-4">
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden shadow-inner opacity-40">
                <motion.div
                  className="h-full"
                  style={{ scaleX, background: 'var(--primary-gradient)', transformOrigin: 'left' }}
                />
              </div>
              <div className="glass-strong rounded-full px-8 py-2.5 flex items-center gap-8 shadow-xl border transition-all duration-500" style={{ borderColor: 'var(--border-glass-strong)' }}>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 transition-colors duration-500" style={{ color: 'var(--text-main)' }}>Slide Saga</p>
                <div className="w-px h-4 bg-current opacity-10" />
                <div className="flex items-center gap-4 text-[11px] font-black tracking-[0.4em] uppercase transition-colors duration-500" style={{ color: 'var(--text-main)' }}>
                  {years[0]} — {years[years.length - 1]}
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer minimal />

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </ProtectedRoute>
  );
}
