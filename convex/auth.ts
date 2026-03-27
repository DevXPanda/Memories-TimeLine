import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new Error("User already exists and is verified. Please login.");
      }
      await ctx.db.patch(existingUser._id, { otp, otpExpires });
      return { status: "verification_required", email: args.email, otp }; // OTP return for dev/test ease, we'll send email too
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      isVerified: false,
      otp,
      otpExpires,
    });

    return { status: "verification_required", email: args.email, otp };
  },
});

export const verifyOtp = mutation({
  args: { email: v.string(), otp: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user || user.otp !== args.otp || (user.otpExpires && user.otpExpires < Date.now())) {
      throw new Error("Invalid or expired OTP");
    }

    await ctx.db.patch(user._id, {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined,
    });

    return { status: "verified", userId: user._id };
  },
});

export const setPrivatePin = mutation({
  args: { userId: v.id("users"), pin: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { privatePin: args.pin });
    return { status: "pin_set" };
  },
});

export const login = mutation({
  args: { email: v.string(), pin: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user || !user.isVerified || user.privatePin !== args.pin) {
      throw new Error("Invalid email or PIN");
    }

    return { status: "logged_in", userId: user._id, email: user.email };
  },
});

export const forgotPin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    await ctx.db.patch(user._id, { otp, otpExpires });
    return { status: "reset_otp_sent", email: args.email, otp };
  },
});

export const resetPin = mutation({
  args: { email: v.string(), otp: v.string(), newPin: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user || user.otp !== args.otp || (user.otpExpires && user.otpExpires < Date.now())) {
      throw new Error("Invalid or expired OTP");
    }

    await ctx.db.patch(user._id, {
      privatePin: args.newPin,
      otp: undefined,
      otpExpires: undefined,
    });

    return { status: "pin_reset", userId: user._id };
  },
});

export const getUser = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});
