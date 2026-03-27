"use client";
import React from "react";
import { useTheme, Theme } from "./ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check } from "lucide-react";

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: "romantic",  label: "Romantic",  color: "#f43f5e" },
  { id: "peaceful",  label: "Peaceful",  color: "#6366f1" },
  { id: "abundance", label: "Abundance", color: "#f59e0b" },
  { id: "forest",    label: "Forest",    color: "#10b981" },
  { id: "midnight",  label: "Midnight",  color: "#1e1b4b" },
];

interface ThemeSwitcherProps {
  isList?: boolean;
}

export default function ThemeSwitcher({ isList = false }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  if (isList) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border ${
              theme === t.id ? "bg-rose-50 shadow-inner" : "hover:bg-rose-50/30 border-transparent"
            }`}
            style={{ 
               backgroundColor: theme === t.id ? "var(--primary-blush)" : "",
               borderColor: theme === t.id ? "var(--border-glass)" : "transparent"
            }}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center`}
              style={{ backgroundColor: t.color }}
            >
               {theme === t.id && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${theme === t.id ? "opacity-100" : "opacity-70"}`} style={{ color: "var(--primary-deep)" }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-2xl text-rose-300 hover:bg-rose-100 transition-all active:scale-90"
        style={{ color: "var(--text-light)" }}
        title="Change Mood Theme"
      >
        <Palette className="w-5 h-5" style={{ color: "var(--primary)" }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute right-0 mt-2 w-48 glass-strong rounded-[24px] p-2 z-[70] shadow-2xl border bg-white/95 backdrop-blur-xl"
              style={{ borderColor: "var(--border-glass-strong)" }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-3 opacity-40 ml-1" style={{ color: "var(--primary-deep)" }}>
                Choose Your Mood
              </p>
              <div className="grid grid-cols-1 gap-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                      theme === t.id ? "bg-rose-50/50" : "hover:bg-rose-50/30"
                    }`}
                    style={{ background: theme === t.id ? "var(--primary-blush)" : "" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-sm font-medium" style={{ color: "var(--text-main)" }}>
                        {t.label}
                      </span>
                    </div>
                    {theme === t.id && <Check className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
