"use client";
import React from "react";

import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import MemoryForm from "@/components/MemoryForm";
import { ArrowLeft, Sparkles, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NewMemoryPage() {
  return (
    <ProtectedRoute>

      <main className="min-h-screen px-4 py-4 max-w-6xl mx-auto pb-32">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4 flex items-center justify-between">
           <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl glass border group hover:shadow-md transition-all"
             style={{ color:"var(--primary)", borderColor: "var(--border-glass)" }}>
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
           </Link>
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass border text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
              <Heart className="w-3 h-3 fill-current" /> Creating Since {new Date().getFullYear()}
           </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center md:text-left">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 glass border text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
              <Sparkles className="w-3.5 h-3.5" /> A New Chapter Begins
           </div>
           <h1 className="text-4xl sm:text-6xl font-bold mb-4" style={{ fontFamily:"var(--font-serif)", color:"var(--primary-deep)" }}>
             Seal a Moment 📸
           </h1>
           <p className="text-sm font-medium opacity-60 max-w-lg" style={{ color: "var(--text-muted)" }}>
             Every shared smile, every secret whisper, and every milestone is a beautiful story waiting to be told forever.
           </p>
        </motion.div>

        <MemoryForm mode="create" />
      </main>
      <Footer minimal />
    </ProtectedRoute>
  );
}
