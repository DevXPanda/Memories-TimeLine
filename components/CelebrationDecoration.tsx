"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function CelebrationDecoration() {
  const { userId } = useAuth();
  const [today, setToday] = useState("");

  useEffect(() => {
    // Standardize today's date for query
    const now = new Date();
    const formatted = now.toISOString().split('T')[0];
    setToday(formatted);
  }, []);

  const celebrations = useQuery(api.events.getTodaysCelebrations, { 
    userId: userId || undefined, 
    date: today 
  });

  if (!celebrations || celebrations.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[400] overflow-hidden">
      {[...Array(25)].map((_, i) => (
        <motion.div
           key={i}
           initial={{ 
              y: '110vh', 
              x: `${Math.random() * 100}vw`,
              rotate: 0,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5
           }}
           animate={{ 
              y: '-10vh',
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              opacity: [0, 1, 1, 0],
              x: [
                `${Math.random() * 100}vw`, 
                `${Math.random() * 100}vw`, 
                `${Math.random() * 100}vw`
              ]
           }}
           transition={{ 
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 15
           }}
           className="absolute text-3xl select-none"
        >
           {["🌸", "🌺", "🌹", "🌷", "🌻", "🌼", "💐", "🎊", "🎉", "🎈", "🎂", "🍰", "🥂", "💖", "✨"][Math.floor(Math.random() * 15)]}
        </motion.div>
      ))}
      
      {/* Subtle sparkle pulse around edges */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }} 
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-b from-rose-100/10 via-transparent to-rose-100/10 pointer-events-none"
      />
    </div>
  );
}
