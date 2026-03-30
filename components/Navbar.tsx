"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart, Home, Clock, Plus, LogOut, Search, User, Menu, X,
  ChevronRight, Sparkles, Palette, ChevronDown, Users, MessageSquare, Smile, Pencil
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import ThemeSwitcher from "./ThemeSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/friends", label: "Friends", icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userId, email, openLogin } = useAuth();
  const currentUser = useQuery(api.auth.getUser, { userId: userId ?? undefined });
  const updateUserName = useMutation(api.auth.updateUserName);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [nameError, setNameError] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [q, setQ] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isMenuOpen || isProfileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, isProfileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?search=${encodeURIComponent(q.trim())}`);
      setIsSearchOpen(false);
      setQ("");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[120] border-b shadow-sm glass-strong"
        style={{ borderColor: "var(--border-glass-strong)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group transition-transform active:scale-95">
            <Heart className="w-6 h-6 animate-heartbeat" style={{ color: "var(--primary)", fill: "var(--primary-soft)" }} />
            <span className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--text-main)" }}>
              Our memories
            </span>
          </Link>

          {/* Desktop Navigation */}
          {userId && (
            <div className="hidden md:flex items-center gap-2">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${pathname === href ? "shadow-md" : "hover:bg-rose-50/10"
                    }`}
                  style={{
                    backgroundColor: pathname === href ? "var(--primary-blush)" : "",
                    color: pathname === href ? "var(--primary)" : "var(--text-light)"
                  }}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop-only Switcher */}
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>

            {userId ? (
              <>
                <button onClick={() => { setIsSearchOpen(!isSearchOpen); setIsMenuOpen(false); }}
                  className={`p-2.5 rounded-2xl transition-all hover:glass ${isSearchOpen ? 'shadow-inner' : ''}`}
                  style={{
                    color: "var(--text-light)",
                    backgroundColor: isSearchOpen ? 'var(--primary-blush)' : 'transparent'
                  }}>
                  <Search className="w-5 h-5" />
                </button>
                <div className="hidden md:block relative" ref={profileRef}>
                  <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsSearchOpen(false); setIsMenuOpen(false); }}
                    className={`flex items-center gap-2 p-2 rounded-2xl transition-all border ${isProfileOpen ? 'shadow-inner' : 'hover:glass'}`}
                    style={{
                      backgroundColor: isProfileOpen ? 'var(--primary-blush)' : 'transparent',
                      borderColor: isProfileOpen ? 'var(--border-glass-strong)' : 'transparent',
                      color: 'var(--text-light)'
                    }}>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md overflow-hidden">
                      {currentUser?.profileImage ? (
                        <img src={currentUser.profileImage} alt="Me" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 opacity-40 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Desktop Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                        className="absolute top-[calc(100%+8px)] right-0 w-64 glass-strong rounded-[32px] border shadow-2xl overflow-hidden p-2 z-[130]"
                        style={{ background: 'var(--bg-glass-strong)', borderColor: 'var(--border-glass-strong)' }}>
                        <div className="p-5 border-b mb-1" style={{ borderColor: 'var(--border-glass)' }}>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1.5">My Sanctuary Identity</p>
                          {isEditingName ? (
                            <div className="space-y-1.5">
                              <input 
                                autoFocus
                                value={tempName}
                                onChange={(e) => { setTempName(e.target.value); setNameError(""); }}
                                onBlur={() => { if (tempName.trim() === (currentUser?.username || email?.split('@')[0])) setIsEditingName(false); }}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    try {
                                      await updateUserName({ userId: userId!, username: tempName });
                                      setIsEditingName(false);
                                    } catch (err: any) {
                                      const msg = err.message || "";
                                      if (msg.includes("this user name exist")) {
                                        setNameError("this user name exist");
                                      } else {
                                        const cleanMatch = msg.match(/Uncaught Error: (.*?)(?:\nat|$)/);
                                        setNameError(cleanMatch ? cleanMatch[1].trim() : msg);
                                      }
                                    }
                                  } else if (e.key === 'Escape') {
                                    setIsEditingName(false);
                                  }
                                }}
                                className="w-full bg-white/20 border border-white/30 rounded-lg px-2.5 py-1.5 font-bold text-sm outline-none focus:border-rose-400"
                                style={{ color: 'var(--text-main)' }}
                              />
                              {nameError && <p className="text-[8px] text-rose-500 font-bold uppercase tracking-tight">{nameError}</p>}
                              <p className="text-[8px] opacity-40 uppercase tracking-widest leading-none">Press Enter to save</p>
                            </div>
                          ) : (
                            <div className="group/name cursor-pointer bg-white/0 hover:bg-white/5 px-2 py-0.5 rounded-lg transition-all" onClick={() => { setTempName(currentUser?.username || email?.split('@')[0] || ""); setIsEditingName(true); }}>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <h4 className="font-bold text-sm break-all" style={{ color: 'var(--text-main)' }}>
                                  {currentUser?.username || email?.split('@')[0]}
                                </h4>
                                <Pencil className="w-2.5 h-2.5 opacity-20 group-hover/name:opacity-60 transition-opacity" />
                              </div>
                              <p className="text-[10px] font-medium opacity-40 truncate" style={{ color: 'var(--text-muted)' }}>{email}</p>
                            </div>
                          )}
                        </div>
                        <button onClick={logout}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all hover:bg-red-50/10 group/item"
                          style={{ color: 'var(--text-main)' }}>
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover/item:rotate-12 transition-transform">
                            <LogOut className="w-5 h-5 text-red-500" />
                          </div>
                          <span className="font-bold text-sm">Logout Forever</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:block">
                <button onClick={openLogin}
                  className="btn-primary py-2.5 px-6 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => { setIsMenuOpen(!isMenuOpen); setIsSearchOpen(false); }}
              className={`md:hidden p-2.5 rounded-2xl transition-all hover:glass ${isMenuOpen ? 'shadow-inner' : ''}`}
              style={{
                backgroundColor: isMenuOpen ? 'var(--primary-blush)' : 'transparent',
                color: isMenuOpen ? 'var(--primary)' : 'var(--text-light)'
              }}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Global Search Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              className="border-t overflow-hidden px-4 py-6 shadow-2xl relative z-[110] glass-strong"
              style={{ borderColor: "var(--border-glass-strong)" }}>
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" style={{ color: "var(--primary)" }} />
                  <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="Search memories..."
                    className="w-full bg-rose-50/10 h-12 rounded-2xl pl-12 pr-4 text-sm font-medium outline-none border transition-all shadow-inner"
                    style={{ color: 'var(--text-main)', borderColor: 'var(--border-glass-strong)' }} />
                </div>
                <button type="submit" className="btn-primary px-8 rounded-2xl font-bold text-xs uppercase tracking-widest">Search</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="md:hidden absolute top-16 left-0 right-0 border-b shadow-2xl z-[115] overflow-hidden glass-strong"
              style={{ borderColor: 'var(--border-glass-strong)' }}
            >
              <div className="p-6 pb-12 space-y-8">
                {/* Auth Status & Account */}
                <div className="rounded-3xl p-5 border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--primary-blush)', borderColor: 'var(--border-glass-strong)', opacity: 0.9 }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-md overflow-hidden" style={{ color: 'var(--primary)' }}>
                      {currentUser?.profileImage ? (
                        <img src={currentUser.profileImage} alt="Me" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5" style={{ color: 'var(--primary-deep)' }}>
                        {userId ? 'My Account' : 'Sanctuary'}
                      </p>
                      <div className="flex items-center gap-1.5 group/mname" onClick={() => { setTempName(currentUser?.username || email?.split('@')[0] || ""); setIsEditingName(true); }}>
                        <h4 className="font-bold text-sm truncate" style={{ color: 'var(--primary-deep)' }}>
                          {currentUser?.username || email?.split('@')[0]}
                        </h4>
                        {userId && <Pencil className="w-2.5 h-2.5 opacity-20 group-hover/mname:opacity-60 transition-opacity" style={{ color: 'var(--primary-deep)' }} />}
                      </div>
                      {userId && isEditingName && (
                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight mt-1">Visit Desktop to edit name</p>
                      )}
                      {userId && !isEditingName && (
                        <p className="text-[10px] opacity-40 truncate" style={{ color: 'var(--primary-deep)' }}>
                          {email}
                        </p>
                      )}
                    </div>
                  </div>
                  {!userId ? (
                    <button onClick={openLogin} className="btn-primary py-2 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      Sign In
                    </button>
                  ) : (
                    <button onClick={logout} className="p-2 rounded-xl hover:bg-black/10 transition-all" style={{ color: 'var(--primary)' }}>
                      <LogOut className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ml-2" style={{ color: 'var(--text-main)' }}>Quick Navigation</p>
                  <div className="flex flex-col gap-2">
                    {NAV.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${pathname === href ? 'shadow-inner' : 'border-transparent hover:bg-black/5'}`}
                        style={{
                          backgroundColor: pathname === href ? 'var(--primary-blush)' : 'transparent',
                          borderColor: pathname === href ? 'var(--border-glass-strong)' : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${pathname === href ? 'bg-white/40' : 'bg-black/5'}`}
                            style={{ color: pathname === href ? 'var(--primary)' : 'var(--text-light)' }}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-md" style={{ color: pathname === href ? 'var(--primary-deep)' : 'var(--text-main)' }}>{label}</span>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${pathname === href ? 'translate-x-1 opacity-100' : 'opacity-20'}`} style={{ color: 'var(--primary)' }} />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Atmosphere / Theme Switcher */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-2">
                    <Palette className="w-4 h-4 opacity-40" style={{ color: 'var(--text-main)' }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-main)' }}>Choose Mood</p>
                  </div>
                  <div className="rounded-[32px] p-4 border shadow-inner" style={{ backgroundColor: 'var(--primary-blush)', borderColor: 'var(--border-glass-strong)', opacity: 0.8 }}>
                    <ThemeSwitcher isList={true} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-16" />
    </>
  );
}
