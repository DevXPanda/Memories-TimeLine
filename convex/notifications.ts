import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Internal-ready: Send a notification to a specific user
export const create = mutation({
  args: { 
    userId: v.id("users"), 
    type: v.string(), 
    fromUserId: v.id("users"), 
    content: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      fromUserId: args.fromUserId,
      content: args.content,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// List unread notifications for the current user
export const listUnread = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .order("desc")
      .collect();
  },
});

// Batch mark notifications as read
export const markAsRead = mutation({
  args: { notificationIds: v.array(v.id("notifications")) },
  handler: async (ctx, args) => {
    for (const id of args.notificationIds) {
      await ctx.db.patch(id, { isRead: true });
    }
  },
});
