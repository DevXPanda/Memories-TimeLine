"use client";
import React from "react";
import { Heart, Instagram, Twitter, Mail } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  minimal?: boolean;
}

export default function Footer({ minimal = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${minimal ? 'py-8 mt-12' : 'py-12 mt-20'} border-t px-4`} style={{ borderColor: "var(--border-glass-strong)" }}>
      <div className="max-w-6xl mx-auto">
        {!minimal && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <Heart className="w-5 h-5 animate-heartbeat" style={{ color: "var(--primary)", fill: "var(--primary-soft)" }} />
                <span className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                  Our Memories
                </span>
              </Link>
              <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                A sanctuary for your most precious moments. Built with love to help you cherish every chapter of your journey together.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--text-main)" }}>Navigaion</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link href="/" className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>Home</Link></li>
                <li><Link href="/timeline" className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>Timeline</Link></li>
                <li><Link href="/memories/new" className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-muted)" }}>Add Memory</Link></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--text-main)" }}>Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="p-2.5 rounded-full glass hover:scale-110 transition-all" style={{ border: "1px solid var(--border-glass)" }}>
                  <Instagram className="w-4 h-4" style={{ color: "var(--primary)" }} />
                </a>
                <a href="#" className="p-2.5 rounded-full glass hover:scale-110 transition-all" style={{ border: "1px solid var(--border-glass)" }}>
                  <Twitter className="w-4 h-4" style={{ color: "var(--primary)" }} />
                </a>
                <a href="mailto:hello@ourmemories.love" className="p-2.5 rounded-full glass hover:scale-110 transition-all" style={{ border: "1px solid var(--border-glass)" }}>
                  <Mail className="w-4 h-4" style={{ color: "var(--primary)" }} />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className={`${!minimal ? 'pt-8 border-t' : ''} flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest`} 
          style={{ borderColor: "var(--border-glass)", color: "var(--text-light)" }}>
          <div className="flex items-center gap-2">
            {minimal && <Heart className="w-3.5 h-3.5 fill-current" style={{ color: "var(--primary)" }} />}
            <p>© {currentYear} Our Memories. All Rights Reserved.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:opacity-70 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-70 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
