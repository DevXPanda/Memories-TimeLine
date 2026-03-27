"use client";
import React, { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { Heart, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userId, openLogin, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbf7]">
      <Heart className="w-10 h-10 text-rose-300 animate-heartbeat" />
    </div>
  );

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 bg-[#fffbf7]">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }} 
             className="glass-strong rounded-[48px] p-12 sm:p-20 shadow-2xl border text-center relative overflow-hidden max-w-2xl w-full"
             style={{ borderColor: "var(--border-glass-strong)" }}
           >
              <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center mx-auto mb-8 shadow-xl border" style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
                 <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                Restricted Area
              </h2>
              <p className="text-sm sm:text-base max-w-md mx-auto mb-10 opacity-70 font-medium leading-relaxed" style={{ color: "var(--text-muted)" }}>
                This sanctuary is private. Please sign in to access your sacred memories and shared story.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <button onClick={openLogin} className="btn-primary py-4 px-10 text-sm rounded-2xl shadow-xl flex items-center gap-3 w-full sm:w-auto justify-center">
                    <Heart className="w-4 h-4" />
                    Join the Sanctuary
                 </button>
                 <button onClick={() => router.push("/")} className="btn-ghost py-4 px-10 text-sm rounded-2xl border flex items-center gap-3 w-full sm:w-auto justify-center" style={{ borderColor: "var(--border-glass)" }}>
                    Go to Home
                    <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
