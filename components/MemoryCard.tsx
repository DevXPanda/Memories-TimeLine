"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Heart, MapPin, Calendar, Sparkles, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MOOD_MAP, CATEGORY_COLORS } from "@/lib/constants";
import { formatDate, truncate } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { motion } from "framer-motion";

interface Memory {
  _id: Id<"memories">;
  title: string;
  caption: string;
  date: string;
  time?: string;
  location?: string;
  mood?: string;
  category?: string;
  isFavorite: boolean;
  imageUrl?: string;
  aiCaption?: string;
}

export default function MemoryCard({ memory }: { memory: Memory }) {
  const { userId } = useAuth();
  const toggleFav = useMutation(api.memories.toggleFavorite);
  const remove = useMutation(api.memories.remove);
  const [showAI, setShowAI] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favPop, setFavPop] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, val);
    p.delete("search");
    router.push(`/?${p.toString()}`);
  };

  const mood = memory.mood ? MOOD_MAP[memory.mood] : null;

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    setFavPop(true);
    setTimeout(() => setFavPop(false), 600);
    await toggleFav({ id: memory._id, userId });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    if (!confirm("Delete this memory forever? 💔")) return;
    setDeleting(true);
    await remove({ id: memory._id, userId });
  };

  return (
    <article className={`memory-card glass rounded-[32px] overflow-hidden flex flex-col h-full border border-transparent hover:border-rose-100/50 transition-all ${deleting ? "opacity-40 pointer-events-none" : ""}`}
      style={{ borderColor: "var(--border-glass)" }}>
      
      <Link href={`/memories/${memory._id}`} className="flex flex-col flex-1">
        {/* Image / placeholder */}
        <div className="relative overflow-hidden shrink-0 aspect-[4/3]">
          {memory.imageUrl ? (
            <img src={memory.imageUrl} alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-40"
              style={{ background: "var(--primary-blush)" }}>
              <span className="text-4xl">💕</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Category badge */}
          {memory.category && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-sm"
              style={{ background: "var(--bg-glass-strong)", color: "var(--primary)" }}>
              {memory.category}
            </div>
          )}

          {/* Favorite button */}
          <button onClick={handleFav}
            className="absolute top-3 right-3 w-9 h-9 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg active:scale-90 transition-all border border-white/20"
            style={{ background: "var(--bg-glass-strong)" }}>
            <Heart className={`w-4 h-4 transition-colors ${memory.isFavorite ? "fill-current" : ""}`} 
              style={{ color: memory.isFavorite ? "var(--primary)" : "var(--text-light)" }} />
            {favPop && (
              <span className="absolute text-xl animate-ping-once pointer-events-none">✨</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-lg">{mood?.emoji || "✨"}</span>
             <h3 className="text-lg sm:text-xl font-bold leading-tight line-clamp-1 flex-1"
               style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
               {memory.title}
             </h3>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: "var(--text-muted)" }}>
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(memory.date, { month: "short", day: "numeric", year: "numeric" })}
            </span>
            {memory.location && (
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-60 truncate max-w-[120px]" style={{ color: "var(--text-muted)" }}>
                <MapPin className="w-3.5 h-3.5" />
                {memory.location}
              </span>
            )}
          </div>

          {/* Caption */}
          <p className="text-sm leading-relaxed mb-6 flex-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
            {memory.caption}
          </p>

          {/* AI caption */}
          {memory.aiCaption && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 opacity-10" style={{ background: "var(--primary)" }} />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40" style={{ color: "var(--primary)" }}>Dil's Note</span>
                <div className="h-px flex-1 opacity-10" style={{ background: "var(--primary)" }} />
              </div>
              <p className="text-sm italic leading-relaxed text-center px-2"
                style={{ fontFamily: "var(--font-script)", color: "var(--primary)" }}>
                "{memory.aiCaption}"
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-5 mt-auto border-t" style={{ borderColor: "var(--border-glass)" }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-light)" }}>
              View Story →
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/memories/${memory._id}/edit`); }}
                className="p-2 rounded-xl hover:bg-white/50 transition-colors"
                style={{ color: "var(--text-light)" }}>
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="p-2 rounded-xl hover:bg-red-50 transition-colors text-red-300 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
