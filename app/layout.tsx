"use client";
import "./globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import LoveChatbot from "@/components/LoveChatbot";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SanctuaryUIProvider } from "@/components/SanctuaryUIProvider";

import CelebrationDecoration from "@/components/CelebrationDecoration";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Our Memories 💕</title>
        <meta name="description" content="A private, beautiful space for our shared memories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fff1f2" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💕</text></svg>"
        />
      </head>
      <body>
        <ConvexProvider client={convex}>
          <ThemeProvider>
            <AuthProvider>
              <SanctuaryUIProvider>
                {children}
                <CelebrationDecoration />
                <LoveChatbot />
              </SanctuaryUIProvider>
            </AuthProvider>
          </ThemeProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
