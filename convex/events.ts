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
    mentionedUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      ...args,
      visibility: args.visibility ?? "private",
      approvalStatus: "approved", // Automatically approved for mentions
      createdAt: Date.now(),
    });
  },
});

export const updateApprovalStatus = mutation({
  args: {
    id: v.id("events"),
    userId: v.id("users"),
    status: v.string(), // "approved", "rejected"
  },
  handler: async (ctx, args) => {
    const e = await ctx.db.get(args.id);
    if (!e || e.mentionedUserId !== args.userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, { approvalStatus: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("events"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const e = await ctx.db.get(args.id);
    if (!e || (e.userId !== args.userId && e.mentionedUserId !== args.userId)) {
      throw new Error("Unauthorized");
    }
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

    // Events I'm mentioned in
    const mentionedEvents = await ctx.db.query("events")
      .withIndex("by_mentioned", (q) => q.eq("mentionedUserId", args.userId))
      .collect();

    // Friendships check for shared events
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "accepted"),
          q.or(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), args.userId))
        )
      )
      .collect();

    let shared: any[] = [];
    for (const f of friendships) {
       const isUser1 = f.user1Id === args.userId;
       const friendId = isUser1 ? f.user2Id : f.user1Id;
       const access = isUser1 ? (f.user2Access || ["all"]) : (f.user1Access || ["all"]);

       if (access.includes("all") || access.includes("events")) {
          const s = await ctx.db.query("events")
            .withIndex("by_user", (q) => q.eq("userId", friendId))
            .filter((q) => q.eq(q.field("visibility"), "friends"))
            .collect();
          shared = [...shared, ...s];
          
          const sMentioned = await ctx.db.query("events")
            .withIndex("by_mentioned", (q) => q.eq("mentionedUserId", friendId))
            .filter((q) => q.eq(q.field("visibility"), "friends"))
            .collect();
          shared = [...shared, ...sMentioned];
       }
    }
    
    const all = [...myEvents, ...mentionedEvents, ...shared];
    const unique = Array.from(new Map(all.map(e => [e._id, e])).values());
    
    return unique.sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getPendingApprovals = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    // Returning empty as approvals are no longer mandatory
    return [];
  },
});

export const getTodaysCelebrations = query({
  args: { userId: v.optional(v.id("users")), date: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    // Get all events for today that this user is involved in
    const myEvents = await ctx.db.query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();
      
    const mentionedEvents = await ctx.db.query("events")
      .withIndex("by_mentioned", (q) => q.eq("mentionedUserId", args.userId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();
      
    return [...myEvents, ...mentionedEvents];
  },
});
