"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage, sendMessage, subscribeToMessages } from "@/lib/chat-service";
import { updateLastSeen } from "@/lib/chat-unread-service";
import { Send, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ActivityChatProps {
  activityId: string;
  activityName?: string;
  participantIds?: string[];
  isJoined: boolean;
  unreadCount?: number;
}

export function ActivityChat({ activityId, activityName, participantIds, isJoined, unreadCount = 0 }: ActivityChatProps) {
  const currentUser = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activityId) return;
    const unsubscribe = subscribeToMessages(activityId, (msgs) => {
      setMessages(msgs);
    });
    return unsubscribe;
  }, [activityId]);

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      // Mark messages as seen
      if (currentUser?.id) {
        updateLastSeen(currentUser.id, activityId);
      }
    }
  }, [messages, isExpanded, currentUser?.id, activityId]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    const text = newMessage.trim();
    setNewMessage("");
    setIsSending(true);
    try {
      await sendMessage(activityId, {
        senderId: currentUser?.id || "anonymous",
        senderName: currentUser?.name || "User",
        senderAvatar: currentUser?.avatar || "",
        text,
        type: "text",
      }, participantIds && activityName ? { participantIds, activityName } : undefined);
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(text);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Collapsed — toggle button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-3 w-full p-4 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] hover:bg-[#EEEEEE] dark:hover:bg-[#262626] transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-[#000000] dark:bg-[#FFFFFF] flex items-center justify-center shrink-0">
          <MessageCircle className="h-5 w-5 text-[#FFFFFF] dark:text-[#000000]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Group Chat</p>
          <p className="text-xs text-[#6B6B6B]">
            {unreadCount > 0
              ? `${unreadCount} new message${unreadCount > 1 ? "s" : ""}`
              : messages.length > 0 ? `${messages.length} messages` : "No messages yet"}
          </p>
        </div>
        {unreadCount > 0 ? (
          <span className="h-3 w-3 rounded-full bg-[#06C167] animate-pulse shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#6B6B6B]" />
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-[#E2E2E2] dark:border-[#333333] bg-[#FFFFFF] dark:bg-[#000000]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E2E2] dark:border-[#333333] bg-[#F6F6F6] dark:bg-[#1A1A1A]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#000000] dark:bg-[#FFFFFF] flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-[#FFFFFF] dark:text-[#000000]" />
          </div>
          <div>
            <span className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Group Chat</span>
            <span className="text-xs text-[#6B6B6B] ml-2">{messages.length} messages</span>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="h-8 w-8 rounded-full hover:bg-[#E2E2E2] dark:hover:bg-[#333333] flex items-center justify-center transition-colors"
        >
          <ChevronUp className="h-4 w-4 text-[#6B6B6B]" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-[#FFFFFF] dark:bg-[#000000]">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="h-12 w-12 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center mb-3">
              <MessageCircle className="h-6 w-6 text-[#6B6B6B]" />
            </div>
            <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">No messages yet</p>
            <p className="text-xs text-[#6B6B6B] mt-1">Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser?.id;
          const isSystem = msg.type === "system";

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center py-1">
                <span className="text-[11px] text-[#6B6B6B] bg-[#F6F6F6] dark:bg-[#1A1A1A] px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={cn("flex gap-2 max-w-[80%]", isOwn ? "ml-auto flex-row-reverse" : "")}
            >
              {/* Avatar */}
              {!isOwn && (
                <div className="h-7 w-7 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-[10px] font-bold text-[#000000] dark:text-[#FFFFFF] shrink-0 mt-auto">
                  {msg.senderName[0]}
                </div>
              )}

              {/* Bubble */}
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5",
                  isOwn
                    ? "bg-[#000000] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#000000] rounded-br-sm"
                    : "bg-[#F6F6F6] dark:bg-[#1A1A1A] text-[#000000] dark:text-[#FFFFFF] rounded-bl-sm"
                )}
              >
                {!isOwn && (
                  <p className="text-[10px] font-semibold text-[#6B6B6B] mb-0.5">
                    {msg.senderName}
                  </p>
                )}
                <p className="text-[0.8125rem] break-words leading-relaxed">{msg.text}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1",
                    isOwn ? "text-[#FFFFFF]/50 dark:text-[#000000]/50" : "text-[#6B6B6B]"
                  )}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isJoined ? (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[#E2E2E2] dark:border-[#333333] bg-[#F6F6F6] dark:bg-[#1A1A1A]">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 bg-[#FFFFFF] dark:bg-[#000000] rounded-full text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="h-10 w-10 rounded-full bg-[#000000] dark:bg-[#FFFFFF] flex items-center justify-center disabled:opacity-30 hover:bg-[#333333] dark:hover:bg-[#E2E2E2] transition-colors shrink-0"
          >
            <Send className="h-4 w-4 text-[#FFFFFF] dark:text-[#000000]" />
          </button>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-[#E2E2E2] dark:border-[#333333] text-center bg-[#F6F6F6] dark:bg-[#1A1A1A]">
          <p className="text-xs text-[#6B6B6B]">Join this activity to send messages</p>
        </div>
      )}
    </div>
  );
}
