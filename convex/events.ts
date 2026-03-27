import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    date: v.string(),
    type: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      ...args,
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
    const events = await ctx.db.query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
    return events;
  },
});
