"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Heart, Home, Clock, Plus, LogOut, Search, User, Menu, X, 
  ChevronRight, Sparkles, Palette 
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import ThemeSwitcher from "./ThemeSwitcher";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  { href: "/",          label: "Home",     icon: Home  },
  { href: "/timeline",  label: "Timeline", icon: Clock },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userId, openLogin } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

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
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    pathname === href ? "shadow-md" : "hover:bg-rose-50/10"
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
                <div className="hidden md:block">
                  <button onClick={logout}
                    className="p-2.5 rounded-2xl transition-all hover:bg-rose-50/10 active:scale-90"
                    style={{ color: "var(--text-light)" }}
                    title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
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
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-md" style={{ color: 'var(--primary)' }}>
                           <User className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5" style={{ color: 'var(--primary-deep)' }}>
                              {userId ? 'Connected' : 'Sanctuary'}
                           </p>
                           <h4 className="font-bold text-sm truncate max-w-[150px]" style={{ color: 'var(--primary-deep)' }}>
                              {userId ? 'My Sanctuary' : 'Visit Profile'}
                           </h4>
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
