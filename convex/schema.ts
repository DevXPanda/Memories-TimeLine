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
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    aiCaption: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  })
    .index("by_date", ["date"])
    .index("by_category", ["category"])
    .index("by_favorite", ["isFavorite"])
    .index("by_mood", ["mood"])
    .index("by_createdAt", ["createdAt"])
    .index("by_user", ["userId"]),

  events: defineTable({
    title: v.string(),
    date: v.string(), // ISO date e.g. 2024-03-27
    type: v.string(), // birthday, anniversary, trip, other
    notes: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_user", ["userId"]),

  users: defineTable({
    email: v.string(),
    privatePin: v.optional(v.string()), // 4-6 digit chosen pin
    isVerified: v.boolean(),
    otp: v.optional(v.string()),
    otpExpires: v.optional(v.number()),
  }).index("by_email", ["email"]),
});
