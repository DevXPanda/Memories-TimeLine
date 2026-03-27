"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import AuthPage from "./AuthPage";
import { Heart } from "lucide-react";

interface AuthCtx {
  userId: Id<"users"> | null;
  email: string | null;
  logout: () => void;
  login: (id: Id<"users">, userEmail: string) => void;
  isLoading: boolean;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const AuthContext = createContext<AuthCtx>({
  userId: null,
  email: null,
  logout: () => {},
  login: () => {},
  isLoading: true,
  isLoginOpen: false,
  openLogin: () => {},
  closeLogin: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem("memories_user_id");
    const savedEmail = localStorage.getItem("memories_user_email");
    if (savedId) setUserId(savedId as Id<"users">);
    if (savedEmail) setEmail(savedEmail);
    setIsLoading(false);
  }, []);

  const login = (id: Id<"users">, userEmail: string) => {
    setUserId(id);
    setEmail(userEmail);
    localStorage.setItem("memories_user_id", id);
    localStorage.setItem("memories_user_email", userEmail);
    setIsLoginOpen(false);
  };

  const logout = () => {
    setUserId(null);
    setEmail(null);
    localStorage.removeItem("memories_user_id");
    localStorage.removeItem("memories_user_email");
    window.location.href = "/"; // Redirect to home on logout
  };

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffbf7]">
      <Heart className="w-10 h-10 text-rose-300 animate-heartbeat" />
    </div>
  );

  return (
    <AuthContext.Provider value={{ userId, email, logout, login, isLoading, isLoginOpen, openLogin, closeLogin }}>
      {children}
      {isLoginOpen && <AuthPage onLogin={login} onClose={closeLogin} />}
    </AuthContext.Provider>
  );
}
