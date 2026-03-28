import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ─── Helper ───────────────────────────────────────────────────────────────────
async function attachImageUrl(ctx: any, memory: any) {
  let imageUrl = memory.imageUrl;
  if (memory.imageStorageId && !imageUrl) {
    imageUrl = (await ctx.storage.getUrl(memory.imageStorageId)) ?? undefined;
  }
  
  // Attach creator info
  const creator = await ctx.db.get(memory.userId);
  const creatorInfo = creator ? {
    name: creator.email.split('@')[0],
    uniqueId: creator.uniqueId
  } : null;

  return { ...memory, imageUrl, creator: creatorInfo };
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
    
    // Own memories
    const myMemories = await ctx.db.query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Friendships check
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "accepted"),
          q.or(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), args.userId))
        )
      )
      .collect();

    // Get friends' shared memories
    let sharedMemories: any[] = [];
    for (const f of friendships) {
       const isUser1 = f.user1Id === args.userId;
       const friendId = isUser1 ? f.user2Id : f.user1Id;
       const access = isUser1 ? (f.user2Access || ["all"]) : (f.user1Access || ["all"]);
       
       const canSee = access.includes("all") || access.includes("memories") || access.includes("timeline");

       if (canSee) {
          const shared = await ctx.db
            .query("memories")
            .withIndex("by_user", (q) => q.eq("userId", friendId))
            .filter((q) => q.eq(q.field("visibility"), "friends"))
            .collect();
          sharedMemories = [...sharedMemories, ...shared];
       }
    }

    let memories = [...myMemories, ...sharedMemories];

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
    if (!m) return null;
    if (m.userId === args.userId) return attachImageUrl(ctx, m);
    
    // Check if it's a friend's shared memory
    if (m.visibility === "friends" && args.userId) {
       const friendship = await ctx.db
         .query("friendships")
         .filter((q) => 
           q.and(
             q.eq(q.field("status"), "accepted"),
             q.or(
               q.and(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), m.userId)),
               q.and(q.eq(q.field("user1Id"), m.userId), q.eq(q.field("user2Id"), args.userId))
             )
           )
         )
         .unique();
        if (friendship) {
           const isUser1 = friendship.user1Id === args.userId;
           const access = isUser1 ? (friendship.user2Access || ["all"]) : (friendship.user1Access || ["all"]);
           const canSee = access.includes("all") || access.includes("memories") || access.includes("timeline");
           if (canSee) return attachImageUrl(ctx, m);
        }
    }

    return null;
  },
});

export const getTimeline = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "accepted"),
          q.or(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), args.userId))
        )
      )
      .collect();

    const myMemories = await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    let shared: any[] = [];
    for (const f of friendships) {
       const isUser1 = f.user1Id === args.userId;
       const friendId = isUser1 ? f.user2Id : f.user1Id;
       const access = isUser1 ? (f.user2Access || ["all"]) : (f.user1Access || ["all"]);

       if (access.includes("all") || access.includes("timeline")) {
          const s = await ctx.db
            .query("memories")
            .withIndex("by_user", (q) => q.eq("userId", friendId))
            .filter((q) => q.eq(q.field("visibility"), "friends"))
            .collect();
          shared = [...shared, ...s];
       }
    }
    
    const memories = [...myMemories, ...shared];
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
    
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "accepted"),
          q.or(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), args.userId))
        )
      )
      .collect();

    const myRecent = await ctx.db
      .query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 6);

    let friendRecent: any[] = [];
    for (const f of friendships) {
       const isUser1 = f.user1Id === args.userId;
       const friendId = isUser1 ? f.user2Id : f.user1Id;
       const access = isUser1 ? (f.user2Access || ["all"]) : (f.user1Access || ["all"]);

       if (access.includes("all") || access.includes("memories") || access.includes("timeline")) {
          const s = await ctx.db
            .query("memories")
            .withIndex("by_user", (q) => q.eq("userId", friendId))
            .filter((q) => q.eq(q.field("visibility"), "friends"))
            .order("desc")
            .take(args.limit ?? 6);
          friendRecent = [...friendRecent, ...s];
       }
    }
    
    const combined = [...myRecent, ...friendRecent]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, args.limit ?? 6);

    return Promise.all(combined.map((m) => attachImageUrl(ctx, m)));
  },
});

export const getByDate = query({
  args: { date: v.string(), userId: v.optional(v.id("users")), excludeId: v.id("memories") },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    // Own memories for that date
    const myMemories = await ctx.db.query("memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    // Friendships check
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "accepted"),
          q.or(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), args.userId))
        )
      )
      .collect();

    let sharedMemories: any[] = [];
    for (const f of friendships) {
       const isUser1 = f.user1Id === args.userId;
       const friendId = isUser1 ? f.user2Id : f.user1Id;
       const access = isUser1 ? (f.user2Access || ["all"]) : (f.user1Access || ["all"]);
       
       const canSee = access.includes("all") || access.includes("memories") || access.includes("timeline");

       if (canSee) {
          const shared = await ctx.db
            .query("memories")
            .withIndex("by_user", (q) => q.eq("userId", friendId))
            .filter((q) => q.and(q.eq(q.field("visibility"), "friends"), q.eq(q.field("date"), args.date)))
            .collect();
          sharedMemories = [...sharedMemories, ...shared];
       }
    }

    const all = [...myMemories, ...sharedMemories].filter(m => m._id !== args.excludeId);
    return Promise.all(all.map((m) => attachImageUrl(ctx, m)));
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
    visibility: v.optional(v.string()),
    sharedWith: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("memories", {
      ...args,
      visibility: args.visibility ?? "private",
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
    visibility: v.optional(v.string()),
    sharedWith: v.optional(v.array(v.id("users"))),
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
    if (!m) throw new Error("Memory not found");
    const newStatus = !m.isFavorite;
    await ctx.db.patch(args.id, { isFavorite: newStatus, updatedAt: Date.now() });

    // If favorited by someone else, notify the owner
    const memoryOwnerId = m.userId;
    if (newStatus && memoryOwnerId !== args.userId) {
      const user = await ctx.db.get(args.userId);
      await ctx.db.insert("notifications", {
        userId: memoryOwnerId as any, // Final safety cast
        type: "memory_like",
        fromUserId: args.userId,
        content: `${user?.email.split('@')[0] || "Someone"} liked your memory! ❤️`,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return newStatus;
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
