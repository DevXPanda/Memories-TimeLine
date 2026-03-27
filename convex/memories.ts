import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Helper ───────────────────────────────────────────────────────────────────
async function attachImageUrl(ctx: any, memory: any) {
  let imageUrl = memory.imageUrl;
  if (memory.imageStorageId && !imageUrl) {
    imageUrl = (await ctx.storage.getUrl(memory.imageStorageId)) ?? undefined;
  }
  return { ...memory, imageUrl };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const list = query({
  args: {
    userId: v.optional(v.id("users")),
    category: v.optional(v.string()),
    mood: v.optional(v.string()),
    favoritesOnly: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    let q = ctx.db.query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    if (args.category) {
      // Since we can only use one withIndex, we filter the results if we have other filters
      // OR we just collect and filter. For simplicity and multi-user safety:
    }

    let memories = await q.collect();

    // Filter by other criteria
    if (args.category) memories = memories.filter(m => m.category === args.category);
    if (args.favoritesOnly) memories = memories.filter(m => m.isFavorite);
    if (args.mood) memories = memories.filter((m: any) => m.mood === args.mood);
    
    if (args.search) {
      const s = args.search.toLowerCase();
      memories = memories.filter(
        (m: any) =>
          m.title.toLowerCase().includes(s) ||
          m.caption.toLowerCase().includes(s) ||
          (m.location ?? "").toLowerCase().includes(s)
      );
    }

    memories.sort((a, b) => b.createdAt - a.createdAt);

    return Promise.all(memories.map((m: any) => attachImageUrl(ctx, m)));
  },
});

export const getById = query({
  args: { id: v.id("memories"), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const m = await ctx.db.get(args.id);
    if (!m || m.userId !== args.userId) return null;
    return attachImageUrl(ctx, m);
  },
});

export const getTimeline = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    memories.sort((a,b) => b.date.localeCompare(a.date));
    return Promise.all(memories.map((m) => attachImageUrl(ctx, m)));
  },
});

export const getStats = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    const all = await ctx.db.query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const total = all.length;
    const favorites = all.filter((m) => m.isFavorite).length;
    const categories = Array.from(new Set(all.map((m) => m.category).filter((x): x is string => !!x)));
    const moods = Array.from(new Set(all.map((m) => m.mood).filter((x): x is string => !!x)));
    const sorted = [...all].sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = sorted[0]?.date ?? null;
    const moodCounts: Record<string, number> = {};
    all.forEach((m) => { if (m.mood) moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
    return { total, favorites, categories, moods, firstDate, moodCounts };
  },
});

export const getOnThisDay = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const all = await ctx.db.query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const matches = all.filter((m) => m.date.slice(5) === monthDay);
    return Promise.all(matches.map((m) => attachImageUrl(ctx, m)));
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const memories = await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 6);
    return Promise.all(memories.map((m) => attachImageUrl(ctx, m)));
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    caption: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    mood: v.optional(v.string()),
    category: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    aiCaption: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("memories", {
      ...args,
      isFavorite: args.isFavorite ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("memories"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    caption: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    mood: v.optional(v.string()),
    category: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    aiCaption: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...fields } = args;
    const m = await ctx.db.get(id);
    if (!m || m.userId !== userId) throw new Error("Unauthorized");

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const toggleFavorite = mutation({
  args: { id: v.id("memories"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const m = await ctx.db.get(args.id);
    if (!m || m.userId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { isFavorite: !m.isFavorite, updatedAt: Date.now() });
    return !m.isFavorite;
  },
});

export const remove = mutation({
  args: { id: v.id("memories"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const m = await ctx.db.get(args.id);
    if (!m || m.userId !== args.userId) throw new Error("Unauthorized");

    if (m?.imageStorageId) {
      try { await ctx.storage.delete(m.imageStorageId); } catch { }
    }
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => ctx.storage.getUrl(args.storageId),
});
