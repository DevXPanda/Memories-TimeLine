"use client";
import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Is my data really private?",
    a: "Absolutely. We use secure email-based authentication and private PINs. Your memories are isolated at the database level and only accessible to you.",
  },
  {
    q: "How does the AI assistant work?",
    a: "Our AI, Dil, helps you capture the essence of your moments. When you upload a photo, it can generate poetic captions to add an extra touch of magic.",
  },
  {
    q: "Can I use multiple themes?",
    a: "Yes! Use the Palette icon in the navigation bar to switch between Romantic, Peaceful, Abundance, and other moods to match your current feeling.",
  },
  {
    q: "Can I access this on mobile?",
    a: "Yes, the entire application is fully responsive and designed to look beautiful on phones, tablets, and desktops.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
          Frequently Asked Questions
        </h2>
        <p className="text-sm font-medium opacity-60" style={{ color: "var(--text-muted)" }}>
          Everything you need to know about your sanctuary.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div key={i} className="glass-strong rounded-2xl overflow-hidden border border-rose-100" style={{ borderColor: "var(--border-glass)" }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-rose-50/30"
              style={{ background: openIndex === i ? "var(--primary-blush)" : "" }}
            >
              <span className="font-semibold text-sm sm:text-base flex items-center gap-3" style={{ color: "var(--text-main)" }}>
                <HelpCircle className="w-4 h-4 opacity-50" />
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
                style={{ color: "var(--primary)" }}
              />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-5 pt-0 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    <div className="h-px w-full mb-4 opacity-10" style={{ background: "var(--text-muted)" }} />
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
