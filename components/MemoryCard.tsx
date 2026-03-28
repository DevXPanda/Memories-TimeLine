"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Heart, MapPin, Calendar, Sparkles, Trash2, Edit2, User, Users } from "lucide-react";
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
  userId: Id<"users">;
  location?: string;
  mood?: string;
  category?: string;
  isFavorite: boolean;
  imageUrl?: string;
  aiCaption?: string;
  creator?: { name: string; uniqueId: string };
  visibility?: string;
}

export default function MemoryCard({ memory }: { memory: Memory }) {
  const { userId } = useAuth();
  const toggleFav = useMutation(api.memories.toggleFavorite);
  const remove = useMutation(api.memories.remove);
  const [deleting, setDeleting] = useState(false);
  const [favPop, setFavPop] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const isOwn = memory.userId === userId;

  const mood = memory.mood ? MOOD_MAP[memory.mood] : null;

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !isOwn) return;
    setFavPop(true);
    setTimeout(() => setFavPop(false), 600);
    await toggleFav({ id: memory._id, userId });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !isOwn) return;
    if (!confirm("Delete this memory forever? 💔")) return;
    setDeleting(true);
    await remove({ id: memory._id, userId });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`memory-card glass-strong rounded-[44px] overflow-hidden flex flex-col h-full border shadow-lg group hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-700 ${deleting ? "opacity-40 pointer-events-none" : ""}`}
      style={{ borderColor: "var(--border-glass-strong)" }}>

      <Link href={`/memories/${memory._id}`} className="flex flex-col flex-1">
        {/* Gallery Image */}
        <div className="relative overflow-hidden shrink-0 aspect-[5/4]">
          {memory.imageUrl ? (
            <img src={memory.imageUrl} alt={memory.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--primary-blush), #fff)" }}>
              <span className="text-5xl drop-shadow-lg">✨</span>
            </div>
          )}

          {/* Subtle Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

          {/* Creator Attribution if Friend's */}
          {!isOwn && memory.creator && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-strong border border-white/20 shadow-xl backdrop-blur-xl">
              <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center shadow-sm">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                {memory.creator.name}
              </span>
            </div>
          )}

          {/* Social / Privacy Badge */}
          <div className="absolute top-4 left-4 flex gap-2">
            {memory.visibility === "friends" && (
              <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-xl border border-white/20 shadow-lg text-white bg-indigo-500/80">
                <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> Shared</span>
              </div>
            )}
            {memory.category && (
              <div className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border border-white/20 shadow-lg"
                style={{ background: "rgba(255,255,255,0.8)", color: "var(--primary)" }}>
                {memory.category}
              </div>
            )}
          </div>

          {/* Favorite button (Only for own) */}
          {isOwn && (
            <button onClick={handleFav}
              className="absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-2xl active:scale-90 transition-all border border-white/30 hover:bg-white"
              style={{ background: "rgba(255,255,255,0.4)" }}>
              <Heart className={`w-5 h-5 transition-colors ${memory.isFavorite ? "fill-current" : ""}`}
                style={{ color: memory.isFavorite ? "var(--primary)" : "#fff" }} />
              {favPop && (
                <span className="absolute text-xl animate-ping-once pointer-events-none">✨</span>
              )}
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-xl shadow-inner group-hover:rotate-6 transition-transform">
              {mood?.emoji || "✨"}
            </div>
            <h3 className="text-2xl font-bold leading-tight tracking-tight line-clamp-1 flex-1"
              style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
              {memory.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: "var(--text-muted)" }}>
              <Calendar className="w-4 h-4" />
              {formatDate(memory.date, { month: "short", day: "numeric", year: "numeric" })}
            </span>
            {memory.location && (
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 truncate max-w-[140px]" style={{ color: "var(--text-muted)" }}>
                <MapPin className="w-4 h-4" />
                {memory.location}
              </span>
            )}
          </div>

          <p className="text-sm font-medium leading-[1.8] mb-8 flex-1 line-clamp-2 opacity-60" style={{ color: "var(--text-muted)" }}>
            {memory.caption}
          </p>

          {/* Luxury AI Thought Injection */}
          {memory.aiCaption && (
            <div className="mb-8 relative py-6 text-center bg-rose-50/30 rounded-3xl border border-rose-100/50">
              <Sparkles className="absolute -top-2 -left-2 w-5 h-5 text-rose-300 opacity-50" />
              <p className="text-xs italic font-medium px-4 opacity-70"
                style={{ color: "var(--primary-deep)" }}>
                &quot;{memory.aiCaption}&quot;
              </p>
            </div>
          )}

          {/* Elegant Footer */}
          <div className="flex items-center justify-between pt-6 mt-auto border-t" style={{ borderColor: 'var(--border-glass-strong)' }}>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 group-hover:text-rose-500 transition-all">
              Details <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
            {isOwn && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/memories/${memory._id}/edit`); }}
                  className="w-10 h-10 rounded-xl hover:bg-white shadow-sm flex items-center justify-center transition-all bg-rose-50/40 text-rose-300 hover:text-rose-500">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="w-10 h-10 rounded-xl hover:bg-red-50 shadow-sm flex items-center justify-center transition-all bg-rose-50/40 text-red-300 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
