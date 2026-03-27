"use client";
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Heart, Mail, Lock, CheckCircle, ArrowRight, RefreshCw, Key, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "email" | "otp" | "set_pin" | "login" | "forgot_otp" | "reset_pin";

interface AuthPageProps {
  onLogin: (id: Id<"users">, email: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export default function AuthPage({ onLogin, onClose, isModal = true }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [tempUserId, setTempUserId] = useState<Id<"users"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signup      = useMutation(api.auth.signup);
  const verifyOtp   = useMutation(api.auth.verifyOtp);
  const setPinMut   = useMutation(api.auth.setPrivatePin);
  const loginMut    = useMutation(api.auth.login);
  const forgotPin   = useMutation(api.auth.forgotPin);
  const resetPinMut = useMutation(api.auth.resetPin);

  const sendEmail = async (targetEmail: string, code: string, type: "verify" | "reset") => {
    try {
      await fetch("/api/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: targetEmail, otp: code, type }),
      });
    } catch (e) {
      console.error("Failed to send email:", e);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signup({ email });
      await sendEmail(email, res.otp!, "verify");
      setMode("otp");
    } catch (err: any) {
      if (err.message.includes("exists")) {
        setMode("login");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await verifyOtp({ email, otp });
      setTempUserId(res.userId);
      setMode("set_pin");
    } catch (err: any) {
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return setError("PIN must be at least 4 digits");
    setLoading(true);
    try {
      await setPinMut({ userId: tempUserId!, pin });
      onLogin(tempUserId!, email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginMut({ email, pin });
      onLogin(res.userId, res.email);
    } catch (err: any) {
      setError("Invalid PIN or email");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotTrigger = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await forgotPin({ email });
      await sendEmail(email, res.otp!, "reset");
      setMode("forgot_otp");
    } catch (err: any) {
      setError("User not found");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await resetPinMut({ email, otp, newPin: pin });
      onLogin(res.userId, email);
    } catch (err: any) {
      setError("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case "email":
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            <h2 className="text-3xl font-bold text-center mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Welcome ✨</h2>
            <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-40 mb-8" style={{ color: "var(--text-main)" }}>Access Your Sanctuary</p>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input required type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-rose h-12 pl-12 w-full rounded-2xl" />
              </div>
              <button disabled={loading} className="btn-primary w-full justify-center h-12 rounded-2xl shadow-xl font-bold">
                {loading ? "Sending One-Time PIN..." : "Get Started ❤️"}
              </button>
            </div>
          </form>
        );

      case "otp":
      case "forgot_otp":
        return (
          <form onSubmit={mode === "otp" ? handleOtpVerify : handleResetPin} className="space-y-5">
            <h2 className="text-3xl font-bold text-center mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
              {mode === "otp" ? "Verify Code 💌" : "Reset PIN 🔐"}
            </h2>
            <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-40 mb-8" style={{ color: "var(--text-main)" }}>Check your email inbox</p>
            <div className="space-y-4">
              <div className="relative">
                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input required maxLength={6} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)}
                  className="input-rose h-12 pl-12 w-full text-center tracking-[0.5em] font-black text-xl rounded-2xl" />
              </div>
              {mode === "forgot_otp" && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                  <input required type="password" placeholder="New Secret PIN" value={pin} onChange={e => setPin(e.target.value)}
                    className="input-rose h-12 pl-12 w-full rounded-2xl" />
                </div>
              )}
              <button disabled={loading} className="btn-primary w-full justify-center h-12 rounded-2xl shadow-xl font-bold">
                {loading ? "Verifying..." : mode === "otp" ? "Verify & Continue ✨" : "Reset PIN & Login ❤️"}
              </button>
              <button type="button" onClick={() => setMode("email")} className="w-full text-[10px] font-black uppercase tracking-widest text-rose-400 hover:underline">Change Email</button>
            </div>
          </form>
        );

      case "set_pin":
        return (
          <form onSubmit={handleSetPin} className="space-y-5">
            <h2 className="text-3xl font-bold text-center mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Secure Memories 🔒</h2>
            <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-40 mb-8" style={{ color: "var(--text-main)" }}>One last step...</p>
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input required type="password" placeholder="Choose a Secury PIN" value={pin} onChange={e => setPin(e.target.value)}
                  className="input-rose h-12 pl-12 w-full text-center text-2xl tracking-[0.3em] rounded-2xl" />
              </div>
              <button disabled={loading} className="btn-primary w-full justify-center h-12 rounded-2xl shadow-xl font-bold">
                {loading ? "Securing..." : "Secure My Space ❤️"}
              </button>
            </div>
          </form>
        );

      case "login":
        return (
          <form onSubmit={handleLogin} className="space-y-5">
            <h2 className="text-3xl font-bold text-center mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>Welcome back 🌹</h2>
            <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-40 mb-8" style={{ color: "var(--text-main)" }}>Your memories await</p>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input readOnly value={email} className="input-rose h-12 pl-12 w-full opacity-60 pointer-events-none rounded-2xl" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                <input required autoFocus type="password" placeholder="Secret PIN" value={pin} onChange={e => setPin(e.target.value)}
                  className="input-rose h-12 pl-12 w-full text-center text-2xl tracking-[0.3em] rounded-2xl" />
              </div>
              <button disabled={loading} className="btn-primary w-full justify-center h-12 rounded-2xl shadow-xl font-bold">
                {loading ? "Unlocking..." : "Unlock Vault 🔓"}
              </button>
              <div className="flex gap-4 justify-center mt-4 pt-4">
                <button type="button" onClick={handleForgotTrigger} className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:underline">Forgot PIN?</button>
                <div className="w-px h-4 bg-rose-100" />
                <button type="button" onClick={() => setMode("email")} className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:underline">Not {email}?</button>
              </div>
            </div>
          </form>
        );
    }
  };

  const card = (
    <motion.div 
      initial={isModal ? { scale: 0.95, opacity: 0, y: 20 } : { opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={isModal ? { scale: 0.95, opacity: 0, y: 20 } : { opacity: 0, y: 10 }}
      className={`glass-strong w-full max-w-md rounded-[40px] p-10 relative bg-white ${isModal ? "shadow-[0_30px_100px_rgba(0,0,0,0.15)] border" : "shadow-none border-none"}`}
      style={{ borderColor: "var(--border-glass-strong)" }}
      onClick={(e) => e.stopPropagation()}
    >
      {isModal && onClose && (
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-rose-50 transition-colors" style={{ color: "var(--text-light)" }}>
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex justify-center mb-10">
        <div className="w-20 h-20 rounded-[30px] flex items-center justify-center shadow-md relative group" style={{ background: "var(--primary-blush)" }}>
          <Heart className="w-10 h-10 text-rose-400 fill-rose-500 animate-heartbeat" />
          <div className="absolute inset-0 rounded-[30px] border-2 border-white opacity-40 scale-110" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {error && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} 
          className="mt-6 p-3 rounded-xl bg-red-50 text-center text-xs text-red-600 font-bold border border-red-100 uppercase tracking-widest">
          ✗ {error}
        </motion.div>
      )}

      <div className="mt-12 pt-8 border-t border-rose-100/50 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] font-black opacity-30" style={{ color: "var(--text-main)" }}>Designed For Just Us 💞</p>
      </div>
    </motion.div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
        <AnimatePresence mode="wait">
          {card}
        </AnimatePresence>
      </div>
    );
  }

  return card;
}
