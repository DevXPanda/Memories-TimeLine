"use client";
import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/AuthProvider";
import { useSanctuaryUI } from "@/components/SanctuaryUIProvider";

export default function RealTimeNotifications() {
  const { userId } = useAuth();
  const unread = useQuery(api.notifications.listUnread, userId ? { userId } : "skip");
  const markAsRead = useMutation(api.notifications.markAsRead);
  const { toast } = useSanctuaryUI();
  
  // Keep track of which notifications we have already TOASTED in this session
  const processedIds = useRef(new Set<string>());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Clear, distinct sanctuary chime
    audioRef.current = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
    audioRef.current.load();
  }, []);

  useEffect(() => {
    if (unread && unread.length > 0) {
      let newlyProcessed: any[] = [];
      
      unread.forEach((n) => {
        if (!processedIds.current.has(n._id)) {
          // Play sound
          audioRef.current?.play().catch(() => {
             // Browser might block sound if there was no user interaction yet, ignore error
          });
          
          // Show toast
          toast(n.content, "success");
          
          processedIds.current.add(n._id);
          newlyProcessed.push(n._id);
        }
      });

      // Mark these as read after a short delay so they stay in DB long enough for other tabs
      if (newlyProcessed.length > 0) {
        setTimeout(() => {
           markAsRead({ notificationIds: newlyProcessed });
        }, 2000);
      }
    }
  }, [unread, toast, markAsRead]);

  return null; // This is a background listener
}
