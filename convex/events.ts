import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    date: v.string(),
    type: v.string(),
    notes: v.optional(v.string()),
    visibility: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      ...args,
      visibility: args.visibility ?? "private",
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("events"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const e = await ctx.db.get(args.id);
    if (!e || e.userId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    // Own events
    const myEvents = await ctx.db.query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Friend events
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "accepted"),
          q.or(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), args.userId))
        )
      )
      .collect();

    const friendIds = friendships.map(f => f.user1Id === args.userId ? f.user2Id : f.user1Id);
    
    let shared: any[] = [];
    for (const fId of friendIds) {
       const s = await ctx.db.query("events")
         .withIndex("by_user", (q) => q.eq("userId", fId))
         .filter((q) => q.eq(q.field("visibility"), "friends"))
         .collect();
       shared = [...shared, ...s];
    }
    
    return [...myEvents, ...shared].sort((a, b) => a.date.localeCompare(b.date));
  },
});
