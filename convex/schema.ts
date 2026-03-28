import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  memories: defineTable({
    title: v.string(),
    caption: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    mood: v.optional(v.string()),
    category: v.optional(v.string()),
    isFavorite: v.boolean(),
    userId: v.optional(v.id("users")),
    visibility: v.optional(v.string()), // "private" (default for owner) or "friends"
    sharedWith: v.optional(v.array(v.id("users"))),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    aiCaption: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .index("by_favorite", ["isFavorite"])
    .index("by_mood", ["mood"])
    .index("by_createdAt", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_visibility", ["visibility"]),

  events: defineTable({
    title: v.string(),
    date: v.string(), // ISO date e.g. 2024-03-27
    type: v.string(), // birthday, anniversary, trip, other
    notes: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    mentionedUserId: v.optional(v.id("users")),
    approvalStatus: v.optional(v.string()), // "pending", "approved", "rejected"
    visibility: v.optional(v.string()), // "private" or "friends"
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_user", ["userId"])
    .index("by_mentioned", ["mentionedUserId"])
    .index("by_visibility", ["visibility"]),

  users: defineTable({
    email: v.string(),
    uniqueId: v.optional(v.string()), // e.g. U27032026
    privatePin: v.optional(v.string()), // 4-6 digit chosen pin
    isVerified: v.boolean(),
    otp: v.optional(v.string()),
    otpExpires: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_uniqueId", ["uniqueId"]),

  friendships: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    status: v.string(), // "pending", "accepted"
    user1Access: v.optional(v.array(v.string())), // What user2 can see of user1 (set by user1)
    user2Access: v.optional(v.array(v.string())), // What user1 can see of user2 (set by user2)
    createdAt: v.number(),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_both", ["user1Id", "user2Id"]),
});
