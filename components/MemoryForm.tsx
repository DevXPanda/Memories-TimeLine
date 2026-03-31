"use client";
import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Sparkles, X, MapPin, Calendar, Clock,
  Tag, Heart, Loader2, Image as ImageIcon, Hash, ChevronRight, Check,
  Lock, Users, Trash2 as Trash2Icon
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
  visibility?: string;
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
    visibility: initialData?.visibility || "private",
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
        visibility: form.visibility,
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

  const labelStyle = { color: "var(--text-main)", opacity: 0.5 };

  return (
    <div className="glass-strong rounded-[28px] p-6 sm:p-8 border shadow-xl overflow-hidden relative max-w-6xl mx-auto" style={{ borderColor: "var(--border-glass)" }}>
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-48 h-48 opacity-5 pointer-events-none -mr-24 -mt-24 rounded-full" style={{ background: "var(--primary)" }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5 pointer-events-none -ml-24 -mb-24 rounded-full" style={{ background: "var(--primary)" }} />

      {/* Header */}
      <div className="mb-8 text-center">
         <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
           {mode === "create" ? "Capture a Heartfelt Moment" : "Refine Your Story"}
         </h2>
         <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Preserving your shared story forever.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 relative z-10">
        {/* LEFT SIDE: Image upload */}
        <div className="w-full lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col">
          <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-3 ml-1" style={labelStyle}>The Visual</label>
          <div className="relative flex-1 flex flex-col min-h-[350px] lg:min-h-[440px]">
            {imagePreview ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex-1 rounded-[20px] overflow-hidden border shadow-inner group w-full" 
                style={{ borderColor: "var(--border-glass-strong)" }}>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button onClick={() => { setImageFile(null); setImagePreview(""); }}
                     className="w-10 h-10 rounded-full text-red-500 shadow-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: "var(--bg-glass-strong)" }}>
                     <Trash2Icon className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            ) : (
              <button 
                onClick={() => fileRef.current?.click()}
                className="w-full flex-1 min-h-[350px] lg:min-h-[440px] rounded-[20px] flex flex-col items-center justify-center gap-3 transition-all duration-300 border-[1.5px] border-dashed group hover:shadow-inner"
                style={{ borderColor: "var(--border-glass-strong)", background: "var(--primary-blush)" }}>
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform" style={{ color: "var(--primary)" }}>
                   <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-center">
                   <p className="text-xs font-bold" style={{ color: "var(--primary-deep)" }}>Add a Photo</p>
                   <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest mt-1 px-4">Moments up to 10MB</p>
                </div>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </div>
        </div>

        {/* RIGHT SIDE: Form details */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-1" style={labelStyle}>Story Title *</label>
                <input className="input-rose text-xs h-10 rounded-xl" placeholder="e.g. Our First Date 🌹" value={form.title}
                  onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-1" style={labelStyle}>Date *</label>
                  <input type="date" className="input-rose text-[11px] h-10 rounded-xl" value={form.date}
                    onChange={(e) => set("date", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-1" style={labelStyle}>Time</label>
                  <input type="time" className="input-rose text-[11px] h-10 rounded-xl" value={form.time}
                    onChange={(e) => set("time", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-1" style={labelStyle}>Location Spotlight</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                   <input className="input-rose h-10 text-xs rounded-xl" placeholder="Where did it happen?" value={form.location}
                     onChange={(e) => set("location", e.target.value)} style={{ paddingLeft: '32px' }} />
                </div>
              </div>
           </div>

           <div className="space-y-5">
              <div>
                 <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1" style={labelStyle}>The Vibe (Mood)</label>
                 <div className="flex flex-wrap gap-1.5">
                   {MOODS.map((m) => (
                     <button key={m.value}
                       onClick={() => set("mood", form.mood === m.value ? "" : m.value)}
                       className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all border shadow-sm"
                       style={{
                         background: form.mood === m.value ? "var(--primary)" : "var(--bg-glass-strong)",
                         color: form.mood === m.value ? "white" : "var(--text-main)",
                         borderColor: form.mood === m.value ? "var(--primary)" : "var(--border-glass)",
                       }}>
                       <span className="text-xs">{m.emoji}</span> {m.label}
                     </button>
                   ))}
                 </div>
              </div>
              <div>
                 <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1" style={labelStyle}>Memory Type</label>
                 <div className="flex flex-wrap gap-1.5">
                   {CATEGORIES.map((cat) => (
                     <button key={cat}
                       onClick={() => set("category", form.category === cat ? "" : cat)}
                       className="px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border shadow-sm"
                       style={{
                         background: form.category === cat ? "var(--primary-soft)" : "var(--bg-glass-strong)",
                         color: form.category === cat ? "white" : "var(--text-main)",
                         borderColor: form.category === cat ? "var(--primary-soft)" : "var(--border-glass)",
                       }}>
                       {cat}
                     </button>
                   ))}
                 </div>
              </div>
           </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div>
               <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-1" style={labelStyle}>Story Details *</label>
               <textarea className="input-rose min-h-[100px] rounded-xl p-3 text-xs" placeholder="Start writing the story behind this moment..." 
                 value={form.caption} onChange={(e) => set("caption", e.target.value)} />
             </div>
             <div>
               <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-1" style={labelStyle}>Dil&apos;s Personal Note</label>
               <div className="relative">
                  <Sparkles className="absolute top-2 right-2 w-3.5 h-3.5 text-rose-300 pointer-events-none" />
                  <textarea className="input-rose min-h-[100px] rounded-xl p-3 italic text-xs"
                    placeholder="A romantic addition..."
                    value={aiCaption} onChange={(e) => setAiCaption(e.target.value)}
                    style={{ fontFamily: "var(--font-script)", fontSize: "1rem", lineHeight: "1.3", color: "var(--primary-deep)" }} />
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
             <div>
               <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-1" style={labelStyle}>Tags & Keywords</label>
               <div className="flex gap-2">
                  <div className="relative flex-1">
                     <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30" />
                     <input className="input-rose h-9 rounded-xl text-xs" placeholder="nature, movie..." value={tagInput}
                       onChange={(e) => setTagInput(e.target.value)} 
                       onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
                       style={{ paddingLeft: '32px' }} />
                  </div>
                  <button type="button" onClick={addTag} className="btn-ghost px-3 h-9 text-[9px] font-black uppercase">Add</button>
               </div>
             </div>

             <div className="space-y-3">
                <label className="block text-[9px] font-black uppercase tracking-[0.2em] mb-2 ml-1" style={labelStyle}>Privacy & Highlighting</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => set("isFavorite", !form.isFavorite)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl transition-all border shadow-sm"
                    style={{ 
                      background: form.isFavorite ? "var(--primary-blush)" : "var(--bg-glass-strong)",
                      borderColor: form.isFavorite ? "var(--primary)" : "var(--border-glass)"
                    }}>
                    <Heart className={`w-3.5 h-3.5 ${form.isFavorite ? "text-rose-500 fill-rose-500" : "text-rose-300"}`} />
                    <span className="text-[10px] font-bold" style={{ color: "var(--text-main)" }}>Highlight</span>
                  </button>

                  <div className="flex-1 flex rounded-xl p-0.5 border shadow-sm" style={{ borderColor: 'var(--border-glass)', background: 'var(--bg-glass-strong)' }}>
                     <button type="button" onClick={() => set("visibility", "private")}
                       className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[8px] font-black uppercase transition-all"
                       style={{ 
                         background: form.visibility === 'private' ? 'var(--primary-deep)' : 'transparent',
                         color: form.visibility === 'private' ? 'white' : 'var(--text-muted)'
                       }}>
                       <Lock className="w-2.5 h-2.5" /> Private
                     </button>
                     <button type="button" onClick={() => set("visibility", "friends")}
                       className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[8px] font-black uppercase transition-all"
                       style={{ 
                         background: form.visibility === 'friends' ? 'var(--primary)' : 'transparent',
                         color: form.visibility === 'friends' ? 'white' : 'var(--text-muted)'
                       }}>
                       <Users className="w-2.5 h-2.5" /> Friends
                     </button>
                  </div>
                </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 border-t flex flex-col gap-4" style={{ borderColor: "var(--border-glass-strong)" }}>
             <div className="flex gap-3 justify-end">
               <button onClick={() => router.back()} className="btn-ghost px-5 h-9 text-[9px] font-black uppercase tracking-widest rounded-xl">Cancel</button>
               <button onClick={handleSubmit} disabled={saving} className="btn-primary px-8 h-9 text-[11px] font-extrabold rounded-xl shadow-lg">
                 {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Seal the Memory"}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
