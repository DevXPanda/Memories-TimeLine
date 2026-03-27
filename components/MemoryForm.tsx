"use client";
import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Sparkles, X, MapPin, Calendar, Clock,
  Tag, Heart, Loader2, Image as ImageIcon, Hash, ChevronRight, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { MOODS, CATEGORIES } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

interface InitialData {
  _id: Id<"memories">;
  title: string; caption: string; date: string;
  time?: string; location?: string; mood?: string;
  category?: string; isFavorite: boolean;
  imageUrl?: string; aiCaption?: string;
  tags?: string[];
}

interface Props { initialData?: InitialData; mode?: "create" | "edit"; }

export default function MemoryForm({ initialData, mode = "create" }: Props) {
  const router = useRouter();
  const { userId } = useAuth();
  const createFn  = useMutation(api.memories.create);
  const updateFn  = useMutation(api.memories.update);
  const uploadUrl = useMutation(api.memories.generateUploadUrl);
  const fileRef   = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title:      initialData?.title      || "",
    caption:    initialData?.caption    || "",
    date:       initialData?.date       || new Date().toISOString().split("T")[0],
    time:       initialData?.time       || "",
    location:   initialData?.location   || "",
    mood:       initialData?.mood       || "",
    category:   initialData?.category   || "",
    isFavorite: initialData?.isFavorite || false,
  });
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags]         = useState<string[]>(initialData?.tags || []);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || "");
  const [aiCaption, setAiCaption]   = useState(initialData?.aiCaption || "");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10 MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.caption.trim() || !form.date) {
      setError("Title, caption and date are required."); return;
    }
    setSaving(true); setError("");
    try {
      let imageStorageId: Id<"_storage"> | undefined;
      if (imageFile) {
        const url  = await uploadUrl();
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });
        if (!resp.ok) throw new Error("Image upload failed");
        const { storageId } = await resp.json();
        imageStorageId = storageId;
      }

      const payload = {
        ...form,
        tags: tags.length ? tags : undefined,
        aiCaption: aiCaption || undefined,
        imageStorageId,
        mood:     form.mood     || undefined,
        category: form.category || undefined,
        time:     form.time     || undefined,
        location: form.location || undefined,
      };

      if (mode === "edit" && initialData) {
        await updateFn({ id: initialData._id, userId: userId!, ...payload });
      } else {
        await createFn({ userId: userId!, ...payload });
      }
      router.push("/");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-strong rounded-[40px] p-6 sm:p-12 border shadow-2xl overflow-hidden relative" style={{ borderColor: "var(--border-glass)" }}>
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none -mr-32 -mt-32 rounded-full" style={{ background: "var(--primary)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5 pointer-events-none -ml-32 -mb-32 rounded-full" style={{ background: "var(--primary)" }} />

      {/* Hero Header */}
      <div className="mb-10 text-center">
         <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
           {mode === "create" ? "Capture a Heartfelt Moment" : "Refine Your Story"}
         </h2>
         <p className="text-sm font-medium opacity-60" style={{ color: "var(--text-muted)" }}>Every memory deserves to be preserved with love.</p>
      </div>

      <div className="space-y-10 relative z-10">
        {/* ── Image upload ── */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40" style={{ color: "var(--text-main)" }}>The Visual</label>
          <div className="relative">
            {imagePreview ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[32px] overflow-hidden h-[300px] border shadow-xl group" 
                style={{ borderColor: "var(--border-glass-strong)" }}>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => { setImageFile(null); setImagePreview(""); }}
                     className="w-12 h-12 rounded-full bg-white text-red-500 shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
                     <Trash2Icon className="w-5 h-5" />
                   </button>
                </div>
              </motion.div>
            ) : (
              <button 
                onClick={() => fileRef.current?.click()}
                className="w-full h-[200px] rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all duration-300 border-2 border-dashed group hover:shadow-lg"
                style={{ borderColor: "var(--border-glass-strong)", background: "var(--primary-blush)" }}>
                <div className="w-14 h-14 rounded-full glass flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform" style={{ color: "var(--primary)" }}>
                   <ImageIcon className="w-7 h-7" />
                </div>
                <div className="text-center">
                   <p className="text-sm font-bold" style={{ color: "var(--primary-deep)" }}>Add a Photo</p>
                   <p className="text-xs opacity-40 font-bold uppercase tracking-widest mt-1">High quality moments (max 10MB)</p>
                </div>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </div>
        </div>

        {/* ── Core Details ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>Story Title *</label>
                <input className="input-rose text-lg h-14 rounded-2xl" placeholder="e.g. Our First Date 🌹" value={form.title}
                  onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>Date Captured *</label>
                  <input type="date" className="input-rose h-14 rounded-2xl" value={form.date}
                    onChange={(e) => set("date", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>Time (Optional)</label>
                  <input type="time" className="input-rose h-14 rounded-2xl" value={form.time}
                    onChange={(e) => set("time", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>Location Spotlight</label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                   <input className="input-rose h-14 pl-11 rounded-2xl" placeholder="Where did it happen?" value={form.location}
                     onChange={(e) => set("location", e.target.value)} />
                </div>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>The Vibe (Mood)</label>
                 <div className="flex flex-wrap gap-2.5">
                   {MOODS.map((m) => (
                     <button key={m.value}
                       onClick={() => set("mood", form.mood === m.value ? "" : m.value)}
                       className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-sm"
                       style={{
                         background: form.mood === m.value ? "var(--primary)" : "white",
                         color: form.mood === m.value ? "white" : "var(--primary-deep)",
                         borderColor: form.mood === m.value ? "var(--primary)" : "var(--border-glass)",
                       }}>
                       <span className="text-sm">{m.emoji}</span> {m.label}
                     </button>
                   ))}
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>Memory Type</label>
                 <div className="flex flex-wrap gap-2.5">
                   {CATEGORIES.map((cat) => (
                     <button key={cat}
                       onClick={() => set("category", form.category === cat ? "" : cat)}
                       className="px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm"
                       style={{
                         background: form.category === cat ? "var(--primary-soft)" : "white",
                         color: form.category === cat ? "white" : "var(--text-light)",
                         borderColor: form.category === cat ? "var(--primary-soft)" : "var(--border-glass)",
                       }}>
                       {cat}
                     </button>
                   ))}
                 </div>
              </div>
           </div>
        </div>

        {/* ── Storytelling ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
             <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>Story Details *</label>
             <textarea className="input-rose min-h-[180px] rounded-[24px] p-5 border-2" placeholder="Start writing the story behind this moment..." 
               value={form.caption} onChange={(e) => set("caption", e.target.value)} />
           </div>
           <div>
             <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>Dil's Personal Note</label>
             <div className="relative">
                <Sparkles className="absolute top-4 right-4 w-5 h-5 text-rose-300 pointer-events-none" />
                <textarea className="input-rose min-h-[180px] rounded-[24px] p-5 italic border-2"
                  placeholder="A romantic or heartfelt addition to this memory..."
                  value={aiCaption} onChange={(e) => setAiCaption(e.target.value)}
                  style={{ fontFamily: "var(--font-script)", fontSize: "1.2rem", lineHeight: "1.6", color: "var(--primary-deep)" }} />
             </div>
           </div>
        </div>

        {/* ── Tags & Social ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
           <div>
             <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 opacity-40" style={{ color: "var(--text-main)" }}>Tags & Keywords</label>
             <div className="flex gap-2">
                <div className="relative flex-1">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                   <input className="input-rose h-12 pl-11 rounded-xl text-sm" placeholder="nature, movie, first..." value={tagInput}
                     onChange={(e) => setTagInput(e.target.value)} 
                     onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }} />
                </div>
                <button onClick={addTag} className="btn-ghost px-5 rounded-xl text-xs font-bold uppercase tracking-widest">Add</button>
             </div>
             {tags.length > 0 && (
               <div className="flex flex-wrap gap-2 mt-4">
                 {tags.map((t) => (
                   <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold glass-strong border"
                     style={{ color: "var(--primary)", borderColor: "var(--border-glass)" }}>
                     #{t}
                     <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="opacity-50 hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                     </button>
                   </span>
                 ))}
               </div>
             )}
           </div>

           <div className="pt-7">
             <button onClick={() => set("isFavorite", !form.isFavorite)}
               className="flex items-center justify-between w-full px-6 py-4 rounded-[24px] transition-all shadow-sm border"
               style={{ 
                 background: form.isFavorite ? "var(--primary-blush)" : "white",
                 borderColor: form.isFavorite ? "var(--primary)" : "var(--border-glass)"
               }}>
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${form.isFavorite ? 'bg-white shadow-md' : 'glass'}`}>
                    <Heart className={`w-5 h-5 transition-all ${form.isFavorite ? "text-rose-500 fill-rose-500 scale-110" : "text-rose-300"}`} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: form.isFavorite ? "var(--primary-deep)" : "var(--text-light)" }}>
                    {form.isFavorite ? "Highlighted as Favorite" : "Add to Favorites Library"}
                  </span>
               </div>
               {form.isFavorite && <Check className="w-5 h-5 text-rose-500" />}
             </button>
           </div>
        </div>

        {/* ── Error & Actions ── */}
        <div className="pt-10 border-t flex flex-col gap-6" style={{ borderColor: "var(--border-glass-strong)" }}>
           {error && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border shadow-lg"
               style={{ background: "#fff5f5", color: "#c53030", borderColor: "#feb2b2" }}>
               <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">✗</div>
               {error}
             </motion.div>
           )}

           <div className="flex gap-4">
             <button onClick={() => router.back()} className="btn-ghost flex-1 py-4 text-sm font-bold uppercase tracking-widest rounded-2xl">Cancel</button>
             <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-[2] justify-center py-4 text-base font-bold rounded-2xl shadow-xl">
               {saving ? (
                 <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving Forever...</>
               ) : (
                 <><Heart className="w-5 h-5 mr-2" /> {mode === "edit" ? "Update Memory" : "Seal the Memory"}</>
               )}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function Trash2Icon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
  );
}
