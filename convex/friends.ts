import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendRequest = mutation({
  args: { userId: v.id("users"), friendUniqueId: v.string() },
  handler: async (ctx, args) => {
    const friend = await ctx.db
      .query("users")
      .withIndex("by_uniqueId", (q) => q.eq("uniqueId", args.friendUniqueId))
      .unique();

    if (!friend) throw new Error("User not found... Check the ID and try again! 🥺");
    if (friend._id === args.userId) throw new Error("Arre, you can't be friends with yourself! (Well, you should be, but not in the system) 😉");

    // Check if already friends or pending
    const existing = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.or(
          q.and(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), friend._id)),
          q.and(q.eq(q.field("user1Id"), friend._id), q.eq(q.field("user2Id"), args.userId))
        )
      )
      .unique();

    if (existing) {
      if (existing.status === "blocked") throw new Error("This action is restricted... 🔒");
      if (existing.status === "accepted") throw new Error("Aap already friends hain! ✨");
      if (existing.user1Id === args.userId) throw new Error("Request already sent... Intezar kariye! ⏳");
      throw new Error("Pehle se hi ek request aayi hui hai! Accept it? 😉");
    }

    return await ctx.db.insert("friendships", {
      user1Id: args.userId,
      user2Id: friend._id,
      status: "pending",
      user1Access: ["all"],
      user2Access: ["all"],
      createdAt: Date.now(),
    });
  },
});

export const acceptRequest = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.friendshipId, { status: "accepted" });
  },
});

export const updateAccess = mutation({
  args: { userId: v.id("users"), friendshipId: v.id("friendships"), access: v.array(v.string()) },
  handler: async (ctx, args) => {
    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) throw new Error("Friendship not found");
    
    if (friendship.user1Id === args.userId) {
       await ctx.db.patch(args.friendshipId, { user1Access: args.access });
    } else if (friendship.user2Id === args.userId) {
       await ctx.db.patch(args.friendshipId, { user2Access: args.access });
    } else {
       throw new Error("Unauthorized");
    }
  },
});

export const removeFriend = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.friendshipId);
  },
});

export const blockFriend = mutation({
  args: { friendshipId: v.id("friendships"), userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.friendshipId, { status: "blocked", blockedById: args.userId });
  },
});

export const listFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.and(
          q.or(q.eq(q.field("status"), "accepted"), q.eq(q.field("status"), "blocked")),
          q.or(q.eq(q.field("user1Id"), args.userId), q.eq(q.field("user2Id"), args.userId))
        )
      )
      .collect();

    const friendsList = [];
    for (const f of friendships) {
      const isUser1 = f.user1Id === args.userId;
      const friendId = isUser1 ? f.user2Id : f.user1Id;
      const friend = await ctx.db.get(friendId);
      if (friend) {
        // Only show if accepted OR if user is NOT the blocker
        if (f.status === "accepted") {
          friendsList.push({ 
            ...friend, 
            friendshipId: f._id, 
            status: f.status,
            myAccessToFriend: isUser1 ? (f.user2Access || ["all"]) : (f.user1Access || ["all"]),
            friendAccessToMe: isUser1 ? (f.user1Access || ["all"]) : (f.user2Access || ["all"])
          });
        } else if (f.status === "blocked" && f.blockedById !== args.userId) {
          // You were blocked by this person
          friendsList.push({
            _id: friend._id,
            email: "Hidden User",
            uniqueId: "RESTRICTED",
            friendshipId: f._id,
            status: "blocked_by_other"
          });
        }
      }
    }
    return friendsList;
  },
});

export const listPending = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const received = await ctx.db
      .query("friendships")
      .withIndex("by_user2", (q) => q.eq("user2Id", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const pendingList = [];
    for (const r of received) {
       const sender = await ctx.db.get(r.user1Id);
       if (sender) pendingList.push({ ...sender, friendshipId: r._id });
    }
    return pendingList;
  },
});

export const listBlocked = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const blocked = await ctx.db
      .query("friendships")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "blocked"),
          q.eq(q.field("blockedById"), args.userId)
        )
      )
      .collect();

    const blockedList = [];
    for (const b of blocked) {
      const isUser1 = b.user1Id === args.userId;
      const friendId = isUser1 ? b.user2Id : b.user1Id;
      const friend = await ctx.db.get(friendId);
      if (friend) blockedList.push({ 
        ...friend, 
        friendshipId: b._id 
      });
    }
    return blockedList;
  },
});

export const unblockFriend = mutation({
  args: { friendshipId: v.id("friendships"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const f = await ctx.db.get(args.friendshipId);
    if (!f || f.blockedById !== args.userId) {
      throw new Error("Only the original blocker can restore this connection.");
    }
    await ctx.db.patch(args.friendshipId, { status: "accepted", blockedById: undefined });
  },
});
