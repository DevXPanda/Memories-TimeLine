"use client";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-7xl mb-6 animate-float inline-block">💔</p>
        <h1 className="text-4xl mb-2" style={{ fontFamily:"'Playfair Display',serif", color:"#881337" }}>
          Page Not Found
        </h1>
        <p className="text-sm mb-8" style={{ color:"#a07080" }}>
          This page doesn&apos;t exist... but our memories do 💕
        </p>
        <Link href="/" className="btn-primary">
          <Heart className="w-4 h-4" />Go Home
        </Link>
      </div>
    </div>
  );
}
