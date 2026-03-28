"use client";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { SanctuaryUIProvider } from "@/components/SanctuaryUIProvider";
import Navbar from "@/components/Navbar";
import RealTimeNotifications from "@/components/RealTimeNotifications";
import CelebrationDecoration from "@/components/CelebrationDecoration";
import LoveChatbot from "@/components/LoveChatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} font-sans`}>
        <ConvexProvider client={convex}>
          <ThemeProvider>
            <AuthProvider>
              <SanctuaryUIProvider>
                <div className="relative min-h-screen">
                  <Navbar />
                  <RealTimeNotifications />
                  <CelebrationDecoration />
                  {children}
                  <LoveChatbot />
                </div>
              </SanctuaryUIProvider>
            </AuthProvider>
          </ThemeProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
