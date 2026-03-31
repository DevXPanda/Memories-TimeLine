"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    names: "Ananya & Rahul",
    location: "Mumbai",
    text: "This sanctuary finally gave us a private corner on the internet. No algorithms, no unwanted eyes—just our purest memories gracefully preserved.",
  },
  {
    id: 2,
    names: "Priya & Vikram",
    location: "Bangalore",
    text: "The End-to-End encryption ensures that our secret whispers and unseen moments remain strictly ours. The aesthetic themes are an absolute delight!",
  },
  {
    id: 3,
    names: "Sneha & Arjun",
    location: "Delhi",
    text: "We wanted a space that felt intimate and secure. From sharing deep late-night thoughts to our spontaneous trip photos, this feels like our digital home.",
  },
  {
    id: 4,
    names: "Kavya & Rohan",
    location: "Pune",
    text: "It's so beautifully designed. The 'Our Memories' timeline looks breathtaking in Dark Mode, making every old photograph feel like a nostalgic masterpiece.",
  }
];

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    setIsAutoPlaying(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="w-full max-w-3xl mx-auto py-12 md:py-16 px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
          Stories Built on Trust
        </h2>
        <p className="text-xs md:text-sm opacity-60 font-medium max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          Couples across India are embracing the beauty of absolute privacy. Hear what they have to say about their sanctuary.
        </p>
      </div>

      <div className="relative glass-strong rounded-[32px] p-6 md:p-10 border shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden" style={{ borderColor: "var(--border-glass-strong)", background: "var(--bg-glass)" }}>
        
        <Quote className="absolute top-4 left-4 md:top-6 md:left-6 w-12 h-12 md:w-16 md:h-16 opacity-5 rotate-180 pointer-events-none" style={{ color: "var(--primary)" }} />

        <div className="relative min-h-[160px] md:min-h-[140px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center w-full px-4 md:px-12"
            >
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-base md:text-xl font-medium leading-relaxed mb-6 italic" style={{ color: "var(--text-main)", fontFamily: "var(--font-serif)" }}>
                &quot;{TESTIMONIALS[currentIndex].text}&quot;
              </p>
              
              <div className="flex flex-col items-center justify-center gap-1">
                <h4 className="text-sm md:text-base font-bold tracking-wide" style={{ color: "var(--primary)" }}>
                  {TESTIMONIALS[currentIndex].names}
                </h4>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-40" style={{ color: "var(--text-muted)" }}>
                  {TESTIMONIALS[currentIndex].location}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none px-2 md:px-6">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full glass border shadow-sm flex items-center justify-center pointer-events-auto hover:bg-white/50 transition-all hover:scale-110 active:scale-95"
            style={{ borderColor: "var(--border-glass)", color: "var(--primary)" }}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <button 
            onClick={handleNext}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full glass border shadow-sm flex items-center justify-center pointer-events-auto hover:bg-white/50 transition-all hover:scale-110 active:scale-95"
            style={{ borderColor: "var(--border-glass)", color: "var(--primary)" }}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setIsAutoPlaying(false); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 opacity-100' : 'w-1.5 opacity-30'}`}
              style={{ background: "var(--primary)" }}
            />
          ))}
        </div>
        
      </div>
    </section>
  );
}
