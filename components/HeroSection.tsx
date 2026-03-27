"use client";
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function HeroSection() {
  const { userId, openLogin } = useAuth();

  return (
    <section className="relative py-16 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-8 glass shadow-xl border" style={{ borderColor: "var(--border-glass-strong)" }}>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]" style={{ color: "var(--primary-deep)" }}>
              A Private Sanctuary for Your Moments
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl mb-8 hero-title font-bold tracking-tight">
            Capture Every Beautiful <br /> <span className="text-gradient">Chapter of Your Story</span>
          </h1>
          
          <p className="text-base sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium opacity-80" style={{ color: "var(--text-muted)" }}>
            Our Memories is your personal digital scrapbook. Designed for couples and best friends, it's a safe place to store photos, notes, and milestones that matter most.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-5">
            {userId ? (
              <>
                <Link href="/memories/new" className="btn-primary py-4 px-10 text-base shadow-2xl hover:scale-105 active:scale-95 transition-all rounded-2xl flex items-center gap-2">
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  Add a Memory
                </Link>
                <Link href="/timeline" className="btn-ghost py-4 px-10 text-base rounded-2xl border hover:glass transition-all" style={{ borderColor: "var(--border-glass)" }}>
                  Explore Timeline
                </Link>
              </>
            ) : (
              <>
                <button 
                  onClick={openLogin}
                  className="btn-primary py-4 px-10 text-base shadow-2xl hover:scale-105 active:scale-95 transition-all rounded-2xl flex items-center gap-2"
                >
                  <Heart className="w-5 h-5 flex-shrink-0" />
                  Get Started for Free
                </button>
                <button 
                  onClick={openLogin}
                  className="btn-ghost py-4 px-10 text-base rounded-2xl border hover:glass transition-all flex items-center gap-2" 
                  style={{ borderColor: "var(--border-glass)" }}
                >
                  Sign In Together
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Decorative High-End Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] blur-[150px] rounded-full opacity-10 pointer-events-none -translate-y-1/2" style={{ background: "var(--primary)" }} />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] blur-[180px] rounded-full opacity-10 pointer-events-none translate-y-1/2" style={{ background: "var(--accent)" }} />
      
      {/* Subtle floating heart icons in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
         {[...Array(3)].map((_, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 100 }}
             animate={{ opacity: [0, 0.2, 0], y: -200 }}
             transition={{ duration: 15 + i*5, repeat: Infinity, delay: i*3, ease: "linear" }}
             className="absolute text-rose-200"
             style={{ left: `${25 + i * 25}%`, bottom: '-50px' }}
           >
              <Heart className="w-12 h-12 fill-current" />
           </motion.div>
         ))}
      </div>
    </section>
  );
}
