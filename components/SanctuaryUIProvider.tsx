"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "danger" | "info";
}

interface SanctuaryUIContextType {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => void;
}

const SanctuaryUIContext = createContext<SanctuaryUIContextType | undefined>(undefined);

export function SanctuaryUIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);

  const toast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const confirm = (options: ConfirmOptions) => {
    setConfirmOptions(options);
  };

  const handleConfirm = () => {
    if (confirmOptions) {
      confirmOptions.onConfirm();
      setConfirmOptions(null);
    }
  };

  const handleCancel = () => {
    if (confirmOptions) {
      if (confirmOptions.onCancel) confirmOptions.onCancel();
      setConfirmOptions(null);
    }
  };

  return (
    <SanctuaryUIContext.Provider value={{ toast, confirm }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto min-w-[300px] rounded-2xl p-4 glass-strong flex items-center gap-4"
              style={{ borderColor: "var(--border-glass-strong)" }}
            >
              <div className="shrink-0">
                {t.type === "success" && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                {t.type === "error" && <XCircle className="w-6 h-6 text-rose-500" />}
                {t.type === "info" && <Info className="w-6 h-6 text-indigo-500" />}
                {t.type === "warning" && <AlertTriangle className="w-6 h-6 text-amber-500" />}
              </div>
              <p className="text-sm font-bold flex-1" style={{ color: "var(--primary-deep)" }}>{t.message}</p>
              <button onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="opacity-20 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmOptions && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
             {/* Semi-transparent overlay without blur */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-white/5" 
               onClick={handleCancel}
             />
             
             <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative glass-strong w-full max-w-md rounded-[40px] overflow-hidden p-8"
             >
                <div className="flex flex-col items-center text-center gap-4 mb-8">
                   <div className={`w-16 h-16 rounded-3xl flex items-center justify-center glass shadow-sm mb-2 border ${confirmOptions.type === 'danger' ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
                      {confirmOptions.type === 'danger' ? (
                        <AlertTriangle className="w-8 h-8 text-rose-500" />
                      ) : (
                        <Info className="w-8 h-8 text-indigo-500" />
                      )}
                   </div>
                   <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--primary-deep)" }}>
                      {confirmOptions.title}
                   </h2>
                   <p className="text-sm font-medium opacity-60 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {confirmOptions.message}
                   </p>
                </div>

                <div className="flex gap-4">
                   <button 
                     onClick={handleCancel}
                     className="flex-1 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest glass border shadow-sm transition-all active:scale-95 hover:opacity-80"
                     style={{ color: "var(--text-main)" }}
                   >
                     {confirmOptions.cancelText || "Cancel"}
                   </button>
                   <button 
                     onClick={handleConfirm}
                     className={`flex-1 py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest text-white shadow-lg items-center justify-center hover:scale-105 active:scale-95 transition-all ${confirmOptions.type === 'danger' ? 'bg-rose-600' : 'bg-[#00a878]'}`}
                   >
                     {confirmOptions.confirmText || "Confirm"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SanctuaryUIContext.Provider>
  );
}

export function useSanctuaryUI() {
  const context = useContext(SanctuaryUIContext);
  if (context === undefined) {
    throw new Error("useSanctuaryUI must be used within a SanctuaryUIProvider");
  }
  return context;
}
