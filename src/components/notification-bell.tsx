"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  AppNotification,
  subscribeToNotifications,
  markAsRead,
  markAllAsRead,
} from "@/lib/notification-service";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NotificationBell() {
  const currentUser = useCurrentUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    const unsubscribe = subscribeToNotifications(currentUser.id, (notifs) => {
      setNotifications(notifs);
    });
    return unsubscribe;
  }, [currentUser?.id]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    if (currentUser?.id) {
      markAllAsRead(currentUser.id, notifications);
    }
  };

  const handleClickNotification = (notif: AppNotification) => {
    if (currentUser?.id && !notif.read) {
      markAsRead(currentUser.id, notif.id);
    }
    setIsOpen(false);
  };

  const getNotifIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "join": return "👋";
      case "leave": return "🚶";
      case "chat": return "💬";
      case "update": return "✏️";
      case "delete": return "🗑️";
      case "removed": return "⚠️";
      default: return "🔔";
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "";
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => {
          const opening = !isOpen;
          setIsOpen(opening);
          // Auto mark all as read when opening
          if (opening && currentUser?.id && unreadCount > 0) {
            markAllAsRead(currentUser.id, notifications);
          }
        }}
        className="relative h-9 w-9 rounded-full flex items-center justify-center hover:bg-[#FFFFFF]/10 transition-colors"
      >
        <Bell className="h-5 w-5 text-[#FFFFFF]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-[#E11900] text-[#FFFFFF] text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E2E2] dark:border-[#333333]">
            <h3 className="text-sm font-bold text-[#000000] dark:text-[#FFFFFF]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-[#6B6B6B] hover:text-[#000000] dark:hover:text-[#FFFFFF] transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-8 w-8 text-[#E2E2E2] dark:text-[#333333] mb-2" />
                <p className="text-sm text-[#6B6B6B]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={`/activity/${notif.activityId}`}
                  onClick={() => handleClickNotification(notif)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors border-b border-[#F6F6F6] dark:border-[#262626] last:border-0",
                    !notif.read && "bg-[#F6F6F6]/50 dark:bg-[#262626]/50"
                  )}
                >
                  <span className="text-lg shrink-0 mt-0.5">{getNotifIcon(notif.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[13px] leading-snug",
                      notif.read ? "text-[#6B6B6B]" : "text-[#000000] dark:text-[#FFFFFF] font-medium"
                    )}>
                      {notif.message}
                    </p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">{formatTime(notif.timestamp)}</p>
                  </div>
                  {!notif.read && (
                    <div className="h-2 w-2 rounded-full bg-[#06C167] shrink-0 mt-2" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
