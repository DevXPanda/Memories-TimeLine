"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MemoryForm from "@/components/MemoryForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { ArrowLeft, Edit3, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";

export default function EditPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const id = params.id as Id<"memories">;
  const memory = useQuery(api.memories.getById, { id, userId: userId || undefined });

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen px-4 py-4 max-w-6xl mx-auto pb-32">
        {/* <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
          <Link href={`/memories/${id}`}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl glass border group hover:shadow-md transition-all"
            style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to History
          </Link>
        </motion.div> */}

        {memory === undefined ? (
          <div className="glass-strong rounded-[40px] p-10 sm:p-20 space-y-8 animate-pulse border" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="h-12 w-1/3 rounded-2xl shimmer" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl shimmer w-full" />
            ))}
          </div>
        ) : !memory ? (
          <div className="text-center py-32 glass-strong rounded-[48px] border" style={{ borderColor: "var(--border-glass)" }}>
            <p className="text-8xl mb-8 animate-float">💔</p>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Story Missing</h2>
            <p className="text-sm opacity-60 font-medium mb-12" style={{ color: "var(--text-muted)" }}>This specific moment couldn&apos;t be found in your sanctuary.</p>
            <Link href="/" className="btn-primary px-10 py-4 shadow-xl">Back to Gallery</Link>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center md:text-left">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 glass border text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
                  <Edit3 className="w-3.5 h-3.5" /> Refining Your Story
               </div> */}
              <h1 className="text-4xl sm:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                {memory.title}
              </h1>
              <p className="text-sm font-medium opacity-60 max-w-lg" style={{ color: "var(--text-muted)" }}>
                Every detail matters. Polish this beautiful chapter to preserve the magic exactly as it felt.
              </p>
            </motion.div>

            <MemoryForm mode="edit" initialData={{
              _id: memory._id, title: memory.title, caption: memory.caption,
              date: memory.date, time: memory.time, location: memory.location,
              mood: memory.mood, category: memory.category, isFavorite: memory.isFavorite,
              imageUrl: memory.imageUrl, aiCaption: memory.aiCaption,
              tags: (memory as any).tags ?? [],
            }} />
          </>
        )}
      </main>
      <Footer minimal />
    </ProtectedRoute>
  );
}
