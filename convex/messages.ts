import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a one-way message, strictly isolated to the sender and receiver
export const send = mutation({
  args: { 
    senderId: v.id("users"), 
    receiverId: v.id("users"), 
    content: v.string(),
    encryptedKey: v.string(),
    senderEncryptedKey: v.string(),
    iv: v.string(),
  },
  handler: async (ctx, args) => {
    // Basic verification: Check if they are friends (optional but better)
    // For now, allow sending to any valid user ID as per simplified WhatsApp model
    const messageId = await ctx.db.insert("messages", {
      senderId: args.senderId,
      receiverId: args.receiverId,
      content: args.content,
      status: "sent",
      createdAt: Date.now(),
      encryptedKey: args.encryptedKey,
      senderEncryptedKey: args.senderEncryptedKey,
      iv: args.iv,
    });

    // New: Trigger global notification for the receiver
    const sender = await ctx.db.get(args.senderId);
    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      type: "message",
      fromUserId: args.senderId,
      content: `New message from ${sender?.email.split('@')[0] || "Friend"}`,
      isRead: false,
      createdAt: Date.now(),
    });

    // Clear sender's typing status upon sending message
    const existing = await ctx.db
      .query("typingStatuses")
      .withIndex("by_user", (q) => q.eq("userId", args.senderId).eq("receiverId", args.receiverId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { isTyping: false, lastUpdated: Date.now() });
    }

    return messageId;
  },
});

// List conversation messages bidirectionally
export const list = query({
  args: { userId: v.id("users"), friendId: v.id("users") },
  handler: async (ctx, args) => {
    // Retrieve messages where:
    // (Sender = Me AND Receiver = Friend) OR (Sender = Friend AND Receiver = Me)
    const messages = await ctx.db
      .query("messages")
      .collect(); // In production, use filters or composite indexes

    // Filtering in JS for simplicity in this sandbox, as Convex filters are better but limited by current indexes
    return messages
      .filter((m) => 
        (m.senderId === args.userId && m.receiverId === args.friendId) || 
        (m.senderId === args.friendId && m.receiverId === args.userId)
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  },
});

// Mark all incoming messages from a specific friend as read
export const markRead = mutation({
  args: { userId: v.id("users"), friendId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", args.userId).eq("status", "sent"))
      .collect();

    for (const msg of unread) {
      if (msg.senderId === args.friendId) {
        await ctx.db.patch(msg._id, { status: "read" });
      }
    }
  },
});

// Set current user's typing indicator
export const setTyping = mutation({
  args: { 
    userId: v.id("users"), 
    receiverId: v.id("users"), 
    isTyping: v.boolean() 
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typingStatuses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId).eq("receiverId", args.receiverId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { isTyping: args.isTyping, lastUpdated: Date.now() });
    } else {
      await ctx.db.insert("typingStatuses", {
        userId: args.userId,
        receiverId: args.receiverId,
        isTyping: args.isTyping,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Get friend's typing indicator for current conversation
export const getTyping = query({
  args: { userId: v.id("users"), friendId: v.id("users") },
  handler: async (ctx, args) => {
    const status = await ctx.db
      .query("typingStatuses")
      .withIndex("by_user", (q) => q.eq("userId", args.friendId).eq("receiverId", args.userId))
      .unique();

    // Auto-timeout typing indicators older than 10 seconds
    if (status && status.isTyping && Date.now() - status.lastUpdated < 10000) {
      return true;
    }
    return false;
  },
});
